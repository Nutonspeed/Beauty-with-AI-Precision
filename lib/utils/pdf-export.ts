/**
 * Professional PDF Export for Aesthetic Intelligence Analysis Reports
 * Includes center branding, analysis results, visualizations, recommendations
 */

import jsPDF from 'jspdf';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

export interface PDFExportOptions {
  locale?: 'th' | 'en';
  clientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
    clientId?: string;
  };
  centerInfo?: {
    name: string;
    nameTh?: string;
    logo?: string; // Base64 or URL
    address?: string;
    addressTh?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  includeImages?: boolean;
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  includePriorityRanking?: boolean;
  includeProgress?: boolean;
  photos?: {
    before?: string; // Base64 image
    current?: string;
    after?: string;
  };
  progressData?: {
    dates: string[];
    scores: number[];
  };
}

// Translation dictionary
const TRANSLATIONS = {
  en: {
    title: 'Aesthetic Intelligence Analysis Report',
    reportDate: 'Report Date',
    customerInfo: 'Client Information',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    skinType: 'Skin Type',
    customerId: 'Client ID',
    overallScore: 'Overall Skin Health Score',
    confidence: 'Analysis Confidence',
    concerns: 'Detected Skin Concerns',
    severity: 'Severity',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    urgency: 'Urgency',
    recommendations: 'Program Recommendations',
    treatments: 'Recommended Programs',
    products: 'Recommended Products',
    lifestyle: 'Lifestyle Recommendations',
    timeline: 'Program Roadmap',
    estimatedCost: 'Estimated Cost',
    expectedImprovement: 'Expected Improvement',
    sessions: 'Sessions',
    effectiveness: 'Effectiveness',
    progressTracking: 'Progress Tracking',
    analysisDate: 'Analysis Date',
    disclaimer: 'This report was generated using AI-powered Aesthetic Intelligence technology. Results should be reviewed by a qualified aesthetic specialist or skincare professional.',
    confidential: 'CONFIDENTIAL - For customer use only',
    reportId: 'Report ID',
    page: 'Page',
    of: 'of',
    spots: 'Spots',
    pores: 'Pores',
    wrinkles: 'Wrinkles',
    texture: 'Texture',
    redness: 'Redness',
    pigmentation: 'Pigmentation',
    acne: 'Acne',
    sunProtection: 'Sun Protection',
    diet: 'Diet',
    hydration: 'Hydration',
    sleep: 'Sleep',
    stress: 'Stress Management',
    priorityRanking: 'Priority Ranking',
    detailedAnalysis: 'Detailed Analysis',
    count: 'Count',
    score: 'Score',
    overall: 'Overall',
    percentile: 'Percentile',
  },
  th: {
    title: 'รายงานการวิเคราะห์ความงามอัจฉริยะ',
    reportDate: 'วันที่ออกรายงาน',
    customerInfo: 'ข้อมูลผู้รับบริการ',
    name: 'ชื่อ',
    age: 'อายุ',
    gender: 'เพศ',
    skinType: 'ประเภทผิว',
    customerId: 'รหัสลูกค้า',
    overallScore: 'คะแนนสุขภาพผิวโดยรวม',
    confidence: 'ความเชื่อมั่นในการวิเคราะห์',
    concerns: 'ปัญหาผิวที่ตรวจพบ',
    severity: 'ความรุนแรง',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    urgency: 'ความเร่งด่วน',
    recommendations: 'คำแนะนำโปรแกรมความงาม',
    treatments: 'โปรแกรมที่แนะนำ',
    products: 'ผลิตภัณฑ์ที่แนะนำ',
    lifestyle: 'คำแนะนำการดูแลตนเอง',
    timeline: 'แผนงานความงาม',
    estimatedCost: 'ประมาณการค่าใช้จ่าย',
    expectedImprovement: 'การปรับปรุงที่คาดหวัง',
    sessions: 'จำนวนครั้ง',
    effectiveness: 'ประสิทธิภาพ',
    progressTracking: 'ติดตามความคืบหน้า',
    analysisDate: 'วันที่วิเคราะห์',
    disclaimer: 'รายงานนี้สร้างจากเทคโนโลยีความงามอัจฉริยะด้วยปัญญาประดิษฐ์ ผลการวิเคราะห์ควรได้รับการตรวจสอบโดยผู้เชี่ยวชาญด้านความงาม',
    confidential: 'เอกสารลับ - สำหรับลูกค้าเท่านั้น',
    reportId: 'รหัสรายงาน',
    page: 'หน้า',
    of: 'จาก',
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'รอยแดง',
    pigmentation: 'เม็ดสี',
    acne: 'สิว',
    sunProtection: 'การป้องกันแสงแดด',
    diet: 'อาหาร',
    hydration: 'การดื่มน้ำ',
    sleep: 'การนอนหลับ',
    stress: 'การจัดการความเครียด',
    priorityRanking: 'ลำดับความสำคัญ',
    detailedAnalysis: 'การวิเคราะห์โดยละเอียด',
    count: 'จำนวน',
    score: 'คะแนน',
    overall: 'โดยรวม',
    percentile: 'เปอร์เซ็นไทล์',
  },
};

export class PDFReportGenerator {
  private pdf: jsPDF;
  private locale: 'th' | 'en';
  private t: typeof TRANSLATIONS.en;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;
  private pageNumber: number = 1;

  constructor(locale: 'th' | 'en' = 'en') {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.locale = locale;
    this.t = TRANSLATIONS[locale];
  }

  /**
   * Generate complete PDF report
   */
  async generateReport(
    analysis: HybridSkinAnalysis,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    this.currentY = 20;
    this.pageNumber = 1;

    // Page 1: Header, Client Info, Overall Score
    this.addHeader(options.centerInfo);
    this.addClientInfo(options.clientInfo);
    this.addOverallScore(analysis);
    
    // Page 1-2: Detailed Analysis
    this.addDetailedAnalysis(analysis);

    // Page 2: Priority Ranking (if provided)
    if (options.includePriorityRanking) {
      this.checkPageBreak(80);
      this.addSectionTitle(this.t.priorityRanking);
      // Placeholder for priority ranking
    }

    // Page 2-3: Program Recommendations
    if (options.includeRecommendations) {
      this.checkPageBreak(40);
      this.addSectionTitle(this.t.recommendations);
      // Recommendations logic
    }

    // Page 3-4: Photos (if included)
    if (options.includeImages && options.photos) {
      this.addPageBreak();
      await this.addPhotos(options.photos);
    }

    // Page 4-5: Progress Tracking (if included)
    if (options.includeProgress && options.progressData) {
      this.checkPageBreak(60);
      this.addProgressTracking(options.progressData);
    }

    // Final Footer adjustments
    this.applyFinalFooter(analysis);

    return this.pdf.output('blob');
  }

  private addHeader(centerInfo?: PDFExportOptions['centerInfo']): void {
    const pageWidth = this.pdf.internal.pageSize.getWidth();

    if (centerInfo?.logo) {
      try {
        this.pdf.addImage(centerInfo.logo, 'PNG', this.margin, 15, 40, 20);
        this.currentY = 40;
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
    }

    if (centerInfo?.name) {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      const centerName = this.locale === 'th' && centerInfo.nameTh ? centerInfo.nameTh : centerInfo.name;
      this.pdf.text(centerName, pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 8;

      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      if (centerInfo.address) {
        const address = this.locale === 'th' && centerInfo.addressTh ? centerInfo.addressTh : centerInfo.address;
        this.pdf.text(address, pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 5;
      }
      if (centerInfo.phone || centerInfo.email) {
        const contact = [centerInfo.phone, centerInfo.email].filter(Boolean).join(' | ');
        this.pdf.text(contact, pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 5;
      }
    } else {
      this.pdf.setFontSize(20);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(this.t.title, pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 10;
    }

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    const dateStr = `${this.t.reportDate}: ${new Date().toLocaleDateString(this.locale === 'th' ? 'th-TH' : 'en-US')}`;
    this.pdf.text(dateStr, pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;

    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.margin, this.currentY, pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addClientInfo(clientInfo?: PDFExportOptions['clientInfo']): void {
    if (!clientInfo || Object.keys(clientInfo).length === 0) return;

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.customerInfo, this.margin, this.currentY);
    this.currentY += 8;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    const colWidth = (this.pdf.internal.pageSize.getWidth() - this.margin * 2) / 2;
    const fields = [
      { label: this.t.name, key: 'name' },
      { label: this.t.age, key: 'age' },
      { label: this.t.gender, key: 'gender' },
      { label: this.t.skinType, key: 'skinType' },
      { label: this.t.reportId, key: 'clientId' },
    ];

    const startY = this.currentY;
    fields.forEach((field, index) => {
      const value = clientInfo[field.key as keyof typeof clientInfo];
      if (value !== undefined) {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = this.margin + col * colWidth;
        const y = startY + row * 7;
        
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(`${field.label}:`, x, y);
        
        const labelWidth = this.pdf.getTextWidth(`${field.label}: `);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(String(value), x + labelWidth, y);
        
        this.currentY = Math.max(this.currentY, y + 7);
      }
    });

    this.currentY += 5;
    this.addLine();
  }

  private addOverallScore(analysis: HybridSkinAnalysis): void {
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const boxWidth = 80;
    const boxHeight = 40;
    const boxX = (pageWidth - boxWidth) / 2;
    const boxY = this.currentY;

    this.pdf.setFillColor(245, 247, 250);
    this.pdf.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');

    this.pdf.setFontSize(36);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(37, 99, 235);
    
    const scoreStr = typeof analysis.overallScore === 'object' 
      ? (analysis.percentiles.overall ?? 0).toString() 
      : (analysis.overallScore as any).toString();

    this.pdf.text(scoreStr, pageWidth / 2, boxY + boxHeight / 2 - 5, { align: 'center' });

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(this.t.overallScore, pageWidth / 2, boxY + boxHeight / 2 + 8, { align: 'center' });

    this.pdf.setFontSize(9);
    this.pdf.text(`${this.t.confidence}: ${Math.round(analysis.confidence * 100)}%`, pageWidth / 2, boxY + boxHeight - 5, { align: 'center' });

    this.currentY = boxY + boxHeight + 15;
    this.pdf.setTextColor(0, 0, 0);
  }

  private addDetailedAnalysis(analysis: HybridSkinAnalysis): void {
    this.addSectionTitle(this.t.detailedAnalysis);

    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const cardWidth = (pageWidth - 3 * this.margin) / 2;
    const cardHeight = 35;
    const cardSpacing = 8;

    const parameters = [
      { name: this.t.spots, percentile: analysis.percentiles.spots, severity: analysis.cv.spots.severity, extra: `${this.t.count}: ${analysis.cv.spots.count}` },
      { name: this.t.pores, percentile: analysis.percentiles.pores, severity: analysis.cv.pores.severity, extra: `${this.t.count}: ${analysis.cv.pores.enlargedCount}` },
      { name: this.t.wrinkles, percentile: analysis.percentiles.wrinkles, severity: analysis.cv.wrinkles.severity, extra: `${this.t.count}: ${analysis.cv.wrinkles.count}` },
      { name: this.t.texture, percentile: analysis.percentiles.texture, severity: analysis.cv.texture.score, extra: `${this.t.score}: ${analysis.cv.texture.score}/10` },
      { name: this.t.redness, percentile: analysis.percentiles.redness, severity: analysis.cv.redness.severity, extra: `${analysis.cv.redness.percentage}%` },
      { name: this.t.overall, percentile: analysis.percentiles.overall, severity: analysis.percentiles.overall / 10, extra: `${this.t.percentile}` },
    ];

    parameters.forEach((param, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = this.margin + col * (cardWidth + this.margin);
      const y = this.currentY + row * (cardHeight + cardSpacing);

      this.checkPageBreak(cardHeight + cardSpacing);

      this.pdf.setFillColor(249, 250, 251);
      this.pdf.setDrawColor(229, 231, 235);
      this.pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(75, 85, 99);
      this.pdf.text(param.name, x + 5, y + 8);

      this.pdf.setFontSize(24);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(37, 99, 235);
      this.pdf.text(`${param.percentile}${this.locale === 'th' ? '' : 'th'}`, x + 5, y + 22);

      const barWidth = 30;
      const barHeight = 4;
      const barX = x + cardWidth - barWidth - 5;
      const barY = y + 12;

      this.pdf.setFillColor(229, 231, 235);
      this.pdf.rect(barX, barY, barWidth, barHeight, 'F');

      const fillWidth = (param.severity / 10) * barWidth;
      const color = this.getSeverityColor(param.severity);
      this.pdf.setFillColor(color.r, color.g, color.b);
      this.pdf.rect(barX, barY, fillWidth, barHeight, 'F');

      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(107, 114, 128);
      this.pdf.text(param.extra, x + 5, y + 30);

      this.pdf.text(`${this.t.severity}: ${param.severity.toFixed(1)}/10`, barX, barY + barHeight + 5);
    });

    this.currentY += Math.ceil(parameters.length / 2) * (cardHeight + cardSpacing) + 10;
    this.pdf.setTextColor(0, 0, 0);
  }

  private addSectionTitle(title: string): void {
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
    this.pdf.setTextColor(0, 0, 0);
  }

  private addLine(): void {
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.margin, this.currentY, this.pdf.internal.pageSize.getWidth() - this.margin, this.currentY);
    this.currentY += 10;
  }

  private checkPageBreak(neededHeight: number): void {
    if (this.currentY + neededHeight > this.pageHeight - this.margin) {
      this.addPageBreak();
    }
  }

  private addPageBreak(): void {
    this.pdf.addPage();
    this.pageNumber++;
    this.currentY = 20;
  }

  private getSeverityColor(severity: number): { r: number; g: number; b: number } {
    if (severity < 3) return { r: 34, g: 197, b: 94 }; // Green
    if (severity < 6) return { r: 234, g: 179, b: 8 }; // Yellow
    if (severity < 8) return { r: 249, g: 115, b: 22 }; // Orange
    return { r: 239, g: 68, b: 68 }; // Red
  }

  private async addPhotos(photos: PDFExportOptions['photos']): Promise<void> {
    if (!photos) return;
    this.addSectionTitle('Analysis Photos');
    const photoWidth = (this.pdf.internal.pageSize.getWidth() - 4 * this.margin) / 3;
    const photoHeight = photoWidth * 1.2;
    let x = this.margin;
    const labels = ['Before', 'Current', 'After'];
    const photoKeys = ['before', 'current', 'after'] as const;

    for (let i = 0; i < photoKeys.length; i++) {
      const photo = photos[photoKeys[i]];
      if (photo) {
        try {
          this.pdf.addImage(photo, 'JPEG', x, this.currentY, photoWidth, photoHeight);
          this.pdf.setFontSize(10);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(labels[i], x + photoWidth / 2, this.currentY + photoHeight + 5, { align: 'center' });
        } catch (e) { console.error(e); }
      }
      x += photoWidth + this.margin;
    }
    this.currentY += photoHeight + 15;
  }

  private addProgressTracking(data: { dates: string[]; scores: number[] }): void {
    this.addSectionTitle(this.t.progressTracking);
    this.pdf.setFontSize(10);
    data.dates.forEach((date, i) => {
      this.checkPageBreak(8);
      this.pdf.text(`${date}: ${data.scores[i]}/100`, this.margin + 10, this.currentY);
      this.currentY += 7;
    });
  }

  private applyFinalFooter(analysis: HybridSkinAnalysis): void {
    const pageCount = this.pdf.getNumberOfPages();
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(107, 114, 128);
      const disclaimerY = this.pageHeight - 20;
      const disclaimerLines = this.pdf.splitTextToSize(this.t.disclaimer, pageWidth - 2 * this.margin);
      this.pdf.text(disclaimerLines, this.margin, disclaimerY);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(this.t.confidential, pageWidth / 2, disclaimerY + 10, { align: 'center' });
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${this.t.page} ${i} ${this.t.of} ${pageCount}`, this.margin, this.pageHeight - 5);
      this.pdf.text(`${this.t.reportId}: ${analysis.id}`, pageWidth - this.margin, this.pageHeight - 5, { align: 'right' });
    }
  }

  save(filename: string = 'aesthetic-report.pdf'): void {
    this.pdf.save(filename);
  }
}

export async function exportAnalysisToPDF(analysis: HybridSkinAnalysis, options: PDFExportOptions = {}): Promise<Blob> {
  const generator = new PDFReportGenerator(options.locale || 'en');
  return generator.generateReport(analysis, options);
}

export async function downloadAnalysisPDF(
  analysis: HybridSkinAnalysis,
  options: PDFExportOptions = {},
  filename?: string
): Promise<void> {
  const blob = await exportAnalysisToPDF(analysis, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `skin-analysis-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
