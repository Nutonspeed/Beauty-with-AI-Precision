"use client"

import { motion } from "framer-motion"
import { Activity, Zap, ShieldCheck, Binary, Layers, Target } from "lucide-react"
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

interface AestheticOutcomeQuantifierProps {
  isPremium: boolean
}

export function AestheticOutcomeQuantifier({ isPremium }: AestheticOutcomeQuantifierProps) {
  const t = useTranslations()

  const data = [
    { name: 'Week 1', improvement: 12 },
    { name: 'Week 2', improvement: 28 },
    { name: 'Week 4', improvement: 45 },
    { name: 'Week 6', improvement: 68 },
    { name: 'Week 8', improvement: 82 },
    { name: 'Week 12', improvement: 94 },
  ]

  const metrics = [
    { label: t('outcomeQuantifier.volumetricChange'), val: '+14.2%', icon: Layers, color: 'text-blue-600' },
    { label: t('outcomeQuantifier.texturalRefinement'), val: '+38.5%', icon: Activity, color: 'text-indigo-600' },
    { label: t('outcomeQuantifier.pigmentReduction'), val: '-24.8%', icon: Target, color: 'text-cyan-600' },
    { label: t('outcomeQuantifier.quantifiedSuccess'), val: '92%', icon: ShieldCheck, color: 'text-blue-700' },
  ]

  return (
    <Card className={cn(
      "border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-blue-600 text-white border-none uppercase tracking-widest font-black">{t('outcomeQuantifier.lockedBadge')}</Badge>
          <h3 className="text-2xl font-bold text-slate-900 italic mb-4">{t('outcomeQuantifier.title')}</h3>
          <p className="text-slate-500 max-w-sm font-light mb-8">
            {t('outcomeQuantifier.subtitle')}
          </p>
          <button className="h-14 px-10 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 uppercase text-[10px] font-black tracking-widest italic border-none">
            {t('outcomeQuantifier.unlockButton')}
          </button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight italic flex items-center gap-4">
            <Binary className="h-8 w-8 text-blue-600" />
            {t('outcomeQuantifier.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('outcomeQuantifier.subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-500/20 text-blue-600 bg-blue-500/5 font-black italic tracking-widest text-[9px]">
          {t('outcomeQuantifier.verifiedBadge')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('outcomeQuantifier.beforeAfterDelta')}</h4>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{t('outcomeQuantifier.neuralTrackingActive')}</span>
              </div>
            </div>
            
            <div className="h-[350px] w-full bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#2563eb' }}
                  />
                  <Bar 
                    dataKey="improvement" 
                    fill="#2563eb" 
                    radius={[10, 10, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Column */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('outcomeQuantifier.improvementMetrics')}</h4>
            <div className="grid grid-cols-1 gap-4">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group/metric shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm", m.color)}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{m.label}</p>
                        <p className="text-xl font-black text-slate-900 italic tracking-tighter">{m.val}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/5 via-transparent to-transparent border border-blue-500/10 space-y-6 relative overflow-hidden">
              <Zap className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-blue-500/5 rotate-12" />
              <div className="flex items-center gap-4 relative z-10">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Aesthetic Authority</h5>
              </div>
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic relative z-10">
                {t('outcomeQuantifier.precisionDesc', { engine: 'BIP-Quant-Analysis', precision: '99.8' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-100 bg-slate-50/30">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
            {t('ui.hud.outcomeVerified')}
          </p>
          <button className="h-14 px-8 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 italic text-slate-600 shadow-sm transition-all">
            {t('outcomeQuantifier.exportReport')}
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}
