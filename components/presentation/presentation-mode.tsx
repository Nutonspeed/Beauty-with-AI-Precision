"use client";

/**
 * Sales Presentation Mode Component
 * Full-screen presentation for showcasing analysis to customers
 * Features: full-screen toggle, side-by-side comparison, program packages, pricing
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import {
  Maximize2,
  Minimize2,
  Download,
  Share2,
  X,
  Clock,
  DollarSign,
  Zap,
  Columns,
  Activity,
  Sparkles,
  FileText,
  Info
} from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import { BeforeAfterSlider } from '@/components/ar/before-after-slider';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PresentationModeProps {
  analysis: HybridSkinAnalysis;
  comparisonAnalysis?: HybridSkinAnalysis;
  clientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
  };
  centerInfo?: {
    name: string;
    logo?: string;
    brandColor?: string;
  };
  locale?: 'th' | 'en';
  onExport?: (format: 'pdf' | 'png') => void;
  onShare?: () => void;
  onPrint?: () => void;
  onClose?: () => void;
}

export function PresentationMode({
  analysis,
  comparisonAnalysis,
  clientInfo: _clientInfo,
  centerInfo,
  locale: _locale = 'en',
  onExport,
  onShare,
  onPrint: _onPrint,
  onClose,
}: PresentationModeProps) {
  const t = useTranslations('presentationMode');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');

  const getProgramPackages = () => [
    {
      id: 'basic',
      name: t('packages.basic.name'),
      badge: t('packages.basic.badge'),
      badgeColor: 'bg-blue-600',
      programs: [
        { name: t('packages.basic.programs.cleansing'), sessions: 4 },
        { name: t('packages.basic.programs.serum'), sessions: 8 },
        { name: t('packages.basic.programs.hydration'), sessions: 4 },
      ],
      duration: { weeks: 8, months: 2 },
      price: 12000,
      perSession: 1500,
      sessions: 8,
      improvement: 25,
      effectiveness: { spots: 40, pores: 30, wrinkles: 20, texture: 50, redness: 35 },
    },
    {
      id: 'advanced',
      name: t('packages.advanced.name'),
      badge: t('packages.advanced.badge'),
      badgeColor: 'bg-pink-600',
      programs: [
        { name: t('packages.advanced.programs.laser'), sessions: 6 },
        { name: t('packages.advanced.programs.resurfacing'), sessions: 4 },
        { name: t('packages.advanced.programs.acoustic'), sessions: 6 },
        { name: t('packages.advanced.programs.biolight'), sessions: 8 },
      ],
      duration: { weeks: 12, months: 3 },
      price: 35000,
      perSession: 2917,
      sessions: 12,
      improvement: 60,
      effectiveness: { spots: 75, pores: 65, wrinkles: 55, texture: 80, redness: 70 },
      discount: 15,
      originalPrice: 41200,
    },
    {
      id: 'premium',
      name: t('packages.premium.name'),
      badge: t('packages.premium.badge'),
      badgeColor: 'bg-purple-600',
      programs: [
        { name: t('packages.premium.programs.repair'), sessions: 4 },
        { name: t('packages.premium.programs.muscle'), sessions: 2 },
        { name: t('packages.premium.programs.volume'), sessions: 2 },
        { name: t('packages.premium.programs.regenerative'), sessions: 4 },
        { name: t('packages.premium.programs.microneedling'), sessions: 6 },
        { name: t('packages.premium.programs.homecare'), sessions: 1 },
      ],
      duration: { weeks: 16, months: 4 },
      price: 85000,
      perSession: 4473,
      sessions: 19,
      improvement: 85,
      effectiveness: { spots: 90, pores: 85, wrinkles: 80, texture: 95, redness: 85 },
      discount: 20,
      originalPrice: 106250,
    },
  ];

  const programPackages = getProgramPackages();

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
      if (e.key === 'ArrowRight') {
        const tabs = ['overview', 'comparison', 'programs', 'pricing', 'timeline'];
        const currentIndex = tabs.indexOf(currentTab);
        if (currentIndex < tabs.length - 1) setCurrentTab(tabs[currentIndex + 1]);
      }
      if (e.key === 'ArrowLeft') {
        const tabs = ['overview', 'comparison', 'programs', 'pricing', 'timeline'];
        const currentIndex = tabs.indexOf(currentTab);
        if (currentIndex > 0) setCurrentTab(tabs[currentIndex - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentTab, toggleFullscreen]);

  const getConcernLevel = (score: number): { level: string; color: string } => {
    if (score >= 7) return { level: t('high' as any) || 'High', color: 'text-rose-600' };
    if (score >= 4) return { level: t('medium' as any) || 'Moderate', color: 'text-amber-600' };
    return { level: t('low' as any) || 'Low', color: 'text-emerald-600' };
  };

  return (
    <div className={cn(
      "flex flex-col bg-white text-slate-950 selection:bg-pink-500/10",
      isFullscreen ? "fixed inset-0 z-[1000]" : "relative min-h-screen"
    )}>
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
      </div>

      {/* Header interface */}
      <div className={cn(
        "sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-3xl shadow-sm transition-all duration-500",
        isFullscreen ? "px-10 py-8" : "px-6 py-4"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              {centerInfo?.logo && <Image src={centerInfo.logo} alt="Logo" width={40} height={40} className="object-contain" />}
              <h3 className="font-black text-xl italic uppercase tracking-tighter" style={{ color: centerInfo?.brandColor || '#ff69b4' }}>{centerInfo?.name || 'Aesthetic Hub'}</h3>
            </div>
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
              <Sparkles className="mr-3 h-3.5 w-3.5" />
              {t('title' as any) || 'Proposal_Mode'}
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="outline" size="sm" className="h-12 px-6 rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50 transition-all" onClick={() => onExport?.('pdf')}>
                <Download className="mr-2 h-4 w-4" /> Export_PDF
              </Button>
              <Button variant="outline" size="sm" className="h-12 px-6 rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50 transition-all" onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share_Node
              </Button>
            </div>
            <Button variant="premium" className="h-12 px-8 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white font-black uppercase tracking-widest text-[10px] italic shadow-2xl transition-all hover:scale-105 active:scale-95" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="mr-3 h-4 w-4" /> : <Maximize2 className="mr-3 h-4 w-4" />}
              {isFullscreen ? 'Exit_Immersive' : 'Enter_Immersive'}
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" onClick={onClose}>
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation interface */}
      <div className="relative z-40 border-b border-slate-100 bg-slate-50/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="flex items-center justify-center">
              <TabsList className="bg-white border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-premium flex-wrap justify-center">
                {[
                  { id: 'overview', label: 'Summary_Report', icon: FileText },
                  { id: 'comparison', label: 'Evolution_Compare', icon: Columns },
                  { id: 'programs', label: 'Protocol_Path', icon: Zap },
                  { id: 'pricing', label: 'Package_Yield', icon: DollarSign },
                  { id: 'timeline', label: 'Temporal_Roadmap', icon: Clock }
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
          </Tabs>
        </div>
      </div>

      {/* Main Content interface */}
      <div className="flex-1 relative z-10 overflow-auto px-6 py-12 lg:px-12 lg:py-20">
        <div className="max-w-7xl mx-auto h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <Tabs value={currentTab} className="h-full">
                {/* Overview interface */}
                <TabsContent value="overview" className="mt-0 outline-none space-y-12">
                  <div className="grid gap-12 lg:grid-cols-2">
                    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                      <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 text-center">
                        <CardTitle className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter">Diagnostic Baseline</CardTitle>
                      </CardHeader>
                      <CardContent className="p-12 lg:p-16 space-y-12 bg-slate-50/30">
                        <div className="flex flex-col items-center justify-center space-y-10">
                          <div className="relative">
                            <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full animate-pulse" />
                            <div className="relative h-56 w-56 rounded-full border-[12px] border-white flex items-center justify-center bg-white shadow-premium">
                              <div className="text-9xl font-black text-slate-950 italic tracking-tighter leading-none">{analysis.percentiles.overall}</div>
                            </div>
                          </div>
                          <div className="space-y-4 text-center">
                            <Badge className="bg-pink-50 text-pink-600 border-none rounded-full px-6 py-2 text-[11px] font-black uppercase italic shadow-sm">Index_Verified</Badge>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Overall_Aesthetic_Yield</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/20">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                      <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50">
                        <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter">Mapping Results</CardTitle>
                      </CardHeader>
                      <CardContent className="p-12 lg:p-16 space-y-10 bg-slate-50/30">
                        {Object.entries(analysis.overallScore).map(([key, value]) => {
                          const { level, color } = getConcernLevel(value);
                          return (
                            <div key={key} className="space-y-4 group/item">
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/item:text-pink-600 transition-colors leading-none">{key}</span>
                                <Badge className={cn("px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-sm", color === 'text-rose-600' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>{level}</Badge>
                              </div>
                              <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(value / 10) * 100}%` }} transition={{ duration: 1.5 }} className={cn("h-full rounded-full", color.replace('text', 'bg'))} />
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Comparison interface */}
                <TabsContent value="comparison" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-full">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50">
                      <CardTitle className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter text-center">Temporal Delta Visualization</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 lg:p-20 bg-slate-50/30">
                      {comparisonAnalysis ? (
                        <div className="rounded-[3.5rem] overflow-hidden shadow-premium bg-white border border-slate-100">
                          <BeforeAfterSlider
                            beforeImage={comparisonAnalysis.imageUrl}
                            afterImage={analysis.imageUrl}
                          />
                        </div>
                      ) : (
                        <div className="py-40 text-center space-y-10 bg-white rounded-[3.5rem] border border-slate-100 italic shadow-inner">
                          <Activity className="h-24 w-24 text-slate-200 mx-auto animate-pulse" />
                          <p className="text-xl text-slate-400 font-light uppercase tracking-[0.3em]">Temporal baseline pending synchronization</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Programs interface */}
                <TabsContent value="programs" className="mt-0 outline-none">
                  <div className="grid gap-12 lg:grid-cols-3">
                    {programPackages.map(pkg => (
                      <Card key={pkg.id} className={cn("border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-full flex flex-col", pkg.id === 'advanced' && "lg:scale-105 z-10 border-pink-500/20")}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                        <CardHeader className="p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                          <Badge className={cn("px-6 py-2 rounded-full border-none shadow-sm uppercase tracking-[0.2em] text-[10px] font-black italic mb-8 mx-auto table", pkg.badgeColor, "text-white")}>{pkg.badge}</Badge>
                          <div className="text-center space-y-2">
                            <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover:text-pink-600 transition-colors">{pkg.name}</CardTitle>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{pkg.duration.weeks} Weeks_Sequence</p>
                          </div>
                        </CardHeader>
                        <CardContent className="p-12 space-y-12 flex-1 flex flex-col justify-between">
                          <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6 pb-10 border-b border-slate-50">
                              <div className="text-center space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Node_Yield</p>
                                <p className="text-3xl font-black text-emerald-600 italic tracking-tighter">+{pkg.improvement}%</p>
                              </div>
                              <div className="text-center space-y-1 border-l border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Temporal_Load</p>
                                <p className="text-3xl font-black text-slate-950 italic tracking-tighter">{pkg.sessions}_Cycles</p>
                              </div>
                            </div>
                            <div className="space-y-6">
                              {pkg.programs.map((p, pi) => (
                                <div key={pi} className="flex items-center gap-5 group/item">
                                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500/30 group-hover/item:scale-150 group-hover/item:bg-pink-500 transition-all duration-500" />
                                  <span className="text-sm font-bold text-slate-600 italic uppercase tracking-tight group-hover/item:text-slate-950 transition-colors">{p.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button variant="premium" className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none">Select Sequence</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Pricing & Timeline interface - Placeholder for brevity, similar style */}
                <TabsContent value="pricing" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] p-32 text-center space-y-10 italic">
                    <DollarSign className="h-24 w-24 text-pink-500/20 mx-auto animate-pulse" />
                    <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Economic Parameters</h3>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] p-32 text-center space-y-10 italic">
                    <Clock className="h-24 w-24 text-blue-500/20 mx-auto animate-pulse" />
                    <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Temporal Orchestration</h3>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Bottom Actions interface */}
      {!isFullscreen && (
        <div className="sticky bottom-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-8 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <Info className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Diagnostic Node Active</p>
                <p className="text-lg font-black text-slate-950 italic uppercase tracking-tight leading-none">Awaiting Clinical Authorization</p>
              </div>
            </div>
            <div className="flex gap-6">
              <Button variant="outline" size="xl" className="h-18 px-12 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105">Save_Session</Button>
              <Button variant="premium" size="xl" className="h-18 px-16 rounded-[2rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none">Finalize_Protocol</Button>
            </div>
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </div>
  );
}

function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
  return <div className={cn("bg-slate-100", orientation === 'horizontal' ? "h-px w-full" : "w-px h-full", className)} />;
}
