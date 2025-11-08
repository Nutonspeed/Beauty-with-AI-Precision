"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600"
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
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
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.revenue.today)}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(data.revenue.change)}`}>
              {getChangeIcon(data.revenue.change)}
              <span className="ml-1">{Math.abs(data.revenue.change)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Target: {formatCurrency(data.revenue.target)}</span>
              <span>{Math.round((data.revenue.today / data.revenue.target) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((data.revenue.today / data.revenue.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.customers.today}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(data.customers.change)}`}>
              {getChangeIcon(data.customers.change)}
              <span className="ml-1">{Math.abs(data.customers.change)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Target: {data.customers.target}</span>
              <span>{Math.round((data.customers.today / data.customers.target) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((data.customers.today / data.customers.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bookings Today</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.bookings.today}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(data.bookings.change)}`}>
              {getChangeIcon(data.bookings.change)}
              <span className="ml-1">{Math.abs(data.bookings.change)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Target: {data.bookings.target}</span>
              <span>{Math.round((data.bookings.today / data.bookings.target) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((data.bookings.today / data.bookings.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.conversion.today}%</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(data.conversion.change)}`}>
              {getChangeIcon(data.conversion.change)}
              <span className="ml-1">{Math.abs(data.conversion.change)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Target: {data.conversion.target}%</span>
              <span>{Math.round((data.conversion.today / data.conversion.target) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((data.conversion.today / data.conversion.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
