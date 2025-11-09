"use client"

import { useEffect, useState } from "react"
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import { Users, DollarSign, Target, TrendingUp, CheckCircle } from "lucide-react"

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
}

export function SalesMetrics() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/sales/metrics")
        if (!response.ok) throw new Error("Failed to fetch metrics")
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        console.error("[v0] Error fetching sales metrics:", err)
        setError(err instanceof Error ? err.message : "Failed to load metrics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">Failed to load sales metrics. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
    </div>
  )
}
