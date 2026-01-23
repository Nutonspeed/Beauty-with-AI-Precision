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
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Globe className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            {t('globalPerformanceIndex.title')}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('globalPerformanceIndex.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-pink-50 text-pink-600 border-none px-5 py-1.5 text-[10px] font-black tracking-widest uppercase italic shadow-sm animate-pulse">
            {t('ui.hud.globalTelemetryLive')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Performance Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('globalPerformanceIndex.performanceMatrix')}</h4>
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-pink-500 shadow-glow-pink" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{t('ui.hud.systemPerformance')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{t('ui.hud.globalBenchmark')}</span>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full bg-white border border-slate-100 rounded-[3rem] p-8 overflow-hidden shadow-inner relative group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center" />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    dy={15}
                  />
                  <YAxis 
                    hide 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', color: '#ec4899' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="benchmark" 
                    stroke="#e2e8f0" 
                    fill="transparent" 
                    strokeWidth={2}
                    strokeDasharray="8 8"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#ec4899" 
                    fillOpacity={1} 
                    fill="url(#colorPerf)" 
                    strokeWidth={6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('ui.hud.operationalYield')}</h4>
            <div className="grid grid-cols-1 gap-6">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group/metric shadow-sm hover:shadow-premium"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className={cn("h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/metric:scale-110 transition-transform duration-700", m.color.replace('400', '600').replace('text-', 'bg-').replace('600', '50'))}>
                        <m.icon className={cn("h-7 w-7", m.color.replace('400', '600'))} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{m.label}</p>
                        <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{m.value}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black border-none bg-slate-50 text-slate-400 italic px-4 py-1.5 rounded-full shadow-sm">
                      {m.sub}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-pink-50 to-white border border-pink-100 space-y-8 relative overflow-hidden group/box shadow-premium">
              <Activity className="absolute bottom-[-20px] right-[-20px] h-48 w-48 text-pink-500/5 rotate-12 transition-transform duration-[2000ms] group-hover/box:rotate-90 group-hover/box:scale-110" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="h-14 w-14 rounded-[1.5rem] bg-white flex items-center justify-center shadow-sm group-hover/box:scale-110 transition-all duration-500">
                  <Target className="h-7 w-7 text-pink-600 animate-pulse" />
                </div>
                <h5 className="text-sm font-black text-slate-950 uppercase tracking-[0.4em] italic leading-none">{t('ui.hud.efficiencyAlpha')}</h5>
              </div>
              <p className="text-[13px] text-slate-500 font-light leading-relaxed italic relative z-10 tracking-tight">
                {t('ui.hud.systemEfficiencyDesc', { multiplier: '2.4' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-white">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
              {t('globalPerformanceIndex.dataSync')}: <span className="text-slate-900">{t('ui.hud.latencyValue', { val: '0.2' })}</span>
            </p>
          </div>
          <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-premium italic">
            {t('ui.hud.downloadStrategyReport')}
            <ArrowUpRight className="ml-4 h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
