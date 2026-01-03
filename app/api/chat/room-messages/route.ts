import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/chat/room-messages
 * Get messages for a chat room
 * 
 * Query parameters:
 * - room_id (required): Chat room ID
 * - limit (optional): Number of messages to fetch (default: 50)
 * - offset (optional): Pagination offset
 * - before_id (optional): Get messages before this message ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get('room_id');
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const offset = Number.parseInt(searchParams.get('offset') || '0');
    const before_id = searchParams.get('before_id');

    if (!room_id) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    let query = supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, email, full_name, avatar_url),
        reply_to:chat_messages!chat_messages_reply_to_message_id_fkey(id, content, sender_id)
      `)
      .eq('room_id', room_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (before_id) {
      // Get messages before a specific message (for pagination)
      const supabaseClient = getSupabaseClient();
      const { data: beforeMessage } = await supabaseClient
        .from('chat_messages')
        .select('created_at')
        .eq('id', before_id)
        .single();

      if (beforeMessage) {
        query = query.lt('created_at', beforeMessage.created_at);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Reverse to show oldest first
    const messages = data ? data.toReversed() : [];

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/room-messages
 * Send a new message
 * 
 * Body:
 * - room_id (required): Chat room ID
 * - sender_id (required): Sender user ID
 * - content (required): Message content
 * - sender_type (required): 'customer', 'staff', or 'system'
 * - message_type (optional): 'text', 'image', 'file', 'system_notification'
 * - attachments (optional): Array of file attachments
 * - reply_to_message_id (optional): Reply to a specific message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      room_id,
      sender_id,
      content,
      sender_type,
      message_type = 'text',
      attachments = [],
      reply_to_message_id,
    } = body;

    if (!room_id || !sender_id || !content || !sender_type) {
      return NextResponse.json(
        { error: 'room_id, sender_id, content, and sender_type are required' },
        { status: 400 }
      );
    }

    // Verify sender_type is valid
    if (!['customer', 'staff', 'system'].includes(sender_type)) {
      return NextResponse.json(
        { error: 'sender_type must be customer, staff, or system' },
        { status: 400 }
      );
    }

    // Create the message
    const supabase = getSupabaseClient();
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        room_id,
        sender_id,
        sender_type,
        content,
        message_type,
        attachments,
        reply_to_message_id,
        sent_at: new Date().toISOString(),
      })
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, email, full_name, avatar_url)
      `)
      .single();

    if (messageError) throw messageError;

    // Check for auto-reply triggers if this is a customer message
    if (sender_type === 'customer') {
      const { data: autoReplies } = await supabase
        .from('chat_auto_replies')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (autoReplies && autoReplies.length > 0) {
        const lowerContent = content.toLowerCase();

        for (const reply of autoReplies) {
          const keywords = reply.trigger_keywords as string[];
          const hasKeyword = keywords.some((keyword: string) =>
            lowerContent.includes(keyword.toLowerCase())
          );

          if (hasKeyword) {
            // Send auto-reply
            const supabaseClient = getSupabaseClient();
            await supabaseClient.from('chat_messages').insert({
              room_id,
              sender_id,
              sender_type: 'system',
              message_type: 'system_notification',
              content: reply.reply_message,
              is_system_message: true,
            });

            // Update trigger count
            await supabaseClient
              .from('chat_auto_replies')
              .update({
                triggered_count: reply.triggered_count + 1,
                last_triggered_at: new Date().toISOString(),
              })
              .eq('id', reply.id);

            break; // Only trigger first matching auto-reply
          }
        }
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
