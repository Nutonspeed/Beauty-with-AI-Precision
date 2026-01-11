"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Binary, Dna, Zap, ShieldCheck, RefreshCw, Microscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface GenomeMarker {
  label: string
  score: number
  status: 'optimal' | 'warning' | 'critical'
}

export function AestheticGenomeVisualization() {
  const t = useTranslations('aestheticGenome');
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [activeSegment, setActiveSegment] = useState(0)

  const markers: GenomeMarker[] = [
    { label: t('cellularVibrancy'), score: 92, status: 'optimal' },
    { label: t('dermalElasticity'), score: 78, status: 'optimal' },
    { label: t('oxidativeStress'), score: 42, status: 'warning' },
  ]

  const handleSynthesize = () => {
    setIsSynthesizing(true)
    setTimeout(() => setIsSynthesizing(false), 3000)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSegment(prev => (prev + 1) % 12)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full flex flex-col min-h-[600px]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Dna className="h-8 w-8 text-cyan-400" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('subtitle')}
          </CardDescription>
        </div>
        <Button 
          onClick={handleSynthesize}
          disabled={isSynthesizing}
          className="h-12 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-widest text-[9px] italic shadow-lg shadow-cyan-600/20"
        >
          {isSynthesizing ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <Microscope className="mr-2 h-3 w-3" />}
          {t('synthesizeGenome')}
        </Button>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 flex-1 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Helix Visualization */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[350px]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
            
            <div className="relative flex items-center justify-center w-full h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "absolute w-1 h-32 bg-gradient-to-b from-cyan-500/40 to-pink-500/40 rounded-full transition-all duration-500",
                    activeSegment === i ? "opacity-100 scale-110" : "opacity-20 scale-100"
                  )}
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-60px)`,
                  }}
                >
                  <div className="absolute top-0 -left-1.5 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  <div className="absolute bottom-0 -left-1.5 h-3 w-3 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
                </motion.div>
              ))}
              
              <div className="relative z-10 text-center space-y-2">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">{t('molecularHelix')}</p>
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest italic">{t('syncStable')}_v4.2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Genetic Markers List */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('geneticMarkers')}</h4>
            <div className="space-y-4">
              {markers.map((marker, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group/marker"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/marker:border-cyan-500/30 transition-all">
                        <Binary className="h-5 w-5 text-slate-500 group-hover/marker:text-cyan-400 transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-white italic">{marker.label}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black border-white/5 italic",
                      marker.status === 'optimal' ? "text-emerald-400 bg-emerald-500/5" : "text-amber-400 bg-amber-500/5"
                    )}>
                      {marker.score}% {t('match')}
                    </Badge>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      whileInView={{ width: `${marker.score}%` }} 
                      className={cn("h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", marker.status === 'optimal' ? "bg-cyan-500" : "bg-amber-500")} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center gap-4">
              <Zap className="h-5 w-5 text-cyan-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic">
                {t('aiIdentified', { node: t('highOxidativeNode'), protocol: t('protocolNode7') })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-600">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">{t('genomeStatus')}: {t('verified')}</p>
          </div>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">{t('sequence')}: {t('sequenceId')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
