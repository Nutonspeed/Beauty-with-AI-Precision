import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

// GET /api/queue/entries/[id] - Get single queue entry
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
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

    const { data: entry, error } = await supabaseAdmin
      .from('queue_entries')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('[queue/entries/[id]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!entry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error("[queue/entries/[id]] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch queue entry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Helper function to build update data based on status
function buildUpdateData(body: any): Record<string, unknown> {
  const updateData: Record<string, unknown> = {}

  if (body.status !== undefined) {
    updateData.status = body.status
    const now = new Date().toISOString()
    
    if (body.status === 'called') {
      updateData.called_time = now
      if (body.doctor_id) updateData.doctor_id = body.doctor_id
    } else if (body.status === 'in-service') {
      updateData.service_start_time = now
    } else if (body.status === 'completed') {
      updateData.service_end_time = now
    } else if (body.status === 'cancelled' && body.cancellation_reason) {
      updateData.cancellation_reason = body.cancellation_reason
    }
  }

  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.doctor_id !== undefined) updateData.doctor_id = body.doctor_id

  return updateData
}

// PATCH /api/queue/entries/[id] - Update queue entry (status changes)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
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

    const updateData = buildUpdateData(body)

    const { data: entry, error } = await supabaseAdmin
      .from('queue_entries')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[queue/entries/[id]] Error updating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entry, message: 'Queue entry updated successfully' })
  } catch (error) {
    console.error("[queue/entries/[id]] Error:", error)
    return NextResponse.json(
      { error: "Failed to update queue entry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE /api/queue/entries/[id] - Delete queue entry
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
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

    const { error } = await supabaseAdmin
      .from('queue_entries')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[queue/entries/[id]] Error deleting:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Queue entry deleted successfully' })
  } catch (error) {
    console.error("[queue/entries/[id]] Error:", error)
    return NextResponse.json(
      { error: "Failed to delete queue entry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
