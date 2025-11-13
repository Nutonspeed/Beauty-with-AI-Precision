import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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
      console.error('[clinic/treatments] Failed to fetch user:', userErr)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    if (!userData || (userData.role !== "clinic_owner" && userData.role !== "clinic_staff")) {
      return NextResponse.json({ error: "Forbidden - Clinic access required" }, { status: 403 })
    }

    const clinicId = userData.clinic_id

    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 })
    }

    // Fetch bookings with treatment info
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("treatment_type, price, status")
      .eq("clinic_id", clinicId)
      .in("status", ["confirmed", "completed"])

    if (error) throw error

    // Group by treatment type and calculate metrics
    const treatmentStats = new Map<string, { count: number; revenue: number }>()

    bookings?.forEach((booking) => {
      const treatment = booking.treatment_type || "Unknown"
      const current = treatmentStats.get(treatment) || { count: 0, revenue: 0 }
      treatmentStats.set(treatment, {
        count: current.count + 1,
        revenue: current.revenue + (Number(booking.price) || 0),
      })
    })

    // Convert to array and sort by revenue
    const topTreatments = Array.from(treatmentStats.entries())
      .map(([name, stats]) => ({
        name,
        bookings: stats.count,
        revenue: stats.revenue,
        avgPrice: stats.count > 0 ? stats.revenue / stats.count : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 treatments

    return NextResponse.json({
      treatments: topTreatments,
      totalTreatments: treatmentStats.size,
    })
  } catch (error) {
    console.error("[v0] Error fetching treatments:", error)
    return NextResponse.json(
      { error: "Failed to fetch treatments", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
