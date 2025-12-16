import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"

export const dynamic = 'force-dynamic'

/**
 * GET /api/sales/video-call - Get video call session details
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const callId = searchParams.get('call_id')
    const leadId = searchParams.get('lead_id')

    if (!callId && !leadId) {
      return NextResponse.json(
        { error: "Either call_id or lead_id is required" },
        { status: 400 }
      )
    }

    // Query video call sessions
    let query = supabase
      .from('video_call_sessions')
      .select(`
        *,
        lead:sales_leads(id, name, email, phone),
        host:users!video_call_sessions_host_id_fkey(id, email, full_name),
        participants:video_call_participants(
          id,
          user_id,
          joined_at,
          left_at,
          user:users(id, email, full_name)
        )
      `)

    if (callId) {
      query = query.eq('id', callId)
    } else if (leadId) {
      query = query.eq('lead_id', leadId).order('created_at', { ascending: false })
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('[video-call] Error fetching sessions:', error)
      return NextResponse.json(
        { error: "Failed to fetch video call sessions" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessions: callId ? (sessions?.[0] || null) : sessions,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[video-call] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sales/video-call - Create new video call session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { lead_id, participant_ids = [] } = body

    if (!lead_id) {
      return NextResponse.json(
        { error: "lead_id is required" },
        { status: 400 }
      )
    }

    // Verify lead exists and user has access
    const { data: lead, error: leadError } = await supabase
      .from('sales_leads')
      .select('id, sales_user_id, customer_user_id')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }

    // Create video call session
    const { data: session, error: sessionError } = await supabase
      .from('video_call_sessions')
      .insert({
        lead_id,
        host_id: user.id,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        lead:sales_leads(id, name, email, phone),
        host:users!video_call_sessions_host_id_fkey(id, email, full_name)
      `)
      .single()

    if (sessionError || !session) {
      console.error('[video-call] Error creating session:', sessionError)
      return NextResponse.json(
        { error: "Failed to create video call session" },
        { status: 500 }
      )
    }

    // Add host as participant
    const participants = [
      {
        session_id: session.id,
        user_id: user.id,
        role: 'host'
      }
    ]

    // Add lead customer if available
    if (lead.customer_user_id) {
      participants.push({
        session_id: session.id,
        user_id: lead.customer_user_id,
        role: 'participant'
      })
    }

    // Add additional participants
    participant_ids.forEach((participantId: string) => {
      if (participantId !== user.id && participantId !== lead.customer_user_id) {
        participants.push({
          session_id: session.id,
          user_id: participantId,
          role: 'participant'
        })
      }
    })

    await supabase.from('video_call_participants').insert(participants)

    // Log activity
    await supabase.from('sales_activities').insert({
      lead_id,
      sales_user_id: user.id,
      type: 'call',
      subject: 'Video Call Scheduled',
      description: `Video call session created: ${session.id}`,
      metadata: { session_id: session.id }
    })

    return NextResponse.json({
      success: true,
      session,
      call_id: session.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[video-call] Error creating session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sales/video-call - Update video call status
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { call_id, status, action } = body

    if (!call_id) {
      return NextResponse.json(
        { error: "call_id is required" },
        { status: 400 }
      )
    }

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('video_call_sessions')
      .select('*')
      .eq('id', call_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Video call session not found" },
        { status: 404 }
      )
    }

    let updates: any = {}

    // Handle different actions
    switch (action) {
      case 'start':
        updates = {
          status: 'active',
          started_at: new Date().toISOString()
        }
        break
      case 'end':
        updates = {
          status: 'completed',
          ended_at: new Date().toISOString()
        }
        break
      case 'join':
        // Update participant join time
        await supabase
          .from('video_call_participants')
          .update({ joined_at: new Date().toISOString() })
          .eq('session_id', call_id)
          .eq('user_id', user.id)
        break
      case 'leave':
        // Update participant leave time
        await supabase
          .from('video_call_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('session_id', call_id)
          .eq('user_id', user.id)
        break
      default:
        if (status) {
          updates = { status }
        }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('video_call_sessions')
        .update(updates)
        .eq('id', call_id)

      if (updateError) {
        console.error('[video-call] Error updating session:', updateError)
        return NextResponse.json(
          { error: "Failed to update video call session" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      action,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[video-call] Error updating session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
