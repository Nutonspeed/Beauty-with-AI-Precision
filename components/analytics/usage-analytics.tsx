"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Eye, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { useUsageTracking } from "@/lib/analytics/usage-tracker"

interface UsageMetrics {
  totalEvents: number
  eventsByCategory: Record<string, number>
  featureUsage: Record<string, number>
  sessionDuration: number
  lastUpdated: Date
}

export function UsageAnalytics() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getSessionStats } = useUsageTracking()

  useEffect(() => {
    const loadMetrics = () => {
      try {
        const sessionStats = getSessionStats()
        const mockMetrics: UsageMetrics = {
          totalEvents: sessionStats.totalEvents,
          eventsByCategory: sessionStats.eventsByCategory,
          featureUsage: sessionStats.featureUsage,
          sessionDuration: sessionStats.sessionDuration,
          lastUpdated: new Date(),
        }
        setMetrics(mockMetrics)
      } catch (error) {
        console.error('Failed to load usage metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()

    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [getSessionStats])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">ไม่สามารถโหลดข้อมูลการใช้งานได้</p>
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getTopFeatures = () => {
    return Object.entries(metrics.featureUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events this session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.sessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Current session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(metrics.featureUsage).length}</div>
            <p className="text-xs text-muted-foreground">
              Unique features used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lastUpdated.toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">
              Real-time data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Categories */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.eventsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {category}
                    </Badge>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(metrics.eventsByCategory).length === 0 && (
                <p className="text-sm text-muted-foreground">No events recorded yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Features Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getTopFeatures().map(([feature, count]) => (
                <div key={feature} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {feature.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-medium">{count} times</span>
                </div>
              ))}
              {getTopFeatures().length === 0 && (
                <p className="text-sm text-muted-foreground">No features used yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Usage Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.totalEvents === 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Getting Started:</strong> Start using features like AI analysis to see usage tracking in action.
                </p>
              </div>
            )}

            {metrics.eventsByCategory.feature && metrics.eventsByCategory.feature > 5 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Active User:</strong> You've used {metrics.eventsByCategory.feature} features this session. Great engagement!
                </p>
              </div>
            )}

            {metrics.sessionDuration > 300000 && ( // 5 minutes
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Long Session:</strong> You've been active for {formatDuration(metrics.sessionDuration)}. Consider taking a break!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}