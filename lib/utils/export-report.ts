/**
 * Export & Print Utilities
 * Generate PDF reports and share analysis results
 */

import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'json';
  includeImages?: boolean;
  includeRecommendations?: boolean;
  includeTechnicalDetails?: boolean;
  quality?: number; // 1-100 for images
}

export interface PatientInfo {
  name?: string;
  age?: number;
  gender?: string;
  skinType?: string;
  email?: string;
}

export interface ClinicInfo {
  name?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Export analysis report to PDF
 */
export async function exportToPDF(
  analysis: HybridSkinAnalysis,
  options: {
    patientInfo?: PatientInfo;
    clinicInfo?: ClinicInfo;
    imageUrl?: string;
  } = {}
): Promise<Blob> {
  // Generate HTML content for PDF
  const htmlContent = generateReportHTML(analysis, options);

  // Use browser's print dialog with PDF option
  // In production, use a library like jsPDF or pdfmake
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // For now, trigger print dialog
  // In production, generate actual PDF blob
  printWindow.print();

  // Return placeholder blob
  return new Blob([htmlContent], { type: 'text/html' });
}

/**
 * Export analysis to PNG image
 */
export async function exportToPNG(
  elementId: string,
  _filename: string = 'skin-analysis-report.png',
  quality: number = 0.95
): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Use html2canvas or similar library in production
  // For now, return placeholder
  const canvas = document.createElement('canvas');
  canvas.width = element.offsetWidth;
  canvas.height = element.offsetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw element to canvas (simplified)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('Failed to create blob');
        }
      },
      'image/png',
      quality
    );
  });
}

/**
 * Export analysis data to JSON
 */
export function exportToJSON(
  analysis: HybridSkinAnalysis,
  options: {
    patientInfo?: PatientInfo;
    metadata?: Record<string, unknown>;
  } = {}
): Blob {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    analysis,
    ...options,
  };

  const json = JSON.stringify(data, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share analysis via Web Share API
 */
export async function shareAnalysis(
  analysis: HybridSkinAnalysis,
  options: {
    title?: string;
    text?: string;
    imageBlob?: Blob;
  } = {}
): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  const shareData: ShareData = {
    title: options.title || 'Skin Analysis Report',
    text:
      options.text ||
      `Skin Health Score: ${analysis.overallScore}/100\nGenerated on ${new Date(
        analysis.timestamp
      ).toLocaleDateString()}`,
  };

  if (options.imageBlob) {
    const file = new File([options.imageBlob], 'skin-analysis.png', {
      type: 'image/png',
    });
    shareData.files = [file];
  }

  await navigator.share(shareData);
}

/**
 * Send analysis report via email
 */
export async function emailReport(
  analysis: HybridSkinAnalysis,
  options: {
    to: string;
    subject?: string;
    patientInfo?: PatientInfo;
    clinicInfo?: ClinicInfo;
  }
): Promise<Response> {
  const subject =
    options.subject ||
    `Skin Analysis Report - ${new Date(analysis.timestamp).toLocaleDateString()}`;

  const emailBody = generateEmailBody(analysis, options);

  // Call API to send email
  const response = await fetch('/api/email/send-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: options.to,
      subject,
      html: emailBody,
      analysis,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return response;
}

/**
 * Generate print-optimized HTML
 */
function generateReportHTML(
  analysis: HybridSkinAnalysis,
  options: {
    patientInfo?: PatientInfo;
    clinicInfo?: ClinicInfo;
    imageUrl?: string;
  }
): string {
  const date = new Date(analysis.timestamp);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Skin Analysis Report</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    .clinic-logo {
      max-height: 60px;
      margin-bottom: 10px;
    }
    .score-box {
      text-align: center;
      padding: 30px;
      background: #f5f5f5;
      margin: 20px 0;
      border-radius: 8px;
    }
    .score-number {
      font-size: 72px;
      font-weight: bold;
      color: #2563eb;
    }
    .parameters {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .param-card {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .param-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #555;
    }
    .param-value {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .recommendations {
      margin-top: 30px;
      page-break-before: auto;
    }
    .recommendation-item {
      padding: 10px;
      margin: 10px 0;
      background: #f9f9f9;
      border-left: 4px solid #2563eb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    ${options.clinicInfo?.logo ? `<img src="${options.clinicInfo.logo}" alt="Logo" class="clinic-logo">` : ''}
    <h1>${options.clinicInfo?.name || 'Skin Analysis Report'}</h1>
    ${options.clinicInfo?.address ? `<p>${options.clinicInfo.address}</p>` : ''}
    <p>Report Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
  </div>

  ${
    options.patientInfo
      ? `
  <div style="margin-bottom: 20px;">
    <h3>Patient Information</h3>
    ${options.patientInfo.name ? `<p><strong>Name:</strong> ${options.patientInfo.name}</p>` : ''}
    ${options.patientInfo.age ? `<p><strong>Age:</strong> ${options.patientInfo.age} years</p>` : ''}
    ${options.patientInfo.skinType ? `<p><strong>Skin Type:</strong> ${options.patientInfo.skinType}</p>` : ''}
  </div>
  `
      : ''
  }

  <div class="score-box">
    <div class="score-number">${analysis.overallScore}</div>
    <div style="font-size: 20px; color: #666;">Skin Health Score</div>
    <div style="margin-top: 10px; color: #888;">Confidence: ${analysis.confidence}%</div>
  </div>

  <h2>Detailed Analysis</h2>
  <div class="parameters">
    <div class="param-card">
      <div class="param-title">Spots</div>
      <div class="param-value">${analysis.percentiles.spots}th</div>
      <div>Severity: ${analysis.cv.spots.severity}/10</div>
      <div>Count: ${analysis.cv.spots.count}</div>
    </div>
    <div class="param-card">
      <div class="param-title">Pores</div>
      <div class="param-value">${analysis.percentiles.pores}th</div>
      <div>Severity: ${analysis.cv.pores.severity}/10</div>
      <div>Enlarged: ${analysis.cv.pores.enlargedCount}</div>
    </div>
    <div class="param-card">
      <div class="param-title">Wrinkles</div>
      <div class="param-value">${analysis.percentiles.wrinkles}th</div>
      <div>Severity: ${analysis.cv.wrinkles.severity}/10</div>
      <div>Count: ${analysis.cv.wrinkles.count}</div>
    </div>
    <div class="param-card">
      <div class="param-title">Texture</div>
      <div class="param-value">${analysis.percentiles.texture}th</div>
      <div>Score: ${analysis.cv.texture.score}/10</div>
    </div>
    <div class="param-card">
      <div class="param-title">Redness</div>
      <div class="param-value">${analysis.percentiles.redness}th</div>
      <div>Severity: ${analysis.cv.redness.severity}/10</div>
      <div>Percentage: ${analysis.cv.redness.percentage}%</div>
    </div>
    <div class="param-card">
      <div class="param-title">Overall</div>
      <div class="param-value">${analysis.percentiles.overall}th</div>
      <div>Percentile Ranking</div>
    </div>
  </div>

  <div class="recommendations">
    <h2>Personalized Recommendations</h2>
    ${analysis.recommendations
      .map(
        (rec, index) => `
      <div class="recommendation-item">
        <strong>${index + 1}.</strong> ${rec}
      </div>
    `
      )
      .join('')}
  </div>

  <div class="footer">
    <p>This report was generated using AI-powered skin analysis technology.</p>
    <p>Results should be reviewed by a qualified skincare professional.</p>
    <p>Report ID: ${analysis.timestamp.getTime()}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate email body HTML
 */
function generateEmailBody(
  analysis: HybridSkinAnalysis,
  options: {
    patientInfo?: PatientInfo;
    clinicInfo?: ClinicInfo;
  }
): string {
  // Simplified email template
  return generateReportHTML(analysis, options);
}

/**
 * Print report directly
 */
export function printReport(elementId: string = 'visia-report'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Clone element for printing
  const printContent = element.cloneNode(true) as HTMLElement;

  // Create print window
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  // Copy styles
  const styles = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Report</title>
      <style>
        ${styles}
        @media print {
          body { margin: 0; padding: 20px; }
          .print\\:hidden { display: none !important; }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Delay print to ensure content is rendered
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
