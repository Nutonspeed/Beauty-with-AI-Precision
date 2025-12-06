import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/chat/unread
 * Get unread message count for a user
 * 
 * Query parameters:
 * - user_id (required): User ID
 * - room_id (optional): Specific room ID (if not provided, returns total across all rooms)
 */
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const room_id = searchParams.get('room_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Call the database function to get unread count
    const { data, error } = await supabase.rpc('get_unread_message_count', {
      p_user_id: user_id,
      p_room_id: room_id,
    });

    if (error) throw error;

    return NextResponse.json({
      user_id,
      room_id: room_id || null,
      unread_count: data || 0,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
})
