import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/marketing/messages/[id]
 * Get campaign message details for beauty clinic
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('campaign_messages')
      .select(`
        *,
        campaign:marketing_campaigns(id, campaign_name, campaign_code),
        target_segment:customer_segments(id, segment_name, customer_count),
        created_by:users!campaign_messages_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching campaign message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign message' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketing/messages/[id]
 * Update campaign message for beauty clinic customers
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('campaign_messages')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating campaign message:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign message' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketing/messages/[id]
 * Delete campaign message (only if not sent)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check if message has been sent
    const { data: message, error: checkError } = await supabase
      .from('campaign_messages')
      .select('status, sent_at')
      .eq('id', params.id)
      .single();

    if (checkError) throw checkError;

    if (message.status === 'sent' || message.sent_at) {
      return NextResponse.json(
        { error: 'Cannot delete sent messages' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('campaign_messages')
      .update({ status: 'failed' })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting campaign message:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign message' },
      { status: 500 }
    );
  }
}
