/**
 * Professional PDF Export for VISIA Analysis Reports
 * Includes clinic branding, analysis results, visualizations, recommendations
 */

import jsPDF from 'jspdf';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

export interface PDFExportOptions {
  locale?: 'th' | 'en';
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
    customerId?: string;
  };
  clinicInfo?: {
    name: string;
    nameTh?: string;
    logo?: string; // Base64 or URL
    address?: string;
    addressTh?: string;
    phone?: string;
    email?: string;
    website?: string;
    license?: string;
  };
  includeCharts?: boolean;
  includePhotos?: boolean;
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
    title: 'VISIA Skin Analysis Report',
    reportDate: 'Report Date',
    patientInfo: 'Patient Information',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    skinType: 'Skin Type',
    customerId: 'Customer ID',
    overallScore: 'Overall Skin Health Score',
    confidence: 'Confidence',
    detailedAnalysis: 'Detailed Analysis',
    percentile: 'Percentile',
    severity: 'Severity',
    count: 'Count',
    score: 'Score',
    spots: 'Spots',
    pores: 'Pores',
    wrinkles: 'Wrinkles',
    texture: 'Texture',
    redness: 'Redness',
    overall: 'Overall',
    priorityRanking: 'Priority Ranking',
    rank: 'Rank',
    concern: 'Concern',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    urgency: 'Urgency',
    recommendations: 'Treatment Recommendations',
    treatments: 'Recommended Treatments',
    products: 'Recommended Products',
    lifestyle: 'Lifestyle Recommendations',
    timeline: 'Treatment Timeline',
    estimatedCost: 'Estimated Cost',
    expectedImprovement: 'Expected Improvement',
    sessions: 'Sessions',
    effectiveness: 'Effectiveness',
    progressTracking: 'Progress Tracking',
    analysisDate: 'Analysis Date',
    disclaimer: 'This report was generated using AI-powered VISIA skin analysis technology. Results should be reviewed by a qualified dermatologist or skincare professional.',
    confidential: 'CONFIDENTIAL - For patient use only',
    reportId: 'Report ID',
    page: 'Page',
    of: 'of',
    years: 'years',
    thPercentile: 'th percentile',
    immediate: 'Immediate',
    shortTerm: 'Short-term',
    longTerm: 'Long-term',
    diet: 'Diet',
    hydration: 'Hydration',
    sleep: 'Sleep',
    stress: 'Stress Management',
    sunProtection: 'Sun Protection',
  },
  th: {
    title: 'รายงานการวิเคราะห์ผิวด้วย VISIA',
    reportDate: 'วันที่ออกรายงาน',
    patientInfo: 'ข้อมูลผู้รับบริการ',
    name: 'ชื่อ',
    age: 'อายุ',
    gender: 'เพศ',
    skinType: 'ประเภทผิว',
    customerId: 'รหัสลูกค้า',
    overallScore: 'คะแนนสุขภาพผิวโดยรวม',
    confidence: 'ความเชื่อมั่น',
    detailedAnalysis: 'ผลการวิเคราะห์โดยละเอียด',
    percentile: 'เปอร์เซ็นไทล์',
    severity: 'ความรุนแรง',
    count: 'จำนวน',
    score: 'คะแนน',
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'รอยแดง',
    overall: 'โดยรวม',
    priorityRanking: 'ลำดับความสำคัญของปัญหา',
    rank: 'อันดับ',
    concern: 'ปัญหา',
    priority: 'ความสำคัญ',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    urgency: 'ความเร่งด่วน',
    recommendations: 'คำแนะนำการรักษา',
    treatments: 'การรักษาที่แนะนำ',
    products: 'ผลิตภัณฑ์ที่แนะนำ',
    lifestyle: 'คำแนะนำการดูแลตนเอง',
    timeline: 'แผนการรักษา',
    estimatedCost: 'ค่าใช้จ่ายโดยประมาณ',
    expectedImprovement: 'การปรับปรุงที่คาดหวัง',
    sessions: 'ครั้ง',
    effectiveness: 'ประสิทธิภาพ',
    progressTracking: 'ติดตามความคืบหน้า',
    analysisDate: 'วันที่วิเคราะห์',
    disclaimer: 'รายงานนี้สร้างจากเทคโนโลยี VISIA ด้วยปัญญาประดิษฐ์ ผลการวิเคราะห์ควรได้รับการตรวจสอบโดยแพทย์ผู้เชี่ยวชาญด้านผิวหนัง',
    confidential: 'เอกสารลับ - สำหรับผู้รับบริการเท่านั้น',
    reportId: 'รหัสรายงาน',
    page: 'หน้า',
    of: 'จาก',
    years: 'ปี',
    thPercentile: 'เปอร์เซ็นไทล์',
    immediate: 'ทันที',
    shortTerm: 'ระยะสั้น',
    longTerm: 'ระยะยาว',
    diet: 'อาหาร',
    hydration: 'การดื่มน้ำ',
    sleep: 'การนอนหลับ',
    stress: 'การจัดการความเครียด',
    sunProtection: 'การป้องกันแสงแดด',
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

    // Set up Thai font if needed
    if (locale === 'th') {
      // jsPDF uses default fonts, for Thai we'd need to add custom font
      // For now, using default font with unicode support
      this.pdf.setFont('helvetica');
    }
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

    // Page 1: Header, Patient Info, Overall Score
    this.addHeader(options.clinicInfo);
    this.addPatientInfo(options.patientInfo);
    this.addOverallScore(analysis);
    
    // Page 1-2: Detailed Analysis
    this.addDetailedAnalysis(analysis);

    // Page 2: Priority Ranking (if provided)
    if (options.includePriorityRanking) {
      this.checkPageBreak(80);
      this.addSectionTitle(this.t.priorityRanking);
      // Priority ranking data would come from separate parameter
      // For now, showing placeholder
    }

    // Page 2-3: Treatment Recommendations
    if (options.includeRecommendations) {
      this.addPageBreak();
      this.addSectionTitle(this.t.recommendations);
      // Recommendations would come from separate parameter
    }

    // Page 3-4: Photos (if included)
    if (options.includePhotos && options.photos) {
      this.addPageBreak();
      await this.addPhotos(options.photos);
    }

    // Page 4-5: Progress Tracking (if included)
    if (options.includeProgress && options.progressData) {
      this.addPageBreak();
      this.addProgressTracking(options.progressData);
    }

    // Footer on all pages
    this.addFooter(analysis);

    return this.pdf.output('blob');
  }

  /**
   * Add header with clinic branding
   */
  private addHeader(clinicInfo?: PDFExportOptions['clinicInfo']): void {
    const pageWidth = this.pdf.internal.pageSize.getWidth();

    // Add logo if provided
    if (clinicInfo?.logo) {
      try {
        this.pdf.addImage(clinicInfo.logo, 'PNG', this.margin, 15, 40, 20);
        this.currentY = 40;
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
    }

    // Clinic name
    if (clinicInfo?.name) {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      const clinicName = this.locale === 'th' && clinicInfo.nameTh ? clinicInfo.nameTh : clinicInfo.name;
      this.pdf.text(clinicName, pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 8;

      // Clinic details
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      if (clinicInfo.address) {
        const address = this.locale === 'th' && clinicInfo.addressTh ? clinicInfo.addressTh : clinicInfo.address;
        this.pdf.text(address, pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 5;
      }
      if (clinicInfo.phone || clinicInfo.email) {
        const contact = [clinicInfo.phone, clinicInfo.email].filter(Boolean).join(' | ');
        this.pdf.text(contact, pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 5;
      }
    }

    // Report title
    this.currentY += 5;
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(37, 99, 235); // Blue
    this.pdf.text(this.t.title, pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;

    // Report date
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    const dateStr = `${this.t.reportDate}: ${new Date().toLocaleDateString(this.locale === 'th' ? 'th-TH' : 'en-US')}`;
    this.pdf.text(dateStr, pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;

    // Divider line
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.margin, this.currentY, pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  /**
   * Add patient information section
   */
  private addPatientInfo(patientInfo?: PDFExportOptions['patientInfo']): void {
    if (!patientInfo || Object.keys(patientInfo).length === 0) {
      return;
    }

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.patientInfo, this.margin, this.currentY);
    this.currentY += 8;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const colWidth = (pageWidth - 2 * this.margin) / 2;

    let col = 0;
    const fields = [
      { key: 'name', label: this.t.name },
      { key: 'age', label: this.t.age, suffix: ` ${this.t.years}` },
      { key: 'gender', label: this.t.gender },
      { key: 'skinType', label: this.t.skinType },
      { key: 'customerId', label: this.t.customerId },
    ];

    const startY = this.currentY;
    fields.forEach((field, index) => {
      const value = patientInfo[field.key as keyof typeof patientInfo];
      if (value !== undefined) {
        const x = this.margin + col * colWidth;
        const y = startY + Math.floor(index / 2) * 7;
        
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(`${field.label}:`, x, y);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(
          `${value}${field.suffix || ''}`,
          x + 25,
          y
        );
        
        col = (col + 1) % 2;
      }
    });

    this.currentY += Math.ceil(fields.length / 2) * 7 + 5;

    // Divider line
    this.pdf.setDrawColor(230, 230, 230);
    this.pdf.line(this.margin, this.currentY, pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  /**
   * Add overall score section with large display
   */
  private addOverallScore(analysis: HybridSkinAnalysis): void {
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const boxWidth = 80;
    const boxHeight = 40;
    const boxX = (pageWidth - boxWidth) / 2;
    const boxY = this.currentY;

    // Background box
    this.pdf.setFillColor(245, 247, 250);
    this.pdf.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');

    // Score number
    this.pdf.setFontSize(36);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(37, 99, 235);
    this.pdf.text(
      analysis.overallScore.toString(),
      pageWidth / 2,
      boxY + boxHeight / 2 - 5,
      { align: 'center' }
    );

    // Label
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      this.t.overallScore,
      pageWidth / 2,
      boxY + boxHeight / 2 + 8,
      { align: 'center' }
    );

    // Confidence
    this.pdf.setFontSize(9);
    this.pdf.text(
      `${this.t.confidence}: ${analysis.confidence}%`,
      pageWidth / 2,
      boxY + boxHeight - 5,
      { align: 'center' }
    );

    this.currentY = boxY + boxHeight + 15;
    this.pdf.setTextColor(0, 0, 0);
  }

  /**
   * Add detailed analysis with parameters
   */
  private addDetailedAnalysis(analysis: HybridSkinAnalysis): void {
    this.addSectionTitle(this.t.detailedAnalysis);

    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const cardWidth = (pageWidth - 3 * this.margin) / 2;
    const cardHeight = 35;
    const cardSpacing = 8;

    const parameters = [
      {
        name: this.t.spots,
        percentile: analysis.percentiles.spots,
        severity: analysis.cv.spots.severity,
        extra: `${this.t.count}: ${analysis.cv.spots.count}`,
      },
      {
        name: this.t.pores,
        percentile: analysis.percentiles.pores,
        severity: analysis.cv.pores.severity,
        extra: `${this.t.count}: ${analysis.cv.pores.enlargedCount}`,
      },
      {
        name: this.t.wrinkles,
        percentile: analysis.percentiles.wrinkles,
        severity: analysis.cv.wrinkles.severity,
        extra: `${this.t.count}: ${analysis.cv.wrinkles.count}`,
      },
      {
        name: this.t.texture,
        percentile: analysis.percentiles.texture,
        severity: analysis.cv.texture.score,
        extra: `${this.t.score}: ${analysis.cv.texture.score}/10`,
      },
      {
        name: this.t.redness,
        percentile: analysis.percentiles.redness,
        severity: analysis.cv.redness.severity,
        extra: `${analysis.cv.redness.percentage}%`,
      },
      {
        name: this.t.overall,
        percentile: analysis.percentiles.overall,
        severity: typeof analysis.overallScore === 'number' ? analysis.overallScore / 10 : 0,
        extra: `${this.t.percentile}`,
      },
    ];

    parameters.forEach((param, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = this.margin + col * (cardWidth + this.margin);
      const y = this.currentY + row * (cardHeight + cardSpacing);

      this.checkPageBreak(cardHeight + cardSpacing);

      // Card background
      this.pdf.setFillColor(249, 250, 251);
      this.pdf.setDrawColor(229, 231, 235);
      this.pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

      // Parameter name
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(75, 85, 99);
      this.pdf.text(param.name, x + 5, y + 8);

      // Percentile
      this.pdf.setFontSize(24);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(37, 99, 235);
      this.pdf.text(
        `${param.percentile}${this.locale === 'th' ? '' : 'th'}`,
        x + 5,
        y + 22
      );

      // Severity bar
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

      // Extra info
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(107, 114, 128);
      this.pdf.text(param.extra, x + 5, y + 30);

      // Severity text
      this.pdf.text(
        `${this.t.severity}: ${param.severity.toFixed(1)}/10`,
        barX,
        barY + barHeight + 5
      );
    });

    this.currentY += Math.ceil(parameters.length / 2) * (cardHeight + cardSpacing) + 10;
    this.pdf.setTextColor(0, 0, 0);
  }

  /**
   * Add section title
   */
  private addSectionTitle(title: string): void {
    this.checkPageBreak(15);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
    this.pdf.setTextColor(0, 0, 0);
  }

  /**
   * Add photos section
   */
  private async addPhotos(photos: PDFExportOptions['photos']): Promise<void> {
    if (!photos) return;

    this.addSectionTitle('Analysis Photos');

    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const photoWidth = (pageWidth - 4 * this.margin) / 3;
    const photoHeight = photoWidth * 1.2;

    let x = this.margin;
    const labels = ['Before', 'Current', 'After'];
    const photoKeys = ['before', 'current', 'after'] as const;

    for (let i = 0; i < photoKeys.length; i++) {
      const key = photoKeys[i];
      const photo = photos[key];

      if (photo) {
        try {
          this.pdf.addImage(photo, 'JPEG', x, this.currentY, photoWidth, photoHeight);
          
          // Label
          this.pdf.setFontSize(10);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(labels[i], x + photoWidth / 2, this.currentY + photoHeight + 5, {
            align: 'center',
          });
        } catch (error) {
          console.error(`Failed to add ${key} photo:`, error);
        }
      }

      x += photoWidth + this.margin;
    }

    this.currentY += photoHeight + 15;
  }

  /**
   * Add progress tracking chart
   */
  private addProgressTracking(data: { dates: string[]; scores: number[] }): void {
    this.addSectionTitle(this.t.progressTracking);

    // Simple text-based progress for now
    // In production, would generate chart image and add it
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    data.dates.forEach((date, index) => {
      const score = data.scores[index];
      this.checkPageBreak(8);
      this.pdf.text(
        `${date}: ${score}/100`,
        this.margin + 10,
        this.currentY
      );
      this.currentY += 7;
    });

    this.currentY += 5;
  }

  /**
   * Add footer to all pages
   */
  private addFooter(analysis: HybridSkinAnalysis): void {
    const totalPages = this.pdf.getNumberOfPages();
    const pageWidth = this.pdf.internal.pageSize.getWidth();

    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      
      // Disclaimer
      this.pdf.setFontSize(7);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setTextColor(107, 114, 128);
      
      const disclaimerY = this.pageHeight - 20;
      const maxWidth = pageWidth - 2 * this.margin;
      const disclaimerLines = this.pdf.splitTextToSize(this.t.disclaimer, maxWidth);
      this.pdf.text(disclaimerLines, this.margin, disclaimerY);

      // Confidential notice
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(this.t.confidential, pageWidth / 2, disclaimerY + 10, {
        align: 'center',
      });

      // Page number and report ID
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(
        `${this.t.page} ${i} ${this.t.of} ${totalPages}`,
        this.margin,
        this.pageHeight - 5
      );
      this.pdf.text(
        `${this.t.reportId}: ${analysis.timestamp.getTime()}`,
        pageWidth - this.margin,
        this.pageHeight - 5,
        { align: 'right' }
      );
    }

    this.pdf.setTextColor(0, 0, 0);
  }

  /**
   * Check if we need a page break
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.addPageBreak();
    }
  }

  /**
   * Add a new page
   */
  private addPageBreak(): void {
    this.pdf.addPage();
    this.currentY = 20;
    this.pageNumber++;
  }

  /**
   * Get color based on severity (0-10)
   */
  private getSeverityColor(severity: number): { r: number; g: number; b: number } {
    if (severity < 3) return { r: 34, g: 197, b: 94 }; // Green
    if (severity < 6) return { r: 234, g: 179, b: 8 }; // Yellow
    if (severity < 8) return { r: 249, g: 115, b: 22 }; // Orange
    return { r: 239, g: 68, b: 68 }; // Red
  }

  /**
   * Save PDF to file
   */
  save(filename: string = 'skin-analysis-report.pdf'): void {
    this.pdf.save(filename);
  }

  /**
   * Get PDF as blob
   */
  getBlob(): Blob {
    return this.pdf.output('blob');
  }

  /**
   * Get PDF as data URL
   */
  getDataUrl(): string {
    return this.pdf.output('dataurlstring');
  }
}

/**
 * Quick export function
 */
export async function exportAnalysisToPDF(
  analysis: HybridSkinAnalysis,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const generator = new PDFReportGenerator(options.locale || 'en');
  return generator.generateReport(analysis, options);
}

/**
 * Download PDF directly
 */
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
