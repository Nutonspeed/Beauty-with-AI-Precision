import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/chat/participants
 * Get participants in a chat room
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

    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        *,
        user:users(id, email, full_name, avatar_url)
      `)
      .eq('room_id', room_id)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
})

/**
 * POST /api/chat/participants
 * Add a participant to a chat room
 * 
 * Body:
 * - room_id (required): Chat room ID
 * - user_id (required): User ID to add
 * - role (optional): Participant role (customer, staff, observer, supervisor)
 */
export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { room_id, user_id, role = 'participant' } = body;

    if (!room_id || !user_id) {
      return NextResponse.json(
        { error: 'room_id and user_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chat_participants')
      .insert({
        room_id,
        user_id,
        role,
      })
      .select(`
        *,
        user:users(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
})
