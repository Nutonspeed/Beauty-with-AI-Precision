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

export default function AdminDashboard() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const isThaiLocale = locale === 'th'
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
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
      setError('Access denied')
      setIsLoading(false)
      return
    }

    loadDashboardData()
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        throw new Error('No session token available (please login again)')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('/api/admin/centers/performance?period=30d', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`Failed to load dashboard data (HTTP ${response.status})${errorText ? `: ${errorText}` : ''}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
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
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-500/30">
      <Header />
      
      <IntelligenceCommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={(id) => {
          console.log("Admin selected node:", id)
        }} 
      />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-12 border-b border-slate-200"
          >
            <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-blue-500/5">
              <Shield className="mr-3 h-3.5 w-3.5 animate-pulse" />
              Elite System Orchestration Node
            </Badge>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-slate-900 leading-[0.9] italic">
              Admin<br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent not-italic">Infrastructure</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
              Command global system parameters and monitor center ecosystem health with precision metrics.
            </p>
          </motion.div>

          {/* System Metrics Grid - Operational Nodes */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total User Registry', val: data.systemStats.totalUsers.toLocaleString(), sub: 'Active Entities', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Center Nodes', val: data.systemStats.activeCenters.toString(), sub: 'Operational Units', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Global Revenue', val: formatCurrency(data.systemStats.totalRevenue), sub: `${data.systemStats.growthRate >= 0 ? '+' : ''}${data.systemStats.growthRate}% MTD`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'System Cycles', val: data.systemStats.totalBookings.toLocaleString(), sub: `Avg ${formatCurrency(data.systemStats.averageOrderValue)}`, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[2.5rem] hover:bg-white transition-all duration-500 group shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{stat.label}</CardTitle>
                    <div className={cn("p-2.5 rounded-xl border border-slate-100 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.val}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-3 text-slate-400 italic">
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Tactical Control Hub */}
            <div className="lg:col-span-4 space-y-10">
              <SynapticNotifications />
              <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100">
                  <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight italic flex items-center gap-4">
                    <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-100">
                      <Cpu className="h-6 w-6 text-cyan-600" />
                    </div>
                    Command Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6 bg-slate-50/30">
                  {quickActions.map((action, i) => (
                    <motion.div key={i} whileHover={{ x: 10 }} transition={{ duration: 0.3 }}>
                      <Link href={action.href}>
                        <Card className="border-white bg-white rounded-[2rem] hover:border-blue-500/20 transition-all duration-500 shadow-sm overflow-hidden group/action">
                          <CardContent className="p-8">
                            <div className="flex items-center gap-6 mb-6">
                              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover/action:scale-110 transition-transform duration-700", action.color.replace('bg-', 'bg-opacity-10 text-').replace('500', '600'))}>
                                <action.icon className="h-7 w-7" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 text-lg tracking-tight italic group-hover/action:text-blue-600 transition-colors uppercase">{action.label}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Access Node Parameter</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 bg-slate-50 text-[9px] font-black uppercase tracking-widest italic hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                              Initialize Module
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* System Telemetry Node */}
              <Card className="border-emerald-500/20 bg-emerald-50/50 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-emerald-100">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight italic flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <Server className="h-6 w-6 text-emerald-600" />
                    </div>
                    System Telemetry
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6">
                  {systemStatus.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-emerald-50 group hover:border-emerald-500/30 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        <span className="text-sm font-bold text-slate-700 italic uppercase">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-slate-50 text-[8px] font-black text-slate-400 border-slate-100 uppercase tracking-widest px-3 py-1 rounded-lg italic">{service.latency}</Badge>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-sm">Nominal</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Performance Analytics Column */}
            <div className="lg:col-span-8 space-y-10">
              <SecurityOrchestrator />
              <StrategicGrowthAdvisor />
              <AutonomousOpsLog />
              <NeuralHealthMonitor />
              <GlobalPerformanceIndex />
              <RegionalGrowthHeatmap />
              
              <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight italic flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                      Top Performing Nodes
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Live aesthetic efficiency synchronization</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-slate-50/30">
                  {data.topCenters.length === 0 ? (
                    <div className="py-32 text-center space-y-6 bg-white/40 rounded-[2.5rem] border border-slate-200 border-dashed italic shadow-inner">
                      <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-sm">
                        <Database className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-slate-400 uppercase tracking-tighter">No Registry Data</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Awaiting center node synchronization</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {data.topCenters.map((center, index) => (
                        <motion.div
                          key={center.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col md:flex-row md:items-center justify-between p-10 rounded-[2.5rem] border border-slate-100 bg-white group/item hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden shadow-sm"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600/10 group-hover/item:bg-blue-600 transition-colors" />
                          <div className="flex items-center gap-8 mb-6 md:mb-0">
                            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:border-blue-500/30 transition-all">
                              <span className="text-2xl font-black italic text-slate-300 group-hover:text-blue-600">0{index + 1}</span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-2xl font-bold text-slate-900 tracking-tight italic group-hover:text-blue-600 transition-colors uppercase">{center.name}</p>
                              <Badge variant="outline" className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-slate-100 group-hover/item:text-blue-400 transition-colors italic px-4 py-1 rounded-lg">
                                CYCLES: {center.bookings}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-3xl font-black text-slate-900 tracking-tighter italic group-hover:text-blue-600 transition-colors">{formatCurrency(center.revenue)}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Avg Node Yield: {formatCurrency(center.averageOrderValue)}</p>
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
