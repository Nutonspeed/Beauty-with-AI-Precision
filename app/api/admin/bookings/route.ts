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

    // Fetch all bookings with user and clinic info
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        user:users(full_name, email, phone),
        clinic:clinics(name, address)
      `,
      )
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
