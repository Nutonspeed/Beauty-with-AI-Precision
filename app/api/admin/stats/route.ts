import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Get total bookings
    const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true })

    // Get active customers (customers with at least one booking)
    const { data: activeCustomers } = await supabase.from("bookings").select("user_id").not("user_id", "is", null)

    const uniqueCustomers = new Set(activeCustomers?.map((b) => b.user_id) || [])

    // Get total revenue (sum of all completed bookings)
    const { data: completedBookings } = await supabase
      .from("bookings")
      .select("treatment_type")
      .eq("status", "completed")

    // Mock revenue calculation (in real app, you'd have a price field)
    const revenue = (completedBookings?.length || 0) * 2500

    // Get conversion rate (completed / total bookings)
    const { count: completedCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")

    const conversionRate = totalBookings ? Math.round(((completedCount || 0) / totalBookings) * 100) : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalBookings: totalBookings || 0,
        activeCustomers: uniqueCustomers.size,
        revenue,
        conversionRate,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
