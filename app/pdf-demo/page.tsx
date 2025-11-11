/**
 * Enhanced PDF Demo Page
 * Test and preview enhanced PDF generation
 */

'use client';

import { useState } from 'react';
import { PDFExportButton, useEnhancedPDFExport } from '@/hooks/use-enhanced-pdf-export';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import type { EnhancedPDFOptions, HistoricalAnalysisData } from '@/lib/presentation/enhanced-pdf-exporter';

// Mock data for testing
const mockAnalysis: HybridSkinAnalysis = {
  id: 'demo-analysis-001',
  userId: 'demo-user',
  imageUrl: 'https://via.placeholder.com/800x600/8b5cf6/ffffff?text=After+Analysis',
  percentiles: {
    overall: 72,
    spots: 68,
    pores: 54,
    wrinkles: 45,
    texture: 80,
    redness: 60,
  },
  overallScore: {
    spots: 7.5,
    pores: 5.2,
    wrinkles: 4.1,
    texture: 8.3,
    redness: 6.0,
  },
  scores: {
    spots: [],
    pores: [],
    wrinkles: [],
    texture: [],
    redness: [],
  },
  aiModel: 'gpt-4-vision',
  confidence: 0.94,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockPreviousAnalysis: HybridSkinAnalysis = {
  ...mockAnalysis,
  id: 'demo-analysis-000',
  imageUrl: 'https://via.placeholder.com/800x600/ef4444/ffffff?text=Before+Analysis',
  percentiles: {
    overall: 65,
    spots: 60,
    pores: 50,
    wrinkles: 40,
    texture: 75,
    redness: 55,
  },
  overallScore: {
    spots: 6.8,
    pores: 4.5,
    wrinkles: 3.5,
    texture: 7.8,
    redness: 5.2,
  },
  createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
};

const mockHistoricalData: HistoricalAnalysisData[] = [
  {
    date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    overallScore: 60,
    spots: 55,
    pores: 48,
    wrinkles: 38,
    texture: 70,
    redness: 52,
  },
  {
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    overallScore: 63,
    spots: 58,
    pores: 49,
    wrinkles: 39,
    texture: 72,
    redness: 53,
  },
  {
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    overallScore: 65,
    spots: 60,
    pores: 50,
    wrinkles: 40,
    texture: 75,
    redness: 55,
  },
  {
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    overallScore: 68,
    spots: 64,
    pores: 52,
    wrinkles: 42,
    texture: 77,
    redness: 57,
  },
];

export default function EnhancedPDFDemoPage() {
  const [locale, setLocale] = useState<'th' | 'en'>('en');
  const [includeComparison, setIncludeComparison] = useState(true);
  const [includeProgressCharts, setIncludeProgressCharts] = useState(true);
  const [theme, setTheme] = useState<'professional' | 'modern' | 'minimal'>('professional');
  const [brandColor, setBrandColor] = useState('#8b5cf6');

  const { generatePDF, isGenerating, error, progress } = useEnhancedPDFExport({
    locale,
    autoDownload: true,
  });

  const handleGeneratePDF = async () => {
    const pdfOptions: EnhancedPDFOptions = {
      locale,
      patientInfo: {
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        skinType: 'Combination',
        customerId: 'DEMO001',
      },
      clinicInfo: {
        name: 'Beauty AI Clinic',
        nameTh: 'คลินิกบิวตี้เอไอ',
        brandColor,
        address: '123 Main Street, Bangkok',
        addressTh: '123 ถนนหลัก กรุงเทพฯ',
        phone: '02-123-4567',
        email: 'info@beautyai.com',
        website: 'www.beautyai.com',
        license: 'MED-2024-001',
      },
      previousAnalysis: includeComparison ? mockPreviousAnalysis : undefined,
      comparisonMode: includeComparison,
      highlightImprovements: true,
      historicalAnalyses: includeProgressCharts ? mockHistoricalData : undefined,
      includeProgressCharts,
      theme,
    };

    await generatePDF(mockAnalysis, pdfOptions);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced PDF Export Demo
        </h1>
        <p className="text-gray-600">
          Test the new PDF generation system with before/after comparison and progress charts
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Locale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as 'th' | 'en')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Language selection"
            >
              <option value="en">English</option>
              <option value="th">ไทย (Thai)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Theme selection"
            >
              <option value="professional">Professional</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {/* Brand Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer"
                aria-label="Brand color picker"
                title="Select brand color"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="#8b5cf6"
                aria-label="Brand color hex value"
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Features
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeComparison"
                checked={includeComparison}
                onChange={(e) => setIncludeComparison(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="includeComparison" className="ml-2 text-sm text-gray-700">
                Include Before/After Comparison
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeProgressCharts"
                checked={includeProgressCharts}
                onChange={(e) => setIncludeProgressCharts(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="includeProgressCharts" className="ml-2 text-sm text-gray-700">
                Include Progress Charts
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-blue-400 mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-800">PDF Preview</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Page 1: Cover with patient info and overall score (72/100)</li>
                <li>Page 2: Detailed analysis of 5 skin concerns</li>
                {includeComparison && (
                  <li>Page 3: Before/After comparison (45 days apart)</li>
                )}
                {includeProgressCharts && (
                  <li>Page {includeComparison ? '4' : '3'}: Progress charts (4 months)</li>
                )}
                <li>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</li>
                <li>Language: {locale === 'th' ? 'Thai' : 'English'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isGenerating ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              <span>Generating PDF... {progress}%</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Generate & Download PDF
            </span>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        {!isGenerating && !error && (
          <p className="mt-4 text-sm text-gray-500">
            Click to generate and automatically download the PDF report
          </p>
        )}
      </div>

      {/* Mock Data Display */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Mock Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Current Analysis</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Overall:</dt>
                <dd className="font-medium">72/100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Spots:</dt>
                <dd className="font-medium">68/100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Pores:</dt>
                <dd className="font-medium">54/100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Wrinkles:</dt>
                <dd className="font-medium">45/100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Texture:</dt>
                <dd className="font-medium">80/100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Redness:</dt>
                <dd className="font-medium">60/100</dd>
              </div>
            </dl>
          </div>

          {includeComparison && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Previous Analysis (45 days ago)</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Overall:</dt>
                  <dd className="font-medium">
                    65/100 <span className="text-green-600">+7</span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Spots:</dt>
                  <dd className="font-medium">
                    60/100 <span className="text-green-600">+8</span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Pores:</dt>
                  <dd className="font-medium">
                    50/100 <span className="text-green-600">+4</span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Wrinkles:</dt>
                  <dd className="font-medium">
                    40/100 <span className="text-green-600">+5</span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Texture:</dt>
                  <dd className="font-medium">
                    75/100 <span className="text-green-600">+5</span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Redness:</dt>
                  <dd className="font-medium">
                    55/100 <span className="text-green-600">+5</span>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {includeProgressCharts && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Historical Data (4 months)</h3>
            <p className="text-sm text-gray-600">
              {mockHistoricalData.length} previous analyses from{' '}
              {new Date(mockHistoricalData[0].date).toLocaleDateString()} to{' '}
              {new Date(mockHistoricalData[mockHistoricalData.length - 1].date).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
