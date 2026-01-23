'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Camera, 
  ArrowUpRight, 
  ArrowDownRight,
  Binary, 
  Fingerprint,
  Zap, 
  CheckCircle2, 
  Loader2, 
  DollarSign,
  ChevronRight,
  Info,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface ROIData {
  totalScans: number
  totalBookings: number
  conversionRate: number
  aiDrivenRevenue: number
  totalRevenue: number
  aiAttribution: number
  prevPeriodScans: number
  prevPeriodRevenue: number
  funnel: { stage: string; count: number; icon: string }[]
}

export function AestheticROIAnalytics() {
  const _t = useTranslations('analytics')
  const [data, setData] = useState<ROIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    async function fetchROI() {
      setLoading(true)
      try {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
        const response = await fetch(`/api/analytics/roi?days=${days}`)
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch ROI analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchROI()
  }, [period])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing ROI Intelligence...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const iconMap: Record<string, any> = {
    Camera: Camera,
    Zap: Zap,
    Target: Target,
    CheckCircle: CheckCircle2
  }

  const scanGrowth = data.prevPeriodScans ? ((data.totalScans - data.prevPeriodScans) / data.prevPeriodScans) * 100 : 0
  const revenueGrowth = data.prevPeriodRevenue ? ((data.aiDrivenRevenue - data.prevPeriodRevenue) / data.prevPeriodRevenue) * 100 : 0

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Time Filter interface */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="flex bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner shrink-0">
          {(['7d', '30d', '90d'] as const).map((p) => (
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
        
        {loading && data && (
          <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Syncing Temporal Matrix...</span>
          </div>
        )}
      </div>

      {/* Overview Metrics Grid interface */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'AI_Driven_Revenue', val: `฿${(data.aiDrivenRevenue / 1000).toFixed(1)}k`, sub: `${data.aiAttribution}% of Total`, growth: revenueGrowth, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: 'Conversion_Yield', val: `${data.conversionRate}%`, sub: 'Scan to Booking Sync', growth: 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { label: 'Neural_Traffic', val: data.totalScans, sub: `${period.toUpperCase()} Node Load`, growth: scanGrowth, icon: Binary, color: "text-pink-600", bg: "bg-pink-50" },
          { label: 'AI_Attribution', val: `${data.aiAttribution}%`, sub: 'Clinical Impact Factor', growth: 0, icon: Zap, color: "text-purple-600", bg: "bg-purple-50" }
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{m.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", m.bg)}>
                  <m.icon className={cn("h-5 w-5", m.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-6">
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{m.val}</div>
                  {m.growth !== 0 && (
                    <Badge className={cn(
                      "px-4 py-1 rounded-full text-[10px] font-black italic shadow-sm border-none leading-none",
                      m.growth > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {m.growth > 0 ? <ArrowUpRight className="h-3 w-3 mr-2" /> : <ArrowDownRight className="h-3 w-3 mr-2" />}
                      {Math.abs(m.growth).toFixed(1)}% Δ
                    </Badge>
                  )}
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-400 italic group-hover:text-slate-600 transition-colors">{m.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main ROI Funnel interface */}
      <div className="grid lg:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-8"
        >
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10 h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="space-y-3">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                    <Fingerprint className="h-8 w-8 text-pink-600 group-hover:text-white" />
                  </div>
                  ROI_Conversion_Funnel
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Quantifying AI impact across the comprehensive customer journey</CardDescription>
              </div>
              <Badge className="bg-pink-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-pink-600/30 uppercase tracking-widest animate-pulse">LIVE_INTEL</Badge>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 relative bg-white">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                {data.funnel.map((stage, idx) => {
                  const Icon = iconMap[stage.icon] || Zap
                  const isLast = idx === data.funnel.length - 1
                  return (
                    <motion.div 
                      key={stage.stage} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      className="relative group/stage p-10 text-center rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-pink-500/20 hover:shadow-premium transition-all duration-700 shadow-inner"
                    >
                      <div className="h-20 w-20 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 group-hover/stage:scale-110 group-hover/stage:rotate-3 transition-all duration-700 shadow-sm group-hover/stage:bg-pink-50 group-hover/stage:border-pink-100">
                        <Icon className="h-10 w-10 text-pink-600" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/stage:text-pink-600 transition-colors leading-none">{stage.stage.replace(/_/g, ' ')}</p>
                        <p className="text-5xl font-black text-slate-950 italic tracking-tighter leading-none">{stage.count}</p>
                      </div>
                      {!isLast && (
                        <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-100 group-hover/stage:text-pink-200 transition-colors z-20">
                          <ChevronRight className="h-8 w-8" />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Neural Attribution interface */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-4"
        >
          <Card className="border-slate-100 bg-slate-950 text-white shadow-2xl rounded-[4rem] overflow-hidden relative group transition-all duration-1000 h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-pink-500/10 opacity-50" />
            <CardHeader className="p-12 pb-0 relative z-10">
              <div className="flex items-center gap-4 ml-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-glow-blue" />
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400 italic leading-none">AI_Attribution_Index</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 pt-10 space-y-12 relative z-10 flex-1 flex flex-col justify-between">
              <div className="aspect-square rounded-[4rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group/attribution shadow-2xl transition-all duration-1000 hover:border-blue-500/30">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05]" />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-[10rem] font-black italic text-white tracking-tighter relative z-10 group-hover/attribution:scale-110 transition-transform duration-1000 leading-none"
                >
                  {data.aiAttribution}
                  <span className="text-4xl not-italic ml-2 opacity-30">%</span>
                </motion.div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400/60 mt-10 relative z-10 italic">Neural_Influence_Factor</p>
              </div>
              
              <div className="space-y-10">
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 shadow-inner group/val hover:bg-white/10 transition-all duration-700">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic group-hover/val:text-white transition-colors">Core_Yield_Contribution</p>
                    <span className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">฿{(data.aiDrivenRevenue / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${data.aiAttribution}%` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 shadow-glow-blue/30"
                    />
                  </div>
                </div>
                
                <div className="flex items-start gap-6 px-4 opacity-60 hover:opacity-100 transition-opacity">
                  <Info className="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic uppercase tracking-widest">
                    This index quantifies revenue nodes directly synthesized through AI skin analysis within 7 temporal days of final booking commitment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="p-10 lg:p-12 py-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">ROI_Engine_Nominal: 2026_PRO</p>
        </div>
        <p className="text-[10px] font-black text-pink-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">Analytics_Sync_Stable // BIP-ROI-v4.8</p>
      </div>
    </div>
  )
}
