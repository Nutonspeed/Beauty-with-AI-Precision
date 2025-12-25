'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Server,
  Database,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
  Globe,
  Shield,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface HealthMetric {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  value: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
  lastChecked: string
  trend?: 'up' | 'down' | 'stable'
}

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'degraded'
  uptime: number
  responseTime: number
  lastCheck: string
  errorRate: number
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  score: number
  services: ServiceStatus[]
  metrics: {
    cpu: HealthMetric
    memory: HealthMetric
    disk: HealthMetric
    database: HealthMetric
    api: HealthMetric
  }
  alerts: Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    timestamp: string
    service: string
  }>
  history: Array<{
    timestamp: string
    score: number
    cpu: number
    memory: number
    disk: number
  }>
}

export default function SystemHealthPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)

  useEffect(() => {
    if (!authLoading && user) {
      fetchHealthData()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchHealthData()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/admin/system-health')
      if (!response.ok) throw new Error('Failed to fetch health data')
      const healthData = await response.json()
      
      // Transform data to match expected format
      const transformedData = {
        overall: healthData.metrics.api.status === 'healthy' ? 'healthy' : 
                healthData.metrics.api.status === 'degraded' ? 'warning' : 'critical',
        score: healthData.metrics.api.status === 'healthy' ? 95 : 
               healthData.metrics.api.status === 'degraded' ? 70 : 40,
        services: [
          {
            name: 'API Server',
            status: healthData.metrics.api.status === 'healthy' ? 'online' :
                   healthData.metrics.api.status === 'degraded' ? 'degraded' : 'offline',
            uptime: 99.9,
            responseTime: healthData.metrics.api.responseTime,
            lastCheck: new Date().toISOString(),
            errorRate: healthData.metrics.api.errorRate,
          },
          {
            name: 'Database',
            status: healthData.metrics.database.status === 'healthy' ? 'online' :
                   healthData.metrics.database.status === 'degraded' ? 'degraded' : 'offline',
            uptime: 99.5,
            responseTime: healthData.metrics.database.queryTime,
            lastCheck: new Date().toISOString(),
            errorRate: 0.1,
          },
          {
            name: 'Storage',
            status: 'online',
            uptime: 99.9,
            responseTime: 50,
            lastCheck: new Date().toISOString(),
            errorRate: 0.1,
          },
          {
            name: 'Email Service',
            status: healthData.metrics.services.email === 'healthy' ? 'online' : 'offline',
            uptime: 99.0,
            responseTime: 100,
            lastCheck: new Date().toISOString(),
            errorRate: 1.0,
          },
        ],
        metrics: {
          cpu: {
            name: 'CPU',
            status: healthData.metrics.performance.cpuUsage > 80 ? 'critical' : 
                   healthData.metrics.performance.cpuUsage > 60 ? 'warning' : 'healthy',
            value: healthData.metrics.performance.cpuUsage,
            unit: '%',
            threshold: { warning: 60, critical: 80 },
            lastChecked: new Date().toISOString(),
            trend: 'stable' as const,
          },
          memory: {
            name: 'Memory',
            status: healthData.metrics.performance.memoryUsage > 85 ? 'critical' : 
                   healthData.metrics.performance.memoryUsage > 70 ? 'warning' : 'healthy',
            value: healthData.metrics.performance.memoryUsage,
            unit: '%',
            threshold: { warning: 70, critical: 85 },
            lastChecked: new Date().toISOString(),
            trend: 'stable' as const,
          },
          disk: {
            name: 'Disk',
            status: healthData.metrics.performance.diskUsage > 90 ? 'critical' : 
                   healthData.metrics.performance.diskUsage > 75 ? 'warning' : 'healthy',
            value: healthData.metrics.performance.diskUsage,
            unit: '%',
            threshold: { warning: 75, critical: 90 },
            lastChecked: new Date().toISOString(),
            trend: 'stable' as const,
          },
          database: {
            name: 'Database',
            status: healthData.metrics.database.status === 'healthy' ? 'healthy' : 
                   healthData.metrics.database.status === 'degraded' ? 'warning' : 'critical',
            value: healthData.metrics.database.connections,
            unit: 'connections',
            threshold: { warning: 80, critical: 95 },
            lastChecked: new Date().toISOString(),
            trend: 'stable' as const,
          },
          api: {
            name: 'API',
            status: healthData.metrics.api.status === 'healthy' ? 'healthy' : 
                   healthData.metrics.api.status === 'degraded' ? 'warning' : 'critical',
            value: healthData.metrics.api.responseTime,
            unit: 'ms',
            threshold: { warning: 200, critical: 500 },
            lastChecked: new Date().toISOString(),
            trend: 'stable' as const,
          },
        },
        alerts: healthData.metrics.api.errorRate > 5 ? [{
          id: 'api-errors',
          type: 'warning' as const,
          message: `High error rate: ${healthData.metrics.api.errorRate.toFixed(2)}%`,
          timestamp: new Date().toISOString(),
          service: 'API Server',
        }] : [],
        history: [],
      }
      
      setHealth(transformedData)
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
      case 'degraded':
        return <AlertCircle className="w-4 h-4" />
      case 'critical':
      case 'offline':
        return <XCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  if (loading) {
    return <div className="text-center py-8">Loading system health data...</div>
  }

  if (!health) {
    return <div className="text-center py-8">Failed to load health data</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system performance and service status
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
              <SelectItem value="300">5m</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Activity className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
            Auto Refresh
          </Button>
          <Button onClick={fetchHealthData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(health.overall)}
            Overall System Status
            <Badge className={getStatusColor(health.overall)}>
              {health.overall.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{health.score}/100</div>
              <p className="text-sm text-muted-foreground">Health Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {health.services.filter(s => s.status === 'online').length}/{health.services.length}
              </div>
              <p className="text-sm text-muted-foreground">Services Online</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{health.alerts.length}</div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{health.metrics.cpu.value}%</div>
              {getTrendIcon(health.metrics.cpu.trend)}
            </div>
            <Progress value={health.metrics.cpu.value} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {format(new Date(health.metrics.cpu.lastChecked), 'HH:mm:ss')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{health.metrics.memory.value}%</div>
              {getTrendIcon(health.metrics.memory.trend)}
            </div>
            <Progress value={health.metrics.memory.value} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {format(new Date(health.metrics.memory.lastChecked), 'HH:mm:ss')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{health.metrics.disk.value}%</div>
              {getTrendIcon(health.metrics.disk.trend)}
            </div>
            <Progress value={health.metrics.disk.value} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {format(new Date(health.metrics.disk.lastChecked), 'HH:mm:ss')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{health.metrics.api.value}ms</div>
              {getTrendIcon(health.metrics.api.trend)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (health.metrics.api.value / 1000) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {format(new Date(health.metrics.api.lastChecked), 'HH:mm:ss')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">Metrics History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Error Rate</TableHead>
                    <TableHead>Last Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {health.services.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(service.status)}>
                          {getStatusIcon(service.status)}
                          <span className="ml-1">{service.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{service.uptime.toFixed(2)}%</TableCell>
                      <TableCell>{service.responseTime}ms</TableCell>
                      <TableCell>{service.errorRate.toFixed(2)}%</TableCell>
                      <TableCell>
                        {format(new Date(service.lastCheck), 'HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={health.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value as string), 'HH:mm:ss')}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="CPU %"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Memory %"
                  />
                  <Area
                    type="monotone"
                    dataKey="disk"
                    stackId="3"
                    stroke="#ffc658"
                    fill="#ffc658"
                    fillOpacity={0.3}
                    name="Disk %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {health.alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts
                </div>
              ) : (
                <div className="space-y-3">
                  {health.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.type === 'error' ? 'border-red-200 bg-red-50' :
                        alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {alert.type === 'error' ? <XCircle className="w-5 h-5 text-red-500 mt-0.5" /> :
                           alert.type === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" /> :
                           <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />}
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              Service: {alert.service} • {format(new Date(alert.timestamp), 'PPPpp')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
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
