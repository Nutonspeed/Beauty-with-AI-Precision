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

import React, { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  Zap,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
  programType?: string;
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

export interface ProgressDashboardProps {
  analyses: AnalysisSnapshot[];
  locale?: 'th' | 'en';
  onExport?: () => void;
  onShare?: () => void;
  onBookFollowup?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

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

function getTrendDisplay(trend: 'improving' | 'stable' | 'worsening') {
  switch (trend) {
    case 'improving':
      return {
        icon: TrendingUp,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      };
    case 'worsening':
      return {
        icon: TrendingDown,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
      };
    default:
      return {
        icon: Activity,
        color: 'text-slate-400',
        bg: 'bg-slate-50',
      };
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

function OverviewStats({
  analyses,
  metrics,
  _locale = 'th',
}: Readonly<{
  analyses: AnalysisSnapshot[];
  metrics: ProgressMetrics[];
  _locale?: 'th' | 'en';
}>) {
  const t = useTranslations();

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
      label: t('progressDashboard.totalAnalyses' as any) || 'Total Inferences',
      value: analyses.length,
      icon: ImageIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t('progressDashboard.daysSinceStart' as any) || 'Operational Days',
      value: daysSinceStart,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: t('progressDashboard.overallImprovement' as any) || 'Yield Delta',
      value: `${overallImprovement > 0 ? '+' : ''}${overallImprovement}%`,
      icon: overallImprovement > 0 ? TrendingUp : Activity,
      color: overallImprovement > 0 ? 'text-emerald-600' : 'text-slate-400',
      bg: overallImprovement > 0 ? 'bg-emerald-50' : 'bg-slate-50',
    },
    {
      label: t('progressDashboard.activeGoals' as any) || 'Active Goals',
      value: 0,
      icon: Target,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{stat.label}</p>
                <div className={cn("p-2.5 rounded-xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{stat.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressTimeline({
  analyses,
  locale = 'th',
}: Readonly<{
  analyses: AnalysisSnapshot[];
  locale?: 'th' | 'en';
}>) {
  const t = useTranslations();

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
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
            <Activity className="h-8 w-8 text-pink-600" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{t('progressDashboard.timeline' as any) || 'Temporal_Evolution'}</CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic mt-2">{t('progressDashboard.description' as any) || 'Longitudinal biometric trend mapping'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ff69b4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                axisLine={false} 
                tickLine={false} 
                dy={15} 
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                axisLine={false} 
                tickLine={false} 
                dx={-10} 
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} 
                itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#ff69b4', letterSpacing: '0.1em' }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="#ff69b4"
                strokeWidth={6}
                fillOpacity={1}
                fill="url(#colorOverall)"
                name={t('progressDashboard.overall' as any) || 'Composite_Score'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricsTable({
  metrics,
  _locale = 'th',
}: Readonly<{
  metrics: ProgressMetrics[];
  _locale?: 'th' | 'en';
}>) {
  const t = useTranslations();

  const parameterLabels: Record<string, string> = {
    spots: t('progressDashboard.spots' as any) || 'Dermal_Spots',
    pores: t('progressDashboard.pores' as any) || 'Pore_Density',
    wrinkles: t('progressDashboard.wrinkles' as any) || 'Wrinkle_Nodes',
    texture: t('progressDashboard.texture' as any) || 'Surface_Refinement',
    redness: t('progressDashboard.redness' as any) || 'Erythema_Index',
  };

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('progressDashboard.metrics' as any) || 'Biometric_Deltas'}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-10 bg-white">
        <div className="space-y-8">
          {metrics.map((metric, i) => {
            const trendDisplay = getTrendDisplay(metric.trend);
            const TrendIcon = trendDisplay.icon;

            return (
              <motion.div 
                key={metric.parameter} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-4 group/item"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/item:text-pink-600 transition-colors">
                      {parameterLabels[metric.parameter]}
                    </span>
                    <Badge
                      className={cn(
                        "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-sm border-none leading-none",
                        trendDisplay.bg, trendDisplay.color
                      )}
                    >
                      <TrendIcon className="h-3 w-3 mr-2" />
                      {metric.changePercent.toFixed(1)}% Δ
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-black text-slate-300 italic uppercase">{metric.baseline.toFixed(1)}</span>
                    <ChevronRight className="w-4 h-4 text-slate-200" />
                    <span className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase">{metric.current.toFixed(1)}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(100, Math.abs(metric.changePercent))}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn("h-full rounded-full transition-all duration-1000", trendDisplay.color.replace('text', 'bg'))}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BeforeAfterComparison({
  baseline,
  current,
  locale = 'th',
}: Readonly<{
  baseline: AnalysisSnapshot;
  current: AnalysisSnapshot;
  locale?: 'th' | 'en';
}>) {
  const t = useTranslations();

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('progressDashboard.comparison' as any) || 'Visual_Sync'}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Baseline interface */}
          <div className="space-y-6 group/asset">
            <div className="flex justify-between items-center px-4">
              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-none rounded-full px-5 py-1.5 text-[9px] font-black uppercase italic shadow-sm">{t('progressDashboard.baseline' as any) || 'BASELINE_NODE'}</Badge>
              <p className="text-[10px] font-black text-slate-300 italic">{baseline.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}</p>
            </div>
            <div className="aspect-[4/5] bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 shadow-inner relative group-hover/asset:border-pink-500/10 transition-all duration-700">
              {baseline.imageUrl && (
                <Image
                  src={baseline.imageUrl}
                  alt="Baseline"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover/asset:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-60" />
            </div>
          </div>

          {/* Current interface */}
          <div className="space-y-6 group/asset">
            <div className="flex justify-between items-center px-4">
              <Badge className="bg-pink-50 text-pink-600 border-none rounded-full px-5 py-1.5 text-[9px] font-black uppercase italic shadow-sm">{t('progressDashboard.current' as any) || 'CURRENT_STATE'}</Badge>
              <p className="text-[10px] font-black text-pink-600 italic">{current.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}</p>
            </div>
            <div className="aspect-[4/5] bg-white rounded-[3rem] overflow-hidden border border-pink-100 shadow-2xl relative group-hover/asset:scale-[1.02] transition-all duration-700">
              {current.imageUrl && (
                <Image
                  src={current.imageUrl}
                  alt="Current"
                  fill
                  className="object-cover transition-transform duration-[3000ms] group-hover/asset:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-transparent to-transparent opacity-60" />
            </div>
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
  locale: propLocale,
  onExport,
  onShare,
  onBookFollowup,
}: Readonly<ProgressDashboardProps>) {
  const t = useTranslations();
  const currentLocale = useLocale() as 'th' | 'en';
  const locale = propLocale ?? currentLocale;
  const [activeTab, setActiveTab] = useState('overview');

  const sortedAnalyses = useMemo(() => {
    return [...analyses].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [analyses]);

  const metrics = useMemo(() => {
    return calculateProgressMetrics(sortedAnalyses);
  }, [sortedAnalyses]);

  if (sortedAnalyses.length === 0) {
    return (
      <Card className="border-slate-100 bg-slate-50/30 rounded-[4rem] p-40 text-center space-y-10 italic shadow-inner">
        <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
          <AlertCircle className="h-16 w-16" />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('progressDashboard.noData' as any) || 'REGISTRY_VOID'}</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('progressDashboard.noDataDescription' as any) || 'Awaiting initial biometric node synchronization...'}</p>
        </div>
      </Card>
    );
  }

  const baseline = sortedAnalyses[0];
  const current = sortedAnalyses.at(-1)!;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Controls interface */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('progressDashboard.title' as any) || 'Aesthetic_Synthesis_Monitor'}</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{t('progressDashboard.description' as any) || 'Orchestrate transformation deltas across all spectrum vectors.'}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {onExport && (
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all" onClick={onExport}>
              <Download className="w-4 h-4 mr-3 text-pink-600" />
              {t('progressDashboard.exportReport' as any) || 'Export_Sequence'}
            </Button>
          )}
          {onShare && (
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-3 text-blue-600" />
              {t('progressDashboard.shareProgress' as any) || 'Share_Node'}
            </Button>
          )}
          {onBookFollowup && (
            <Button className="h-14 px-10 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic shadow-2xl hover:bg-pink-600 transition-all active:scale-95" onClick={onBookFollowup}>
              <Zap className="w-4 h-4 mr-3" />
              {t('progressDashboard.bookFollowup' as any) || 'Finalize_Next_Cycle'}
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats interface */}
      <OverviewStats analyses={sortedAnalyses} metrics={metrics} _locale={locale} />

      {/* Main Content Hub interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
        <div className="flex items-center justify-center">
          <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
            {[
              { id: 'overview', label: t('progressDashboard.overview' as any) || 'Sync_Summary', icon: LayoutGrid },
              { id: 'timeline', label: t('progressDashboard.timeline' as any) || 'Evolution_Trend', icon: Activity },
              { id: 'comparison', label: t('progressDashboard.comparison' as any) || 'Visual_Compare', icon: ImageIcon },
              { id: 'metrics', label: t('progressDashboard.metrics' as any) || 'Biometric_Log', icon: TrendingUp }
            ].map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full"
              >
                <tab.icon className="mr-3 h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <TabsContent value="overview" className="mt-0 outline-none space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                  <BeforeAfterComparison baseline={baseline} current={current} locale={locale} />
                </div>
                <div className="lg:col-span-5">
                  <MetricsTable metrics={metrics} _locale={locale} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0 outline-none">
              <ProgressTimeline analyses={sortedAnalyses} locale={locale} />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0 outline-none">
              <BeforeAfterComparison baseline={baseline} current={current} locale={locale} />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0 outline-none">
              <div className="max-w-4xl mx-auto">
                <MetricsTable metrics={metrics} _locale={locale} />
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

export { OverviewStats, ProgressTimeline, MetricsTable, BeforeAfterComparison };
