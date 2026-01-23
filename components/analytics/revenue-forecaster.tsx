"use client"

import { useState } from "react"
import { TrendingUp, Target, ArrowUpRight, BarChart, ShieldCheck, Zap, Binary } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'
import { motion } from "framer-motion"

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
    { label: t('revenueForecasting.pipelineValue' as any) || 'Pipeline_Volume', val: '฿2.4M', sub: t('revenueForecasting.opportunityLoad' as any) || 'Active Lead Nodes', icon: BarChart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('revenueForecasting.expectedRevenue' as any) || 'Expected_Yield', val: '฿1.8M', sub: t('revenueForecasting.probabilityYield' as any) || '92% Probable Inflow', icon: Target, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: t('revenueForecasting.riskFactor' as any) || 'Risk_Coefficient', val: 'LOW', sub: '4% Churn Probability', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 flex flex-col",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-pink-50 text-pink-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            ENTERPRISE_INTELLIGENCE_LOCKED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('revenueForecasting.title' as any) || 'Predictive_Yield_Forecaster'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock the ability to predict future revenue cycles based on historical clinical yield and active biological trajectories.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            {t('revenueForecasting.unlockRevenuePrediction' as any) || 'Authorize_Financial_AI'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <TrendingUp className="h-8 w-8 text-pink-600 group-hover:text-white" />
              </div>
              {t('revenueForecasting.title' as any) || 'Yield_Forecaster'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
              {t('revenueForecasting.subtitle' as any) || 'Autonomous financial cycle forecasting'}
            </CardDescription>
          </div>
          <div className="flex bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-inner shrink-0">
            {(['30d', '60d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-700 italic",
                  period === p 
                    ? "bg-pink-600 text-white shadow-premium scale-105" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Forecast Chart interface */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Binary className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('revenueForecasting.forecastChart' as any) || 'Temporal_Projection_Mesh'}</h4>
              </div>
              <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-50 text-blue-600 bg-white font-black italic tracking-widest text-[9px] uppercase shadow-sm">
                {t('revenueForecasting.probabilityModel' as any) || 'BAYESIAN_PROBABILITY_ON'}
              </Badge>
            </div>
            
            <div className="h-[400px] w-full bg-slate-50/50 border border-slate-100 rounded-[3.5rem] p-10 overflow-hidden relative shadow-inner group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-full w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={15} 
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(v) => `฿${v/1000}K`} 
                      dx={-10} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#ff69b4', letterSpacing: '0.1em' }}
                    />
                    <Area type="monotone" dataKey="upper" stroke="transparent" fill="#ff69b4" fillOpacity={0.03} />
                    <Area type="monotone" dataKey="lower" stroke="transparent" fill="#ff69b4" fillOpacity={0.03} />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#ff69b4" 
                      strokeWidth={6} 
                      fillOpacity={1} 
                      fill="url(#colorPredicted)" 
                      name="PREDICTED_INFLOW"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#020617" 
                      strokeWidth={4} 
                      strokeDasharray="8 8" 
                      fill="transparent" 
                      name="ACTUAL_LOAD"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-pink-50/50 border border-pink-100 flex items-start gap-8 relative overflow-hidden group/insight shadow-inner">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-1000">
                <Zap className="w-32 h-32 text-pink-600" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white border border-pink-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                <Zap className="h-7 w-7 text-pink-600 animate-pulse" />
              </div>
              <div className="space-y-2 relative z-10 pt-1">
                <p className="text-lg font-black text-slate-950 italic uppercase tracking-tight leading-none">{t('revenueForecasting.growthInsight' as any) || 'Yield_Acceleration_Signal'}</p>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">
                  {t('revenueForecasting.growthInsightDesc' as any) || 'AI predictive models suggest a 24% increase in high-yield cycles for W4, driven by seasonal dermal regeneration trends.'}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid interface */}
          <div className="lg:col-span-4 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              {t('revenueForecasting.predictiveParameters' as any) || 'Forecasted_Node_Vectors'}
            </h4>
            <div className="space-y-6">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-pink-500/20 transition-all duration-700 group/metric shadow-sm hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-50 group-hover/metric:bg-pink-600 transition-all duration-700" />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover/metric:scale-110 shadow-inner group-hover/metric:bg-white", m.bg, m.color)}>
                      <m.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none group-hover/metric:text-slate-950 transition-colors">{m.label}</p>
                      <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/metric:text-pink-600 transition-colors">{m.val}</p>
                      <p className="text-[10px] text-slate-500 font-medium italic group-hover/metric:text-slate-700 transition-colors leading-none pt-1">{m.sub}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button variant="premium" size="xl" className="w-full h-20 rounded-[2.5rem] bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.3em] text-[11px] italic transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-pink-500/20 border-none group/btn">
              {t('revenueForecasting.generateStrategicReport' as any) || 'Authorise_Boardroom_Sync'}
              <ArrowUpRight className="ml-4 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Forecaster_Stability_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-6 bg-blue-500/40" />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Model: BIP-Fin-v4.2</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
