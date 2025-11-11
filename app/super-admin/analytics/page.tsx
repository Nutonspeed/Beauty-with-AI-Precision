'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Target,
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  period: string
  dateRange: {
    start: string
    end: string
  }
  revenue: {
    totalRevenue: number
    monthlyRecurringRevenue: number
    averageInvoiceValue: number
    paidInvoicesCount: number
    timeSeries: Array<{ month: string; total: number }>
  }
  clinics: {
    total: number
    active: number
    trial: number
    suspended: number
    cancelled: number
    newInPeriod: number
    churnRate: number
    planDistribution: {
      starter: number
      professional: number
      enterprise: number
    }
    growthTimeSeries: Array<{ month: string; count: number }>
  }
  users: {
    total: number
    newInPeriod: number
    roleDistribution: {
      super_admin: number
      clinic_admin: number
      staff: number
      customer: number
    }
    growthTimeSeries: Array<{ month: string; count: number }>
  }
  system: {
    featureUsage: {
      bookings: number
      analyses: number
      customers: number
    }
    averages: {
      bookingsPerClinic: number
      analysesPerClinic: number
      customersPerClinic: number
    }
  }
  popularFeatures: Array<{ name: string; count: number }>
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<string>('month')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role !== 'super_admin') {
      router.push('/customer/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/analytics?period=${period}`)
        
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          toast({
            title: '❌ Error',
            description: 'Failed to load analytics data',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
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
      loadAnalytics()
    }
  }, [user, period, toast])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading analytics...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'super_admin' || !analytics) {
    return null
  }

  const formatCurrency = (amount: number) => `฿${amount.toLocaleString()}`
  const formatPercent = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-primary" />
              System Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/super-admin">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.revenue.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.revenue.paidInvoicesCount} paid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(analytics.revenue.monthlyRecurringRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Active Clinics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.clinics.active}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.clinics.newInPeriod} new this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.users.total}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.users.newInPeriod} new this period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analytics */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Revenue Overview
              </CardTitle>
              <CardDescription>Financial performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.revenue.totalRevenue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Monthly Recurring Revenue
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analytics.revenue.monthlyRecurringRevenue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Average Invoice Value</div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(analytics.revenue.averageInvoiceValue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Paid Invoices</div>
                  <div className="text-xl font-semibold">
                    {analytics.revenue.paidInvoicesCount}
                  </div>
                </div>
              </div>

              {/* Simple Revenue Chart */}
              {analytics.revenue.timeSeries.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium mb-3">Revenue Trend</div>
                  <div className="space-y-2">
                    {analytics.revenue.timeSeries.slice(-6).map((item) => {
                      const maxRevenue = Math.max(
                        ...analytics.revenue.timeSeries.map((i) => i.total)
                      )
                      const percentage = (item.total / maxRevenue) * 100

                      return (
                        <div key={item.month}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{item.month}</span>
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Clinic Analytics
              </CardTitle>
              <CardDescription>Clinic growth and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Clinics</div>
                    <div className="text-2xl font-bold">{analytics.clinics.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Active</div>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.clinics.active}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Trial</div>
                    <div className="text-xl font-semibold text-yellow-600">
                      {analytics.clinics.trial}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Churn Rate</div>
                    <div className="text-xl font-semibold text-red-600">
                      {formatPercent(analytics.clinics.churnRate)}
                    </div>
                  </div>
                </div>

                {/* Plan Distribution */}
                <div className="mt-6">
                  <div className="text-sm font-medium mb-3">Plan Distribution</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Starter</span>
                        <span className="font-medium">
                          {analytics.clinics.planDistribution.starter}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (analytics.clinics.planDistribution.starter /
                                analytics.clinics.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Professional</span>
                        <span className="font-medium">
                          {analytics.clinics.planDistribution.professional}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (analytics.clinics.planDistribution.professional /
                                analytics.clinics.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Enterprise</span>
                        <span className="font-medium">
                          {analytics.clinics.planDistribution.enterprise}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (analytics.clinics.planDistribution.enterprise /
                                analytics.clinics.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinic Growth */}
                {analytics.clinics.growthTimeSeries.length > 0 && (
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-3">Clinic Growth</div>
                    <div className="space-y-2">
                      {analytics.clinics.growthTimeSeries.slice(-4).map((item) => (
                        <div key={item.month} className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground flex-1">
                            {item.month}
                          </span>
                          <span className="text-sm font-medium">+{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User & System Analytics */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                User Analytics
              </CardTitle>
              <CardDescription>User growth and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Users</div>
                    <div className="text-2xl font-bold">{analytics.users.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">New This Period</div>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.users.newInPeriod}
                    </div>
                  </div>
                </div>

                {/* Role Distribution */}
                <div className="mt-6">
                  <div className="text-sm font-medium mb-3">Role Distribution</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Super Admin</div>
                      <div className="text-lg font-semibold">
                        {analytics.users.roleDistribution.super_admin}
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Clinic Admin</div>
                      <div className="text-lg font-semibold">
                        {analytics.users.roleDistribution.clinic_admin}
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Staff</div>
                      <div className="text-lg font-semibold">
                        {analytics.users.roleDistribution.staff}
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Customer</div>
                      <div className="text-lg font-semibold">
                        {analytics.users.roleDistribution.customer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Growth */}
                {analytics.users.growthTimeSeries.length > 0 && (
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-3">User Growth Trend</div>
                    <div className="space-y-2">
                      {analytics.users.growthTimeSeries.slice(-5).map((item) => {
                        const maxUsers = Math.max(
                          ...analytics.users.growthTimeSeries.map((i) => i.count)
                        )
                        const percentage = (item.count / maxUsers) * 100

                        return (
                          <div key={item.month}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{item.month}</span>
                              <span className="font-medium">+{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                System Activity
              </CardTitle>
              <CardDescription>Feature usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-3">Feature Usage</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.system.featureUsage.bookings}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Bookings</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.system.featureUsage.analyses}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">AI Analyses</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.system.featureUsage.customers}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Customers</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">Average Per Clinic</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bookings</span>
                      <span className="text-lg font-semibold">
                        {analytics.system.averages.bookingsPerClinic}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">AI Analyses</span>
                      <span className="text-lg font-semibold">
                        {analytics.system.averages.analysesPerClinic}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Customers</span>
                      <span className="text-lg font-semibold">
                        {analytics.system.averages.customersPerClinic}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Popular Features */}
                {analytics.popularFeatures && (
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Most Popular Features
                    </div>
                    <div className="space-y-2">
                      {analytics.popularFeatures.map((feature, index) => {
                        const maxCount = analytics.popularFeatures[0]?.count || 1
                        const percentage = (feature.count / maxCount) * 100

                        return (
                          <div key={feature.name}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="flex items-center gap-1">
                                <span className="text-lg">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </span>
                                {feature.name}
                              </span>
                              <span className="font-medium">{feature.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  index === 0
                                    ? 'bg-amber-500'
                                    : index === 1
                                    ? 'bg-gray-400'
                                    : 'bg-orange-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to other admin sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/super-admin/subscriptions">
                <Button variant="outline" className="w-full">
                  <Building2 className="w-4 h-4 mr-2" />
                  Subscriptions
                </Button>
              </Link>
              <Link href="/super-admin/usage">
                <Button variant="outline" className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  Usage
                </Button>
              </Link>
              <Link href="/super-admin/billing">
                <Button variant="outline" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Billing
                </Button>
              </Link>
              <Link href="/super-admin">
                <Button variant="outline" className="w-full">
                  <PieChart className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
