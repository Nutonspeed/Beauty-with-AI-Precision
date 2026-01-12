import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendBookingConfirmation } from "@/lib/notifications/email"
import { sendSMS } from "@/lib/notifications/sms"

interface BookingRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  programId: string
  date: string
  time: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Allow both authenticated and unauthenticated bookings
    const body = (await request.json()) as BookingRequest

    // Validate required fields
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.phone ||
      !body.programId ||
      !body.date ||
      !body.time
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get program details
    const { data: program, error: programError } = await supabase
      .from("services")
      .select("*")
      .eq("id", body.programId)
      .single()

    if (programError || !program) {
      return NextResponse.json({ error: "Invalid program selected" }, { status: 400 })
    }

    // Check if customer exists or create new one
    let customerId: string | null = null

    if (session?.user?.id) {
      // Authenticated user - use their ID
      customerId = session.user.id
    } else {
      // Guest booking - check if customer exists by email
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", body.email)
        .eq("center_id", program.center_id)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            center_id: program.center_id,
            full_name: `${body.firstName} ${body.lastName}`,
            email: body.email,
            phone: body.phone,
            lead_status: "new",
            lead_score: 50,
            source: "website_booking",
          })
          .select()
          .single()

        if (customerError || !newCustomer) {
          console.error("[v0] Error creating customer:", customerError)
          return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 })
        }

        customerId = newCustomer.id
      }
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        center_id: program.center_id,
        customer_id: customerId,
        service_id: program.id,
        program_type: program.name,
        booking_date: body.date,
        booking_time: body.time,
        duration_minutes: program.duration_minutes || 60,
        price: program.price,
        status: "pending",
        customer_notes: body.notes || null,
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error("[v0] Error creating booking:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    // Get center information
    const { data: center, error: centerError } = await supabase
      .from('centers')
      .select('name, address, phone, email')
      .eq('id', program.center_id)
      .single()

    if (centerError || !center) {
      console.error('[v0] Error fetching center info:', centerError)
      // Continue with default values if center not found
    }

    // Send email confirmation with actual center info
    await sendBookingConfirmation(body.email, {
      program_type: program.name,
      booking_date: body.date,
      booking_time: body.time,
      center: {
        name: center?.name || 'คลินิกความงาม',
        address: center?.address || '',
        phone: center?.phone || '',
        email: center?.email || ''
      }
    })

    // Send SMS confirmation if phone is provided
    if (body.phone) {
      await sendSMS({
        to: body.phone,
        message: `Booking confirmed! ${program.name} on ${body.date} at ${body.time}. We'll see you soon!`,
      })
    }

    console.log("[v0] Notifications sent successfully to:", body.email)

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          date: booking.booking_date,
          time: booking.booking_time,
          program: program.name,
          price: program.price,
        },
        message: "Booking created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error in booking creation:", error)
    return NextResponse.json(
      { error: "Failed to create booking", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
