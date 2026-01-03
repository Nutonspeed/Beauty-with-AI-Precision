import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/chat/rooms/[id]
 * Get a specific chat room with details
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        customer:users!chat_rooms_customer_id_fkey(id, email, full_name, avatar_url),
        assigned_staff:users!chat_rooms_assigned_staff_id_fkey(id, email, full_name, avatar_url),
        participants:chat_participants(
          user_id,
          role,
          joined_at,
          unread_count,
          user:users(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat room' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/rooms/[id]
 * Update a chat room
 * 
 * Body:
 * - assigned_staff_id (optional): Assign to staff
 * - status (optional): Update status
 * - priority (optional): Update priority
 * - resolution_notes (optional): Add resolution notes
 * - satisfaction_rating (optional): Customer satisfaction rating (1-5)
 * - satisfaction_comment (optional): Satisfaction comment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      assigned_staff_id,
      status,
      priority,
      resolution_notes,
      satisfaction_rating,
      satisfaction_comment,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (assigned_staff_id !== undefined) {
      updateData.assigned_staff_id = assigned_staff_id;
      updateData.assigned_at = new Date().toISOString();
      updateData.auto_assigned = false;

      // Add staff as participant
      if (assigned_staff_id) {
        const supabase = getSupabaseClient();
        await supabase
          .from('chat_participants')
          .insert({
            room_id: params.id,
            user_id: assigned_staff_id,
            role: 'staff',
          })
          .then(() => {
            // Ignore if already exists
          });
      }
    }

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
        if (status === 'closed') {
          updateData.closed_at = new Date().toISOString();
        }
      }
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (resolution_notes !== undefined) {
      updateData.resolution_notes = resolution_notes;
    }

    if (satisfaction_rating !== undefined) {
      if (satisfaction_rating < 1 || satisfaction_rating > 5) {
        return NextResponse.json(
          { error: 'satisfaction_rating must be between 1 and 5' },
          { status: 400 }
        );
      }
      updateData.satisfaction_rating = satisfaction_rating;
      updateData.rated_at = new Date().toISOString();
    }

    if (satisfaction_comment !== undefined) {
      updateData.satisfaction_comment = satisfaction_comment;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('chat_rooms')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to update chat room' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/rooms/[id]
 * Delete a chat room (soft delete by archiving)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Soft delete by setting status to archived
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('chat_rooms')
      .update({
        status: 'archived',
        closed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting chat room:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat room' },
      { status: 500 }
    );
  }
}
