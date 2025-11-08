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

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        clinic:clinics(name, address)
      `,
      )
      .eq("user_id", session.user.id)
      .order("booking_date", { ascending: false })

    if (error) {
      console.log("[v0] Bookings query error:", error)

      // If table doesn't exist (PGRST205), return empty bookings
      if (error.code === "PGRST205") {
        return NextResponse.json({
          success: true,
          bookings: [],
          message: "Booking system is being set up",
        })
      }

      throw error
    }

    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
