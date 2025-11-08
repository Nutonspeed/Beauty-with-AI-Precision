import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/chat/auto-replies
 * List auto-reply templates
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - is_active (optional): Filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const is_active = searchParams.get('is_active');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('chat_auto_replies')
      .select('*')
      .eq('clinic_id', clinic_id)
      .order('priority', { ascending: false });

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching auto-replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-replies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/auto-replies
 * Create a new auto-reply template
 * 
 * Body:
 * - clinic_id (required): Clinic ID
 * - trigger_keywords (required): Array of keywords
 * - reply_message (required): Auto-reply message
 * - trigger_pattern (optional): Regex pattern
 * - include_staff_assignment (optional): Auto-assign to staff
 * - active_hours_only (optional): Only trigger during business hours
 * - business_hours_start (optional): Start time
 * - business_hours_end (optional): End time
 * - priority (optional): Priority for matching
 * - is_active (optional): Active status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      trigger_keywords,
      reply_message,
      trigger_pattern,
      include_staff_assignment = false,
      active_hours_only = false,
      business_hours_start,
      business_hours_end,
      priority = 0,
      is_active = true,
    } = body;

    if (!clinic_id || !trigger_keywords || !reply_message) {
      return NextResponse.json(
        { error: 'clinic_id, trigger_keywords, and reply_message are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(trigger_keywords)) {
      return NextResponse.json(
        { error: 'trigger_keywords must be an array' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chat_auto_replies')
      .insert({
        clinic_id,
        trigger_keywords,
        reply_message,
        trigger_pattern,
        include_staff_assignment,
        active_hours_only,
        business_hours_start,
        business_hours_end,
        priority,
        is_active,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating auto-reply:', error);
    return NextResponse.json(
      { error: 'Failed to create auto-reply' },
      { status: 500 }
    );
  }
}
