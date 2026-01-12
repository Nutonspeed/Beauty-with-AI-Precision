"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Clock, Zap, ShieldCheck, TrendingUp, Sparkles, User } from "lucide-react"
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
    { label: t('evolutionTimelapse.cycles.w0'), status: t('evolutionTimelapse.cycles.initialStatus'), detail: t('evolutionTimelapse.cycles.initialDetail') },
    { label: t('evolutionTimelapse.cycles.w4'), status: t('evolutionTimelapse.cycles.w4Status'), detail: t('evolutionTimelapse.cycles.w4Detail') },
    { label: t('evolutionTimelapse.cycles.w8'), status: t('evolutionTimelapse.cycles.w8Status'), detail: t('evolutionTimelapse.cycles.w8Detail') },
    { label: t('evolutionTimelapse.cycles.w12'), status: t('evolutionTimelapse.cycles.w12Status'), detail: t('evolutionTimelapse.cycles.w12Detail') },
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
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group min-h-[750px] flex flex-col animate-neural-pulse",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30 uppercase tracking-widest font-black">{t('evolutionTimelapse.locked')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('evolutionTimelapse.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('evolutionTimelapse.subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-pink-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('evolutionTimelapse.unlockButton')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Zap className="h-8 w-8 text-pink-400 animate-pulse" />
            {t('evolutionTimelapse.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('evolutionTimelapse.subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 font-black italic tracking-widest text-[9px]">
          TEMPORAL_SYNTHESIS_v2.0
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 flex-1 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full">
          {/* Main Time-lapse Display */}
          <div className="lg:col-span-8 relative group/display">
            <div className="aspect-video bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
              
              {/* Abstract Evolution Visualization */}
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
                      className="absolute inset-0 border-2 border-dashed border-pink-500/20 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>

              {/* HUD Elements */}
              <div className="absolute top-8 left-8 space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('evolutionTimelapse.currentStatus')}</p>
                <p className="text-xl font-black text-white italic tracking-tighter">{cycles[activeCycle].label}</p>
              </div>

              <div className="absolute bottom-8 right-8 text-right space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('evolutionTimelapse.biologicalYield')}</p>
                <p className="text-3xl font-black text-emerald-400 italic">+{Math.round(progress * 0.94)}%</p>
              </div>

              <AnimatePresence>
                {isPlaying && (
                  <motion.div 
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_20px_rgba(236,72,153,0.8)] z-10"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Playback Controls */}
            <div className="mt-8 flex items-center gap-8 bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-pink-500 transition-all"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
              </Button>
              <div className="flex-1 space-y-4">
                <Slider 
                  value={[progress]} 
                  onValueChange={(v) => setProgress(v[0])} 
                  max={100} 
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase tracking-widest">
                  <span>{t('evolutionTimelapse.initialScan')}</span>
                  <span>{t('evolutionTimelapse.projectedNode')}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setProgress(0)}
                className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-500 transition-all"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Evolution Details Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('evolutionTimelapse.timeline')}</h4>
            <div className="space-y-4">
              {cycles.map((cycle, i) => (
                <div 
                  key={i}
                  className={cn(
                    "p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group/cycle",
                    activeCycle === i ? "bg-white/[0.03] border-white/10 shadow-xl" : "bg-transparent border-transparent opacity-30"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/cycle:scale-110 animate-synaptic-fire",
                      activeCycle === i ? "bg-pink-500/10 text-pink-400" : "bg-white/5 text-slate-600"
                    )}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white italic">{cycle.label}: {cycle.status}</p>
                      <p className="text-[10px] text-slate-500 font-light italic">{cycle.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-pink-600/10 via-transparent to-transparent border border-pink-500/20 space-y-6 relative overflow-hidden group/prime">
              <TrendingUp className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-pink-500/5 rotate-12" />
              <div className="flex items-center gap-4 relative z-10">
                <Sparkles className="h-5 w-5 text-pink-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest">{t('evolutionTimelapse.biologicalPrime')}</h5>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed italic relative z-10">
                {t('evolutionTimelapse.primeDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-600">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">{t('evolutionTimelapse.verified')}: {t('evolutionTimelapse.temporalSyncStable')}</p>
          </div>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Engine: BIP-Evolution-v4.2</p>
        </div>
      </CardFooter>
    </Card>
  )
}
