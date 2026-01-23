'use client';

/**
 * Client Dashboard Component
 * 
 * Main analytics dashboard displaying trends, metrics, and insights
 */

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
  Target,
  AlertCircle,
  Info,
  Zap,
  Sparkles,
  Layers,
  Brain
} from 'lucide-react';

// =============================================
// Types
// =============================================

interface ClientDashboardProps {
  clientId: string;
  defaultPeriod?: TrendPeriod;
}

// =============================================
// Period Selector Component interface
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
    { value: '1m', label: t('clientDashboard.periods.1m' as any) || '1M' },
    { value: '3m', label: t('clientDashboard.periods.3m' as any) || '3M' },
    { value: '6m', label: t('clientDashboard.periods.6m' as any) || '6M' },
    { value: '1y', label: t('clientDashboard.periods.1y' as any) || '1Y' },
    { value: 'all', label: t('clientDashboard.periods.all' as any) || 'ALL' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            "px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-700 italic",
            selected === period.value 
              ? "bg-pink-600 text-white shadow-premium scale-105" 
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

// =============================================
// Metric Card interface
// =============================================

const MetricCard = ({
  name,
  current,
  change,
  changePercent,
  trend,
  color,
  icon: _Icon,
}: {
  name: string;
  current: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'stable' | 'worsening';
  color: string;
  icon: any;
}) => {
  let TrendIcon = Minus;
  if (trend === 'improving') {
    TrendIcon = TrendingUp;
  } else if (trend === 'worsening') {
    TrendIcon = TrendingDown;
  }

  let trendStyles = 'bg-slate-50 text-slate-400';
  if (trend === 'improving') {
    trendStyles = 'bg-emerald-50 text-emerald-600';
  } else if (trend === 'worsening') {
    trendStyles = 'bg-rose-50 text-rose-600';
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4 bg-slate-50/30">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{name}</CardTitle>
        <div
          className="h-2.5 w-2.5 rounded-full shadow-sm animate-pulse"
          style={{ backgroundColor: color }}
        />
      </CardHeader>
      <CardContent className="p-8 pt-6 space-y-6 flex-1 flex flex-col justify-between">
        <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{current.toFixed(1)}</div>
        <div className="flex items-center justify-between">
          <Badge className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-sm border-none gap-2", trendStyles)}>
            <TrendIcon className="h-3 w-3" />
            <span>
              {changePercent > 0 ? '+' : ''}
              {changePercent.toFixed(1)}% Δ
            </span>
          </Badge>
          <span className="text-[9px] font-black text-slate-300 italic uppercase">
            ({change > 0 ? '+' : ''}{change.toFixed(1)} pts)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================
// Insights Panel interface
// =============================================

const InsightsPanel = ({ trends }: { trends: TrendsResponse }) => {
  const t = useTranslations();
  const insights = [];

  if (trends.metrics.overall.changePercent > 5) {
    insights.push({
      type: 'success',
      title: t('clientDashboard.insights.greatProgress' as any) || 'Optimal_Momentum_Achieved',
      message: t('clientDashboard.insights.scoreImproved' as any || 'Global integrity index improved by {val}% delta.').replace('{val}', trends.metrics.overall.changePercent.toFixed(1)),
      icon: Sparkles,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    });
  }

  if (trends.metrics.spots.trend === 'improving') {
    insights.push({
      type: 'success',
      title: t('clientDashboard.insights.spotsImproving' as any) || 'Melanin_Calibration_Success',
      message: t('clientDashboard.insights.acnePositiveResults' as any) || 'Significant reduction in localized dermal pigment nodes.',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    });
  }

  if (trends.metrics.wrinkles.trend === 'worsening') {
    insights.push({
      type: 'warning',
      title: t('clientDashboard.insights.wrinklesAttention' as any) || 'Structural_Elasticity_Variance',
      message: t('clientDashboard.insights.addAntiAging' as any) || 'Neural models suggest increased intensity for structural tension protocols.',
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    });
  }

  if (trends.summary.programAdherence < 0.5) {
    insights.push({
      type: 'warning',
      title: t('clientDashboard.insights.lowFrequency' as any) || 'Sync_Cycle_Restriction',
      message: t('clientDashboard.insights.regularTracking' as any) || 'Low temporal synchronicity detected. Adherence optimization required.',
      icon: Clock,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    });
  }

  if (trends.summary.improvementRate > 2) {
    insights.push({
      type: 'success',
      title: t('clientDashboard.insights.excellentImprovement' as any) || 'Efficiency_Alpha_Detected',
      message: t('clientDashboard.insights.improvementPoints' as any || 'Synthesis yield exceeding baseline by {val} points.').replace('{val}', trends.summary.improvementRate.toFixed(1)),
      icon: Zap,
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: t('clientDashboard.insights.keepGoing' as any) || 'Protocol_Stability_Confirmed',
      message: t('clientDashboard.insights.continueRoutine' as any) || 'Maintain current biometric synchronization for projected outcomes.',
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    });
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
            <Brain className="h-8 w-8 text-pink-600 group-hover:text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('clientDashboard.diagnosticIntelligence' as any) || 'Neural_Synthesis_Insights'}</CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 italic">{t('clientDashboard.aiAestheticSynthesis' as any) || 'AI-driven longitudinal biometric optimization'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-6 bg-white">
        <div className="grid gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn("rounded-[2.5rem] border border-slate-100 p-8 transition-all duration-700 hover:bg-slate-50 hover:border-pink-500/20 shadow-sm hover:shadow-premium relative group/insight overflow-hidden", insight.bg.replace('50', '20'))}
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover/insight:scale-110 group-hover/insight:rotate-12 transition-transform duration-1000">
                  <Icon className="w-32 h-32" />
                </div>
                <div className="flex items-start gap-8 relative z-10">
                  <div className={cn("h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/insight:scale-110", insight.color)}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none group-hover/insight:text-pink-600 transition-colors">{insight.title}</h4>
                    <p className="text-base text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/insight:text-slate-900 transition-colors">"{insight.message}"</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================
// Main Component interface
// =============================================

export default function ClientDashboard({
  clientId,
  defaultPeriod = '3m',
}: ClientDashboardProps) {
  const t = useTranslations();
  const [period, setPeriod] = useState<TrendPeriod>(defaultPeriod);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/analytics/trends?clientId=${clientId}&period=${period}`
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
  }, [clientId, period]);

  if (loading && !trends) {
    return (
      <div className="space-y-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
          <div className="space-y-4 text-center md:text-left">
            <Skeleton className="h-12 w-64 bg-slate-100 rounded-2xl" />
            <Skeleton className="h-4 w-96 bg-slate-100 rounded-full" />
          </div>
          <Skeleton className="h-16 w-64 bg-slate-100 rounded-2xl" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[2.5rem] bg-slate-100" />
          ))}
        </div>

        <Skeleton className="h-[500px] rounded-[3.5rem] bg-slate-100" />
      </div>
    );
  }

  if (error || !trends) {
    return (
      <div className="flex items-center justify-center py-40">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[3rem] p-10 text-center space-y-6 shadow-premium">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <AlertCircle className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black text-slate-950 italic uppercase tracking-tighter">Telemetry_Failure</p>
            <p className="text-sm text-slate-500 font-light italic leading-relaxed">{error || t('common.error')}</p>
          </div>
          <Button variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm" onClick={() => globalThis.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-3" />
            {t('common.retry' as any) || 'Re-Initialize'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">
      {/* Header - Analytics Interface interface */}
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between border-b border-slate-100 pb-12">
        <div className="space-y-8">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm animate-pulse italic leading-none">
            <Activity className="mr-3 h-3.5 w-3.5" />
            {t('clientDashboard.longitudinalSkinAnalytics' as any) || 'Longitudinal_Biometric_Log'}
          </Badge>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              {t('nav.analytics' as any) || 'Analytics'}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-3xl md:text-5xl">Diagnostic_Matrix</span>
            </h1>
            <p className="text-xl text-slate-500 font-light italic leading-relaxed tracking-tight max-w-2xl">
              {t('clientDashboard.trackImprovementDesc' as any) || 'Monitor biometric evolution across all spectral nodes and synchronize protocol efficacy.'}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <div className="bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
            <PeriodSelector selected={period} onChange={setPeriod} />
          </div>
        </div>
      </div>

      {/* Summary Stats - Infrastructure Nodes interface */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('clientDashboard.summary.totalAnalyses' as any) || 'Total Inferences', val: trends.summary.totalAnalyses, sub: t('clientDashboard.summary.temporalCycleCount' as any) || 'Registry Cycles', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('clientDashboard.summary.averageScore' as any) || 'Mean Quality Score', val: trends.summary.averageScore.toFixed(1), sub: t('clientDashboard.summary.benchmarkDesc' as any) || 'Network Benchmark', icon: Target, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('clientDashboard.summary.improvementRate' as any) || 'Improvement Velocity', val: `${trends.summary.improvementRate > 0 ? '+' : ''}${trends.summary.improvementRate.toFixed(1)}`, sub: t('clientDashboard.summary.pointsPerCycle' as any) || 'Points / Node Cycle', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('clientDashboard.summary.analysisFrequency' as any) || 'Sync Frequency', val: trends.summary.programAdherence.toFixed(1), sub: t('clientDashboard.summary.cyclesPerMonth' as any) || 'Monthly Authorizations', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{stat.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-4">
                <div className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{stat.val}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600 transition-colors leading-relaxed">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Metric Grid Table interface */}
      <div className="space-y-10">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-8 px-6">
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
            <Layers className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">Diagnostic_Portfolio</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Individual node variance synchronization</p>
          </div>
        </div>
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
      </div>

      {/* Primary Visualization interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <TrendingUp className="h-8 w-8 text-pink-600 group-hover:text-white" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('clientDashboard.synthesisMomentum' as any) || 'Synthesis_Momentum'}</CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 italic">{t('clientDashboard.historicalDataTrends' as any) || 'Biological trend mapping across temporal nodes'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12 lg:p-16 bg-white relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
            <div className="relative z-10">
              <TrendChart metrics={trends.metrics} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <InsightsPanel trends={trends} />
      </motion.div>

      {/* Technical Telemetry interface */}
      <div className="px-10 lg:p-12 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <ShieldCheck className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">Diagnostic_Integrity_Verified: <span className="text-slate-950">NOMINAL</span></p>
        </div>
        <div className="flex items-center gap-8">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-slate-50 text-[10px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            BIP-Analytics-v4.8
          </Badge>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">UUID: {clientId.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
