import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UsageMetrics {
  centerId: string
  centerName: string
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

// GET: Get usage metrics for all centers or specific center
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get center ID from query params (optional)
    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('centerId')

    // Base query
    let centersQuery = supabase
      .from('centers')
      .select(
        `
        id,
        name,
        slug,
        subscription_plan,
        subscription_status
      `
      )

    if (centerId) {
      centersQuery = centersQuery.eq('id', centerId)
    }

    const { data: centers, error: centersError } = await centersQuery

    if (centersError) {
      console.error('Error fetching centers:', centersError)
      return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 })
    }

    // Get usage metrics for each center
    const usagePromises = centers.map(async (center) => {
      // Get subscription plan limits
      const planLimits = getPlanLimits(center.subscription_plan)

      // Count active users
      const { count: activeUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', center.id)
        .eq('is_active', true)

      // Count total users
      const { count: totalUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', center.id)

      // Count customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', center.id)

      // Count bookings this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', center.id)
        .gte('created_at', startOfMonth.toISOString())

      // Count AI analyses this month (from skin_analyses table)
      const { count: analysesCount } = await supabase
        .from('skin_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', center.id)
        .gte('created_at', startOfMonth.toISOString())

      // Calculate storage used from program_photos (real data)
      const { data: photoSizes } = await supabase
        .from('program_photos')
        .select('file_size_kb')
        .eq('center_id', center.id)
        .not('file_size_kb', 'is', null)

      const totalStorageKB = photoSizes?.reduce((sum, p) => sum + (p.file_size_kb || 0), 0) || 0
      const storageUsedGB = totalStorageKB / (1024 * 1024) // Convert KB to GB

      // Calculate API calls from activity (analyses + bookings + customer updates this month)
      const { count: skinAnalysesTotal } = await supabase
        .from('skin_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', center.id)
        .gte('created_at', startOfMonth.toISOString())

      // Each analysis = ~5 API calls, each booking = ~3 API calls, base activity
      const apiCallsThisMonth = ((skinAnalysesTotal || 0) * 5) + ((bookingsCount || 0) * 3) + ((customersCount || 0) * 2)

      // Check quota warnings
      const quotaWarnings: string[] = []
      
      if (activeUsersCount && planLimits.maxUsers !== -1 && activeUsersCount >= planLimits.maxUsers * 0.8) {
        quotaWarnings.push(`Users: ${activeUsersCount}/${planLimits.maxUsers} (${Math.round((activeUsersCount / planLimits.maxUsers) * 100)}%)`)
      }

      if (customersCount && planLimits.maxCustomersPerMonth !== -1 && customersCount >= planLimits.maxCustomersPerMonth * 0.8) {
        quotaWarnings.push(`Customers: ${customersCount}/${planLimits.maxCustomersPerMonth} (${Math.round((customersCount / planLimits.maxCustomersPerMonth) * 100)}%)`)
      }

      if (storageUsedGB >= planLimits.maxStorageGB * 0.8) {
        quotaWarnings.push(`Storage: ${storageUsedGB.toFixed(1)}/${planLimits.maxStorageGB} GB (${Math.round((storageUsedGB / planLimits.maxStorageGB) * 100)}%)`)
      }

      return {
        centerId: center.id,
        centerName: center.name,
        activeUsers: activeUsersCount || 0,
        totalUsers: totalUsersCount || 0,
        storageUsedGB: parseFloat(storageUsedGB.toFixed(2)),
        storageLimit: planLimits.maxStorageGB,
        apiCallsThisMonth,
        aiAnalysesThisMonth: analysesCount || 0,
        customersCount: customersCount || 0,
        customersLimit: planLimits.maxCustomersPerMonth,
        bookingsThisMonth: bookingsCount || 0,
        quotaWarnings,
      } as UsageMetrics
    })

    const usage = await Promise.all(usagePromises)

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Error in GET /api/admin/usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getPlanLimits(plan: string) {
  const limits = {
    starter: {
      maxUsers: 5,
      maxCustomersPerMonth: 100,
      maxStorageGB: 10,
    },
    professional: {
      maxUsers: 20,
      maxCustomersPerMonth: -1, // unlimited
      maxStorageGB: 50,
    },
    enterprise: {
      maxUsers: -1, // unlimited
      maxCustomersPerMonth: -1, // unlimited
      maxStorageGB: 200,
    },
  }

  return limits[plan as keyof typeof limits] || limits.starter
}
