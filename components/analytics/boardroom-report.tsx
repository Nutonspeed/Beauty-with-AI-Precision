"use client"

import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  ShieldCheck, 
  Zap, 
  FileText, 
  ArrowUpRight, 
  Activity,
  Brain,
  Target
} from "lucide-react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
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
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

export function AIBoardroomReport() {
  const t = useTranslations()

  const projectionData = [
    { name: 'Q1', revenue: 4.2, baseline: 3.8 },
    { name: 'Q2', revenue: 5.8, baseline: 4.1 },
    { name: 'Q3', revenue: 8.4, baseline: 4.5 },
    { name: 'Q4', revenue: 12.6, baseline: 4.8 },
  ]

  const kpis = [
    { label: t('boardroomReport.marketDominance'), val: '74%', sub: 'Global Elite Percentile', icon: Globe, color: 'text-cyan-400' },
    { label: t('boardroomReport.operationalAlpha'), val: '2.4x', sub: 'Efficiency vs Legacy', icon: Activity, color: 'text-pink-400' },
    { label: t('boardroomReport.clientEquity'), val: '฿84M', sub: 'Lifetime Network Value', icon: ShieldCheck, color: 'text-emerald-400' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[4rem] overflow-hidden shadow-2xl relative group min-h-[900px] flex flex-col animate-neural-pulse">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center animate-grid-drift" />
      
      <CardHeader className="p-16 lg:p-24 pb-12 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.03] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
          <div className="space-y-6">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-2xl">
              <BarChart3 className="mr-3 h-4 w-4 animate-pulse" />
              {t('boardroomReport.title')}
            </Badge>
            <div className="space-y-2">
              <h3 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">
                {t('ui.labels.executive')}<br />
                <span className="text-pink-500">{t('ui.labels.synthesis')}</span>
              </h3>
              <p className="text-slate-500 text-lg font-light tracking-[0.1em] italic max-w-xl">
                {t('boardroomReport.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-white/10">
              {t('boardroomReport.viewFullModel')}
            </Button>
            <Button variant="premium" className="h-16 px-10 rounded-2xl border shadow-xl shadow-pink-500/20 uppercase text-[10px] font-black tracking-[0.3em] italic group">
              {t('boardroomReport.downloadReport')}
              <FileText className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-16 lg:p-24 space-y-24 flex-1 relative z-10">
        {/* Strategic Growth KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-2xl group/kpi hover:bg-white/[0.04] transition-all"
            >
              <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner mb-8 transition-transform group-kpi:scale-110 animate-synaptic-fire", kpi.color.replace('text-', 'bg-').replace('400', '500/10'))}>
                <kpi.icon className={cn("h-8 w-8", kpi.color)} />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{kpi.label}</p>
                <p className={cn("text-5xl font-black italic tracking-tighter text-white")}>{kpi.val}</p>
                <Badge variant="outline" className="text-[9px] font-black border-white/10 text-slate-500 italic uppercase">
                  {kpi.sub}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI-Driven Outlook Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-black text-white italic uppercase tracking-[0.2em] flex items-center gap-4">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
                {t('boardroomReport.aiProjection')}
              </h4>
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{t('ui.labels.aiYield')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{t('ui.labels.legacyBaseline')}</span>
                </div>
              </div>
            </div>
            
            <div className="h-[450px] w-full bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }}
                    dy={20}
                  />
                  <YAxis hide domain={[0, 15]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '20px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="rgba(255,255,255,0.1)" 
                    fill="transparent" 
                    strokeWidth={2}
                    strokeDasharray="8 8"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ec4899" 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    strokeWidth={6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Summary Synthesis */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner animate-synaptic-fire">
                  <Brain className="h-6 w-6 text-pink-400" />
                </div>
                <h4 className="text-xl font-bold text-white italic uppercase tracking-widest">{t('boardroomReport.executiveSummary')}</h4>
              </div>
              <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                  <Target className="h-40 w-40" />
                </div>
                <p className="text-lg text-slate-400 font-light leading-relaxed italic relative z-10">
                  {t('ui.labels.networkEfficiency', {
                    state: t('ui.labels.criticalMassPivot'),
                    percent: 92,
                    target: t('ui.labels.biologicalRetentionLoop'),
                    multiplier: 2.4
                  })}
                </p>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent border border-cyan-500/20 space-y-8 relative overflow-hidden group/action">
              <div className="flex items-center gap-4 relative z-10">
                <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
                <h5 className="text-sm font-black text-white uppercase tracking-widest">{t('boardroomReport.recommendationNode')}</h5>
              </div>
              <p className="text-sm text-slate-400 font-light leading-relaxed italic relative z-10">
                {t('ui.labels.authorizeExpansion', {
                  node: t('ui.labels.globalNodeExpansion'),
                  region: t('ui.labels.easternSeaboard'),
                  percent: 24
                })}
              </p>
              <Button className="w-full h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-widest text-[10px] italic transition-all group-hover/action:shadow-2xl group-hover/action:shadow-cyan-500/20">
                {t('boardroomReport.executeStrategicExpansion')}
                <ArrowUpRight className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-16 lg:p-24 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-6 text-slate-600">
            <ShieldCheck className="h-6 w-6" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">{t('ui.labels.certifiedOversight')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">{t('ui.status.allSystemsOptimal')}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
