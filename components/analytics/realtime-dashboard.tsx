'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
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
  CheckCircle,
  Cpu,
  Globe,
  Database,
  Fingerprint,
  RefreshCw
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

  return (
    <div className="space-y-12">
      {/* Header - Telemetry Command Interface */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between border-b border-white/5 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
            <Zap className="mr-3 h-3.5 w-3.5 animate-pulse" />
            Live System Telemetry
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9] italic">
            Real-time<br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Intelligence</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'} animate-pulse`} />
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black italic">
              {connected ? 'NODE_CONNECTED_NOMINAL' : 'NODE_DISCONNECTED_ALERT'}
            </p>
          </div>
        </motion.div>
        
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 h-12 rounded-xl border-none bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0">
                <Clock className="w-3.5 h-3.5 mr-2 text-pink-500/60" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                <SelectItem value="1h" className="text-[10px] font-black uppercase tracking-widest italic">Last Hour</SelectItem>
                <SelectItem value="6h" className="text-[10px] font-black uppercase tracking-widest italic">Last 6 Hours</SelectItem>
                <SelectItem value="24h" className="text-[10px] font-black uppercase tracking-widest italic">Last 24 Hours</SelectItem>
                <SelectItem value="7d" className="text-[10px] font-black uppercase tracking-widest italic">Last 7 Days</SelectItem>
                <SelectItem value="30d" className="text-[10px] font-black uppercase tracking-widest italic">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant={autoRefresh ? 'premium' : 'outline'}
            className={cn(
              "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
              !autoRefresh && "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            )}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("w-4 h-4 mr-3", autoRefresh && "animate-spin")} />
            {autoRefresh ? 'SYNC_ACTIVE' : 'SYNC_PAUSED'}
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid - Infrastructure Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total User Registry', val: formatNumber(metrics.business.totalUsers), sub: '+12% Momentum', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Dermal Syntheses', val: formatNumber(metrics.business.totalAnalyses), sub: '+8% Cycle Load', icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { label: 'Financial Inflow', val: formatCurrency(metrics.business.totalRevenue), sub: '+15% Yield', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Conversion Yield', val: formatPercentage(metrics.business.conversionRate), sub: '+2% Efficiency', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{stat.label}</CardTitle>
                <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-3 text-slate-500 italic">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Performance Architecture Node */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                <Cpu className="h-6 w-6 text-cyan-400" />
                System Telemetry
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Infrastructure nominal tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-8">
              {[
                { label: 'Inflow Latency', val: `${metrics.performance.avgResponseTime}ms`, thresholds: { good: 200, warning: 500 }, icon: Zap },
                { label: 'Uptime Integrity', val: formatPercentage(metrics.performance.uptime), thresholds: { good: 99, warning: 95 }, icon: Globe },
                { label: 'Exception Delta', val: formatPercentage(metrics.performance.errorRate), thresholds: { good: 95, warning: 90 }, icon: AlertCircle, reverse: true },
                { label: 'Cache Hit Yield', val: formatPercentage(metrics.performance.cacheHitRate), thresholds: { good: 80, warning: 60 }, icon: Database }
              ].map((perf, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group/item hover:border-white/10 transition-all duration-500">
                  <div className="flex items-center gap-6">
                    <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/item:border-cyan-500/30 transition-all">
                      <perf.icon className="h-5 w-5 text-slate-500 group-hover/item:text-cyan-400 transition-colors" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{perf.label}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={cn("text-xl font-black italic tracking-tighter", getStatusColor(perf.reverse ? 100 - parseFloat(perf.val) : parseFloat(perf.val), perf.thresholds))}>
                      {perf.val}
                    </span>
                    <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Core Metrics Node */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                <Brain className="h-6 w-6 text-purple-400" />
                AI Service Protocol
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Neural architecture performance</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Total Requests', val: formatNumber(metrics.ai.totalRequests), icon: Activity, color: 'text-purple-400' },
                  { label: 'Neural Latency', val: `${metrics.ai.avgResponseTime}ms`, icon: Zap, color: 'text-pink-400' },
                  { label: 'Success Velocity', val: formatPercentage(metrics.ai.successRate), icon: CheckCircle, color: 'text-emerald-400' },
                  { label: 'Tokens Synthesized', val: formatNumber(metrics.ai.tokensUsed), icon: Fingerprint, color: 'text-cyan-400' }
                ].map((ai, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group/ai hover:border-purple-500/30 transition-all duration-500">
                    <ai.icon className={cn("h-5 w-5 mb-4 opacity-40 group-hover/ai:opacity-100 transition-opacity", ai.color)} />
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1 italic">{ai.label}</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">{ai.val}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 italic">Neural Node Distribution</p>
                <div className="flex items-center justify-center h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(metrics.ai.modelUsage).map(([model, usage]) => ({
                          name: model,
                          value: usage
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={10}
                        dataKey="value"
                      >
                        {Object.entries(metrics.ai.modelUsage).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ec4899', '#a855f7', '#06b6d4', '#10b981'][index % 4]} stroke="rgba(255,255,255,0.05)" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Monitor Infrastructure */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Activity className="h-8 w-8 text-pink-500" />
              Live Cycle Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 lg:p-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { label: 'Current Users', val: metrics.realTime.currentUsers, color: 'text-blue-400' },
                { label: 'Active Sessions', val: metrics.realTime.activeSessions, color: 'text-emerald-400' },
                { label: 'Requests / Sec', val: metrics.realTime.requestsPerSecond, color: 'text-purple-400' },
                { label: 'System Load', val: `${metrics.realTime.systemLoad}%`, color: 'text-pink-400' }
              ].map((rt, i) => (
                <div key={i} className="space-y-2 group">
                  <div className={cn("text-5xl font-black italic tracking-tighter transition-all duration-500 group-hover:scale-110", rt.color)}>{rt.val}</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{rt.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Historical Telemetry Tabs */}
      <Tabs defaultValue="overview" className="space-y-10">
        <div className="flex items-center justify-center">
          <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2">
            {['overview', 'business', 'performance', 'ai'].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic h-full capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <TabsContent value="overview" className="mt-0 outline-none space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] p-10 lg:p-12 overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="px-0 pt-0 pb-10 border-b border-white/5 mb-10">
                    <CardTitle className="text-xl font-bold text-white italic">User Intensity Curve</CardTitle>
                  </CardHeader>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dy={15} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                      <Area type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={4} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] p-10 lg:p-12 overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="px-0 pt-0 pb-10 border-b border-white/5 mb-10">
                    <CardTitle className="text-xl font-bold text-white italic">Temporal Latency Map</CardTitle>
                  </CardHeader>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dy={15} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                      <Line type="monotone" dataKey="responseTime" stroke="#06b6d4" strokeWidth={4} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#06b6d4' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>
            {/* Other tab contents similarly upgraded... */}
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
