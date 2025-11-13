'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'

type HealthStatus = 'healthy' | 'degraded' | 'down'

interface SystemMetrics {
  api: {
    status: HealthStatus
    uptime: number
    responseTime: number
    requestsPerMinute: number
    errorRate: number
  }
  database: {
    status: HealthStatus
    connections: number
    maxConnections: number
    queryTime: number
    poolUtilization: number
  }
  services: {
    auth: HealthStatus
    storage: HealthStatus
    ai: HealthStatus
    email: HealthStatus
  }
  activeUsers: {
    current: number
    peak24h: number
    authenticated: number
    anonymous: number
  }
  performance: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
  }
}

export function SystemHealthMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/admin/system-health')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data.metrics)
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error('Failed to fetch system metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-500/10'
      case 'degraded':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'down':
        return 'text-red-500 bg-red-500/10'
    }
  }

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4" />
      case 'degraded':
      case 'down':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading system health metrics...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            System Health Monitor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {lastUpdate.toLocaleTimeString('th-TH')}
          </p>
        </div>
        <Badge className={getStatusColor(metrics.api.status)}>
          {getStatusIcon(metrics.api.status)}
          <span className="ml-1">System {metrics.api.status.toUpperCase()}</span>
        </Badge>
      </div>

      {/* Core Services Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" />
              API Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className={getStatusColor(metrics.api.status)} variant="outline">
                  {metrics.api.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uptime</span>
                <span className="text-xs font-medium">{formatUptime(metrics.api.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Response</span>
                <span className="text-xs font-medium">{metrics.api.responseTime}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className={getStatusColor(metrics.database.status)} variant="outline">
                  {metrics.database.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Connections</span>
                <span className="text-xs font-medium">
                  {metrics.database.connections}/{metrics.database.maxConnections}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Query Time</span>
                <span className="text-xs font-medium">{metrics.database.queryTime}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className={getStatusColor(metrics.services.ai)} variant="outline">
                  {metrics.services.ai}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Storage</span>
                <Badge className={getStatusColor(metrics.services.storage)} variant="outline">
                  {metrics.services.storage}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Email</span>
                <Badge className={getStatusColor(metrics.services.email)} variant="outline">
                  {metrics.services.email}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{metrics.activeUsers.current}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Peak (24h)</span>
                <span className="font-medium">{metrics.activeUsers.peak24h}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Authenticated</span>
                <span className="font-medium">{metrics.activeUsers.authenticated}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.performance.cpuUsage}%</span>
                {metrics.performance.cpuUsage > 80 && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <Progress value={metrics.performance.cpuUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.performance.memoryUsage}%</span>
                {metrics.performance.memoryUsage > 80 && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <Progress value={metrics.performance.memoryUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.performance.diskUsage}%</span>
                {metrics.performance.diskUsage > 80 && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <Progress value={metrics.performance.diskUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            API Performance
          </CardTitle>
          <CardDescription>Real-time API metrics and error tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Requests/min</div>
              <div className="text-2xl font-bold">{metrics.api.requestsPerMinute}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Avg Response Time</div>
              <div className="text-2xl font-bold">{metrics.api.responseTime}ms</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Error Rate</div>
              <div className={`text-2xl font-bold ${metrics.api.errorRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
                {metrics.api.errorRate.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">DB Pool Usage</div>
              <div className="space-y-1">
                <div className="text-lg font-bold">{metrics.database.poolUtilization}%</div>
                <Progress value={metrics.database.poolUtilization} className="h-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Service Health
          </CardTitle>
          <CardDescription>Status of all platform services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(metrics.services).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium capitalize">{service}</span>
                <Badge className={getStatusColor(status)}>
                  {getStatusIcon(status)}
                  <span className="ml-1">{status}</span>
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
