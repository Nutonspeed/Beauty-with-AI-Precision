import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET /api/queue/stats - Get queue statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinic_id = searchParams.get("clinic_id")
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

    // Determine date range
    let targetDate = date
    if (!targetDate) {
      const now = new Date()
      const bangkokTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      targetDate = bangkokTime.toISOString().split('T')[0]
    }

    const startOfDay = `${targetDate}T00:00:00+07:00`
    const endOfDay = `${targetDate}T23:59:59+07:00`

    // Get all entries for the day
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('queue_entries')
      .select('*')
      .eq('clinic_id', clinic_id)
      .gte('check_in_time', startOfDay)
      .lte('check_in_time', endOfDay)

    if (entriesError) {
      console.error('[queue/stats] Error fetching entries:', entriesError)
      return NextResponse.json({ error: entriesError.message }, { status: 500 })
    }

    // Calculate statistics
    const allEntries = entries || []
    const stats = {
      total: allEntries.length,
      waiting: allEntries.filter(e => e.status === 'waiting').length,
      called: allEntries.filter(e => e.status === 'called').length,
      inService: allEntries.filter(e => e.status === 'in-service').length,
      completed: allEntries.filter(e => e.status === 'completed').length,
      cancelled: allEntries.filter(e => e.status === 'cancelled').length,
      noShow: allEntries.filter(e => e.status === 'no-show').length,
      
      // Calculate averages
      averageWaitTime: calculateAverageWaitTime(allEntries),
      averageServiceTime: calculateAverageServiceTime(allEntries),
      
      // Current queue info
      currentQueueNumber: Math.max(...allEntries.map(e => e.queue_number), 0),
      nextQueueNumber: Math.max(...allEntries.map(e => e.queue_number), 0) + 1
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[queue/stats] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch queue statistics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Helper function to calculate average wait time
function calculateAverageWaitTime(entries: any[]): number {
  const entriesWithWaitTime = entries.filter(e => 
    e.actual_wait_time !== null && e.actual_wait_time !== undefined
  )
  
  if (entriesWithWaitTime.length === 0) return 0
  
  const total = entriesWithWaitTime.reduce((sum, e) => sum + e.actual_wait_time, 0)
  return Math.round(total / entriesWithWaitTime.length)
}

// Helper function to calculate average service time
function calculateAverageServiceTime(entries: any[]): number {
  const entriesWithServiceTime = entries.filter(e => 
    e.actual_service_time !== null && e.actual_service_time !== undefined
  )
  
  if (entriesWithServiceTime.length === 0) return 0
  
  const total = entriesWithServiceTime.reduce((sum, e) => sum + e.actual_service_time, 0)
  return Math.round(total / entriesWithServiceTime.length)
}
