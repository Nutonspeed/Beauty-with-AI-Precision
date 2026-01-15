
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
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

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
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-pink-500 mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Syncing business intelligence...</p>
        </div>
      </Card>
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
    <div className="space-y-10">
      {/* Time Filter & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-inner">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500",
                period === p 
                  ? "bg-white text-[#020617] shadow-2xl scale-105 italic" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        
        {loading && data && (
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Syncing Temporal Data...</span>
          </div>
        )}
      </div>

      {/* Executive Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'AI_Driven_Revenue', val: `฿${(data.aiDrivenRevenue / 1000).toFixed(1)}k`, sub: `${data.aiAttribution}% of total`, growth: revenueGrowth, icon: DollarSign, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
          { label: 'Conversion_Yield', val: `${data.conversionRate}%`, sub: 'Scan to Booking', growth: 0, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: 'Neural_Traffic', val: data.totalScans, sub: `${period} period`, growth: scanGrowth, icon: Binary, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: 'AI_Attribution', val: `${data.aiAttribution}%`, sub: 'Business Impact', growth: 0, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
          >
            <Card className={cn("border-white/5 bg-slate-900/20 backdrop-blur-3xl rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all duration-500 group overflow-hidden relative ring-1 ring-white/10")}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30" />
              <div className={cn("absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700", m.color)}>
                <m.icon className="h-28 w-28" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">{m.label}</p>
                  {m.growth !== 0 && (
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black border-none px-3 py-0.5 rounded-full shadow-lg ring-1 ring-white/5",
                      m.growth > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                    )}>
                      {m.growth > 0 ? <ArrowUpRight className="h-2.5 w-2.5 mr-1.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-1.5" />}
                      {Math.abs(m.growth).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="text-5xl font-black text-white italic tracking-tighter leading-none">{m.val}</div>
                <div className="flex items-center gap-3">
                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", m.color.replace('text', 'bg'))} />
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] border-white/5 bg-white/5 text-slate-400 px-4 py-1 rounded-lg italic">
                    {m.sub}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main ROI Funnel Analysis */}
      <div className="grid lg:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8"
        >
          <Card className="h-full border-white/5 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(236,72,153,0.1)] relative group ring-1 ring-white/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent opacity-50" />
            <CardHeader className="p-10 lg:p-12 border-b border-white/5 flex flex-row items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-[2000ms]">
                <Fingerprint className="h-40 w-40 text-white" />
              </div>
              <div className="space-y-3 relative z-10">
                <CardTitle className="text-4xl font-black text-white tracking-tighter italic flex items-center gap-5 uppercase leading-none">
                  <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Fingerprint className="h-8 w-8 text-pink-400" />
                  </div>
                  ROI_Conversion_Funnel
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic ml-1">Quantifying AI impact across the customer journey</CardDescription>
              </div>
              <Badge className="bg-pink-600/20 text-pink-400 border border-pink-500/30 px-5 py-1.5 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase italic shadow-lg">Real_Time_Intel</Badge>
            </CardHeader>
            <CardContent className="p-10 lg:p-16 relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                {data.funnel.map((stage, idx) => {
                  const Icon = iconMap[stage.icon] || Zap
                  const isLast = idx === data.funnel.length - 1
                  return (
                    <motion.div 
                      key={stage.stage} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + (idx * 0.1), type: "spring" }}
                      className="relative group p-10 text-center rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-pink-500/20 transition-all duration-500"
                    >
                      <div className="h-20 w-20 bg-pink-500/5 border border-pink-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner ring-1 ring-white/5">
                        <Icon className="h-10 w-10 text-pink-400" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic leading-none">{stage.stage}</p>
                        <p className="text-5xl font-black text-white italic tracking-tighter leading-none">{stage.count}</p>
                      </div>
                      {!isLast && (
                        <div className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 text-pink-500/20 z-20">
                          <ArrowUpRight className="h-8 w-8 rotate-45" />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Neural Attribution Index */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4"
        >
          <Card className="h-full border-white/5 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.1)] relative group ring-1 ring-white/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50" />
            <CardHeader className="p-10 lg:p-12">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 flex items-center gap-4 italic">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                AI Attribution Index
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 pt-0 space-y-12">
              <div className="aspect-square rounded-[3.5rem] bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-transparent border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group/attribution shadow-2xl ring-1 ring-white/5">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05]" />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="text-8xl font-black italic text-white tracking-tighter relative z-10 group-hover/attribution:scale-110 transition-transform duration-1000 leading-none"
                >
                  {data.aiAttribution}
                  <span className="text-3xl not-italic ml-1 opacity-50">%</span>
                </motion.div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400/60 mt-6 relative z-10 italic">Neural_Influence_Factor</p>
              </div>
              <div className="space-y-8">
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 shadow-inner ring-1 ring-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Core Contribution</p>
                    <span className="text-sm font-black text-white italic tracking-tight">฿{(data.aiDrivenRevenue / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${data.aiAttribution}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                    />
                  </div>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                  <p className="text-[10px] text-slate-600 leading-relaxed italic text-center uppercase tracking-[0.2em] font-medium">
                    This index represents revenue generated from leads who interacted with AI skin analysis within 7 days of booking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
