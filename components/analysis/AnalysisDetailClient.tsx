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
  Download,
  Share2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
  Clock,
  User,
  Brain,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface RecommendationItem {
  name?: string;
  category?: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface AnalysisRecommendations {
  treatments: RecommendationItem[];
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
  { id: 'spots', label: 'Spots', icon: '🔴', color: 'text-red-600' },
  { id: 'wrinkles', label: 'Wrinkles', icon: '📏', color: 'text-orange-600' },
  { id: 'texture', label: 'Texture', icon: '✨', color: 'text-yellow-600' },
  { id: 'pores', label: 'Pores', icon: '⚪', color: 'text-gray-600' },
  { id: 'uv_spots', label: 'UV Spots', icon: '☀️', color: 'text-purple-600' },
  { id: 'brown_spots', label: 'Brown Spots', icon: '🟤', color: 'text-amber-700' },
  { id: 'red_areas', label: 'Red Areas', icon: '🔺', color: 'text-rose-600' },
  { id: 'porphyrins', label: 'Porphyrins', icon: '💧', color: 'text-blue-600' },
];

export default function AnalysisDetailClient({
  analysis,
  comparisonAnalysis: _comparisonAnalysis,
  availableAnalyses: _availableAnalyses,
  userProfile: _userProfile,
  userId: _userId,
}: AnalysisDetailClientProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('overview');
  const [regenerating, setRegenerating] = useState(false);
  const [vizUrl, setVizUrl] = useState(analysis.visualization_url);
  const lp = useLocalizePath();
  const analyzedAtDisplay = useMemo(() => {
    try {
      const analysisDate = new Date(analysis.analyzed_at);
      if (Number.isNaN(analysisDate.getTime())) {
        return t('analysis.error');
      }
      return formatDistanceToNow(analysisDate, { addSuffix: true });
    } catch (error) {
      console.warn('[AnalysisDetailClient] Failed to format analysis date:', error);
      return t('analysis.error');
    }
  }, [analysis.analyzed_at, t]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getModeData = (mode: string) => {
    const scoreKey = `${mode}_score` as keyof Analysis;
    const countKey = `${mode}_count` as keyof Analysis;
    const severityKey = `${mode}_severity` as keyof Analysis;

    return {
      score: (analysis[scoreKey] as number) || 0,
      count: (analysis[countKey] as number) || 
             (mode === 'red_areas' ? analysis.red_areas_percentage : 0) || 0,
      severity: (analysis[severityKey] as string) || 'Unknown',
    };
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    if (!priority) return 'secondary';
    if (priority === 'critical') return 'destructive';
    if (priority === 'high') return 'default';
    return 'secondary';
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Header - Executive Report Style */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link href={lp('/analysis')}>
                <Button variant="glass" size="icon" className="h-10 w-10 rounded-full border-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            <Badge variant="premium" className="px-4 py-1">{t('analysis.reportTypes.clinical')}</Badge>
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {t('analysis.title')} <span className="text-primary text-elevated">{t('analysis.reportTypes.intelligence')}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 mt-4 uppercase tracking-[0.15em] text-[10px] font-bold">
              <span className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {t('common.atTime')}: {analyzedAtDisplay}
              </span>
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Neural Hash: {analysis.id.slice(0, 12)}
              </span>
              {analysis.is_baseline && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-md h-5 px-2">
                  {t('analysis.baselineReference')}
                </Badge>
              )}
            </div>
          </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="glass" className="h-12 px-6 border-white/10 text-xs font-bold uppercase tracking-widest hover:border-primary/30">
              <Share2 className="w-4 h-4 mr-3" />
              Secure Share
            </Button>
            <Button variant="premium" className="h-12 px-8 text-xs font-black uppercase tracking-widest shadow-glow-primary">
              <Download className="w-4 h-4 mr-3" />
              Export Full PDF
            </Button>
          </div>
        </div>

        {/* Executive Summary Dashboard */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Score & Grade */}
          <div className="lg:col-span-4">
            <Card className="glass-panel border-white/5 h-full overflow-hidden flex flex-col justify-center text-center p-10 relative group">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
              <div className="space-y-8 relative z-10">
                <p className="text-[11px] uppercase font-black tracking-[0.3em] text-slate-500">{t('analysis.metrics.globalIndex')}</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-48 w-48 -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                    <circle
                      cx="96" cy="96" r="88" fill="none" stroke="var(--primary)" strokeWidth="8"
                      strokeDasharray={552.9}
                      strokeDashoffset={552.9 - (552.9 * analysis.overall_score) / 100}
                      className="transition-all duration-1000 ease-out shadow-glow-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-6xl font-black tracking-tighter", getScoreColor(analysis.overall_score))}>
                      {analysis.overall_score.toFixed(0)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t('analysis.metrics.aggregate')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge className={cn("text-lg px-8 py-1.5 rounded-full border-0 shadow-lg uppercase tracking-[0.2em] font-black", getSeverityColor('low'))}>
                    GRADE {analysis.skin_health_grade}
                  </Badge>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-widest pt-2">{t('analysis.metrics.clinicalClassification')}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Visual Asset Comparison */}
          <div className="lg:col-span-8">
            <Card className="glass-panel border-white/5 h-full overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t('analysis.metrics.multiSpectrum')}</h3>
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] uppercase font-bold text-slate-500">{t('analysis.metrics.synthesisActive')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 md:gap-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{t('analysis.metrics.inputAsset')}</span>
                    <span className="text-[9px] text-slate-600">{t('analysis.metrics.standardRgb')}</span>
                  </div>
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                    <Image src={analysis.image_url} alt="Input" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary">{t('analysis.metrics.neuralOverlay')}</span>
                    <span className="text-[9px] text-slate-600">{t('analysis.metrics.crossSpectrum')}</span>
                  </div>
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-primary/20 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] group">
                    {vizUrl ? (
                      <>
                        <Image src={vizUrl} alt="Synthesis" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-white/5 p-8 text-center gap-6">
                        <div className="relative h-16 w-16">
                          <Brain className="h-16 w-16 text-white/5" />
                          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest leading-relaxed">{t('analysis.metrics.pendingSynthesis')}</p>
                          <Button 
                            variant="premium" 
                            size="sm" 
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
                            className="h-10 px-6 text-[10px] font-black"
                          >
                            {regenerating ? t('analysis.metrics.calibrating') : t('analysis.metrics.initSynthesis')}
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

        {/* Detailed Analytics Grid */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="overview" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px]">{t('analysis.tabs.summary')}</TabsTrigger>
              <TabsTrigger value="details" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px]">{t('analysis.tabs.portfolio')}</TabsTrigger>
              <TabsTrigger value="recommendations" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-widest text-[11px]">{t('analysis.tabs.protocol')}</TabsTrigger>
            </TabsList>
            <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Processing: {analysis.processing_time_ms}ms
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Neural Precision: High
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MODES.map((mode, i) => {
                const data = getModeData(mode.id);
                return (
                  <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="glass-panel border-white/5 hover:border-primary/20 transition-all group overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">{mode.icon}</div>
                            <span className="font-bold text-sm tracking-tight text-white">{t(`analysis.modes.${mode.id}`)}</span>
                          </div>
                          <Badge className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter", getSeverityColor(data.severity))}>
                            {data.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('analysis.metrics.healthIndex')}</p>
                              <p className={cn("text-3xl font-black tracking-tighter", getScoreColor(data.score))}>{data.score.toFixed(0)}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{mode.id === 'red_areas' ? t('analysis.metrics.coverage') : t('analysis.metrics.rawCount')}</p>
                              <p className="text-lg font-bold text-slate-200">
                                {mode.id === 'red_areas' ? `${data.count.toFixed(1)}%` : data.count}
                              </p>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={cn("h-full transition-all duration-1000", getProgressBarColor(data.score))} 
                              style={{ width: `${data.score}%` }} 
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

          {/* Metric Portfolio Tab */}
          <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="glass-panel border-white/5 overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                <CardTitle className="text-2xl font-bold tracking-tight text-white">{t('analysis.metrics.fullPortfolio')}</CardTitle>
                <CardDescription className="text-slate-400 font-light text-base">{t('analysis.metrics.portfolioDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {MODES.map((mode) => {
                    const data = getModeData(mode.id);
                    return (
                      <div key={mode.id} className="p-8 hover:bg-white/5 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center text-4xl shadow-2xl border border-white/5 group-hover:border-primary/30 transition-all">
                              {mode.icon}
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xl font-bold text-white tracking-tight">{t(`analysis.modes.${mode.id}`)}</h3>
                              <div className="flex items-center gap-3">
                                <Badge className={cn("px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest", getSeverityColor(data.severity))}>
                                  {data.severity} SEVERITY
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                  {mode.id === 'red_areas' ? `DENSITY: ${data.count.toFixed(1)}%` : `COUNT: ${data.count}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 max-w-md space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">{t('analysis.metrics.subMetricScore')}</span>
                              <span className={cn("text-2xl font-black tracking-tighter", getScoreColor(data.score))}>{data.score.toFixed(1)}</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.score}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={cn("h-full rounded-full", getProgressBarColor(data.score))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Protocol Tab */}
          <TabsContent value="recommendations" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {analysis.recommendations ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Protocol Card Mixin */}
                {[
                  { id: 'treatments', title: t('analysis.protocols.interventions'), icon: Activity, data: analysis.recommendations.treatments, color: "text-primary" },
                  { id: 'products', title: t('analysis.protocols.regimen'), icon: CheckCircle, data: analysis.recommendations.products, color: "text-emerald-400" },
                  { id: 'lifestyle', title: t('analysis.protocols.optimization'), icon: User, data: analysis.recommendations.lifestyle, color: "text-amber-400" }
                ].map((sec) => (
                  <Card key={sec.id} className="glass-panel border-white/5 overflow-hidden flex flex-col">
                    <CardHeader className="bg-white/5 border-b border-white/5 p-6">
                      <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                        <sec.icon className={cn("w-5 h-5", sec.color)} />
                        {sec.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 flex-1">
                      {sec.data?.length > 0 ? sec.data.map((item: RecommendationItem, i: number) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group/item">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-white group-hover/item:text-primary transition-colors leading-snug capitalize">{item.name || item.category}</h4>
                            {item.priority && (
                              <Badge className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter", getPriorityBadgeVariant(item.priority))}>
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-light leading-relaxed group-hover/item:text-slate-300 transition-colors">
                            {item.description}
                          </p>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                          <sec.icon className="w-12 h-12 mb-4" />
                          <p className="text-[10px] uppercase font-bold tracking-widest">{t('analysis.protocols.noData')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-panel border-white/5">
                <CardContent className="py-24 text-center space-y-6">
                  <AlertCircle className="w-16 h-16 mx-auto text-slate-700 animate-pulse" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-white">{t('analysis.protocols.pendingTitle')}</h3>
                    <p className="text-slate-500 font-light max-w-sm mx-auto">{t('analysis.protocols.pendingDesc')}</p>
                  </div>
                  <Button variant="outline" className="glass uppercase tracking-widest font-black text-[10px]">{t('analysis.protocols.retry')}</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Global Disclosure Footer */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-slate-600" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{t('analysis.footer.disclaimerTitle')}</p>
              <p className="text-[9px] text-slate-500 leading-relaxed max-w-2xl font-light">
                {t('analysis.footer.disclaimerDesc')}
              </p>
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{t('analysis.footer.verified')}</p>
        </div>
      </div>
    </div>
  );
}
