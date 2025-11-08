import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const staffId = searchParams.get("staff_id")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("clinic_id, role").eq("id", user.id).single()

    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        customer:customers(full_name, email, phone),
        staff:users!bookings_staff_id_fkey(full_name)
      `,
      )
      .eq("clinic_id", userData?.clinic_id)
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)

    if (staffId) {
      query = query.eq("staff_id", staffId)
    }

    const { data: bookings, error } = await query.order("booking_date").order("booking_time")

    if (error) throw error

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
