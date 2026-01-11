import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/analytics - Get system-wide analytics data
 * Query params:
 *   - period: 'week' | 'month' | 'quarter' | 'year' (default: 'month')
 *   - metric: 'revenue' | 'users' | 'clinics' | 'all' (default: 'all')
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify super admin
    const { data: userData } = await supabase
      .from('users')
      .select('role, center_id')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const metric = searchParams.get('metric') || 'all' // centers, users, revenue

    // Calculate date range based on period
    const now = new Date()
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }
    const daysBack = ranges[period as keyof typeof ranges] || 30
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysBack)

    // 1. Revenue Analytics
    let revenueData = null
    if (metric === 'revenue' || metric === 'all') {
      // Get paid invoices grouped by month
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, paid_at, created_at')
        .eq('status', 'paid')
        .gte('paid_at', startDate.toISOString())
        .order('paid_at', { ascending: true })

      // Get subscription plans for MRR calculation
      const { data: centers } = await supabase
        .from('centers')
        .select('subscription_plan, subscription_status')
        .eq('subscription_status', 'active')

      const planPrices = {
        starter: 2900,
        professional: 9900,
        enterprise: 29900,
      }

      const monthlyRecurringRevenue = centers?.reduce((sum, center) => {
        const price = planPrices[center.subscription_plan as keyof typeof planPrices] || 0
        return sum + price
      }, 0) || 0

      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
      const averageInvoiceValue = invoices?.length ? totalRevenue / invoices.length : 0

      // Group revenue by month for chart
      const revenueByMonth = new Map<string, number>()
      invoices?.forEach((invoice) => {
        const date = new Date(invoice.paid_at || invoice.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        revenueByMonth.set(monthKey, (revenueByMonth.get(monthKey) || 0) + invoice.total)
      })

      const revenueTimeSeries = Array.from(revenueByMonth.entries())
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month))

      revenueData = {
        totalRevenue,
        monthlyRecurringRevenue,
        averageInvoiceValue,
        paidInvoicesCount: invoices?.length || 0,
        timeSeries: revenueTimeSeries,
      }
    }

    // 2. Center Analytics
    let centerData = null
    if (metric === 'centers' || metric === 'clinics' || metric === 'all') {
      const { data: allCenters } = await supabase
        .from('centers')
        .select('id, created_at, subscription_status, subscription_plan')
        .order('created_at', { ascending: true })

      const activeCenters = allCenters?.filter((c) => c.subscription_status === 'active').length || 0
      const trialCenters = allCenters?.filter((c) => c.subscription_status === 'trial').length || 0
      const suspendedCenters = allCenters?.filter((c) => c.subscription_status === 'suspended').length || 0
      const cancelledCenters = allCenters?.filter((c) => c.subscription_status === 'cancelled').length || 0

      // Growth over time
      const centersInPeriod = allCenters?.filter((c) => new Date(c.created_at) >= startDate) || []
      
      // Group by month
      const centersByMonth = new Map<string, number>()
      allCenters?.forEach((center) => {
        const date = new Date(center.created_at)
        if (date >= startDate) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          centersByMonth.set(monthKey, (centersByMonth.get(monthKey) || 0) + 1)
        }
      })

      const centerGrowthTimeSeries = Array.from(centersByMonth.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))

      // Plan distribution
      const planDistribution = {
        starter: allCenters?.filter((c) => c.subscription_plan === 'starter').length || 0,
        professional: allCenters?.filter((c) => c.subscription_plan === 'professional').length || 0,
        enterprise: allCenters?.filter((c) => c.subscription_plan === 'enterprise').length || 0,
      }

      // Churn rate calculation (cancelled in period / total at start)
      const cancelledInPeriod = allCenters?.filter(
        (c) => c.subscription_status === 'cancelled'
      ).length || 0
      const totalCenters = allCenters?.length || 1
      const churnRate = ((cancelledInPeriod / totalCenters) * 100).toFixed(2)

      centerData = {
        total: allCenters?.length || 0,
        active: activeCenters,
        trial: trialCenters,
        suspended: suspendedCenters,
        cancelled: cancelledCenters,
        newInPeriod: centersInPeriod.length,
        churnRate: parseFloat(churnRate),
        planDistribution,
        growthTimeSeries: centerGrowthTimeSeries,
      }
    }

    // 3. User Analytics
    let userAnalyticsData = null
    if (metric === 'users' || metric === 'all') {
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, created_at, role, center_id')
        .order('created_at', { ascending: true })

      const totalUsers = allUsers?.length || 0
      const usersInPeriod = allUsers?.filter((u) => new Date(u.created_at) >= startDate) || []

      // Role distribution
      const roleDistribution = {
        super_admin: allUsers?.filter((u) => u.role === 'super_admin').length || 0,
        center_admin: allUsers?.filter((u) => u.role === 'center_admin' || u.role === 'clinic_admin').length || 0,
        staff: allUsers?.filter((u) => u.role === 'staff').length || 0,
        customer: allUsers?.filter((u) => u.role === 'customer').length || 0,
      }

      // Growth over time
      const usersByMonth = new Map<string, number>()
      allUsers?.forEach((user) => {
        const date = new Date(user.created_at)
        if (date >= startDate) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          usersByMonth.set(monthKey, (usersByMonth.get(monthKey) || 0) + 1)
        }
      })

      const userGrowthTimeSeries = Array.from(usersByMonth.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))

      userAnalyticsData = {
        total: totalUsers,
        newInPeriod: usersInPeriod.length,
        roleDistribution,
        growthTimeSeries: userGrowthTimeSeries,
      }
    }

    // 4. System Health & Activity
    let systemData = null
    if (metric === 'all') {
      // Get recent activity
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())

      const { data: recentAnalyses } = await supabase
        .from('analyses')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())

      const { data: recentCustomers } = await supabase
        .from('customers')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())

      // Feature usage statistics
      const bookingsCount = recentBookings?.length || 0
      const analysesCount = recentAnalyses?.length || 0
      const customersCount = recentCustomers?.length || 0

      // Average per center
      const centersCount = centerData?.active || 1
      const avgBookingsPerCenter = (bookingsCount / centersCount).toFixed(1)
      const avgAnalysesPerCenter = (analysesCount / centersCount).toFixed(1)
      const avgCustomersPerCenter = (customersCount / centersCount).toFixed(1)

      systemData = {
        featureUsage: {
          bookings: bookingsCount,
          analyses: analysesCount,
          customers: customersCount,
        },
        averages: {
          bookingsPerCenter: parseFloat(avgBookingsPerCenter),
          analysesPerCenter: parseFloat(avgAnalysesPerCenter),
          customersPerCenter: parseFloat(avgCustomersPerCenter),
        },
      }
    }

    // 5. Popular Features (most used)
    let popularFeatures = null
    if (metric === 'all') {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .gte('created_at', startDate.toISOString())

      const { data: analyses } = await supabase
        .from('analyses')
        .select('id')
        .gte('created_at', startDate.toISOString())

      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .gte('created_at', startDate.toISOString())

      const features = [
        { name: 'Bookings', count: bookings?.length || 0 },
        { name: 'AI Analyses', count: analyses?.length || 0 },
        { name: 'Customers', count: customers?.length || 0 },
      ].sort((a, b) => b.count - a.count)

      popularFeatures = features
    }

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      revenue: revenueData,
      centers: centerData,
      users: userAnalyticsData,
      system: systemData,
      popularFeatures,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
