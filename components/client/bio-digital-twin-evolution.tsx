"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Clock, Zap, ShieldCheck, TrendingUp, Sparkles, User, Activity, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface BioDigitalTwinEvolutionProps {
  isPremium: boolean
}

export function BioDigitalTwinEvolution({ isPremium }: BioDigitalTwinEvolutionProps) {
  const t = useTranslations()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeCycle, setActiveCycle] = useState(0)

  const cycles = [
    { label: t('evolutionTimelapse.cycles.w0' as any) || 'W0_BASELINE', status: t('evolutionTimelapse.cycles.initialStatus' as any) || 'Initial_Sync', detail: t('evolutionTimelapse.cycles.initialDetail' as any) || 'Primary biometric node established' },
    { label: t('evolutionTimelapse.cycles.w4' as any) || 'W4_SYNTHESIS', status: t('evolutionTimelapse.cycles.w4Status' as any) || 'Protocol_Alpha', detail: t('evolutionTimelapse.cycles.w4Detail' as any) || 'Surface synthesis and hydration sync' },
    { label: t('evolutionTimelapse.cycles.w8' as any) || 'W8_TRANSFORMATION', status: t('evolutionTimelapse.cycles.w8Status' as any) || 'Protocol_Beta', detail: t('evolutionTimelapse.cycles.w8Detail' as any) || 'Dermal restructuring and pigment sync' },
    { label: t('evolutionTimelapse.cycles.w12' as any) || 'W12_OPTIMAL', status: t('evolutionTimelapse.cycles.w12Status' as any) || 'Final_Authorization', detail: t('evolutionTimelapse.cycles.w12Detail' as any) || 'Maximum yield and node stability' },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + 1
        })
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    setActiveCycle(Math.min(Math.floor(progress / 25), 3))
  }, [progress])

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 flex flex-col min-h-[750px]",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-pink-50 text-pink-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            {t('evolutionTimelapse.locked' as any) || 'EVOLUTION_LOCK_ACTIVE'}
          </Badge>
          <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none mb-6">{t('evolutionTimelapse.title' as any) || 'Temporal_Bio-Twin_Evolution'}</h3>
          <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed mb-10 text-base">
            {t('evolutionTimelapse.subtitle' as any) || 'Unlock the ability to simulate and visualize longitudinal biological transformation sequences.'}
          </p>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            {t('evolutionTimelapse.unlockButton' as any) || 'Authorize_Evolution_Sync'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Zap className="h-8 w-8 text-pink-600 group-hover:text-white animate-pulse" />
            </div>
            {t('evolutionTimelapse.title' as any) || 'Bio-Twin_Evolution'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('evolutionTimelapse.subtitle' as any) || 'Longitudinal biometric transformation synthesis'}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-white font-black italic tracking-widest text-[9px] uppercase shadow-sm">
          TEMPORAL_SYNTHESIS_v4.8
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 items-center h-full">
          {/* Main Time-lapse Display interface */}
          <div className="lg:col-span-8 relative group/display">
            <div className="relative aspect-video rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/canvas">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              {/* Abstract Evolution Visualization interface */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1 + (progress/500), 1],
                      rotate: progress * 3.6
                    }}
                    className="h-64 w-64 rounded-full bg-gradient-to-tr from-pink-500/20 via-cyan-500/20 to-purple-500/20 blur-[60px]" 
                  />
                  <div className="relative z-10 text-center">
                    <User className="h-32 w-32 text-white/5 mx-auto" />
                    <motion.div 
                      className="absolute inset-[-40px] border-2 border-dashed border-pink-500/20 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>

              {/* HUD Elements interface */}
              <div className="absolute top-10 left-10 space-y-2 pointer-events-none">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t('evolutionTimelapse.currentStatus' as any) || 'TEMPORAL_STATE'}</p>
                <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{cycles[activeCycle].label}</p>
              </div>

              <div className="absolute bottom-10 right-10 text-right space-y-2 pointer-events-none">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t('evolutionTimelapse.biologicalYield' as any) || 'SYNTHESIS_YIELD'}</p>
                <p className="text-4xl font-black text-emerald-400 italic tracking-tighter uppercase leading-none">+{Math.round(progress * 0.94)}%</p>
              </div>

              <AnimatePresence>
                {isPlaying && (
                  <motion.div 
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-glow-pink z-10"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Playback Controls interface */}
            <div className="mt-10 flex items-center gap-10 bg-slate-50 p-8 rounded-[3rem] border border-slate-100 shadow-inner group/controls transition-all duration-700 hover:bg-white hover:border-pink-100">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-16 w-16 rounded-2xl bg-white border border-slate-100 text-pink-600 shadow-sm hover:scale-110 hover:bg-pink-50 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
              </Button>
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{t('evolutionTimelapse.temporalSync' as any) || 'Chronological_Focus'}</span>
                  </div>
                  <span className="text-xl font-black text-pink-600 italic tracking-tighter uppercase">{progress}%</span>
                </div>
                <Slider 
                  value={[progress]} 
                  onValueChange={(v) => setProgress(v[0])} 
                  max={100} 
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest italic px-1">
                  <span>{t('evolutionTimelapse.initialScan' as any) || 'BASELINE_SYNC'}</span>
                  <span>{t('evolutionTimelapse.projectedNode' as any) || 'OPTIMIZED_PROJECTION'}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setProgress(0)}
                className="h-16 w-16 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-pink-600 hover:bg-pink-50 shadow-sm active:scale-95 transition-all"
              >
                <RotateCcw className="h-8 w-8" />
              </Button>
            </div>
          </div>

          {/* Evolution Details Column interface */}
          <div className="lg:col-span-4 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
              {t('evolutionTimelapse.timeline' as any) || 'Evolution_Protocol_Registry'}
            </h4>
            <div className="space-y-6">
              {cycles.map((cycle, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-8 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden group/cycle",
                    activeCycle === i 
                      ? "bg-white border-pink-200 shadow-premium" 
                      : "bg-slate-50/50 border-transparent opacity-40 grayscale-[0.5]"
                  )}
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/cycle:bg-pink-600 transition-all duration-700" className={activeCycle === i ? 'bg-pink-500' : ''} />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover/cycle:scale-110 shadow-inner",
                      activeCycle === i ? "bg-pink-50 text-pink-600 border-pink-100" : "bg-white text-slate-200 border-slate-100"
                    )}>
                      <Clock className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <p className={cn("text-lg font-black italic uppercase leading-none transition-colors", activeCycle === i ? "text-slate-950" : "text-slate-400")}>{cycle.label}: {cycle.status}</p>
                      <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed tracking-tight">{cycle.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-8 relative overflow-hidden group/prime shadow-inner transition-all duration-700 hover:bg-white hover:border-pink-500/20 hover:shadow-premium">
              <TrendingUp className="absolute bottom-[-20px] right-[-20px] h-48 w-48 text-pink-500/[0.03] rotate-12 transition-transform duration-[3000ms] group-hover/prime:rotate-90 group-hover/prime:scale-110" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-14 w-14 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/prime:scale-110 group-hover/prime:bg-pink-50 transition-all duration-700">
                  <Sparkles className="h-8 w-8 text-pink-600" />
                </div>
                <h5 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">{t('evolutionTimelapse.biologicalPrime' as any) || 'Biological_Prime_Forecast'}</h5>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic relative z-10 tracking-tight">
                {t('evolutionTimelapse.primeDesc' as any) || 'Predictive models identify a 94% probability of optimal dermal integrity within the selected temporal sequence.'}
              </p>
              <div className="pt-4 relative z-10">
                <Button variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase tracking-[0.4em] text-pink-600 hover:bg-transparent hover:translate-x-3 transition-all italic group/btn">
                  Full_Projection_Log <ChevronRight className="ml-3 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
            <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">{t('evolutionTimelapse.verified' as any || 'Sequence_Verified')}: <span className="text-emerald-600">{t('evolutionTimelapse.temporalSyncStable' as any || 'SYNCHRONISED')}</span></p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-6 bg-pink-500/40" />
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Engine: BIP-Evolution-v4.8</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
