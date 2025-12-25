// ============================================================================
// Phase 5: Clinic Admin Dashboard - Stats API
// Purpose: Get real-time dashboard statistics for clinic admin
// ============================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { canViewClinicAnalytics } from '@/lib/auth/clinic-permissions'
import type { 
  DashboardStats, 
  RevenueChartData, 
  GetDashboardStatsResponse,
  ActivityLog
} from '@/types/clinic-admin'

// ============================================================================
// Request Validation
// ============================================================================

const QuerySchema = z.object({
  days: z.coerce.number().min(1).max(90).optional().default(7),
})

// ============================================================================
// GET /api/clinic/dashboard/stats
// Get comprehensive dashboard statistics
// ============================================================================

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // ========================================================================
    // 1. Verify Authentication
    // ========================================================================
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ========================================================================
    // 2. Get User's Clinic ID
    // ========================================================================
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.clinic_id) {
      return NextResponse.json(
        { error: 'User not associated with any clinic' },
        { status: 403 }
      )
    }

    // Use canonical RBAC - only normalized roles for analytics
    if (!canViewClinicAnalytics(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const clinicId = userData.clinic_id

    // ========================================================================
    // 3. Parse Query Parameters
    // ========================================================================
    const { searchParams } = new URL(request.url)
    const validation = QuerySchema.safeParse({
      days: searchParams.get('days'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error },
        { status: 400 }
      )
    }

    const { days } = validation.data

    // ========================================================================
    // 4. Get Dashboard Stats (using database function)
    // ========================================================================
    const { data: stats, error: statsError } = await supabase
      .rpc('get_clinic_dashboard_stats', { p_clinic_id: clinicId })

    if (statsError) {
      console.error('Error fetching dashboard stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard stats' },
        { status: 500 }
      )
    }

    const dashboardStats = stats as DashboardStats

    // ========================================================================
    // 5. Get Revenue Chart Data (last N days)
    // ========================================================================
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data: revenueData, error: revenueError } = await supabase
      .from('booking_payments')
      .select('payment_date, amount')
      .eq('clinic_id', clinicId)
      .eq('payment_status', 'paid')
      .gte('payment_date', startDate.toISOString())
      .order('payment_date', { ascending: true })

    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError)
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500 }
      )
    }

    // Group revenue by date
    const revenueByDate: Record<string, { revenue: number; bookings: number }> = {}
    
    revenueData?.forEach((payment) => {
      const date = payment.payment_date.split('T')[0] // Get YYYY-MM-DD
      if (!revenueByDate[date]) {
        revenueByDate[date] = { revenue: 0, bookings: 0 }
      }
      revenueByDate[date].revenue += Number(payment.amount)
      revenueByDate[date].bookings += 1
    })

    // Fill in missing dates with zero values
    const revenueChart: RevenueChartData[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      revenueChart.push({
        date: dateStr,
        revenue: revenueByDate[dateStr]?.revenue || 0,
        bookings: revenueByDate[dateStr]?.bookings || 0,
      })
    }

    // ========================================================================
    // 6. Get Top Services
    // ========================================================================
    const { data: topServicesData, error: servicesError } = await supabase
      .from('appointments')
      .select('service_type, id')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('appointment_date', startDate.toISOString())

    if (servicesError) {
      console.error('Error fetching services data:', servicesError)
    }

    // Count bookings by service
    const serviceCount: Record<string, number> = {}
    topServicesData?.forEach((appointment) => {
      const service = appointment.service_type || 'Unknown'
      serviceCount[service] = (serviceCount[service] || 0) + 1
    })

    const topServices = Object.entries(serviceCount)
      .map(([service_name, booking_count]) => ({
        service_name,
        booking_count,
        total_revenue: 0, // Will be calculated if needed
      }))
      .sort((a, b) => b.booking_count - a.booking_count)
      .slice(0, 5) // Top 5

    // ========================================================================
    // 7. Get Recent Activity
    // ========================================================================
    const { data: recentActivity, error: activityError } = await supabase
      .rpc('get_clinic_recent_activity', {
        p_clinic_id: clinicId,
        p_limit: 10,
      })

    if (activityError) {
      console.error('Error fetching recent activity:', activityError)
    }

    // ========================================================================
    // 8. Return Response
    // ========================================================================
    const response: GetDashboardStatsResponse = {
      stats: dashboardStats,
      revenueChart,
      topServices,
      recentActivity: (recentActivity || []) as ActivityLog[],
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Unexpected error in dashboard stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Export route segment config
// ============================================================================
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
