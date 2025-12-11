import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json().catch(() => ({}))

    const { booking_date, booking_time, service_id, staff_id, customer_notes, internal_notes } = body

    if (!service_id) {
      return NextResponse.json(
        { error: "service_id is required to create a booking" },
        { status: 400 }
      )
    }

    if (!booking_date || !booking_time) {
      return NextResponse.json(
        { error: "booking_date and booking_time are required" },
        { status: 400 }
      )
    }

    // Basic format validation for date/time
    if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) {
      return NextResponse.json(
        { error: "booking_date must be in format YYYY-MM-DD" },
        { status: 400 }
      )
    }

    if (!/^\d{2}:\d{2}:\d{2}$/.test(booking_time)) {
      return NextResponse.json(
        { error: "booking_time must be in format HH:MM:SS" },
        { status: 400 }
      )
    }

    // 1) Load proposal (must belong to current sales_user)
    const { data: proposal, error: proposalError } = await supabase
      .from("sales_proposals")
      .select(
        `
        id,
        lead_id,
        sales_user_id,
        clinic_id,
        status,
        total_value,
        treatments,
        lead:sales_leads!lead_id (
          id,
          sales_user_id,
          customer_user_id,
          name,
          email,
          phone,
          clinic_id
        )
      `
      )
      .eq("id", id)
      .eq("sales_user_id", user.id)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (proposal.status !== "accepted") {
      return NextResponse.json(
        { error: "Only accepted proposals can be converted to bookings" },
        { status: 400 }
      )
    }

    const clinicId = proposal.clinic_id || proposal.lead?.clinic_id
    if (!clinicId) {
      return NextResponse.json(
        { error: "Proposal is missing clinic context" },
        { status: 400 }
      )
    }

    // 2) Ensure a customer exists for this lead/clinic
    let customerId: string | null = null

    // Try to find an existing customer by clinic + email/phone
    if (proposal.lead?.email || proposal.lead?.phone) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("clinic_id", clinicId)
        .or(
          [
            proposal.lead.email ? `email.eq.${proposal.lead.email}` : "",
            proposal.lead.phone ? `phone.eq.${proposal.lead.phone}` : "",
          ]
            .filter(Boolean)
            .join(",")
        )
        .maybeSingle()

      if (existingCustomer) {
        customerId = existingCustomer.id as string
      }
    }

    // If no customer found, create a new one
    if (!customerId) {
      const { data: newCustomer, error: createCustomerError } = await supabase
        .from("customers")
        .insert({
          clinic_id: clinicId,
          full_name: proposal.lead?.name ?? "Unknown",
          email: proposal.lead?.email ?? null,
          phone: proposal.lead?.phone ?? null,
          created_by: user.id,
        })
        .select("id")
        .single()

      if (createCustomerError || !newCustomer) {
        console.error("[API] Error creating customer from proposal:", createCustomerError)
        return NextResponse.json(
          { error: createCustomerError?.message || "Failed to create customer" },
          { status: 500 }
        )
      }

      customerId = newCustomer.id as string
    }

    // 3) (Optional) Validate staff belongs to this clinic and is active
    if (staff_id) {
      const { data: staffRow, error: staffError } = await supabase
        .from("clinic_staff")
        .select("id")
        .eq("user_id", staff_id)
        .eq("clinic_id", clinicId)
        .eq("status", "active")
        .maybeSingle()

      if (staffError) {
        console.error("[API] Error validating staff for booking:", staffError)
        return NextResponse.json(
          { error: "Failed to validate staff for this clinic" },
          { status: 500 }
        )
      }

      if (!staffRow) {
        return NextResponse.json(
          { error: "Invalid staff for this clinic or staff is not active" },
          { status: 400 }
        )
      }
    }

    // 4) Load the service to derive price / duration
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, treatment_type, price, duration_minutes")
      .eq("id", service_id)
      .eq("clinic_id", clinicId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "Service not found for this clinic" },
        { status: 404 }
      )
    }

    const durationMinutes = service.duration_minutes || 60
    const price = Number(service.price ?? proposal.total_value ?? 0)

    // 5) Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        clinic_id: clinicId,
        customer_id: customerId,
        service_id: service.id,
        treatment_type: service.treatment_type || "treatment",
        booking_date,
        booking_time,
        duration_minutes: durationMinutes,
        price,
        status: "pending",
        staff_id: staff_id ?? null,
        customer_notes: customer_notes ?? null,
        internal_notes:
          internal_notes ?? `Created from accepted proposal ${proposal.id} by ${user.id}`,
      })
      .select("*")
      .single()

    if (bookingError || !booking) {
      console.error("[API] Error creating booking from proposal:", bookingError)
      return NextResponse.json(
        { error: bookingError?.message || "Failed to create booking" },
        { status: 500 }
      )
    }

    // Best-effort: create a matching appointment row for this booking
    try {
      const startDateTime = new Date(`${booking_date}T${booking_time}`)
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000)

      const startTime = `${startDateTime.getHours().toString().padStart(2, "0")}:${startDateTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:00`
      const endTime = `${endDateTime.getHours().toString().padStart(2, "0")}:${endDateTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:00`

      await supabase.from("appointments").insert({
        appointment_number: `APT-${Date.now()}`,
        customer_id: customerId,
        clinic_id: clinicId,
        staff_id: staff_id ?? null,
        appointment_date: booking_date,
        start_time: startTime,
        end_time: endTime,
        duration: durationMinutes,
        status: "scheduled",
        customer_notes,
        staff_notes: internal_notes,
      })
    } catch (error) {
      console.error("[API] Failed to create appointment from booking:", error)
      // Do not fail the response if appointment creation fails
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("[API] Unexpected error creating booking from proposal:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
