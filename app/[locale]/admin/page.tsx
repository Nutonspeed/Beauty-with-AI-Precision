'use client'

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Shield, 
  Settings, 
  Database,
  Server,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalClinics: number
  totalAnalyses: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  uptime: string
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 1247,
    activeUsers: 89,
    totalClinics: 23,
    totalAnalyses: 8456,
    systemHealth: 'healthy',
    uptime: '99.9%'
  })

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const quickActions = [
    { label: 'User Management', href: '/admin/users', icon: Users, color: 'bg-blue-500' },
    { label: 'Clinic Management', href: '/admin/clinics', icon: Database, color: 'bg-purple-500' },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'bg-green-500' },
    { label: 'System Settings', href: '/admin/settings', icon: Settings, color: 'bg-orange-500' },
  ]

  const systemStatus = [
    { name: 'Database', status: 'operational', latency: '12ms' },
    { name: 'API Server', status: 'operational', latency: '45ms' },
    { name: 'AI Service', status: 'operational', latency: '120ms' },
    { name: 'Storage', status: 'operational', latency: '8ms' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">System Overview & Management</p>
              </div>
            </div>
            <Badge variant={stats.systemHealth === 'healthy' ? 'default' : 'destructive'}>
              <CheckCircle className="h-3 w-3 mr-1" />
              System {stats.systemHealth}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, change: '+12%' },
            { label: 'Active Now', value: stats.activeUsers.toString(), icon: Activity, change: '+5%' },
            { label: 'Clinics', value: stats.totalClinics.toString(), icon: Database, change: '+2' },
            { label: 'Analyses', value: stats.totalAnalyses.toLocaleString(), icon: TrendingUp, change: '+18%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="font-medium text-sm">{action.label}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {service.latency}
                    </Badge>
                    <Badge variant="secondary" className="text-xs text-green-600">
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">All systems operational</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                Uptime: {stats.uptime} over the last 30 days
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
