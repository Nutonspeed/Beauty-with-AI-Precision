'use client'

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Sparkles, Heart, Eye, Flame, Scissors, Brain, MessageSquare, Camera, Wand2, BarChart3, Activity, Crosshair, Microscope, Fingerprint } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShimmerSkeleton } from '@/components/ui/modern-loader'
import Link from 'next/link'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth/context'

export const dynamic = 'force-dynamic'

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

import { LeadPrioritization } from '@/components/sales/lead-prioritization'
import { SalesVelocity } from '@/components/sales/sales-velocity'
import { GenMarketingVisuals } from '@/components/sales/gen-marketing-visuals'
import { PredictiveReengagement } from '@/components/sales/predictive-reengagement'
import { IntelligenceCommandPalette } from '@/components/analytics/intelligence-command-palette'
import { SalesQuotaDashboard } from '@/components/sales/SalesQuotaDashboard'
import { CreateScanLink } from '@/components/sales/CreateScanLink'
import { QuotaAlertBanner } from '@/components/sales/QuotaAlertBanner'

export default function SalesDashboard() {
  const t = useTranslations('salesDashboard')
  const { user } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState<SalesMetricsResponse | null>(null)
  const [overview, setOverview] = useState<SalesOverviewResponse | null>(null)
  const [funnel, setFunnel] = useState<SalesFunnelResponse | null>(null)
  const [range, setRange] = useState<'1d' | '7d' | '30d'>('7d')
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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
        if (!['sales_staff', 'center_admin', 'center_owner', 'super_admin'].includes(roleData.role)) {
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
      <div className="min-h-screen bg-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-end pb-10 border-b border-slate-100">
            <div className="space-y-4">
              <ShimmerSkeleton className="h-10 w-64 rounded-full" />
              <ShimmerSkeleton className="h-16 w-96 rounded-2xl" />
              <ShimmerSkeleton className="h-6 w-80 rounded-xl" />
            </div>
            <div className="flex gap-4">
              <ShimmerSkeleton className="h-14 w-40 rounded-2xl" />
              <ShimmerSkeleton className="h-14 w-48 rounded-2xl" />
            </div>
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-10 rounded-[2.5rem] border-slate-100 bg-white shadow-premium">
                  <ShimmerSkeleton className="h-4 w-24 mb-6 rounded-full" />
                  <ShimmerSkeleton className="h-12 w-32 mb-4 rounded-xl" />
                  <ShimmerSkeleton className="h-4 w-40 rounded-lg" />
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid md:grid-cols-2 gap-10">
            <ShimmerSkeleton className="h-[500px] rounded-[3rem]" />
            <ShimmerSkeleton className="h-[500px] rounded-[3rem]" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-8">
          <div className="h-24 w-24 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto shadow-sm">
            <Activity className="h-12 w-12 text-rose-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">{t('common.error' as any)}</p>
            <p className="text-slate-500 font-light italic">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 uppercase font-black text-[10px] tracking-widest italic shadow-sm hover:bg-slate-50">
            {t('common.reset' as any)}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 md:p-8 relative overflow-hidden selection:bg-pink-500/10">
      <IntelligenceCommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={(id) => {
          console.log("Sales selected node:", id)
          // Implement specific navigation if needed
        }} 
      />
      {/* Infrastructure Background - Light Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <QuotaAlertBanner />
        
        {/* Header - Elite Aesthetic Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-10 pb-12 border-b border-slate-100"
        >
          <div className="space-y-4">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse">
              <Activity className="mr-3 h-3.5 w-3.5 animate-pulse" />
              {t('intelligenceBadge')}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
              {t('title')} <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-4 tracking-[0.2em] font-black">{t('titleHighlight')}</span>
            </h1>
            <p className="text-slate-500 font-light tracking-tight text-xl italic max-w-xl">{t('growthDesc')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
              {(['1d', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-700 italic",
                    range === r 
                      ? "bg-white text-slate-950 shadow-premium scale-105" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <CreateScanLink />
            <Link href={lp('/sales/quick-scan')}>
              <Button 
                variant="premium"
                size="lg"
                className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <Crosshair className="w-6 h-6 mr-4" />
                {t('initializeScan')}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Executive Summary Metrics - Precision Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 h-full">
            <div className="h-full rounded-[3rem] shadow-premium bg-white border border-slate-100 overflow-hidden">
              <SalesQuotaDashboard compact />
            </div>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: t('metrics.conversions'), val: metrics?.proposalsSent.today ?? 0, sub: t('metrics.vsPrev', { percent: (metrics?.proposalsSent.change ?? 0).toFixed(1) }), icon: Target, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
              { label: t('metrics.retention'), val: `${(metrics?.conversionRate.today ?? 0).toFixed(1)}%`, sub: t('metrics.delta', { percent: (metrics?.conversionRate.change ?? 0).toFixed(1) }), icon: Brain, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
              { label: t('metrics.revenue'), val: t('format.currency' as any, { amount: `${(revenueThisMonth / 1000).toFixed(0)}K` }), sub: `+${t('format.currency' as any, { amount: (metrics?.revenueGenerated.today ?? 0).toLocaleString() })}`, icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100" }
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-slate-100 bg-white shadow-premium hover:border-pink-500/20 transition-all duration-700 group overflow-hidden rounded-[3rem]">
                  <CardContent className="p-10 relative">
                    <div className={cn("absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 group-hover:scale-110", m.color)}>
                      <m.icon className="w-24 h-24" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{m.label}</p>
                      <div className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase">{m.val}</div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm italic", m.bg, m.color, m.border)}>{m.sub}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Conversion Pipeline - Aesthetic Data Stream */}
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="relative overflow-hidden border-slate-100 bg-white shadow-premium rounded-[3.5rem] h-full transition-all duration-700 hover:border-pink-500/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-12 py-10 flex flex-row items-center justify-between">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-6 text-slate-950 italic">
                    <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-100 shadow-sm">
                      <Sparkles className="w-5 h-5 text-pink-600 animate-pulse" />
                    </div>
                    {t('pipeline.analysis')}
                  </CardTitle>
                  <Badge className="bg-pink-500 text-white border-none px-6 py-2 text-[10px] font-black tracking-[0.2em] uppercase shadow-glow-pink/30 animate-pulse">
                    LIVE_NODES
                  </Badge>
                </CardHeader>
                <CardContent className="p-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                      { label: t('pipeline.acquisition'), val: aiLeadsToday, desc: t('pipeline.acquisitionDesc'), icon: Microscope, color: "from-pink-500/10 to-pink-600/10", iconColor: "text-pink-600" },
                      { label: t('pipeline.proposals'), val: aiProposalsToday, desc: t('pipeline.proposalsDesc'), icon: Brain, color: "from-blue-500/10 to-blue-600/10", iconColor: "text-blue-400" },
                      { label: t('pipeline.bookings'), val: aiBookingsToday, desc: t('pipeline.bookingsDesc'), icon: Fingerprint, color: "from-purple-500/10 to-purple-600/10", iconColor: "text-purple-600" }
                    ].map((s, i) => (
                      <div key={i} className="relative group p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-pink-500/20 transition-all duration-700 text-center md:text-left shadow-sm">
                        <div className={cn("inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br border border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-700 mb-8 mx-auto md:mx-0", s.color)}>
                          <s.icon className={cn("w-8 h-8", s.iconColor)} />
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] italic group-hover:text-slate-900 transition-colors">{s.label}</p>
                          <p className="text-6xl font-black text-slate-950 tracking-tighter italic uppercase">{s.val}</p>
                          <p className="text-[14px] text-slate-500 font-light mt-6 leading-relaxed italic">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <div className="lg:col-span-4 space-y-12">
            <div className="rounded-[3rem] shadow-premium bg-white border border-slate-100 overflow-hidden transition-all duration-700 hover:border-pink-500/20">
              <LeadPrioritization />
            </div>
            <div className="rounded-[3rem] shadow-premium bg-white border border-slate-100 overflow-hidden transition-all duration-700 hover:border-blue-500/20">
              <SalesVelocity />
            </div>
          </div>
        </div>

        {/* Strategic Infrastructure Grid */}
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main AI Toolset & Generative Marketing */}
          <div className="lg:col-span-8 space-y-12">
            <div className="rounded-[3.5rem] shadow-premium bg-white border border-slate-100 overflow-hidden transition-all duration-700 hover:border-pink-500/20">
              <GenMarketingVisuals isEnterprise={['super_admin', 'center_owner'].includes(user?.role || '')} />
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between px-6">
                <h3 className="text-3xl font-black tracking-tighter text-slate-950 flex items-center gap-6 italic uppercase">
                  <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-100">
                    <Wand2 className="w-8 h-8 text-pink-600" />
                  </div>
                  {t('toolset.title')}
                </h3>
                <div className="h-1.5 flex-1 bg-gradient-to-r from-pink-500/20 via-transparent to-transparent mx-10 hidden sm:block rounded-full" />
                <p className="text-[11px] uppercase tracking-[0.4em] text-pink-600 font-black whitespace-nowrap italic animate-pulse">{t('toolset.optimization')}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: Camera, title: t('toolset.precisionScan'), desc: t('toolset.precisionScanDesc'), href: '/sales/quick-scan', color: "text-blue-600", bg: "bg-blue-50" },
                  { icon: TrendingUp, title: t('toolset.futureForecast'), desc: t('toolset.futureForecastDesc'), href: "/analysis/future", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { icon: Wand2, title: t('toolset.arSimulation'), desc: t('toolset.arSimulationDesc'), href: "/ar-simulator", color: "text-pink-600", bg: "bg-pink-50" },
                  { icon: BarChart3, title: t('toolset.presentation'), desc: t('toolset.presentationDesc'), href: '/sales/presentations', color: "text-purple-600", bg: "bg-purple-50" }
                ].map((tool, i) => (
                  <Link key={i} href={lp(tool.href)}>
                    <Card className="h-full border-slate-100 bg-white shadow-premium hover:border-pink-500/20 transition-all duration-700 cursor-pointer group text-center rounded-[3rem] overflow-hidden relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-10 space-y-8">
                        <div className={cn("mx-auto h-20 w-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-700 border border-slate-100 shadow-sm", tool.bg)}>
                          <tool.icon className={cn("w-10 h-10", tool.color)} />
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-black text-base text-slate-950 tracking-tight group-hover:text-pink-600 transition-colors uppercase italic">{tool.title}</h4>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-relaxed italic">{tool.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Specialized Aesthetic AR Modules */}
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden transition-all duration-700 hover:border-blue-500/20 group">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-12 py-10 flex flex-row items-center justify-between">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{t('arModules.title')}</CardTitle>
                <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-30" />
              </CardHeader>
              <CardContent className="p-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { icon: Heart, label: t('arModules.filler'), bg: "from-pink-500/5 to-rose-500/5", border: "border-pink-100", color: "text-pink-600" },
                    { icon: Flame, label: t('arModules.body'), bg: "from-orange-500/5 to-red-500/5", border: "border-orange-100", color: "text-orange-600" },
                    { icon: Scissors, label: t('arModules.hair'), bg: "from-emerald-500/5 to-teal-500/5", border: "border-emerald-100", color: "text-emerald-600" },
                    { icon: Eye, label: t('arModules.eye'), bg: "from-blue-500/5 to-indigo-500/5", border: "border-blue-100", color: "text-blue-600" }
                  ].map((art, i) => (
                    <Link key={i} href={lp('/sales/ar-tools')} className="block group/ar">
                      <div className={cn("p-10 rounded-[2.5rem] border transition-all duration-700 hover:scale-[1.05] active:scale-95 text-center flex flex-col items-center justify-center gap-6 bg-gradient-to-br shadow-sm group-hover/ar:shadow-premium group-hover/ar:border-pink-500/20", art.bg, art.border)}>
                        <art.icon className={cn("w-12 h-12 transition-all duration-700 group-hover/ar:rotate-12 group-hover/ar:scale-110", art.color)} />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/ar:text-slate-900 transition-colors italic">{art.label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Secondary Precision Insights */}
          <div className="lg:col-span-4 space-y-12">
            <div className="rounded-[3rem] shadow-premium bg-white border border-slate-100 overflow-hidden transition-all duration-700 hover:border-pink-500/20">
              <PredictiveReengagement />
            </div>

            {/* Remote Protocol Card */}
            <Card className="relative overflow-hidden border-slate-100 bg-white shadow-premium rounded-[3.5rem] group transition-all duration-700 hover:border-emerald-500/20">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                <MessageSquare className="w-48 h-48 text-emerald-500" />
              </div>
              <CardHeader className="p-12 pb-6">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600 flex items-center gap-4 italic">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                  {t('remoteConsult.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12 pt-0 relative z-10 space-y-12">
                <div className="space-y-3 text-center md:text-left">
                  <p className="text-8xl font-black text-slate-950 tracking-tighter italic uppercase">{remoteConsultRequestsToday}</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{t('remoteConsult.requests')}</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6 shadow-inner">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.2em] italic">{t('remoteConsult.efficiency')}</span>
                    <span className="text-3xl font-black text-slate-950 italic">{(metrics?.remoteConsultConversion.today ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-sm">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metrics?.remoteConsultConversion.today ?? 0}%` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald/30" 
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full h-18 rounded-2xl border-slate-200 bg-white text-[10px] tracking-[0.3em] font-black uppercase hover:bg-slate-50 hover:border-pink-500/20 transition-all shadow-premium italic">
                  {t('remoteConsult.manageQueue')}
                </Button>
              </CardContent>
            </Card>

            {/* Performance Snapshot Portfolio */}
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden transition-all duration-700 hover:border-pink-500/20 group">
              <CardHeader className="p-10 pb-6 border-b border-slate-50">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{t('snapshot.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-12">
                {[
                  { label: t('snapshot.today'), scans: metrics?.leadsContacted.today, rev: metrics?.revenueGenerated.today, color: "text-pink-600" },
                  { label: t('snapshot.weekly'), scans: metrics?.leadsContacted.yesterday, rev: metrics?.revenueGenerated.yesterday, color: "text-slate-400" },
                  { label: t('snapshot.monthly'), scans: metrics?.leadsContacted.target, rev: metrics?.revenueGenerated.target, color: "text-slate-400" }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between group/row cursor-default">
                    <div className="space-y-2">
                      <p className={cn("text-[11px] font-black uppercase tracking-[0.2em] transition-all group-hover/row:translate-x-2", p.color)}>{p.label}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter italic">{p.scans} {t('snapshot.cycles')}</p>
                    </div>
                    <div className="text-right space-y-1.5">
                      <p className="text-2xl font-black text-slate-950 tracking-tighter group-hover/row:text-pink-600 transition-colors italic uppercase">฿{p.rev?.toLocaleString() || '0'}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] italic">{t('snapshot.volume')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Aesthetic Service Assets */}
        <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden transition-all duration-700 hover:border-pink-500/20 group">
          <CardHeader className="bg-slate-50/50 border-b border-slate-50 px-12 py-10">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{t('topAssets.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {(overview?.topPackages || []).map((pkg: TopPackage, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 hover:bg-white hover:border-pink-500/20 transition-all duration-700 group/pkg shadow-sm hover:shadow-premium">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-white flex items-center justify-center border border-slate-100 group-hover/pkg:bg-pink-500 group-hover/pkg:text-white transition-all duration-700 shadow-sm">
                      <span className="text-3xl font-black italic">#{idx + 1}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-950 text-xl tracking-tighter italic uppercase group-hover/pkg:text-pink-600 transition-colors">{pkg.name}</h4>
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-black italic">{pkg.sold} {t('topAssets.units')}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <p className="text-2xl font-black text-slate-950 tracking-tighter group-hover/pkg:text-pink-600 transition-colors italic uppercase">฿{pkg.revenue.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] italic">{t('topAssets.gross')}</p>
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
