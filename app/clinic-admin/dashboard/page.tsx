"use client"

// ============================================================================
// Phase 5: Clinic Admin Dashboard - Main Dashboard Page
// Purpose: Display comprehensive dashboard overview for clinic administrators
// ============================================================================

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import type { GetDashboardStatsResponse } from '@/types/clinic-admin'

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
            {Math.abs(trend.value)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Recent Activity Component
// ============================================================================

interface Activity {
  id: string
  action_type: string
  description: string | null
  created_at: string
  user?: {
    id: string
    name: string
    role: string
  }
}

function RecentActivity({ activities }: { activities: Activity[] }) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'booking_created':
        return <Calendar className="h-4 w-4" />
      case 'customer_added':
        return <Users className="h-4 w-4" />
      case 'payment_received':
        return <DollarSign className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in your clinic</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  {getActionIcon(activity.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {activity.description || activity.action_type}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>{activity.user?.name || 'System'}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTime(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Dashboard Component
// ============================================================================

export default function ClinicDashboardPage() {
  const [data, setData] = useState<GetDashboardStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartDays, setChartDays] = useState<7 | 30>(7)

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/clinic/dashboard/stats?days=${chartDays}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [chartDays])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error || 'Unknown error occurred'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { stats, revenueChart, topServices, recentActivity } = data

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your clinic today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Bookings Today"
          value={stats.bookings_today}
          description="Scheduled appointments"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard
          title="Active Customers"
          value={stats.active_customers}
          description="Total active customers"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Staff On Duty"
          value={stats.staff_on_duty}
          description="Available today"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatsCard
          title="Pending Analyses"
          value={stats.pending_analyses}
          description="Awaiting review"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Revenue Today"
          value={formatCurrency(stats.revenue_today)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Revenue This Week"
          value={formatCurrency(stats.revenue_this_week)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Revenue This Month"
          value={formatCurrency(stats.revenue_this_month)}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section */}
      <Tabs value={chartDays.toString()} onValueChange={(v) => setChartDays(Number(v) as 7 | 30)}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Revenue Overview</h2>
          <TabsList>
            <TabsTrigger value="7">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30">Last 30 Days</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={chartDays.toString()} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
              <CardDescription>Revenue and bookings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return formatCurrency(value)
                      return value
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('th-TH')}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Revenue (฿)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Bookings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>Most popular services this period</CardDescription>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No completed bookings yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topServices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="booking_count" fill="hsl(var(--primary))" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  )
}
