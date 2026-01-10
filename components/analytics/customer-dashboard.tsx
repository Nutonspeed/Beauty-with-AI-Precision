/**
 * Customer Dashboard Component
 * Phase 2 Week 4 Task 4.3
 * 
 * Main analytics dashboard displaying trends, metrics, and insights
 */

'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import TrendChart from './trend-chart';
import {
  TrendPeriod,
  TrendsResponse,
  METRIC_CONFIGS,
} from '@/types/analytics';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

// =============================================
// Types
// =============================================

interface CustomerDashboardProps {
  customerId: string;
  defaultPeriod?: TrendPeriod;
}

// =============================================
// Period Selector Component
// =============================================

const PeriodSelector = ({
  selected,
  onChange,
}: {
  selected: TrendPeriod;
  onChange: (period: TrendPeriod) => void;
}) => {
  const t = useTranslations();
  const periods: { value: TrendPeriod; label: string }[] = [
    { value: '1m', label: t('customerDashboard.periods.1m') },
    { value: '3m', label: t('customerDashboard.periods.3m') },
    { value: '6m', label: t('customerDashboard.periods.6m') },
    { value: '1y', label: t('customerDashboard.periods.1y') },
    { value: 'all', label: t('customerDashboard.periods.all') },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selected === period.value ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "rounded-xl px-6 font-black uppercase tracking-[0.15em] text-[9px] transition-all duration-500",
            selected === period.value 
              ? "bg-pink-600 text-white shadow-2xl shadow-pink-600/40 italic" 
              : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
          )}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
};

// =============================================
// Metric Card Component
// =============================================

const MetricCard = ({
  name,
  current,
  change,
  changePercent,
  trend,
  color,
  icon: _icon,
}: {
  name: string;
  current: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'stable' | 'worsening';
  color: string;
  icon: string;
}) => {
  let TrendIcon = Minus;
  if (trend === 'improving') {
    TrendIcon = TrendingUp;
  } else if (trend === 'worsening') {
    TrendIcon = TrendingDown;
  }

  let trendColor = 'text-gray-600';
  if (trend === 'improving') {
    trendColor = 'text-green-600';
  } else if (trend === 'worsening') {
    trendColor = 'text-red-600';
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 group shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{name}</CardTitle>
        <div
          className="h-3 w-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
          style={{ backgroundColor: color }}
        />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-white tracking-tighter italic">{current.toFixed(1)}</div>
        <div className={cn("flex items-center text-[10px] font-black uppercase tracking-widest mt-2", trendColor)}>
          <TrendIcon className="mr-2 h-3.5 w-3.5" />
          <span>
            {changePercent > 0 ? '+' : ''}
            {changePercent.toFixed(1)}%
          </span>
          <span className="ml-2 text-slate-600 italic">
            ({change > 0 ? '+' : ''}
            {change.toFixed(1)} pts)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================
// Insights Panel Component
// =============================================

const InsightsPanel = ({ trends }: { trends: TrendsResponse }) => {
  const t = useTranslations();
  const insights = [];

  // Generate insights based on trends
  if (trends.metrics.overall.changePercent > 5) {
    insights.push({
      type: 'success',
      title: t('customerDashboard.insights.greatProgress'),
      message: t('customerDashboard.insights.scoreImproved', { val: trends.metrics.overall.changePercent.toFixed(1) }),
      icon: CheckCircle,
    });
  }

  if (trends.metrics.spots.trend === 'improving') {
    insights.push({
      type: 'success',
      title: t('customerDashboard.insights.spotsImproving'),
      message: t('customerDashboard.insights.acnePositiveResults'),
      icon: CheckCircle,
    });
  }

  if (trends.metrics.wrinkles.trend === 'worsening') {
    insights.push({
      type: 'warning',
      title: t('customerDashboard.insights.wrinklesAttention'),
      message: t('customerDashboard.insights.addAntiAging'),
      icon: AlertCircle,
    });
  }

  if (trends.summary.treatmentAdherence < 0.5) {
    insights.push({
      type: 'warning',
      title: t('customerDashboard.insights.lowFrequency'),
      message: t('customerDashboard.insights.regularTracking'),
      icon: AlertCircle,
    });
  }

  if (trends.summary.improvementRate > 2) {
    insights.push({
      type: 'success',
      title: t('customerDashboard.insights.excellentImprovement'),
      message: t('customerDashboard.insights.improvementPoints', { val: trends.summary.improvementRate.toFixed(1) }),
      icon: Award,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: t('customerDashboard.insights.keepGoing'),
      message: t('customerDashboard.insights.continueRoutine'),
      icon: Info,
    });
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/[0.02] text-emerald-400 shadow-emerald-500/5';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/[0.02] text-amber-400 shadow-amber-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/[0.02] text-blue-400 shadow-blue-500/5';
    }
  };

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
        <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('customerDashboard.diagnosticIntelligence')}</CardTitle>
        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('customerDashboard.aiClinicalSynthesis')}</CardDescription>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={cn("rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.01] shadow-inner relative group/insight overflow-hidden", getInsightColor(insight.type))}
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-700">
                <Icon className="w-12 h-12" />
              </div>
              <div className="flex items-start gap-6 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover/insight:border-white/20 transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold tracking-tight italic">{insight.title}</h4>
                  <p className="text-sm font-light leading-relaxed italic opacity-80">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// =============================================
// Main Component
// =============================================

export default function CustomerDashboard({
  customerId,
  defaultPeriod = '3m',
}: CustomerDashboardProps) {
  const t = useTranslations();
  const [period, setPeriod] = useState<TrendPeriod>(defaultPeriod);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trends data
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/analytics/trends?customerId=${customerId}&period=${period}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }

        const data = await response.json();
        setTrends(data);
      } catch (err) {
        console.error('Error fetching trends:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [customerId, period]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Error state
  if (error || !trends) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold">
              {error || t('common.error')}
            </h3>
            <Button className="mt-4" onClick={() => globalThis.location.reload()}>
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-16">
      {/* Header - Analytics Command Interface */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
            <Activity className="mr-3 h-3.5 w-3.5 animate-pulse" />
            {t('customerDashboard.longitudinalSkinAnalytics')}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9] italic">
            {t('nav.analytics')}<br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic font-black uppercase tracking-tight">Dashboard</span>
          </h1>
          <p className="text-xl text-slate-500 font-light tracking-widest italic leading-relaxed">
            {t('customerDashboard.trackImprovementDesc')}
          </p>
        </motion.div>
        <div className="shrink-0">
          <div className="bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <PeriodSelector selected={period} onChange={setPeriod} />
          </div>
        </div>
      </div>

      {/* Summary Stats - Infrastructure Nodes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('customerDashboard.summary.totalAnalyses'), val: trends.summary.totalAnalyses, sub: t('customerDashboard.summary.temporalCycleCount'), icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('customerDashboard.summary.averageScore'), val: trends.summary.averageScore.toFixed(1), sub: t('customerDashboard.summary.benchmarkDesc'), icon: Target, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { label: t('customerDashboard.summary.improvementRate'), val: `${trends.summary.improvementRate > 0 ? '+' : ''}${trends.summary.improvementRate.toFixed(1)}`, sub: t('customerDashboard.summary.pointsPerCycle'), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: t('customerDashboard.summary.analysisFrequency'), val: trends.summary.treatmentAdherence.toFixed(1), sub: t('customerDashboard.summary.cyclesPerMonth'), icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</CardTitle>
                <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-600 italic">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Metric Grid Table - Infrastructure Modules */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(METRIC_CONFIGS).map((config, i) => {
          const metric = trends.metrics[config.key as keyof typeof trends.metrics];
          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.05) }}
            >
              <MetricCard
                name={config.label}
                current={metric.current}
                change={metric.change}
                changePercent={metric.changePercent}
                trend={metric.trend}
                color={config.color}
                icon={config.icon}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Primary Visualization Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic">{t('customerDashboard.synthesisMomentum')}</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('customerDashboard.historicalDataTrends')}</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-12">
            <TrendChart metrics={trends.metrics} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights Infrastructure */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <InsightsPanel trends={trends} />
      </motion.div>
    </div>
  );
}
