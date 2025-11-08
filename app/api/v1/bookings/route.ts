import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("bookings")
      .select("*, clinic:clinics(*)")
      .eq("customer_id", user.id)
      .order("booking_date", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: bookings, error } = await query

    if (error) throw error

    return NextResponse.json({ bookings, pagination: { limit, offset, total: bookings.length } })
  } catch (error) {
    console.error("Bookings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await request.json()
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        ...booking,
        customer_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ booking: data }, { status: 201 })
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
