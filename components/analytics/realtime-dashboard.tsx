'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Clock,
  Zap,
  Brain,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// WebSocket client for real-time data
import { io, Socket } from 'socket.io-client'

interface MetricData {
  type: string
  data: any
  timestamp: number
}

interface DashboardMetrics {
  business: {
    totalUsers: number
    totalAnalyses: number
    totalBookings: number
    totalRevenue: number
    conversionRate: number
  }
  performance: {
    avgResponseTime: number
    uptime: number
    errorRate: number
    activeConnections: number
    cacheHitRate: number
  }
  ai: {
    totalRequests: number
    avgResponseTime: number
    successRate: number
    tokensUsed: number
    modelUsage: Record<string, number>
  }
  realTime: {
    currentUsers: number
    activeSessions: number
    requestsPerSecond: number
    systemLoad: number
  }
}

export default function RealTimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    business: {
      totalUsers: 0,
      totalAnalyses: 0,
      totalBookings: 0,
      totalRevenue: 0,
      conversionRate: 0
    },
    performance: {
      avgResponseTime: 0,
      uptime: 0,
      errorRate: 0,
      activeConnections: 0,
      cacheHitRate: 0
    },
    ai: {
      totalRequests: 0,
      avgResponseTime: 0,
      successRate: 0,
      tokensUsed: 0,
      modelUsage: {}
    },
    realTime: {
      currentUsers: 0,
      activeSessions: 0,
      requestsPerSecond: 0,
      systemLoad: 0
    }
  })

  const [_socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [timeRange, setTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [historicalData, setHistoricalData] = useState<any[]>([])

  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    }
  }, [timeRange])

  const fetchHistoricalData = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/historical?timeRange=${timeRange}`)
      const data = await response.json()
      
      if (data.success) {
        setHistoricalData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error)
    }
  }, [timeRange])

  const updateMetrics = useCallback((data: MetricData) => {
    setMetrics(prev => {
      const updated = { ...prev }
      
      switch (data.type) {
        case 'business_metrics':
          updated.business = { ...updated.business, ...data.data }
          break
        case 'performance_metrics':
          updated.performance = { ...updated.performance, ...data.data }
          break
        case 'ai_metrics':
          updated.ai = { ...updated.ai, ...data.data }
          break
        case 'realtime_metrics':
          updated.realTime = { ...updated.realTime, ...data.data }
          break
      }
      
      return updated
    })
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('auth_token')
      }
    })

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to analytics WebSocket')
      
      // Subscribe to metrics
      newSocket.emit('subscribe_metrics', [
        'business_metrics',
        'performance_metrics',
        'ai_metrics',
        'realtime_metrics'
      ])
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from analytics WebSocket')
    })

    newSocket.on('metrics_update', (data: MetricData) => {
      updateMetrics(data)
    })

    newSocket.on('analytics_data', (data: any) => {
      console.log('Received analytics data:', data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [updateMetrics])

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
    fetchHistoricalData()
  }, [fetchHistoricalData, fetchInitialData])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchInitialData()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, fetchInitialData])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (value >= thresholds.warning) return <AlertCircle className="w-4 h-4 text-yellow-600" />
    return <AlertCircle className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Analytics Dashboard</h2>
          <p className="text-muted-foreground">Live monitoring of business metrics and system performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.business.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skin Analyses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.business.totalAnalyses)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.business.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.business.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              System Performance
            </CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono ${getStatusColor(metrics.performance.avgResponseTime, { good: 200, warning: 500 })}`}>
                    {metrics.performance.avgResponseTime}ms
                  </span>
                  {getStatusIcon(metrics.performance.avgResponseTime, { good: 200, warning: 500 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono ${getStatusColor(metrics.performance.uptime, { good: 99, warning: 95 })}`}>
                    {formatPercentage(metrics.performance.uptime)}
                  </span>
                  {getStatusIcon(metrics.performance.uptime, { good: 99, warning: 95 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono ${getStatusColor(100 - metrics.performance.errorRate * 100, { good: 95, warning: 90 })}`}>
                    {formatPercentage(metrics.performance.errorRate)}
                  </span>
                  {getStatusIcon(100 - metrics.performance.errorRate * 100, { good: 95, warning: 90 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Cache Hit Rate</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono ${getStatusColor(metrics.performance.cacheHitRate * 100, { good: 80, warning: 60 })}`}>
                    {formatPercentage(metrics.performance.cacheHitRate)}
                  </span>
                  {getStatusIcon(metrics.performance.cacheHitRate * 100, { good: 80, warning: 60 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Services
            </CardTitle>
            <CardDescription>AI service performance and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Requests</span>
                <span className="font-mono">{formatNumber(metrics.ai.totalRequests)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Response Time</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono ${getStatusColor(metrics.ai.avgResponseTime, { good: 1000, warning: 3000 })}`}>
                    {metrics.ai.avgResponseTime}ms
                  </span>
                  {getStatusIcon(metrics.ai.avgResponseTime, { good: 1000, warning: 3000 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Success Rate</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-mono ${getStatusColor(metrics.ai.successRate * 100, { good: 95, warning: 90 })}`}>
                    {formatPercentage(metrics.ai.successRate)}
                  </span>
                  {getStatusIcon(metrics.ai.successRate * 100, { good: 95, warning: 90 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Tokens Used</span>
                <span className="font-mono">{formatNumber(metrics.ai.tokensUsed)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Real-time Activity
          </CardTitle>
          <CardDescription>Live user activity and system load</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.realTime.currentUsers}</div>
              <div className="text-sm text-muted-foreground">Current Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.realTime.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.realTime.requestsPerSecond}</div>
              <div className="text-sm text-muted-foreground">Requests/Second</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.realTime.systemLoad}%</div>
              <div className="text-sm text-muted-foreground">System Load</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="responseTime" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" />
                  <Bar dataKey="bookings" fill="#82ca9d" />
                  <Bar dataKey="analyses" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responseTime" stroke="#ff7300" />
                  <Line type="monotone" dataKey="errorRate" stroke="#387908" />
                  <Line type="monotone" dataKey="throughput" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Service Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={Object.entries(metrics.ai.modelUsage).map(([model, usage]) => ({
                      name: model,
                      value: usage
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(metrics.ai.modelUsage).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
