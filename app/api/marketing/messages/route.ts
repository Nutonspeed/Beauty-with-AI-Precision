import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/marketing/messages
 * List campaign messages for beauty center customers
 * 
 * Query parameters:
 * - center_id (required): Center ID
 * - campaign_id (optional): Filter by campaign
 * - message_type (optional): Filter by message type
 * - status (optional): Filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const center_id = searchParams.get('center_id');
    const campaign_id = searchParams.get('campaign_id');
    const message_type = searchParams.get('message_type');
    const status = searchParams.get('status');

    if (!center_id) {
      return NextResponse.json(
        { error: 'center_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('campaign_messages')
      .select(`
        *,
        campaign:marketing_campaigns(id, campaign_name, campaign_code),
        target_segment:customer_segments(id, segment_name, customer_count),
        created_by:users!campaign_messages_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('center_id', center_id);

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (message_type) {
      query = query.eq('message_type', message_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching campaign messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/messages
 * Create a new campaign message for beauty center customers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      center_id,
      campaign_id,
      message_type,
      subject,
      message_content,
      message_html,
      target_segment_id,
      scheduled_send_at,
      status = 'draft',
      created_by_user_id,
      notes,
    } = body;

    if (!center_id || !message_type || !message_content) {
      return NextResponse.json(
        { error: 'center_id, message_type, and message_content are required' },
        { status: 400 }
      );
    }

    // For email messages, subject is required
    if (message_type === 'email' && !subject) {
      return NextResponse.json(
        { error: 'subject is required for email messages' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('campaign_messages')
      .insert({
        center_id,
        campaign_id,
        message_type,
        subject,
        message_content,
        message_html,
        target_segment_id,
        scheduled_send_at,
        status,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign message:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign message' },
      { status: 500 }
    );
  }
}

