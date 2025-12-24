import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const clinicId = searchParams.get('clinic_id')
    const staffId = searchParams.get('staff_id')
    
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('doctor_availability')
      .select(`
        *,
        staff!doctor_availability_doctor_id_fkey (
          id,
          full_name
        )
      `)
      .eq('clinic_id', clinicId)

    if (staffId) {
      query = query.eq('doctor_id', staffId)
    }

    const { data: availabilities, error } = await query.order('day_of_week', { ascending: true })

    if (error) {
      console.error('Error fetching availabilities:', error)
      return NextResponse.json(
        { error: 'Failed to fetch availabilities' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      availabilities: availabilities?.map(ava => ({
        id: ava.id,
        staff_id: ava.doctor_id,
        staff_name: ava.staff?.full_name || 'Unknown',
        day_of_week: ava.day_of_week,
        start_time: ava.start_time,
        end_time: ava.end_time,
        is_available: ava.is_available,
        max_appointments: ava.max_appointments_per_slot,
        slot_duration: ava.slot_duration_minutes,
        break_start_time: ava.break_start_time,
        break_end_time: ava.break_end_time
      })) || []
    })

  } catch (error) {
    console.error('Error in availability API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      clinic_id,
      staff_id,
      day_of_week,
      start_time,
      end_time,
      is_available,
      max_appointments,
      slot_duration,
      break_start_time,
      break_end_time
    } = body

    // Validate required fields
    if (!clinic_id || !staff_id || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate time range
    if (start_time >= end_time) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Validate break time if provided
    if (break_start_time && break_end_time) {
      if (break_start_time >= break_end_time) {
        return NextResponse.json(
          { error: 'Break end time must be after break start time' },
          { status: 400 }
        )
      }
      if (break_start_time < start_time || break_end_time > end_time) {
        return NextResponse.json(
          { error: 'Break time must be within working hours' },
          { status: 400 }
        )
      }
    }

    // Check for existing availability on the same day
    const { data: existing, error: checkError } = await supabase
      .from('doctor_availability')
      .select('id')
      .eq('clinic_id', clinic_id)
      .eq('doctor_id', staff_id)
      .eq('day_of_week', day_of_week)

    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to check existing availability' },
        { status: 500 }
      )
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Availability already exists for this day' },
        { status: 409 }
      )
    }

    // Create availability
    const { data: availability, error: createError } = await supabase
      .from('doctor_availability')
      .insert({
        clinic_id,
        doctor_id: staff_id,
        day_of_week,
        start_time,
        end_time,
        is_available: is_available ?? true,
        max_appointments_per_slot: max_appointments || 1,
        slot_duration_minutes: slot_duration || 30,
        break_start_time: break_start_time || null,
        break_end_time: break_end_time || null,
        effective_from: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating availability:', createError)
      return NextResponse.json(
        { error: 'Failed to create availability' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      availability,
      message: 'Availability created successfully'
    })

  } catch (error) {
    console.error('Error creating availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
