import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/clinic/analytics/staff-performance - Staff performance metrics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get("end_date") || new Date().toISOString()

    // Fetch active staff
    const { data: staff, error: staffError } = await supabase
      .from("clinic_staff")
      .select("id, full_name, role, rating, total_appointments, total_patients, email")
      .eq("status", "active")

    if (staffError) {
      console.error("Error fetching staff:", staffError)
      return NextResponse.json({ error: staffError.message }, { status: 500 })
    }

    // For each staff member, fetch their bookings in the date range
    const staffPerformance = await Promise.all(
      (staff || []).map(async (member) => {
        // Note: This assumes bookings have a staff_id or provider_id field
        // Adjust the query based on your actual schema
        const { data: bookings } = await supabase
          .from("bookings")
          .select("id, booking_date, payment_amount, payment_status, treatment_type")
          .gte("booking_date", startDate)
          .lte("booking_date", endDate)
        // .eq('staff_id', member.id) // Uncomment if you have staff_id in bookings

        // Calculate metrics (using total_appointments as fallback)
        const appointmentsInPeriod = bookings?.length || 0
        const revenue = (bookings || [])
          .filter((b) => b.payment_status === "paid")
          .reduce((sum, b) => sum + (b.payment_amount || 0), 0)

        return {
          id: member.id,
          name: member.full_name,
          role: member.role,
          rating: member.rating || 0,
          appointments: appointmentsInPeriod,
          totalAppointments: member.total_appointments || 0,
          totalPatients: member.total_patients || 0,
          revenue,
          averageRevenuePerAppointment: appointmentsInPeriod > 0 ? revenue / appointmentsInPeriod : 0,
          email: member.email,
        }
      })
    )

    // Sort by revenue
    const sortedPerformance = staffPerformance.sort((a, b) => b.revenue - a.revenue)

    // Calculate totals
    const totalRevenue = staffPerformance.reduce((sum, s) => sum + s.revenue, 0)
    const totalAppointments = staffPerformance.reduce((sum, s) => sum + s.appointments, 0)

    // Top performers
    const topPerformers = sortedPerformance.slice(0, 5)

    // Role-based breakdown
    const roleStats: Record<string, { count: number; revenue: number; appointments: number }> = {}
    staffPerformance.forEach((member) => {
      if (!roleStats[member.role]) {
        roleStats[member.role] = { count: 0, revenue: 0, appointments: 0 }
      }
      roleStats[member.role].count += 1
      roleStats[member.role].revenue += member.revenue
      roleStats[member.role].appointments += member.appointments
    })

    const roleBreakdown = Object.entries(roleStats).map(([role, stats]) => ({
      role,
      staffCount: stats.count,
      totalRevenue: stats.revenue,
      totalAppointments: stats.appointments,
      averageRevenuePerStaff: stats.count > 0 ? stats.revenue / stats.count : 0,
      averageAppointmentsPerStaff: stats.count > 0 ? stats.appointments / stats.count : 0,
    }))

    return NextResponse.json({
      summary: {
        totalStaff: staffPerformance.length,
        totalRevenue,
        totalAppointments,
        averageRevenuePerStaff: staffPerformance.length > 0 ? totalRevenue / staffPerformance.length : 0,
        averageAppointmentsPerStaff: staffPerformance.length > 0 ? totalAppointments / staffPerformance.length : 0,
      },
      staffPerformance: sortedPerformance,
      topPerformers,
      roleBreakdown,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/clinic/analytics/staff-performance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
