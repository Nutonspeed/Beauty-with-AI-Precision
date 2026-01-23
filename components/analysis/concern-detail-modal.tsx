"use client"

/**
 * Concern Detail Modal interface
 * Displays comprehensive educational content for a skin concern node
 */

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Info, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Printer,
  Zap,
  Activity,
  ChevronRight,
  Target,
  FlaskConical,
  Sun,
  Moon
} from 'lucide-react';
import type { InteractiveConcern, ConcernLocation } from '@/lib/concerns/concern-education';
import { formatConcernType } from '@/lib/concerns/concern-education';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConcernDetailModalProps {
  concern: InteractiveConcern | null;
  location?: ConcernLocation;
  language?: 'en' | 'th';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConcernDetailModal({
  concern,
  location,
  language: _language = 'en',
  open,
  onOpenChange,
}: ConcernDetailModalProps) {
  const t = useTranslations('concernDetail');
  const locale = useLocale() as 'en' | 'th';
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'th'>(locale);

  if (!concern?.education) return null;

  const { education } = concern;
  const severity = location?.severity || concern.averageSeverity > 7 ? 'high' : concern.averageSeverity > 4 ? 'medium' : 'low';
  
  const getProgramOptions = () => {
    if (!education.program) return [];
    if ('mild' in education.program) {
      return (education.program as any)[severity === 'low' ? 'mild' : severity === 'medium' ? 'moderate' : 'severe']?.options || [];
    }
    if ('fine_lines' in education.program) {
      const level = concern.averageSeverity < 4 ? 'fine_lines' : concern.averageSeverity < 7 ? 'moderate' : 'severe';
      return (education.program as any)[level]?.options || [];
    }
    return [];
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case 'low': return 'bg-emerald-50 text-emerald-600 shadow-glow-emerald/20';
      case 'medium': return 'bg-amber-50 text-amber-600 shadow-glow-amber/20';
      case 'high': return 'bg-rose-50 text-rose-600 shadow-glow-rose/20';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white border-slate-100 rounded-[4rem] p-0 overflow-hidden shadow-premium selection:bg-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
        
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header interface */}
          <div className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="h-20 w-20 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-700">
                {education.icon}
              </div>
              <div className="space-y-3">
                <DialogTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                  {formatConcernType(concern.type)}
                </DialogTitle>
                <DialogDescription className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight max-w-2xl">
                  {education.definition[currentLanguage]}
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-12 px-6 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[9px] italic shadow-sm hover:bg-slate-50 transition-all"
                onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'th' : 'en')}
              >
                {currentLanguage === 'en' ? 'TH_SYNC' : 'EN_SYNC'}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl border-slate-200 bg-white text-slate-300 hover:text-blue-600 transition-all shadow-sm"
                onClick={handlePrint}
              >
                <Printer className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="px-10 lg:p-12 py-6 border-b border-slate-50 bg-white flex flex-wrap items-center gap-6">
            <Badge className={cn("px-6 py-2 rounded-full border-none shadow-lg text-[10px] font-black italic uppercase tracking-widest leading-none", getSeverityStyles(severity))}>
              {severity.toUpperCase()}_VARIANCE // {concern.averageSeverity.toFixed(1)}th
            </Badge>
            {concern.locations.length > 0 && (
              <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 px-5 py-1.5 rounded-full text-[9px] font-black italic uppercase shadow-sm">
                {(t('locations' as any) || '{count} Nodes Detected').replace('{count}', String(concern.locations.length))}
              </Badge>
            )}
            {location && (
              <div className="flex items-center gap-3 bg-white px-5 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{(t('confidence' as any) || 'Precision: {value}%').replace('{value}', String(Math.round(location.confidence * 100)))}</span>
              </div>
            )}
          </div>

          {/* Tabs Navigation interface */}
          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
            <div className="px-10 lg:p-12 py-6 bg-slate-50/30 border-b border-slate-50">
              <TabsList className="bg-white border border-slate-100 p-1.5 rounded-2xl h-auto gap-2 shadow-inner flex-wrap">
                {[
                  { id: 'overview', label: t('overview' as any) || 'Synthesis', icon: Info },
                  { id: 'causes', label: t('causes' as any) || 'Catalysts', icon: AlertCircle },
                  { id: 'prevention', label: t('prevention' as any) || 'Mitigation', icon: ShieldCheck },
                  { id: 'program', label: t('program' as any) || 'Protocol', icon: Sparkles },
                  { id: 'routine', label: t('routine' as any) || 'Temporal_Sync', icon: Calendar }
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="rounded-xl px-6 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[9px] shadow-sm italic h-full"
                  >
                    <tab.icon className="mr-3 h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <ScrollArea className="flex-1 min-h-0 bg-white">
              <div className="p-10 lg:p-16">
                <AnimatePresence mode="wait">
                  <TabsContent value="overview" className="mt-0 outline-none space-y-12">
                    {education.statistics && (
                      <div className="rounded-[3rem] border border-blue-100 p-10 bg-blue-50/30 relative overflow-hidden group/stats shadow-inner">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover/stats:scale-110 transition-transform duration-1000">
                          <Activity className="w-32 h-32 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter mb-8 flex items-center gap-5 relative z-10">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Info className="h-5 w-5 text-blue-600" />
                          </div>
                          {t('keyStatistics' as any) || 'Sector_Demographics'}
                        </h3>
                        <ul className="grid gap-6 relative z-10">
                          {Object.entries(education.statistics).map(([key, value], i) => (
                            <motion.li 
                              key={key} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-6 group/item p-4 rounded-2xl hover:bg-white transition-all duration-500"
                            >
                              <div className="h-10 w-10 rounded-xl bg-white border border-blue-50 flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              </div>
                              <span className="text-lg text-slate-600 font-medium italic leading-relaxed tracking-tight group-hover/item:text-slate-950 transition-colors">{value}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {education.myths && education.myths.length > 0 && (
                      <div className="space-y-10">
                        <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter flex items-center gap-5 ml-4">
                          <div className="p-2 bg-rose-50 rounded-xl shadow-sm">
                            <XCircle className="h-5 w-5 text-rose-600" />
                          </div>
                          {t('commonMyths' as any) || 'Heuristic_Fallacies'}
                        </h3>
                        <div className="grid gap-8">
                          {education.myths.map((myth, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-premium transition-all duration-700 group/myth"
                            >
                              <div className="p-8 bg-rose-50/30 border-b border-rose-100 flex flex-col md:flex-row md:items-center gap-6">
                                <Badge className="bg-rose-600 text-white border-none px-4 py-1 rounded-full text-[8px] font-black italic uppercase tracking-widest shrink-0 w-fit">{t('myth' as any) || 'MYTH'}</Badge>
                                <p className="text-lg font-black text-slate-950 italic leading-relaxed tracking-tight">"{myth.myth}"</p>
                              </div>
                              <div className="p-8 bg-white flex flex-col md:flex-row md:items-center gap-6">
                                <Badge className="bg-emerald-500 text-white border-none px-4 py-1 rounded-full text-[8px] font-black italic uppercase tracking-widest shrink-0 w-fit">{t('fact' as any) || 'FACT'}</Badge>
                                <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/myth:text-slate-900 transition-colors">"{myth.fact}"</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {education.relatedConcerns && education.relatedConcerns.length > 0 && (
                      <div className="space-y-6 pt-10 border-t border-slate-50">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic ml-4">{t('relatedConcerns' as any) || 'Adjacent_Variance_Nodes'}</h3>
                        <div className="flex flex-wrap gap-4">
                          {education.relatedConcerns.map((relatedType) => (
                            <Badge key={relatedType} variant="outline" className="px-6 py-2 rounded-full border-slate-100 bg-slate-50 text-slate-500 text-[10px] font-black italic uppercase shadow-sm hover:border-pink-500/20 hover:text-pink-600 transition-all cursor-default">
                              {formatConcernType(relatedType as any)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="causes" className="mt-0 outline-none space-y-10">
                    <div className="p-10 lg:p-16 rounded-[4rem] border border-slate-100 bg-slate-50/30 relative overflow-hidden group/causes shadow-inner">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/causes:scale-110 transition-transform duration-1000">
                        <Zap className="w-48 h-48 text-rose-600" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter mb-12 leading-none relative z-10">{(t('whatCauses' as any) || 'Primary_Catalysts').replace('{concern}', formatConcernType(concern.type))}</h3>
                      <ul className="grid gap-8 relative z-10">
                        {education.causes[currentLanguage].map((cause, index) => (
                          <motion.li 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-8 group/item"
                          >
                            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-2xl italic text-rose-600 shadow-sm group-hover/item:scale-110 transition-all duration-700">
                              {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="space-y-2 pt-2">
                              <p className="text-xl text-slate-600 font-medium italic leading-relaxed tracking-tight group-hover/item:text-slate-950 transition-colors">{cause}</p>
                              <div className="h-0.5 w-8 bg-rose-500/20 group-hover/item:w-16 group-hover/item:bg-rose-500 transition-all duration-700 rounded-full" />
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="prevention" className="mt-0 outline-none space-y-10">
                    <div className="p-10 lg:p-16 rounded-[4rem] border border-emerald-100 bg-emerald-50/20 relative overflow-hidden group/prevent shadow-inner">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/prevent:scale-110 transition-transform duration-1000">
                        <ShieldCheck className="w-48 h-48 text-emerald-600" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter mb-12 leading-none relative z-10 flex items-center gap-6">
                        <div className="p-4 bg-white rounded-[1.5rem] shadow-sm">
                          <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                        {(t('howToPrevent' as any) || 'Mitigation_Strategies').replace('{concern}', formatConcernType(concern.type))}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8 relative z-10">
                        {education.prevention[currentLanguage].map((tip, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-[3rem] bg-white border border-emerald-100 shadow-sm group/tip hover:border-emerald-500/20 transition-all duration-700"
                          >
                            <div className="flex items-start gap-6">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover/tip:scale-110 transition-transform">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                              </div>
                              <p className="text-lg text-slate-600 font-medium italic leading-relaxed tracking-tight group-hover/tip:text-slate-950 transition-colors">{tip}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="program" className="mt-0 outline-none space-y-12">
                    <div className="p-10 lg:p-16 rounded-[4rem] border border-purple-100 bg-purple-50/20 relative overflow-hidden group/program shadow-inner">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/program:scale-110 transition-transform duration-1000">
                        <Sparkles className="w-48 h-48 text-purple-600" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter mb-12 leading-none relative z-10 flex items-center gap-6">
                        <div className="p-4 bg-white rounded-[1.5rem] shadow-sm">
                          <Sparkles className="h-8 w-8 text-purple-600" />
                        </div>
                        {(t('recommendedProgram' as any) || 'Synthesis_Protocol').replace('{severity}', severity.toUpperCase())}
                      </h3>
                      <div className="grid gap-6 relative z-10">
                        {getProgramOptions().map((option: string, index: number) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-8 group/opt p-6 rounded-[2rem] bg-white/50 border border-white hover:bg-white hover:border-purple-200 transition-all duration-700 shadow-sm"
                          >
                            <div className="h-12 w-12 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-xl font-black italic text-purple-600 shadow-sm group-hover/opt:scale-110 transition-transform">
                              {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <span className="text-xl text-slate-600 font-medium italic uppercase tracking-tight group-hover/opt:text-purple-600 transition-colors leading-none">{option}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {education.whenToSeeDermatologist && (
                      <div className="p-10 lg:p-16 rounded-[4rem] border border-amber-100 bg-amber-50/20 relative overflow-hidden group/warn shadow-inner">
                        <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter mb-10 flex items-center gap-5 relative z-10">
                          <div className="p-2 bg-white rounded-xl shadow-sm border border-amber-100">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          </div>
                          {t('whenToSeeDermatologist' as any) || 'Critical_Escalation_Pathways'}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8 relative z-10">
                          {education.whenToSeeDermatologist[currentLanguage].map((scenario, index) => (
                            <motion.div 
                              key={index} 
                              className="flex items-start gap-6 group/item"
                            >
                              <div className="h-10 w-10 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                              </div>
                              <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/item:text-slate-950 transition-colors">{scenario}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(education as any).ingredients && (
                      <div className="space-y-10">
                        <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter flex items-center gap-5 ml-4">
                          <div className="p-2 bg-blue-50 rounded-xl shadow-sm border border-blue-100">
                            <FlaskConical className="h-5 w-5 text-blue-600" />
                          </div>
                          {t('effectiveIngredients' as any) || 'Validated_Molecular_Actives'}
                        </h3>
                        <div className="grid gap-10 md:grid-cols-2">
                          {['proven', 'effective'].map((type) => {
                            const ings = (education as any).ingredients[type];
                            if (!ings) return null;
                            return (
                              <div key={type} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">{type === 'proven' ? (t('provenIngredients' as any) || 'PHARMA_GRADE') : (t('effectiveIngredients' as any) || 'AUXILIARY_NODES')}</p>
                                <div className="flex flex-wrap gap-4">
                                  {ings.map((ingredient: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="px-6 py-2.5 rounded-full border-slate-200 bg-white text-slate-900 text-sm font-bold italic shadow-sm hover:border-blue-500/20 hover:text-blue-600 transition-all uppercase tracking-tight">
                                      {ingredient}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="routine" className="mt-0 outline-none space-y-12">
                    {education.dailyRoutine && (
                      <div className="grid gap-10">
                        {[
                          { id: 'morning', label: t('morningRoutine' as any) || 'Morning_Sequence', icon: Sun, color: "text-amber-500", bg: "bg-amber-50", data: education.dailyRoutine.morning },
                          { id: 'evening', label: t('eveningRoutine' as any) || 'Evening_Sequence', icon: Moon, color: "text-blue-600", bg: "bg-blue-50", data: education.dailyRoutine.evening },
                          { id: 'weekly', label: t('weeklyPrograms' as any) || 'Cyclical_Protocols', icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", data: education.dailyRoutine.weekly }
                        ].map((routine) => {
                          if (!routine.data) return null;
                          return (
                            <motion.div 
                              key={routine.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-10 lg:p-16 rounded-[4rem] border border-slate-100 bg-slate-50/30 relative overflow-hidden group/routine shadow-inner hover:bg-white hover:border-pink-500/10 transition-all duration-700"
                            >
                              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/routine:scale-110 group-hover/routine:rotate-12 transition-transform duration-1000">
                                <routine.icon className="w-48 h-48" />
                              </div>
                              <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter mb-12 flex items-center gap-6 relative z-10 leading-none">
                                <div className={cn("p-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm", routine.color)}>
                                  <routine.icon className="h-8 w-8" />
                                </div>
                                {routine.label}
                              </h3>
                              <div className="grid gap-6 relative z-10">
                                {routine.data.map((step, idx) => (
                                  <div key={idx} className="flex items-center gap-8 group/step p-6 rounded-[2.5rem] bg-white/50 border border-white hover:bg-white hover:border-slate-200 transition-all duration-700 shadow-sm">
                                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-xl italic text-slate-300 shadow-sm group-hover/step:text-pink-600 transition-colors">
                                      {(idx + 1).toString().padStart(2, '0')}
                                    </div>
                                    <span className="text-xl text-slate-600 font-medium italic uppercase tracking-tight group-hover/step:text-slate-950 transition-colors leading-none">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </AnimatePresence>
              </div>
            </ScrollArea>
          </Tabs>

          {/* Footer interface */}
          <div className="p-10 lg:p-12 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
                <Target className="h-6 w-6" />
              </div>
              <p className="text-lg text-slate-500 font-medium italic leading-none max-w-xl">
                {t('consistencyTip' as any) || 'Long-term protocol adherence is essential for achieving projected dermal yield nominals.'}
              </p>
            </div>
            <Button 
              size="xl" 
              onClick={() => onOpenChange(false)}
              className="h-18 px-12 rounded-[2rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none group/btn"
            >
              Terminate_Session
              <ChevronRight className="ml-4 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Moon(props: any) {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  )
}
