import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/clinic/analytics/treatments - Treatment popularity analysis
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

    // Fetch bookings
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, booking_date, treatment_type, payment_amount, payment_status, customer_name")
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)

    if (error) {
      console.error("Error fetching treatments data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by treatment type
    const treatmentStats: Record<
      string,
      {
        count: number
        revenue: number
        paidCount: number
        pendingCount: number
        customers: Set<string>
      }
    > = {}

    ;(bookings || []).forEach((booking) => {
      const treatment = booking.treatment_type || "Other"
      if (!treatmentStats[treatment]) {
        treatmentStats[treatment] = {
          count: 0,
          revenue: 0,
          paidCount: 0,
          pendingCount: 0,
          customers: new Set(),
        }
      }

      treatmentStats[treatment].count += 1
      if (booking.payment_status === "paid") {
        treatmentStats[treatment].revenue += booking.payment_amount || 0
        treatmentStats[treatment].paidCount += 1
      } else if (booking.payment_status === "pending") {
        treatmentStats[treatment].pendingCount += 1
      }
      if (booking.customer_name) {
        treatmentStats[treatment].customers.add(booking.customer_name)
      }
    })

    // Calculate totals
    const totalRevenue = Object.values(treatmentStats).reduce((sum, t) => sum + t.revenue, 0)
    const totalBookings = Object.values(treatmentStats).reduce((sum, t) => sum + t.count, 0)

    // Format data
    const treatmentData = Object.entries(treatmentStats)
      .map(([treatment, stats]) => ({
        treatment,
        bookings: stats.count,
        revenue: stats.revenue,
        paidCount: stats.paidCount,
        pendingCount: stats.pendingCount,
        uniqueCustomers: stats.customers.size,
        averagePrice: stats.paidCount > 0 ? stats.revenue / stats.paidCount : 0,
        revenuePercentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
        bookingPercentage: totalBookings > 0 ? (stats.count / totalBookings) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Get top 5 treatments
    const topTreatments = treatmentData.slice(0, 5)

    // Trend analysis (compare with previous period)
    const periodLength = new Date(endDate).getTime() - new Date(startDate).getTime()
    const previousStartDate = new Date(new Date(startDate).getTime() - periodLength).toISOString()

    const { data: previousBookings } = await supabase
      .from("bookings")
      .select("treatment_type, payment_amount, payment_status")
      .gte("booking_date", previousStartDate)
      .lt("booking_date", startDate)
      .eq("payment_status", "paid")

    const previousStats: Record<string, number> = {}
    ;(previousBookings || []).forEach((booking) => {
      const treatment = booking.treatment_type || "Other"
      previousStats[treatment] = (previousStats[treatment] || 0) + (booking.payment_amount || 0)
    })

    // Calculate growth rates
    const trendsData = treatmentData.map((item) => {
      const previousRevenue = previousStats[item.treatment] || 0
      const growthRate =
        previousRevenue > 0 ? ((item.revenue - previousRevenue) / previousRevenue) * 100 : item.revenue > 0 ? 100 : 0

      return {
        ...item,
        previousRevenue,
        growthRate,
      }
    })

    return NextResponse.json({
      summary: {
        totalTreatments: treatmentData.length,
        totalBookings,
        totalRevenue,
        averageRevenuePerTreatment: treatmentData.length > 0 ? totalRevenue / treatmentData.length : 0,
      },
      treatments: trendsData,
      topTreatments,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/clinic/analytics/treatments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
