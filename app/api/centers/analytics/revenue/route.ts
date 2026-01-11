import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/clinic/analytics/revenue - Revenue breakdown analysis
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

    // Fetch bookings with payment info
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, booking_date, payment_amount, payment_status, treatment_type, customer_name")
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)
      .order("booking_date", { ascending: true })

    if (error) {
      console.error("Error fetching revenue data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate metrics
    const paidBookings = (bookings || []).filter((b) => b.payment_status === "paid")
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.payment_amount || 0), 0)
    const totalBookings = bookings?.length || 0
    const paidCount = paidBookings.length
    const averageOrderValue = paidCount > 0 ? totalRevenue / paidCount : 0

    // Group by date
    const revenueByDate: Record<string, number> = {}
    paidBookings.forEach((booking) => {
      const date = new Date(booking.booking_date).toISOString().split("T")[0]
      revenueByDate[date] = (revenueByDate[date] || 0) + (booking.payment_amount || 0)
    })

    const chartData = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({
        date,
        revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Group by treatment type
    const revenueByTreatment: Record<string, { revenue: number; count: number }> = {}
    paidBookings.forEach((booking) => {
      const treatment = booking.treatment_type || "Other"
      if (!revenueByTreatment[treatment]) {
        revenueByTreatment[treatment] = { revenue: 0, count: 0 }
      }
      revenueByTreatment[treatment].revenue += booking.payment_amount || 0
      revenueByTreatment[treatment].count += 1
    })

    const treatmentBreakdown = Object.entries(revenueByTreatment)
      .map(([treatment, data]) => ({
        treatment,
        revenue: data.revenue,
        count: data.count,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Payment status breakdown
    const statusBreakdown = bookings?.reduce((acc: any, booking) => {
      const status = booking.payment_status || "unknown"
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 }
      }
      acc[status].count += 1
      acc[status].amount += booking.payment_amount || 0
      return acc
    }, {})

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalBookings,
        paidCount,
        pendingCount: (bookings || []).filter((b) => b.payment_status === "pending").length,
        averageOrderValue,
        conversionRate: totalBookings > 0 ? (paidCount / totalBookings) * 100 : 0,
      },
      chartData,
      treatmentBreakdown,
      statusBreakdown,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/clinic/analytics/revenue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
