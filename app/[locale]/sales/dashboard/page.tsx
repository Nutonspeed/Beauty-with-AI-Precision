'use client'

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Award, Target, Sparkles, Heart, Eye, Flame, Scissors, Brain, MessageSquare, Camera, Wand2, BarChart3, CheckCircle2 } from 'lucide-react'
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
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header - Enterprise Style */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
              {t('salesDashboard.intelligenceBadge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white">{t('salesDashboard.title')} <span className="text-primary text-elevated">{t('salesDashboard.titleHighlight')}</span></h1>
            <p className="text-slate-400 font-light tracking-wide">{t('salesDashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(['1d', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                    range === r ? "bg-primary text-white shadow-glow-primary" : "text-slate-500 hover:text-slate-300"
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
                className="shadow-glow-primary"
              >
                <Target className="w-5 h-5 mr-2" />
                {t('salesDashboard.initializeScan')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: t('salesDashboard.metrics.acquisition'), val: totalScansThisMonth, sub: t('salesDashboard.metrics.today', { count: metrics?.leadsContacted.today ?? 0 }), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: t('salesDashboard.metrics.conversions'), val: metrics?.proposalsSent.today ?? 0, sub: t('salesDashboard.metrics.vsPrev', { percent: (metrics?.proposalsSent.change ?? 0).toFixed(1) }), icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: t('salesDashboard.metrics.retention'), val: `${(metrics?.conversionRate.today ?? 0).toFixed(1)}%`, sub: t('salesDashboard.metrics.delta', { percent: (metrics?.conversionRate.change ?? 0).toFixed(1) }), icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: t('salesDashboard.metrics.revenue'), val: t('format.currency', { amount: `${(revenueThisMonth / 1000).toFixed(0)}K` }), sub: `+${t('format.currency', { amount: (metrics?.revenueGenerated.today ?? 0).toLocaleString() })}`, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" }
          ].map((m, i) => (
            <Card key={i} className="glass-panel border-white/5 hover:border-white/10 transition-all group overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <m.icon className="w-12 h-12" />
                </div>
                <div className="space-y-3 relative z-10">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">{m.label}</p>
                  <div className="text-3xl font-bold text-white tracking-tight">{m.val}</div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", m.bg, m.color)}>{m.sub}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Conversion Pipeline - High-tech visual */}
        <Card className="glass-panel border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              {t('salesDashboard.pipeline.title')}
            </CardTitle>
            <Badge variant="premium" className="text-[9px]">{t('salesDashboard.pipeline.badge')}</Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: t('salesDashboard.pipeline.acquisition'), val: aiLeadsToday, desc: t('salesDashboard.pipeline.acquisitionDesc'), icon: Camera, color: "text-purple-500 to-indigo-600" },
                { label: t('salesDashboard.pipeline.proposals'), val: aiProposalsToday, desc: t('salesDashboard.pipeline.proposalsDesc'), icon: Brain, color: "text-blue-500 to-cyan-600" },
                { label: t('salesDashboard.pipeline.bookings'), val: aiBookingsToday, desc: t('salesDashboard.pipeline.bookingsDesc'), icon: CheckCircle2, color: "text-emerald-500 to-teal-600" }
              ].map((s, i) => (
                <div key={i} className="relative group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className={cn("absolute -top-3 -left-3 h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", s.color)}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{s.label}</p>
                    <p className="text-4xl font-black text-white">{s.val}</p>
                    <p className="text-xs text-slate-400 font-light mt-2">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Section */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main AI Toolset */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                <Wand2 className="w-6 h-6 text-primary" />
                {t('salesDashboard.toolset.title')}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('salesDashboard.toolset.optimization')}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Camera, title: t('salesDashboard.toolset.precisionScan'), desc: t('salesDashboard.toolset.precisionScanDesc'), href: '/sales/quick-scan', color: "text-blue-400" },
                { icon: TrendingUp, title: t('salesDashboard.toolset.futureForecast'), desc: t('salesDashboard.toolset.futureForecastDesc'), href: "/analysis/future", color: "text-emerald-400" },
                { icon: Wand2, title: t('salesDashboard.toolset.arSimulation'), desc: t('salesDashboard.toolset.arSimulationDesc'), href: "/ar-simulator", color: "text-purple-400" },
                { icon: BarChart3, title: t('salesDashboard.toolset.presentation'), desc: t('salesDashboard.toolset.presentationDesc'), href: '/sales/presentations', color: "text-amber-400" }
              ].map((tool, i) => (
                <Link key={i} href={lp(tool.href)}>
                  <Card className="glass-panel border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group text-center h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <tool.icon className={cn("w-7 h-7", tool.color)} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{tool.title}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{tool.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Specialized AR Tools */}
            <Card className="glass-panel border-white/5 overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">{t('salesDashboard.arModules.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Heart, label: t('salesDashboard.arModules.filler'), bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/20", color: "text-pink-400" },
                    { icon: Flame, label: t('salesDashboard.arModules.body'), bg: "from-orange-500/20 to-red-500/20", border: "border-orange-500/20", color: "text-orange-400" },
                    { icon: Scissors, label: t('salesDashboard.arModules.hair'), bg: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20", color: "text-emerald-400" },
                    { icon: Eye, label: t('salesDashboard.arModules.eye'), bg: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/20", color: "text-blue-400" }
                  ].map((art, i) => (
                    <Link key={i} href={lp('/sales/ar-tools')} className="block">
                      <div className={cn("p-6 rounded-2xl border transition-all hover:scale-[1.03] active:scale-95 text-center flex flex-col items-center justify-center gap-3 bg-gradient-to-br", art.bg, art.border)}>
                        <art.icon className={cn("w-8 h-8", art.color)} />
                        <p className="text-xs font-bold text-slate-200">{art.label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Secondary Insights */}
          <div className="lg:col-span-4 space-y-8">
            {/* Remote Consult Card */}
            <Card className="glass-panel border-emerald-500/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
                <MessageSquare className="w-24 h-24 text-emerald-500" />
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('salesDashboard.remoteConsult.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative z-10 space-y-6">
                <div className="space-y-1">
                  <p className="text-5xl font-black text-white">{remoteConsultRequestsToday}</p>
                  <p className="text-xs text-slate-400 font-light">{t('salesDashboard.remoteConsult.requests')}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">{t('salesDashboard.remoteConsult.efficiency')}</span>
                    <span className="text-sm font-bold text-white">{(metrics?.remoteConsultConversion.today ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${metrics?.remoteConsultConversion.today ?? 0}%` }} />
                  </div>
                </div>
                <Button variant="outline" className="w-full glass text-xs tracking-widest font-bold uppercase">
                  {t('salesDashboard.remoteConsult.manageQueue')}
                </Button>
              </CardContent>
            </Card>

            {/* Performance Snapshot */}
            <Card className="glass-panel border-white/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">{t('salesDashboard.snapshot.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {[
                  { label: t('salesDashboard.snapshot.today'), scans: metrics?.leadsContacted.today, rev: metrics?.revenueGenerated.today },
                  { label: t('salesDashboard.snapshot.weekly'), scans: metrics?.leadsContacted.yesterday, rev: metrics?.revenueGenerated.yesterday },
                  { label: t('salesDashboard.snapshot.monthly'), scans: metrics?.leadsContacted.target, rev: metrics?.revenueGenerated.target }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">{p.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{p.scans} {t('salesDashboard.snapshot.cycles')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{t('format.currency', { amount: p.rev?.toLocaleString() || '0' })}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">{t('salesDashboard.snapshot.volume')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Assets */}
        <Card className="glass-panel border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">{t('salesDashboard.topAssets.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {(overview?.topPackages || []).map((pkg: TopPackage, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="text-lg font-black">#{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{pkg.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{pkg.sold} {t('salesDashboard.topAssets.units')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{t('format.currency', { amount: pkg.revenue.toLocaleString() })}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{t('salesDashboard.topAssets.gross')}</p>
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
