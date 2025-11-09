"use client"

import { useEffect, useState } from "react"
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import { Users, DollarSign, Calendar, Target } from "lucide-react"

interface PerformanceData {
  revenue: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  customers: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  bookings: {
    today: number
    yesterday: number
    change: number
    target: number
  }
  conversion: {
    today: number
    yesterday: number
    change: number
    target: number
  }
}

export function PerformanceCards() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        console.log('[PerformanceCards] Fetching metrics...')
        const response = await fetch("/api/clinic/dashboard/metrics")
        console.log('[PerformanceCards] Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[PerformanceCards] Error response:', errorText)
          throw new Error(`Failed to fetch metrics: ${response.status} - ${errorText}`)
        }
        const metrics = await response.json()
        console.log('[PerformanceCards] Metrics loaded:', metrics)
        setData(metrics)
      } catch (err) {
        console.error("[PerformanceCards] Error fetching metrics:", err)
        setError(err instanceof Error ? err.message : "Failed to load metrics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
    // Refresh every 5 minutes
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">Failed to load performance metrics. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Revenue Card */}
      <StatCard
        title="Today's Revenue"
        value={formatCurrency(data.revenue.today)}
        icon={DollarSign}
        trend={{
          value: data.revenue.change,
          label: "vs yesterday"
        }}
        iconColor="text-green-600"
        iconBackground="bg-green-50"
      />

      {/* Customers Card */}
      <StatCard
        title="New Customers"
        value={data.customers.today}
        icon={Users}
        trend={{
          value: data.customers.change,
          label: "vs yesterday"
        }}
        iconColor="text-blue-600"
        iconBackground="bg-blue-50"
      />

      {/* Bookings Card */}
      <StatCard
        title="Bookings Today"
        value={data.bookings.today}
        icon={Calendar}
        trend={{
          value: data.bookings.change,
          label: "vs yesterday"
        }}
        iconColor="text-purple-600"
        iconBackground="bg-purple-50"
      />

      {/* Conversion Rate Card */}
      <StatCard
        title="Conversion Rate"
        value={`${data.conversion.today}%`}
        icon={Target}
        trend={{
          value: data.conversion.change,
          label: "vs yesterday"
        }}
        iconColor="text-orange-600"
        iconBackground="bg-orange-50"
      />
    </div>
  )
}
