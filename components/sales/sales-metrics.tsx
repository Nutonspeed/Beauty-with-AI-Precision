"use client"

import { useCallback, useEffect, useState } from "react"
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import { Users, DollarSign, Target, TrendingUp, CheckCircle, Clock3, BarChart, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลสถิติได้")
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        console.error("[sales-metrics] fetch failed", err)
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ")
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
    if (minutes < 60) return `${minutes.toFixed(0)} นาที`
    const hours = minutes / 60
    return `${hours.toFixed(1)} ชม.`
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
          <p className="text-sm font-medium text-destructive">ไม่สามารถโหลดสถิติการขายได้</p>
          <p className="text-xs text-destructive/80">{error ?? "โปรดลองใหม่อีกครั้งในภายหลัง"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> ลองอีกครั้ง
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
        {isRefreshing ? (
          <span className="flex items-center gap-2 text-primary">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> กำลังรีเฟรช...
          </span>
        ) : (
          <span>อัปเดตอัตโนมัติทุก 5 นาที</span>
        )}
        <Button variant="outline" size="sm" className="gap-2" onClick={handleManualRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> รีเฟรช
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
      {/* Hot Leads */}
      <StatCard
        title="Hot Leads"
        value={metrics.callsMade.today}
        icon={Target}
        trend={{
          value: 0, // Hot leads don't show trend, just target progress
          label: `${Math.round((metrics.callsMade.today / metrics.callsMade.target) * 100)}% of target`
        }}
        iconColor="text-red-600"
        iconBackground="bg-red-50"
      />

      {/* Leads Contacted */}
      <StatCard
        title="Leads Contacted"
        value={metrics.leadsContacted.today}
        icon={Users}
        trend={{
          value: metrics.leadsContacted.change,
          label: "vs yesterday"
        }}
        iconColor="text-blue-600"
        iconBackground="bg-blue-50"
      />

      {/* Qualified Leads */}
      <StatCard
        title="Qualified Leads"
        value={metrics.proposalsSent.today}
        icon={CheckCircle}
        trend={{
          value: metrics.proposalsSent.change,
          label: "vs yesterday"
        }}
        iconColor="text-purple-600"
        iconBackground="bg-purple-50"
      />

      {/* Conversion Rate */}
      <StatCard
        title="Conversion Rate"
        value={`${metrics.conversionRate.today.toFixed(1)}%`}
        icon={TrendingUp}
        trend={{
          value: metrics.conversionRate.change,
          label: "vs yesterday"
        }}
        iconColor="text-green-600"
        iconBackground="bg-green-50"
      />

      {/* Potential Revenue */}
      <StatCard
        title="Potential Revenue"
        value={formatCurrency(metrics.revenueGenerated.today)}
        icon={DollarSign}
        trend={{
          value: metrics.revenueGenerated.change,
          label: "from qualified leads"
        }}
        iconColor="text-amber-600"
        iconBackground="bg-amber-50"
      />

      {/* Avg Response Time */}
      <StatCard
        title="Avg Response Time"
        value={formatMinutes(metrics.avgResponseMinutes.today)}
        icon={Clock3}
        trend={{
          value: metrics.avgResponseMinutes.change,
          label: `target ${formatMinutes(metrics.avgResponseMinutes.target)}`,
        }}
        iconColor="text-indigo-600"
        iconBackground="bg-indigo-50"
      />

      {/* Win Rate (Overall) */}
      <StatCard
        title="Win Rate (Overall)"
        value={`${metrics.winRateOverall.today.toFixed(1)}%`}
        icon={BarChart}
        trend={{
          value: metrics.winRateOverall.change,
          label: "converted / total leads",
        }}
        iconColor="text-teal-600"
        iconBackground="bg-teal-50"
      />
      </div>
    </div>
  )
}
