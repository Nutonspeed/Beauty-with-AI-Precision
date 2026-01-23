"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, Activity, Lock, Globe, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function SecurityOrchestrator() {
  const t = useTranslations('home.salesWizard')
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
    { label: t('securityOrchestrator.encryptionStatus'), val: 'VERIFIED', icon: Lock, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: t('securityOrchestrator.anomaliesDetected'), val: '0 ACTIVE', icon: ShieldAlert, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: t('securityOrchestrator.auditCycle'), val: '120 Hz', icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
            <div className="p-3 bg-emerald-50 rounded-2xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
              <ShieldCheck className="h-8 w-8 text-emerald-600 group-hover:text-white" />
            </div>
            {t('securityOrchestrator.title')}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('securityOrchestrator.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('ui.hud.systemIntegrity')}</p>
            <p className="text-2xl font-black text-emerald-600 italic tracking-tighter uppercase">{integrityScore.toFixed(2)}%</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 border-none px-5 py-1.5 text-[10px] font-black tracking-widest uppercase italic animate-pulse shadow-sm rounded-full">
            {t('ui.hud.activeDefenseOn')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Defense Visualization */}
          <div className="lg:col-span-7 relative">
            <div className="aspect-video bg-white border border-slate-100 rounded-[3rem] overflow-hidden relative flex items-center justify-center shadow-inner group/defense">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center" />
              
              {/* Animated Shield Mesh */}
              <motion.div 
                animate={{ 
                  scale: isScanning ? [1, 1.05, 1] : 1,
                  opacity: isScanning ? [0.2, 0.4, 0.2] : 0.15
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-emerald-500/10 rounded-full blur-[40px] scale-75"
              />

              <div className="relative z-10 text-center space-y-8">
                <div className="relative inline-block group-hover/defense:scale-110 transition-transform duration-700">
                  <ShieldCheck className={cn("h-28 w-28 text-emerald-500 transition-all", isScanning && "animate-pulse")} />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                    className="absolute inset-[-30px] border border-dashed border-emerald-500/20 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute inset-[-50px] border border-dotted border-emerald-500/10 rounded-full"
                  />
                </div>
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] italic bg-emerald-50 px-6 py-2 rounded-full shadow-sm">
                  {isScanning ? t('ui.hud.synapticScanInProgress') : t('ui.hud.mappingThreatVectors')}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="absolute bottom-10 right-10 flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-2 rounded-2xl border border-slate-100 shadow-premium">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">{t('ui.hud.nodeSecurityNominal')}</span>
              </div>
            </div>
          </div>

          {/* Security Metrics Column */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('ui.hud.defenseTelemetry')}</h4>
            <div className="grid grid-cols-1 gap-6">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-emerald-500/20 transition-all duration-700 group/metric shadow-sm hover:shadow-premium"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner transition-transform group-hover/metric:scale-110 duration-700", m.bg.replace('500/10', '50'))}>
                        <m.icon className={cn("h-7 w-7", m.color.replace('400', '600'))} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{m.label}</p>
                        <p className="text-xl font-black text-slate-950 italic uppercase leading-none group-hover:text-emerald-600 transition-colors">{m.val}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 flex items-center gap-6 group shadow-premium overflow-hidden relative">
              <Activity className="h-10 w-10 text-emerald-600 animate-pulse relative z-10" />
              <p className="text-[13px] text-slate-500 font-light italic leading-relaxed relative z-10 tracking-tight">
                {t('ui.hud.activeDefenseMeshDesc')}
              </p>
              <ShieldCheck className="absolute bottom-[-30px] right-[-30px] h-32 w-32 text-emerald-500/5 rotate-12 transition-transform duration-[2000ms] group-hover:rotate-90" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-white">
        <div className="w-full flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic bg-slate-50 px-6 py-2 rounded-full shadow-sm">ISO_SECURITY_CERTIFIED: 2026_EDITION</p>
          <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest italic">{t('ui.hud.syncProtocolV4')} • BIP-Defense-v4.2</p>
        </div>
      </CardFooter>
    </Card>
  )
}
