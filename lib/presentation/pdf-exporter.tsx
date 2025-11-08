/**
 * PDF Exporter for Sales Presentations
 * Generates professional PDFs with clinic branding, treatment packages, and pricing
 */

import jsPDF from 'jspdf';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

export interface PresentationPDFOptions {
  locale?: 'th' | 'en';
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
    customerId?: string;
  };
  clinicInfo: {
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
  treatmentPackages?: TreatmentPackage[];
  includePricing?: boolean;
  includeTimeline?: boolean;
  showDiscounts?: boolean;
}

export interface TreatmentPackage {
  id: string;
  name: { en: string; th: string };
  treatments: { name: { en: string; th: string }; sessions: number }[];
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

const TRANSLATIONS = {
  en: {
    title: 'Personalized Skin Treatment Proposal',
    subtitle: 'Professional Skin Analysis & Treatment Plan',
    date: 'Date',
    preparedFor: 'Prepared For',
    patientInfo: 'Patient Information',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    skinType: 'Skin Type',
    customerId: 'Customer ID',
    analysisResults: 'Skin Analysis Results',
    overallScore: 'Overall Skin Health Score',
    confidence: 'Analysis Confidence',
    detailedAnalysis: 'Detailed Analysis',
    concerns: 'Skin Concerns',
    spots: 'Spots & Pigmentation',
    pores: 'Pore Size',
    wrinkles: 'Fine Lines & Wrinkles',
    texture: 'Skin Texture',
    redness: 'Redness & Inflammation',
    severity: 'Severity',
    percentile: 'Percentile',
    treatmentPackages: 'Recommended Treatment Packages',
    package: 'Package',
    packageDetails: 'Package Details',
    duration: 'Treatment Duration',
    sessions: 'Total Sessions',
    improvement: 'Expected Improvement',
    price: 'Price',
    savings: 'You Save',
    effectiveness: 'Treatment Effectiveness',
    treatmentTimeline: 'Treatment Timeline',
    week: 'Week',
    weeks: 'weeks',
    month: 'Month',
    months: 'months',
    session: 'session',
    treatmentPlan: 'Your Treatment Plan',
    nextSteps: 'Next Steps',
    stepOne: 'Schedule your consultation with our skin specialist',
    stepTwo: 'Receive detailed treatment plan and timeline',
    stepThree: 'Begin your personalized treatment journey',
    contactUs: 'Contact Us',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    address: 'Address',
    disclaimer: 'This treatment proposal is based on AI-powered skin analysis. Final treatment plan will be determined after consultation with our licensed dermatologist.',
    confidential: 'CONFIDENTIAL - For patient use only',
    validUntil: 'This proposal is valid for 30 days',
    page: 'Page',
    of: 'of',
    years: 'years old',
    proposalId: 'Proposal ID',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    total: 'Total',
    perSession: 'per session',
    baht: 'THB',
  },
  th: {
    title: 'ข้อเสนอการรักษาผิวเฉพาะบุคคล',
    subtitle: 'การวิเคราะห์ผิวและแผนการรักษาแบบมืออาชีพ',
    date: 'วันที่',
    preparedFor: 'จัดทำสำหรับ',
    patientInfo: 'ข้อมูลผู้รับบริการ',
    name: 'ชื่อ',
    age: 'อายุ',
    gender: 'เพศ',
    skinType: 'ประเภทผิว',
    customerId: 'รหัสลูกค้า',
    analysisResults: 'ผลการวิเคราะห์ผิว',
    overallScore: 'คะแนนสุขภาพผิวโดยรวม',
    confidence: 'ความเชื่อมั่นในการวิเคราะห์',
    detailedAnalysis: 'การวิเคราะห์โดยละเอียด',
    concerns: 'ปัญหาผิว',
    spots: 'จุดด่างดำ & เม็ดสี',
    pores: 'ขนาดรูขุมขน',
    wrinkles: 'ริ้วรอยและเส้นตื้น',
    texture: 'เนื้อผิว',
    redness: 'รอยแดงและการอักเสบ',
    severity: 'ความรุนแรง',
    percentile: 'เปอร์เซ็นไทล์',
    treatmentPackages: 'แพ็คเกจการรักษาที่แนะนำ',
    package: 'แพ็คเกจ',
    packageDetails: 'รายละเอียดแพ็คเกจ',
    duration: 'ระยะเวลาการรักษา',
    sessions: 'จำนวนครั้งทั้งหมด',
    improvement: 'การปรับปรุงที่คาดหวัง',
    price: 'ราคา',
    savings: 'คุณประหยัด',
    effectiveness: 'ประสิทธิภาพการรักษา',
    treatmentTimeline: 'ไทม์ไลน์การรักษา',
    week: 'สัปดาห์',
    weeks: 'สัปดาห์',
    month: 'เดือน',
    months: 'เดือน',
    session: 'ครั้ง',
    treatmentPlan: 'แผนการรักษาของคุณ',
    nextSteps: 'ขั้นตอนถัดไป',
    stepOne: 'นัดหมายให้คำปรึกษากับผู้เชี่ยวชาญด้านผิวหนัง',
    stepTwo: 'รับแผนการรักษาและไทม์ไลน์โดยละเอียด',
    stepThree: 'เริ่มต้นการรักษาเฉพาะบุคคลของคุณ',
    contactUs: 'ติดต่อเรา',
    phone: 'โทรศัพท์',
    email: 'อีเมล',
    website: 'เว็บไซต์',
    address: 'ที่อยู่',
    disclaimer: 'ข้อเสนอการรักษานี้อิงจากการวิเคราะห์ผิวด้วย AI แผนการรักษาขั้นสุดท้ายจะถูกกำหนดหลังจากการปรึกษากับแพทย์ผู้เชี่ยวชาญ',
    confidential: 'เอกสารลับ - สำหรับผู้รับบริการเท่านั้น',
    validUntil: 'ข้อเสนอนี้มีผลบังคับใช้ 30 วัน',
    page: 'หน้า',
    of: 'จาก',
    years: 'ปี',
    proposalId: 'รหัสข้อเสนอ',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    total: 'รวม',
    perSession: 'ต่อครั้ง',
    baht: '฿',
  },
};

export class PresentationPDFExporter {
  private pdf: jsPDF;
  private locale: 'th' | 'en';
  private t: typeof TRANSLATIONS.en;
  private currentPage: number = 1;
  private totalPages: number = 0;
  private brandColor: string;
  private marginLeft: number = 20;
  private marginRight: number = 20;
  private marginTop: number = 20;
  private marginBottom: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private contentWidth: number;

  constructor(options: PresentationPDFOptions) {
    this.locale = options.locale || 'en';
    this.t = TRANSLATIONS[this.locale];
    this.brandColor = options.clinicInfo.brandColor || '#6366f1';

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
      : { r: 99, g: 102, b: 241 }; // Default primary color
  }

  private addHeader(clinicInfo: PresentationPDFOptions['clinicInfo']) {
    const rgb = this.hexToRgb(this.brandColor);

    // Clinic logo and name
    if (clinicInfo.logo) {
      try {
        this.pdf.addImage(clinicInfo.logo, 'PNG', this.marginLeft, this.marginTop, 20, 20);
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
      }
    }

    this.pdf.setFontSize(18);
    this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    this.pdf.setFont('helvetica', 'bold');
    const clinicName =
      this.locale === 'th' && clinicInfo.nameTh ? clinicInfo.nameTh : clinicInfo.name;
    this.pdf.text(clinicName, clinicInfo.logo ? this.marginLeft + 25 : this.marginLeft, this.marginTop + 7);

    // Reset text color
    this.pdf.setTextColor(0, 0, 0);
  }

  private addFooter() {
    const y = this.pageHeight - this.marginBottom + 5;

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

    // Reset
    this.pdf.setTextColor(0, 0, 0);
  }

  private addNewPage() {
    this.pdf.addPage();
    this.currentPage++;
  }

  private drawBox(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor?: { r: number; g: number; b: number }
  ) {
    if (fillColor) {
      this.pdf.setFillColor(fillColor.r, fillColor.g, fillColor.b);
      this.pdf.rect(x, y, width, height, 'F');
    }
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.rect(x, y, width, height, 'S');
  }

  private addCoverPage(
    analysis: HybridSkinAnalysis,
    patientInfo: PresentationPDFOptions['patientInfo'],
    clinicInfo: PresentationPDFOptions['clinicInfo']
  ) {
    const rgb = this.hexToRgb(this.brandColor);

    // Large brand color header
    this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');

    // Clinic logo
    if (clinicInfo.logo) {
      try {
        this.pdf.addImage(clinicInfo.logo, 'PNG', this.pageWidth / 2 - 15, 15, 30, 30);
      } catch (error) {
        console.warn('Failed to add logo:', error);
      }
    }

    // Title
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.title, this.pageWidth / 2, 55, { align: 'center' });

    // Subtitle
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(this.t.subtitle, this.pageWidth / 2, 65, { align: 'center' });

    // Reset colors
    this.pdf.setTextColor(0, 0, 0);

    // Patient info box
    const boxY = 95;
    this.drawBox(this.marginLeft, boxY, this.contentWidth, 50, { r: 250, g: 250, b: 250 });

    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.preparedFor, this.marginLeft + 10, boxY + 12);

    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    let infoY = boxY + 22;

    if (patientInfo?.name) {
      this.pdf.text(`${this.t.name}: ${patientInfo.name}`, this.marginLeft + 10, infoY);
      infoY += 7;
    }

    if (patientInfo?.age) {
      this.pdf.text(`${this.t.age}: ${patientInfo.age} ${this.t.years}`, this.marginLeft + 10, infoY);
      infoY += 7;
    }

    if (patientInfo?.skinType) {
      this.pdf.text(
        `${this.t.skinType}: ${patientInfo.skinType}`,
        this.marginLeft + 10,
        infoY
      );
    }

    // Date and ID
    const dateY = boxY + 40;
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      `${this.t.date}: ${new Date().toLocaleDateString(this.locale === 'th' ? 'th-TH' : 'en-US')}`,
      this.marginLeft + 10,
      dateY
    );
    this.pdf.text(
      `${this.t.proposalId}: ${analysis.id.substring(0, 8).toUpperCase()}`,
      this.pageWidth - this.marginRight - 10,
      dateY,
      { align: 'right' }
    );

    // Overall score - large display
    const scoreY = 160;
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.overallScore, this.pageWidth / 2, scoreY, { align: 'center' });

    // Score circle
    const circleY = scoreY + 25;
    this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    this.pdf.circle(this.pageWidth / 2, circleY, 25, 'F');

    this.pdf.setFontSize(36);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text(
      analysis.percentiles.overall.toString(),
      this.pageWidth / 2,
      circleY + 5,
      { align: 'center' }
    );

    this.pdf.setFontSize(10);
    this.pdf.text('/100', this.pageWidth / 2, circleY + 15, { align: 'center' });

    // Confidence
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      `${this.t.confidence}: ${Math.round(analysis.confidence * 100)}%`,
      this.pageWidth / 2,
      circleY + 35,
      { align: 'center' }
    );

    // Footer info
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    const footerY = this.pageHeight - 40;
    this.pdf.text(this.t.validUntil, this.pageWidth / 2, footerY, { align: 'center' });

    // Contact info
    const contactY = footerY + 10;
    this.pdf.setFontSize(9);
    if (clinicInfo.phone) {
      this.pdf.text(`${this.t.phone}: ${clinicInfo.phone}`, this.pageWidth / 2, contactY, {
        align: 'center',
      });
    }
    if (clinicInfo.email) {
      this.pdf.text(`${this.t.email}: ${clinicInfo.email}`, this.pageWidth / 2, contactY + 5, {
        align: 'center',
      });
    }
    if (clinicInfo.website) {
      this.pdf.text(clinicInfo.website, this.pageWidth / 2, contactY + 10, { align: 'center' });
    }
  }

  private addAnalysisPage(analysis: HybridSkinAnalysis, clinicInfo: PresentationPDFOptions['clinicInfo']) {
    this.addNewPage();
    this.addHeader(clinicInfo);

    const startY = this.marginTop + 30;

    // Title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.analysisResults, this.marginLeft, startY);

    // Detailed concerns
    let y = startY + 15;
    const concerns = [
      { key: 'spots', value: analysis.overallScore.spots, percentile: analysis.percentiles.spots },
      { key: 'pores', value: analysis.overallScore.pores, percentile: analysis.percentiles.pores },
      { key: 'wrinkles', value: analysis.overallScore.wrinkles, percentile: analysis.percentiles.wrinkles },
      { key: 'texture', value: analysis.overallScore.texture, percentile: analysis.percentiles.texture },
      { key: 'redness', value: analysis.overallScore.redness, percentile: analysis.percentiles.redness },
    ];

    concerns.forEach((concern) => {
      // Concern name
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(
        this.t[concern.key as keyof typeof this.t] as string,
        this.marginLeft,
        y
      );

      // Severity level
      const level =
        concern.value >= 7
          ? this.t.high
          : concern.value >= 4
          ? this.t.medium
          : this.t.low;
      const color =
        concern.value >= 7
          ? { r: 239, g: 68, b: 68 }
          : concern.value >= 4
          ? { r: 234, g: 179, b: 8 }
          : { r: 34, g: 197, b: 94 };

      this.pdf.setFontSize(10);
      this.pdf.setTextColor(color.r, color.g, color.b);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(level, this.marginLeft + 60, y);

      // Score bar
      const barX = this.marginLeft + 80;
      const barWidth = 80;
      const barHeight = 5;

      // Background bar
      this.pdf.setFillColor(230, 230, 230);
      this.pdf.rect(barX, y - 3, barWidth, barHeight, 'F');

      // Fill bar
      const fillWidth = (concern.value / 10) * barWidth;
      this.pdf.setFillColor(color.r, color.g, color.b);
      this.pdf.rect(barX, y - 3, fillWidth, barHeight, 'F');

      // Score text
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${concern.value.toFixed(1)}/10`, barX + barWidth + 5, y);

      // Percentile
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(
        `${concern.percentile}${this.locale === 'th' ? '' : 'th'} ${this.t.percentile}`,
        barX + barWidth + 25,
        y
      );

      y += 12;
    });

    // Add photo if available
    if (analysis.imageUrl && y + 60 < this.pageHeight - this.marginBottom) {
      try {
        y += 10;
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(0, 0, 0);
        this.pdf.text(
          this.locale === 'th' ? 'ภาพถ่ายผิว' : 'Skin Photo',
          this.marginLeft,
          y
        );
        y += 5;

        // Add image
        this.pdf.addImage(analysis.imageUrl, 'JPEG', this.marginLeft, y, 80, 60);
      } catch (error) {
        console.warn('Failed to add analysis image:', error);
      }
    }
  }

  private addTreatmentPackagesPage(
    packages: TreatmentPackage[],
    clinicInfo: PresentationPDFOptions['clinicInfo'],
    showDiscounts: boolean = true
  ) {
    this.addNewPage();
    this.addHeader(clinicInfo);

    const startY = this.marginTop + 30;

    // Title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.treatmentPackages, this.marginLeft, startY);

    let y = startY + 15;

    packages.forEach((pkg, index) => {
      // Check if we need a new page
      if (y + 70 > this.pageHeight - this.marginBottom) {
        this.addNewPage();
        this.addHeader(clinicInfo);
        y = this.marginTop + 30;
      }

      const boxHeight = 65;
      const rgb = this.hexToRgb(this.brandColor);

      // Package box
      this.drawBox(this.marginLeft, y, this.contentWidth, boxHeight, {
        r: 250,
        g: 250,
        b: 250,
      });

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
      this.pdf.setFontSize(14);
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(pkg.name[this.locale], this.marginLeft + 5, y + 18);

      // Price
      this.pdf.setFontSize(18);
      this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      const priceText = `${this.t.baht} ${pkg.price.toLocaleString()}`;
      this.pdf.text(priceText, this.pageWidth - this.marginRight - 5, y + 18, {
        align: 'right',
      });

      // Original price (if discount)
      if (showDiscounts && pkg.discount && pkg.originalPrice) {
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(150, 150, 150);
        this.pdf.setFont('helvetica', 'normal');
        const originalText = `${this.t.baht} ${pkg.originalPrice.toLocaleString()}`;
        this.pdf.text(originalText, this.pageWidth - this.marginRight - 5, y + 12, {
          align: 'right',
        });
        // Strike-through line
        const textWidth = this.pdf.getTextWidth(originalText);
        this.pdf.line(
          this.pageWidth - this.marginRight - 5 - textWidth,
          y + 11,
          this.pageWidth - this.marginRight - 5,
          y + 11
        );
      }

      // Details
      let detailY = y + 28;
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(80, 80, 80);
      this.pdf.setFont('helvetica', 'normal');

      // Treatments list
      pkg.treatments.forEach((treatment) => {
        if (detailY < y + boxHeight - 5) {
          const text = `• ${treatment.name[this.locale]} (${treatment.sessions} ${this.t.session})`;
          this.pdf.text(text, this.marginLeft + 5, detailY);
          detailY += 5;
        }
      });

      // Key metrics
      const metricsY = y + boxHeight - 8;
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');

      const metrics = [
        `${this.t.duration}: ${pkg.duration.weeks} ${this.t.weeks}`,
        `${this.t.sessions}: ${pkg.sessions}`,
        `${this.t.improvement}: +${pkg.improvement}%`,
      ];

      let metricX = this.marginLeft + 5;
      metrics.forEach((metric) => {
        this.pdf.text(metric, metricX, metricsY);
        metricX += 50;
      });

      y += boxHeight + 10;
    });
  }

  private addTimelinePage(
    packages: TreatmentPackage[],
    clinicInfo: PresentationPDFOptions['clinicInfo']
  ) {
    this.addNewPage();
    this.addHeader(clinicInfo);

    const startY = this.marginTop + 30;

    // Title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.treatmentPlan, this.marginLeft, startY);

    let y = startY + 15;

    packages.forEach((pkg, pkgIdx) => {
      if (y + 50 > this.pageHeight - this.marginBottom) {
        this.addNewPage();
        this.addHeader(clinicInfo);
        y = this.marginTop + 30;
      }

      const rgb = this.hexToRgb(this.brandColor);

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
        `${pkg.duration.months} ${this.t.months} ${this.locale === 'th' ? 'แผน' : 'plan'}`,
        this.marginLeft + 12,
        y + 6
      );

      y += 12;

      // Treatment list
      pkg.treatments.forEach((treatment, idx) => {
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(0, 0, 0);

        // Circle bullet
        this.pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
        this.pdf.circle(this.marginLeft + 15, y - 1, 2, 'S');

        this.pdf.text(
          `${treatment.name[this.locale]} - ${treatment.sessions} ${this.t.session}`,
          this.marginLeft + 20,
          y
        );

        y += 6;
      });

      // Expected results
      this.pdf.setFillColor(220, 252, 231); // Light green
      this.pdf.roundedRect(this.marginLeft + 12, y, this.contentWidth - 12, 8, 2, 2, 'F');

      this.pdf.setFontSize(9);
      this.pdf.setTextColor(22, 163, 74); // Green
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(
        `${this.locale === 'th' ? 'ผลลัพธ์ที่คาดหวัง' : 'Expected Results'}: +${pkg.improvement}% ${this.t.improvement}`,
        this.marginLeft + 15,
        y + 5
      );

      y += 15;
    });

    // Next steps section
    if (y + 40 < this.pageHeight - this.marginBottom) {
      y += 10;
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(this.t.nextSteps, this.marginLeft, y);

      y += 10;
      const steps = [this.t.stepOne, this.t.stepTwo, this.t.stepThree];

      steps.forEach((step, idx) => {
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(`${idx + 1}. ${step}`, this.marginLeft + 5, y);
        y += 8;
      });
    }
  }

  private addContactPage(clinicInfo: PresentationPDFOptions['clinicInfo']) {
    this.addNewPage();

    const rgb = this.hexToRgb(this.brandColor);

    // Brand header
    this.pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    this.pdf.rect(0, 0, this.pageWidth, 60, 'F');

    if (clinicInfo.logo) {
      try {
        this.pdf.addImage(clinicInfo.logo, 'PNG', this.pageWidth / 2 - 15, 10, 30, 30);
      } catch (error) {
        console.warn('Failed to add logo:', error);
      }
    }

    this.pdf.setFontSize(20);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.t.contactUs, this.pageWidth / 2, 50, { align: 'center' });

    // Contact details
    let y = 80;
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');

    const clinicName =
      this.locale === 'th' && clinicInfo.nameTh ? clinicInfo.nameTh : clinicInfo.name;
    this.pdf.text(clinicName, this.marginLeft, y);
    y += 15;

    if (clinicInfo.phone) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${this.t.phone}:`, this.marginLeft, y);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(clinicInfo.phone, this.marginLeft + 30, y);
      y += 10;
    }

    if (clinicInfo.email) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${this.t.email}:`, this.marginLeft, y);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(clinicInfo.email, this.marginLeft + 30, y);
      y += 10;
    }

    if (clinicInfo.website) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${this.t.website}:`, this.marginLeft, y);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(clinicInfo.website, this.marginLeft + 30, y);
      y += 10;
    }

    const address =
      this.locale === 'th' && clinicInfo.addressTh ? clinicInfo.addressTh : clinicInfo.address;
    if (address) {
      y += 5;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${this.t.address}:`, this.marginLeft, y);
      y += 8;
      this.pdf.setFont('helvetica', 'normal');
      const lines = this.pdf.splitTextToSize(address, this.contentWidth - 10);
      this.pdf.text(lines, this.marginLeft, y);
      y += lines.length * 6;
    }

    // Disclaimer
    y = this.pageHeight - 50;
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(100, 100, 100);
    const disclaimerLines = this.pdf.splitTextToSize(this.t.disclaimer, this.contentWidth);
    this.pdf.text(disclaimerLines, this.pageWidth / 2, y, { align: 'center' });
  }

  public async generate(
    analysis: HybridSkinAnalysis,
    options: PresentationPDFOptions,
    filename: string = 'treatment-proposal.pdf'
  ): Promise<void> {
    // Calculate total pages (approximate)
    this.totalPages = 2; // Cover + Analysis
    if (options.treatmentPackages && options.treatmentPackages.length > 0) {
      this.totalPages += 1; // Packages page
      if (options.includeTimeline) {
        this.totalPages += 1; // Timeline page
      }
    }
    this.totalPages += 1; // Contact page

    // Generate pages
    this.addCoverPage(analysis, options.patientInfo, options.clinicInfo);
    this.addAnalysisPage(analysis, options.clinicInfo);

    if (options.treatmentPackages && options.treatmentPackages.length > 0) {
      this.addTreatmentPackagesPage(
        options.treatmentPackages,
        options.clinicInfo,
        options.showDiscounts
      );

      if (options.includeTimeline) {
        this.addTimelinePage(options.treatmentPackages, options.clinicInfo);
      }
    }

    this.addContactPage(options.clinicInfo);

    // Add footers to all pages
    const pageCount = this.pdf.internal.pages.length - 1; // Subtract 1 for the initial page
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.currentPage = i;
      this.addFooter();
    }

    // Save
    this.pdf.save(filename);
  }
}

// Convenience function
export async function exportPresentationToPDF(
  analysis: HybridSkinAnalysis,
  options: PresentationPDFOptions,
  filename?: string
): Promise<void> {
  const exporter = new PresentationPDFExporter(options);
  await exporter.generate(
    analysis,
    options,
    filename || `treatment-proposal-${Date.now()}.pdf`
  );
}
