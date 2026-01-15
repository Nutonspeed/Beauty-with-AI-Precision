/**
 * PDF Report Generator
 * Export progress tracking data to PDF format
 */

import jsPDF from 'jspdf';
import { ProgressDataPoint, ProgressComparison, ProgressStats } from './progress-tracker';
import { EnhancedMetricsResult } from '../ai/enhanced-skin-metrics';

export interface PDFReportOptions {
  title?: string;
  clientName?: string;
  clientId?: string;
  centerName?: string;
  includeCharts?: boolean;
  includePhotos?: boolean;
  language?: 'th' | 'en';
}

/**
 * PDF Report Generator for Progress Tracking
 */
export class PDFReportGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  /**
   * Generate complete progress report
   */
  async generateReport(
    dataPoints: ProgressDataPoint[],
    comparison: ProgressComparison | null,
    stats: ProgressStats | null,
    t: (key: string, values?: any) => string,
    options: PDFReportOptions = {}
  ): Promise<Blob> {
    const {
      title = t('title'),
      clientName,
      clientId,
      centerName = 'AI Beauty Center',
    } = options;

    // Header
    this.addHeader(centerName, title);

    // Client Info
    if (clientName || clientId) {
      this.addClientInfo(clientName, clientId, t);
    }

    // Report Date
    this.addText(t('reportDate', { date: new Date().toLocaleDateString(t('locale') === 'th' ? 'th-TH' : 'en-US') }), 14, false);
    this.addSpace(10);

    // Statistics Summary
    if (stats) {
      this.addSection(t('summaryTitle'));
      this.addStatistics(stats, t);
      this.addSpace(10);
    }

    // Overall Comparison
    if (comparison) {
      this.addSection(t('overallProgress'));
      this.addComparison(comparison, t);
      this.addSpace(10);
    }

    // Detailed Metrics
    if (dataPoints.length > 0) {
      this.addSection(t('latestAnalysis'));
      const latest = dataPoints[dataPoints.length - 1];
      this.addMetricsTable(latest.metrics, t);
      this.addSpace(10);
    }

    // Timeline
    if (dataPoints.length >= 2) {
      this.addSection(t('timelineTitle'));
      this.addTimeline(dataPoints, t);
    }

    // Footer on all pages
    this.addFooter(t);

    return this.pdf.output('blob');
  }

  /**
   * Add header to PDF
   */
  private addHeader(centerName: string, title: string): void {
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(centerName, this.pageWidth / 2, this.currentY, {
      align: 'center',
    });

    this.currentY += 10;
    this.pdf.setFontSize(18);
    this.pdf.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 5;
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY
    );

    this.currentY += 10;
  }

  /**
   * Add client information
   */
  private addClientInfo(name: string | undefined, id: string | undefined, t: (key: string, values?: any) => string): void {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');

    if (name) {
      this.addText(t('patient', { name }), 12, false);
    }
    if (id) {
      this.addText(`ID: ${id}`, 12, false);
    }

    this.addSpace(5);
  }

  /**
   * Add section title
   */
  private addSection(title: string): void {
    this.checkPageBreak(15);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 8;
  }

  /**
   * Add statistics section
   */
  private addStatistics(stats: ProgressStats, t: (key: string, values?: any) => string): void {
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');

    this.addText(`${t('totalCheckups')}: ${stats.totalDataPoints} times`, 11, false);
    this.addText(`${t('duration', { duration: stats.timeSpanDays })}`, 11, false);
    this.addText(
      `${t('avgImprovement')}: ${stats.averageImprovement > 0 ? '+' : ''}${stats.averageImprovement.toFixed(2)} points`,
      11,
      false
    );
    this.addText(`${t('bestImprovement')}: ${stats.bestMetric}`, 11, false);
    this.addText(`${t('needsWork')}: ${stats.worstMetric}`, 11, false);
    this.addText(`${t('consistency')}: ${stats.consistencyScore.toFixed(1)}%`, 11, false);
    this.addText(
      `${t('projected30Days')}: ${stats.projectedImprovement > 0 ? '+' : ''}${stats.projectedImprovement.toFixed(2)} points`,
      11,
      false
    );
  }

  /**
   * Add comparison section
   */
  private addComparison(comparison: ProgressComparison, t: (key: string, values?: any) => string): void {
    this.pdf.setFontSize(11);

    this.addText(
      `${t('duration', { duration: comparison.durationDays })}`,
      11,
      false
    );
    this.addText(`${t('trend')}: ${t(`trendValues.${comparison.trend}`)}`, 11, false);
    this.addText(
      `${t('changeHeader')}: ${comparison.percentageChange > 0 ? '+' : ''}${comparison.percentageChange.toFixed(2)}%`,
      11,
      false
    );

    this.addSpace(5);

    // Improvements table
    this.addImprovementsTable(comparison.improvements, t);
  }

  /**
   * Add improvements table
   */
  private addImprovementsTable(
    improvements: Record<string, number>,
    t: (key: string, values?: any) => string
  ): void {
    const _startY = this.currentY;
    const rowHeight = 7;
    const col1X = this.margin;
    const col2X = this.margin + 60;

    // Table header
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(t('metricsHeader'), col1X, this.currentY);
    this.pdf.text(t('changeHeader'), col2X, this.currentY);
    this.currentY += rowHeight;

    // Table rows
    this.pdf.setFont('helvetica', 'normal');
    Object.entries(improvements).forEach(([key, value]) => {
      this.checkPageBreak(rowHeight);
      const label = t(`metrics.${key}`) || key;
      const changeText = `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
      
      this.pdf.text(label, col1X, this.currentY);
      this.pdf.setTextColor(value > 0 ? 0 : 255, value > 0 ? 128 : 0, 0);
      this.pdf.text(changeText, col2X, this.currentY);
      this.pdf.setTextColor(0, 0, 0);
      
      this.currentY += rowHeight;
    });
  }

  /**
   * Add metrics table
   */
  private addMetricsTable(
    metrics: EnhancedMetricsResult,
    t: (key: string, values?: any) => string
  ): void {
    const rowHeight = 7;
    const col1X = this.margin;
    const col2X = this.margin + 60;
    const col3X = this.margin + 100;

    // Table header
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(t('metricsHeader'), col1X, this.currentY);
    this.pdf.text(t('scoreHeader'), col2X, this.currentY);
    this.pdf.text(t('gradeHeader'), col3X, this.currentY);
    this.currentY += rowHeight;

    // Table rows
    this.pdf.setFont('helvetica', 'normal');
    const metricsData = [
      { key: 'spots', score: metrics.spots.score },
      { key: 'pores', score: metrics.pores.score },
      { key: 'wrinkles', score: metrics.wrinkles.score },
      { key: 'texture', score: metrics.texture.score },
      { key: 'redness', score: metrics.redness.score },
      { key: 'hydration', score: metrics.hydration.score },
      { key: 'skinTone', score: metrics.skinTone.score },
      { key: 'elasticity', score: metrics.elasticity.score },
    ];

    for (const { key, score } of metricsData) {
      this.checkPageBreak(rowHeight);
      const label = t(`metrics.${key}`);
      const grade = this.getGrade(score);

      this.pdf.text(label, col1X, this.currentY);
      this.pdf.text(score.toFixed(1), col2X, this.currentY);
      this.pdf.text(grade, col3X, this.currentY);
      this.currentY += rowHeight;
    }

    // Overall health
    this.checkPageBreak(rowHeight);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(
      t('metrics.overallHealth' as any),
      col1X,
      this.currentY
    );
    this.pdf.text(
      metrics.overallHealth.score.toFixed(1),
      col2X,
      this.currentY
    );
    this.pdf.text(metrics.overallHealth.grade, col3X, this.currentY);
    this.currentY += rowHeight;
  }

  /**
   * Add timeline
   */
  private addTimeline(dataPoints: ProgressDataPoint[], t: (key: string, values?: any) => string): void {
    const rowHeight = 7;
    const col1X = this.margin;
    const col2X = this.margin + 40;
    const col3X = this.margin + 90;

    // Table header
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(t('timelineLabels.date'), col1X, this.currentY);
    this.pdf.text(t('timelineLabels.score'), col2X, this.currentY);
    this.pdf.text(t('timelineLabels.notes'), col3X, this.currentY);
    this.currentY += rowHeight;

    // Table rows
    this.pdf.setFont('helvetica', 'normal');
    for (const dp of dataPoints) {
      this.checkPageBreak(rowHeight);
      
      const dateStr = dp.date.toLocaleDateString(t('locale') === 'th' ? 'th-TH' : 'en-US');
      const scoreStr = dp.metrics.overallHealth.score.toFixed(1);
      const notesStr = dp.notes?.substring(0, 30) || '-';

      this.pdf.text(dateStr, col1X, this.currentY);
      this.pdf.text(scoreStr, col2X, this.currentY);
      this.pdf.text(notesStr, col3X, this.currentY);
      this.currentY += rowHeight;
    }
  }

  /**
   * Add text with automatic line break
   */
  private addText(text: string, fontSize: number, bold: boolean = false): void {
    this.checkPageBreak(fontSize / 2);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += fontSize / 2 + 2;
  }

  /**
   * Add vertical space
   */
  private addSpace(height: number): void {
    this.currentY += height;
  }

  /**
   * Check if need page break
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin - 15) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Add footer to all pages
   */
  private addFooter(t: (key: string, values?: any) => string): void {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
      this.pdf.text(
        t('footer'),
        this.pageWidth / 2,
        this.pageHeight - 5,
        { align: 'center' }
      );
    }
  }

  /**
   * Get grade from score
   */
  private getGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Download PDF
   */
  downloadPDF(filename: string = 'progress-report.pdf'): void {
    this.pdf.save(filename);
  }
}
