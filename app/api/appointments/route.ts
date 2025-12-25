import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAuth } from "@/lib/auth/middleware"
import { getSubscriptionStatus } from "@/lib/subscriptions/check-subscription"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET /api/appointments - List appointments with filters
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')
    const customerId = searchParams.get('customer_id')
    const rawDoctorId = searchParams.get('doctor_id')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const limit = Number.parseInt(searchParams.get('limit') || '50')
    const offset = Number.parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('appointment_slots')
      .select('*', { count: 'exact' })

    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const doctorId = rawDoctorId === 'me' ? user.id : rawDoctorId

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (dateFrom) {
      query = query.gte('appointment_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('appointment_date', dateTo)
    }

    const { data, error, count } = await query
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[appointments] Error fetching appointments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      appointments: data || [],
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('[appointments] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
});

// POST /api/appointments - Create new appointment
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()

    const {
      clinic_id,
      customer_id,
      doctor_id,
      room_id,
      service_id,
      appointment_date,
      start_time,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      service_name,
      service_price,
      customer_notes,
      special_requirements
    } = body

    // Validate required fields
    if (!clinic_id || !customer_id || !appointment_date || !start_time || !duration_minutes || !customer_name || !customer_phone || !service_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const isGlobalAdmin = ["super_admin", "admin"].includes(user.role)
    if (!isGlobalAdmin) {
      if (!user.clinic_id || user.clinic_id !== clinic_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const subStatus = await getSubscriptionStatus(clinic_id)
      if (!subStatus.isActive || subStatus.isTrialExpired) {
        const statusCode = subStatus.subscriptionStatus === 'past_due' || subStatus.isTrialExpired ? 402 : 403
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
          { status: statusCode },
        )
      }
    }

    // Calculate end time
    const end_time = addMinutes(start_time, duration_minutes)

    // Check for conflicts using database function
    const { data: hasConflict, error: conflictError } = await supabaseAdmin
      .rpc('check_appointment_conflict', {
        p_clinic_id: clinic_id,
        p_doctor_id: doctor_id,
        p_room_id: room_id,
        p_appointment_date: appointment_date,
        p_start_time: start_time,
        p_end_time: end_time
      })

    if (conflictError) {
      console.error('[appointments] Error checking conflict:', conflictError)
      return NextResponse.json({ error: conflictError.message }, { status: 500 })
    }

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      )
    }

    // Create appointment
    const { data: appointment, error: insertError } = await supabaseAdmin
      .from('appointment_slots')
      .insert({
        clinic_id,
        customer_id,
        doctor_id,
        room_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        duration_minutes,
        customer_name,
        customer_email,
        customer_phone,
        service_name,
        service_price,
        customer_notes,
        special_requirements: special_requirements || {},
        status: 'scheduled',
        confirmation_status: 'pending',
        payment_status: 'unpaid'
      })
      .select()
      .single()

    if (insertError) {
      console.error('[appointments] Error creating appointment:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      appointment
    }, { status: 201 })

  } catch (error) {
    console.error('[appointments] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
});

// Helper function to add minutes to time string
function addMinutes(timeStr: string, minutes: number): string {
  const [hours, mins, secs = 0] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
