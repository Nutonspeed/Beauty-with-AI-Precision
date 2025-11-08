import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/chat/messages/[id]/read
 * Mark a message as read by a user
 * 
 * Body:
 * - user_id (required): User ID who read the message
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Call the database function to mark as read
    const { data, error } = await supabase.rpc('mark_message_as_read', {
      p_message_id: params.id,
      p_user_id: user_id,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      marked_as_read: data,
      message: data ? 'Message marked as read' : 'Message was already read',
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}
