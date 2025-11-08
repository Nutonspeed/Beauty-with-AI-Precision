import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access (admin, clinic_staff, sales_staff)
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!["admin", "clinic_staff", "sales_staff"].includes(userProfile?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "month" // month, quarter, year

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case "month":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case "quarter":
        startDate = subMonths(now, 3)
        break
      case "year":
        startDate = subMonths(now, 12)
        break
      default:
        startDate = startOfMonth(now)
    }

    // Fetch bookings data
    const { data: bookings, count: totalBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact" })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    // Fetch revenue data
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, currency, created_at")
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

    // Fetch new customers
    const { count: newCustomers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    // Fetch AI analyses
    const { count: totalAnalyses } = await supabase
      .from("skin_analyses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    // Calculate conversion rate
    const { count: completedBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    const conversionRate = totalBookings ? Math.round(((completedBookings || 0) / totalBookings) * 100) : 0

    // Treatment type breakdown
    const treatmentBreakdown = bookings?.reduce(
      (acc, booking) => {
        const type = booking.treatment_type
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Daily revenue trend (last 30 days)
    const dailyRevenue = payments?.reduce(
      (acc, payment) => {
        const date = format(new Date(payment.created_at), "yyyy-MM-dd")
        acc[date] = (acc[date] || 0) + payment.amount
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      success: true,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      metrics: {
        totalBookings: totalBookings || 0,
        totalRevenue: totalRevenue / 100, // Convert from cents
        newCustomers: newCustomers || 0,
        totalAnalyses: totalAnalyses || 0,
        conversionRate,
      },
      breakdown: {
        treatments: treatmentBreakdown,
        dailyRevenue,
      },
    })
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json(
      { error: "Failed to fetch report", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
