/**
 * Multi-Analysis Comparison Component
 * Compare multiple skin analyses side-by-side with detailed metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BeforeAfterSlider } from '@/components/ar/before-after-slider';
import { 
  ArrowRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AnalysisData {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
  sessionNumber: number;
  metrics: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
    overall_score: number;
  };
}

interface ComparisonMetric {
  parameter: string;
  parameterLabel: { en: string; th: string };
  values: number[];
  change: number;
  changePercent: number;
  trend: 'improving' | 'declining' | 'stable';
  timestamps: string[];
}

interface MultiAnalysisComparisonProps {
  userId: string;
  analysisIds: string[];
  locale?: 'en' | 'th';
  onClose?: () => void;
}

const TRANSLATIONS = {
  en: {
    title: 'Multi-Analysis Comparison',
    description: 'Compare multiple analyses to track your progress',
    loading: 'Loading comparison data...',
    error: 'Failed to load comparison',
    retry: 'Retry',
    sideBySide: 'Side-by-Side',
    metrics: 'Metrics',
    timeline: 'Timeline',
    improvements: 'Improvements',
    session: 'Session',
    date: 'Date',
    score: 'Score',
  parameterHeading: 'Parameter',
    change: 'Change from previous',
    overall: 'Overall Change',
    improving: 'Improving',
    declining: 'Declining',
    stable: 'Stable',
    noChange: 'No significant change',
    parameters: {
      spots: 'Dark Spots',
      pores: 'Pore Size',
      wrinkles: 'Wrinkles',
      texture: 'Skin Texture',
      redness: 'Redness',
      overall_score: 'Overall Score'
    },
    summary: {
      totalAnalyses: 'Total Analyses',
      timeSpan: 'Time Span',
      overallImprovement: 'Overall Improvement',
      improvingParams: 'Improving Parameters',
      decliningParams: 'Declining Parameters',
      stableParams: 'Stable Parameters'
    },
    days: 'days',
    close: 'Close'
  },
  th: {
    title: 'เปรียบเทียบหลายการวิเคราะห์',
    description: 'เปรียบเทียบหลายการวิเคราะห์เพื่อติดตามความคืบหน้า',
    loading: 'กำลังโหลดข้อมูลเปรียบเทียบ...',
    error: 'ไม่สามารถโหลดการเปรียบเทียบ',
    retry: 'ลองใหม่',
    sideBySide: 'เคียงข้างกัน',
    metrics: 'ตัวชี้วัด',
    timeline: 'เส้นเวลา',
    improvements: 'การปรับปรุง',
    session: 'เซสชัน',
    date: 'วันที่',
    score: 'คะแนน',
  parameterHeading: 'พารามิเตอร์',
    change: 'เปลี่ยนแปลงจากครั้งก่อน',
    overall: 'การเปลี่ยนแปลงโดยรวม',
    improving: 'ดีขึ้น',
    declining: 'แย่ลง',
    stable: 'คงที่',
    noChange: 'ไม่มีการเปลี่ยนแปลงอย่างมีนัยสำคัญ',
    parameters: {
      spots: 'จุดด่างดำ',
      pores: 'ขนาดรูขุมขน',
      wrinkles: 'ริ้วรอย',
      texture: 'พื้นผิวผิว',
      redness: 'ความแดง',
      overall_score: 'คะแนนรวม'
    },
    summary: {
      totalAnalyses: 'การวิเคราะห์ทั้งหมด',
      timeSpan: 'ช่วงเวลา',
      overallImprovement: 'การปรับปรุงโดยรวม',
      improvingParams: 'พารามิเตอร์ที่ดีขึ้น',
      decliningParams: 'พารามิเตอร์ที่แย่ลง',
      stableParams: 'พารามิเตอร์ที่คงที่'
    },
    days: 'วัน',
    close: 'ปิด'
  }
};

export function MultiAnalysisComparison({
  userId,
  analysisIds,
  locale = 'en',
  onClose
}: MultiAnalysisComparisonProps) {
  const t = TRANSLATIONS[locale];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [metrics, setMetrics] = useState<ComparisonMetric[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadComparison();
  }, [userId, analysisIds]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analysis/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, analysisIds })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load comparison');
      }

      setAnalyses(result.data.analyses);
      setMetrics(result.data.metrics);
      setSummary(result.data.summary);

    } catch (err) {
      console.error('Error loading comparison:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable') => {
    if (trend === 'improving') return 'bg-green-500 text-white';
    if (trend === 'declining') return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getTrendBadge = (trend: 'improving' | 'declining' | 'stable') => {
    return (
      <Badge className={getTrendColor(trend)}>
        {getTrendIcon(trend)}
        <span className="ml-1">{t[trend]}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">{t.loading}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-lg font-medium mb-4">{t.error}</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadComparison}>{t.retry}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                {t.close}
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Summary Statistics */}
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.summary.totalAnalyses}</p>
              <p className="text-3xl font-bold">{summary.analysisCount}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.summary.timeSpan}</p>
              <p className="text-3xl font-bold">{summary.timeSpanDays} {t.days}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.summary.overallImprovement}</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">
                  {summary.overallImprovement > 0 ? '+' : ''}{summary.overallImprovement}%
                </p>
                {getTrendBadge(
                  Math.abs(summary.overallImprovement) < 5 ? 'stable' :
                  summary.overallImprovement > 0 ? 'improving' : 'declining'
                )}
              </div>
            </div>
          </div>

          {/* Improvement Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">{t.summary.improvingParams}</p>
                <div className="flex flex-wrap gap-1">
                  {summary.improvingParameters.map((param: string) => (
                    <Badge key={param} variant="outline" className="text-xs">
                      {t.parameters[param as keyof typeof t.parameters]}
                    </Badge>
                  ))}
                  {summary.improvingParameters.length === 0 && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">{t.summary.decliningParams}</p>
                <div className="flex flex-wrap gap-1">
                  {summary.decliningParameters.map((param: string) => (
                    <Badge key={param} variant="outline" className="text-xs">
                      {t.parameters[param as keyof typeof t.parameters]}
                    </Badge>
                  ))}
                  {summary.decliningParameters.length === 0 && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Minus className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">{t.summary.stableParams}</p>
                <div className="flex flex-wrap gap-1">
                  {summary.stableParameters.map((param: string) => (
                    <Badge key={param} variant="outline" className="text-xs">
                      {t.parameters[param as keyof typeof t.parameters]}
                    </Badge>
                  ))}
                  {summary.stableParameters.length === 0 && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Tabs */}
      <Tabs defaultValue="sideBySide">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sideBySide">{t.sideBySide}</TabsTrigger>
          <TabsTrigger value="metrics">{t.metrics}</TabsTrigger>
          <TabsTrigger value="timeline">{t.timeline}</TabsTrigger>
          <TabsTrigger value="improvements">{t.improvements}</TabsTrigger>
        </TabsList>

        {/* Side-by-Side Tab */}
        <TabsContent value="sideBySide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyses.map((analysis, index) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {t.session} {analysis.sessionNumber}
                      </CardTitle>
                      <CardDescription>
                        {new Date(analysis.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    {index === 0 && (
                      <Badge variant="outline">Baseline</Badge>
                    )}
                    {index === analyses.length - 1 && (
                      <Badge className="bg-primary">Latest</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] bg-secondary rounded-lg overflow-hidden mb-4">
                    <Image
                      src={analysis.thumbnailUrl || analysis.imageUrl}
                      alt={`${t.session} ${analysis.sessionNumber}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    {Object.entries(t.parameters).map(([key, label]) => {
                      const value = analysis.metrics[key as keyof typeof analysis.metrics];
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="font-medium">{value?.toFixed(1) || '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Before/After Slider for first and last */}
          {analyses.length >= 2 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t.overall}</CardTitle>
              </CardHeader>
              <CardContent>
                <BeforeAfterSlider
                  beforeImage={analyses[0].imageUrl}
                  afterImage={analyses[analyses.length - 1].imageUrl}
                  title={`${t.session} ${analyses[0].sessionNumber} → ${t.session} ${analyses[analyses.length - 1].sessionNumber}`}
                  description={`${new Date(analyses[0].createdAt).toLocaleDateString(locale)} → ${new Date(analyses[analyses.length - 1].createdAt).toLocaleDateString(locale)}`}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">{t.parameterHeading}</th>
                      {analyses.map((a) => (
                        <th key={a.id} className="text-center py-3 px-4">
                          {t.session} {a.sessionNumber}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4">{t.change}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => (
                      <tr key={metric.parameter} className="border-b hover:bg-secondary">
                        <td className="py-3 px-4 font-medium">
                          {metric.parameterLabel[locale]}
                        </td>
                        {metric.values.map((value, index) => (
                          <td key={index} className="text-center py-3 px-4">
                            {value.toFixed(1)}
                          </td>
                        ))}
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <span className={
                              metric.trend === 'improving' ? 'text-green-600 font-medium' :
                              metric.trend === 'declining' ? 'text-red-600 font-medium' :
                              'text-gray-600'
                            }>
                              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}
                              {' '}({metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%)
                            </span>
                            {getTrendIcon(metric.trend)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                {/* Timeline items */}
                <div className="space-y-8">
                  {analyses.map((analysis, index) => (
                    <div key={analysis.id} className="relative flex items-start gap-6">
                      {/* Timeline dot */}
                      <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === analyses.length - 1 ? 'bg-green-500' :
                        'bg-gray-400'
                      }`}>
                        <span className="text-white font-bold">{analysis.sessionNumber}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {t.session} {analysis.sessionNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(analysis.createdAt).toLocaleDateString(locale, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {index === 0 && <Badge variant="outline">Baseline</Badge>}
                          {index === analyses.length - 1 && <Badge className="bg-primary">Latest</Badge>}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {Object.entries(t.parameters).slice(0, 5).map(([key, label]) => {
                            const value = analysis.metrics[key as keyof typeof analysis.metrics];
                            const prevValue = index > 0 ? analyses[index - 1].metrics[key as keyof typeof analysis.metrics] : null;
                            const change = prevValue !== null ? value - prevValue : 0;

                            return (
                              <div key={key} className="p-3 bg-secondary rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xl font-bold">{value?.toFixed(1)}</p>
                                  {index > 0 && change !== 0 && (
                                    <span className={`text-xs ${
                                      change > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {change > 0 ? '+' : ''}{change.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {metrics.map((metric) => (
                  <div key={metric.parameter} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {metric.parameterLabel[locale]}
                      </h3>
                      {getTrendBadge(metric.trend)}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Initial: {metric.values[0].toFixed(1)}</span>
                        <span>Current: {metric.values[metric.values.length - 1].toFixed(1)}</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            metric.trend === 'improving' ? 'bg-green-500' :
                            metric.trend === 'declining' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}
                          style={{
                            width: `${Math.abs(metric.changePercent)}%`,
                            maxWidth: '100%'
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)} 
                        {' '}({metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
