"use client"

import { useState } from "react"
import { TrendingUp, Target, ArrowUpRight, BarChart, ShieldCheck, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

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
// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface RevenueForecasterProps {
  isEnterprise: boolean
}

export function RevenueForecaster({ isEnterprise }: RevenueForecasterProps) {
  const t = useTranslations()
  const [period, setPeriod] = useState<'30d' | '60d' | '90d'>('30d')

  const forecastData = [
    { day: 'W1', actual: 450000, predicted: 450000, upper: 450000, lower: 450000 },
    { day: 'W2', actual: 480000, predicted: 480000, upper: 480000, lower: 480000 },
    { day: 'W3', actual: null, predicted: 520000, upper: 560000, lower: 480000 },
    { day: 'W4', actual: null, predicted: 580000, upper: 640000, lower: 520000 },
    { day: 'W5', actual: null, predicted: 650000, upper: 720000, lower: 580000 },
  ]

  const metrics = [
    { label: t('revenueForecasting.pipelineValue'), val: '฿2.4M', sub: t('revenueForecasting.opportunityLoad'), icon: BarChart, color: 'text-cyan-400' },
    { label: t('revenueForecasting.expectedRevenue'), val: '฿1.8M', sub: t('revenueForecasting.probabilityYield'), icon: Target, color: 'text-pink-400' },
    { label: t('revenueForecasting.riskFactor'), val: t('revenueForecasting.low'), sub: t('revenueForecasting.churnProb', { val: 4 }), icon: ShieldCheck, color: 'text-emerald-400' },
  ]

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">{t('revenueForecasting.enterpriseIntelligence')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('revenueForecasting.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('revenueForecasting.subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-pink-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('revenueForecasting.unlockRevenuePrediction')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-pink-500" />
            {t('revenueForecasting.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('revenueForecasting.subtitle')}
          </CardDescription>
        </div>
        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 shrink-0">
          {(['30d', '60d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500",
                period === p 
                  ? "bg-pink-600 text-white shadow-2xl scale-105 italic" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t(`revenueForecasting.forecastPeriods.${p}`)}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Forecast Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-3">
                <BarChart className="h-4 w-4 text-pink-500" />
                {t('revenueForecasting.forecastChart')}
              </h4>
              <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/5 text-slate-500">{t('revenueForecasting.probabilityModel')}</Badge>
            </div>
            
            <div className="h-[350px] w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dy={10} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickFormatter={(v) => `฿${v/1000}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  {/* Confidence Interval */}
                  <Area type="monotone" dataKey="upper" stroke="transparent" fill="#ec4899" fillOpacity={0.05} />
                  <Area type="monotone" dataKey="lower" stroke="transparent" fill="#ec4899" fillOpacity={0.05} />
                  {/* Predicted Line */}
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#ec4899" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPredicted)" 
                    name={t('revenueForecasting.predictedInflow')}
                  />
                  {/* Actual Line */}
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#ffffff" 
                    strokeWidth={4} 
                    strokeDasharray="5 5" 
                    fill="transparent" 
                    name={t('revenueForecasting.actualInflow')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-6 p-6 bg-pink-500/5 border border-pink-500/10 rounded-3xl">
              <Zap className="h-6 w-6 text-pink-500" />
              <div>
                <p className="text-xs font-bold text-white italic">{t('revenueForecasting.growthInsight')}</p>
                <p className="text-[11px] text-slate-400 font-light mt-1">
                  {t('revenueForecasting.growthInsightDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('revenueForecasting.predictiveParameters')}</h4>
            <div className="space-y-6">
              {metrics.map((m, i) => (
                <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn("h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center", m.color)}>
                      <m.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{m.label}</p>
                      <p className="text-xl font-bold text-white italic tracking-tighter">{m.val}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-light italic">{m.sub}</p>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 italic">
              {t('revenueForecasting.generateStrategicReport')}
              <ArrowUpRight className="ml-3 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
