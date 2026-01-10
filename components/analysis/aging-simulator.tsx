"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Sparkles, ShieldCheck, History, Play, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface AgingSimulatorProps {
  originalImageUrl: string
  isPremium: boolean
}

export function AgingSimulator({ originalImageUrl, isPremium }: AgingSimulatorProps) {
  const t = useTranslations('agingSimulator');
  const [years, setYears] = useState(5)
  const [mode, setMode] = useState<'aging' | 'prevention'>('aging')
  const [isSimulating, setIsSimulating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleSimulate = () => {
    setIsSimulating(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSimulating(false)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col min-h-[650px] animate-neural-pulse",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30 font-black uppercase tracking-widest">{t('lockedBadge')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-purple-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('unlockEvolution')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Clock className="h-8 w-8 text-purple-400" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-purple-500/30 text-purple-400 bg-purple-500/5 font-black italic tracking-widest text-[9px]">
          {t('engineVersion')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full">
          {/* Simulation Visualization */}
          <div className="lg:col-span-7 space-y-8 relative">
            <div className="relative aspect-[4/5] rounded-[2.5rem] border border-white/5 bg-black/20 overflow-hidden shadow-2xl group/sim">
              <Image 
                src={originalImageUrl} 
                alt="Aging Simulation" 
                fill 
                className={cn(
                  "object-cover transition-all duration-1000",
                  isSimulating ? "blur-md scale-105 opacity-50" : "blur-0 scale-100 opacity-100",
                  !isSimulating && progress === 100 && mode === 'aging' ? "sepia-[0.3] contrast-[1.1] saturate-[0.8]" : ""
                )} 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
              
              {/* Scanning Overlay Effect */}
              <AnimatePresence>
                {isSimulating && (
                  <motion.div 
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.8)] z-10"
                  />
                )}
              </AnimatePresence>

              <div className="absolute top-8 left-8 flex gap-3">
                <Badge className="bg-black/40 backdrop-blur-xl border-white/10 text-white font-black italic text-[10px] tracking-widest px-4 py-1.5">
                  T + {years} YEARS
                </Badge>
                <Badge className={cn(
                  "border-none font-black italic text-[10px] tracking-widest px-4 py-1.5 uppercase",
                  mode === 'aging' ? "bg-rose-500/80 text-white" : "bg-emerald-500/80 text-white"
                )}>
                  {mode === 'aging' ? t('agingMode') : t('preventionMode')}
                </Badge>
              </div>

              {isSimulating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 mx-auto relative">
                      <Sparkles className="h-16 w-16 text-purple-500 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">{t('visualizing')}</p>
                    <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                      <motion.div animate={{ width: `${progress}%` }} className="h-full bg-purple-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('temporalDisplacement')}</h4>
                  <span className="text-2xl font-black text-white italic">+{years} {t('years')}</span>
                </div>
                <Slider 
                  value={[years]} 
                  onValueChange={(v) => setYears(v[0])} 
                  max={10} 
                  min={1} 
                  step={1} 
                  className="py-4"
                />
                <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase tracking-widest">
                  <span>{t('present')}</span>
                  <span>{t('futureNode')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setMode('aging')}
                  className={cn(
                    "h-16 rounded-2xl border-white/5 text-[9px] font-black uppercase tracking-widest italic transition-all",
                    mode === 'aging' ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-xl shadow-rose-500/5" : "bg-white/5 text-slate-500"
                  )}
                >
                  {t('agingMode')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setMode('prevention')}
                  className={cn(
                    "h-16 rounded-2xl border-white/5 text-[9px] font-black uppercase tracking-widest italic transition-all",
                    mode === 'prevention' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/5" : "bg-white/5 text-slate-500"
                  )}
                >
                  {t('preventionMode')}
                </Button>
              </div>

              <Button 
                onClick={handleSimulate}
                disabled={isSimulating || !isPremium}
                className="w-full h-20 rounded-[2rem] bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-purple-600/20 italic"
              >
                {isSimulating ? <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> : <Play className="mr-3 h-5 w-5 fill-current" />}
                {t('simulateFuture')}
              </Button>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <ShieldCheck className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('confidenceScore')}</p>
                  <p className="text-xl font-bold text-white italic tracking-tighter">94.2% {t('precision')}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic">
                {t('disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-6 text-slate-600">
          <History className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">{t('temporalMapping')}: {t('nodeSyncSuccessful')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
