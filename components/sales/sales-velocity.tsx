"use client"

import { motion } from "framer-motion"
import { Zap, Activity, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function SalesVelocity() {
  const t = useTranslations()

  const velocityData = [
    { staff: 'Dr. Sarah', avgDays: 4.2, trend: -12, status: 'Accelerating' },
    { staff: 'Nurse Joy', avgDays: 6.8, trend: +5, status: 'Stable' },
    { staff: 'Dr. Mike', avgDays: 3.5, trend: -18, status: 'Optimal' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <CardHeader className="p-10 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Timer className="h-6 w-6 text-cyan-400" />
            {t('salesVelocity.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('salesVelocity.subtitle')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-10 space-y-8">
        <div className="space-y-6">
          {velocityData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.04] transition-all"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white italic">{item.staff}</p>
                    <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/5 text-slate-500">{item.status}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('salesVelocity.avgClosingDays')}</p>
                  <p className="text-xl font-black text-white italic">{item.avgDays} Days</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-slate-600">Velocity Index</span>
                <span className={cn(item.trend < 0 ? "text-emerald-400" : "text-amber-400")}>
                  {item.trend < 0 ? 'Accelerating' : 'Decelerating'} {Math.abs(item.trend)}% Δ
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl flex items-center gap-4">
          <Zap className="h-5 w-5 text-cyan-500 animate-pulse" />
          <p className="text-[10px] text-slate-400 font-light italic leading-relaxed">
            AI identifies <span className="text-white font-bold">3D Visual Confirmation</span> as the primary accelerator for deal closing cycles.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
