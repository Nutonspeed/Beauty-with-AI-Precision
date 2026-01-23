"use client"

import { motion } from "framer-motion"
import { Globe, Trophy, Zap, ArrowUpRight, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false });
// @ts-ignore
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false });
// @ts-ignore
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false });
// @ts-ignore
const PolarRadiusAxis = dynamic(() => import('recharts').then(mod => mod.PolarRadiusAxis), { ssr: false });
// @ts-ignore
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface IndustryBenchmarkingProps {
  isEnterprise: boolean
}

export function IndustryBenchmarking({ isEnterprise }: IndustryBenchmarkingProps) {
  const t = useTranslations()

  const radarData = [
    { subject: t('industryBenchmarking.radarLabels.aiAdoption' as any) || 'AI_Adoption', A: 95, B: 60, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.conversionRate' as any) || 'Conv_Yield', A: 82, B: 45, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.retention' as any) || 'Retention', A: 78, B: 55, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.aov' as any) || 'AOV_Index', A: 91, B: 70, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.customerTrust' as any) || 'Trust_Score', A: 88, B: 65, fullMark: 100 },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-cyan-500/20 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-cyan-50 text-cyan-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            GLOBAL_ELITE_DATA_LOCKED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('industryBenchmarking.title' as any) || 'Global_Industry_Benchmarking'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock the industry benchmark matrix to compare your node's performance against the top 1% of global precision aesthetic centers.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-cyan-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            {t('industryBenchmarking.unlockIndustryMatrix' as any) || 'Authorize_Benchmark_Sync'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 shadow-sm group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-700">
              <Globe className="h-8 w-8 text-cyan-600 group-hover:text-white" />
            </div>
            {t('industryBenchmarking.title' as any) || 'Industry_Benchmark'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('industryBenchmarking.subtitle' as any) || 'Global network performance indexing and competitive yield mapping'}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-cyan-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-cyan-600/30 uppercase tracking-widest animate-pulse">
            {t('industryBenchmarking.enterpriseElite' as any) || 'ENTERPRISE_ELITE_LINK'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Industry Radar Chart interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-cyan-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('industryBenchmarking.efficiencyComparison' as any) || 'Multi-Vector_Yield_Mapping'}</h4>
              </div>
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-glow-blue" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('industryBenchmarking.yourCenter' as any) || 'LOCAL_NODE'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('industryBenchmarking.globalAvg' as any) || 'GLOBAL_MEAN'}</span>
                </div>
              </div>
            </div>
            
            <div className="h-[450px] w-full flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-[3.5rem] p-10 shadow-inner group/chart overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-full w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.05)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                    />
                    <PolarRadiusAxis hide domain={[0, 100]} />
                    <Radar 
                      name={t('industryBenchmarking.yourCenterLabel' as any) || 'LOCAL_NODE'} 
                      dataKey="A" 
                      stroke="#06b6d4" 
                      fill="#06b6d4" 
                      fillOpacity={0.3} 
                      strokeWidth={4}
                    />
                    <Radar 
                      name={t('industryBenchmarking.globalAvgLabel' as any) || 'GLOBAL_MEAN'} 
                      dataKey="B" 
                      stroke="#e2e8f0" 
                      fill="#e2e8f0" 
                      fillOpacity={0.1} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#06b6d4', letterSpacing: '0.1em' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Global Percentiles interface */}
          <div className="lg:col-span-5 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              {t('industryBenchmarking.marketPosition' as any) || 'Competitive_Positioning_Registry'}
            </h4>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: t('industryBenchmarking.techAdoption' as any) || 'Tech_Adoption_Index', percentile: 98, sub: (t('industryBenchmarking.topGlobally' as any || 'TOP {val}%').replace('{val}', '2')), color: 'text-cyan-600', bg: 'bg-cyan-50' },
                { label: 'Conversion_Velocity', percentile: 85, sub: (t('industryBenchmarking.topGlobally' as any || 'TOP {val}%').replace('{val}', '15')), color: 'text-pink-600', bg: 'bg-pink-50' },
                { label: 'AI_Yield_Efficiency', percentile: 92, sub: (t('industryBenchmarking.topGlobally' as any || 'TOP {val}%').replace('{val}', '8')), color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-cyan-500/20 transition-all duration-700 group/stat shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/stat:bg-cyan-600 transition-all duration-700" />
                  <div className="flex justify-between items-end mb-6 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none group-hover/stat:text-slate-950 transition-colors">{m.label}</p>
                      <p className={cn("text-4xl font-black italic tracking-tighter uppercase leading-none", m.color)}>{m.percentile}%</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black border-slate-200 bg-white text-slate-400 italic px-4 py-1.5 rounded-full shadow-sm group-hover/stat:text-pink-600 transition-all uppercase">{m.sub}</Badge>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner relative z-10">
                    <motion.div 
                      initial={{ width: 0 }} 
                      whileInView={{ width: `${m.percentile}%` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }} 
                      className={cn("h-full rounded-full transition-all duration-1000", m.color.replace('text', 'bg'), "shadow-glow-blue/20")} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-cyan-50/50 border border-cyan-100 flex items-start gap-8 relative overflow-hidden group/insight shadow-inner">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-1000">
                <Zap className="w-32 h-32 text-cyan-600" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white border border-cyan-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                <Zap className="h-7 w-7 text-cyan-600 animate-pulse" />
              </div>
              <div className="space-y-2 relative z-10 pt-1">
                <p className="text-lg font-black text-slate-950 italic uppercase tracking-tight leading-none">Competitive_Edge_Log</p>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">
                  {t('industryBenchmarking.engagementInsight' as any || 'Your node efficiency exceeds the global benchmark by {percent} delta. Synchronisation state: ELITE.').replace('{percent}', '24.2%')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Benchmark_Integrity_Verified: NOMINAL</p>
        </div>
        <Button variant="premium" size="xl" className="h-16 px-10 rounded-2xl bg-slate-950 hover:bg-cyan-600 text-white font-black uppercase tracking-[0.3em] text-[10px] italic transition-all duration-500 shadow-2xl hover:shadow-cyan-500/20 border-none group/btn">
          {t('industryBenchmarking.generateReport' as any) || 'Export_Strategic_Log'}
          <ArrowUpRight className="ml-4 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
}
