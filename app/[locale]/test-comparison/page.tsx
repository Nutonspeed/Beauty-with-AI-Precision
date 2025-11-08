'use client';

/**
 * Analysis Comparison Test Page
 * Demonstrates the side-by-side comparison tool with mock data
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AnalysisComparison from '@/components/analysis/analysis-comparison';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import { ArrowUpDown, CheckCircle2, Info } from 'lucide-react';

export default function TestComparisonPage() {
  const [locale, setLocale] = useState<'en' | 'th'>('en');

  // Generate mock analysis sessions with progression
  const generateMockSessions = () => {
    const baseDate = new Date('2024-01-01');

    const createMockAnalysis = (
      sessionNum: number,
      daysOffset: number,
      percentiles: any,
      cvData: any
    ): HybridSkinAnalysis => ({
      id: `analysis-${sessionNum}`,
      userId: 'test-user',
      createdAt: new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000),
      timestamp: new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000),
      imageUrl: '/placeholder-analysis.jpg',
      aiProvider: 'gemini' as const,
      overallScore: {
        spots: cvData.spots.severity,
        pores: cvData.pores.severity,
        wrinkles: cvData.wrinkles.severity,
        texture: cvData.texture.score,
        redness: cvData.redness.severity,
        pigmentation: 5,
      },
      confidence: percentiles.confidence,
      percentiles,
      cv: {
        spots: { ...cvData.spots, locations: [] },
        pores: cvData.pores,
        wrinkles: { ...cvData.wrinkles, locations: [] },
        texture: cvData.texture,
        redness: { ...cvData.redness, areas: [] },
      },
      ai: {
        skinType: 'combination' as const,
        concerns: [],
        severity: {} as any,
        confidence: percentiles.confidence,
        recommendations: [],
      },
      recommendations: [],
      annotatedImages: {},
    });

    return [
      // Session 1 - Initial baseline (worst condition)
      {
        id: 'session-1',
        date: new Date(baseDate),
        label: 'Initial Assessment',
        analysis: createMockAnalysis(
          1,
          0,
          {
            spots: 45,
            pores: 52,
            wrinkles: 58,
            texture: 50,
            redness: 48,
            overall: 51,
            confidence: 88,
          },
          {
            spots: { count: 145, severity: 7.2 },
            pores: { averageSize: 2.8, enlargedCount: 52, severity: 6.5 },
            wrinkles: { count: 98, severity: 7.8 },
            texture: { score: 5.2, smoothness: 4.8, roughness: 5.5 },
            redness: { percentage: 15.2, severity: 6 },
          }
        ),
      },
      // Session 2 - After 2 months (slight improvement)
      {
        id: 'session-2',
        date: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        label: 'After IPL Treatment',
        analysis: createMockAnalysis(
          2,
          60,
          {
            spots: 55,
            pores: 54,
            wrinkles: 60,
            texture: 53,
            redness: 52,
            overall: 55,
            confidence: 90,
          },
          {
            spots: { count: 122, severity: 6.5 },
            pores: { averageSize: 2.7, enlargedCount: 48, severity: 6.2 },
            wrinkles: { count: 95, severity: 7.5 },
            texture: { score: 5.8, smoothness: 5.5, roughness: 5 },
            redness: { percentage: 12.8, severity: 5.5 },
          }
        ),
      },
      // Session 3 - After 4 months (moderate improvement)
      {
        id: 'session-3',
        date: new Date(baseDate.getTime() + 120 * 24 * 60 * 60 * 1000),
        label: 'After Microneedling',
        analysis: createMockAnalysis(
          3,
          120,
          {
            spots: 62,
            pores: 58,
            wrinkles: 64,
            texture: 60,
            redness: 55,
            overall: 60,
            confidence: 91,
          },
          {
            spots: { count: 105, severity: 5.8 },
            pores: { averageSize: 2.5, enlargedCount: 42, severity: 5.8 },
            wrinkles: { count: 88, severity: 7 },
            texture: { score: 6.5, smoothness: 6.2, roughness: 4.2 },
            redness: { percentage: 10.5, severity: 5 },
          }
        ),
      },
      // Session 4 - After 6 months (good improvement)
      {
        id: 'session-4',
        date: new Date(baseDate.getTime() + 180 * 24 * 60 * 60 * 1000),
        label: 'Maintenance Phase',
        analysis: createMockAnalysis(
          4,
          180,
          {
            spots: 68,
            pores: 62,
            wrinkles: 68,
            texture: 65,
            redness: 58,
            overall: 64,
            confidence: 93,
          },
          {
            spots: { count: 92, severity: 5.2 },
            pores: { averageSize: 2.3, enlargedCount: 38, severity: 5.3 },
            wrinkles: { count: 82, severity: 6.5 },
            texture: { score: 7, smoothness: 6.8, roughness: 3.8 },
            redness: { percentage: 8.8, severity: 4.5 },
          }
        ),
      },
      // Session 5 - After 9 months (excellent improvement)
      {
        id: 'session-5',
        date: new Date(baseDate.getTime() + 270 * 24 * 60 * 60 * 1000),
        label: 'Current Assessment',
        analysis: createMockAnalysis(
          5,
          270,
          {
            spots: 72,
            pores: 66,
            wrinkles: 70,
            texture: 68,
            redness: 60,
            overall: 67,
            confidence: 94,
          },
          {
            spots: { count: 78, severity: 4.5 },
            pores: { averageSize: 2.1, enlargedCount: 32, severity: 4.8 },
            wrinkles: { count: 75, severity: 6 },
            texture: { score: 7.5, smoothness: 7.2, roughness: 3.2 },
            redness: { percentage: 7.2, severity: 4 },
          }
        ),
      },
    ];
  };

  const mockSessions = generateMockSessions();

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ArrowUpDown className="h-8 w-8" />
              Analysis Comparison Test
            </h1>
            <p className="text-muted-foreground mt-2">
              Demonstration of the Real-Time Skin Analysis Comparison Tool
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              onClick={() => setLocale('en')}
            >
              English
            </Button>
            <Button
              variant={locale === 'th' ? 'default' : 'outline'}
              onClick={() => setLocale('th')}
            >
              ภาษาไทย
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page demonstrates the analysis comparison tool with 5 mock sessions showing 9-month
            progression from initial assessment to current state. The tool supports comparing 2-4
            sessions at a time.
          </AlertDescription>
        </Alert>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Real-Time Skin Analysis Comparison Tool Capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Side-by-Side Session Comparison</div>
                <div className="text-sm text-muted-foreground">
                  Compare 2-4 analysis sessions simultaneously
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Parameter Change Highlighting</div>
                <div className="text-sm text-muted-foreground">
                  Visual indicators for improvements and deteriorations
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Interactive Timeline Slider</div>
                <div className="text-sm text-muted-foreground">
                  Navigate through analysis history with timeline controls
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Synchronized Zoom Controls</div>
                <div className="text-sm text-muted-foreground">
                  Zoom in/out across all comparison views (50%-200%)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Multiple View Modes</div>
                <div className="text-sm text-muted-foreground">
                  Grid view, side-by-side, and detailed table comparison
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Trend Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Visualize parameter trends over time with bar charts
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Bilingual Support</div>
                <div className="text-sm text-muted-foreground">
                  Full Thai and English language support
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Summary Statistics</div>
                <div className="text-sm text-muted-foreground">
                  Time range, overall progress, and parameter change counts
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock Data Info */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Test Data Information</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            <strong>5 Mock Sessions:</strong> 9-month progression (Jan 2024 - Sep 2024)
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Session 1:</strong> Initial Assessment - Overall Score: 62 (baseline)</li>
            <li><strong>Session 2:</strong> After IPL Treatment (60 days) - Overall Score: 68 (+6)</li>
            <li><strong>Session 3:</strong> After Microneedling (120 days) - Overall Score: 74 (+6)</li>
            <li><strong>Session 4:</strong> Maintenance Phase (180 days) - Overall Score: 78 (+4)</li>
            <li><strong>Session 5:</strong> Current Assessment (270 days) - Overall Score: 82 (+4)</li>
          </ul>
          <p className="pt-2">
            <strong>Total Improvement:</strong> +20 points (62 → 82) over 9 months
          </p>
          <p>
            <strong>Key Improvements:</strong> Spots +27, Texture +18, Pores +14, Redness +12, Wrinkles +12
          </p>
        </CardContent>
      </Card>

      {/* Comparison Component */}
      <AnalysisComparison
        sessions={mockSessions}
        locale={locale}
        maxSessions={4}
        onSelectSession={(sessionId) => {
          console.log('Selected session:', sessionId);
        }}
      />
    </div>
  );
}
