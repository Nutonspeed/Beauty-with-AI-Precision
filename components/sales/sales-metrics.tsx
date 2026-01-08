"use client"

import { useCallback, useEffect, useState } from "react"
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import { Users, DollarSign, Target, TrendingUp, CheckCircle, Clock3, BarChart, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface SalesMetrics {
  callsMade: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  leadsContacted: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  proposalsSent: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  conversionRate: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  revenueGenerated: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  avgResponseMinutes: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  winRateOverall: {
    today: number
    yesterday: number
    change: number
    target: number
  }
}

export function SalesMetrics() {
  const t = useTranslations()
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(
    async ({ mode = "refresh" }: { mode?: "initial" | "refresh" } = {}) => {
      try {
        setError(null)
        if (mode === "initial") {
          setIsLoading(true)
        } else {
          setIsRefreshing(true)
        }

        const response = await fetch("/api/sales/metrics")
        if (!response.ok) throw new Error(t('dashboard.salesMetrics.fetchError'))
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        console.error("[sales-metrics] fetch failed", err)
        setError(err instanceof Error ? err.message : t('dashboard.salesMetrics.unknownError'))
      } finally {
        if (mode === "initial") {
          setIsLoading(false)
        }
        setIsRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchMetrics({ mode: "initial" })
    const interval = setInterval(() => fetchMetrics(), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return t('dashboard.salesMetrics.mins', { count: minutes.toFixed(0) })
    const hours = minutes / 60
    return t('dashboard.salesMetrics.hours', { count: hours.toFixed(1) })
  }

  const handleRetry = () => fetchMetrics({ mode: "initial" })
  const handleManualRefresh = () => fetchMetrics()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        {[...Array(7)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <RefreshCw className="h-5 w-5 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">{t('dashboard.salesMetrics.loadError')}</p>
          <p className="text-xs text-destructive/80">{error ?? t('dashboard.salesMetrics.unknownError')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> {t('dashboard.salesMetrics.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
        {isRefreshing ? (
          <span className="flex items-center gap-2 text-primary">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {t('dashboard.salesMetrics.refreshing')}
          </span>
        ) : (
          <span>{t('dashboard.salesMetrics.autoUpdate')}</span>
        )}
        <Button variant="outline" size="sm" className="gap-2" onClick={handleManualRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> {t('dashboard.salesMetrics.manualRefresh')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
      {/* Hot Leads */}
      <StatCard
        title={t('dashboard.sales.actions.hotLeads')}
        value={metrics.callsMade.today}
        icon={Target}
        trend={{
          value: 0, // Hot leads don't show trend, just target progress
          label: t('dashboard.topTreatments.ofTarget', { percent: Math.round((metrics.callsMade.today / metrics.callsMade.target) * 100) })
        }}
        iconColor="text-red-600"
        iconBackground="bg-red-50"
      />

      {/* Leads Contacted */}
      <StatCard
        title={t('dashboard.sales.actions.messages')}
        value={metrics.leadsContacted.today}
        icon={Users}
        trend={{
          value: metrics.leadsContacted.change,
          label: t('dashboard.performanceCards.vsYesterday')
        }}
        iconColor="text-blue-600"
        iconBackground="bg-blue-50"
      />

      {/* Qualified Leads */}
      <StatCard
        title={t('salesLeads.status.qualified')}
        value={metrics.proposalsSent.today}
        icon={CheckCircle}
        trend={{
          value: metrics.proposalsSent.change,
          label: t('dashboard.performanceCards.vsYesterday')
        }}
        iconColor="text-purple-600"
        iconBackground="bg-purple-50"
      />

      {/* Conversion Rate */}
      <StatCard
        title={t('dashboard.sales.stats.conversionRate')}
        value={`${metrics.conversionRate.today.toFixed(1)}%`}
        icon={TrendingUp}
        trend={{
          value: metrics.conversionRate.change,
          label: t('dashboard.performanceCards.vsYesterday')
        }}
        iconColor="text-green-600"
        iconBackground="bg-green-50"
      />

      {/* Potential Revenue */}
      <StatCard
        title={t('salesDashboard.metrics.revenue')}
        value={formatCurrency(metrics.revenueGenerated.today)}
        icon={DollarSign}
        trend={{
          value: metrics.revenueGenerated.change,
          label: t('dashboard.livePipeline.potential')
        }}
        iconColor="text-amber-600"
        iconBackground="bg-amber-50"
      />

      {/* Avg Response Time */}
      <StatCard
        title={t('dashboard.sales.stats.respondWithin')}
        value={formatMinutes(metrics.avgResponseMinutes.today)}
        icon={Clock3}
        trend={{
          value: metrics.avgResponseMinutes.change,
          label: `${t('dashboard.revenueChart.target')} ${formatMinutes(metrics.avgResponseMinutes.target)}`,
        }}
        iconColor="text-indigo-600"
        iconBackground="bg-indigo-50"
      />

      {/* Win Rate (Overall) */}
      <StatCard
        title={t('salesLeads.stats.won')}
        value={`${metrics.winRateOverall.today.toFixed(1)}%`}
        icon={BarChart}
        trend={{
          value: metrics.winRateOverall.change,
          label: t('dashboard.livePipeline.averageDeal'),
        }}
        iconColor="text-teal-600"
        iconBackground="bg-teal-50"
      />
      </div>
    </div>
  )
}
