/**
 * Enhanced PDF Exporter
 * Professional PDF reports with before/after comparison, progress charts, and better layout
 * Week 2 Day 3-4: Enhanced PDF Reports Implementation
 */

import jsPDF from 'jspdf';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

export interface EnhancedPDFOptions {
  locale?: 'th' | 'en';
  customerInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
    customerId?: string;
  };
  centerInfo: {
    name: string;
    nameTh?: string;
    logo?: string; // Base64 or URL
    brandColor?: string; // Hex color
    address?: string;
    addressTh?: string;
    phone?: string;
    email?: string;
    website?: string;
    license?: string;
  };
  // Before/After Comparison
  previousAnalysis?: HybridSkinAnalysis;
  comparisonMode?: boolean;
  highlightImprovements?: boolean;
  // Progress Tracking
  historicalAnalyses?: HistoricalAnalysisData[];
  includeProgressCharts?: boolean;
  // Program Information
  programPackages?: ProgramPackage[];
  includePricing?: boolean;
  includeTimeline?: boolean;
  showDiscounts?: boolean;
  // Design Options
  theme?: 'professional' | 'modern' | 'minimal';
  colorScheme?: 'purple' | 'blue' | 'green' | 'custom';
}

export interface HistoricalAnalysisData {
  date: Date | string;
  overall: number;
  spots: number;
  pores: number;
  wrinkles: number;
  texture: number;
  redness: number;
}

export interface ProgramPackage {
  id: string;
  name: { en: string; th: string };
  programs: { 
    name: { en: string; th: string }; 
    sessions: number;
    weekInterval?: number;
  }[];
  duration: { weeks: number; months: number };
  price: number;
  sessions: number;
  improvement: number;
  effectiveness: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
  };
  discount?: number;
  originalPrice?: number;
  badge?: { en: string; th: string };
}

export class EnhancedPDFExporter {
  private pdf: jsPDF;
  private locale: 'th' | 'en';
  private t: any;
  private currentPage: number = 1;
  private totalPages: number = 0;
  private brandColor: string;
  private theme: 'professional' | 'modern' | 'minimal';
  
  // Layout constants
  private readonly marginLeft: number = 20;
  private readonly marginRight: number = 20;
  private readonly marginTop: number = 20;
  private readonly marginBottom: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private contentWidth: number;

  constructor(options: EnhancedPDFOptions) {
    this.locale = options.locale || 'en';
    this.brandColor = options.centerInfo.brandColor || '#8b5cf6';
    this.theme = options.theme || 'professional';

    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 139, g: 92, b: 246 }; // Default purple
  }

  private addHeader(centerInfo: EnhancedPDFOptions['centerInfo'], isFirstPage: boolean = false) {
    const rgb = this.hexToRgb(this.brandColor);

    if (isFirstPage) {
      // Large gradient header for first page
      this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      this.pdf.rect(0, 0, this.pageWidth, 70, 'F');
      
      // Lighter gradient overlay (simulate gradient)
      this.pdf.setFillColor(rgb.r + 20, rgb.g + 20, rgb.b + 20);
      this.pdf.rect(0, 0, this.pageWidth, 35, 'F');

      // Logo
      if (centerInfo.logo) {
        try {
          this.pdf.addImage(centerInfo.logo, 'PNG', this.pageWidth / 2 - 15, 10, 30, 30);
        } catch (error) {
          console.warn('Failed to add logo:', error);
        }
      }

      // Title
      this.pdf.setFontSize(24);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(this.t.title, this.pageWidth / 2, 52, { align: 'center' });

      // Subtitle
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(this.t.subtitle, this.pageWidth / 2, 62, { align: 'center' });

    } else {
      // Compact header for other pages
      this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      this.pdf.rect(0, 0, this.pageWidth, 25, 'F');

      if (centerInfo.logo) {
        try {
          this.pdf.addImage(centerInfo.logo, 'PNG', this.marginLeft, 5, 15, 15);
        } catch (error) {
          console.warn('Failed to add logo:', error);
        }
      }

      this.pdf.setFontSize(14);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      const centerName = this.locale === 'th' && centerInfo.nameTh 
        ? centerInfo.nameTh 
        : centerInfo.name;
      this.pdf.text(centerName, centerInfo.logo ? this.marginLeft + 18 : this.marginLeft, 15);
    }

    this.pdf.setTextColor(0, 0, 0);
  }

  private addFooter() {
    const y = this.pageHeight - this.marginBottom + 10;

    // Footer line
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.marginLeft, y - 5, this.pageWidth - this.marginRight, y - 5);

    // Page number
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(128, 128, 128);
    this.pdf.text(
      `${this.t.page} ${this.currentPage} ${this.t.of} ${this.totalPages}`,
      this.pageWidth / 2,
      y,
      { align: 'center' }
    );

    // Confidential notice
    this.pdf.text(this.t.confidential, this.marginLeft, y);

    // Date
    const dateStr = new Date().toLocaleDateString(
      this.locale === 'th' ? 'th-TH' : 'en-US'
    );
    this.pdf.text(dateStr, this.pageWidth - this.marginRight, y, { align: 'right' });

    this.pdf.setTextColor(0, 0, 0);
  }

  private addNewPage() {
    this.pdf.addPage();
    this.currentPage++;
  }

  private drawCard(
    x: number,
    y: number,
    width: number,
    height: number,
    title?: string,
    fillColor?: { r: number; g: number; b: number }
  ): number {
    // Card shadow (optional for professional theme)
    if (this.theme === 'professional') {
      this.pdf.setFillColor(240, 240, 240);
      this.pdf.roundedRect(x + 1, y + 1, width, height, 3, 3, 'F');
    }

    // Card background
    if (fillColor) {
      this.pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
    } else {
      this.pdf.setFillColor(255, 255, 255);
    }
    this.pdf.roundedRect(x, y, width, height, 3, 3, 'FD');

    // Card border
    this.pdf.setDrawColor(220, 220, 220);
    this.pdf.roundedRect(x, y, width, height, 3, 3, 'S');

    let currentY = y + 8;

    // Card title
    if (title) {
      const rgb = this.hexToRgb(this.brandColor);
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      this.pdf.text(title, x + 5, currentY);
      currentY += 10;

      // Title underline
      this.pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(x + 5, currentY - 3, x + 50, currentY - 3);
      this.pdf.setLineWidth(0.2);
    }

    this.pdf.setTextColor(0, 0, 0);
    return currentY;
  }

  private drawProgressBar(
    x: number,
    y: number,
    width: number,
    height: number,
    percentage: number,
    color?: { r: number; g: number; b: number }
  ) {
    // Background
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.roundedRect(x, y, width, height, 2, 2, 'F');

    // Fill
    const fillWidth = (percentage / 100) * width;
    if (color) {
      this.pdf.setFillColor(color.r, color.g, color.b);
    } else {
      const rgb = this.hexToRgb(this.brandColor);
      this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    }
    this.pdf.roundedRect(x, y, fillWidth, height, 2, 2, 'F');

    // Border
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.roundedRect(x, y, width, height, 2, 2, 'S');
  }

  private getScoreColor(score: number): { r: number; g: number; b: number } {
    if (score >= 80) return { r: 34, g: 197, b: 94 }; // Green - Excellent
    if (score >= 60) return { r: 59, g: 130, b: 246 }; // Blue - Good
    if (score >= 40) return { r: 234, g: 179, b: 8 }; // Yellow - Fair
    return { r: 239, g: 68, b: 68 }; // Red - Poor
  }

  private getSeverityColor(score: number): { r: number; g: number; b: number } {
    if (score >= 7) return { r: 239, g: 68, b: 68 }; // High
    if (score >= 4) return { r: 234, g: 179, b: 8 }; // Medium
    return { r: 34, g: 197, b: 94 }; // Low
  }

  private addCoverPage(
    analysis: HybridSkinAnalysis,
    customerInfo: EnhancedPDFOptions['customerInfo'],
    centerInfo: EnhancedPDFOptions['centerInfo']
  ) {
    this.addHeader(centerInfo, true);

    // Customer info card
    const cardY = 85;
    const cardHeight = 45;
    let contentY = this.drawCard(
      this.marginLeft,
      cardY,
      this.contentWidth,
      cardHeight,
      this.t.customerInfo
    );

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    if (customerInfo?.name) {
      this.pdf.text(`${this.t.name}: ${customerInfo.name}`, this.marginLeft + 5, contentY);
      contentY += 6;
    }

    const infoLine1: string[] = [];
    if (customerInfo?.age) infoLine1.push(`${this.t.age}: ${customerInfo.age} ${this.t.years}`);
    if (customerInfo?.gender) infoLine1.push(`${this.t.gender}: ${customerInfo.gender}`);
    if (infoLine1.length > 0) {
      this.pdf.text(infoLine1.join(' | '), this.marginLeft + 5, contentY);
      contentY += 6;
    }

    if (customerInfo?.skinType) {
      this.pdf.text(`${this.t.skinType}: ${customerInfo.skinType}`, this.marginLeft + 5, contentY);
      contentY += 6;
    }

    if (customerInfo?.customerId) {
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(120, 120, 120);
      this.pdf.text(
        `${this.t.customerId}: ${customerInfo.customerId}`,
        this.marginLeft + 5,
        contentY
      );
    }

    // Report date
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(120, 120, 120);
    const dateStr = new Date().toLocaleDateString(
      this.locale === 'th' ? 'th-TH' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
    this.pdf.text(
      `${this.t.reportDate}: ${dateStr}`,
      this.pageWidth - this.marginRight - 5,
      cardY + cardHeight - 5,
      { align: 'right' }
    );

    this.pdf.setTextColor(0, 0, 0);

    // Overall score - large display
    const scoreY = cardY + cardHeight + 20;
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.overallScore, this.pageWidth / 2, scoreY, { align: 'center' });

    // Large score circle
    const circleY = scoreY + 30;
    const scoreColor = this.getScoreColor(analysis.percentiles.overall);
    this.pdf.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b);
    this.pdf.circle(this.pageWidth / 2, circleY, 28, 'F');

    // Inner white circle
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.circle(this.pageWidth / 2, circleY, 24, 'F');

    // Score text
    this.pdf.setFontSize(42);
    this.pdf.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(
      analysis.percentiles.overall.toString(),
      this.pageWidth / 2,
      circleY + 6,
      { align: 'center' }
    );

    this.pdf.setFontSize(12);
    this.pdf.text('/100', this.pageWidth / 2, circleY + 16, { align: 'center' });

    // Score description
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(80, 80, 80);
    this.pdf.setFont('helvetica', 'normal');
    const scoreLabel = 
      analysis.percentiles.overall >= 80 ? this.t.excellent :
      analysis.percentiles.overall >= 60 ? this.t.good :
      analysis.percentiles.overall >= 40 ? this.t.fair : this.t.poor;
    this.pdf.text(scoreLabel, this.pageWidth / 2, circleY + 38, { align: 'center' });

    // Confidence bar
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      `${this.t.confidence}: ${Math.round(analysis.confidence * 100)}%`,
      this.pageWidth / 2,
      circleY + 48,
      { align: 'center' }
    );

    this.drawProgressBar(
      this.pageWidth / 2 - 40,
      circleY + 52,
      80,
      4,
      analysis.confidence * 100
    );

    this.pdf.setTextColor(0, 0, 0);
  }

  private addBeforeAfterComparisonPage(
    beforeAnalysis: HybridSkinAnalysis,
    afterAnalysis: HybridSkinAnalysis,
    centerInfo: EnhancedPDFOptions['centerInfo']
  ) {
    this.addNewPage();
    this.addHeader(centerInfo, false);

    let y = 35;

    // Section title
    const rgb = this.hexToRgb(this.brandColor);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    this.pdf.text(this.t.beforeAfterComparison, this.marginLeft, y);
    this.pdf.setTextColor(0, 0, 0);

    y += 5;

    // Time period
    const beforeDate = new Date(beforeAnalysis.createdAt || Date.now());
    const afterDate = new Date(afterAnalysis.createdAt || Date.now());
    const daysDiff = Math.round((afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    let timePeriodText = '';
    if (daysDiff < 30) {
      timePeriodText = `${daysDiff} ${this.t.days}`;
    } else if (daysDiff < 365) {
      const weeks = Math.round(daysDiff / 7);
      timePeriodText = `${weeks} ${this.t.weeks}`;
    } else {
      const months = Math.round(daysDiff / 30);
      timePeriodText = `${months} ${this.t.months}`;
    }
    this.pdf.text(`${this.t.timePeriod}: ${timePeriodText}`, this.marginLeft, y + 5);
    this.pdf.setTextColor(0, 0, 0);

    y += 15;

    // Side-by-side images
    const imageWidth = (this.contentWidth - 10) / 2;
    const imageHeight = imageWidth * 0.75;

    if (beforeAnalysis.imageUrl && afterAnalysis.imageUrl) {
      try {
        // Before image
        this.pdf.addImage(
          beforeAnalysis.imageUrl,
          'JPEG',
          this.marginLeft,
          y,
          imageWidth,
          imageHeight
        );

        // Before label
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(this.t.before, this.marginLeft + imageWidth / 2, y + imageHeight + 5, {
          align: 'center',
        });

        // After image
        this.pdf.addImage(
          afterAnalysis.imageUrl,
          'JPEG',
          this.marginLeft + imageWidth + 10,
          y,
          imageWidth,
          imageHeight
        );

        // After label
        this.pdf.text(
          this.t.after,
          this.marginLeft + imageWidth + 10 + imageWidth / 2,
          y + imageHeight + 5,
          { align: 'center' }
        );

        y += imageHeight + 15;
      } catch (error) {
        console.warn('Failed to add comparison images:', error);
      }
    }

    // Comparison metrics
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.comparison, this.marginLeft, y);

    y += 10;

    const concerns = [
      { key: 'spots' as const, before: beforeAnalysis.percentiles.spots, after: afterAnalysis.percentiles.spots },
      { key: 'pores' as const, before: beforeAnalysis.percentiles.pores, after: afterAnalysis.percentiles.pores },
      { key: 'wrinkles' as const, before: beforeAnalysis.percentiles.wrinkles, after: afterAnalysis.percentiles.wrinkles },
      { key: 'texture' as const, before: beforeAnalysis.percentiles.texture, after: afterAnalysis.percentiles.texture },
      { key: 'redness' as const, before: beforeAnalysis.percentiles.redness, after: afterAnalysis.percentiles.redness },
    ];

    concerns.forEach((concern) => {
      const change = concern.after - concern.before;
      const changePercent = concern.before > 0 ? (change / concern.before) * 100 : 0;
      const isImproved = change > 0;
      const changeColor = isImproved
        ? { r: 34, g: 197, b: 94 }
        : change < 0
        ? { r: 239, g: 68, b: 68 }
        : { r: 156, g: 163, b: 175 };

      // Concern name
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(this.t[concern.key], this.marginLeft, y);

      // Before score
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${concern.before}`, this.marginLeft + 50, y);

      // Arrow
      this.pdf.setTextColor(changeColor.r, changeColor.g, changeColor.b);
      this.pdf.text(isImproved ? '→' : change < 0 ? '→' : '→', this.marginLeft + 65, y);

      // After score
      this.pdf.text(`${concern.after}`, this.marginLeft + 75, y);

      // Change badge
      this.pdf.setFillColor(changeColor.r, changeColor.g, changeColor.b);
      const badgeWidth = 25;
      this.pdf.roundedRect(this.marginLeft + 90, y - 4, badgeWidth, 6, 2, 2, 'F');

      this.pdf.setFontSize(8);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      const changeText = isImproved
        ? `+${Math.abs(change)}`
        : change < 0
        ? `-${Math.abs(change)}`
        : '0';
      this.pdf.text(changeText, this.marginLeft + 90 + badgeWidth / 2, y, { align: 'center' });

      // Progress bar showing improvement
      const barX = this.marginLeft + 120;
      const barWidth = 50;
      this.drawProgressBar(barX, y - 3, barWidth, 5, Math.min(Math.abs(changePercent), 100), changeColor);

      this.pdf.setTextColor(0, 0, 0);
      y += 8;
    });

    // Overall improvement summary
    y += 5;
    const overallChange = afterAnalysis.percentiles.overall - beforeAnalysis.percentiles.overall;
    const overallImproved = overallChange > 0;

    const summaryCardHeight = 25;
    const summaryY = this.drawCard(
      this.marginLeft,
      y,
      this.contentWidth,
      summaryCardHeight,
      this.t.overallProgress
    );

    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(
      `${this.t.firstAnalysis}: ${beforeAnalysis.percentiles.overall}/100`,
      this.marginLeft + 5,
      summaryY + 2
    );
    this.pdf.text(
      `${this.t.currentAnalysis}: ${afterAnalysis.percentiles.overall}/100`,
      this.marginLeft + 5,
      summaryY + 9
    );

    // Large improvement indicator
    const improvementColor = overallImproved
      ? { r: 34, g: 197, b: 94 }
      : overallChange < 0
      ? { r: 239, g: 68, b: 68 }
      : { r: 156, g: 163, b: 175 };

    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(improvementColor.r, improvementColor.g, improvementColor.b);
    const improvementText = overallImproved
      ? `+${overallChange}`
      : overallChange < 0
      ? `-${Math.abs(overallChange)}`
      : '0';
    this.pdf.text(
      improvementText,
      this.pageWidth - this.marginRight - 30,
      summaryY + 7,
      { align: 'center' }
    );

    this.pdf.setFontSize(9);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      overallImproved ? this.t.improved : overallChange < 0 ? this.t.declined : this.t.noChange,
      this.pageWidth - this.marginRight - 30,
      summaryY + 14,
      { align: 'center' }
    );
  }

  private addProgressChartsPage(
    currentAnalysis: HybridSkinAnalysis,
    historicalData: HistoricalAnalysisData[],
    centerInfo: EnhancedPDFOptions['centerInfo']
  ) {
    this.addNewPage();
    this.addHeader(centerInfo, false);

    let y = 35;

    // Section title
    const rgb = this.hexToRgb(this.brandColor);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    this.pdf.text(this.t.progressOverTime, this.marginLeft, y);
    this.pdf.setTextColor(0, 0, 0);

    y += 15;

    // Overall progress chart
    const chartHeight = 60;
    const chartWidth = this.contentWidth;
    const chartY = this.drawCard(this.marginLeft, y, chartWidth, chartHeight + 15, this.t.overallProgress);

    // Draw line chart for overall score
    const dataPoints = historicalData.map((d) => d.overall);
    dataPoints.push(currentAnalysis.percentiles.overall);

    const maxScore = 100;
    const minScore = 0;
    const pointSpacing = (chartWidth - 20) / (dataPoints.length - 1);

    // Chart axes
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.marginLeft + 10, chartY, this.marginLeft + 10, chartY + chartHeight); // Y-axis
    this.pdf.line(this.marginLeft + 10, chartY + chartHeight, this.marginLeft + chartWidth - 5, chartY + chartHeight); // X-axis

    // Grid lines
    this.pdf.setDrawColor(240, 240, 240);
    for (let i = 0; i <= 4; i++) {
      const gridY = chartY + (chartHeight / 4) * i;
      this.pdf.line(this.marginLeft + 10, gridY, this.marginLeft + chartWidth - 5, gridY);
    }

    // Y-axis labels
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(120, 120, 120);
    for (let i = 0; i <= 4; i++) {
      const score = maxScore - (maxScore / 4) * i;
      const labelY = chartY + (chartHeight / 4) * i;
      this.pdf.text(score.toString(), this.marginLeft + 3, labelY, { align: 'right' });
    }

    // Plot line
    this.pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
    this.pdf.setLineWidth(1);

    dataPoints.forEach((score, index) => {
      const x = this.marginLeft + 10 + pointSpacing * index;
      const pointY = chartY + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;

      // Draw point
      this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      this.pdf.circle(x, pointY, 2, 'F');

      // Draw line to next point
      if (index < dataPoints.length - 1) {
        const nextScore = dataPoints[index + 1];
        const nextX = this.marginLeft + 10 + pointSpacing * (index + 1);
        const nextY = chartY + chartHeight - ((nextScore - minScore) / (maxScore - minScore)) * chartHeight;
        this.pdf.line(x, pointY, nextX, nextY);
      }

      // X-axis label (date or index)
      if (index < historicalData.length) {
        const date = new Date(historicalData[index].date);
        const dateStr = date.toLocaleDateString(this.locale === 'th' ? 'th-TH' : 'en-US', {
          month: 'short',
          day: 'numeric',
        });
        this.pdf.setFontSize(7);
        this.pdf.setTextColor(120, 120, 120);
        this.pdf.text(dateStr, x, chartY + chartHeight + 5, { align: 'center' });
      } else {
        // Current
        this.pdf.setFontSize(7);
        this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(this.locale === 'th' ? this.t('present') : 'Now', x, chartY + chartHeight + 5, {
          align: 'center',
        });
      }
    });

    this.pdf.setLineWidth(0.2);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');

    y += chartHeight + 30;

    // Individual concern progress bars
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.concernProgress, this.marginLeft, y);

    y += 10;

    const concerns = [
      'spots' as const,
      'pores' as const,
      'wrinkles' as const,
      'texture' as const,
      'redness' as const,
    ];

    concerns.forEach((concernKey) => {
      // Get historical average
      const historicalAvg = historicalData.length > 0
        ? historicalData.reduce((sum, d) => sum + d[concernKey], 0) / historicalData.length
        : 0;
      
      const currentScore = currentAnalysis.percentiles[concernKey];
      const improvement = currentScore - historicalAvg;

      // Concern name
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(this.t[concernKey], this.marginLeft, y);

      // Score
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${currentScore}/100`, this.marginLeft + 55, y);

      // Progress bar
      const barX = this.marginLeft + 85;
      const barWidth = 70;
      const scoreColor = this.getScoreColor(currentScore);
      this.drawProgressBar(barX, y - 3, barWidth, 5, currentScore, scoreColor);

      // Improvement indicator
      if (historicalData.length > 0) {
        const isImproved = improvement > 0;
        const improvementColor = isImproved
          ? { r: 34, g: 197, b: 94 }
          : improvement < 0
          ? { r: 239, g: 68, b: 68 }
          : { r: 156, g: 163, b: 175 };

        this.pdf.setFontSize(9);
        this.pdf.setTextColor(improvementColor.r, improvementColor.g, improvementColor.b);
        const improvementText = isImproved
          ? `+${improvement.toFixed(1)}`
          : improvement < 0
          ? `${improvement.toFixed(1)}`
          : '0';
        this.pdf.text(improvementText, this.pageWidth - this.marginRight - 5, y, {
          align: 'right',
        });
      }

      y += 9;
    });
  }

  private addAnalysisDetailsPage(
    analysis: HybridSkinAnalysis,
    centerInfo: EnhancedPDFOptions['centerInfo']
  ) {
    this.addNewPage();
    this.addHeader(centerInfo, false);

    let y = 35;

    // Section title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    const rgb = this.hexToRgb(this.brandColor);
    this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    this.pdf.text(this.t.skinConcerns, this.marginLeft, y);
    this.pdf.setTextColor(0, 0, 0);

    y += 12;

    // Concerns cards
    const concerns = [
      { 
        key: 'spots' as const, 
        value: analysis.overallScore.spots, 
        percentile: analysis.percentiles.spots 
      },
      { 
        key: 'pores' as const, 
        value: analysis.overallScore.pores, 
        percentile: analysis.percentiles.pores 
      },
      { 
        key: 'wrinkles' as const, 
        value: analysis.overallScore.wrinkles, 
        percentile: analysis.percentiles.wrinkles 
      },
      { 
        key: 'texture' as const, 
        value: analysis.overallScore.texture, 
        percentile: analysis.percentiles.texture 
      },
      { 
        key: 'redness' as const, 
        value: analysis.overallScore.redness, 
        percentile: analysis.percentiles.redness 
      },
    ];

    concerns.forEach((concern, _index) => {
      if (y + 22 > this.pageHeight - this.marginBottom - 15) {
        this.addNewPage();
        this.addHeader(centerInfo, false);
        y = 35;
      }

      const cardWidth = this.contentWidth;
      const cardHeight = 20;
      
      // Draw concern card
      const contentY = this.drawCard(this.marginLeft, y, cardWidth, cardHeight);

      // Concern name
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(this.t[concern.key], this.marginLeft + 5, contentY);

      // Severity badge
      const severityColor = this.getSeverityColor(concern.value);
      const severityLabel = 
        concern.value >= 7 ? this.t.high :
        concern.value >= 4 ? this.t.medium : this.t.low;

      this.pdf.setFillColor(severityColor.r, severityColor.g, severityColor.b);
      this.pdf.roundedRect(this.marginLeft + 55, contentY - 4, 20, 6, 2, 2, 'F');
      
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(severityLabel, this.marginLeft + 65, contentY, { align: 'center' });

      // Score and progress bar
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(
        `${this.t.score}: ${concern.value.toFixed(1)}/10`,
        this.marginLeft + 5,
        contentY + 6
      );

      const barX = this.marginLeft + 5;
      const barWidth = 80;
      this.drawProgressBar(
        barX,
        contentY + 8,
        barWidth,
        4,
        (concern.value / 10) * 100,
        severityColor
      );

      // Percentile
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(120, 120, 120);
      this.pdf.text(
        `${this.t.percentile}: ${concern.percentile}/100`,
        this.pageWidth - this.marginRight - 5,
        contentY + 2,
        { align: 'right' }
      );

      y += cardHeight + 5;
    });

    // Add analysis image if available
    if (analysis.imageUrl && y + 80 < this.pageHeight - this.marginBottom) {
      y += 10;
      
      const imageWidth = this.contentWidth * 0.6;
      const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

      try {
        this.pdf.addImage(
          analysis.imageUrl,
          'JPEG',
          this.pageWidth / 2 - imageWidth / 2,
          y,
          imageWidth,
          imageHeight
        );
      } catch (error) {
        console.warn('Failed to add analysis image:', error);
      }
    }
  }

  private addProgramPackagesPage(
    packages: ProgramPackage[],
    centerInfo: EnhancedPDFOptions['centerInfo'],
    showDiscounts: boolean = true
  ) {
    this.addNewPage();
    this.addHeader(centerInfo, false);

    const startY = 35;

    // Title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    const rgb = this.hexToRgb(this.brandColor);
    this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    this.pdf.text(this.t.recommendedPrograms, this.marginLeft, startY);
    this.pdf.setTextColor(0, 0, 0);

    let y = startY + 12;

    packages.forEach((pkg, _index) => {
      // Check if we need a new page
      if (y + 60 > this.pageHeight - this.marginBottom) {
        this.addNewPage();
        this.addHeader(centerInfo, false);
        y = 35;
      }

      const boxHeight = 55;
      
      // Package box
      this.drawCard(this.marginLeft, y, this.contentWidth, boxHeight);

      // Badge (if exists)
      if (pkg.badge) {
        this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
        this.pdf.roundedRect(this.marginLeft + 5, y + 5, 25, 6, 2, 2, 'F');
        this.pdf.setFontSize(8);
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(pkg.badge[this.locale], this.marginLeft + 17.5, y + 9, {
          align: 'center',
        });
      }

      // Package name
      this.pdf.setFontSize(13);
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(pkg.name[this.locale], this.marginLeft + 5, y + 16);

      // Price
      this.pdf.setFontSize(16);
      this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      const priceText = `${this.t.baht} ${pkg.price.toLocaleString()}`;
      this.pdf.text(priceText, this.pageWidth - this.marginRight - 5, y + 16, {
        align: 'right',
      });

      // Original price (if discount)
      if (showDiscounts && pkg.discount && pkg.originalPrice) {
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(150, 150, 150);
        this.pdf.setFont('helvetica', 'normal');
        const originalText = `${this.t.baht} ${pkg.originalPrice.toLocaleString()}`;
        this.pdf.text(originalText, this.pageWidth - this.marginRight - 5, y + 10, {
          align: 'right',
        });
        // Strike-through line
        const textWidth = this.pdf.getTextWidth(originalText);
        this.pdf.line(
          this.pageWidth - this.marginRight - 5 - textWidth,
          y + 9,
          this.pageWidth - this.marginRight - 5,
          y + 9
        );
      }

      // Details
      let detailY = y + 25;
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(80, 80, 80);
      this.pdf.setFont('helvetica', 'normal');

      // Programs list
      pkg.programs.forEach((program) => {
        if (detailY < y + boxHeight - 8) {
          const text = `• ${program.name[this.locale]} (${program.sessions} ${this.t.sessions})`;
          this.pdf.text(text, this.marginLeft + 5, detailY);
          detailY += 5;
        }
      });

      // Key metrics
      const metricsY = y + boxHeight - 6;
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');

      const metrics = [
        `${this.t.duration}: ${pkg.duration.weeks} ${this.t.weeks}`,
        `${this.t.sessions}: ${pkg.sessions}`,
        `${this.t.expectedResults}: +${pkg.improvement}%`,
      ];

      let metricX = this.marginLeft + 5;
      metrics.forEach((metric) => {
        this.pdf.text(metric, metricX, metricsY);
        metricX += 45;
      });

      y += boxHeight + 8;
    });
  }

  private addTimelinePage(
    packages: ProgramPackage[],
    centerInfo: EnhancedPDFOptions['centerInfo']
  ) {
    this.addNewPage();
    this.addHeader(centerInfo, false);

    const startY = 35;

    // Title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    const rgb = this.hexToRgb(this.brandColor);
    this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    this.pdf.text(this.t.programTimeline, this.marginLeft, startY);
    this.pdf.setTextColor(0, 0, 0);

    let y = startY + 15;

    packages.forEach((pkg, pkgIdx) => {
      if (y + 40 > this.pageHeight - this.marginBottom) {
        this.addNewPage();
        this.addHeader(centerInfo, false);
        y = 35;
      }

      // Package header
      this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      this.pdf.circle(this.marginLeft + 5, y, 4, 'F');

      this.pdf.setFontSize(12);
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${pkgIdx + 1}. ${pkg.name[this.locale]}`, this.marginLeft + 12, y + 1);

      this.pdf.setFontSize(9);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(
        `${pkg.duration.months} ${this.t.month} ${this.locale === 'th' ? this.t('planSuffix') : 'plan'}`,
        this.marginLeft + 12,
        y + 6
      );

      y += 12;

      // Program list
      pkg.programs.forEach((program) => {
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(0, 0, 0);

        // Circle bullet
        this.pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        this.pdf.circle(this.marginLeft + 15, y - 1, 2, 'S');

        this.pdf.text(
          `${program.name[this.locale]} - ${program.sessions} ${this.t.sessions}`,
          this.marginLeft + 20,
          y
        );

        y += 6;
      });

      y += 10;
    });
  }

  private addContactPage(centerInfo: EnhancedPDFOptions['centerInfo']) {
    this.addNewPage();
    this.addHeader(centerInfo, false);

    let y = 40;
    const cardWidth = this.contentWidth;
    const cardHeight = 60;
    
    const contentY = this.drawCard(this.marginLeft, y, cardWidth, cardHeight, this.t.generatedBy);

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    const centerName = this.locale === 'th' && centerInfo.nameTh ? centerInfo.nameTh : centerInfo.name;
    this.pdf.text(centerName, this.marginLeft + 10, contentY + 5);

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(80, 80, 80);
    
    let infoY = contentY + 15;
    if (centerInfo.address) {
      const addr = this.locale === 'th' && centerInfo.addressTh ? centerInfo.addressTh : centerInfo.address;
      const lines = this.pdf.splitTextToSize(addr, cardWidth - 20);
      this.pdf.text(lines, this.marginLeft + 10, infoY);
      infoY += lines.length * 5 + 2;
    }

    if (centerInfo.phone) {
      this.pdf.text(`Tel: ${centerInfo.phone}`, this.marginLeft + 10, infoY);
      infoY += 5;
    }

    if (centerInfo.email) {
      this.pdf.text(`Email: ${centerInfo.email}`, this.marginLeft + 10, infoY);
      infoY += 5;
    }

    if (centerInfo.website) {
      this.pdf.text(`Web: ${centerInfo.website}`, this.marginLeft + 10, infoY);
    }

    // Disclaimer
    y = this.pageHeight - this.marginBottom - 20;
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(150, 150, 150);
    const disclaimerLines = this.pdf.splitTextToSize(this.t.disclaimer, this.contentWidth);
    this.pdf.text(disclaimerLines, this.pageWidth / 2, y, { align: 'center' });
  }

  public async generate(
    analysis: HybridSkinAnalysis,
    options: EnhancedPDFOptions,
    t: (key: string, values?: any) => string
  ): Promise<Blob> {
    this.t = t as any;
    // Calculate total pages
    this.totalPages = 1; // Cover page
    this.totalPages++; // Analysis Details
    if (options.comparisonMode && options.previousAnalysis) {
      this.totalPages++; // Comparison page
    }
    if (options.includeProgressCharts && options.historicalAnalyses && options.historicalAnalyses.length > 0) {
      this.totalPages++; // Charts page
    }
    if (options.programPackages && options.programPackages.length > 0) {
      this.totalPages++; // Recommendations page
      if (options.includeTimeline) {
        this.totalPages++; // Timeline page
      }
    }
    this.totalPages++; // Contact page

    // Page 1: Cover
    this.addCoverPage(analysis, options.customerInfo, options.centerInfo);

    // Page 2: Analysis Details
    this.addAnalysisDetailsPage(analysis, options.centerInfo);

    // Comparison Page
    if (options.comparisonMode && options.previousAnalysis) {
      this.addBeforeAfterComparisonPage(options.previousAnalysis, analysis, options.centerInfo);
    }

    // Charts Page
    if (options.includeProgressCharts && options.historicalAnalyses && options.historicalAnalyses.length > 0) {
      this.addProgressChartsPage(analysis, options.historicalAnalyses, options.centerInfo);
    }

    // Recommendations Page
    if (options.programPackages && options.programPackages.length > 0) {
      this.addProgramPackagesPage(options.programPackages, options.centerInfo, options.showDiscounts);
      
      // Timeline Page
      if (options.includeTimeline) {
        this.addTimelinePage(options.programPackages, options.centerInfo);
      }
    }

    // Contact Page
    this.addContactPage(options.centerInfo);

    // Add footers to all pages
    const pageCount = (this.pdf.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.currentPage = i;
      this.addFooter();
    }

    return this.pdf.output('blob');
  }
}

// Convenience function
export async function exportEnhancedPresentationToPDF(
  analysis: HybridSkinAnalysis,
  options: EnhancedPDFOptions,
  t: (key: string, values?: any) => string
): Promise<Blob> {
  const exporter = new EnhancedPDFExporter(options);
  return await exporter.generate(
    analysis,
    options,
    t
  );
}
