import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withClinicAuth } from "@/lib/auth/middleware"


// Helper function to add minutes to time string
function addMinutes(timeStr: string, minutes: number): string {
  const [hours, mins, secs = 0] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

async function handler(req: NextRequest, user: any) {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const body = await req.json();

  const {
    new_appointment_date,
    new_start_time,
    new_doctor_id,
    new_room_id,
    reschedule_reason
  } = body;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Validate required fields
  if (!new_appointment_date || !new_start_time) {
    return NextResponse.json(
      { error: 'New appointment date and time are required' },
      { status: 400 }
    )
  }

  // Get current appointment
  const { data: currentAppointment, error: fetchError } = await supabaseAdmin
    .from('appointment_slots')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !currentAppointment) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    )
  }

  // Calculate new end time
  const new_end_time = addMinutes(new_start_time, currentAppointment.duration_minutes)

  // Check for conflicts
  const { data: hasConflict, error: conflictError } = await supabaseAdmin
    .rpc('check_appointment_conflict', {
      p_clinic_id: currentAppointment.clinic_id,
      p_doctor_id: new_doctor_id || currentAppointment.doctor_id,
      p_room_id: new_room_id || currentAppointment.room_id,
      p_appointment_date: new_appointment_date,
      p_start_time: new_start_time,
      p_end_time: new_end_time,
      p_exclude_appointment_id: id
    })

  if (conflictError) {
    console.error('[appointments/reschedule] Error checking conflict:', conflictError)
    return NextResponse.json({ error: conflictError.message }, { status: 500 })
  }

  if (hasConflict) {
    return NextResponse.json(
      { error: 'New time slot is already booked' },
      { status: 409 }
    )
  }

  // Update appointment
  const updates: Record<string, unknown> = {
    appointment_date: new_appointment_date,
    start_time: new_start_time,
    end_time: new_end_time,
    reschedule_count: currentAppointment.reschedule_count + 1,
    confirmation_status: 'pending' // Reset confirmation
  }

  if (new_doctor_id) {
    updates.doctor_id = new_doctor_id
  }

  if (new_room_id) {
    updates.room_id = new_room_id
  }

  if (reschedule_reason) {
    updates.staff_notes = currentAppointment.staff_notes
      ? `${currentAppointment.staff_notes}\n\nRescheduled: ${reschedule_reason}`
      : `Rescheduled: ${reschedule_reason}`
  }

  const { data: updatedAppointment, error: updateError } = await supabaseAdmin
    .from('appointment_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('[appointments/reschedule] Error updating appointment:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Cancel old reminders
  await supabaseAdmin
    .from('appointment_reminders')
    .update({ status: 'cancelled' })
    .eq('appointment_id', id)
    .eq('status', 'pending')

  // Create new reminders
  const appointmentDateTime = new Date(`${new_appointment_date}T${new_start_time}`)
  const reminderTimes = [24, 2] // 24 hours and 2 hours before

  for (const hours of reminderTimes) {
    const sendTime = new Date(appointmentDateTime.getTime() - hours * 60 * 60 * 1000)

    if (sendTime > new Date()) {
      // Email reminder
      if (currentAppointment.customer_email) {
        await supabaseAdmin
          .from('appointment_reminders')
          .insert({
            appointment_id: id,
            reminder_type: 'email',
            reminder_timing: hours,
            scheduled_send_at: sendTime.toISOString(),
            recipient: currentAppointment.customer_email
          })
      }

      // SMS reminder
      if (currentAppointment.customer_phone) {
        await supabaseAdmin
          .from('appointment_reminders')
          .insert({
            appointment_id: id,
            reminder_type: 'sms',
            reminder_timing: hours,
            scheduled_send_at: sendTime.toISOString(),
            recipient: currentAppointment.customer_phone
          })
      }
    }
  }

  return NextResponse.json({
    success: true,
    appointment: updatedAppointment,
    message: 'Appointment rescheduled successfully',
    previous_date: currentAppointment.appointment_date,
    previous_time: currentAppointment.start_time,
    new_date: new_appointment_date,
    new_time: new_start_time
  });
}

export const POST = withClinicAuth(handler);
