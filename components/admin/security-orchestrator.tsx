"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, Activity, Lock, Globe, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function SecurityOrchestrator() {
  const t = useTranslations()
  const [isScanning, setIsScanning] = useState(false)
  const [integrityScore, setIntegrityScore] = useState(99.98)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning(true)
      setTimeout(() => setIsScanning(false), 2000)
      // Subtle fluctuations in integrity score
      setIntegrityScore(prev => Math.max(99.9, Math.min(100, prev + (Math.random() - 0.5) * 0.02)))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const metrics = [
    { label: t('securityOrchestrator.threatLevel'), val: 'NOMINAL', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: t('securityOrchestrator.encryptionStatus'), val: 'VERIFIED', icon: Lock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: t('securityOrchestrator.anomaliesDetected'), val: '0 ACTIVE', icon: ShieldAlert, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: t('securityOrchestrator.auditCycle'), val: '120 Hz', icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            {t('securityOrchestrator.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('securityOrchestrator.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('ui.hud.systemIntegrity')}</p>
            <p className="text-xl font-black text-emerald-400 italic tracking-tighter">{integrityScore.toFixed(2)}%</p>
          </div>
          <Badge className="bg-emerald-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic animate-pulse">
            {t('ui.hud.activeDefenseOn')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Defense Visualization */}
          <div className="lg:col-span-7 relative">
            <div className="aspect-video bg-black/40 rounded-3xl border border-white/5 overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
              
              {/* Animated Shield Mesh */}
              <motion.div 
                animate={{ 
                  scale: isScanning ? [1, 1.05, 1] : 1,
                  opacity: isScanning ? [0.2, 0.4, 0.2] : 0.15
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-emerald-500/20 rounded-full blur-[40px] scale-75"
              />

              <div className="relative z-10 text-center space-y-6">
                <div className="relative inline-block">
                  <ShieldCheck className={cn("h-24 w-24 text-emerald-500", isScanning && "animate-pulse")} />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute inset-[-20px] border border-dashed border-emerald-500/20 rounded-full"
                  />
                </div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">
                  {isScanning ? t('ui.hud.synapticScanInProgress') : t('ui.hud.mappingThreatVectors')}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="absolute bottom-6 right-8 flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{t('ui.hud.nodeSecurityNominal')}</span>
              </div>
            </div>
          </div>

          {/* Security Metrics Column */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.defenseTelemetry')}</h4>
            <div className="grid grid-cols-1 gap-4">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group/metric"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/metric:scale-110 animate-synaptic-fire", m.bg, m.color)}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{m.label}</p>
                        <p className="text-sm font-bold text-white italic">{m.val}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
              <Activity className="h-5 w-5 text-emerald-500" />
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic">
                {t('ui.hud.activeDefenseMeshDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">ISO_SECURITY_CERTIFIED: 2026_EDITION</p>
          <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest italic">Engine: BIP-Defense-v4.2</p>
        </div>
      </CardFooter>
    </Card>
  )
}
