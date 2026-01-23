"use client"

import { motion } from "framer-motion"
import { Activity, Zap, ShieldCheck, Binary, Layers, Target, TrendingUp, ChevronRight, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
// @ts-ignore
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
// @ts-ignore
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

interface AestheticOutcomeQuantifierProps {
  isPremium: boolean
}

export function AestheticOutcomeQuantifier({ isPremium }: AestheticOutcomeQuantifierProps) {
  const t = useTranslations()

  const data = [
    { name: 'W1', improvement: 12, color: '#fbcfe8' },
    { name: 'W2', improvement: 28, color: '#f9a8d4' },
    { name: 'W4', improvement: 45, color: '#f472b6' },
    { name: 'W6', improvement: 68, color: '#ec4899' },
    { name: 'W8', improvement: 82, color: '#db2777' },
    { name: 'W12', improvement: 94, color: '#be185d' },
  ]

  const metrics = [
    { label: t('outcomeQuantifier.volumetricChange' as any) || 'Volumetric_Shift', val: '+14.2%', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('outcomeQuantifier.texturalRefinement' as any) || 'Texture_Sync', val: '+38.5%', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: t('outcomeQuantifier.pigmentReduction' as any) || 'Melanin_Delta', val: '-24.8%', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('outcomeQuantifier.quantifiedSuccess' as any) || 'Aggregate_Yield', val: '92%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/20",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-blue-50 text-blue-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            QUANTIFIER_ACCESS_RESTRICTED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('outcomeQuantifier.title' as any) || 'Outcome_Quantification_Matrix'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed">
              Unlock the ability to mathematically quantify your aesthetic transformation yield across multiple biological vectors.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-blue-600/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            {t('outcomeQuantifier.unlockButton' as any) || 'Authorize_Analytics_Sync'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <Binary className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            {t('outcomeQuantifier.title' as any) || 'Outcome_Quantifier'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('outcomeQuantifier.subtitle' as any) || 'High-fidelity biological result quantification'}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/30 text-blue-600 bg-white font-black italic tracking-widest text-[9px] uppercase shadow-sm">
          {t('outcomeQuantifier.verifiedBadge' as any) || 'PRECISION_VERIFIED'}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Chart interface */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-pink-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('outcomeQuantifier.beforeAfterDelta' as any) || 'Temporal_Yield_Mapping'}</h4>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 shadow-inner">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-glow-blue" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{t('outcomeQuantifier.neuralTrackingActive' as any) || 'Neural_Flux_Live'}</span>
              </div>
            </div>
            
            <div className="h-[400px] w-full bg-slate-50/50 border border-slate-100 rounded-[3.5rem] p-10 overflow-hidden relative shadow-inner group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-full w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                      dy={15}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 100]} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59,130,246,0.02)' }}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#ff69b4', letterSpacing: '0.1em' }}
                    />
                    <Bar 
                      dataKey="improvement" 
                      radius={[12, 12, 0, 0]}
                      barSize={48}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Metrics Column interface */}
          <div className="lg:col-span-4 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              {t('outcomeQuantifier.improvementMetrics' as any) || 'Vector_Deltas'}
            </h4>
            <div className="grid grid-cols-1 gap-6">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-blue-500/20 transition-all duration-700 group/metric shadow-sm hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-50 group-hover/metric:bg-blue-600 transition-all duration-700" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover/metric:scale-110 shadow-inner group-hover/metric:bg-white", m.bg, m.color)}>
                      <m.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/metric:text-slate-950 transition-colors leading-none">{m.label}</p>
                      <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/metric:text-blue-600 transition-colors">{m.val}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-slate-200 group-hover/metric:bg-blue-50 group-hover/metric:text-blue-600 transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-8 relative overflow-hidden group/authority shadow-inner transition-all duration-700 hover:bg-white hover:border-blue-500/20">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/authority:scale-110 group-hover/authority:rotate-12 transition-transform duration-1000">
                <ShieldCheck className="w-32 h-32 text-blue-600" />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-14 w-14 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/authority:scale-110 group-hover/authority:bg-blue-50 transition-all duration-700">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h5 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">{t('outcomeQuantifier.precisionDesc' as any || 'Aesthetic_Authority').split(' | ')[0]}</h5>
              </div>
              <p className="text-sm text-slate-500 font-medium italic leading-relaxed relative z-10 tracking-tight">
                {t('outcomeQuantifier.precisionDesc' as any || 'Outcome metrics verified via BIP-Quant-Analysis cluster with 99.8% precision confidence.')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <Info className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">{t('ui.hud.outcomeVerified' as any) || 'Biological_Yield_Verified: NOMINAL'}</p>
        </div>
        <Button variant="outline" size="xl" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 group/export">
          <Download className="mr-4 h-5 w-5 text-pink-600 group-hover/export:translate-y-1 transition-transform" />
          {t('outcomeQuantifier.exportReport' as any) || 'Export_Yield_Portfolio'}
        </Button>
      </CardFooter>
    </Card>
  )
}
