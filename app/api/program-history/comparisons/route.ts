import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/comparisons
 * List program comparisons for beauty center customers
 * 
 * Query parameters:
 * - center_id (required): Center ID
 * - customer_id (optional): Filter by customer
 * - comparison_type (optional): Filter by type
 * - is_featured (optional): Filter by featured status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const center_id = searchParams.get('center_id');
    const customer_id = searchParams.get('customer_id');
    const comparison_type = searchParams.get('comparison_type');
    const is_featured = searchParams.get('is_featured');

    if (!center_id) {
      return NextResponse.json(
        { error: 'center_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('program_comparisons')
      .select(`
        *,
        customer:users!program_comparisons_customer_id_fkey(id, full_name),
        created_by:users!program_comparisons_created_by_user_id_fkey(id, full_name)
      `)
      .eq('center_id', center_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (comparison_type) {
      query = query.eq('comparison_type', comparison_type);
    }

    if (is_featured !== null) {
      query = query.eq('is_featured', is_featured === 'true');
    }

    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching program comparisons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program comparisons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/program-history/comparisons
 * Create a new program comparison for beauty center customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      center_id,
      customer_id,
      comparison_name,
      comparison_type,
      program_category,
      before_photo_ids,
      after_photo_ids,
      before_date,
      after_date,
      days_between,
      improvement_notes,
      visible_changes,
      comparison_metrics,
      is_featured,
      approved_for_marketing,
      approved_for_case_study,
      display_order,
      created_by_user_id,
      notes,
    } = body;

    if (!center_id || !customer_id || !comparison_name || !before_photo_ids || !after_photo_ids) {
      return NextResponse.json(
        { error: 'center_id, customer_id, comparison_name, before_photo_ids, and after_photo_ids are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_comparisons')
      .insert({
        center_id,
        customer_id,
        comparison_name,
        comparison_type,
        program_category,
        before_photo_ids,
        after_photo_ids,
        before_date,
        after_date,
        days_between,
        improvement_notes,
        visible_changes,
        comparison_metrics,
        is_featured: is_featured ?? false,
        approved_for_marketing: approved_for_marketing ?? false,
        approved_for_case_study: approved_for_case_study ?? false,
        display_order: display_order ?? 0,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating program comparison:', error);
    return NextResponse.json(
      { error: 'Failed to create program comparison' },
      { status: 500 }
    );
  }
}

