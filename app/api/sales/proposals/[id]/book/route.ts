import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"
import { bookFromProposal } from "@/lib/sales/proposals-service"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single()
    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { booking_date, booking_time, service_id, staff_id, customer_notes, internal_notes } = body

    const booking = await bookFromProposal(user.id, userRow.clinic_id ?? null, id, {
      booking_date,
      booking_time,
      service_id,
      staff_id,
      customer_notes,
      internal_notes,
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error("[API] Error creating booking from proposal:", error)
    
    const status = error.status || 500
    const message = error.message || "Internal server error"
    return NextResponse.json({ error: message }, { status })
  }
}
