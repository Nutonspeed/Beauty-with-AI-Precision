import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Helper function to format date for Supabase
const toISOStringLocal = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000 // Offset in milliseconds
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's clinic_id and role
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single()

    if (userErr) {
      console.error('[clinic/revenue] Failed to fetch user:', userErr)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    if (!userData || (userData.role !== "clinic_owner" && userData.role !== "clinic_staff")) {
      return NextResponse.json({ error: "Forbidden - Clinic access required" }, { status: 403 })
    }

    const clinicId = userData.clinic_id

    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 })
    }

    // Get date ranges
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    // Get all relevant bookings
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("booking_date, price, status")
      .eq("clinic_id", clinicId)
      .gte("booking_date", toISOStringLocal(thirtyDaysAgo))
      .in("status", ["confirmed", "completed"])
      .order("booking_date", { ascending: true })

    if (error) throw error

    // Process booking data
    let totalRevenue = 0
    let todayRevenue = 0
    let yesterdayRevenue = 0
    let monthlyRevenue = 0
    const revenueByDate = new Map<string, number>()
    const serviceRevenue = new Map<string, number>()

    // Define types for better type safety
    type BookingService = {
      service: {
        name: string
      }
    }

    // Process each booking
    bookings?.forEach((booking: any) => {
      const bookingDate = new Date(booking.booking_date)
      const bookingAmount = Number(booking.price) || 0
      
      // Calculate revenue by date
      const dateStr = booking.booking_date.split('T')[0]
      revenueByDate.set(dateStr, (revenueByDate.get(dateStr) || 0) + bookingAmount)
      
      // Calculate service-wise revenue
      if (booking.services && Array.isArray(booking.services)) {
        (booking.services as BookingService[]).forEach(({ service }) => {
          if (service?.name) {
            serviceRevenue.set(
              service.name,
              (serviceRevenue.get(service.name) || 0) + bookingAmount
            )
          }
        })
      }
      
      // Calculate period-based revenue
      totalRevenue += bookingAmount
      
      if (bookingDate >= today) {
        todayRevenue += bookingAmount
      }
      
      if (bookingDate >= new Date(bookingDate.getFullYear(), bookingDate.getMonth(), 1)) {
        monthlyRevenue += bookingAmount
      }
      
      if (bookingDate >= yesterday && bookingDate < today) {
        yesterdayRevenue += bookingAmount
      }
    })

    // Convert to array format for chart
    const chartData = Array.from(revenueByDate.entries())
      .map(([date, revenue]) => ({
        date,
        revenue: Number(revenue.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Get top performing services
    const topServices = Array.from(serviceRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({
        name,
        revenue: Number(revenue.toFixed(2))
      }))

    // Calculate metrics
    const revenueChange = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : todayRevenue > 0 ? 100 : 0
      
    const monthlyTarget = 1500000 // 1.5M THB monthly target
    const monthlyProgress = Math.min((monthlyRevenue / monthlyTarget) * 100, 100)

    return NextResponse.json({
      // Chart data for visualization
      chartData,
      
      // Summary metrics
      summary: {
        current: {
          today: Number(todayRevenue.toFixed(2)),
          yesterday: Number(yesterdayRevenue.toFixed(2)),
          monthly: Number(monthlyRevenue.toFixed(2)),
          total: Number(totalRevenue.toFixed(2)),
        },
        change: {
          daily: Number(revenueChange.toFixed(1)),
          monthly: 0, // Would need last month's data to calculate
        },
        targets: {
          daily: 50000, // 50K THB daily target
          monthly: monthlyTarget,
          monthlyProgress: Number(monthlyProgress.toFixed(1)),
        },
        topServices,
        daysTracked: revenueByDate.size,
      },
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      timezone: 'Asia/Bangkok'
    })
  } catch (error) {
    console.error("[v0] Error fetching revenue data:", error)
    return NextResponse.json(
      { error: "Failed to fetch revenue", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
