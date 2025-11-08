import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET /api/queue/settings - Get queue settings for clinic
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinic_id = searchParams.get("clinic_id")

    if (!clinic_id) {
      return NextResponse.json({ error: "clinic_id is required" }, { status: 400 })
    }

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

    const { data: settings, error } = await supabaseAdmin
      .from('queue_settings')
      .select('*')
      .eq('clinic_id', clinic_id)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error is ok
      console.error('[queue/settings] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return default settings if not found
    if (!settings) {
      const defaultSettings = {
        clinic_id,
        avg_service_time: 15,
        buffer_time: 5,
        notify_before_turn: 2,
        enable_sms_notifications: true,
        enable_line_notifications: false,
        enable_email_notifications: false,
        enable_tv_display: true,
        tv_display_refresh_interval: 30,
        show_doctor_names: true,
        show_estimated_times: true,
        auto_reset_daily: true,
        reset_time: '00:00'
      }
      return NextResponse.json({ settings: defaultSettings })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[queue/settings] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch queue settings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST /api/queue/settings - Create or update queue settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.clinic_id) {
      return NextResponse.json({ error: "clinic_id is required" }, { status: 400 })
    }

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

    const { data: settings, error } = await supabaseAdmin
      .from('queue_settings')
      .upsert([{
        clinic_id: body.clinic_id,
        avg_service_time: body.avg_service_time,
        buffer_time: body.buffer_time,
        notify_before_turn: body.notify_before_turn,
        enable_sms_notifications: body.enable_sms_notifications,
        enable_line_notifications: body.enable_line_notifications,
        enable_email_notifications: body.enable_email_notifications,
        enable_tv_display: body.enable_tv_display,
        tv_display_refresh_interval: body.tv_display_refresh_interval,
        show_doctor_names: body.show_doctor_names,
        show_estimated_times: body.show_estimated_times,
        operating_hours: body.operating_hours,
        auto_reset_daily: body.auto_reset_daily,
        reset_time: body.reset_time,
      }], {
        onConflict: 'clinic_id'
      })
      .select()
      .single()

    if (error) {
      console.error('[queue/settings] Error saving:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      settings, 
      message: 'Queue settings saved successfully' 
    })
  } catch (error) {
    console.error("[queue/settings] Error:", error)
    return NextResponse.json(
      { error: "Failed to save queue settings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
