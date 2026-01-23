"use client"

import { motion } from "framer-motion"
import { Zap, Activity, Timer, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function SalesVelocity() {
  const t = useTranslations()

  const velocityData = [
    { staff: 'Specialist Sarah', avgDays: 4.2, trend: -12, status: 'Accelerating' },
    { staff: 'Assistant Joy', avgDays: 6.8, trend: +5, status: 'Stable' },
    { staff: 'Specialist Mike', avgDays: 3.5, trend: -18, status: 'Optimal' },
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-cyan-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <Timer className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            {t('salesVelocity.title' as any) || 'Sales_Velocity_Index'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('salesVelocity.subtitle' as any) || 'Temporal deal cycle efficiency monitoring'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-10 bg-white">
        <div className="space-y-6">
          {velocityData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] group/item hover:bg-white hover:border-cyan-500/20 transition-all duration-700 shadow-sm hover:shadow-premium relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/item:bg-blue-600 transition-all duration-700" />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:scale-110 transition-transform duration-700">
                    <Activity className="h-7 w-7 text-slate-300 group-hover/item:text-blue-600 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-slate-950 italic uppercase group-hover/item:text-blue-600 transition-colors leading-none">{item.staff}</p>
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest border-none bg-white text-slate-400 italic px-4 py-1.5 rounded-full shadow-sm">{item.status}</Badge>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('salesVelocity.avgClosingDays' as any) || 'Mean_Cycle'}</p>
                  <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{item.avgDays} <span className="text-[10px] text-slate-300 not-italic ml-1">DAYS</span></p>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic relative z-10">
                <span className="text-slate-400 group-hover/item:text-slate-950 transition-colors">Efficiency Delta</span>
                <span className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm",
                  item.trend < 0 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                )}>
                  {item.trend < 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.trend < 0 ? 'Accelerating' : 'Decelerating'} {Math.abs(item.trend)}% Δ
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-10 rounded-[3rem] bg-blue-50/50 border border-blue-100 flex items-center gap-8 relative overflow-hidden group/insight shadow-inner">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-1000">
            <Zap className="w-32 h-32 text-blue-600" />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
            <Zap className="h-7 w-7 text-blue-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-600 font-medium italic leading-relaxed relative z-10 tracking-tight">
            AI identifies <span className="text-slate-950 font-black uppercase">3D Visual Confirmation</span> as the primary accelerator node for reducing aesthetic deal closing cycles.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
