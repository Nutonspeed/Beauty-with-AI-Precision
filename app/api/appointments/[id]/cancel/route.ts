import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withClinicAuth } from "@/lib/auth/middleware"


async function handler(req: NextRequest, user: any) {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const body = await req.json();

  const {
    cancelled_by_user_id,
    cancelled_by_role,
    cancellation_reason,
    cancellation_type,
    reschedule_offered
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
  if (!cancelled_by_user_id || !cancelled_by_role || !cancellation_reason || !cancellation_type) {
    return NextResponse.json(
      { error: 'Missing required cancellation details' },
      { status: 400 }
    )
  }

  // Get appointment details
  const { data: appointment, error: fetchError } = await supabaseAdmin
    .from('appointment_slots')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !appointment) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    )
  }

  // Check if already cancelled
  if (appointment.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Appointment is already cancelled' },
      { status: 400 }
    )
  }

  // Calculate cancellation fee
  const { data: cancellationFee, error: feeError } = await supabaseAdmin
    .rpc('calculate_cancellation_fee', {
      p_appointment_id: id,
      p_cancelled_at: new Date().toISOString()
    })

  if (feeError) {
    console.error('[appointments/cancel] Error calculating fee:', feeError)
  }

  const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`)
  const now = new Date()
  const hoursBeforeAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Determine refund amount
  let refundAmount = 0
  if (appointment.payment_status === 'paid' || appointment.payment_status === 'deposit') {
    const paidAmount = appointment.service_price || 0
    refundAmount = Math.max(0, paidAmount - (cancellationFee || 0))
  }

  // Determine which policy was applied
  let policyApplied = 'no_fee'
  if (hoursBeforeAppointment < 6) {
    policyApplied = 'less_than_6_hours_100_percent'
  } else if (hoursBeforeAppointment < 12) {
    policyApplied = 'less_than_12_hours_75_percent'
  } else if (hoursBeforeAppointment < 24) {
    policyApplied = 'less_than_24_hours_50_percent'
  }

  // Update appointment status
  const { error: updateError } = await supabaseAdmin
    .from('appointment_slots')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: cancelled_by_user_id,
      cancellation_reason,
      cancellation_fee: cancellationFee || 0
    })
    .eq('id', id)

  if (updateError) {
    console.error('[appointments/cancel] Error updating appointment:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Record cancellation details
  const { error: recordError } = await supabaseAdmin
    .from('appointment_cancellations')
    .insert({
      appointment_id: id,
      cancelled_by_user_id,
      cancelled_by_role,
      cancellation_reason,
      cancellation_type,
      hours_before_appointment: hoursBeforeAppointment,
      cancellation_fee: cancellationFee || 0,
      refund_amount: refundAmount,
      policy_applied: policyApplied,
      reschedule_offered: reschedule_offered || false
    })

  if (recordError) {
    console.error('[appointments/cancel] Error recording cancellation:', recordError)
    // Don't fail the request, cancellation is already recorded in appointment
  }

  // Cancel all pending reminders
  const { error: reminderError } = await supabaseAdmin
    .from('appointment_reminders')
    .update({ status: 'cancelled' })
    .eq('appointment_id', id)
    .eq('status', 'pending')

  if (reminderError) {
    console.error('[appointments/cancel] Error cancelling reminders:', reminderError)
  }

  const cancelledAppointment = {
    id: appointment.id,
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    cancelled_by: cancelled_by_user_id,
    cancellation_reason,
    cancellation_fee: cancellationFee || 0
  };

  return NextResponse.json({
    success: true,
    data: cancelledAppointment,
    message: 'Appointment cancelled successfully'
  });
}

export const POST = withClinicAuth(handler);
