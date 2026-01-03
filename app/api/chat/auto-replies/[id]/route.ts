import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/chat/auto-replies/[id]
 * Get a specific auto-reply template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('chat_auto_replies')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Auto-reply not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-reply' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/auto-replies/[id]
 * Update an auto-reply template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      trigger_keywords,
      trigger_pattern,
      reply_message,
      include_staff_assignment,
      active_hours_only,
      business_hours_start,
      business_hours_end,
      priority,
      is_active,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (trigger_keywords !== undefined) updateData.trigger_keywords = trigger_keywords;
    if (trigger_pattern !== undefined) updateData.trigger_pattern = trigger_pattern;
    if (reply_message !== undefined) updateData.reply_message = reply_message;
    if (include_staff_assignment !== undefined)
      updateData.include_staff_assignment = include_staff_assignment;
    if (active_hours_only !== undefined) updateData.active_hours_only = active_hours_only;
    if (business_hours_start !== undefined) updateData.business_hours_start = business_hours_start;
    if (business_hours_end !== undefined) updateData.business_hours_end = business_hours_end;
    if (priority !== undefined) updateData.priority = priority;
    if (is_active !== undefined) updateData.is_active = is_active;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('chat_auto_replies')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to update auto-reply' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/auto-replies/[id]
 * Delete an auto-reply template
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('chat_auto_replies')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete auto-reply' },
      { status: 500 }
    );
  }
}
