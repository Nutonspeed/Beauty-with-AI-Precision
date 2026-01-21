"use client"

import { motion } from "framer-motion"
import { Globe, Trophy, TrendingUp, ShieldCheck, Zap, ArrowUpRight, Target, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
// @ts-ignore
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

export function GlobalPerformanceIndex() {
  const t = useTranslations('home.salesWizard')

  const chartData = [
    { name: 'Jan', performance: 85, benchmark: 70 },
    { name: 'Feb', performance: 88, benchmark: 72 },
    { name: 'Mar', performance: 92, benchmark: 71 },
    { name: 'Apr', performance: 90, benchmark: 74 },
    { name: 'May', performance: 95, benchmark: 73 },
    { name: 'Jun', performance: 98, benchmark: 75 },
  ]

  const metrics = [
    { label: t('globalPerformanceIndex.networkGrowth'), value: '+12.4%', sub: 'Global Median: +4.2%', icon: TrendingUp, color: 'text-pink-400' },
    { label: t('globalPerformanceIndex.aiUtilization'), value: '94.2%', sub: 'Industry Avg: 45.0%', icon: Zap, color: 'text-cyan-400' },
    { label: t('globalPerformanceIndex.systemHealth'), value: '99.99%', sub: 'SLA Target: 99.9%', icon: ShieldCheck, color: 'text-emerald-400' },
    { label: t('globalPerformanceIndex.globalRanking'), value: '#12', sub: 'Top 1% Worldwide', icon: Trophy, color: 'text-amber-400' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Globe className="h-8 w-8 text-cyan-400" />
            {t('globalPerformanceIndex.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('globalPerformanceIndex.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-cyan-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('ui.hud.globalTelemetryLive')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Performance Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('globalPerformanceIndex.performanceMatrix')}</h4>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('ui.hud.systemPerformance')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('ui.hud.globalBenchmark')}</span>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="benchmark" 
                    stroke="rgba(255,255,255,0.1)" 
                    fill="transparent" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#06b6d4" 
                    fillOpacity={1} 
                    fill="url(#colorPerf)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.operationalYield')}</h4>
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
                      <div className={cn("h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner", m.color)}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{m.label}</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">{m.value}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[7px] font-black border-white/5 text-slate-600 italic">
                      {m.sub}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent border border-cyan-500/20 space-y-6 relative overflow-hidden">
              <Activity className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-cyan-500/5 rotate-12" />
              <div className="flex items-center gap-4 relative z-10">
                <Target className="h-5 w-5 text-cyan-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest">{t('ui.hud.efficiencyAlpha')}</h5>
              </div>
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic relative z-10">
                {t('ui.hud.systemEfficiencyDesc', { multiplier: '2.4' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
              {t('globalPerformanceIndex.dataSync')}: {t('ui.hud.latencyValue', { val: '0.2' })}
            </p>
          </div>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 italic">
            {t('ui.hud.downloadStrategyReport')}
            <ArrowUpRight className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
