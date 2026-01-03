import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/chat/typing
 * Get typing indicators for a chat room
 * 
 * Query parameters:
 * - room_id (required): Chat room ID
 */
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get('room_id');

    if (!room_id) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Clean up expired indicators first
    await supabase.rpc('cleanup_expired_typing_indicators');

    // Get active typing indicators
    const { data, error } = await supabase
      .from('chat_typing_indicators')
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `)
      .eq('room_id', room_id)
      .eq('is_typing', true)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching typing indicators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch typing indicators' },
      { status: 500 }
    );
  }
})

/**
 * POST /api/chat/typing
 * Update typing indicator status
 * 
 * Body:
 * - room_id (required): Chat room ID
 * - user_id (required): User ID
 * - is_typing (required): Typing status (true/false)
 */
export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { room_id, user_id, is_typing } = body;

    if (!room_id || !user_id || is_typing === undefined) {
      return NextResponse.json(
        { error: 'room_id, user_id, and is_typing are required' },
        { status: 400 }
      );
    }

    if (is_typing) {
      // Upsert typing indicator (will update if exists, insert if not)
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('chat_typing_indicators')
        .upsert(
          {
            room_id,
            user_id,
            is_typing: true,
            expires_at: new Date(Date.now() + 5000).toISOString(), // Expire in 5 seconds
          },
          {
            onConflict: 'room_id,user_id',
          }
        )
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(data);
    } else {
      // Remove typing indicator
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('chat_typing_indicators')
        .delete()
        .eq('room_id', room_id)
        .eq('user_id', user_id);

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Typing indicator removed' });
    }
  } catch (error) {
    console.error('Error updating typing indicator:', error);
    return NextResponse.json(
      { error: 'Failed to update typing indicator' },
      { status: 500 }
    );
  }
})
