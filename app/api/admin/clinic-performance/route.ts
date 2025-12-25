import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const metric = searchParams.get('metric') || 'all'

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

    // Fetch all clinics with their performance data
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select(`
        id,
        name,
        created_at,
        subscription_status,
        subscription_plan,
        appointments!inner(
          id,
          status,
          created_at,
          updated_at
        ),
        users!inner(
          id,
          role,
          created_at,
          last_sign_in_at
        )
      `)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Process performance metrics for each clinic
    const clinicPerformance = await Promise.all(
      clinics?.map(async (clinic: any) => {
        // Get appointments data
        const appointments = clinic.appointments || []
        const completedAppointments = appointments.filter((a: any) => a.status === 'completed')
        const cancelledAppointments = appointments.filter((a: any) => a.status === 'cancelled')
        const totalAppointments = appointments.length

        // Get users data (patients)
        const users = clinic.users || []
        const patients = users.filter((u: any) => u.role === 'customer')
        const staff = users.filter((u: any) => ['clinic_admin', 'staff'].includes(u.role))

        // Calculate metrics
        const completionRate = totalAppointments > 0 ? (completedAppointments.length / totalAppointments) * 100 : 0
        const cancellationRate = totalAppointments > 0 ? (cancelledAppointments.length / totalAppointments) * 100 : 0

        // Mock revenue data (would come from payments table)
        const revenuePerPatient = Math.random() * 5000 + 1000
        const totalRevenue = patients.length * revenuePerPatient
        const monthlyRevenue = totalRevenue / (daysBack / 30)

        // Mock satisfaction data (would come from reviews table)
        const averageRating = Math.random() * 2 + 3 // 3-5 range
        const totalReviews = Math.floor(Math.random() * 100) + 10

        // Calculate trends (mock data - would compare with previous period)
        const revenueGrowthRate = (Math.random() - 0.5) * 40 // -20% to +20%
        const patientGrowthRate = (Math.random() - 0.5) * 30 // -15% to +15%

        // Efficiency metrics
        const avgAppointmentDuration = 60 // minutes
        const patientsPerDay = Math.floor(Math.random() * 30) + 10
        const utilizationRate = (patientsPerDay / 50) * 100 // Assuming 50 is max capacity

        return {
          id: clinic.id,
          name: clinic.name,
          metrics: {
            patients: {
              total: patients.length,
              new: Math.floor(patients.length * 0.3),
              recurring: Math.floor(patients.length * 0.7),
              growthRate: patientGrowthRate,
            },
            revenue: {
              total: totalRevenue,
              monthly: monthlyRevenue,
              averagePerPatient: revenuePerPatient,
              growthRate: revenueGrowthRate,
            },
            appointments: {
              total: totalAppointments,
              completed: completedAppointments.length,
              cancelled: cancelledAppointments.length,
              noShow: Math.floor(totalAppointments * 0.05),
              completionRate,
            },
            satisfaction: {
              averageRating,
              totalReviews,
              responseRate: Math.random() * 30 + 70, // 70-100%
            },
            efficiency: {
              avgAppointmentDuration,
              patientsPerDay,
              utilizationRate,
            },
          },
          ranking: {
            overall: Math.floor(Math.random() * 100) + 1,
            patients: Math.floor(Math.random() * 100) + 1,
            revenue: Math.floor(Math.random() * 100) + 1,
            satisfaction: Math.floor(Math.random() * 100) + 1,
          },
          trend: {
            patients: revenueGrowthRate > 5 ? 'up' : revenueGrowthRate < -5 ? 'down' : 'stable',
            revenue: revenueGrowthRate > 5 ? 'up' : revenueGrowthRate < -5 ? 'down' : 'stable',
            satisfaction: averageRating > 4 ? 'up' : averageRating < 3.5 ? 'down' : 'stable',
          },
        }
      }) || []
    )

    // Sort clinics by overall ranking
    clinicPerformance.sort((a, b) => a.ranking.overall - b.ranking.overall)

    return NextResponse.json({
      clinics: clinicPerformance,
      period,
      totalClinics: clinicPerformance.length,
    })
  } catch (error) {
    console.error('Error fetching clinic performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinic performance' },
      { status: 500 }
    )
  }
}
