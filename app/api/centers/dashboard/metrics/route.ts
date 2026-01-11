import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Load user's clinic and role directly via server client
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single()

    if (userErr) {
      console.error('[clinic/metrics] Failed to fetch user profile:', userErr)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    if (!userData || (userData.role !== "clinic_owner" && userData.role !== "clinic_staff")) {
      return NextResponse.json({ error: "Forbidden - Clinic access required" }, { status: 403 })
    }

    const clinicId = userData.clinic_id

    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated with user" }, { status: 400 })
    }

    // Get today's and yesterday's dates in Bangkok timezone
    const now = new Date()
    const bangkokOffset = 7 * 60 // UTC+7 in minutes
    const localOffset = now.getTimezoneOffset()
    const offsetDiff = bangkokOffset + localOffset
    
    const bangkokNow = new Date(now.getTime() + offsetDiff * 60000)
    const todayStart = new Date(bangkokNow)
    todayStart.setHours(0, 0, 0, 0)
    
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    
    const yesterdayEnd = new Date(todayStart)

    // Use service role client to bypass RLS for aggregated metrics
    const supabaseAdmin = createServiceClient()

    // Fetch today's bookings
    const { data: todayBookings, error: todayError } = await supabaseAdmin
      .from('bookings')
      .select('price, status, customer_id')
      .eq('clinic_id', clinicId)
      .in('status', ['confirmed', 'completed'])
      .gte('booking_date', todayStart.toISOString().split('T')[0])
      .lt('booking_date', new Date(todayStart.getTime() + 86400000).toISOString().split('T')[0])

    if (todayError) {
      console.error('[clinic/metrics] Error fetching today bookings:', todayError)
    }

    // Fetch yesterday's bookings
    const { data: yesterdayBookings, error: yesterdayError } = await supabaseAdmin
      .from('bookings')
      .select('price, status, customer_id')
      .eq('clinic_id', clinicId)
      .in('status', ['confirmed', 'completed'])
      .gte('booking_date', yesterdayStart.toISOString().split('T')[0])
      .lt('booking_date', yesterdayEnd.toISOString().split('T')[0])

    if (yesterdayError) {
      console.error('[clinic/metrics] Error fetching yesterday bookings:', yesterdayError)
    }

    // Calculate today's metrics
    const todayBookingsCount = todayBookings?.length || 0
    const todayRevenue = todayBookings?.reduce((sum, b: any) => sum + (Number(b.price) || 0), 0) || 0
    const todayUniqueCustomers = new Set(todayBookings?.map(b => b.customer_id) || []).size
    const todayCompletedBookings = todayBookings?.filter(b => b.status === 'completed').length || 0

    // Calculate yesterday's metrics
    const yesterdayBookingsCount = yesterdayBookings?.length || 0
    const yesterdayRevenue = yesterdayBookings?.reduce((sum, b: any) => sum + (Number(b.price) || 0), 0) || 0
    const yesterdayUniqueCustomers = new Set(yesterdayBookings?.map(b => b.customer_id) || []).size
    const yesterdayCompletedBookings = yesterdayBookings?.filter(b => b.status === 'completed').length || 0

    // Helper function to calculate percentage change
    const calculateChange = (today: number, yesterday: number): number => {
      if (yesterday > 0) {
        return Number((((today - yesterday) / yesterday) * 100).toFixed(1))
      }
      return today > 0 ? 100 : 0
    }

    // Calculate percentage changes
    const revenueChange = calculateChange(todayRevenue, yesterdayRevenue)
    const customersChange = calculateChange(todayUniqueCustomers, yesterdayUniqueCustomers)
    const bookingsChange = calculateChange(todayBookingsCount, yesterdayBookingsCount)

    // Calculate conversion rate (completed / total bookings)
    const todayConversion = todayBookingsCount > 0 
      ? Number(((todayCompletedBookings / todayBookingsCount) * 100).toFixed(1))
      : 0
    
    const yesterdayConversion = yesterdayBookingsCount > 0
      ? Number(((yesterdayCompletedBookings / yesterdayBookingsCount) * 100).toFixed(1))
      : 0

    const conversionChange = calculateChange(todayConversion, yesterdayConversion)

    console.log('[clinic/metrics] Real data:', {
      todayBookings: todayBookingsCount,
      todayRevenue,
      todayCustomers: todayUniqueCustomers,
    })

    // Return real metrics
    return NextResponse.json({
      revenue: {
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        change: revenueChange,
        target: 150000,
      },
      customers: {
        today: todayUniqueCustomers,
        yesterday: yesterdayUniqueCustomers,
        change: customersChange,
        target: 15,
      },
      bookings: {
        today: todayBookingsCount,
        yesterday: yesterdayBookingsCount,
        change: bookingsChange,
        target: 20,
      },
      conversion: {
        today: todayConversion,
        yesterday: yesterdayConversion,
        change: conversionChange,
        target: 80,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching clinic metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
