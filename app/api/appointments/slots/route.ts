import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role for admin operations
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

// GET /api/appointments/slots - Get available time slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinic_id')
    const doctorId = searchParams.get('doctor_id')
    const date = searchParams.get('date')

    if (!clinicId || !date) {
      return NextResponse.json(
        { error: 'clinic_id and date are required' },
        { status: 400 }
      )
    }

    // Get day of week (0 = Sunday)
    const dayOfWeek = new Date(date).getDay()

    // Get doctor availability for this day
    let doctorAvailabilityQuery = supabaseAdmin
      .from('doctor_availability')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true)
      .lte('effective_from', date)
      .or(`effective_to.is.null,effective_to.gte.${date}`)

    if (doctorId) {
      doctorAvailabilityQuery = doctorAvailabilityQuery.eq('doctor_id', doctorId)
    }

    const { data: doctorAvailability, error: doctorError } = await doctorAvailabilityQuery

    if (doctorError) {
      console.error('[appointments/slots] Error fetching doctor availability:', doctorError)
      return NextResponse.json({ error: doctorError.message }, { status: 500 })
    }

    // Get existing appointments for this date
    let appointmentsQuery = supabaseAdmin
      .from('appointment_slots')
      .select('doctor_id, start_time, end_time')
      .eq('clinic_id', clinicId)
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'confirmed', 'in-progress'])

    if (doctorId) {
      appointmentsQuery = appointmentsQuery.eq('doctor_id', doctorId)
    }

    const { data: existingAppointments, error: appointmentsError } = await appointmentsQuery

    if (appointmentsError) {
      console.error('[appointments/slots] Error fetching appointments:', appointmentsError)
      return NextResponse.json({ error: appointmentsError.message }, { status: 500 })
    }

    // Generate available time slots
    const availableSlots = []

    for (const availability of doctorAvailability || []) {
      const startTime = availability.start_time
      const endTime = availability.end_time
      const slotDuration = availability.slot_duration_minutes || 30

      // Generate slots
      let currentTime = startTime
      while (currentTime < endTime) {
        const slotEnd = addMinutes(currentTime, slotDuration)
        
        if (slotEnd > endTime) break

        // Check if this slot overlaps with break time
        const isBreakTime = availability.break_start_time && 
          availability.break_end_time &&
          !(slotEnd <= availability.break_start_time || currentTime >= availability.break_end_time)

        if (!isBreakTime) {
          // Check if slot is already booked
          const isBooked = existingAppointments?.some(apt => {
            return apt.doctor_id === availability.doctor_id &&
              !(slotEnd <= apt.start_time || currentTime >= apt.end_time)
          })

          if (!isBooked) {
            availableSlots.push({
              doctor_id: availability.doctor_id,
              start_time: currentTime,
              end_time: slotEnd,
              duration_minutes: slotDuration,
              is_available: true
            })
          }
        }

        currentTime = slotEnd
      }
    }

    return NextResponse.json({
      date,
      day_of_week: dayOfWeek,
      available_slots: availableSlots,
      total_slots: availableSlots.length
    })

  } catch (error) {
    console.error('[appointments/slots] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to add minutes to time string
function addMinutes(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:00`
}
