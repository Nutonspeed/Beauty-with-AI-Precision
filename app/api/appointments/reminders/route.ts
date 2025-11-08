import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

// GET /api/appointments/reminders - Get pending reminders to send
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = Number.parseInt(searchParams.get('limit') || '100')

    // Get reminders that should be sent now
    const { data, error } = await supabaseAdmin
      .from('appointment_reminders')
      .select(`
        *,
        appointment:appointment_slots (
          id,
          customer_name,
          customer_email,
          customer_phone,
          appointment_date,
          start_time,
          service_name,
          clinic_id
        )
      `)
      .eq('status', status)
      .lte('scheduled_send_at', new Date().toISOString())
      .order('scheduled_send_at')
      .limit(limit)

    if (error) {
      console.error('[appointments/reminders] Error fetching reminders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      reminders: data || [],
      total: data?.length || 0
    })

  } catch (error) {
    console.error('[appointments/reminders] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/appointments/reminders/send - Mark reminders as sent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reminder_ids, status, failure_reason } = body

    if (!reminder_ids || !Array.isArray(reminder_ids) || reminder_ids.length === 0) {
      return NextResponse.json(
        { error: 'reminder_ids array is required' },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {
      status: status || 'sent'
    }

    if (status === 'sent') {
      updates.sent_at = new Date().toISOString()
    } else if (status === 'failed') {
      updates.failed_at = new Date().toISOString()
      updates.failure_reason = failure_reason || 'Unknown error'
    }

    const { data, error } = await supabaseAdmin
      .from('appointment_reminders')
      .update(updates)
      .in('id', reminder_ids)
      .select()

    if (error) {
      console.error('[appointments/reminders/send] Error updating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      reminders: data
    })

  } catch (error) {
    console.error('[appointments/reminders/send] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
