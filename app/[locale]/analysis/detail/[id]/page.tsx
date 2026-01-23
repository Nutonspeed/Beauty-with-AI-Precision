'use client';

/**
 * Analysis Detail Page - [id]
 * Full VISIA report with AR viewer and export options
 */

import { useState, useEffect, useCallback } from 'react';
import { VisiaReport } from '@/components/analysis/visia-report';
import { AnalysisDetailClient } from '@/components/analysis/AnalysisDetailClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Face3DViewer } from '@/components/ar/face-3d-viewer';
import { ProgramSimulator } from '@/components/ar/program-simulator';
import { PriorityRankingCard } from '@/components/analysis';
import ProgramRecommendations from '@/components/program-recommendations';
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  Globe, 
  Check, 
  Presentation, 
  LineChart, 
  Wand2, 
  BarChart3, 
  LayoutGrid, 
  FileText,
  Box,
  TrendingUp,
  Award
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { downloadAnalysisPDF } from '@/lib/utils/pdf-export';
import { exportToPNG, shareAnalysis, printReport } from '@/lib/utils/export-report';
import { rankSkinConcernPriorities } from '@/lib/ai/priority-ranking';
import { generateProgramRecommendations } from '@/lib/ai/program-recommendations';
import type { PriorityRankingResult } from '@/lib/ai/priority-ranking';
import type { RecommendationResult } from '@/lib/ai/program-recommendations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type {
  HybridSkinAnalysis,
  SkinConcern,
  SkinType,
  AIAnalysisResult,
  CVAnalysisResult,
  AIProvider,
} from '@/lib/types/skin-analysis';
import { useAuth } from '@/lib/auth/context';
import { normalizeRole } from '@/lib/auth/role-normalize';
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

const LANGUAGES = [
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const SKIN_CONCERNS: SkinConcern[] = [
  'acne', 'wrinkles', 'dark_spots', 'large_pores', 'redness', 'dullness', 'fine_lines', 'blackheads', 'hyperpigmentation'
];

const RECOMMENDATION_CATEGORIES = ['cleanser', 'serum', 'moisturizer', 'program', 'sunscreen'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isSkinType = (value: unknown): value is SkinType => typeof value === 'string' && ['oily', 'dry', 'combination', 'normal', 'sensitive'].includes(value);
const isSkinConcern = (value: unknown): value is SkinConcern => typeof value === 'string' && SKIN_CONCERNS.includes(value as SkinConcern);
const isAIProvider = (value: unknown): value is AIProvider => typeof value === 'string' && ['huggingface', 'google-vision', 'gemini'].includes(value as AIProvider);

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toNumber = (value: unknown, fallback = 0): number => asNumber(value) ?? fallback;
const clamp = (value: number, min = 0, max = 10): number => Math.min(max, Math.max(min, value));

const buildHybridAnalysis = (raw: unknown, fallbackId: string): HybridSkinAnalysis => {
  const record = isRecord(raw) ? raw : {};
  
  const normalizeSeverity = (raw: unknown): Record<SkinConcern, number> => {
    return SKIN_CONCERNS.reduce((acc, concern) => {
      const source = isRecord(raw) ? raw[concern] : undefined;
      acc[concern] = clamp(toNumber(source, 0));
      return acc;
    }, {} as Record<SkinConcern, number>);
  };

  const normalizeAIAnalysis = (raw: unknown): AIAnalysisResult => {
    const r = isRecord(raw) ? raw : {};
    return {
      skinType: isSkinType(r.skinType) ? r.skinType : 'normal',
      concerns: Array.isArray(r.concerns) ? r.concerns.filter(isSkinConcern) : [],
      severity: normalizeSeverity(r.severity),
      recommendations: Array.isArray(r.recommendations) ? r.recommendations.map((entry: any) => {
        if (typeof entry === 'string') return { category: 'program', product: entry, reason: 'AI analysis' };
        return { 
          category: RECOMMENDATION_CATEGORIES.includes(entry.category) ? entry.category : 'program',
          product: entry.product || 'Unknown',
          reason: entry.reason || 'AI analysis'
        };
      }) : [],
      confidence: clamp(toNumber(r.confidence ?? r.confidenceLevel, 0.8), 0, 1),
      programPlan: typeof r.programPlan === 'string' ? r.programPlan : undefined
    };
  };

  const normalizeCVAnalysis = (raw: unknown): CVAnalysisResult => {
    const r = isRecord(raw) ? raw : {};
    const spotsRaw = isRecord(r.spots) ? r.spots : {};
    const poresRaw = isRecord(r.pores) ? r.pores : {};
    const wrinklesRaw = isRecord(r.wrinkles) ? r.wrinkles : {};
    const textureRaw = isRecord(r.texture) ? r.texture : {};
    const rednessRaw = isRecord(r.redness) ? r.redness : {};

    return {
      spots: { 
        count: clamp(toNumber(spotsRaw.count, 0)), 
        locations: Array.isArray(spotsRaw.locations) ? spotsRaw.locations : [], 
        severity: clamp(toNumber(spotsRaw.severity, 0)) 
      },
      pores: { 
        averageSize: clamp(toNumber(poresRaw.averageSize ?? poresRaw.average, 0)), 
        enlargedCount: clamp(toNumber(poresRaw.enlargedCount ?? poresRaw.count, 0)), 
        severity: clamp(toNumber(poresRaw.severity, 0)) 
      },
      wrinkles: { 
        count: clamp(toNumber(wrinklesRaw.count, 0)), 
        locations: Array.isArray(wrinklesRaw.locations) ? wrinklesRaw.locations : [], 
        severity: clamp(toNumber(wrinklesRaw.severity, 0)) 
      },
      texture: { 
        smoothness: clamp(toNumber(textureRaw.smoothness ?? textureRaw.score, 0)), 
        roughness: clamp(toNumber(textureRaw.roughness, 0)), 
        score: clamp(toNumber(textureRaw.score, 0)) 
      },
      redness: { 
        percentage: clamp(toNumber(rednessRaw.percentage ?? rednessRaw.coverage, 0), 0, 100), 
        areas: Array.isArray(rednessRaw.areas) ? rednessRaw.areas : [], 
        severity: clamp(toNumber(rednessRaw.severity, 0)) 
      },
    };
  };

  const ai = normalizeAIAnalysis(record.aiAnalysis ?? record.ai);
  const cv = normalizeCVAnalysis(record.cvAnalysis ?? record.cv);

  return {
    id: typeof record.id === 'string' && record.id ? record.id : fallbackId,
    userId: typeof record.userId === 'string' ? record.userId : '',
    createdAt: new Date((record.createdAt ?? record.created_at) as string || Date.now()),
    timestamp: new Date((record.timestamp ?? record.createdAt ?? record.created_at) as string || Date.now()),
    imageUrl: typeof record.imageUrl === 'string' ? record.imageUrl : '',
    ai,
    aiProvider: isAIProvider(record.aiProvider ?? record.provider) ? (record.aiProvider ?? record.provider) as AIProvider : 'gemini',
    cv,
    overallScore: (record.overallScore as any) || { spots: 5, pores: 5, wrinkles: 5, texture: 5, redness: 5, pigmentation: 5 },
    percentiles: (record.percentiles as any) || { spots: 50, pores: 50, wrinkles: 50, texture: 50, redness: 50, overall: 50 },
    confidence: clamp(toNumber(record.confidence ?? ai.confidence, 0.8), 0, 1),
    recommendations: Array.isArray(record.recommendations) ? record.recommendations : [],
    annotatedImages: (record.annotatedImages as any) || {},
  };
};

function AdvancedAnalysisTab({ analysisId, locale }: { analysisId: string; locale: string }) {
  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/analysis/multi-mode?id=${analysisId}`);
        if (!res.ok) throw new Error('Failed to load advanced analysis');
        const data = await res.json();
        if (data.success) setCvData(data.data);
        else throw new Error(data.error || 'Failed to load analysis');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCV();
  }, [analysisId]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-12 h-12 animate-spin text-pink-600" /></div>;
  if (error) return <Alert variant="destructive" className="rounded-[2rem]"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>;

  return <AnalysisDetailClient analysis={cvData} userId={cvData?.user_id} comparisonAnalysis={null} availableAnalyses={[]} />;
}

export default function AnalysisDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const lp = useLocalizePath();
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  
  const [analysis, setAnalysis] = useState<HybridSkinAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [priorityRanking, setPriorityRanking] = useState<PriorityRankingResult | null>(null);
  const [programRecs, setProgramRecs] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { user } = useAuth();
  const allowedRoles = new Set(['sales_staff', 'center_owner', 'center_admin', 'super_admin']);
  const normalized = normalizeRole(user?.role ?? null);
  const canAccessSalesPresentation = allowedRoles.has(normalized);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        setIsAuthenticated(!!data?.user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const loadAnalysis = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/skin-analysis/${id}`);
      if (!res.ok) throw new Error(t('analysis.error' as any) || 'Analysis not found');
      const data = await res.json();
      if (!data.success) throw new Error(t('analysis.error' as any) || 'Analysis not found');

      const normalized = buildHybridAnalysis(data.data, id);
      setAnalysis(normalized);
      setImageUrl(normalized.imageUrl);
      setPriorityRanking(rankSkinConcernPriorities(normalized));
      setProgramRecs(generateProgramRecommendations(normalized, (normalized.ai.skinType as any) || 'normal'));
      setCustomerInfo(data.data.customerInfo || { name: t('roles.client' as any) || 'Client', skinType: normalized.ai.skinType });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analysis');
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (analysisId) loadAnalysis(analysisId);
  }, [analysisId, loadAnalysis]);

  const handleExport = async (format: 'pdf' | 'png') => {
    if (!analysis) return;
    try {
      if (format === 'pdf') await downloadAnalysisPDF(analysis, t.raw('analysis.report') || {}, { locale: locale as 'th' | 'en', clientInfo: customerInfo, photos: imageUrl ? { current: imageUrl } : undefined }, `skin-analysis-${analysisId}.pdf`);
      else if (format === 'png') {
        const blob = await exportToPNG('visia-report');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skin-analysis-${analysisId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Failed to export report');
    }
  };

  const handleShare = async () => {
    if (!analysis) return;
    try { await shareAnalysis(analysis, { title: 'My Skin Analysis Report' }); }
    catch { alert('Sharing not supported on this device'); }
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div className="relative h-20 w-20 mx-auto">
          <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Decoding Aesthetic Sequence...</p>
      </div>
    </div>
  );

  if (error || !analysis) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[2.5rem] p-10 text-center space-y-6">
        <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
          <AlertCircle className="h-10 w-10 text-rose-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">Analysis Node Offline</h3>
          <p className="text-sm text-slate-500 font-light italic">{error || 'Data could not be retrieved'}</p>
        </div>
        <Button onClick={() => router.push(lp('/'))} className="w-full h-14 rounded-xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to System
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-7xl mx-auto flex-1 space-y-16">
          {/* Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" onClick={() => isAuthenticated ? router.push(lp('/analysis/history')) : router.push(lp('/'))}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <BarChart3 className="mr-3 h-3.5 w-3.5" />
                  Dimensional Report Node
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Aesthetic<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Intelligence Report</span>
              </h1>
            </motion.div>

            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
              {canAccessSalesPresentation && (
                <Button onClick={() => router.push(lp(`/sales/presentation/${analysisId}`))} variant="premium" className="h-14 px-8 rounded-xl shadow-premium italic font-black uppercase tracking-widest text-[10px] bg-gradient-to-r from-pink-500 to-purple-600 border-none text-white transition-all hover:scale-105 active:scale-95">
                  <Presentation className="mr-3 h-4 w-4" /> Presentation Mode
                </Button>
              )}
              <Button onClick={() => isAuthenticated && router.push(lp(`/comparison/${analysis.userId}`))} variant="outline" className="h-14 px-8 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">
                <LineChart className="mr-3 h-4 w-4" /> Compare Progress
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-14 px-6 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50">
                    <Globe className="mr-3 h-4 w-4" /> {LANGUAGES.find(l => l.code === locale)?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-slate-100 rounded-2xl p-2 shadow-premium">
                  {LANGUAGES.map(lang => (
                    <DropdownMenuItem key={lang.code} onClick={() => router.push(globalThis.location.pathname.replace(`/${locale}/`, `/${lang.code}/`))} className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600 gap-3">
                      <span>{lang.flag}</span> {lang.name} {locale === lang.code && <Check className="ml-auto h-3 w-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs defaultValue="report" className="space-y-16">
            <div className="flex items-center justify-center">
              <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[1.5rem] h-auto gap-2 shadow-inner flex-wrap justify-center">
                {[
                  { id: 'report', label: 'Summary', icon: FileText },
                  { id: 'priorities', label: 'Priorities', icon: TrendingUp },
                  { id: 'recommendations', label: 'Recommendations', icon: Award },
                  { id: 'advanced', label: '8-Mode', icon: LayoutGrid },
                  { id: '3d', label: '3D View', icon: Box },
                  { id: 'simulator', label: 'Simulator', icon: Wand2 },
                ].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-6 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] italic h-full shadow-sm">
                    <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <TabsContent value="report" className="mt-0 outline-none">
                  <VisiaReport analysis={analysis} customerInfo={customerInfo} locale={locale} onExport={async (f) => {
                    if (f === 'pdf') await downloadAnalysisPDF(analysis, {}, { locale: locale as any, clientInfo: customerInfo, photos: imageUrl ? { current: imageUrl } : undefined }, `skin-analysis-${analysisId}.pdf`);
                    else {
                      const blob = await exportToPNG('visia-report');
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `skin-analysis-${analysisId}.png`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }} onPrint={() => printReport('visia-report')} onShare={handleShare} />
                </TabsContent>
                
                <TabsContent value="priorities" className="mt-0 outline-none">
                  {priorityRanking && <PriorityRankingCard rankingResult={priorityRanking} locale={locale as 'th' | 'en'} onBookAppointment={() => router.push(lp('/booking'))} />}
                </TabsContent>
                
                <TabsContent value="recommendations" className="mt-0 outline-none">
                  {programRecs && <ProgramRecommendations recommendations={programRecs} onBookConsultation={(id) => router.push(lp(`/booking?program=${id}`))} />}
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-0 outline-none">
                  <AdvancedAnalysisTab analysisId={analysisId} locale={locale} />
                </TabsContent>
                
                <TabsContent value="3d" className="mt-0 outline-none">
                  {imageUrl && <Face3DViewer imageUrl={imageUrl} analysisData={{ spots: analysis.cv.spots.severity, wrinkles: analysis.cv.wrinkles.severity, pores: analysis.cv.pores.severity, texture: analysis.cv.texture.score, redness: analysis.cv.redness.severity, overall: analysis.percentiles.overall }} locale={locale} />}
                </TabsContent>
                
                <TabsContent value="simulator" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 text-center space-y-4">
                      <div className="mx-auto h-16 w-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform duration-700">
                        <Wand2 className="h-8 w-8 text-pink-600" />
                      </div>
                      <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Program Effect Simulator</CardTitle>
                      <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Visualize potential improvements after recommended programs</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-16 bg-slate-50/30">
                      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <ProgramSimulator beforeImage={imageUrl || ''} locale={locale} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
