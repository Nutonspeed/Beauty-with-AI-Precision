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
  Users,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function MissionControl() {
  const t = useTranslations('revenue')
  const [activeSignals, setActiveSignals] = useState<number>(0)
  const [systemHealth, setSystemHealth] = useState(99.99)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignals(prev => (prev + 1) % 8)
      setSystemHealth(prev => Math.max(99.9, Math.min(100, prev + (Math.random() - 0.5) * 0.01)))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const modules = [
    { label: t('roiSimulator.title' as any) || 'ROI_Alpha', status: 'active', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('revenueForecasting.title' as any) || 'Yield_Forecast', status: 'active', icon: BarChart3, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: t('medicalCompliance.title' as any) || 'Compliance_Node', status: 'active', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('assetLifecycle.title' as any) || 'Asset_Sync', status: 'active', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('inventoryForecasting.title' as any) || 'Inventory_Matrix', status: 'active', icon: Database, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('marketIntelligence.title' as any) || 'Market_Intel', status: 'active', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: t('generativeMarketing.title' as any) || 'Creative_AI', status: 'active', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: t('staffProductivity.title' as any) || 'Personnel_Yield', status: 'active', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  const metrics = [
    { label: 'Revenue_Momentum', val: '฿2.4M', sub: '+12.4% Δ', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Aesthetic_Excellence', val: '98.4%', sub: 'NOMINAL', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Operational_Yield', val: '94.2%', sub: '+4.8% Δ', color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'System_Resiliency', val: `${systemHealth.toFixed(2)}%`, sub: 'SLA_STABLE', color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10 min-h-[800px] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Cpu className="h-10 w-10 text-pink-600 group-hover:text-white animate-pulse" />
            </div>
            {t('missionControl.title' as any) || 'Strategic_Mission_Control'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-1">
            {t('missionControl.subtitle' as any) || 'Autonomous aesthetic infrastructure orchestration'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Operational_Status</p>
            <p className="text-sm font-black text-emerald-600 italic flex items-center gap-2 uppercase leading-none">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
              All_Systems_Nominal
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 text-slate-300 hover:text-pink-600 transition-all shadow-sm relative group/bell">
            <Bell className="h-7 w-7 group-hover:animate-swing" />
            <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-pink-500 shadow-glow-pink animate-pulse" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-16 flex-1 bg-white relative">
        {/* Core Metrics Grid interface */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-slate-100 bg-slate-50/50 border border-slate-100 shadow-inner rounded-[2.5rem] hover:bg-white hover:border-pink-500/20 hover:shadow-premium transition-all duration-700 relative overflow-hidden group/metric">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/metric:scale-110 group-hover/metric:rotate-12 transition-transform duration-1000">
                  <Target className="h-24 w-24 text-slate-950" />
                </div>
                <CardContent className="p-10 space-y-6 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/metric:text-slate-950 transition-colors">{m.label}</p>
                  <p className={cn("text-4xl font-black italic tracking-tighter leading-none uppercase group-hover/metric:scale-105 transition-transform origin-left", m.color)}>{m.val}</p>
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full border-slate-200 bg-white text-[9px] font-black italic uppercase tracking-widest shadow-sm group-hover/metric:border-pink-100">{m.sub}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Central Intelligence architecture interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <div className="aspect-square w-full max-w-[500px] relative group/central">
              {/* Spinning Rings interface */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-pink-500/10 shadow-inner group-hover/central:border-pink-500/20 transition-colors duration-1000"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-16 rounded-full border border-dashed border-blue-500/10 group-hover/central:border-blue-500/20 transition-colors duration-1000"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    className="h-56 w-56 bg-pink-500/5 blur-[80px] rounded-full" 
                  />
                  <div className="relative z-10 text-center space-y-6">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center mx-auto shadow-premium group-hover/central:scale-110 transition-all duration-1000">
                      <Cpu className="h-12 w-12 text-pink-600 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">BIP_CORE_v4.2</p>
                      <Badge className="bg-slate-950 text-white border-none rounded-full px-5 py-1 text-[9px] font-black italic shadow-2xl tracking-widest uppercase animate-pulse">ACTIVE_REASONING</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orbital Module interface */}
              {modules.map((m, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-220px)`
                  }}
                >
                  <motion.div 
                    animate={{ rotate: -(i * 45) }}
                    className={cn(
                      "h-14 w-14 rounded-2xl border flex items-center justify-center backdrop-blur-xl transition-all duration-700 group/node cursor-pointer shadow-premium",
                      activeSignals === i ? "bg-white border-pink-200 scale-125 z-20" : "bg-slate-50/50 border-transparent opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                    )}
                  >
                    <m.icon className={cn("h-7 w-7", activeSignals === i ? m.color : "text-slate-300")} />
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-all duration-500 translate-y-2 group-hover/node:translate-y-0 bg-slate-950 text-white px-4 py-2 rounded-xl z-30 shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">{m.label}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Module Integrity Grid interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 ml-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic flex items-center gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                Active_Intelligence_Nodes
              </h4>
              <Badge className="bg-pink-50 text-pink-600 border-none text-[10px] font-black italic px-4 py-1 rounded-full shadow-sm uppercase">8 Units_Live</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {modules.slice(0, 4).map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-8 rounded-[3rem] bg-slate-50/50 border border-slate-100 group/row hover:bg-white hover:border-pink-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/row:bg-pink-600 transition-all duration-700" />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={cn("h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-all duration-700 group-hover/row:scale-110 group-hover/row:rotate-3", m.color)}>
                      <m.icon className="h-7 w-7" />
                    </div>
                    <span className="text-lg font-black text-slate-950 italic tracking-tight uppercase leading-none group-hover/row:text-pink-600 transition-colors">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white border border-slate-100 px-5 py-2 rounded-2xl shadow-sm relative z-10">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic group-hover/row:text-emerald-600 transition-colors">SYNCED</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="p-10 rounded-[4rem] bg-slate-950 text-white relative overflow-hidden group/prime shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-600/10 opacity-50" />
              <Compass className="absolute bottom-[-40px] right-[-40px] h-56 w-56 text-white/[0.03] rotate-12 transition-transform duration-[3000ms] group-hover/prime:rotate-90 group-hover/prime:scale-110" />
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover/prime:scale-110 transition-transform duration-700">
                    <Zap className="h-7 w-7 text-pink-500 animate-pulse" />
                  </div>
                  <h5 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{t('missionControl.commandPath' as any) || 'Executive_Oversight'}</h5>
                </div>
                <p className="text-base text-slate-400 font-light leading-relaxed italic max-w-[320px]">
                  Authorize global aesthetic node expansion and recalibrate cross-region yield vectors for optimal network performance.
                </p>
                <Button className="w-full h-20 rounded-[2.5rem] bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-[0.3em] text-[11px] italic transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-pink-600/20 border-none group/btn">
                  {t('missionControl.launchAnalysis' as any) || 'Initialize_Global_Sync'}
                  <ArrowRight className="ml-4 h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic group-hover:text-slate-950 transition-colors">Precision_Orchestrator_v4.8 // Auth_State: <span className="text-emerald-600">VERIFIED</span></p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 px-6 py-2 rounded-full bg-white border border-slate-100 shadow-sm group/stats">
              <Info className="h-4 w-4 text-blue-600/40 group-hover:text-blue-600 transition-colors" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none group-hover:text-slate-950 transition-colors">Registry_Epoch: 2026.4</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
