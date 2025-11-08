import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/comparisons
 * List treatment comparisons for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - comparison_type (optional): Filter by type
 * - is_featured (optional): Filter by featured status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const comparison_type = searchParams.get('comparison_type');
    const is_featured = searchParams.get('is_featured');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('treatment_comparisons')
      .select(`
        *,
        customer:users!treatment_comparisons_customer_id_fkey(id, full_name),
        created_by:users!treatment_comparisons_created_by_user_id_fkey(id, full_name)
      `)
      .eq('clinic_id', clinic_id)
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
    console.error('Error fetching treatment comparisons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment comparisons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/treatment-history/comparisons
 * Create a new treatment comparison for beauty clinic customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      customer_id,
      comparison_name,
      comparison_type,
      treatment_category,
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

    if (!clinic_id || !customer_id || !comparison_name || !before_photo_ids || !after_photo_ids) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, comparison_name, before_photo_ids, and after_photo_ids are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('treatment_comparisons')
      .insert({
        clinic_id,
        customer_id,
        comparison_name,
        comparison_type,
        treatment_category,
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
    console.error('Error creating treatment comparison:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment comparison' },
      { status: 500 }
    );
  }
}
