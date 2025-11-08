import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/chat/participants/[id]
 * Update a participant (e.g., mark as left, update notification settings)
 * 
 * Body:
 * - is_active (optional): Active status
 * - notifications_enabled (optional): Notification settings
 * - muted_until (optional): Mute until timestamp
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { is_active, notifications_enabled, muted_until } = body;

    const updateData: Record<string, unknown> = {};

    if (is_active !== undefined) {
      updateData.is_active = is_active;
      if (!is_active) {
        updateData.left_at = new Date().toISOString();
      }
    }

    if (notifications_enabled !== undefined) {
      updateData.notifications_enabled = notifications_enabled;
    }

    if (muted_until !== undefined) {
      updateData.muted_until = muted_until;
    }

    const { data, error } = await supabase
      .from('chat_participants')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/participants/[id]
 * Remove a participant from a chat room
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Soft delete by marking as inactive
    const { data, error } = await supabase
      .from('chat_participants')
      .update({
        is_active: false,
        left_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
}
