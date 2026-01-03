import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/marketing/segments
 * List customer segments for beauty clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - segment_type (optional): Filter by segment type
 * - is_active (optional): Filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const segment_type = searchParams.get('segment_type');
    const is_active = searchParams.get('is_active');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('customer_segments')
      .select(`
        *,
        created_by:users!customer_segments_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('clinic_id', clinic_id);

    if (segment_type) {
      query = query.eq('segment_type', segment_type);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer segments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/segments
 * Create a new customer segment for beauty clinic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      segment_name,
      segment_name_en,
      description,
      segment_type,
      criteria,
      is_dynamic,
      is_active,
      created_by_user_id,
      notes,
    } = body;

    if (!clinic_id || !segment_name || !segment_type) {
      return NextResponse.json(
        { error: 'clinic_id, segment_name, and segment_type are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('customer_segments')
      .insert({
        clinic_id,
        segment_name,
        segment_name_en,
        description,
        segment_type,
        criteria,
        is_dynamic: is_dynamic ?? false,
        is_active: is_active ?? true,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating customer segment:', error);
    return NextResponse.json(
      { error: 'Failed to create customer segment' },
      { status: 500 }
    );
  }
}

