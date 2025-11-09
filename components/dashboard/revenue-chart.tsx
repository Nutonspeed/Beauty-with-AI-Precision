"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown } from "lucide-react"

interface RevenueDataPoint {
  date: string
  revenue: number
}

interface RevenueChartData {
  chartData: RevenueDataPoint[]
  summary: {
    current: {
      monthly: number
      total: number
    }
    targets: {
      daily: number
      monthly: number
      monthlyProgress: number
    }
    topServices: Array<{
      name: string
      revenue: number
    }>
    daysTracked: number
  }
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const response = await fetch("/api/clinic/dashboard/revenue")
        if (!response.ok) {
          throw new Error(`Failed to fetch revenue: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("[RevenueChart] Error:", err)
        setError(err instanceof Error ? err.message : "Failed to load revenue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevenue()
    const interval = setInterval(fetchRevenue, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">Failed to load revenue chart. Please try again.</p>
      </div>
    )
  }

  // Process data for chart
  const revenueData = data.chartData.length > 0 
    ? data.chartData.map((point) => ({
        day: new Date(point.date).getDate().toString(),
        revenue: point.revenue,
        target: data.summary.targets.daily
      }))
    : []

  const totalRevenue = data.summary.current.monthly
  const totalTarget = data.summary.targets.monthly
  const achievement = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0

  const maxRevenue = revenueData.length > 0 
    ? Math.max(...revenueData.map(d => d.revenue)) 
    : data.summary.targets.daily

  const minRevenue = revenueData.length > 0 
    ? Math.min(...revenueData.map(d => d.revenue)) 
    : 0

  const avgRevenue = revenueData.length > 0
    ? totalRevenue / revenueData.length
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue Trends (This Month)</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={achievement >= 100 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"}>
              {achievement >= 100 ? "🎯 Target Achieved" : "📈 On Track"}
            </Badge>
            <div className="text-right">
              <div className="text-sm font-medium">{achievement.toFixed(1)}% of target</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenue)} / {formatCurrency(totalTarget)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {revenueData.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>ยังไม่มีข้อมูลรายได้ในเดือนนี้</p>
            <p className="text-sm mt-2">ข้อมูลจะแสดงเมื่อมีการจองหรือชำระเงิน</p>
          </div>
        ) : (
          <>
            {/* Simple Bar Chart */}
            <div className="space-y-4">
              <div className="flex items-end gap-1 h-64">
                {revenueData.map((day, index) => {
              const height = (day.revenue / maxRevenue) * 100
              const isAboveTarget = day.revenue >= day.target
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    {/* Target line */}
                    <div
                      className="w-full border-t-2 border-dashed border-orange-400 opacity-50"
                      style={{ height: `${(day.target / maxRevenue) * 100}%` }}
                    />
                    {/* Revenue bar */}
                    <div
                      className={`w-full rounded-t-sm ${isAboveTarget ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-orange-400 border-t-2 border-dashed" />
              <span>Target</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(maxRevenue)}</div>
            <div className="text-sm text-muted-foreground">Best Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(Math.round(avgRevenue))}</div>
            <div className="text-sm text-muted-foreground">Daily Average</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {achievement > 100 ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
              <div className={`text-2xl font-bold ${achievement > 100 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {(achievement - 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground">vs Target</div>
          </div>
        </div>
            </>
          )}
      </CardContent>
    </Card>
  )
}
