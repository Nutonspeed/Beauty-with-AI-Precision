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

    // Get user's center_id and role
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select("center_id, role")
      .eq("id", user.id)
      .single()

    if (userErr) {
      console.error('[center/programs] Failed to fetch user:', userErr)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    if (!userData || (userData.role !== "center_owner" && userData.role !== "center_staff")) {
      return NextResponse.json({ error: "Forbidden - Center access required" }, { status: 403 })
    }

    const centerId = userData.center_id

    if (!centerId) {
      return NextResponse.json({ error: "No center associated" }, { status: 400 })
    }

    // Fetch bookings with program info
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("program_type, price, status")
      .eq("center_id", centerId)
      .in("status", ["confirmed", "completed"])

    if (error) throw error

    // Group by program type and calculate metrics
    const programStats = new Map<string, { count: number; revenue: number }>()

    bookings?.forEach((booking) => {
      const program = booking.program_type || "Unknown"
      const current = programStats.get(program) || { count: 0, revenue: 0 }
      programStats.set(program, {
        count: current.count + 1,
        revenue: current.revenue + (Number(booking.price) || 0),
      })
    })

    // Convert to array and sort by revenue
    const topPrograms = Array.from(programStats.entries())
      .map(([name, stats]) => ({
        name,
        bookings: stats.count,
        revenue: stats.revenue,
        avgPrice: stats.count > 0 ? stats.revenue / stats.count : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 programs

    return NextResponse.json({
      programs: topPrograms,
      totalPrograms: programStats.size,
    })
  } catch (error) {
    console.error("[v0] Error fetching programs:", error)
    return NextResponse.json(
      { error: "Failed to fetch programs", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
