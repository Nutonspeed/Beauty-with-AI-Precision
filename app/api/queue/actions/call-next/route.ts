import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// POST /api/queue/actions/call-next - Call next customer in queue
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

    // Get today's waiting entries
    const now = new Date()
    const bangkokTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
    const today = bangkokTime.toISOString().split('T')[0]
    const startOfDay = `${today}T00:00:00+07:00`
    const endOfDay = `${today}T23:59:59+07:00`

    const { data: waitingEntries, error: fetchError } = await supabaseAdmin
      .from('queue_entries')
      .select('*')
      .eq('clinic_id', body.clinic_id)
      .eq('status', 'waiting')
      .gte('check_in_time', startOfDay)
      .lte('check_in_time', endOfDay)
      .order('priority', { ascending: true }) // emergency first
      .order('queue_number', { ascending: true })

    if (fetchError) {
      console.error('[queue/call-next] Error fetching:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!waitingEntries || waitingEntries.length === 0) {
      return NextResponse.json({ 
        message: 'No customers waiting',
        entry: null 
      }, { status: 200 })
    }

    // Call the first entry
    const nextEntry = waitingEntries[0]
    const { data: updatedEntry, error: updateError } = await supabaseAdmin
      .from('queue_entries')
      .update({
        status: 'called',
        called_time: new Date().toISOString(),
        doctor_id: body.doctor_id || nextEntry.doctor_id
      })
      .eq('id', nextEntry.id)
      .select()
      .single()

    if (updateError) {
      console.error('[queue/call-next] Error updating:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      entry: updatedEntry,
      message: `Called: ${updatedEntry.customer_name} (Queue #${updatedEntry.queue_number})`
    })
  } catch (error) {
    console.error("[queue/call-next] Error:", error)
    return NextResponse.json(
      { error: "Failed to call next customer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
