/**
 * Progress Report Generator
 * 
 * Generate PDF reports for doctor consultations
 */

import jsPDF from 'jspdf';
import { ProgressReport } from '@/types/progress';
import { formatTimeElapsed } from './metric-calculator';

/**
 * Generate PDF report
 */
export async function generateProgressReport(
  report: ProgressReport,
  userName: string
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.text('รายงานการติดตามผลการรักษา', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`ผู้ป่วย: ${userName}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  doc.setFontSize(10);
  doc.text(
    `วันที่สร้างรายงาน: ${new Date(report.generated_at).toLocaleDateString('th-TH')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 15;

  // Summary Section
  doc.setFontSize(14);
  doc.text('สรุปผลการรักษา', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const summaryLines = [
    `จำนวนครั้งที่เข้ารับบริการ: ${report.total_sessions} ครั้ง`,
    `ระยะเวลาการรักษา: ${formatTimeElapsed(report.treatment_duration_days)}`,
    `การปรับปรุงโดยรวม: ${report.overall_improvement.toFixed(1)}%`,
  ];

  summaryLines.forEach((line) => {
    doc.text(line, 20, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Metrics Comparison
  if (report.baseline_photo && report.latest_photo) {
    doc.setFontSize(14);
    doc.text('ผลการเปลี่ยนแปลง', 20, yPos);
    yPos += 8;

    const baselineMetrics = report.baseline_photo.analysis_results || {};
    const latestMetrics = report.latest_photo.analysis_results || {};

    const metrics = [
      { label: 'ฝ้า-กระ', key: 'spots' as const },
      { label: 'รูขุมขน', key: 'pores' as const },
      { label: 'ริ้วรอย', key: 'wrinkles' as const },
      { label: 'ความแดง', key: 'redness' as const },
    ];

    doc.setFontSize(10);
    metrics.forEach(({ label, key }) => {
      const before = baselineMetrics[key] || 0;
      const after = latestMetrics[key] || 0;
      const change = before !== 0 ? ((before - after) / before) * 100 : 0;
      const arrow = change > 0 ? '↓' : change < 0 ? '↑' : '→';

      doc.text(
        `${label}: ${before} → ${after} (${arrow} ${Math.abs(change).toFixed(1)}%)`,
        20,
        yPos
      );
      yPos += 6;
    });
  }

  yPos += 5;

  // Photos Section
  if (report.baseline_photo && report.latest_photo) {
    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('ภาพเปรียบเทียบ', 20, yPos);
    yPos += 8;

    const imgWidth = (pageWidth - 50) / 2;
    const imgHeight = imgWidth * 0.75; // 4:3 aspect ratio

    try {
      // Before photo
      const beforeImg = await loadImageAsBase64(report.baseline_photo.image_url);
      doc.addImage(beforeImg, 'JPEG', 20, yPos, imgWidth, imgHeight);
      doc.setFontSize(10);
      doc.text(
        `ก่อน (${new Date(report.baseline_photo.taken_at).toLocaleDateString('th-TH')})`,
        20,
        yPos + imgHeight + 5
      );

      // After photo
      const afterImg = await loadImageAsBase64(report.latest_photo.image_url);
      doc.addImage(afterImg, 'JPEG', 30 + imgWidth, yPos, imgWidth, imgHeight);
      doc.text(
        `หลัง (${new Date(report.latest_photo.taken_at).toLocaleDateString('th-TH')})`,
        30 + imgWidth,
        yPos + imgHeight + 5
      );

      yPos += imgHeight + 15;
    } catch (error) {
      console.error('Failed to load images:', error);
      doc.text('ไม่สามารถโหลดภาพได้', 20, yPos);
      yPos += 10;
    }
  }

  // Timeline Section
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text('เส้นเวลาการรักษา', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  report.timeline.slice(0, 10).forEach((entry) => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }

    const date = new Date(entry.date).toLocaleDateString('th-TH');
    if (entry.type === 'photo' && entry.photo) {
      const photoType =
        entry.photo.photo_type === 'baseline'
          ? 'พื้นฐาน'
          : entry.photo.photo_type === 'final'
            ? 'สุดท้าย'
            : `ติดตามผล #${entry.photo.session_number}`;
      doc.text(`${date} - ถ่ายภาพ${photoType}`, 25, yPos);
    } else if (entry.type === 'session' && entry.session) {
      doc.text(`${date} - รับบริการครั้งที่ ${entry.session.session_number}`, 25, yPos);
    } else if (entry.type === 'milestone' && entry.milestone) {
      doc.text(`${date} - ${entry.milestone.title}`, 25, yPos);
    }
    yPos += 6;
  });

  yPos += 5;

  // Milestones Section
  if (report.milestones.length > 0) {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('ความสำเร็จ', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    report.milestones.slice(0, 5).forEach((milestone) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      const date = milestone.achieved_at
        ? new Date(milestone.achieved_at).toLocaleDateString('th-TH')
        : 'รอบรรลุ';
      doc.text(`✓ ${milestone.title} - ${date}`, 25, yPos);
      yPos += 6;
    });
  }

  // Footer
  doc.setFontSize(8);
  const footerText = 'รายงานนี้สร้างโดยระบบ AI Skin Analysis';
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Generate blob
  return doc.output('blob');
}

/**
 * Load image as base64
 */
async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Download report as PDF
 */
export async function downloadProgressReport(
  report: ProgressReport,
  userName: string
): Promise<void> {
  const blob = await generateProgressReport(report, userName);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `progress-report-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
