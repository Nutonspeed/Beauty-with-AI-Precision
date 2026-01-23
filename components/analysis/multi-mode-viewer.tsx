"use client"

/**
 * Multi-Mode Skin Visualization interface
 * displays 8-panel skin analysis visualization nodes
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Activity, Target, Zap, Layers, Sparkles, Box, ChevronRight, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface AnalysisMode {
  id: string
  name: string
  count: number
  color: string // filter overlay color
  description: string
}

export interface MultiModeViewerProps {
  originalImage: string
  modes: AnalysisMode[]
  detectionData?: {
    spots?: Array<{ x: number; y: number; radius: number }>
    wrinkles?: Array<{ x1: number; y1: number; x2: number; y2: number }>
    pores?: Array<{ x: number; y: number; size: number }>
    redness?: Array<{ x: number; y: number; width: number; height: number }>
  }
}

const DEFAULT_MODES: any[] = [
  { id: 'spots', color: 'rgba(255, 105, 180, 0.3)', icon: Target },
  { id: 'wrinkles', color: 'rgba(139, 92, 246, 0.3)', icon: Activity },
  { id: 'texture', color: 'rgba(3, 169, 244, 0.3)', icon: Sparkles },
  { id: 'pores', color: 'rgba(16, 185, 129, 0.3)', icon: Box },
  { id: 'uv_spots', color: 'rgba(245, 158, 11, 0.4)', icon: Zap },
  { id: 'brown_spots', color: 'rgba(180, 83, 9, 0.4)', icon: Layers },
  { id: 'red_areas', color: 'rgba(225, 29, 72, 0.3)', icon: Activity },
  { id: 'porphyrins', color: 'rgba(6, 182, 212, 0.4)', icon: Zap },
]

export function MultiModeViewer({ 
  originalImage, 
  modes = DEFAULT_MODES,
  detectionData 
}: MultiModeViewerProps) {
  const t = useTranslations('multiModeViewer')
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header interface */}
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm animate-pulse italic">
          <Layers className="mr-3 h-3.5 w-3.5" />
          Multi-Spectrum_Node_Matrix
        </Badge>
        <h2 className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
          {t('title' as any) || 'Dermal_Spectrum_Synthesis'}
        </h2>
        <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight">
          {t('subtitle' as any) || 'Autonomous multi-node skin visualization across 8 spectrum vectors.'}
        </p>
      </div>

      {/* 8-Panel Grid interface */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {modes.map((mode, _idx) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all duration-700 hover:shadow-premium border-slate-100 bg-white overflow-hidden group/panel h-full flex flex-col relative",
                selectedMode === mode.id ? "ring-4 ring-pink-500/20 border-pink-500/30 scale-[1.02] z-10" : "hover:border-blue-500/20"
              )}
              onClick={() => setSelectedMode(selectedMode === mode.id ? null : mode.id)}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover/panel:opacity-100 transition-opacity" />
              <CardContent className="p-0 flex-1 flex flex-col">
                {/* Image Asset with Overlays interface */}
                <div className="relative aspect-square overflow-hidden bg-slate-950 group/viewport">
                  <Image
                    src={originalImage}
                    alt={mode.name}
                    fill
                    className="object-cover opacity-90 transition-transform duration-[3000ms] group-hover/panel:scale-110"
                    unoptimized
                  />
                  {/* Neural spectrum overlay interface */}
                  <div 
                    className="absolute inset-0 mix-blend-multiply transition-opacity duration-1000"
                    style={{ backgroundColor: mode.color }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
                  
                  {/* Recognition markers interface */}
                  {detectionData && renderDetectionMarkers(mode.id, detectionData)}

                  {/* Voxel count badge interface */}
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-slate-950/80 backdrop-blur-md text-white border-none px-4 py-1 rounded-full text-[10px] font-black italic shadow-2xl tracking-widest uppercase">
                      {mode.count} NODES
                    </Badge>
                  </div>
                  
                  {/* Mode icon interface */}
                  <div className="absolute top-6 right-6">
                    <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-2xl group-hover/panel:scale-110 transition-transform duration-700">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Label Architecture interface */}
                <div className="p-6 bg-slate-950 text-white space-y-1 relative overflow-hidden group-hover/panel:bg-pink-600 transition-colors duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/panel:translate-x-[100%] transition-transform duration-1000" />
                  <div className="font-black text-sm italic uppercase tracking-tighter relative z-10 leading-none">{t(`${mode.id}.name` as any) || mode.id.toUpperCase()}</div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic group-hover/panel:text-white/60 transition-colors relative z-10">{t(`${mode.id}.desc` as any) || 'BIOMETRIC_SYNC_ACTIVE'}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Mode Deep-Dive interface */}
      <AnimatePresence mode="wait">
        {selectedMode && (
          <motion.div
            key="selected-mode-detail"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-10">
                {(() => {
                  const mode = modes.find(m => m.id === selectedMode)
                  if (!mode) return null
                  
                  return (
                    <>
                      <div className="flex items-center gap-10">
                        <div className="h-24 w-24 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center text-5xl shadow-sm group-hover:scale-110 transition-transform duration-700">
                          <Layers className="h-12 w-12 text-pink-600" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t(`${mode.id}.name` as any) || mode.id.toUpperCase()}</h3>
                          <p className="text-lg text-slate-500 font-medium italic tracking-tight leading-relaxed">{t(`${mode.id}.desc` as any) || 'Heuristic spectrum analysis node active.'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 shrink-0">
                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Voxel_Count</p>
                          <div className="text-5xl font-black text-slate-950 italic tracking-tighter leading-none uppercase">{mode.count}</div>
                        </div>
                        <Badge className="bg-pink-600 text-white border-none px-8 py-2.5 rounded-full text-[11px] font-black italic shadow-lg uppercase tracking-widest animate-pulse leading-none">INFERENCE_SYNCED</Badge>
                      </div>
                    </>
                  )
                })()}
              </CardHeader>

              <CardContent className="p-12 lg:p-16 space-y-16 bg-white relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
                {(() => {
                  const mode = modes.find(m => m.id === selectedMode)
                  if (!mode) return null
                  
                  return (
                    <div className="space-y-16 relative z-10">
                      {/* Detailed interface viewport interface */}
                      <div className="relative aspect-video rounded-[4rem] overflow-hidden border-4 border-white shadow-premium bg-slate-950 group/zoom-view">
                        <Image
                          src={originalImage}
                          alt={`${mode.name} detailed view`}
                          fill
                          className="object-contain transition-transform duration-[5000ms] group-hover/zoom-view:scale-110"
                          unoptimized
                        />
                        <div 
                          className="absolute inset-0 mix-blend-multiply transition-opacity duration-1000"
                          style={{ backgroundColor: mode.color }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
                        {detectionData && renderDetectionMarkers(mode.id, detectionData, true)}
                        
                        <div className="absolute top-10 right-10">
                          <Button variant="ghost" size="icon" className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-2xl hover:bg-pink-600 hover:border-pink-500 transition-all">
                            <Maximize2 className="h-8 w-8" />
                          </Button>
                        </div>
                      </div>

                      {/* Technical Analysis interface */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {[
                          { label: t('detected' as any) || 'Unit_Sync_Count', val: mode.count, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                          { label: t('severity' as any) || 'Delta_Severity', val: mode.count > 10 ? 'HIGH' : mode.count > 5 ? 'MEDIUM' : 'LOW', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
                          { label: t('coverage' as any) || 'Matrix_Density', val: `${Math.min(Math.round((mode.count / 100) * 100), 100)}%`, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
                          { label: t('status' as any) || 'Node_Health', val: 'NOMINAL', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                        ].map((m, i) => (
                          <div key={i} className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-6 shadow-inner group/stat hover:bg-white hover:border-blue-500/20 transition-all duration-700">
                            <div className="flex items-center gap-5">
                              <div className={cn("h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/stat:scale-110 transition-transform duration-700", m.bg, m.color)}>
                                <m.icon className="h-6 w-6" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover/stat:text-slate-950 transition-colors leading-none">{m.label}</span>
                            </div>
                            <div className={cn("text-4xl font-black italic tracking-tighter uppercase leading-none", m.color)}>{m.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
              <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
                    <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Spectral_Inference_Verified: NOMINAL</p>
                  </div>
                  <Button variant="outline" size="xl" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm hover:bg-slate-50 transition-all group/btn">
                    Protocol_Inference_Report
                    <ChevronRight className="ml-3 h-5 w-5 text-slate-300 group-hover/btn:translate-x-1 group-hover/btn:text-pink-600 transition-all" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
