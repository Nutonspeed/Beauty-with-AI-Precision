import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET /api/queue/entries - List queue entries with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinic_id = searchParams.get("clinic_id")
    const status = searchParams.get("status")
    const date = searchParams.get("date") // YYYY-MM-DD format

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

    let query = supabaseAdmin
      .from('queue_entries')
      .select('*')
      .eq('clinic_id', clinic_id)

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    // Filter by date (today by default)
    if (date) {
      const startOfDay = `${date}T00:00:00+07:00`
      const endOfDay = `${date}T23:59:59+07:00`
      query = query.gte('check_in_time', startOfDay).lte('check_in_time', endOfDay)
    } else {
      // Default to today
      const now = new Date()
      const bangkokTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      const today = bangkokTime.toISOString().split('T')[0]
      const startOfDay = `${today}T00:00:00+07:00`
      const endOfDay = `${today}T23:59:59+07:00`
      query = query.gte('check_in_time', startOfDay).lte('check_in_time', endOfDay)
    }

    // Order by priority (emergency first) and queue number
    query = query.order('priority', { ascending: true }).order('queue_number', { ascending: true })

    const { data: entries, error } = await query

    if (error) {
      console.error('[queue/entries] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entries: entries || [] })
  } catch (error) {
    console.error("[queue/entries] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch queue entries", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST /api/queue/entries - Add customer to queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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

    // Get next queue number
    const { data: nextNumberData } = await supabaseAdmin
      .rpc('get_next_queue_number', { p_clinic_id: body.clinic_id })

    const queueNumber = nextNumberData || 1

    // Calculate estimated wait time
    const { data: estimatedTime } = await supabaseAdmin
      .rpc('calculate_estimated_wait_time', {
        p_clinic_id: body.clinic_id,
        p_priority: body.priority || 'normal'
      })

    const estimatedWaitTime = estimatedTime || 15

    // Create queue entry
    const now = new Date()
    const estimatedCallTime = new Date(now.getTime() + estimatedWaitTime * 60000)

    const { data: entry, error } = await supabaseAdmin
      .from('queue_entries')
      .insert([{
        queue_number: queueNumber,
        customer_id: body.customer_id,
        customer_name: body.customer_name,
        clinic_id: body.clinic_id,
        doctor_id: body.doctor_id,
        appointment_type: body.appointment_type || 'Walk-in',
        priority: body.priority || 'normal',
        estimated_wait_time: estimatedWaitTime,
        estimated_call_time: estimatedCallTime.toISOString(),
        notes: body.notes,
      }])
      .select()
      .single()

    if (error) {
      console.error('[queue/entries] Error creating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      entry, 
      message: `Added to queue #${queueNumber}. Estimated wait: ${estimatedWaitTime} minutes` 
    })
  } catch (error) {
    console.error("[queue/entries] Error:", error)
    return NextResponse.json(
      { error: "Failed to create queue entry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
