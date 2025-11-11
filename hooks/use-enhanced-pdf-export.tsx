/**
 * Enhanced PDF Export Hook
 * React hook for generating and downloading enhanced PDF reports
 */

'use client';

import { useState, useCallback } from 'react';
import { exportEnhancedPDF, type EnhancedPDFOptions } from '@/lib/presentation/enhanced-pdf-exporter';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

export interface UseEnhancedPDFExportOptions {
  locale?: 'th' | 'en';
  autoDownload?: boolean;
}

export interface PDFExportResult {
  blob: Blob;
  url: string;
  filename: string;
}

export function useEnhancedPDFExport(options: UseEnhancedPDFExportOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const generatePDF = useCallback(
    async (
      analysis: HybridSkinAnalysis,
      pdfOptions: EnhancedPDFOptions
    ): Promise<PDFExportResult | null> => {
      setIsGenerating(true);
      setError(null);
      setProgress(0);

      try {
        // Prepare options with defaults
        const finalOptions: EnhancedPDFOptions = {
          locale: options.locale || 'en',
          ...pdfOptions,
        };

        setProgress(20);

        // Generate PDF
        const blob = await exportEnhancedPDF(analysis, finalOptions);

        setProgress(80);

        // Create download URL
        const url = URL.createObjectURL(blob);
        const filename = `skin-analysis-${analysis.id.substring(0, 8)}-${Date.now()}.pdf`;

        setProgress(100);

        // Auto-download if enabled
        if (options.autoDownload !== false) {
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        return { blob, url, filename };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate PDF');
        setError(error);
        console.error('PDF generation error:', error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [options.locale, options.autoDownload]
  );

  const generateFromAPI = useCallback(
    async (
      analysisId: string,
      previousAnalysisId?: string,
      includeComparison: boolean = false,
      includeProgressCharts: boolean = false
    ): Promise<PDFExportResult | null> => {
      setIsGenerating(true);
      setError(null);
      setProgress(0);

      try {
        // Fetch PDF data from API
        setProgress(10);

        const response = await fetch('/api/pdf/enhanced-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisId,
            previousAnalysisId,
            includeComparison,
            includeProgressCharts,
            locale: options.locale,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch PDF data');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to prepare PDF data');
        }

        setProgress(30);

        // Generate PDF with fetched data
        const blob = await exportEnhancedPDF(data.analysis, data.pdfOptions);

        setProgress(80);

        // Create download URL
        const url = URL.createObjectURL(blob);
        const filename = `skin-analysis-${analysisId.substring(0, 8)}-${Date.now()}.pdf`;

        setProgress(100);

        // Auto-download if enabled
        if (options.autoDownload !== false) {
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        return { blob, url, filename };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate PDF');
        setError(error);
        console.error('PDF generation error:', error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [options.locale, options.autoDownload]
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setProgress(0);
  }, []);

  return {
    generatePDF,
    generateFromAPI,
    isGenerating,
    error,
    progress,
    reset,
  };
}

// Example usage component
export function PDFExportButton({
  analysisId,
  previousAnalysisId,
  includeComparison = false,
  includeProgressCharts = false,
  locale = 'en',
  className,
  children,
}: {
  analysisId: string;
  previousAnalysisId?: string;
  includeComparison?: boolean;
  includeProgressCharts?: boolean;
  locale?: 'th' | 'en';
  className?: string;
  children?: React.ReactNode;
}) {
  const { generateFromAPI, isGenerating, error, progress } = useEnhancedPDFExport({ locale });

  const handleExport = async () => {
    await generateFromAPI(analysisId, previousAnalysisId, includeComparison, includeProgressCharts);
  };

  return (
    <div className={className}>
      <button
        onClick={handleExport}
        disabled={isGenerating}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{locale === 'th' ? 'กำลังสร้าง' : 'Generating'}... {progress}%</span>
          </span>
        ) : (
          children || (locale === 'th' ? 'ดาวน์โหลด PDF' : 'Download PDF')
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {locale === 'th' ? 'เกิดข้อผิดพลาด: ' : 'Error: '}
          {error.message}
        </p>
      )}
    </div>
  );
}
