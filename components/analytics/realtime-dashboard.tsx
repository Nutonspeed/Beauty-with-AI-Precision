'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
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
  RefreshCw,
  ShieldCheck,
  Monitor
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
  const t = useTranslations()
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
        token: globalThis.localStorage?.getItem('auth_token')
      }
    })

    newSocket.on('connect', () => {
      setConnected(true)
      newSocket.emit('subscribe_metrics', [
        'business_metrics',
        'performance_metrics',
        'ai_metrics',
        'realtime_metrics'
      ])
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
    })

    newSocket.on('metrics_update', (data: MetricData) => {
      updateMetrics(data)
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
      }, 30000) 

      return () => clearInterval(interval)
    }
  }, [autoRefresh, fetchInitialData])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-emerald-600'
    if (value >= thresholds.warning) return 'text-amber-600'
    return 'text-rose-600'
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header - Telemetry Action interface */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center justify-center md:justify-start gap-6 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
              <Zap className="w-8 h-8 text-pink-600 animate-pulse" />
            </div>
            {t('realtimeDashboard.realtimeIntelligence' as any) || 'Real-time_Intelligence'}
          </h2>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", connected ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-rose-500 shadow-glow-rose')} />
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black italic">
              {connected ? (t('realtimeDashboard.nodeConnected' as any) || 'NODE_CONNECTED') : (t('realtimeDashboard.nodeDisconnected' as any) || 'NODE_DISCONNECTED')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
          <div className="bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-44 h-12 rounded-xl border-none bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-950 focus:ring-0">
                <Clock className="w-4 h-4 mr-3 text-pink-500/60" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                <SelectItem value="1h" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer">{t('realtimeDashboard.periods.1h' as any) || 'Temporal_1H'}</SelectItem>
                <SelectItem value="6h" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer">{t('realtimeDashboard.periods.6h' as any) || 'Temporal_6H'}</SelectItem>
                <SelectItem value="24h" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer">{t('realtimeDashboard.periods.24h' as any) || 'Temporal_24H'}</SelectItem>
                <SelectItem value="7d" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer">{t('realtimeDashboard.periods.7d' as any) || 'Temporal_7D'}</SelectItem>
                <SelectItem value="30d" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer">{t('realtimeDashboard.periods.30d' as any) || 'Temporal_30D'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            className={cn(
              "h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] italic transition-all shadow-premium border-slate-200 bg-white",
              autoRefresh ? "text-pink-600 border-pink-100 bg-pink-50/30" : "text-slate-400 hover:bg-slate-50"
            )}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("w-4 h-4 mr-3", autoRefresh && "animate-spin")} />
            {autoRefresh ? (t('realtimeDashboard.syncActive' as any) || 'SYNC_ACTIVE') : (t('realtimeDashboard.syncPaused' as any) || 'SYNC_PAUSED')}
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid interface */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t('realtimeDashboard.totalUserRegistry' as any) || 'Total_Entities', val: formatNumber(metrics.business.totalUsers), sub: 'Global Node Load', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('realtimeDashboard.dermalSyntheses' as any) || 'Total_Inferences', val: formatNumber(metrics.business.totalAnalyses), sub: 'Diagnostic Sequences', icon: Brain, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('realtimeDashboard.financialInflow' as any) || 'Global_Inflow', val: formatCurrency(metrics.business.totalRevenue), sub: 'Yield MTD', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('realtimeDashboard.conversionYield' as any) || 'Conv_Efficiency', val: formatPercentage(metrics.business.conversionRate), sub: 'Conversion Delta', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{stat.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-4">
                <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{stat.val}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600 transition-colors leading-relaxed">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Performance Architecture interface */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10 h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
                  <Cpu className="h-8 w-8 text-blue-600 group-hover:text-white" />
                </div>
                {t('realtimeDashboard.systemTelemetry' as any) || 'System_Stability_Mesh'}
              </CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('realtimeDashboard.infraTracking' as any) || 'Real-time infrastructure nominals and latency monitoring'}</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-8 flex-1 bg-white">
              {[
                { label: t('realtimeDashboard.latency' as any) || 'Mean_Response_Latency', val: `${metrics.performance.avgResponseTime}ms`, thresholds: { good: 200, warning: 500 }, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: t('realtimeDashboard.uptime' as any) || 'Global_Uptime_Protocol', val: formatPercentage(metrics.performance.uptime), thresholds: { good: 0.999, warning: 0.99 }, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: t('realtimeDashboard.exceptionDelta' as any) || 'Anomaly_Exception_Rate', val: formatPercentage(metrics.performance.errorRate), thresholds: { good: 0.95, warning: 0.90 }, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', reverse: true },
                { label: t('realtimeDashboard.cacheHitYield' as any) || 'Memory_Cache_Efficiency', val: formatPercentage(metrics.performance.cacheHitRate), thresholds: { good: 0.8, warning: 0.6 }, icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' }
              ].map((perf, i) => (
                <div key={i} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group/item hover:bg-white hover:border-blue-500/20 transition-all duration-500 shadow-inner hover:shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/item:bg-blue-600 transition-all duration-700" />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover/item:scale-110 group-hover/item:bg-white", perf.bg)}>
                      <perf.icon className={cn("h-7 w-7", perf.color)} />
                    </div>
                    <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/item:text-blue-600 transition-colors leading-none">{perf.label}</span>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <span className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none", getStatusColor(perf.reverse ? 100 - parseFloat(perf.val) : parseFloat(perf.val), perf.thresholds))}>
                      {perf.val}
                    </span>
                    <div className="h-2 w-2 rounded-full bg-current animate-pulse shadow-glow-blue" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Core Metrics Node interface */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-1000 hover:border-purple-500/10 h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-700">
                  <Brain className="h-8 w-8 text-purple-600 group-hover:text-white" />
                </div>
                {t('realtimeDashboard.aiServiceProtocol' as any) || 'Neural_Inference_Cluster'}
              </CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('realtimeDashboard.neuralPerformance' as any) || 'Real-time neural engine telemetry and token yield'}</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-16 space-y-12 flex-1 bg-white">
              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: t('realtimeDashboard.totalRequests' as any) || 'Neural_Cycles', val: formatNumber(metrics.ai.totalRequests), icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: t('realtimeDashboard.neuralLatency' as any) || 'Cluster_Latency', val: `${metrics.ai.avgResponseTime}ms`, icon: Zap, color: 'text-pink-600', bg: 'bg-pink-50' },
                  { label: t('realtimeDashboard.successVelocity' as any) || 'Inference_Accuracy', val: formatPercentage(metrics.ai.successRate), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: t('realtimeDashboard.tokensSynthesized' as any) || 'Tokens_Processed', val: formatNumber(metrics.ai.tokensUsed), icon: Fingerprint, color: 'text-blue-600', bg: 'bg-blue-50' }
                ].map((ai, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 group/ai hover:bg-white hover:border-purple-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/ai:bg-purple-600 transition-all duration-700" />
                    <div className={cn("h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm mb-8 transition-transform group-hover/ai:scale-110 group-hover/ai:border-purple-100", ai.color)}>
                      <ai.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover/ai:text-slate-950 transition-colors leading-none">{ai.label}</p>
                      <p className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/ai:text-purple-600 transition-colors">{ai.val}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="pt-10 border-t border-slate-100 space-y-10">
                <div className="flex items-center gap-5 ml-4">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('realtimeDashboard.neuralNodeDistribution' as any) || 'Model_Voxel_Allocation'}</h4>
                </div>
                <div className="flex items-center justify-center h-[300px] relative">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-20 w-20 rounded-full bg-purple-500/5 blur-2xl animate-pulse" />
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(metrics.ai.modelUsage).map(([model, usage]) => ({
                          name: model,
                          value: usage
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={10}
                        dataKey="value"
                      >
                        {Object.entries(metrics.ai.modelUsage).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ec4899', '#a855f7', '#3b82f6', '#10b981'][index % 4]} stroke="white" strokeWidth={4} className="cursor-pointer hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#a855f7', letterSpacing: '0.1em' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Monitor interface */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <Card className="border-slate-100 bg-slate-950 text-white shadow-2xl rounded-[4rem] overflow-hidden relative group transition-all duration-1000">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-500/10 opacity-50" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
          <CardHeader className="p-12 lg:p-16 pb-10 border-b border-white/5 relative z-10">
            <CardTitle className="text-4xl font-black italic tracking-tighter flex items-center gap-8 uppercase leading-none">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <Activity className="h-10 w-10 text-pink-500 animate-pulse" />
              </div>
              {t('realtimeDashboard.liveCycleMonitor' as any) || 'Global_Temporal_Sync'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-16 lg:p-24 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
              {[
                { label: t('realtimeDashboard.currentUsers' as any) || 'Active_Identities', val: metrics.realTime.currentUsers, color: 'text-blue-400' },
                { label: t('realtimeDashboard.activeSessions' as any) || 'Concurrent_Nodes', val: metrics.realTime.activeSessions, color: 'text-emerald-400' },
                { label: t('realtimeDashboard.requestsPerSec' as any) || 'Throughput_RPS', val: metrics.realTime.requestsPerSecond, color: 'text-purple-400' },
                { label: t('realtimeDashboard.systemLoad' as any) || 'Infrastructure_Load', val: `${metrics.realTime.systemLoad}%`, color: 'text-pink-400' }
              ].map((rt, i) => (
                <div key={i} className="space-y-4 group/stat">
                  <div className={cn("text-8xl font-black italic tracking-tighter leading-none transition-all duration-1000 group-hover/stat:scale-110", rt.color)}>{rt.val}</div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover/stat:text-white transition-colors">{rt.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Historical Telemetry Tabs interface */}
      <Tabs defaultValue="overview" className="space-y-12">
        <div className="flex items-center justify-center">
          <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
            {['overview', 'business', 'performance', 'ai'].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full capitalize">
                {t(`realtimeDashboard.tabs.${tab}` as any) || tab.toUpperCase() + '_LOG'}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <TabsContent value="overview" className="mt-0 outline-none space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] p-12 lg:p-16 overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-0 pb-12 border-b border-slate-50 mb-12">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100">
                        <Users className="w-6 h-6 text-pink-600" />
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('realtimeDashboard.userIntensityCurve' as any) || 'Entity_Engagement_Flux'}</CardTitle>
                    </div>
                  </CardHeader>
                  <div className="h-[400px] w-full relative">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                          axisLine={false} 
                          tickLine={false}
                          dy={15} 
                        />
                        <YAxis 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                          axisLine={false} 
                          tickLine={false}
                          dx={-10} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#ff69b4', letterSpacing: '0.1em' }}
                        />
                        <Area type="monotone" dataKey="users" stroke="#ff69b4" strokeWidth={6} fill="url(#colorUsers)" className="shadow-glow-pink" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] p-12 lg:p-16 overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-0 pb-12 border-b border-slate-50 mb-12">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('realtimeDashboard.temporalLatencyMap' as any) || 'Global_Network_Latency'}</CardTitle>
                    </div>
                  </CardHeader>
                  <div className="h-[400px] w-full relative">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                          axisLine={false} 
                          tickLine={false}
                          dy={15} 
                        />
                        <YAxis 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                          axisLine={false} 
                          tickLine={false}
                          dx={-10} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em' }}
                        />
                        <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={6} dot={false} activeDot={{ r: 10, strokeWidth: 0, fill: '#3b82f6' }} className="shadow-glow-blue" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Global Status interface */}
      <div className="px-10 lg:p-12 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">Infrastructure_Security_Verified: <span className="text-slate-950">NOMINAL</span></p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="flex items-center gap-4 px-6 py-2 rounded-full bg-white border border-slate-100 shadow-sm">
            <Monitor className="h-4 w-4 text-blue-600/40" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Telemetry_Registry_v4.8</p>
          </div>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black uppercase tracking-widest italic shadow-sm leading-none">
          BIP-Standard-Protocols-2026
        </Badge>
      </div>
    </div>
  );
}
