import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const clinicId = searchParams.get('clinic_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const staffId = searchParams.get('staff_id')
    
    // Validate required parameters
    if (!clinicId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: clinic_id, start_date, end_date' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('appointments')
      .select(`
        *,
        customers!appointments_customer_id_fkey (
          id,
          full_name,
          email,
          phone
        ),
        staff!appointments_staff_id_fkey (
          id,
          full_name
        ),
        services!appointments_service_id_fkey (
          id,
          name,
          duration,
          price
        ),
        rooms!appointments_room_id_fkey (
          id,
          name,
          room_number
        )
      `)
      .eq('clinic_id', clinicId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true })

    // Filter by staff if provided
    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    const { data: appointments, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Transform data for calendar
    const bookings = appointments?.map(apt => ({
      id: apt.id,
      customer_name: apt.customers?.full_name || 'Unknown Customer',
      customer_email: apt.customers?.email || '',
      staff_name: apt.staff?.full_name || 'Unknown Staff',
      service_name: apt.services?.name || 'Unknown Service',
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status,
      room_name: apt.rooms?.name || null,
      notes: apt.notes,
      service_duration: apt.services?.duration,
      service_price: apt.services?.price
    })) || []

    return NextResponse.json({
      success: true,
      bookings,
      total: bookings.length
    })

  } catch (error) {
    console.error('Error in booking calendar API:', error)
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
      customer_id,
      staff_id,
      service_id,
      room_id,
      start_time,
      notes
    } = body

    // Validate required fields
    if (!clinic_id || !customer_id || !staff_id || !service_id || !start_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get service details for duration and price
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('name, duration, price')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Calculate end time
    const startTime = new Date(start_time)
    const endTime = new Date(startTime.getTime() + service.duration * 60000)

    // Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('clinic_id', clinic_id)
      .eq('staff_id', staff_id)
      .neq('status', 'cancelled')
      .or(`start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()}`)

    if (conflictError) {
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      )
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      )
    }

    // Check room availability if room_id provided
    if (room_id) {
      const { data: roomConflicts, error: roomConflictError } = await supabase
        .from('appointments')
        .select('id')
        .eq('clinic_id', clinic_id)
        .eq('room_id', room_id)
        .neq('status', 'cancelled')
        .or(`start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()}`)

      if (roomConflictError) {
        return NextResponse.json(
          { error: 'Failed to check room availability' },
          { status: 500 }
        )
      }

      if (roomConflicts && roomConflicts.length > 0) {
        return NextResponse.json(
          { error: 'Room is already booked at this time' },
          { status: 409 }
        )
      }
    }

    // Create appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        clinic_id,
        customer_id,
        staff_id,
        service_id,
        room_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating appointment:', createError)
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    // Get customer details for invoice
    const { data: customer } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', customer_id)
      .single()

    // Send confirmation email (optional)
    // TODO: Implement email notification

    // Create invoice for the appointment
    const { createInvoiceForAppointment } = await import('@/lib/payment/invoice-creator')
    const invoiceData = await createInvoiceForAppointment(
      appointment.id,
      service,
      customer || { id: customer_id, full_name: 'Unknown Customer' },
      clinic_id
    )

    return NextResponse.json({
      success: true,
      appointment,
      invoice: invoiceData,
      message: 'Appointment created successfully'
    })

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
