'use client';

/**
 * Customer Progress Tracking Dashboard
 * 
 * Comprehensive progress dashboard for customers showing:
 * - Before/After comparisons
 * - Timeline visualization
 * - Improvement metrics
 * - Multi-analysis comparison
 * - Trend graphs
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Share2,
  Image as ImageIcon,
  Target,
  Activity,
  AlertCircle,
} from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TrendType = 'improving' | 'stable' | 'worsening';

export interface AnalysisSnapshot {
  id: string;
  date: Date;
  analysis: HybridSkinAnalysis;
  imageUrl?: string;
  thumbnailUrl?: string;
  sessionNumber?: number;
  treatmentType?: string;
  notes?: string;
}

export interface ProgressMetrics {
  parameter: string;
  baseline: number;
  current: number;
  change: number;
  changePercent: number;
  trend: TrendType;
  goal?: number;
  progressToGoal?: number;
}

export interface TreatmentMilestone {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'baseline' | 'treatment' | 'followup' | 'achievement';
  imageUrl?: string;
  metrics?: Record<string, number>;
}

export interface ProgressDashboardProps {
  analyses: AnalysisSnapshot[];
  locale?: 'th' | 'en';
  onExport?: () => void;
  onShare?: () => void;
  onBookFollowup?: () => void;
}

// ============================================================================
// Translation Constants
// ============================================================================

const TRANSLATIONS = {
  en: {
    title: 'Progress Tracking',
    description: 'Track your skin improvement journey over time',
    overview: 'Overview',
    timeline: 'Timeline',
    comparison: 'Comparison',
    metrics: 'Metrics',
    achievements: 'Achievements',
    totalAnalyses: 'Total Analyses',
    daysSinceStart: 'Days Since Start',
    overallImprovement: 'Overall Improvement',
    activeGoals: 'Active Goals',
    improvement: 'Improvement',
    stable: 'Stable',
    worsening: 'Needs Attention',
    parameter: 'Parameter',
    baseline: 'Baseline',
    current: 'Current',
    change: 'Change',
    goal: 'Goal',
    progress: 'Progress',
    trend: 'Trend',
    selectParameter: 'Select Parameter',
    spots: 'Spots',
    pores: 'Pores',
    wrinkles: 'Wrinkles',
    texture: 'Texture',
    redness: 'Redness',
    pigmentation: 'Pigmentation',
    overall: 'Overall',
    compareAnalyses: 'Compare Analyses',
    selectBaseline: 'Select Baseline',
    selectCurrent: 'Select Current',
    viewComparison: 'View Comparison',
    improvementRate: 'Improvement Rate',
    perMonth: 'per month',
    topImprovements: 'Top Improvements',
    needsAttention: 'Needs Attention',
    exportReport: 'Export Report',
    shareProgress: 'Share Progress',
    bookFollowup: 'Book Follow-up',
    noData: 'No analysis data available',
    noDataDescription: 'Start your skin journey by taking your first analysis',
    milestone: 'Milestone',
    treatment: 'Treatment',
    followup: 'Follow-up',
    achievement: 'Achievement',
    session: 'Session',
    ago: 'ago',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    congratulations: 'Congratulations!',
    keepItUp: 'Keep up the great work!',
    stayConsistent: 'Stay consistent with your treatment plan',
  },
  th: {
    title: 'ติดตามความคืบหน้า',
    description: 'ติดตามการปรับปรุงสภาพผิวของคุณตามเวลา',
    overview: 'ภาพรวม',
    timeline: 'ไทม์ไลน์',
    comparison: 'เปรียบเทียบ',
    metrics: 'ตัวชี้วัด',
    achievements: 'ความสำเร็จ',
    totalAnalyses: 'จำนวนครั้งทั้งหมด',
    daysSinceStart: 'วันนับตั้งแต่เริ่มต้น',
    overallImprovement: 'การปรับปรุงโดยรวม',
    activeGoals: 'เป้าหมายที่ใช้งาน',
    improvement: 'ดีขึ้น',
    stable: 'คงที่',
    worsening: 'ต้องดูแล',
    parameter: 'พารามิเตอร์',
    baseline: 'พื้นฐาน',
    current: 'ปัจจุบัน',
    change: 'การเปลี่ยนแปลง',
    goal: 'เป้าหมาย',
    progress: 'ความคืบหน้า',
    trend: 'แนวโน้ม',
    selectParameter: 'เลือกพารามิเตอร์',
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'รอยแดง',
    pigmentation: 'เม็ดสีผิว',
    overall: 'โดยรวม',
    compareAnalyses: 'เปรียบเทียบการวิเคราะห์',
    selectBaseline: 'เลือกฐาน',
    selectCurrent: 'เลือกปัจจุบัน',
    viewComparison: 'ดูการเปรียบเทียบ',
    improvementRate: 'อัตราการปรับปรุง',
    perMonth: 'ต่อเดือน',
    topImprovements: 'ปรับปรุงดีสุด',
    needsAttention: 'ต้องดูแล',
    exportReport: 'ส่งออกรายงาน',
    shareProgress: 'แชร์ความคืบหน้า',
    bookFollowup: 'จองติดตามผล',
    noData: 'ไม่มีข้อมูลการวิเคราะห์',
    noDataDescription: 'เริ่มต้นเส้นทางผิวสวยด้วยการวิเคราะห์ครั้งแรก',
    milestone: 'เหตุการณ์สำคัญ',
    treatment: 'ทรีตเมนต์',
    followup: 'ติดตามผล',
    achievement: 'ความสำเร็จ',
    session: 'ครั้งที่',
    ago: 'ที่แล้ว',
    days: 'วัน',
    weeks: 'สัปดาห์',
    months: 'เดือน',
    congratulations: 'ยินดีด้วย!',
    keepItUp: 'ทำต่อไปเยี่ยมมาก!',
    stayConsistent: 'รักษาความสม่ำเสมอในแผนการรักษา',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate progress metrics from analyses
 */
function calculateProgressMetrics(
  analyses: AnalysisSnapshot[]
): ProgressMetrics[] {
  if (analyses.length < 2) return [];

  const baseline = analyses[0].analysis;
  const current = analyses.at(-1)!.analysis;

  const parameters = ['spots', 'pores', 'wrinkles', 'texture', 'redness'] as const;

  return parameters.map((param) => {
    const baselineScore = baseline.overallScore[param];
    const currentScore = current.overallScore[param];
    const change = currentScore - baselineScore;
    const changePercent = baselineScore === 0 ? 0 : (change / baselineScore) * 100;

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (change < -0.5) trend = 'improving'; // Lower is better for skin concerns
    else if (change > 0.5) trend = 'worsening';

    return {
      parameter: param,
      baseline: baselineScore,
      current: currentScore,
      change,
      changePercent,
      trend,
    };
  });
}

/**
 * Get trend icon and color
 */
function getTrendDisplay(trend: 'improving' | 'stable' | 'worsening') {
  switch (trend) {
    case 'improving':
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50',
      };
    case 'worsening':
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bg: 'bg-red-50',
      };
    default:
      return {
        icon: Activity,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
      };
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Overview Stats Cards
 */
function OverviewStats({
  analyses,
  metrics,
  locale = 'th',
}: Readonly<{
  analyses: AnalysisSnapshot[];
  metrics: ProgressMetrics[];
  locale?: 'th' | 'en';
}>) {
  const t = TRANSLATIONS[locale];

  const daysSinceStart = useMemo(() => {
    if (analyses.length === 0) return 0;
    const first = analyses[0].date;
    const now = new Date();
    return Math.floor((now.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
  }, [analyses]);

  const overallImprovement = useMemo(() => {
    if (metrics.length === 0) return 0;
    const totalChange = metrics.reduce((sum, m) => sum + m.changePercent, 0);
    return Math.round(totalChange / metrics.length);
  }, [metrics]);

  const stats = [
    {
      label: t.totalAnalyses,
      value: analyses.length,
      icon: ImageIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t.daysSinceStart,
      value: daysSinceStart,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: t.overallImprovement,
      value: `${overallImprovement > 0 ? '+' : ''}${overallImprovement}%`,
      icon: overallImprovement > 0 ? TrendingUp : Activity,
      color: overallImprovement > 0 ? 'text-green-600' : 'text-gray-600',
      bg: overallImprovement > 0 ? 'bg-green-50' : 'bg-gray-50',
    },
    {
      label: t.activeGoals,
      value: 0,
      icon: Target,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Progress Timeline
 */
function ProgressTimeline({
  analyses,
  locale = 'th',
}: Readonly<{
  analyses: AnalysisSnapshot[];
  locale?: 'th' | 'en';
}>) {
  const t = TRANSLATIONS[locale];

  const timelineData = useMemo(() => {
    return analyses.map((snapshot, idx) => ({
      date: snapshot.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
      spots: snapshot.analysis.overallScore.spots,
      pores: snapshot.analysis.overallScore.pores,
      wrinkles: snapshot.analysis.overallScore.wrinkles,
      texture: snapshot.analysis.overallScore.texture,
      redness: snapshot.analysis.overallScore.redness,
      overall: (
        (snapshot.analysis.overallScore.spots +
          snapshot.analysis.overallScore.pores +
          snapshot.analysis.overallScore.wrinkles +
          snapshot.analysis.overallScore.texture +
          snapshot.analysis.overallScore.redness) /
        5
      ).toFixed(1),
      session: idx + 1,
    }));
  }, [analyses, locale]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t.timeline}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="overall"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorOverall)"
              name={t.overall}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Metrics Comparison Table
 */
function MetricsTable({
  metrics,
  locale = 'th',
}: Readonly<{
  metrics: ProgressMetrics[];
  locale?: 'th' | 'en';
}>) {
  const t = TRANSLATIONS[locale];

  const parameterLabels: Record<string, string> = {
    spots: t.spots,
    pores: t.pores,
    wrinkles: t.wrinkles,
    texture: t.texture,
    redness: t.redness,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.metrics}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => {
            const trendDisplay = getTrendDisplay(metric.trend);
            const TrendIcon = trendDisplay.icon;

            return (
              <div key={metric.parameter} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {parameterLabels[metric.parameter]}
                    </span>
                    <Badge
                      variant={metric.trend === 'improving' ? 'default' : 'secondary'}
                      className={`${trendDisplay.bg} ${trendDisplay.color} border-0`}
                    >
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {metric.changePercent.toFixed(1)}%
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {metric.baseline.toFixed(1)} → {metric.current.toFixed(1)}
                  </span>
                </div>
                <Progress
                  value={Math.abs(metric.changePercent)}
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Before/After Comparison
 */
function BeforeAfterComparison({
  baseline,
  current,
  locale = 'th',
}: Readonly<{
  baseline: AnalysisSnapshot;
  current: AnalysisSnapshot;
  locale?: 'th' | 'en';
}>) {
  const t = TRANSLATIONS[locale];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.comparison}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline */}
          <div className="space-y-2">
            <Badge variant="secondary">{t.baseline}</Badge>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {baseline.imageUrl && (
                <img
                  src={baseline.imageUrl}
                  alt="Baseline"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {baseline.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
            </p>
          </div>

          {/* Current */}
          <div className="space-y-2">
            <Badge>{t.current}</Badge>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {current.imageUrl && (
                <img
                  src={current.imageUrl}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {current.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CustomerProgressDashboard({
  analyses,
  locale = 'th',
  onExport,
  onShare,
  onBookFollowup,
}: Readonly<ProgressDashboardProps>) {
  const t = TRANSLATIONS[locale];


  // Sort analyses by date
  const sortedAnalyses = useMemo(() => {
    return [...analyses].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [analyses]);

  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateProgressMetrics(sortedAnalyses);
  }, [sortedAnalyses]);

  // No data state
  if (sortedAnalyses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">{t.noData}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.noDataDescription}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const baseline = sortedAnalyses[0];
  const current = sortedAnalyses.at(-1)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              {t.exportReport}
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              {t.shareProgress}
            </Button>
          )}
          {onBookFollowup && (
            <Button size="sm" onClick={onBookFollowup}>
              <Calendar className="h-4 w-4 mr-2" />
              {t.bookFollowup}
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <OverviewStats analyses={sortedAnalyses} metrics={metrics} locale={locale} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="timeline">{t.timeline}</TabsTrigger>
          <TabsTrigger value="comparison">{t.comparison}</TabsTrigger>
          <TabsTrigger value="metrics">{t.metrics}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BeforeAfterComparison
              baseline={baseline}
              current={current}
              locale={locale}
            />
            <MetricsTable metrics={metrics} locale={locale} />
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <ProgressTimeline analyses={sortedAnalyses} locale={locale} />
        </TabsContent>

        <TabsContent value="comparison">
          <BeforeAfterComparison
            baseline={baseline}
            current={current}
            locale={locale}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsTable metrics={metrics} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Export Component and Types
// ============================================================================

export { OverviewStats, ProgressTimeline, MetricsTable, BeforeAfterComparison };

