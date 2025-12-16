import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendBookingConfirmation } from "@/lib/notifications/email"
import { sendSMS } from "@/lib/notifications/sms"
import { getSubscriptionStatus } from "@/lib/subscriptions/check-subscription"

interface BookingRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  treatmentId: string
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
      !body.treatmentId ||
      !body.date ||
      !body.time
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get treatment details
    const { data: treatment, error: treatmentError } = await supabase
      .from("services")
      .select("*")
      .eq("id", body.treatmentId)
      .single()

    if (treatmentError || !treatment) {
      return NextResponse.json({ error: "Invalid treatment selected" }, { status: 400 })
    }

    const subStatus = await getSubscriptionStatus(treatment.clinic_id)
    if (subStatus.subscriptionStatus === 'suspended' || subStatus.subscriptionStatus === 'cancelled') {
      return NextResponse.json(
        {
          error: subStatus.message,
          subscription: {
            status: subStatus.subscriptionStatus,
            plan: subStatus.plan,
            isTrial: subStatus.isTrial,
            isTrialExpired: subStatus.isTrialExpired,
          },
        },
        { status: 403 },
      )
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
        .eq("clinic_id", treatment.clinic_id)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            clinic_id: treatment.clinic_id,
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
        clinic_id: treatment.clinic_id,
        customer_id: customerId,
        service_id: treatment.id,
        treatment_type: treatment.name,
        booking_date: body.date,
        booking_time: body.time,
        duration_minutes: treatment.duration_minutes || 60,
        price: treatment.price,
        status: "pending",
        customer_notes: body.notes || null,
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error("[v0] Error creating booking:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    // Get clinic information
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('name, address, phone, email')
      .eq('id', treatment.clinic_id)
      .single()

    if (clinicError || !clinic) {
      console.error('[v0] Error fetching clinic info:', clinicError)
      // Continue with default values if clinic not found
    }

    // Send email confirmation with actual clinic info
    await sendBookingConfirmation(body.email, {
      treatment_type: treatment.name,
      booking_date: body.date,
      booking_time: body.time,
      clinic: {
        name: clinic?.name || 'คลินิกความงาม',
        address: clinic?.address || '',
        phone: clinic?.phone || '',
        email: clinic?.email || ''
      }
    })

    // Send SMS confirmation if phone is provided
    if (body.phone) {
      await sendSMS({
        to: body.phone,
        message: `Booking confirmed! ${treatment.name} on ${body.date} at ${body.time}. We'll see you soon!`,
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
          treatment: treatment.name,
          price: treatment.price,
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
