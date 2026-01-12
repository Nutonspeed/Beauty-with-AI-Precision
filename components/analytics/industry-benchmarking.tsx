"use client"

import { motion } from "framer-motion"
import { Globe, Trophy, Zap, ArrowUpRight } from "lucide-react"
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
    { subject: t('industryBenchmarking.radarLabels.aiAdoption'), A: 95, B: 60, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.conversionRate'), A: 82, B: 45, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.retention'), A: 78, B: 55, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.aov'), A: 91, B: 70, fullMark: 100 },
    { subject: t('industryBenchmarking.radarLabels.customerTrust'), A: 88, B: 65, fullMark: 100 },
  ]

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 uppercase tracking-widest font-black">{t('industryBenchmarking.globalEliteLocked')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('industryBenchmarking.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('industryBenchmarking.subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-cyan-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('industryBenchmarking.unlockIndustryMatrix')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Globe className="h-8 w-8 text-cyan-400" />
            {t('industryBenchmarking.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('industryBenchmarking.subtitle')}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-cyan-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('industryBenchmarking.enterpriseElite')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Industry Radar Chart */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-3">
                <Trophy className="h-4 w-4 text-cyan-500" />
                {t('industryBenchmarking.efficiencyComparison')}
              </h4>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('industryBenchmarking.yourCenter')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-700" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('industryBenchmarking.globalAvg')}</span>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis hide />
                  <Radar name={t('industryBenchmarking.yourCenterLabel')} dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                  <Radar name={t('industryBenchmarking.globalAvgLabel')} dataKey="B" stroke="#475569" fill="#475569" fillOpacity={0.1} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Global Percentiles */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('industryBenchmarking.marketPosition')}</h4>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: t('industryBenchmarking.techAdoption'), percentile: 98, sub: t('industryBenchmarking.topGlobally', { val: 2 }), color: 'text-cyan-400' },
                { label: t('adminDashboard.metrics.conversionVelocity'), percentile: 85, sub: t('industryBenchmarking.topGlobally', { val: 15 }), color: 'text-pink-400' },
                { label: t('industryBenchmarking.aiConversionIndex'), percentile: 92, sub: t('industryBenchmarking.topGlobally', { val: 8 }), color: 'text-emerald-400' },
              ].map((m, i) => (
                <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/stat">
                  <div className="flex justify-between items-end mb-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{m.label}</p>
                      <p className={cn("text-4xl font-black italic tracking-tighter", m.color)}>{m.percentile}%</p>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/10 text-slate-500 italic mb-1">{m.sub}</Badge>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.percentile}%` }} transition={{ duration: 1.5, delay: i * 0.2 }} className={cn("h-full", m.color === 'text-cyan-400' ? 'bg-cyan-500' : m.color === 'text-pink-400' ? 'bg-pink-500' : 'bg-emerald-500')} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl flex items-center gap-4">
              <Zap className="h-5 w-5 text-cyan-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-light italic leading-relaxed">
                {t('industryBenchmarking.engagementInsight', { percent: '24.2%' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 italic">
          {t('industryBenchmarking.generateReport')}
          <ArrowUpRight className="ml-3 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
