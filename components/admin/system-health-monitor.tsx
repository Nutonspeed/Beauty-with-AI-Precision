'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Zap,
  Brain,
  Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

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
  const t = useTranslations()
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
              {t('systemHealth.loading')}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white tracking-tight italic flex items-center justify-center md:justify-start gap-4">
            <Activity className="w-8 h-8 text-pink-500 animate-pulse" />
            {t('systemHealth.title')}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
            {t('systemHealth.subtitle')}: {lastUpdate.toLocaleTimeString('th-TH')}
          </p>
        </div>
        <Badge className={cn("px-6 py-2 rounded-full border-none shadow-inner text-[10px] font-black uppercase tracking-widest italic", getStatusColor(metrics.api.status))}>
          {getStatusIcon(metrics.api.status)}
          <span className="ml-2">{t('systemHealth.statusLabel', { status: metrics.api.status.toUpperCase() })}</span>
        </Badge>
      </div>

      {/* Core Services Status - Infrastructure Nodes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('systemHealth.apiServerNode'), status: metrics.api.status, val: `${metrics.api.responseTime}ms`, sub: formatUptime(metrics.api.uptime), icon: Server, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('systemHealth.databaseMatrix'), status: metrics.database.status, val: `${metrics.database.queryTime}ms`, sub: t('systemHealth.activeConnects', { count: metrics.database.connections }), icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: t('systemHealth.neuralAiCore'), status: metrics.services.ai, val: t('ui.status.active'), sub: t('systemHealth.optimizedInference'), icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { label: t('systemHealth.entityRegistry'), status: 'healthy', val: metrics.activeUsers.current.toLocaleString(), sub: t('systemHealth.peakSync', { count: metrics.activeUsers.peak24h }), icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
        ].map((node, i) => (
          <Card key={i} className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{node.label}</CardTitle>
              <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                <node.icon className={cn("h-4 w-4", node.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-white tracking-tighter italic">{node.val}</div>
                <Badge variant="outline" className={cn("px-2 py-0 h-5 border-none rounded-full text-[8px] font-black uppercase tracking-tighter", getStatusColor(node.status as HealthStatus))}>
                  {node.status}
                </Badge>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-600 italic">
                {node.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Telemetry Bars */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: t('systemHealth.cpuLoadFactor'), val: metrics.performance.cpuUsage, icon: Activity },
          { label: t('systemHealth.neuralMemoryAllocation'), val: metrics.performance.memoryUsage, icon: Brain },
          { label: t('systemHealth.storageSectorIntegrity'), val: metrics.performance.diskUsage, icon: Database }
        ].map((item, i) => (
          <Card key={i} className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-pink-500/30 transition-all duration-700">
                    <item.icon className="h-5 w-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className={cn("text-2xl font-black italic tracking-tighter", item.val > 80 ? 'text-rose-500' : 'text-emerald-400')}>
                    {item.val}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.val}%` }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                  className={cn("h-full rounded-full transition-all duration-1000", item.val > 80 ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]')} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* API Performance Detailed */}
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
              {t('systemHealth.realtimeThroughput')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('systemHealth.vectorAnalysisDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-12">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{t('systemHealth.requestsIntensity')}</p>
                <div className="text-4xl font-black text-white tracking-tighter italic">{metrics.api.requestsPerMinute} <span className="text-[10px] uppercase text-slate-500 not-italic font-black tracking-widest ml-2">RPM</span></div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{t('systemHealth.exceptionDelta')}</p>
                <div className={cn("text-4xl font-black tracking-tighter italic", metrics.api.errorRate > 5 ? 'text-rose-500' : 'text-emerald-400')}>
                  {metrics.api.errorRate.toFixed(2)}%
                </div>
              </div>
              <div className="col-span-2 space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{t('systemHealth.dbPoolSaturation')}</p>
                  <span className="text-sm font-black text-white italic">{metrics.database.poolUtilization}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.database.poolUtilization}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Health Registry */}
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Shield className="h-6 w-6 text-purple-400" />
              {t('systemHealth.protocolIntegrityIndex')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('systemHealth.nominalStateDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-12 space-y-4">
            {Object.entries(metrics.services).map(([service, status], idx) => (
              <motion.div 
                key={service} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group/svc hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse shadow-lg", status === 'healthy' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50')} />
                  <span className="text-sm font-bold text-slate-300 group-hover/svc:text-white transition-colors uppercase tracking-widest italic">{t('systemHealth.controlNode', { service: service.toUpperCase() })}</span>
                </div>
                <Badge className={cn("px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner", getStatusColor(status as HealthStatus))}>
                  {t('systemHealth.statusLabel', { status: status.toUpperCase() })}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
