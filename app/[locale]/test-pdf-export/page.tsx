'use client';

/**
 * PDF Export Test Page
 * Demo page to test the new professional PDF export functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadAnalysisPDF } from '@/lib/utils/pdf-export';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import { FileDown, Loader2 } from 'lucide-react';

export default function TestPDFExportPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [locale, setLocale] = useState<'en' | 'th'>('en');

  // Mock analysis data for testing
  const mockAnalysis: HybridSkinAnalysis = {
    id: 'mock-analysis-001',
    userId: 'test-user-001',
    createdAt: new Date(),
    timestamp: new Date(),
    imageUrl: 'https://images.placeholderhub.com/skin-analysis.jpg',
    aiProvider: 'gemini',
    ai: {
      skinType: 'combination',
      concerns: ['spots', 'wrinkles', 'large_pores'],
      severity: {
        acne: 3,
        wrinkles: 7,
        dark_spots: 6,
        large_pores: 5,
        redness: 4,
        dullness: 5,
        fine_lines: 6,
        blackheads: 2,
        hyperpigmentation: 5,
        spots: 6,
        pores: 5,
        texture: 4,
      },
      recommendations: [
        {
          category: 'serum',
          product: 'Vitamin C Brightening Serum',
          reason: 'Helps reduce pigmentation and brighten overall complexion.',
        },
        {
          category: 'treatment',
          product: 'Professional Chemical Peel',
          reason: 'Targets uneven texture and persistent dark spots.',
        },
        {
          category: 'sunscreen',
          product: 'Broad-Spectrum SPF 50+',
          reason: 'Protects against UV-induced hyperpigmentation and aging.',
        },
      ],
      treatmentPlan: 'Combine at-home care with monthly clinical treatments for best results.',
      confidence: 0.92,
    },
    cv: {
      spots: {
        count: 127,
        severity: 6.5,
        locations: [],
      },
      pores: {
        averageSize: 2.3,
        enlargedCount: 45,
        severity: 5.8,
      },
      wrinkles: {
        count: 89,
        severity: 7.2,
        locations: [],
      },
      texture: {
        smoothness: 6.2,
        roughness: 3.8,
        score: 6.8,
      },
      redness: {
        percentage: 12.5,
        severity: 4.5,
        areas: [],
      },
    },
    overallScore: {
      spots: 6,
      pores: 5,
      wrinkles: 7,
      texture: 6,
      redness: 4,
      pigmentation: 5,
    },
    percentiles: {
      spots: 65,
      pores: 58,
      wrinkles: 72,
      texture: 68,
      redness: 45,
      overall: 67,
    },
    confidence: 92,
    recommendations: [
      'Daily vitamin C serum application',
      'Weekly retinol treatment',
      'Bi-weekly chemical peel sessions',
      'Daily broad-spectrum SPF 50+ sunscreen',
      'Monthly professional facial treatment',
    ],
    annotatedImages: {},
  };

  const handleGeneratePDF = async (lang: 'en' | 'th') => {
    setIsGenerating(true);
    setLocale(lang);

    try {
      await downloadAnalysisPDF(
        mockAnalysis,
        {
          locale: lang,
          patientInfo: {
            name: lang === 'th' ? 'คุณสมชาย ใจดี' : 'John Smith',
            age: 32,
            gender: lang === 'th' ? 'ชาย' : 'Male',
            skinType: lang === 'th' ? 'ผิวผสม' : 'Combination',
            customerId: 'TEST-2024-001',
          },
          clinicInfo: {
            name: 'AI367 Skin Clinic',
            nameTh: 'คลินิก AI367',
            address: '123 Medical Plaza, Bangkok 10110, Thailand',
            addressTh: '123 อาคารแมดิคัล พลาซ่า กรุงเทพฯ 10110',
            phone: '+66 2 XXX XXXX',
            email: 'info@ai367clinic.com',
            website: 'www.ai367clinic.com',
            license: 'TH-MED-2024-001',
          },
          includeCharts: true,
          includePhotos: false,
          includeRecommendations: true,
          includePriorityRanking: true,
        },
        `test-skin-analysis-${lang}-${Date.now()}.pdf`
      );

      alert(`PDF generated successfully in ${lang === 'th' ? 'Thai' : 'English'}!`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF Export Test Page</h1>
        <p className="text-muted-foreground">
          Test the professional PDF export functionality with mock VISIA analysis data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>English PDF Export</CardTitle>
            <CardDescription>
              Generate a professional skin analysis report in English with clinic branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleGeneratePDF('en')}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating && locale === 'en' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download English PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thai PDF Export</CardTitle>
            <CardDescription>
              สร้างรายงานการวิเคราะห์ผิวแบบมืออาชีพเป็นภาษาไทย พร้อมตราสัญลักษณ์คลินิก
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleGeneratePDF('th')}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating && locale === 'th' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  ดาวน์โหลด PDF ภาษาไทย
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Features Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Clinic branding with logo and contact information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Patient information section</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Large overall skin health score display</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Detailed analysis cards for all parameters (Spots, Pores, Wrinkles, Texture, Redness)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Color-coded severity indicators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Percentile rankings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Professional disclaimer and confidentiality notice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Page numbering and report ID</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Bilingual support (English/Thai)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Print-optimized A4 layout</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
          Test Data Information
        </h3>
        <p className="text-sm text-muted-foreground">
          This page uses mock analysis data for testing purposes. The generated PDF will include:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
          <li>• Overall Score: 78/100 (Confidence: 92%)</li>
          <li>• Spots: 65th percentile, Severity: 6.5/10</li>
          <li>• Pores: 58th percentile, Severity: 5.8/10</li>
          <li>• Wrinkles: 72nd percentile, Severity: 7.2/10</li>
          <li>• Texture: 68th percentile, Score: 6.8/10</li>
          <li>• Redness: 45th percentile, Severity: 4.5/10</li>
        </ul>
      </div>
    </div>
  );
}
