import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get('lead_id')
    const roomId = searchParams.get('room_id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!roomId && !leadId) {
      return NextResponse.json(
        { error: "Either room_id or lead_id is required" },
        { status: 400 }
      )
    }

    let finalRoomId = roomId

    // If lead_id provided, find or create chat room
    if (leadId && !roomId) {
      // Get lead details
      const { data: lead, error: leadError } = await supabase
        .from('sales_leads')
        .select('id, customer_user_id, sales_user_id')
        .eq('id', leadId)
        .single()

      if (leadError || !lead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        )
      }

      // Check if chat room exists for this lead
      const { data: existingRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('metadata->lead_id', leadId)
        .maybeSingle()

      if (existingRoom) {
        finalRoomId = existingRoom.id
      } else {
        // Create new chat room for this lead
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            name: `Lead Chat: ${lead.id}`,
            type: 'direct',
            metadata: { lead_id: leadId },
            created_by: user.id
          })
          .select('id')
          .single()

        if (createError || !newRoom) {
          console.error('[chat-messages] Error creating room:', createError)
          return NextResponse.json(
            { error: "Failed to create chat room" },
            { status: 500 }
          )
        }

        finalRoomId = newRoom.id

        // Add participants
        const participants = [
          { room_id: finalRoomId, user_id: lead.sales_user_id, role: 'member' },
        ]
        if (lead.customer_user_id) {
          participants.push({
            room_id: finalRoomId,
            user_id: lead.customer_user_id,
            role: 'member'
          })
        }

        await supabase.from('chat_participants').insert(participants)
      }
    }

    // Fetch messages from chat_messages table
    const { data: messages, error: messagesError, count } = await supabase
      .from('chat_messages')
      .select(`
        id,
        sender_id,
        sender_type,
        message_type,
        content,
        attachments,
        is_system_message,
        is_edited,
        edited_at,
        sent_at,
        delivered_at,
        read_by,
        reply_to_message_id,
        created_at,
        sender:users!chat_messages_sender_id_fkey(id, email, full_name)
      `, { count: 'exact' })
      .eq('room_id', finalRoomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('[chat-messages] Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      messages: messages || [],
      total: count || 0,
      room_id: finalRoomId,
      limit,
      offset,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[chat-messages] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      room_id,
      lead_id,
      content,
      message_type = 'text',
      attachments = [],
      reply_to_message_id = null
    } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      )
    }

    let finalRoomId = room_id

    // If lead_id provided but no room_id, find or create room
    if (lead_id && !room_id) {
      const { data: lead, error: leadError } = await supabase
        .from('sales_leads')
        .select('id, customer_user_id, sales_user_id')
        .eq('id', lead_id)
        .single()

      if (leadError || !lead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        )
      }

      // Check if chat room exists
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('metadata->lead_id', lead_id)
        .maybeSingle()

      if (existingRoom) {
        finalRoomId = existingRoom.id
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            name: `Lead Chat: ${lead.id}`,
            type: 'direct',
            metadata: { lead_id },
            created_by: user.id
          })
          .select('id')
          .single()

        if (createError || !newRoom) {
          return NextResponse.json(
            { error: "Failed to create chat room" },
            { status: 500 }
          )
        }

        finalRoomId = newRoom.id

        // Add participants
        const participants = [
          { room_id: finalRoomId, user_id: lead.sales_user_id, role: 'member' }
        ]
        if (lead.customer_user_id) {
          participants.push({
            room_id: finalRoomId,
            user_id: lead.customer_user_id,
            role: 'member'
          })
        }

        await supabase.from('chat_participants').insert(participants)
      }
    }

    if (!finalRoomId) {
      return NextResponse.json(
        { error: "room_id or lead_id is required" },
        { status: 400 }
      )
    }

    // Determine sender type based on user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const senderType = userData?.role === 'sales_staff' ? 'staff' : 'customer'

    // Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        room_id: finalRoomId,
        sender_id: user.id,
        sender_type: senderType,
        message_type,
        content: content.trim(),
        attachments,
        reply_to_message_id,
        sent_at: new Date().toISOString()
      })
      .select(`
        id,
        sender_id,
        sender_type,
        message_type,
        content,
        attachments,
        is_system_message,
        sent_at,
        created_at,
        sender:users!chat_messages_sender_id_fkey(id, email, full_name)
      `)
      .single()

    if (insertError) {
      console.error('[chat-messages] Error inserting message:', insertError)
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      )
    }

    // Update room's last_message_at
    await supabase
      .from('chat_rooms')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', finalRoomId)

    return NextResponse.json({
      success: true,
      message: newMessage,
      room_id: finalRoomId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[chat-messages] Error sending message:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
