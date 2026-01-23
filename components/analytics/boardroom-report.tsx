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
    { label: t('boardroomReport.marketDominance' as any) || 'Market_Share', val: '74%', sub: 'Global Elite Segment', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('boardroomReport.operationalAlpha' as any) || 'Process_Alpha', val: '2.4x', sub: 'vs Legacy Ecosystem', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: t('boardroomReport.clientEquity' as any) || 'Asset_Equity', val: '฿84M', sub: 'Network LTV Yield', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group min-h-[900px] flex flex-col transition-all duration-1000 hover:border-pink-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center pointer-events-none" />
      
      <CardHeader className="p-16 lg:p-24 pb-12 border-b border-slate-50 bg-slate-50/30 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.03] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
          <div className="space-y-8">
            <Badge variant="outline" className="px-8 py-2.5 rounded-full border-pink-500/30 text-pink-600 bg-white backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-sm animate-pulse">
              <BarChart3 className="mr-3 h-4 w-4" />
              {t('boardroomReport.title' as any) || 'Executive_Inference_Report'}
            </Badge>
            <div className="space-y-4">
              <h3 className="text-6xl md:text-8xl font-black text-slate-950 italic tracking-tighter uppercase leading-[0.8]">
                {t('ui.labels.executive' as any) || 'Protocol'}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-3xl md:text-5xl">{t('ui.labels.synthesis' as any) || 'SYNTHESIS'}</span>
              </h3>
              <p className="text-slate-400 text-xl font-light tracking-[0.1em] italic max-w-2xl leading-relaxed">
                {t('boardroomReport.subtitle' as any) || 'Long-term strategic growth modeling derived from multi-node biological yield analytics.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 shrink-0">
            <Button variant="outline" size="xl" className="h-18 px-10 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">
              {t('boardroomReport.viewFullModel' as any) || 'CALIBRATE_MODEL'}
            </Button>
            <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/20 uppercase text-[11px] font-black tracking-[0.3em] italic group border-none bg-slate-950 text-white hover:bg-pink-600 transition-all active:scale-95">
              {t('boardroomReport.downloadReport' as any) || 'EXPORT_STRATEGIC_LOG'}
              <FileText className="ml-4 h-6 w-6 group-hover:translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-16 lg:p-24 space-y-24 flex-1 bg-white relative z-10">
        {/* Strategic Growth KPIs interface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-slate-100 bg-slate-50/50 border border-slate-100 shadow-inner rounded-[3.5rem] p-12 group/kpi hover:bg-white hover:border-pink-500/20 hover:shadow-premium transition-all duration-700 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/kpi:bg-pink-600 transition-all duration-700" />
                <div className="space-y-10 relative z-10">
                  <div className={cn("h-20 w-20 rounded-[1.5rem] flex items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover/kpi:scale-110 duration-700", kpi.bg)}>
                    <kpi.icon className={cn("h-10 w-10", kpi.color)} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover/kpi:text-slate-950 transition-colors leading-none">{kpi.label}</p>
                    <p className={cn("text-6xl font-black italic tracking-tighter text-slate-950 group-hover/kpi:text-pink-600 transition-colors leading-none")}>{kpi.val}</p>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-slate-100 relative z-10">
                  <Badge variant="outline" className="text-[10px] font-black border-slate-200 bg-white text-slate-400 italic uppercase tracking-widest px-5 py-1.5 rounded-full shadow-sm group-hover/kpi:border-pink-100 group-hover/kpi:text-pink-600 transition-all">
                    {kpi.sub}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI-Driven Outlook Chart interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-7 space-y-12">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                  {t('boardroomReport.aiProjection' as any) || 'Yield_Trajectory_Mesh'}
                </h4>
              </div>
              <div className="flex gap-10">
                <div className="flex items-center gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-pink-500 shadow-glow-pink animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('ui.labels.aiYield' as any) || 'AI_OPTIMIZED'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('ui.labels.legacyBaseline' as any) || 'BASELINE'}</span>
                </div>
              </div>
            </div>
            
            <div className="h-[500px] w-full bg-slate-50/50 border border-slate-100 rounded-[4rem] p-12 overflow-hidden relative shadow-inner group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
              <div className="h-full w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '900' }}
                      dy={20}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 15]} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(236,72,153,0.02)' }}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                      itemStyle={{ fontSize: '14px', fontWeight: 'black', textTransform: 'uppercase', color: '#ff69b4', letterSpacing: '0.1em' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="#e2e8f0" 
                      fill="transparent" 
                      strokeWidth={4}
                      strokeDasharray="10 10"
                      name="BASELINE_TRAJECTORY"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#ff69b4" 
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      strokeWidth={8}
                      className="shadow-glow-pink"
                      name="AI_OPTIMIZED_YIELD"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Executive Summary Synthesis interface */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-6 ml-4">
                <div className="h-12 w-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm">
                  <Brain className="h-7 w-7 text-pink-600 animate-pulse" />
                </div>
                <h4 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('boardroomReport.executiveSummary' as any) || 'Executive_Synthesis'}</h4>
              </div>
              <div className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden shadow-inner group/summary transition-all duration-700 hover:bg-white hover:border-pink-500/20">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover/summary:scale-110 transition-transform">
                  <Target className="h-48 w-48 text-slate-950" />
                </div>
                <p className="text-xl text-slate-600 font-light leading-relaxed italic relative z-10 tracking-tight">
                  {t('ui.labels.networkEfficiency' as any || 'Current node infrastructure has achieved {state} with {percent}% verified integrity. Biological retention loops suggest a {multiplier}x growth yield over current temporal cycles.').replace('{state}', 'CRITICAL_NOMINAL_STATE').replace('{percent}', '92').replace('{target}', 'AESTHETIC_RETENTION').replace('{multiplier}', '2.4')}
                </p>
              </div>
            </div>

            <div className="p-12 rounded-[3.5rem] bg-slate-950 text-white space-y-10 relative overflow-hidden group/action shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-pink-500/10 opacity-50" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover/action:scale-110 transition-transform duration-700">
                  <Zap className="h-7 w-7 text-blue-400 animate-pulse" />
                </div>
                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400 italic leading-none">{t('boardroomReport.recommendationNode' as any) || 'Strategic_Command_Recommendation'}</h5>
              </div>
              <p className="text-base text-slate-400 font-medium italic leading-relaxed relative z-10 tracking-tight">
                {t('ui.labels.authorizeExpansion' as any || 'Authorize clinical node expansion within the {region} sector. Predictive models suggest a {percent}% uplift in network-wide equity yield.').replace('{node}', 'Global_Node_Expansion').replace('{region}', 'METROPOLIS_HUB').replace('{percent}', '24')}
              </p>
              <div className="relative z-10">
                <Button variant="premium" size="xl" className="w-full h-20 rounded-[2rem] bg-white text-slate-950 border-none shadow-2xl transition-all hover:scale-105 active:scale-95 font-black text-[11px] uppercase tracking-[0.3em] italic group/btn">
                  {t('boardroomReport.executeStrategicExpansion' as any) || 'Initialize_Expansion_Sequence'}
                  <ArrowUpRight className="ml-4 h-6 w-6 text-blue-600 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-16 lg:p-24 border-t border-slate-50 bg-slate-50/30">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8 text-slate-400 group/status cursor-default">
            <div className="h-14 w-14 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/status:bg-emerald-50 transition-all duration-700">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 italic leading-none">{t('ui.labels.certifiedOversight' as any) || 'Governing_Board_Authorization'}</p>
              <p className="text-[10px] font-medium uppercase tracking-widest italic">Protocol_Integrity_Verified: NOMINAL</p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 bg-white border border-slate-100 px-8 py-3 rounded-full shadow-sm group/all">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em] italic group-hover/all:text-emerald-600 transition-colors">{t('ui.status.allSystemsOptimal' as any) || 'INFRASTRUCTURE_OPTIMAL'}</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 italic">
              <span>BIP_EXECUTIVE_LOG_v4.8</span>
              <div className="h-4 w-px bg-slate-200" />
              <span>EPOCH_2026.4</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
