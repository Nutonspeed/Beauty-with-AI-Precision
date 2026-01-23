/**
 * Analysis Integration Page
 * Displays interactive concern markers on skin analysis results
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { InteractivePhotoMarkers } from '@/components/analysis/interactive-markers';
import { ConcernDetailModal } from '@/components/analysis/concern-detail-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Info, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Activity,
  Zap,
  ShieldCheck,
  Target,
  ChevronRight,
  Layers,
  Fingerprint
} from 'lucide-react';
import type {
  HybridSkinAnalysis,
} from '@/lib/types/skin-analysis';
import type {
  InteractiveConcern,
  ConcernLocation,
} from '@/lib/concerns/concern-education';
import {
  convertToInteractiveConcerns,
  getMultipleConcernEducation,
  calculateSkinHealthScore,
  getPriorityConcerns,
  formatConcernType,
  getSeverityColor,
} from '@/lib/concerns/concern-education';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnalysisWithConcernsProps {
  analysis: HybridSkinAnalysis;
  imageUrl: string;
  language?: 'en' | 'th';
}

export function AnalysisWithConcerns({
  analysis,
  imageUrl,
  language: _language = 'en',
}: AnalysisWithConcernsProps) {
  const t = useTranslations('analysis');
  const locale = useLocale();
  const [interactiveConcerns, setInteractiveConcerns] = useState<InteractiveConcern[]>([]);
  const [selectedConcern, setSelectedConcern] = useState<{
    concern: InteractiveConcern;
    location?: ConcernLocation;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);

  // Load concern data
  useEffect(() => {
    const loadConcernData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert analysis results to interactive concerns
        const concerns = convertToInteractiveConcerns(
          analysis.cv,
          analysis.ai?.concerns
        );

        if (concerns.length === 0) {
          setError(t('noConcerns'));
          return;
        }

        // Load education data for all concerns
        const concernTypes = concerns.map(c => c.type);
        const educationMap = await getMultipleConcernEducation(concernTypes);

        // Merge education data with concerns
        const concernsWithEducation = concerns
          .map(concern => ({
            ...concern,
            education: educationMap.get(concern.type) || undefined,
          }))
          .filter(concern => concern.education !== undefined) as InteractiveConcern[];

        setInteractiveConcerns(concernsWithEducation);

        // Calculate health score
        const score = calculateSkinHealthScore(concernsWithEducation);
        setHealthScore(score);
      } catch (err) {
        console.error('Error loading concern data:', err);
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadConcernData();
  }, [analysis, t]);

  // Handle concern marker click
  const handleConcernClick = (
    concern: InteractiveConcern,
    location?: ConcernLocation
  ) => {
    setSelectedConcern({ concern, location });
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Delay clearing selection to allow modal close animation
    setTimeout(() => setSelectedConcern(null), 300);
  };

  // Get priority concerns
  const priorityConcerns = getPriorityConcerns(interactiveConcerns, 3);

  // Get health score color
  const getHealthScoreColor = () => {
    if (healthScore >= 80) return 'text-emerald-600';
    if (healthScore >= 60) return 'text-blue-600';
    if (healthScore >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getHealthScoreIcon = () => {
    if (healthScore >= 80) return <TrendingUp className="h-8 w-8 text-emerald-600" />;
    if (healthScore >= 60) return <Info className="h-8 w-8 text-blue-600" />;
    return <TrendingDown className="h-8 w-8 text-rose-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden">
          <CardContent className="p-12">
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-6">
                <div className="relative h-20 w-20 mx-auto">
                  <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
                  <Activity className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synthesizing Dermal Nodes...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[2.5rem] bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-100 bg-rose-50/50 rounded-[3rem] p-12 text-center space-y-6 shadow-premium">
        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
          <AlertTriangle className="h-10 w-10 text-rose-600" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Diagnostic_Variance</CardTitle>
          <p className="text-sm text-slate-500 font-medium italic leading-relaxed">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Health Score architecture interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-100 transition-all duration-700">
                <ShieldCheck className="h-10 w-10 text-pink-600" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('healthScore' as any) || 'Global_Integrity_Index'}</CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 italic">Composite biological stability verification</CardDescription>
              </div>
            </div>
            <div className={cn("flex items-center gap-6 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-inner group-hover:border-pink-100 transition-all duration-700", getHealthScoreColor())}>
              {getHealthScoreIcon()}
              <div className="text-right">
                <div className="flex items-baseline gap-2 leading-none">
                  <span className="text-6xl font-black italic tracking-tighter uppercase">{healthScore}</span>
                  <span className="text-xl font-black text-slate-300 italic">/100</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">Precision_Verified</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12 lg:p-16 bg-white">
            <div className="space-y-8">
              <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthScore}%` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full shadow-lg relative overflow-hidden",
                    healthScore >= 80 ? 'bg-emerald-500 shadow-glow-emerald/30' :
                    healthScore >= 60 ? 'bg-blue-500 shadow-glow-blue/30' :
                    healthScore >= 40 ? 'bg-amber-500 shadow-glow-amber/30' :
                    'bg-rose-500 shadow-glow-rose/30'
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                </motion.div>
              </div>
              <p className="text-xl text-slate-500 font-light italic leading-relaxed tracking-tight text-center max-w-3xl mx-auto">
                {healthScore >= 80
                  ? (t('excellentCondition' as any) || 'Your biological matrix exhibits exceptional nominal stability across all analyzed spectral nodes.')
                  : healthScore >= 60
                  ? (t('goodCondition' as any) || 'Dermal integrity is maintaining optimal levels with minor regional variance detected in target sectors.')
                  : healthScore >= 40
                  ? (t('fairCondition' as any) || 'Moderate variance detected. Recursive protocol synchronization is recommended to re-establish baseline nominals.')
                  : (t('attentionNeeded' as any) || 'Significant integrity breaches detected. Immediate priority protocol commitment required for biological restoration.')}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Priority Concerns interface */}
      {priorityConcerns.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-6 border-b border-slate-100 pb-8 px-6">
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
              <Target className="h-8 w-8 text-pink-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('priorityConcerns' as any) || 'Critical_Variance_Nodes'}</h2>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Primary optimization targets for clinical intervention</p>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {priorityConcerns.map((concern, idx) => (
              <motion.div
                key={concern.type}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <button
                  onClick={() => handleConcernClick(concern)}
                  className="w-full flex flex-col items-start p-10 rounded-[3rem] border border-slate-100 bg-white hover:border-pink-500/20 shadow-sm hover:shadow-premium transition-all duration-700 text-left group relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover:bg-pink-600 transition-all duration-700" />
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                    <Zap className="w-24 h-24 text-pink-600" />
                  </div>
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-100 transition-all duration-700">
                      {concern.education?.icon || '📍'}
                    </div>
                    <span className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover:text-pink-600 transition-colors">
                      {formatConcernType(concern.type)}
                    </span>
                  </div>
                  <Badge
                    className={cn(
                      "px-5 py-1.5 rounded-full text-[10px] font-black italic shadow-sm border-none uppercase tracking-widest leading-none mb-6 relative z-10",
                      getSeverityStyles(
                        concern.averageSeverity > 7 ? 'high' : concern.averageSeverity > 4 ? 'medium' : 'low'
                      )
                    )}
                  >
                    {t('severity' as any) || 'SEVERITY'}: {concern.averageSeverity.toFixed(1)}/10
                  </Badge>
                  {concern.locations.length > 0 && (
                    <div className="flex items-center gap-3 text-slate-400 relative z-10">
                      <div className="h-1 w-1 rounded-full bg-pink-500/40" />
                      <p className="text-[10px] font-black uppercase tracking-widest italic">
                        {concern.locations.length} {t('location' as any || 'Nodes')}{concern.locations.length > 1 ? 's' : ''} {t('detected' as any) || 'SYNCHRONISED'}
                      </p>
                    </div>
                  )}
                  <div className="mt-auto pt-8 flex items-center text-[10px] font-black uppercase text-pink-600 tracking-widest italic group-hover:translate-x-2 transition-transform">
                    Inference_Details <ChevronRight className="ml-2 h-4 w-4" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Photo interface interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                  <Fingerprint className="h-8 w-8 text-blue-600" />
                </div>
                {t('interactiveTitle' as any) || 'Neural_Mapping_View'}
              </CardTitle>
              <CardDescription className="text-lg text-slate-500 font-light italic leading-relaxed tracking-tight">
                {t('interactiveSubtitle' as any) || 'Interactive spectrum node visualization. Click nodes for heuristic deep-dives.'}
              </CardDescription>
            </div>
            <Badge className="bg-blue-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg uppercase tracking-widest animate-pulse">VOXEL_ACTIVE</Badge>
          </CardHeader>
          <CardContent className="p-12 lg:p-16 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
            <div className="relative z-10 max-w-4xl mx-auto rounded-[3.5rem] overflow-hidden border-4 border-white shadow-premium">
              <InteractivePhotoMarkers
                imageUrl={imageUrl}
                concerns={interactiveConcerns}
                onConcernClick={handleConcernClick}
                enableZoom={true}
                enableLayerToggle={true}
                imageAlt="Skin analysis with interactive markers"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Concerns interface interface */}
      <div className="space-y-8">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-8 px-6">
          <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
            <Layers className="h-8 w-8 text-pink-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('allConcerns' as any) || 'Global_Diagnostic_Registry'}</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Complete biometric variance load catalog [{interactiveConcerns.length} NODES]</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {interactiveConcerns.map((concern, idx) => (
            <motion.div
              key={concern.type}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => handleConcernClick(concern)}
                className="w-full flex items-center gap-6 p-6 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-pink-500/20 transition-all duration-500 text-left group shadow-inner hover:shadow-sm"
              >
                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {concern.education?.icon || '📍'}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="font-black text-slate-950 italic uppercase tracking-tight group-hover:text-pink-600 transition-colors truncate">
                    {formatConcernType(concern.type)}
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={cn("h-1.5 w-16 rounded-full shadow-inner p-0.5 relative overflow-hidden bg-slate-100")}
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{
                          width: '100%',
                          backgroundColor: getSeverityColor(
                            concern.averageSeverity > 7 ? 'high' : concern.averageSeverity > 4 ? 'medium' : 'low'
                          ),
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 italic uppercase">
                      {concern.averageSeverity.toFixed(1)}th
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-pink-600 transition-all group-hover:translate-x-1" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-10 lg:p-12 py-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between rounded-[3.5rem] opacity-40 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Integration_Stability_Verified: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-pink-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Core-Analytics-v4.8</p>
      </div>

      {/* Detail interface Modal interface */}
      <ConcernDetailModal
        concern={selectedConcern?.concern || null}
        location={selectedConcern?.location}
        language={locale as 'en' | 'th'}
        open={isModalOpen}
        onOpenChange={handleModalClose}
      />
    </div>
  );
}
