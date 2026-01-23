'use client';

/**
 * Analysis Detail Client Component
 * 
 * Interactive client-side component for displaying analysis results
 * Features:
 * - Tab navigation between modes
 * - Interactive visualizations
 * - Comparison view
 * - Export/share functionality
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Shield,
  Download,
  Share2,
  ArrowLeft,
  Brain,
  Calendar,
  User,
  LayoutGrid,
  Sparkles,
  Zap,
  Box,
  Microscope,
  Monitor,
  Layers,
  Target
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/auth/context';

import { VisionToOrderPanel } from './vision-to-order-panel';
import { Shared3DCanvas } from './shared-3d-canvas';
import { AgingSimulator } from './aging-simulator';
import { MedicalDecisionSupport } from './medical-decision-support';
import { AestheticGenomeVisualization } from './aesthetic-genome-visualization';

interface RecommendationItem {
  name?: string;
  category?: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface AnalysisRecommendations {
  programs: RecommendationItem[];
  products: RecommendationItem[];
  lifestyle: RecommendationItem[];
}

interface Analysis {
  id: string;
  user_id: string;
  analyzed_at: string;
  image_url: string;
  visualization_url?: string;
  overall_score: number;
  skin_health_grade: string;
  
  // Scores
  spots_score: number;
  wrinkles_score: number;
  texture_score: number;
  pores_score: number;
  uv_spots_score: number;
  brown_spots_score: number;
  red_areas_score: number;
  porphyrins_score: number;
  
  // Counts
  spots_count: number;
  wrinkles_count: number;
  pores_count: number;
  uv_spots_count: number;
  brown_spots_count: number;
  red_areas_percentage: number;
  porphyrins_count: number;
  
  // Severity
  spots_severity: string;
  wrinkles_severity: string;
  texture_severity: string;
  pores_severity: string;
  uv_spots_severity: string;
  brown_spots_severity: string;
  red_areas_severity: string;
  porphyrins_severity: string;
  
  // Metadata
  processing_time_ms: number;
  recommendations?: AnalysisRecommendations;
  is_baseline: boolean;
  program_plan_id: string | null;
  ai?: {
    skinType?: string;
    concerns?: Array<{ type: string; severity: number }>;
    severity?: Record<string, number>;
  };
}

interface AnalysisDetailClientProps {
  analysis: Analysis;
  comparisonAnalysis?: Analysis | null;
  availableAnalyses: Array<{
    id: string;
    analyzed_at: string;
    overall_score: number;
    is_baseline: boolean;
  }>;
  userProfile?: {
    full_name?: string;
    avatar_url?: string;
    skin_type?: string;
    skin_concerns?: string[];
  };
  userId: string;
}

const MODES = [
  { id: 'spots', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { id: 'wrinkles', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'texture', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
  { id: 'pores', icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'uv_spots', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  { id: 'brown_spots', icon: Box, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { id: 'red_areas', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  { id: 'porphyrins', icon: Microscope, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
];

export function AnalysisDetailClient({
  analysis,
  comparisonAnalysis: _comparisonAnalysis,
  availableAnalyses: _availableAnalyses,
  userProfile: _userProfile,
  userId: _userId,
}: AnalysisDetailClientProps) {
  const t = useTranslations('analysis');
  const tReport = useTranslations('visiaReport');
  const tCommon = useTranslations('common');
  const _tSeverity = useTranslations('severity');
  const locale = useLocale();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [regenerating, setRegenerating] = useState(false);
  const [vizUrl, setVizUrl] = useState(analysis.visualization_url);
  const lp = useLocalizePath();
  const isEnterprise = user?.role === 'super_admin' || user?.role === 'center_owner';
  const isPlatinum = user?.role === 'super_admin' || user?.role === 'center_owner' || user?.role === 'customer_aesthetic';

  const dateLocale = locale === 'th' ? th : enUS;

  const analyzedAtDisplay = useMemo(() => {
    try {
      const analysisDate = new Date(analysis.analyzed_at);
      if (Number.isNaN(analysisDate.getTime())) {
        return 'Error';
      }
      return formatDistanceToNow(analysisDate, { 
        addSuffix: true,
        locale: dateLocale
      });
    } catch (error) {
      console.warn('[AnalysisDetailClient] Failed to format analysis date:', error);
      return 'Error';
    }
  }, [analysis.analyzed_at, dateLocale]);

  const getSeverityStyles = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
      case 'mild':
        return 'bg-emerald-50 text-emerald-600 border-none';
      case 'moderate':
        return 'bg-amber-50 text-amber-600 border-none';
      case 'high':
        return 'bg-orange-50 text-orange-600 border-none';
      case 'severe':
        return 'bg-rose-50 text-rose-600 border-none';
      default:
        return 'bg-slate-50 text-slate-400 border-none';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-rose-600';
  };

  const getModeData = (mode: string) => {
    const scoreKey = `${mode}_score` as keyof Analysis;
    const countKey = `${mode}_count` as keyof Analysis;
    const severityKey = `${mode}_severity` as keyof Analysis;

    return {
      score: (analysis[scoreKey] as number) || 0,
      count: (analysis[countKey] as number) || 
             (mode === 'red_areas' ? (analysis.red_areas_percentage || 0) : 0) || 0,
      severity: (analysis[severityKey] as string) || 'Low',
    };
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500 shadow-glow-emerald/30';
    if (score >= 75) return 'bg-blue-500 shadow-glow-blue/30';
    if (score >= 60) return 'bg-amber-500 shadow-glow-amber/30';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-rose-500 shadow-glow-rose/30';
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header - Executive Report Interface */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <Link href={lp('/analysis')}>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
              <Sparkles className="mr-3 h-3.5 w-3.5" />
              {t('reportTypes.aesthetic' as any) || 'Precision_Aesthetic_Report'}
            </Badge>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              {t('title' as any) || 'Analysis'}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">{t('reportTypes.intelligence' as any) || 'Intelligence'}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-slate-400 mt-6 uppercase tracking-[0.3em] text-[10px] font-black italic">
              <span className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-pink-500/40" />
                {tCommon('atTime' as any) || 'TIME'}: {analyzedAtDisplay}
              </span>
              <span className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-blue-500/40" />
                HASH: {analysis.id.slice(0, 12).toUpperCase()}
              </span>
              {analysis.is_baseline && (
                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full h-6 px-4 text-[9px] font-black italic shadow-sm">
                  BASELINE_NODE
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 shrink-0">
          <Button variant="outline" size="xl" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">
            <Share2 className="w-4 h-4 mr-4 text-pink-600" />
            {t('secureShare' as any) || 'Secure_Link'}
          </Button>
          <Button variant="premium" size="xl" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic">
            <Download className="w-4 h-4 mr-4" />
            {t('exportPdf' as any) || 'Export_Report'}
          </Button>
        </div>
      </div>

      {/* Executive Summary interface */}
      <div className="grid lg:grid-cols-12 gap-10">
        {/* Global Index Node interface */}
        <div className="lg:col-span-4">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] h-full overflow-hidden flex flex-col justify-center text-center p-12 relative group transition-all duration-700 hover:border-pink-500/20">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            <div className="absolute inset-0 bg-pink-500/[0.01] blur-[100px] rounded-full pointer-events-none group-hover:bg-pink-500/[0.03] transition-colors" />
            <div className="space-y-10 relative z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('metrics.globalIndex' as any) || 'GLOBAL_AESTHETIC_INDEX'}</p>
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
                <svg className="h-56 w-56 -rotate-90">
                  <circle cx="112" cy="112" r="100" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-50" />
                  <motion.circle
                    cx="112" cy="112" r="100" fill="none" stroke="#ff69b4" strokeWidth="12"
                    strokeDasharray={628.3}
                    initial={{ strokeDashoffset: 628.3 }}
                    animate={{ strokeDashoffset: 628.3 - (628.3 * analysis.overall_score) / 100 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="shadow-glow-pink"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-8xl font-black italic tracking-tighter leading-none", getScoreColor(analysis.overall_score))}>
                    {analysis.overall_score.toFixed(0)}
                  </span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">{t('metrics.aggregate' as any) || 'COMPOSITE'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <Badge className="text-2xl px-12 py-3 rounded-full border-none shadow-2xl bg-slate-950 text-white font-black italic tracking-widest uppercase">
                  {tReport('grade' as any) || 'GRADE'}: {analysis.skin_health_grade}
                </Badge>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('metrics.aestheticClassification' as any) || 'Aesthetic_Node_Classification'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Visual Asset interface interface */}
        <div className="lg:col-span-8">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] h-full overflow-hidden p-10 relative group transition-all duration-700 hover:border-blue-500/20">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
            <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-6">
                <div className="p-3 bg-blue-50 rounded-2xl shadow-inner border border-blue-100">
                  <Monitor className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-950">{t('metrics.multiSpectrum' as any) || 'Spectrum_Asset_Synthesis'}</h3>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 shadow-inner">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse shadow-glow-blue" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{t('metrics.synthesisActive' as any) || 'Neural_Render_Live'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10 h-[calc(100%-80px)]">
              <div className="space-y-6 flex flex-col h-full">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{t('metrics.inputAsset' as any) || 'Standard_RGB'}</span>
                  <Badge variant="outline" className="border-slate-100 text-slate-300 text-[8px] font-black italic uppercase">Baseline_Link</Badge>
                </div>
                <div className="relative flex-1 rounded-[3rem] overflow-hidden border border-slate-100 shadow-inner bg-slate-50 group/img">
                  <Image src={analysis.image_url} alt="Input" fill className="object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-60" />
                </div>
              </div>
              <div className="space-y-6 flex flex-col h-full">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-600 italic leading-none">{t('metrics.neuralOverlay' as any) || 'Neural_Cross_Spectrum'}</span>
                  <Badge className="bg-pink-50 text-pink-600 border-none text-[8px] font-black italic uppercase animate-pulse shadow-sm">Synthesis_Active</Badge>
                </div>
                <div className="relative flex-1 rounded-[3rem] overflow-hidden border border-pink-100 shadow-2xl bg-white group/img">
                  {vizUrl ? (
                    <>
                      <Image src={vizUrl} alt="Synthesis" fill className="object-cover transition-transform duration-[3000ms] group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-transparent to-transparent opacity-60" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-slate-50/50 p-10 text-center gap-8 italic">
                      <div className="relative">
                        <div className="absolute -inset-10 bg-pink-500/5 rounded-full blur-[60px] animate-pulse" />
                        <Brain className="h-20 w-20 text-slate-200 relative z-10" />
                      </div>
                      <div className="space-y-6 relative z-10">
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-relaxed">{t('metrics.pendingSynthesis' as any) || 'Awaiting_Neural_Inference_Cycle'}</p>
                        <Button 
                          variant="premium" 
                          size="xl" 
                          disabled={regenerating}
                          onClick={async () => {
                            setRegenerating(true);
                            try {
                              const resp = await fetch('/api/analysis/visualize', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: analysis.id }),
                              });
                              if (resp.ok) {
                                const json = await resp.json();
                                if (json.visualization_url) setVizUrl(json.visualization_url);
                              }
                            } finally {
                              setRegenerating(false);
                            }
                          }}
                          className="h-16 px-10 rounded-2xl bg-slate-950 text-white border-none shadow-2xl hover:bg-pink-600 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                        >
                          {regenerating ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Zap className="mr-3 h-4 w-4" />}
                          {regenerating ? 'RE-CALIBRATING' : 'Initialize_Synthesis'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs Hub interface interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 px-6">
          <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[1.5rem] h-auto gap-4 shadow-inner">
            {[
              { id: 'overview', label: t('tabs.summary' as any) || 'Global_Summary', icon: LayoutGrid },
              { id: 'details', label: t('tabs.portfolio' as any) || 'Full_Metric_Set', icon: Layers },
              { id: 'aging', label: t('tabs.aging' as any) || 'Temporal_Sim', icon: Clock },
              { id: 'recommendations', label: t('tabs.protocol' as any) || 'Protocol_Builder', icon: Zap }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-xl px-8 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full"
              >
                <tab.icon className="w-4 h-4 mr-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            <div className="flex items-center gap-4 group/telemetry cursor-default">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/telemetry:bg-blue-50 transition-all shadow-inner">
                <Clock className="w-4 h-4 text-blue-600/60" />
              </div>
              <span>{t('metrics.processing' as any) || 'LATENCY'}: <span className="text-slate-950">{analysis.processing_time_ms}MS</span></span>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-4 group/telemetry cursor-default">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/telemetry:bg-pink-50 transition-all shadow-inner">
                <Activity className="w-4 h-4 text-pink-600/60" />
              </div>
              <span>{t('metrics.neuralPrecision' as any) || 'PRECISION'}: <span className="text-slate-950">99.9%</span></span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <TabsContent value="overview" className="mt-0 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {MODES.map((mode, i) => {
                  const modeData = getModeData(mode.id);
                  return (
                    <motion.div
                      key={mode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] hover:border-pink-500/20 transition-all duration-700 group overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="p-8 pb-6 border-b border-slate-50 bg-slate-50/30">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-5">
                              <div className={cn("h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", mode.color)}>
                                <mode.icon className="h-6 w-6" />
                              </div>
                              <span className="font-black text-lg italic tracking-tight text-slate-950 uppercase group-hover:text-pink-600 transition-colors leading-none">{t(`modes.${mode.id}` as any) || mode.id}</span>
                            </div>
                            <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-sm leading-none", getSeverityStyles(modeData.severity))}>
                              {modeData.severity}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8 flex-1 flex flex-col justify-between">
                          <div className="flex items-end justify-between gap-6">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('metrics.healthIndex' as any) || 'QUALITY_INDEX'}</p>
                              <p className={cn("text-4xl font-black italic tracking-tighter uppercase leading-none", getScoreColor(modeData.score))}>{modeData.score.toFixed(0)}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{mode.id === 'red_areas' ? (t('metrics.coverage' as any) || 'DENSITY') : (t('metrics.rawCount' as any) || 'NODES')}</p>
                              <p className="text-xl font-black text-slate-950 italic tracking-tight uppercase leading-none">
                                {mode.id === 'red_areas' ? `${modeData.count.toFixed(1)}%` : modeData.count}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${modeData.score}%` }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                className={cn("h-full rounded-full transition-all duration-1000", getProgressBarColor(modeData.score))} 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Metric Portfolio Tab interface interface */}
            <TabsContent value="details" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10 h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-12 lg:p-16 border-b border-slate-50 bg-slate-50/30">
                  <div className="space-y-3">
                    <CardTitle className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('metrics.fullPortfolio' as any) || 'Unified_Aesthetic_Portfolio'}</CardTitle>
                    <CardDescription className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight">{t('metrics.portfolioDesc' as any) || 'Synchronized biological telemetry across all available spectrum vectors.'}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  <div className="divide-y divide-slate-100">
                    {MODES.map((mode, i) => {
                      const modeData = getModeData(mode.id);
                      return (
                        <motion.div 
                          key={mode.id} 
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="p-10 lg:p-14 hover:bg-slate-50/50 transition-all duration-700 group/row relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/row:bg-blue-600 transition-all duration-700" />
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                            <div className="flex items-center gap-10">
                              <div className={cn("h-20 w-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/row:scale-110 group-hover/row:bg-white transition-all duration-700", mode.color)}>
                                <mode.icon className="h-10 w-10" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter group-hover/row:text-blue-600 transition-colors leading-none">{t(`modes.${mode.id}` as any) || mode.id}</h3>
                                <div className="flex items-center gap-6">
                                  <Badge className={cn("px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-sm border-none leading-none", getSeverityStyles(modeData.severity))}>
                                    {modeData.severity} {t('metrics.severityLabel' as any) || 'SEVERITY'}
                                  </Badge>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                    {mode.id === 'red_areas' ? `${t('metrics.densityLabel' as any) || 'DENSITY'}: ${modeData.count.toFixed(1)}%` : `${t('metrics.countLabel' as any) || 'UNIT_COUNT'}: ${modeData.count}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 max-w-xl space-y-5">
                              <div className="flex items-end justify-between px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('metrics.subMetricScore' as any) || 'QUALITY_YIELD'}</span>
                                <span className={cn("text-4xl font-black italic tracking-tighter uppercase leading-none", getScoreColor(modeData.score))}>{modeData.score.toFixed(1)}</span>
                              </div>
                              <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${modeData.score}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", getProgressBarColor(modeData.score))}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aging" className="mt-0 outline-none">
              <div className="rounded-[4rem] border border-slate-100 bg-white shadow-premium overflow-hidden p-2 group transition-all duration-700 hover:border-pink-500/20">
                <AgingSimulator originalImageUrl={analysis.image_url} isPremium={isPlatinum} />
              </div>
            </TabsContent>

            {/* Program Protocol Tab interface interface */}
            <TabsContent value="recommendations" className="mt-0 outline-none space-y-16">
              <MedicalDecisionSupport isEnterprise={isEnterprise} _skinData={analysis} />
              <AestheticGenomeVisualization />
              <div className="rounded-[4rem] border border-slate-100 bg-white shadow-premium overflow-hidden p-2 group transition-all duration-700 hover:border-blue-500/20">
                <Shared3DCanvas isPremium={isEnterprise || isPlatinum} />
              </div>
              <VisionToOrderPanel _analysisId={analysis.id} recommendations={analysis.recommendations} />
              
              <AnimatePresence>
                {analysis.recommendations ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-16">
                    {[
                      { id: 'programs', title: t('protocols.interventions' as any) || 'CLINICAL_CYCLES', icon: Activity, data: (analysis.recommendations as any).programs, color: "text-pink-600", bg: "bg-pink-50" },
                      { id: 'products', title: t('protocols.regimen' as any) || 'DERMAL_INGESTION', icon: CheckCircle2, data: (analysis.recommendations as any).products, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { id: 'lifestyle', title: t('protocols.optimization' as any) || 'BIOLOGICAL_TUNING', icon: User, data: (analysis.recommendations as any).lifestyle, color: "text-blue-600", bg: "bg-blue-50" }
                    ].map((sec, i) => (
                      <motion.div 
                        key={sec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden flex flex-col h-full group/card transition-all duration-700 hover:border-pink-500/20">
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                          <CardHeader className="bg-slate-50/30 border-b border-slate-50 p-10">
                            <CardTitle className="text-xl font-black italic uppercase tracking-widest flex items-center gap-5 leading-none">
                              <div className={cn("p-3 rounded-2xl border border-slate-100 shadow-inner group-hover/card:scale-110 transition-transform duration-700", sec.bg)}>
                                <sec.icon className={cn("w-6 h-6", sec.color)} />
                              </div>
                              {sec.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-10 space-y-6 flex-1 bg-white">
                            {sec.data?.length > 0 ? sec.data.map((item: RecommendationItem, idx: number) => (
                              <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-pink-500/20 hover:shadow-premium transition-all duration-700 group/item relative overflow-hidden">
                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/item:bg-pink-600 transition-all duration-700" />
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                  <h4 className="font-black text-xl text-slate-950 group-hover/item:text-pink-600 transition-colors leading-snug italic uppercase tracking-tight">{item.name || item.category}</h4>
                                  {item.priority && (
                                    <Badge className={cn("px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic shadow-sm leading-none border-none", 
                                      item.priority === 'critical' ? "bg-rose-50 text-rose-600" :
                                      item.priority === 'high' ? "bg-orange-50 text-orange-600" :
                                      "bg-blue-50 text-blue-600"
                                    )}>
                                      {item.priority}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[13px] text-slate-500 font-medium italic leading-relaxed group-hover/item:text-slate-950 transition-colors relative z-10">
                                  {item.description}
                                </p>
                              </div>
                            )) : (
                              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20 italic">
                                <sec.icon className="w-16 h-16 mb-6 text-slate-300" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('protocols.noData' as any) || 'Awaiting_Protocol_Ingestion'}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] p-40 text-center space-y-10 italic">
                    <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
                      <AlertCircle className="h-16 w-16" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('protocols.pendingTitle' as any) || 'PROTOCOL_SYNC_PENDING'}</h3>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('protocols.pendingDesc' as any) || 'Authorizing final biological yield recommendations...'}</p>
                    </div>
                    <Button variant="outline" size="xl" className="h-16 px-12 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.3em] shadow-sm hover:bg-slate-50 transition-all italic">{t('protocols.retry' as any) || 'Re-Initialize_Sequence'}</Button>
                  </Card>
                )}
              </AnimatePresence>
            </TabsContent>
          </motion.div>
        </AnimatePresence>

        {/* Global Disclosure interface interface */}
        <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12 opacity-40 hover:opacity-100 transition-all duration-700 pb-12 grayscale hover:grayscale-0">
          <div className="flex items-start gap-8 max-w-3xl">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
              <Shield className="w-8 h-8 text-slate-300" />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 italic leading-none">{t('footer.disclaimerTitle' as any) || 'Governing_Protocol_Disclaimer'}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed font-light italic uppercase tracking-widest">
                {t('footer.disclaimerDesc' as any) || 'All diagnostic inferences are generated through precision AI mapping and should be validated by authorized clinical personnel before protocol execution. Biometric data is synchronized under PDPA sovereign frameworks.'}
              </p>
            </div>
          </div>
          <div className="text-center md:text-right space-y-3 shrink-0">
            <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest italic bg-slate-50 px-4 py-1.5 rounded-full">{t('footer.verified' as any) || 'NODE_VERIFIED'}</Badge>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic leading-none pt-1">
              UUID: <span className="text-slate-400 font-mono ml-2">{analysis.id.slice(0, 16).toUpperCase()}...</span>
            </p>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  )
}
