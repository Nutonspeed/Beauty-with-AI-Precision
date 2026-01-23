'use client'

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { cn } from '@/lib/utils'
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Settings, 
  Database,
  Server,
  BarChart3,
  DollarSign,
  Building,
  ArrowRight,
  Cpu
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { useTranslations, useLocale } from 'next-intl'
import { useLocalizePath } from "@/lib/i18n/locale-link"

import { GlobalPerformanceIndex } from '@/components/admin/global-performance-index'
import { RegionalGrowthHeatmap } from '@/components/admin/regional-growth-heatmap'
import { NeuralHealthMonitor } from '@/components/admin/neural-health-monitor'
import { AutonomousOpsLog } from '@/components/admin/autonomous-ops-log'
import { SynapticNotifications } from '@/components/admin/ai-synaptic-notifications'
import { StrategicGrowthAdvisor } from '@/components/admin/strategic-growth-advisor'
import { SecurityOrchestrator } from '@/components/admin/security-orchestrator'
import { IntelligenceCommandPalette } from '@/components/analytics/intelligence-command-palette'

interface SystemStats {
  totalUsers: number
  activeCenters: number
  totalAnalyses: number
  totalRevenue: number
  totalBookings: number
  growthRate: number
  averageOrderValue: number
}

interface CenterPerformance {
  id: string
  name: string
  revenue: number
  bookings: number
  averageOrderValue: number
}

interface AdminDashboardData {
  systemStats: SystemStats
  topCenters: CenterPerformance[]
}

const fallbackDashboardData: AdminDashboardData = {
  systemStats: {
    totalUsers: 0,
    activeCenters: 0,
    totalAnalyses: 0,
    totalRevenue: 0,
    totalBookings: 0,
    growthRate: 0,
    averageOrderValue: 0,
  },
  topCenters: [],
}

export default function AdminDashboard() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const isThaiLocale = locale === 'th'
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    console.log('[AdminDashboard] Auth state:', { hasUser: !!user, role: user?.role, authLoading })
    // If auth never resolves, stop spinning and surface an actionable error
    if (authLoading && !user) {
      const timeoutId = window.setTimeout(() => {
        setError('Auth loading timeout — กรุณาลองออกจากระบบแล้วล็อกอินใหม่อีกครั้ง')
        setIsLoading(false)
      }, 8000)

      return () => window.clearTimeout(timeoutId)
    }

    if (authLoading && !user) return
    
    // Only super_admin can access this dashboard
    if (!user || user.role !== 'super_admin') {
      console.warn('[AdminDashboard] Access denied for role:', user?.role)
      setError('Access denied')
      setIsLoading(false)
      return
    }

    console.log('[AdminDashboard] Access granted, loading data...')
    loadDashboardData()
  }, [user, authLoading])

  const loadDashboardData = async () => {
    let timeoutId: ReturnType<typeof window.setTimeout> | null = null
    setDataError(null)
    try {
      console.log('[AdminDashboard] Fetching performance data...')
      setIsLoading(true)
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        throw new Error('No session token available (please login again)')
      }

      const controller = new AbortController()
      timeoutId = window.setTimeout(() => controller.abort(), 30000)

      const response = await fetch('/api/admin/centers/performance?period=30d', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`Failed to load dashboard data (HTTP ${response.status})${errorText ? `: ${errorText}` : ''}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Dashboard loading error:', err)
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data'
      if (message.includes('No session token')) {
        setError(message)
        return
      }
      const friendlyMessage = message.includes('signal is aborted')
        ? 'Dashboard data request timed out. Showing fallback metrics.'
        : message
      setDataError(friendlyMessage)
      setData(fallbackDashboardData)
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const quickActions = [
    { label: 'User Management', href: lp('/admin/users'), icon: Users, color: 'bg-blue-500' },
    { label: 'Center Management', href: lp('/admin/centers'), icon: Database, color: 'bg-purple-500' },
    { label: 'Analytics', href: lp('/admin/analytics'), icon: BarChart3, color: 'bg-green-500' },
    { label: 'System Settings', href: lp('/admin/settings'), icon: Settings, color: 'bg-orange-500' },
  ]

  const systemStatus = [
    { name: 'Database', status: 'operational', latency: '12ms' },
    { name: 'API Server', status: 'operational', latency: '45ms' },
    { name: 'AI Service', status: 'operational', latency: '120ms' },
    { name: 'Storage', status: 'operational', latency: '8ms' },
  ]

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-slate-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-20 w-20 mx-auto">
              <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
              <GradientSpinner size="lg" className="relative" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Initializing System Data...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
      <Header />
      
      <IntelligenceCommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={(id) => {
          console.log("Admin selected node:", id)
        }} 
      />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background - Light Theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {dataError && (
            <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/50 px-8 py-6 text-amber-900 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 italic">Data status</p>
              </div>
              <p className="text-sm font-medium italic">{dataError}</p>
            </div>
          )}
          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 pb-12 border-b border-slate-100"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black shadow-premium animate-pulse italic">
              <Shield className="mr-3 h-3.5 w-3.5" />
              Elite System Orchestration Node
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              Admin<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Infrastructure</span>
            </h1>
            <p className="text-2xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
              Command global system parameters and monitor center ecosystem health with precision metrics.
            </p>
          </motion.div>

          {/* System Metrics Grid - Operational Nodes */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total User Registry', val: data.systemStats.totalUsers.toLocaleString(), sub: 'Active Entities', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: 'Center Nodes', val: data.systemStats.activeCenters.toString(), sub: 'Operational Units', icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Global Revenue', val: formatCurrency(data.systemStats.totalRevenue), sub: `${data.systemStats.growthRate >= 0 ? '+' : ''}${data.systemStats.growthRate}% MTD`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'System Cycles', val: data.systemStats.totalBookings.toLocaleString(), sub: `Avg ${formatCurrency(data.systemStats.averageOrderValue)}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{stat.label}</CardTitle>
                    <div className={cn("p-3 rounded-2xl border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{stat.val}</div>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="h-1 w-6 bg-slate-100 rounded-full group-hover:w-12 group-hover:bg-pink-500 transition-all duration-500" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600">
                        {stat.sub}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Tactical Control Hub */}
            <div className="lg:col-span-4 space-y-10">
              <SynapticNotifications />
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                  <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic flex items-center gap-5 uppercase">
                    <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                      <Cpu className="h-8 w-8" />
                    </div>
                    Command Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6 bg-slate-50/30">
                  {quickActions.map((action, i) => (
                    <motion.div key={i} whileHover={{ x: 12 }} transition={{ duration: 0.5 }}>
                      <Link href={action.href}>
                        <Card className="border-slate-100 bg-white rounded-[2rem] hover:border-pink-500/20 transition-all duration-700 shadow-sm overflow-hidden group/action">
                          <CardContent className="p-8">
                            <div className="flex items-center gap-6 mb-8">
                              <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover/action:scale-110 transition-transform duration-700", action.color.replace('bg-', 'bg-pink-50 text-pink-').replace('500', '600'))}>
                                <action.icon className="h-8 w-8" />
                              </div>
                              <div className="space-y-1.5">
                                <h4 className="font-black text-slate-950 text-xl tracking-tight italic group-hover/action:text-pink-600 transition-colors uppercase">{action.label}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Access Node Parameter</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest italic hover:bg-gradient-to-r hover:from-pink-500 hover:to-blue-600 hover:text-white hover:border-none transition-all shadow-sm">
                              Initialize Module
                              <ArrowRight className="ml-3 h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* System Telemetry Node */}
              <Card className="border-emerald-100 bg-emerald-50/10 shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-emerald-500/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-emerald-50">
                  <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic flex items-center gap-5 uppercase">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <Server className="h-8 w-8 text-emerald-600" />
                    </div>
                    System Telemetry
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6">
                  {systemStatus.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 group hover:border-emerald-500/20 transition-all duration-500 shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                        <span className="text-base font-black text-slate-900 italic uppercase tracking-tight">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-slate-50 text-[10px] font-black text-slate-400 border-slate-100 uppercase tracking-widest px-4 py-1.5 rounded-full italic">{service.latency}</Badge>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest italic shadow-sm">Nominal</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Performance Analytics Column */}
            <div className="lg:col-span-8 space-y-12">
              <SecurityOrchestrator />
              <StrategicGrowthAdvisor />
              <AutonomousOpsLog />
              <NeuralHealthMonitor />
              <GlobalPerformanceIndex />
              <RegionalGrowthHeatmap />
              
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div className="space-y-3">
                    <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase">
                      <div className="p-4 bg-slate-50 rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                        <BarChart3 className="h-10 w-10 text-pink-600 group-hover:text-white" />
                      </div>
                      Top Performing Nodes
                    </CardTitle>
                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Live aesthetic efficiency synchronization</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-12 lg:p-16 bg-slate-50/30">
                  {data.topCenters.length === 0 ? (
                    <div className="py-32 text-center space-y-10 bg-white rounded-[3rem] border border-slate-100 border-dashed italic shadow-inner">
                      <div className="mx-auto h-28 w-28 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-sm">
                        <Database className="h-14 w-14" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-3xl font-black text-slate-950 italic uppercase tracking-tight">No Registry Data</p>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Awaiting center node synchronization</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {data.topCenters.map((center, index) => (
                        <motion.div
                          key={center.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col md:flex-row md:items-center justify-between p-12 rounded-[3rem] border border-slate-100 bg-white group/item hover:border-pink-500/20 transition-all duration-700 relative overflow-hidden shadow-sm hover:shadow-premium"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-pink-500 to-blue-600 opacity-10 group-hover/item:opacity-100 transition-opacity" />
                          <div className="flex items-center gap-10 mb-8 md:mb-0">
                            <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:border-pink-500/30 transition-all duration-700">
                              <span className="text-3xl font-black italic text-slate-200 group-hover:text-pink-600 transition-colors">0{index + 1}</span>
                            </div>
                            <div className="space-y-3">
                              <p className="text-3xl font-black text-slate-950 tracking-tight italic group-hover:text-pink-600 transition-colors uppercase">{center.name}</p>
                              <Badge variant="outline" className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-slate-100 group-hover/item:text-blue-600 transition-colors italic px-5 py-1.5 rounded-full border-none shadow-sm">
                                CYCLES: {center.bookings}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right space-y-3">
                            <p className="text-4xl font-black text-slate-950 tracking-tighter italic group-hover:text-pink-600 transition-colors uppercase">{formatCurrency(center.revenue)}</p>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Avg Node Yield: {formatCurrency(center.averageOrderValue)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
