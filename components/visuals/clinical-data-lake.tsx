"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Database, Zap, Activity, ShieldCheck, Server, Binary } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function ClinicalDataLake() {
  const t = useTranslations()
  const [isStreaming, setIsStreaming] = useState(false)
  const [dataPoints, setDataPoints] = useState<{ id: number; x: number; y: number; color: string }[]>([])

  useEffect(() => {
    if (!isStreaming) {
      setDataPoints([])
      return
    }

    const interval = setInterval(() => {
      const newPoint = {
        id: Date.now(),
        x: Math.random() * 100,
        y: -10,
        color: Math.random() > 0.5 ? 'bg-cyan-500' : 'bg-pink-500'
      }
      setDataPoints(prev => [...prev, newPoint].slice(-50))
    }, 100)

    return () => clearInterval(interval)
  }, [isStreaming])

  return (
    <div className="w-full bg-[#020617] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <div className="p-8 lg:p-12 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-[0.2em] flex items-center gap-4">
            <Database className="h-6 w-6 text-cyan-400" />
            {t('dataLake.title')}
          </h3>
          <p className="text-[10px] text-slate-500 font-light italic tracking-widest">{t('dataLake.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsStreaming(!isStreaming)}
          className={cn(
            "h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[9px] italic transition-all shadow-lg",
            isStreaming ? "bg-rose-500 text-white animate-pulse" : "bg-cyan-600 text-[#020617] hover:bg-cyan-500"
          )}
        >
          {isStreaming ? t('ui.hud.terminateStream') : t('dataLake.visualizeData')}
        </button>
      </div>

      <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Visualization Area */}
        <div className="lg:col-span-8 relative">
          <div className="aspect-video bg-black/40 rounded-3xl border border-white/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
            
            {/* Streaming Particles */}
            <AnimatePresence>
              {dataPoints.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ y: -20, x: `${p.x}%`, opacity: 0 }}
                  animate={{ y: '120%', opacity: [0, 1, 0] }}
                  transition={{ duration: 2, ease: "linear" }}
                  className={cn("absolute h-1 w-1 rounded-full", p.color)}
                />
              ))}
            </AnimatePresence>

            {/* Central Storage Node */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: isStreaming ? [1, 1.1, 1] : 1,
                    opacity: isStreaming ? [0.3, 0.6, 0.3] : 0.2
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-48 w-48 bg-cyan-500/20 blur-[60px] rounded-full" 
                />
                <Database className={cn("h-16 w-16 text-white relative z-10", isStreaming && "animate-bounce")} />
              </div>
            </div>

            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('dataLake.lakeStatus')}</p>
                <p className={cn("text-xs font-bold italic", isStreaming ? "text-emerald-400" : "text-slate-500")}>
                  {isStreaming ? t('ui.hud.synchronizingClusters') : t('ui.hud.idleNode')}
                </p>
              </div>
              <Activity className={cn("h-4 w-4", isStreaming ? "text-cyan-500 animate-pulse" : "text-slate-700")} />
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="lg:col-span-4 space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.networkTelemetry')}</h4>
          <div className="space-y-4">
            {[
              { label: t('dataLake.ingestionRate'), val: isStreaming ? '4.2 TB/s' : '0.0 TB/s', icon: Zap, color: 'text-amber-400' },
              { label: t('dataLake.totalRecords'), val: '1.2B UNITS', icon: Binary, color: 'text-cyan-400' },
              { label: t('dataLake.processingPower'), val: isStreaming ? '98.4%' : '12.2%', icon: Activity, color: 'text-pink-400' },
              { label: t('dataLake.dataIntegrity'), val: 'VERIFIED', icon: ShieldCheck, color: 'text-emerald-400' },
            ].map((m, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group/metric">
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner animate-synaptic-fire", m.color)}>
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{m.label}</p>
                    <p className="text-sm font-bold text-white italic">{m.val}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center gap-4">
            <Server className="h-5 w-5 text-cyan-500" />
            <p className="text-[10px] text-slate-500 font-light italic leading-relaxed">
              {t('ui.hud.dataLakeDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-10 lg:p-12 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">{t('ui.hud.dataLakeCompliant')}</p>
        <Badge variant="outline" className="text-[8px] font-black border-white/5 text-slate-700 italic uppercase">{t('ui.hud.meshNodeSync')}</Badge>
      </div>
    </div>
  )
}
