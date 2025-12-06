import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withClinicAuth } from "@/lib/auth/middleware"

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

// GET /api/appointments/availability/doctors - Get doctor availability
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')
    const doctorId = searchParams.get('doctor_id')

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('doctor_availability')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_available', true)

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    const { data, error } = await query.order('day_of_week').order('start_time')

    if (error) {
      console.error('[appointments/availability/doctors] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      availability: data || [],
      total: data?.length || 0
    })

  } catch (error) {
    console.error('[appointments/availability/doctors] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})

// POST /api/appointments/availability/doctors - Create doctor availability
export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const {
      clinic_id,
      doctor_id,
      day_of_week,
      start_time,
      end_time,
      max_appointments_per_slot,
      slot_duration_minutes,
      break_start_time,
      break_end_time,
      effective_from,
      effective_to
    } = body

    // Validate required fields
    if (!clinic_id || !doctor_id || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('doctor_availability')
      .insert({
        clinic_id,
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        is_available: true,
        max_appointments_per_slot: max_appointments_per_slot || 1,
        slot_duration_minutes: slot_duration_minutes || 30,
        break_start_time,
        break_end_time,
        effective_from: effective_from || new Date().toISOString().split('T')[0],
        effective_to
      })
      .select()
      .single()

    if (error) {
      console.error('[appointments/availability/doctors] Error creating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      availability: data
    }, { status: 201 })

  } catch (error) {
    console.error('[appointments/availability/doctors] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})
