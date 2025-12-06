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

// GET /api/appointments/availability/rooms - Get room availability and list
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')
    const roomType = searchParams.get('room_type')
    const includeAvailability = searchParams.get('include_availability') === 'true'

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      )
    }

    // Get rooms
    let roomsQuery = supabaseAdmin
      .from('service_rooms')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'active')

    if (roomType) {
      roomsQuery = roomsQuery.eq('room_type', roomType)
    }

    const { data: rooms, error: roomsError } = await roomsQuery.order('room_number')

    if (roomsError) {
      console.error('[appointments/availability/rooms] Error fetching rooms:', roomsError)
      return NextResponse.json({ error: roomsError.message }, { status: 500 })
    }

    // If include_availability is requested, fetch availability for each room
    let roomsWithAvailability = rooms

    if (includeAvailability && rooms && rooms.length > 0) {
      const roomIds = rooms.map(r => r.id)
      
      const { data: availability, error: availError } = await supabaseAdmin
        .from('room_availability')
        .select('*')
        .in('room_id', roomIds)
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time')

      if (!availError && availability) {
        roomsWithAvailability = rooms.map(room => ({
          ...room,
          availability: availability.filter(a => a.room_id === room.id)
        }))
      }
    }

    return NextResponse.json({
      rooms: roomsWithAvailability || [],
      total: roomsWithAvailability?.length || 0
    })

  } catch (error) {
    console.error('[appointments/availability/rooms] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})

// POST /api/appointments/availability/rooms - Create room or room availability
export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create_room') {
      // Create new room
      const {
        clinic_id,
        name,
        room_number,
        room_type,
        capacity,
        equipment
      } = body

      if (!clinic_id || !name || !room_number || !room_type) {
        return NextResponse.json(
          { error: 'Missing required fields for room creation' },
          { status: 400 }
        )
      }

      const { data, error } = await supabaseAdmin
        .from('service_rooms')
        .insert({
          clinic_id,
          name,
          room_number,
          room_type,
          capacity: capacity || 1,
          equipment: equipment || [],
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('[appointments/availability/rooms] Error creating room:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        room: data
      }, { status: 201 })

    } else if (action === 'create_availability') {
      // Create room availability schedule
      const {
        room_id,
        day_of_week,
        start_time,
        end_time,
        effective_from,
        effective_to
      } = body

      if (!room_id || day_of_week === undefined || !start_time || !end_time) {
        return NextResponse.json(
          { error: 'Missing required fields for availability' },
          { status: 400 }
        )
      }

      const { data, error } = await supabaseAdmin
        .from('room_availability')
        .insert({
          room_id,
          day_of_week,
          start_time,
          end_time,
          is_available: true,
          effective_from: effective_from || new Date().toISOString().split('T')[0],
          effective_to
        })
        .select()
        .single()

      if (error) {
        console.error('[appointments/availability/rooms] Error creating availability:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        availability: data
      }, { status: 201 })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create_room" or "create_availability"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('[appointments/availability/rooms] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})
