import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

// GET: Get usage metrics for all clinics or specific clinic
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

    // Get clinic ID from query params (optional)
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinicId')

    // Base query
    let clinicsQuery = supabase
      .from('clinics')
      .select(
        `
        id,
        name,
        slug,
        subscription_plan,
        subscription_status
      `
      )

    if (clinicId) {
      clinicsQuery = clinicsQuery.eq('id', clinicId)
    }

    const { data: clinics, error: clinicsError } = await clinicsQuery

    if (clinicsError) {
      console.error('Error fetching clinics:', clinicsError)
      return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 })
    }

    // Get usage metrics for each clinic
    const usagePromises = clinics.map(async (clinic) => {
      // Get subscription plan limits
      const planLimits = getPlanLimits(clinic.subscription_plan)

      // Count active users
      const { count: activeUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)

      // Count total users
      const { count: totalUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)

      // Count customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)

      // Count bookings this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)
        .gte('created_at', startOfMonth.toISOString())

      // Count AI analyses this month
      const { count: analysesCount } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)
        .gte('created_at', startOfMonth.toISOString())

      // Calculate storage used (mock for now - would need to query file storage)
      const storageUsedGB = Math.random() * planLimits.maxStorageGB * 0.7 // Mock data

      // Calculate API calls (mock for now - would need actual API logging)
      const apiCallsThisMonth = Math.floor(Math.random() * 10000) // Mock data

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
        clinicId: clinic.id,
        clinicName: clinic.name,
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
