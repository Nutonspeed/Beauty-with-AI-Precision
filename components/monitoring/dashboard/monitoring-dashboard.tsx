'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingDown,
  Server,
  Cpu,
  RefreshCw
} from 'lucide-react'

interface MetricsData {
  performance: {
    metrics: any[]
    summary: {
      totalRequests: number
      averageResponseTime: number
      errorRate: number
    }
  }
  system: {
    metrics: any[]
    summary: {
      current: {
        memory: { percentage: number }
        cpu: { usage: number }
      }
    }
  }
  alerts: {
    active: any[]
    stats: {
      total: number
      active: number
    }
  }
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, lastRefresh])

  const fetchMetrics = async () => {
    try {
      const [performanceRes, systemRes, alertsRes] = await Promise.all([
        fetch('/api/monitoring/metrics?type=performance'),
        fetch('/api/monitoring/metrics?type=system'),
        fetch('/api/monitoring/metrics?type=alerts')
      ])

      const [performanceData, systemData, alertsData] = await Promise.all([
        performanceRes.json(),
        systemRes.json(),
        alertsRes.json()
      ])

      setMetrics({
        performance: performanceData.data,
        system: systemData.data,
        alerts: alertsData.data
      })
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshMetrics = () => {
    setLoading(true)
    setLastRefresh(Date.now())
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'ERROR': return 'bg-red-100 text-red-800'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800'
      case 'INFO': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading monitoring data...</span>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Failed to load monitoring data
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system performance and alerting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.performance.summary.averageResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average over last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.performance.summary.errorRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.performance.summary.errorRate < 1 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.system.summary.current.memory.percentage.toFixed(1)}%
            </div>
            <Progress 
              value={metrics.system.summary.current.memory.percentage} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.alerts.active.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.alerts.active.length === 0 ? 'All systems normal' : 'Attention needed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Performance Metrics</CardTitle>
              <CardDescription>
                Response times and error rates for API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-medium">Total Requests</h4>
                    <p className="text-2xl font-bold">
                      {metrics.performance.summary.totalRequests.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Avg Response Time</h4>
                    <p className="text-2xl font-bold">
                      {metrics.performance.summary.averageResponseTime.toFixed(0)}ms
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Error Rate</h4>
                    <p className="text-2xl font-bold">
                      {metrics.performance.summary.errorRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Usage</span>
                    <span>{metrics.system.summary.current.memory.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.system.summary.current.memory.percentage} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Usage</span>
                    <span>{metrics.system.summary.current.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.system.summary.current.cpu.usage} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Current system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.alerts.active.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All Systems Normal</h3>
                  <p className="text-muted-foreground">
                    No active alerts at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.alerts.active.map((alert, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <h4 className="font-medium">{alert.type}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MonitoringDashboard
