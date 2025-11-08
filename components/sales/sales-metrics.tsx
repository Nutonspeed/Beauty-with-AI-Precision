"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, DollarSign, Target, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600"
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
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
      {/* Calls Made */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.callsMade.today}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(metrics.callsMade.change)}`}>
              {getChangeIcon(metrics.callsMade.change)}
              <span className="ml-1">{Math.abs(metrics.callsMade.change).toFixed(1)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <Progress value={(metrics.callsMade.today / metrics.callsMade.target) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.round((metrics.callsMade.today / metrics.callsMade.target) * 100)}% of target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Contacted */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Contacted</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.leadsContacted.today}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(metrics.leadsContacted.change)}`}>
              {getChangeIcon(metrics.leadsContacted.change)}
              <span className="ml-1">{Math.abs(metrics.leadsContacted.change).toFixed(1)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <Progress value={(metrics.leadsContacted.today / metrics.leadsContacted.target) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.round((metrics.leadsContacted.today / metrics.leadsContacted.target) * 100)}% of target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Sent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proposals Sent</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.proposalsSent.today}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(metrics.proposalsSent.change)}`}>
              {getChangeIcon(metrics.proposalsSent.change)}
              <span className="ml-1">{Math.abs(metrics.proposalsSent.change).toFixed(1)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <Progress value={(metrics.proposalsSent.today / metrics.proposalsSent.target) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.round((metrics.proposalsSent.today / metrics.proposalsSent.target) * 100)}% of target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.conversionRate.today.toFixed(1)}%</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(metrics.conversionRate.change)}`}>
              {getChangeIcon(metrics.conversionRate.change)}
              <span className="ml-1">{Math.abs(metrics.conversionRate.change).toFixed(1)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <Progress value={(metrics.conversionRate.today / metrics.conversionRate.target) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.round((metrics.conversionRate.today / metrics.conversionRate.target) * 100)}% of target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Generated */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.revenueGenerated.today)}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className={`flex items-center ${getChangeColor(metrics.revenueGenerated.change)}`}>
              {getChangeIcon(metrics.revenueGenerated.change)}
              <span className="ml-1">{Math.abs(metrics.revenueGenerated.change).toFixed(1)}%</span>
            </span>
            <span className="ml-2">vs yesterday</span>
          </div>
          <div className="mt-3">
            <Progress
              value={(metrics.revenueGenerated.today / metrics.revenueGenerated.target) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>
                {Math.round((metrics.revenueGenerated.today / metrics.revenueGenerated.target) * 100)}% of target
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
