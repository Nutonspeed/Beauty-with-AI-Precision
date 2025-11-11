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
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const metric = searchParams.get('metric') || 'all'

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
      const { data: clinics } = await supabase
        .from('clinics')
        .select('subscription_plan, subscription_status')
        .eq('subscription_status', 'active')

      const planPrices = {
        starter: 2900,
        professional: 9900,
        enterprise: 29900,
      }

      const monthlyRecurringRevenue = clinics?.reduce((sum, clinic) => {
        const price = planPrices[clinic.subscription_plan as keyof typeof planPrices] || 0
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

    // 2. Clinic Analytics
    let clinicData = null
    if (metric === 'clinics' || metric === 'all') {
      const { data: allClinics } = await supabase
        .from('clinics')
        .select('id, created_at, subscription_status, subscription_plan')
        .order('created_at', { ascending: true })

      const activeClinics = allClinics?.filter((c) => c.subscription_status === 'active').length || 0
      const trialClinics = allClinics?.filter((c) => c.subscription_status === 'trial').length || 0
      const suspendedClinics = allClinics?.filter((c) => c.subscription_status === 'suspended').length || 0
      const cancelledClinics = allClinics?.filter((c) => c.subscription_status === 'cancelled').length || 0

      // Growth over time
      const clinicsInPeriod = allClinics?.filter((c) => new Date(c.created_at) >= startDate) || []
      
      // Group by month
      const clinicsByMonth = new Map<string, number>()
      allClinics?.forEach((clinic) => {
        const date = new Date(clinic.created_at)
        if (date >= startDate) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          clinicsByMonth.set(monthKey, (clinicsByMonth.get(monthKey) || 0) + 1)
        }
      })

      const clinicGrowthTimeSeries = Array.from(clinicsByMonth.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))

      // Plan distribution
      const planDistribution = {
        starter: allClinics?.filter((c) => c.subscription_plan === 'starter').length || 0,
        professional: allClinics?.filter((c) => c.subscription_plan === 'professional').length || 0,
        enterprise: allClinics?.filter((c) => c.subscription_plan === 'enterprise').length || 0,
      }

      // Churn rate calculation (cancelled in period / total at start)
      const cancelledInPeriod = allClinics?.filter(
        (c) => c.subscription_status === 'cancelled'
      ).length || 0
      const totalClinics = allClinics?.length || 1
      const churnRate = ((cancelledInPeriod / totalClinics) * 100).toFixed(2)

      clinicData = {
        total: allClinics?.length || 0,
        active: activeClinics,
        trial: trialClinics,
        suspended: suspendedClinics,
        cancelled: cancelledClinics,
        newInPeriod: clinicsInPeriod.length,
        churnRate: parseFloat(churnRate),
        planDistribution,
        growthTimeSeries: clinicGrowthTimeSeries,
      }
    }

    // 3. User Analytics
    let userAnalyticsData = null
    if (metric === 'users' || metric === 'all') {
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, created_at, role, clinic_id')
        .order('created_at', { ascending: true })

      const totalUsers = allUsers?.length || 0
      const usersInPeriod = allUsers?.filter((u) => new Date(u.created_at) >= startDate) || []

      // Role distribution
      const roleDistribution = {
        super_admin: allUsers?.filter((u) => u.role === 'super_admin').length || 0,
        clinic_admin: allUsers?.filter((u) => u.role === 'clinic_admin').length || 0,
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

      // Average per clinic
      const clinicsCount = clinicData?.active || 1
      const avgBookingsPerClinic = (bookingsCount / clinicsCount).toFixed(1)
      const avgAnalysesPerClinic = (analysesCount / clinicsCount).toFixed(1)
      const avgCustomersPerClinic = (customersCount / clinicsCount).toFixed(1)

      systemData = {
        featureUsage: {
          bookings: bookingsCount,
          analyses: analysesCount,
          customers: customersCount,
        },
        averages: {
          bookingsPerClinic: parseFloat(avgBookingsPerClinic),
          analysesPerClinic: parseFloat(avgAnalysesPerClinic),
          customersPerClinic: parseFloat(avgCustomersPerClinic),
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
      clinics: clinicData,
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
