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
    { label: t('missionControl.aestheticExcellence'), val: '98.4%', sub: t('missionControl.nominal'), color: 'text-cyan-400' },
    { label: t('missionControl.operationalYield'), val: '94.2%', sub: t('missionControl.yieldDelta'), color: 'text-pink-400' },
    { label: t('missionControl.systemResiliency'), val: `${systemHealth.toFixed(2)}%`, sub: t('missionControl.slaStable'), color: 'text-blue-400' },
  ]

  return (
    <Card className="border-white/5 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.1)] relative group min-h-[800px] flex flex-col ring-1 ring-white/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center animate-grid-drift" />
      
      <CardHeader className="p-10 lg:p-12 pb-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-5xl font-black text-white tracking-tighter italic flex items-center gap-6 uppercase leading-none">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Cpu className="h-10 w-10 text-cyan-400 animate-spin-slow" />
            </div>
            {t('missionControl.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic ml-1">
            {t('missionControl.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('missionControl.status')}</p>
            <p className="text-sm font-black text-emerald-400 italic flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('ui.status.allSystemsOptimal').toUpperCase()}
            </p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative shadow-2xl ring-1 ring-white/10 cursor-pointer overflow-hidden group/bell"
          >
            <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/bell:opacity-100 transition-opacity" />
            <Bell className="h-6 w-6 text-pink-500 animate-swing relative z-10" />
            <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)] z-20" />
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-16 flex-1 relative z-10">
        {/* Core Strategic Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-2xl relative overflow-hidden group/metric ring-1 ring-white/5"
            >
              <div className={cn("absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover/metric:scale-110 group-hover/metric:rotate-12 transition-all duration-700", m.color)}>
                <Target className="h-24 w-24" />
              </div>
              <div className="space-y-6 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{m.label}</p>
                <p className={cn("text-4xl font-black italic tracking-tighter leading-none", m.color)}>{m.val}</p>
                <Badge variant="outline" className="text-[9px] font-black border-white/10 bg-white/5 text-slate-500 italic uppercase tracking-widest px-4 py-1 rounded-lg shadow-lg">
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
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">{t('missionControl.activeNodes')}</h4>
              <Badge className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-[9px] font-black italic px-4 py-1 rounded-lg uppercase tracking-widest shadow-lg">{t('missionControl.activeNodesCount')}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {modules.slice(0, 4).map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] hover:border-cyan-500/20 transition-all duration-500 ring-1 ring-white/5"
                >
                  <div className="flex items-center gap-8">
                    <div className={cn("h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", m.color)}>
                      <m.icon className="h-7 w-7" />
                    </div>
                    <span className="text-base font-black text-white italic tracking-tight uppercase leading-none">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-4 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em] italic">{t('ui.status.nodeSync')}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-10 p-10 rounded-[3.5rem] bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent border border-cyan-500/30 relative overflow-hidden group/box shadow-2xl ring-1 ring-white/10"
            >
              <Compass className="absolute bottom-[-40px] right-[-40px] h-48 w-48 text-cyan-500/5 rotate-12 transition-transform duration-[2000ms] group-hover/box:rotate-90 group-hover/box:scale-110" />
              <div className="space-y-8 relative z-10 text-left">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-[1.5rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover/box:scale-110 transition-transform duration-500">
                    <Zap className="h-7 w-7 text-cyan-400 animate-pulse" />
                  </div>
                  <h5 className="text-sm font-black text-white uppercase tracking-[0.4em] italic leading-none">{t('missionControl.commandPath')}</h5>
                </div>
                <p className="text-sm text-slate-400 font-light leading-relaxed italic max-w-[280px]">
                  {t('missionControl.oversightDesc')}
                </p>
                <Button className="w-full h-18 rounded-[2rem] bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-[0.3em] text-[11px] italic transition-all group-hover/box:shadow-[0_20px_50px_rgba(6,182,212,0.3)] border-none">
                  {t('missionControl.launchAnalysis')}
                  <ArrowRight className="ml-4 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
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
