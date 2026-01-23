'use client';

/**
 * Analysis Comparison Component
 * Side-by-side comparison of 2-4 VISIA analysis sessions
 * Features: Parameter change highlighting, synchronized zoom/pan, timeline slider
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations, useLocale } from 'next-intl';
import { type HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  SlidersHorizontal,
  ArrowUpDown,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type TrendType = 'improvement' | 'decline' | 'stable';

interface ComparisonSession {
  id: string;
  analysis: HybridSkinAnalysis;
  date: Date;
  label?: string;
}

interface AnalysisComparisonProps {
  sessions: ComparisonSession[];
  locale?: 'th' | 'en';
  onSelectSession?: (sessionId: string) => void;
  maxSessions?: 2 | 3 | 4;
}

type ParameterKey = 'spots' | 'pores' | 'wrinkles' | 'texture' | 'redness' | 'overall';

export default function AnalysisComparison({
  sessions,
  onSelectSession: _onSelectSession,
  maxSessions = 4,
}: Readonly<AnalysisComparisonProps>) {
  const t = useTranslations('analysisComparison');
  const locale = useLocale();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'sideBySide' | 'overlay'>('grid');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Sort sessions by date
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sessions]);

  // Auto-select first sessions if none selected
  useEffect(() => {
    if (selectedSessions.length === 0 && sortedSessions.length >= 2) {
      const initialSelection = sortedSessions
        .slice(0, Math.min(maxSessions, sortedSessions.length))
        .map((s) => s.id);
      setSelectedSessions(initialSelection);
    }
  }, [sortedSessions, maxSessions, selectedSessions.length]);

  // Get selected session objects
  const comparisonSessions = useMemo(() => {
    return selectedSessions
      .map((id) => sortedSessions.find((s) => s.id === id))
      .filter((s): s is ComparisonSession => s !== undefined);
  }, [selectedSessions, sortedSessions]);

  // Calculate parameter changes
  const parameterChanges = useMemo(() => {
    if (comparisonSessions.length < 2) return null;

    const first = comparisonSessions[0];
    const last = comparisonSessions.at(-1)!;

    const parameters: ParameterKey[] = ['spots', 'pores', 'wrinkles', 'texture', 'redness', 'overall'];
    
    return parameters.map((param) => {
      const firstValue = first.analysis.percentiles[param];
      const lastValue = last.analysis.percentiles[param];
      const change = lastValue - firstValue;
      const percentChange = firstValue > 0 ? (change / firstValue) * 100 : 0;

      let trend: TrendType;
      if (change > 2) {
        trend = 'improvement';
      } else if (change < -2) {
        trend = 'decline';
      } else {
        trend = 'stable';
      }

      return {
        parameter: param,
        firstValue,
        lastValue,
        change,
        percentChange,
        trend,
      };
    });
  }, [comparisonSessions]);

  // Calculate time range
  const timeRange = useMemo(() => {
    if (comparisonSessions.length < 2) return 0;
    const first = comparisonSessions[0].date.getTime();
    const last = comparisonSessions.at(-1)!.date.getTime();
    return Math.floor((last - first) / (1000 * 60 * 60 * 24));
  }, [comparisonSessions]);

  // Toggle session selection
  const toggleSession = (sessionId: string) => {
    setSelectedSessions((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      } else if (prev.length < maxSessions) {
        return [...prev, sessionId];
      }
      return prev;
    });
  };

  // Get trend icon
  const getTrendIcon = (trend: 'improvement' | 'decline' | 'stable') => {
    switch (trend) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'decline':
        return <TrendingDown className="h-4 w-4 text-rose-600" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  // Get trend color
  const getTrendStyles = (trend: 'improvement' | 'decline' | 'stable') => {
    switch (trend) {
      case 'improvement':
        return 'bg-emerald-50 text-emerald-600';
      case 'decline':
        return 'bg-rose-50 text-rose-600';
      default:
        return 'bg-slate-50 text-slate-400';
    }
  };

  if (sessions.length < 2) {
    return (
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] p-20 text-center space-y-8 italic shadow-inner">
        <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse">
          <Calendar className="h-12 w-12" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('selectAtLeast2' as any) || 'INSUFFICIENT_NODES'}</h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Establish at least two diagnostic nodes for delta comparison</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header interface */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center justify-center md:justify-start gap-6 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
              <ArrowUpDown className="w-8 h-8 text-pink-600" />
            </div>
            {t('title' as any) || 'Delta_Comparison'}
          </h2>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            {t('description' as any) || 'Longitudinal multi-node biometric synchronization'}
          </p>
        </div>
      </div>

      {/* Session Selection architecture interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('selectSessions' as any) || 'Temporal_Node_Selector'}</CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">
              {t('comparing' as any || 'Synchronizing {count} of {total} nodes').replace('{count}', String(selectedSessions.length)).replace('{total}', String(sessions.length))}
            </CardDescription>
          </div>
          <Badge className="bg-blue-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest leading-none">REGISTRY_ACTIVE</Badge>
        </CardHeader>
        <CardContent className="p-10 lg:p-16 space-y-12 bg-white">
          <div className="space-y-10">
            {/* Timeline interface slider */}
            <div className="relative p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/timeline">
              <div className="flex items-center gap-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-2xl border-slate-200 bg-white text-slate-300 hover:text-pink-600 transition-all shadow-sm shrink-0"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4 ml-4">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Temporal_Registry_Axis</span>
                  </div>
                  <Slider
                    value={[currentIndex]}
                    max={sortedSessions.length - 1}
                    step={1}
                    onValueChange={(value) => setCurrentIndex(value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest italic px-2">
                    {sortedSessions.map((session, idx) => (
                      <span key={session.id} className={cn("transition-all duration-500", idx === currentIndex ? 'text-slate-950 scale-110' : '')}>
                        {session.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-2xl border-slate-200 bg-white text-slate-300 hover:text-pink-600 transition-all shadow-sm shrink-0"
                  onClick={() =>
                    setCurrentIndex(Math.min(sortedSessions.length - 1, currentIndex + 1))
                  }
                  disabled={currentIndex === sortedSessions.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Session Node Cards interface */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedSessions.map((session, idx) => (
                <motion.div 
                  key={session.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-700 relative overflow-hidden rounded-[2.5rem] h-full",
                      selectedSessions.includes(session.id)
                        ? "bg-white border-pink-200 shadow-premium scale-105 z-10"
                        : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-pink-500/20 shadow-inner opacity-60"
                    )}
                    onClick={() => toggleSession(session.id)}
                  >
                    <div className={cn("absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover:bg-pink-600 transition-all", selectedSessions.includes(session.id) ? 'bg-pink-500' : '')} />
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Node_{idx + 1}</p>
                          <p className="text-sm font-black text-slate-950 italic uppercase leading-none">
                            {session.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                          </p>
                        </div>
                        {selectedSessions.includes(session.id) && (
                          <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                            <span className="text-xs font-black italic">{selectedSessions.indexOf(session.id) + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-none">{t('score' as any) || 'INTEGRITY_IDX'}</p>
                        <div className="text-4xl font-black text-pink-600 italic tracking-tighter uppercase leading-none">
                          {session.analysis.percentiles.overall}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison results interface */}
      {comparisonSessions.length >= 2 && (
        <AnimatePresence mode="wait">
          <motion.div 
            key="comparison-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            {/* Display Controls interface */}
            <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden relative group">
              <CardContent className="p-6 bg-slate-50/30">
                <div className="flex flex-wrap items-center justify-between gap-8">
                  {/* View Mode interface */}
                  <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    {[
                      { id: 'grid', label: 'Grid_Matrix', icon: Grid3x3 },
                      { id: 'sideBySide', label: 'Parallel_Vector', icon: SlidersHorizontal }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={cn(
                          "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 italic",
                          viewMode === mode.id 
                            ? "bg-pink-600 text-white shadow-lg scale-105" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Zoom interface interface */}
                  <div className="flex items-center gap-6 bg-white px-8 py-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-slate-300 hover:text-pink-600 transition-all"
                        onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                        disabled={zoomLevel <= 50}
                      >
                        <ZoomOut className="h-5 w-5" />
                      </Button>
                      <div className="w-20 text-center space-y-0.5">
                        <span className="text-xl font-black text-slate-950 italic tracking-tighter leading-none">{zoomLevel}%</span>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Magnify</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-slate-300 hover:text-pink-600 transition-all"
                        onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                        disabled={zoomLevel >= 200}
                      >
                        <ZoomIn className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="h-8 w-px bg-slate-100" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-xl px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 italic transition-all"
                      onClick={() => setZoomLevel(100)}
                    >
                      <Maximize2 className="h-4 w-4 mr-3" />
                      Reset_Scale
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Summary Matrix interface */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: t('timeRange' as any) || 'Temporal_Span', val: timeRange, sub: 'Calendar Days', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                { 
                  label: t('overallProgress' as any) || 'Aggregate_Delta', 
                  val: (() => {
                    const lastScore = comparisonSessions.at(-1)?.analysis.percentiles.overall || 0;
                    const firstScore = comparisonSessions[0].analysis.percentiles.overall;
                    const change = lastScore - firstScore;
                    return `${change > 0 ? '+' : ''}${change}`;
                  })(),
                  sub: 'Score Points Delta',
                  icon: TrendingUp,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  trend: (() => {
                    const lastScore = comparisonSessions.at(-1)?.analysis.percentiles.overall || 0;
                    const firstScore = comparisonSessions[0].analysis.percentiles.overall;
                    const change = lastScore - firstScore;
                    return change > 2 ? 'improvement' : change < -2 ? 'decline' : 'stable';
                  })()
                },
                { 
                  label: t('parameterChanges' as any) || 'Node_Deltas', 
                  val: parameterChanges?.filter((p) => p.trend === 'improvement').length || 0,
                  sub: 'Improving Vectors',
                  icon: Layers,
                  color: 'text-pink-600',
                  bg: 'bg-pink-50'
                }
              ].map((stat, i) => (
                <Card key={i} className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{stat.label}</CardTitle>
                    <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-4">
                    <div className="flex items-end gap-4">
                      <div className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{stat.val}</div>
                      {(stat as any).trend && (
                        <div className={cn("p-1.5 rounded-lg border border-slate-50 shadow-inner", getTrendStyles((stat as any).trend).replace('text', 'bg-opacity-5 bg'))}>
                          {getTrendIcon((stat as any).trend)}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600 transition-colors leading-relaxed">
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Protocol Comparison interface */}
            <Tabs defaultValue="parameters" className="space-y-12">
              <div className="flex items-center justify-center">
                <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
                  {[
                    { value: 'parameters', label: 'Voxel_Deltas', icon: Layers },
                    { value: 'summary', label: 'Registry_Log', icon: Activity },
                    { value: 'trend', label: 'Heuristic_Trends', icon: TrendingUp }
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value} 
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
                  key="comparison-content-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <TabsContent value="parameters" className="mt-0 outline-none space-y-10">
                    {parameterChanges?.map((paramChange, pIdx) => (
                      <motion.div
                        key={paramChange.parameter}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: pIdx * 0.1 }}
                      >
                        <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden group transition-all duration-700 hover:border-blue-500/20">
                          <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                            <div className="space-y-1">
                              <CardTitle className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t(paramChange.parameter as any) || paramChange.parameter.toUpperCase()}</CardTitle>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Node specific delta analysis</p>
                            </div>
                            <Badge className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-lg border-none leading-none gap-4", getTrendStyles(paramChange.trend))}>
                              {getTrendIcon(paramChange.trend)}
                              <span>
                                {paramChange.change > 0 && '+'}
                                {paramChange.change.toFixed(1)} POINTS_DELTA
                              </span>
                            </Badge>
                          </CardHeader>
                          <CardContent className="p-10 lg:p-16 bg-white">
                            <div className="space-y-12">
                              <div
                                className={cn(
                                  "grid gap-8",
                                  viewMode === 'grid'
                                    ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(comparisonSessions.length, 4)}`
                                    : 'grid-cols-1 md:grid-cols-2'
                                )}
                              >
                                {comparisonSessions.map((session, sIdx) => (
                                  <div
                                    key={session.id}
                                    className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/node transition-all duration-700 hover:bg-white hover:border-pink-500/20"
                                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                                  >
                                    <div className="flex justify-between items-start mb-8">
                                      <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">NODE_STAMP_{sIdx + 1}</p>
                                        <p className="text-sm font-black text-slate-950 italic uppercase leading-none">
                                          {session.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                          })}
                                        </p>
                                      </div>
                                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <span className="text-[10px] font-black italic text-slate-300">{sIdx + 1}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                      <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-black text-slate-950 italic tracking-tighter leading-none">{session.analysis.percentiles[paramChange.parameter]}</span>
                                        <span className="text-sm font-black text-slate-300 italic uppercase">th</span>
                                      </div>
                                      <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-sm">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${session.analysis.percentiles[paramChange.parameter]}%` }}
                                          transition={{ duration: 1.5, delay: sIdx * 0.1 }}
                                          className="h-full rounded-full bg-blue-500 shadow-glow-blue/20"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-10 border-t border-slate-50 flex items-center justify-center">
                                <div className="p-10 rounded-[3rem] bg-slate-950 text-white shadow-2xl relative overflow-hidden group/delta min-w-[320px] text-center">
                                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-500/10 opacity-50" />
                                  <div className="space-y-4 relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">{t('change' as any) || 'VECTOR_EVOLUTION'}</p>
                                    <div className="flex items-center justify-center gap-6">
                                      <p className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                                        {paramChange.change > 0 && '+'}
                                        {paramChange.change.toFixed(1)}
                                      </p>
                                      <Badge className="bg-white/10 text-emerald-400 border-none px-4 py-1.5 rounded-full text-[11px] font-black italic tracking-widest uppercase">
                                        {paramChange.percentChange > 0 && '+'}
                                        {paramChange.percentChange.toFixed(1)}% YIELD
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="summary" className="mt-0 outline-none">
                    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden group transition-all duration-1000 hover:border-pink-500/20">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                          <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
                            <Activity className="h-8 w-8 text-pink-600" />
                          </div>
                          {t('detailedComparison' as any) || 'Registry_Full_Inference_Log'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 bg-white">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Biometric_Vector</th>
                                {comparisonSessions.map((session, idx) => (
                                  <th key={session.id} className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center italic">
                                    NODE_{idx + 1}
                                  </th>
                                ))}
                                <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-right italic">Delta_Variance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {parameterChanges?.map((paramChange) => (
                                <tr key={paramChange.parameter} className="group/row transition-all duration-500 hover:bg-slate-50/50 relative">
                                  <td className="px-12 py-10">
                                    <div className="flex items-center gap-6">
                                      <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/row:scale-110 transition-all duration-700">
                                        <Layers className="h-6 w-6 text-slate-300 group-hover/row:text-pink-600 transition-colors" />
                                      </div>
                                      <span className="text-xl font-black text-slate-950 italic uppercase group-hover/row:text-pink-600 transition-colors leading-none tracking-tight">{t(paramChange.parameter as any) || paramChange.parameter.toUpperCase()}</span>
                                    </div>
                                  </td>
                                  {comparisonSessions.map((session) => (
                                    <td key={session.id} className="px-10 py-10 text-center">
                                      <span className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/row:scale-110 transition-transform">{session.analysis.percentiles[paramChange.parameter]}th</span>
                                    </td>
                                  ))}
                                  <td className="px-12 py-10 text-right">
                                    <div className="flex items-center justify-end gap-4 group/delta">
                                      <div className={cn("p-2 rounded-xl border border-slate-50 shadow-inner group-hover/row:scale-110 transition-transform duration-700", getTrendStyles(paramChange.trend).replace('text', 'bg-opacity-5 bg'))}>
                                        {getTrendIcon(paramChange.trend)}
                                      </div>
                                      <span
                                        className={cn(
                                          "text-2xl font-black italic tracking-tighter uppercase leading-none",
                                          paramChange.change > 0 ? 'text-emerald-600' : paramChange.change < 0 ? 'text-rose-600' : 'text-slate-400'
                                        )}
                                      >
                                        {paramChange.change > 0 && '+'}
                                        {paramChange.change.toFixed(1)}
                                      </span>
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

                  <TabsContent value="trend" className="mt-0 outline-none">
                    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden group transition-all duration-1000 hover:border-pink-500/20">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                          <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
                            <TrendingUp className="h-8 w-8 text-pink-600" />
                          </div>
                          {t('trendAnalysis' as any) || 'Heuristic_Vector_Trajectory'}
                        </CardTitle>
                        <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
                          Long-term parameter evolution patterns across {comparisonSessions.length} temporal nodes
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-12 lg:p-16 bg-white space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {parameterChanges?.map((paramChange, idx) => {
                            const values = comparisonSessions.map(
                              (s) => s.analysis.percentiles[paramChange.parameter]
                            );
                            const isAscending = values.every((v, i) => i === 0 || v >= (values[i - 1] ?? 0));
                            const isDescending = values.every((v, i) => i === 0 || v <= (values[i - 1] ?? 100));
                            let trendType: string;
                            if (isAscending) {
                              trendType = 'ascending';
                            } else if (isDescending) {
                              trendType = 'descending';
                            } else {
                              trendType = 'fluctuating';
                            }

                            return (
                              <motion.div 
                                key={paramChange.parameter}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-10 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-inner group/trend transition-all duration-700 hover:bg-white hover:border-pink-500/20"
                              >
                                <div className="space-y-10">
                                  <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-5">
                                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/trend:scale-110 transition-transform">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none group-hover/trend:text-pink-600 transition-colors">{t(paramChange.parameter as any) || paramChange.parameter.toUpperCase()}</span>
                                    </div>
                                    <Badge className="bg-slate-950 text-white border-none px-5 py-1.5 rounded-full text-[9px] font-black italic tracking-widest uppercase shadow-lg animate-pulse">{trendType.toUpperCase()}_FLUX</Badge>
                                  </div>
                                  
                                  <div className="flex items-end gap-3 h-48 px-4 bg-white/50 border border-slate-100 rounded-[2.5rem] p-10 shadow-inner group-hover/trend:bg-white transition-all">
                                    {values.map((value, vIdx) => (
                                      <div key={vIdx} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                        <div className="relative w-full">
                                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-950 text-white px-3 py-1 rounded-lg text-[10px] font-black italic shadow-2xl z-20">{value}th</div>
                                          <motion.div
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${(value / 100) * 100}%` }}
                                            transition={{ duration: 1.5, delay: vIdx * 0.1 + (idx * 0.05) }}
                                            className={cn(
                                              "w-full rounded-2xl transition-all duration-1000 shadow-sm relative group-hover/bar:scale-110",
                                              vIdx === values.length - 1 ? 'bg-pink-600 shadow-glow-pink/30' : 'bg-slate-200'
                                            )}
                                          />
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">NODE_{vIdx + 1}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Global Status interface */}
      <div className="p-10 lg:p-12 py-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between rounded-[3.5rem] opacity-40 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">
            Comparison_Vector_Fidelity: <span className="text-emerald-600">CERTIFIED</span>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            BIP-Delta-v4.8
          </Badge>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Global_Index_Epoch: 2026.4</p>
        </div>
      </div>
    </div>
  );
}
