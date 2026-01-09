'use client'

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Target, Sparkles, Heart, Eye, Flame, Scissors, Brain, MessageSquare, Camera, Wand2, BarChart3, Activity, Crosshair, Microscope, Fingerprint } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShimmerSkeleton } from '@/components/ui/modern-loader'
import Link from 'next/link'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface MetricBlock {
  today: number
  yesterday: number
  change: number
  target: number
}

interface SalesMetricsResponse {
  callsMade: MetricBlock
  leadsContacted: MetricBlock
  proposalsSent: MetricBlock
  conversionRate: MetricBlock
  revenueGenerated: MetricBlock
  aiLeads: MetricBlock
  aiProposals: MetricBlock
  aiBookings: MetricBlock
  aiBookingRevenue: MetricBlock
  remoteConsultRequests: MetricBlock
  remoteConsultConversion: MetricBlock
}

interface PeriodStats {
  scans: number
  revenue: number
}

interface TopPackage {
  name: string
  sold: number
  revenue: number
}

interface SalesOverviewResponse {
  today: PeriodStats
  thisWeek: PeriodStats
  thisMonth: PeriodStats
  topPackages: TopPackage[]
}

interface FunnelStage {
  name: string
  count: number
  value: number
}

interface ConversionRates {
  leadsToQualified: number
  qualifiedToProposals: number
  proposalsToWon: number
}

interface SalesFunnelResponse {
  range: string
  stages: FunnelStage[]
  conversionRates: ConversionRates
}

export default function SalesDashboard() {
  const t = useTranslations()
  const router = useRouter()
  const lp = useLocalizePath()
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState<SalesMetricsResponse | null>(null)
  const [overview, setOverview] = useState<SalesOverviewResponse | null>(null)
  const [funnel, setFunnel] = useState<SalesFunnelResponse | null>(null)
  const [range, setRange] = useState<'1d' | '7d' | '30d'>('7d')

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        // Role/auth guard via API
        const roleRes = await fetch('/api/auth/check-role', { headers: { Accept: 'application/json' } })
        if (!roleRes.ok) {
          router.push(lp('/auth/login'))
          return
        }
        const roleData = await roleRes.json()
        if (!['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin'].includes(roleData.role)) {
          router.push(lp('/unauthorized'))
          return
        }
        if (cancelled) return
        setIsCheckingRole(false)

        const qs = `?range=${range}`
        const [metricsRes, overviewRes, funnelRes] = await Promise.all([
          fetch(`/api/sales/metrics${qs}`, { method: 'GET', headers: { Accept: 'application/json' } }),
          fetch(`/api/sales/overview${qs}`, { method: 'GET', headers: { Accept: 'application/json' } }),
          fetch(`/api/sales/funnel${qs}`, { method: 'GET', headers: { Accept: 'application/json' } }),
        ])

        if (!metricsRes.ok) {
          throw new Error(`Failed to load sales metrics: ${metricsRes.status}`)
        }
        if (!overviewRes.ok) {
          throw new Error(`Failed to load sales overview: ${overviewRes.status}`)
        }
        if (!funnelRes.ok) {
          throw new Error(`Failed to load sales funnel: ${funnelRes.status}`)
        }

        const metricsData: SalesMetricsResponse = await metricsRes.json()
        const overviewData: SalesOverviewResponse = await overviewRes.json()
        const funnelData: SalesFunnelResponse = await funnelRes.json()
        if (!cancelled) {
          setMetrics(metricsData)
          setOverview(overviewData)
          setFunnel(funnelData)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Sales Dashboard Error:', error)
        if (!cancelled) {
          setError('Failed to load dashboard')
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [router, range, lp])

  const totalScansThisMonth = metrics?.leadsContacted.today ?? 0
  const revenueThisMonth = metrics?.revenueGenerated.today ?? 0
  const aiLeadsToday = metrics?.aiLeads.today ?? 0
  const aiProposalsToday = metrics?.aiProposals.today ?? 0
  const aiBookingsToday = metrics?.aiBookings.today ?? 0
  const aiBookingRevenueToday = metrics?.aiBookingRevenue.today ?? 0
  const remoteConsultRequestsToday = metrics?.remoteConsultRequests.today ?? 0

  if (isCheckingRole || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <ShimmerSkeleton className="h-8 w-48" />
              <ShimmerSkeleton className="h-4 w-32" />
            </div>
            <ShimmerSkeleton className="h-10 w-32 rounded-lg" />
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4">
                  <ShimmerSkeleton className="h-4 w-20 mb-4" />
                  <ShimmerSkeleton className="h-8 w-16 mb-2" />
                  <ShimmerSkeleton className="h-3 w-24" />
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            <ShimmerSkeleton className="h-64 rounded-xl" />
            <ShimmerSkeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600">{t('common.error')}: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {t('common.reset')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 relative overflow-hidden selection:bg-pink-500/30">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header - Elite Clinical Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-8 pb-10 border-b border-white/5"
        >
          <div className="space-y-3">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black">
              <Activity className="mr-2 h-3 w-3 animate-pulse" />
              {t('salesDashboard.intelligenceBadge')}
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
              {t('salesDashboard.title')} <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent italic">{t('salesDashboard.titleHighlight')}</span>
            </h1>
            <p className="text-slate-500 font-light tracking-wide text-lg max-w-xl">{t('salesDashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
              {(['1d', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500",
                    range === r 
                      ? "bg-white text-[#020617] shadow-2xl scale-105" 
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <Link href={lp('/sales/quick-scan')}>
              <Button 
                variant="premium"
                size="lg"
                className="h-14 px-8 rounded-2xl shadow-2xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Crosshair className="w-5 h-5 mr-3" />
                {t('salesDashboard.initializeScan')}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Executive Summary Metrics - Precision Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: t('salesDashboard.metrics.acquisition'), val: totalScansThisMonth, sub: t('salesDashboard.metrics.today', { count: metrics?.leadsContacted.today ?? 0 }), icon: Users, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
            { label: t('salesDashboard.metrics.conversions'), val: metrics?.proposalsSent.today ?? 0, sub: t('salesDashboard.metrics.vsPrev', { percent: (metrics?.proposalsSent.change ?? 0).toFixed(1) }), icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            { label: t('salesDashboard.metrics.retention'), val: `${(metrics?.conversionRate.today ?? 0).toFixed(1)}%`, sub: t('salesDashboard.metrics.delta', { percent: (metrics?.conversionRate.change ?? 0).toFixed(1) }), icon: Brain, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
            { label: t('salesDashboard.metrics.revenue'), val: t('format.currency', { amount: `${(revenueThisMonth / 1000).toFixed(0)}K` }), sub: `+${t('format.currency', { amount: (metrics?.revenueGenerated.today ?? 0).toLocaleString() })}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl hover:bg-white/[0.03] hover:border-white/10 transition-all group overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-8 relative">
                  <div className={cn("absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity", m.color)}>
                    <m.icon className="w-16 h-16" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">{m.label}</p>
                    <div className="text-4xl font-bold text-white tracking-tighter">{m.val}</div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border", m.bg, m.color, m.border)}>{m.sub}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Conversion Pipeline - Clinical Data Stream */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Card className="relative overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            <CardHeader className="bg-white/[0.02] border-b border-white/5 px-10 py-8 flex flex-row items-center justify-between">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-white">
                <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                </div>
                {t('salesDashboard.pipeline.title')}
              </CardTitle>
              <Badge className="bg-pink-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase">
                {t('salesDashboard.pipeline.badge')}
              </Badge>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { label: t('salesDashboard.pipeline.acquisition'), val: aiLeadsToday, desc: t('salesDashboard.pipeline.acquisitionDesc'), icon: Microscope, color: "from-pink-500/20 to-purple-600/20", iconColor: "text-pink-400" },
                  { label: t('salesDashboard.pipeline.proposals'), val: aiProposalsToday, desc: t('salesDashboard.pipeline.proposalsDesc'), icon: Brain, color: "from-blue-500/20 to-cyan-600/20", iconColor: "text-blue-400" },
                  { label: t('salesDashboard.pipeline.bookings'), val: aiBookingsToday, desc: t('salesDashboard.pipeline.bookingsDesc'), icon: Fingerprint, color: "from-emerald-500/20 to-teal-600/20", iconColor: "text-emerald-400" }
                ].map((s, i) => (
                  <div key={i} className="relative group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-center md:text-left">
                    <div className={cn("inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br border border-white/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 mb-6 mx-auto md:mx-0", s.color)}>
                      <s.icon className={cn("w-7 h-7", s.iconColor)} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.25em]">{s.label}</p>
                      <p className="text-5xl font-bold text-white tracking-tighter">{s.val}</p>
                      <p className="text-[13px] text-slate-400 font-light mt-4 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Strategic Infrastructure Grid */}
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main AI Toolset */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-4 italic">
                <Wand2 className="w-7 h-7 text-pink-500" />
                {t('salesDashboard.toolset.title')}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/30 via-transparent to-transparent mx-8 hidden sm:block" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-black whitespace-nowrap">{t('salesDashboard.toolset.optimization')}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Camera, title: t('salesDashboard.toolset.precisionScan'), desc: t('salesDashboard.toolset.precisionScanDesc'), href: '/sales/quick-scan', color: "text-blue-400", bg: "bg-blue-500/10" },
                { icon: TrendingUp, title: t('salesDashboard.toolset.futureForecast'), desc: t('salesDashboard.toolset.futureForecastDesc'), href: "/analysis/future", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { icon: Wand2, title: t('salesDashboard.toolset.arSimulation'), desc: t('salesDashboard.toolset.arSimulationDesc'), href: "/ar-simulator", color: "text-pink-400", bg: "bg-pink-500/10" },
                { icon: BarChart3, title: t('salesDashboard.toolset.presentation'), desc: t('salesDashboard.toolset.presentationDesc'), href: '/sales/presentations', color: "text-purple-400", bg: "bg-purple-500/10" }
              ].map((tool, i) => (
                <Link key={i} href={lp(tool.href)}>
                  <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-2xl hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group text-center rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8 space-y-6">
                      <div className={cn("mx-auto h-16 w-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-inner", tool.bg)}>
                        <tool.icon className={cn("w-8 h-8", tool.color)} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-white tracking-tight group-hover:text-pink-400 transition-colors">{tool.title}</h4>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-relaxed">{tool.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Specialized Clinical AR Modules */}
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
              <CardHeader className="bg-white/[0.03] border-b border-white/5 px-10 py-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('salesDashboard.arModules.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Heart, label: t('salesDashboard.arModules.filler'), bg: "from-pink-500/10 to-rose-500/10", border: "border-pink-500/20", color: "text-pink-400" },
                    { icon: Flame, label: t('salesDashboard.arModules.body'), bg: "from-orange-500/10 to-red-500/10", border: "border-orange-500/20", color: "text-orange-400" },
                    { icon: Scissors, label: t('salesDashboard.arModules.hair'), bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20", color: "text-emerald-400" },
                    { icon: Eye, label: t('salesDashboard.arModules.eye'), bg: "from-blue-500/10 to-indigo-500/10", border: "border-blue-500/20", color: "text-blue-400" }
                  ].map((art, i) => (
                    <Link key={i} href={lp('/sales/ar-tools')} className="block">
                      <div className={cn("p-8 rounded-[2rem] border-2 transition-all hover:scale-[1.05] active:scale-95 text-center flex flex-col items-center justify-center gap-4 bg-gradient-to-br shadow-xl group", art.bg, art.border)}>
                        <art.icon className={cn("w-10 h-10 transition-transform duration-500 group-hover:rotate-12", art.color)} />
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">{art.label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Secondary Precision Insights */}
          <div className="lg:col-span-4 space-y-10">
            {/* Remote Consult Card */}
            <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/[0.02] backdrop-blur-3xl rounded-[3rem] group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                <MessageSquare className="w-32 h-32 text-emerald-500" />
              </div>
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('salesDashboard.remoteConsult.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0 relative z-10 space-y-10">
                <div className="space-y-2">
                  <p className="text-7xl font-bold text-white tracking-tighter">{remoteConsultRequestsToday}</p>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t('salesDashboard.remoteConsult.requests')}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] uppercase font-black text-emerald-500/80 tracking-widest">{t('salesDashboard.remoteConsult.efficiency')}</span>
                    <span className="text-xl font-bold text-white">{(metrics?.remoteConsultConversion.today ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metrics?.remoteConsultConversion.today ?? 0}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-xs tracking-[0.2em] font-black uppercase hover:bg-white/10">
                  {t('salesDashboard.remoteConsult.manageQueue')}
                </Button>
              </CardContent>
            </Card>

            {/* Performance Snapshot Portfolio */}
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-6 border-b border-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('salesDashboard.snapshot.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {[
                  { label: t('salesDashboard.snapshot.today'), scans: metrics?.leadsContacted.today, rev: metrics?.revenueGenerated.today, color: "text-pink-500" },
                  { label: t('salesDashboard.snapshot.weekly'), scans: metrics?.leadsContacted.yesterday, rev: metrics?.revenueGenerated.yesterday, color: "text-slate-400" },
                  { label: t('salesDashboard.snapshot.monthly'), scans: metrics?.leadsContacted.target, rev: metrics?.revenueGenerated.target, color: "text-slate-400" }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="space-y-2">
                      <p className={cn("text-xs font-black uppercase tracking-widest transition-colors", p.color)}>{p.label}</p>
                      <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">{p.scans} {t('salesDashboard.snapshot.cycles')}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xl font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors">฿{p.rev?.toLocaleString() || '0'}</p>
                      <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em]">{t('salesDashboard.snapshot.volume')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Clinical Service Assets */}
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-white/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('salesDashboard.topAssets.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(overview?.topPackages || []).map((pkg: TopPackage, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-pink-500/20 transition-all group shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:bg-pink-600 group-hover:text-white transition-all duration-500 shadow-inner">
                      <span className="text-2xl font-black italic">#{idx + 1}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-lg tracking-tight group-hover:text-pink-400 transition-colors">{pkg.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic">{pkg.sold} {t('salesDashboard.topAssets.units')}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xl font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors">฿{pkg.revenue.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em]">{t('salesDashboard.topAssets.gross')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
