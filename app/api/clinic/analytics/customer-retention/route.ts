import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/clinic/analytics/customer-retention - Customer retention analysis
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

    // Fetch all customers
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id, name, email, created_at, lead_status")
      .order("created_at", { ascending: true })

    if (customersError) {
      console.error("Error fetching customers:", customersError)
      return NextResponse.json({ error: customersError.message }, { status: 500 })
    }

    // Fetch all bookings
    const { data: allBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, customer_id, customer_name, booking_date, payment_amount, payment_status")
      .order("booking_date", { ascending: true })

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
      return NextResponse.json({ error: bookingsError.message }, { status: 500 })
    }

    // Calculate customer lifetime value
    const customerBookings: Record<string, any[]> = {}
    ;(allBookings || []).forEach((booking) => {
      const customerId = booking.customer_id || booking.customer_name
      if (!customerId) return

      if (!customerBookings[customerId]) {
        customerBookings[customerId] = []
      }
      customerBookings[customerId].push(booking)
    })

    const customerMetrics = Object.entries(customerBookings).map(([customerId, bookings]) => {
      const paidBookings = bookings.filter((b) => b.payment_status === "paid")
      const totalValue = paidBookings.reduce((sum, b) => sum + (b.payment_amount || 0), 0)
      const totalBookings = bookings.length
      const firstBooking = bookings[0]
      const lastBooking = bookings[bookings.length - 1]

      const daysSinceFirst = firstBooking
        ? Math.floor((new Date().getTime() - new Date(firstBooking.booking_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      return {
        customerId,
        totalValue,
        totalBookings,
        paidBookings: paidBookings.length,
        averageOrderValue: paidBookings.length > 0 ? totalValue / paidBookings.length : 0,
        firstBookingDate: firstBooking?.booking_date,
        lastBookingDate: lastBooking?.booking_date,
        daysSinceFirstBooking: daysSinceFirst,
        isRepeat: totalBookings > 1,
      }
    })

    // Calculate retention metrics
    const totalCustomersWithBookings = customerMetrics.length
    const repeatCustomers = customerMetrics.filter((c) => c.isRepeat).length
    const retentionRate = totalCustomersWithBookings > 0 ? (repeatCustomers / totalCustomersWithBookings) * 100 : 0

    const totalLifetimeValue = customerMetrics.reduce((sum, c) => sum + c.totalValue, 0)
    const averageLifetimeValue = totalCustomersWithBookings > 0 ? totalLifetimeValue / totalCustomersWithBookings : 0

    // Segment by booking frequency
    const oneTimeCustomers = customerMetrics.filter((c) => c.totalBookings === 1).length
    const twoToFiveBookings = customerMetrics.filter((c) => c.totalBookings >= 2 && c.totalBookings <= 5).length
    const moreThanFiveBookings = customerMetrics.filter((c) => c.totalBookings > 5).length

    // Top customers by value
    const topCustomers = customerMetrics
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
      .map((c) => ({
        ...c,
        customerName:
          (customers || []).find((cust) => cust.id === c.customerId || cust.name === c.customerId)?.name ||
          c.customerId,
      }))

    // New customers in period
    const newCustomersInPeriod = (customers || []).filter((c) => {
      const createdAt = new Date(c.created_at)
      return createdAt >= new Date(startDate) && createdAt <= new Date(endDate)
    })

    // Churn analysis (customers who haven't booked in 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const churnedCustomers = customerMetrics.filter((c) => {
      if (!c.lastBookingDate) return false
      return new Date(c.lastBookingDate) < ninetyDaysAgo
    })

    return NextResponse.json({
      summary: {
        totalCustomers: (customers || []).length,
        customersWithBookings: totalCustomersWithBookings,
        repeatCustomers,
        retentionRate,
        averageLifetimeValue,
        newCustomersInPeriod: newCustomersInPeriod.length,
        churnedCustomers: churnedCustomers.length,
        churnRate: totalCustomersWithBookings > 0 ? (churnedCustomers.length / totalCustomersWithBookings) * 100 : 0,
      },
      segments: {
        oneTime: oneTimeCustomers,
        twoToFive: twoToFiveBookings,
        moreThanFive: moreThanFiveBookings,
      },
      topCustomers,
      customerMetrics: customerMetrics.sort((a, b) => b.totalValue - a.totalValue).slice(0, 50),
      dateRange: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/clinic/analytics/customer-retention:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
