'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  Loader2,
  Users,
  Database,
  Activity,
  Brain,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

interface UsageMetrics {
  clinicId: string
  clinicName: string
  activeUsers: number
  totalUsers: number
  storageUsedGB: number
  storageLimit: number
  apiCallsThisMonth: number
  aiAnalysesThisMonth: number
  customersCount: number
  customersLimit: number
  bookingsThisMonth: number
  quotaWarnings: string[]
}

export default function UsagePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [usage, setUsage] = useState<UsageMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role !== 'super_admin') {
      router.push('/customer/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    async function loadUsage() {
      try {
        const url = selectedClinic
          ? `/api/admin/usage?clinicId=${selectedClinic}`
          : '/api/admin/usage'
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setUsage(data.usage || [])
        } else {
          toast({
            title: '❌ Error',
            description: 'Failed to load usage metrics',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Failed to load usage:', error)
        toast({
          title: '❌ Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'super_admin') {
      loadUsage()
    }
  }, [user, selectedClinic, toast])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading usage metrics...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  const totalActiveUsers = usage.reduce((sum, u) => sum + u.activeUsers, 0)
  const totalStorage = usage.reduce((sum, u) => sum + u.storageUsedGB, 0)
  const totalApiCalls = usage.reduce((sum, u) => sum + u.apiCallsThisMonth, 0)
  const totalAnalyses = usage.reduce((sum, u) => sum + u.aiAnalysesThisMonth, 0)
  const clinicsWithWarnings = usage.filter((u) => u.quotaWarnings.length > 0).length

  const getUsageColor = (used: number, limit: number) => {
    if (limit === -1) return 'text-green-600' // Unlimited
    const percentage = (used / limit) * 100
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressVariant = (used: number, limit: number): 'default' | 'destructive' => {
    if (limit === -1) return 'default'
    const percentage = (used / limit) * 100
    return percentage >= 80 ? 'destructive' : 'default'
  }

  const calculatePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Usage Monitoring</h1>
            <p className="text-muted-foreground">Track resource usage across all clinics</p>
          </div>
          <Link href="/super-admin">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Global Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveUsers}</div>
              <p className="text-xs text-muted-foreground">Across all clinics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="w-4 h-4" />
                Storage Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStorage.toFixed(1)} GB</div>
              <p className="text-xs text-muted-foreground">Total storage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                API Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalApiCalls.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {clinicsWithWarnings}
              </div>
              <p className="text-xs text-muted-foreground">Clinics over 80%</p>
            </CardContent>
          </Card>
        </div>

        {/* Per-Clinic Usage */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Clinic Usage Details</h2>

          {usage.map((metrics) => (
            <Card key={metrics.clinicId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {metrics.clinicName}
                      {metrics.quotaWarnings.length > 0 && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {metrics.quotaWarnings.length} Warning
                          {metrics.quotaWarnings.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Clinic ID: {metrics.clinicId.substring(0, 8)}...
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quota Warnings */}
                {metrics.quotaWarnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                          Quota Warnings
                        </h4>
                        <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                          {metrics.quotaWarnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Active Users</span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${getUsageColor(
                        metrics.activeUsers,
                        metrics.totalUsers
                      )}`}
                    >
                      {metrics.activeUsers}{' '}
                      {metrics.totalUsers !== -1 && `/ ${metrics.totalUsers}`}
                    </span>
                  </div>
                  {metrics.totalUsers !== -1 && (
                    <Progress
                      value={calculatePercentage(metrics.activeUsers, metrics.totalUsers)}
                      className="h-2"
                    />
                  )}
                </div>

                {/* Storage Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Storage</span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${getUsageColor(
                        metrics.storageUsedGB,
                        metrics.storageLimit
                      )}`}
                    >
                      {metrics.storageUsedGB.toFixed(1)} GB / {metrics.storageLimit} GB
                    </span>
                  </div>
                  <Progress
                    value={calculatePercentage(metrics.storageUsedGB, metrics.storageLimit)}
                    className="h-2"
                  />
                </div>

                {/* Customers Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Customers This Month</span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${getUsageColor(
                        metrics.customersCount,
                        metrics.customersLimit
                      )}`}
                    >
                      {metrics.customersCount}
                      {metrics.customersLimit !== -1 && ` / ${metrics.customersLimit}`}
                    </span>
                  </div>
                  {metrics.customersLimit !== -1 && (
                    <Progress
                      value={calculatePercentage(metrics.customersCount, metrics.customersLimit)}
                      className="h-2"
                    />
                  )}
                </div>

                {/* Activity Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">API Calls</div>
                      <div className="text-lg font-semibold">
                        {metrics.apiCallsThisMonth.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">AI Analyses</div>
                      <div className="text-lg font-semibold">
                        {metrics.aiAnalysesThisMonth}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Bookings</div>
                      <div className="text-lg font-semibold">
                        {metrics.bookingsThisMonth}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {usage.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No usage data available
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
