"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Activity, 
  Target, 
  Cpu, 
  Globe, 
  Database, 
  BarChart3,
  ArrowRight,
  Compass,
  Bell,
  Users
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function MissionControl() {
  const t = useTranslations()
  const [activeSignals, setActiveSignals] = useState<number>(0)
  const [systemHealth, setSystemHealth] = useState(99.99)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignals(prev => (prev + 1) % 16)
      setSystemHealth(prev => Math.max(99.9, Math.min(100, prev + (Math.random() - 0.5) * 0.01)))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const modules = [
    { label: t('roiSimulator.title'), status: 'active', icon: TrendingUp, color: 'text-emerald-400' },
    { label: t('revenueForecasting.title'), status: 'active', icon: BarChart3, color: 'text-pink-400' },
    { label: t('medicalCompliance.title'), status: 'active', icon: ShieldCheck, color: 'text-cyan-400' },
    { label: t('assetLifecycle.title'), status: 'active', icon: Activity, color: 'text-blue-400' },
    { label: t('inventoryForecasting.title'), status: 'active', icon: Database, color: 'text-amber-400' },
    { label: t('marketIntelligence.title'), status: 'active', icon: Globe, color: 'text-purple-400' },
    { label: t('generativeMarketing.title'), status: 'active', icon: Zap, color: 'text-rose-400' },
    { label: t('staffProductivity.title'), status: 'active', icon: Users, color: 'text-indigo-400' },
  ]

  const metrics = [
    { label: t('missionControl.revenueMomentum'), val: t('missionControl.revenueValue'), sub: t('missionControl.revenueDelta'), color: 'text-emerald-400' },
    { label: t('missionControl.clinicalExcellence'), val: '98.4%', sub: t('missionControl.nominal'), color: 'text-cyan-400' },
    { label: t('missionControl.operationalYield'), val: '94.2%', sub: t('missionControl.yieldDelta'), color: 'text-pink-400' },
    { label: t('missionControl.systemResiliency'), val: `${systemHealth.toFixed(2)}%`, sub: t('missionControl.slaStable'), color: 'text-blue-400' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group min-h-[800px] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center animate-grid-drift" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-4xl font-bold text-white tracking-tighter italic flex items-center gap-4">
            <Cpu className="h-10 w-10 text-cyan-400 animate-spin-slow" />
            {t('missionControl.title')}
          </CardTitle>
          <CardDescription className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
            {t('missionControl.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('missionControl.status')}</p>
            <p className="text-xs font-bold text-emerald-400 italic">{t('ui.status.allSystemsOptimal')}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative">
            <Bell className="h-5 w-5 text-pink-500 animate-swing" />
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-16 flex-1 relative z-10">
        {/* Core Strategic Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-xl relative overflow-hidden group/metric"
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/metric:scale-110 transition-transform duration-700">
                <Target className="h-16 w-16" />
              </div>
              <div className="space-y-4 relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{m.label}</p>
                <p className={cn("text-3xl font-black italic tracking-tighter", m.color)}>{m.val}</p>
                <Badge variant="outline" className="text-[8px] font-black border-white/10 text-slate-500 italic uppercase">
                  {m.sub}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Central Intelligence Mesh */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <div className="aspect-square w-full max-w-[450px] relative">
              {/* Spinning Intelligence Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-cyan-500/10 shadow-[0_0_100px_rgba(6,182,212,0.05)]"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-12 rounded-full border border-dashed border-pink-500/10"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Floating Particles Mockup */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-1 w-1 rounded-full bg-cyan-500/40"
                      animate={{
                        x: [0, (Math.random() - 0.5) * 400],
                        y: [0, (Math.random() - 0.5) * 400],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0]
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 5
                      }}
                    />
                  ))}
                  
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="h-48 w-48 bg-cyan-500/10 blur-[60px] rounded-full" 
                  />
                  <div className="relative z-10 text-center space-y-4">
                    <div className="h-20 w-20 rounded-3xl bg-[#020617] border border-cyan-500/30 flex items-center justify-center mx-auto shadow-2xl animate-synaptic-fire">
                      <Cpu className="h-10 w-10 text-cyan-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-white italic tracking-tighter uppercase">BIP-CORE-v4.2</p>
                      <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest italic">{t('missionControl.systemStatus')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orbital Nodes */}
              {modules.map((m, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-180px)`
                  }}
                >
                  <motion.div 
                    animate={{ rotate: -(i * 45) }}
                    className={cn(
                      "h-12 w-12 rounded-2xl border flex items-center justify-center backdrop-blur-xl transition-all duration-500 group/node cursor-pointer",
                      activeSignals === i ? "bg-white/10 border-white/30 shadow-2xl scale-125" : "bg-white/[0.02] border-white/5 opacity-40"
                    )}
                  >
                    <m.icon className={cn("h-6 w-6", activeSignals === i ? m.color : "text-slate-600")} />
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-black border border-white/10 px-3 py-1.5 rounded-lg z-20">
                      <p className="text-[8px] font-black text-white uppercase tracking-widest italic">{m.label}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Module Integrity Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('missionControl.activeNodes')}</h4>
              <Badge className="bg-cyan-600 text-white border-none text-[8px] font-black italic">{t('missionControl.activeNodesCount')}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {modules.slice(0, 4).map((m, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-6">
                    <div className={cn("h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner", m.color)}>
                      <m.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-white italic">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('ui.status.nodeSync')}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent border border-cyan-500/20 relative overflow-hidden group/box">
              <Compass className="absolute bottom-[-30px] right-[-30px] h-40 w-40 text-cyan-500/5 rotate-12 transition-transform duration-1000 group-hover/box:rotate-90" />
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
                  </div>
                  <h5 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">{t('missionControl.commandPath')}</h5>
                </div>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed italic">
                  {t('missionControl.oversightDesc')}
                </p>
                <Button className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-widest text-[10px] italic transition-all group-hover/box:shadow-2xl group-hover/box:shadow-cyan-500/20">
                  {t('missionControl.launchAnalysis')}
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic">{t('ui.status.orchestratorAuth')}</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('missionControl.threatMesh')}: {t('missionControl.secure').toUpperCase()}</span>
            </div>
            <div className="h-4 w-px bg-white/5" />
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">{t('ui.status.systemEpoch')}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
