import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCenterAuth } from '@/lib/auth/middleware';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/records
 * List program records for beauty center customers
 * 
 * Query parameters:
 * - center_id (required): Center ID
 * - customer_id (optional): Filter by customer
 * - branch_id (optional): Filter by branch
 * - program_category (optional): Filter by category
 * - status (optional): Filter by status
 * - date_from (optional): Start date
 * - date_to (optional): End date
 * - limit (optional): Limit results (default 50)
 */
export const GET = withCenterAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const center_id = searchParams.get('center_id');
    const customer_id = searchParams.get('customer_id');
    const branch_id = searchParams.get('branch_id');
    const program_category = searchParams.get('program_category');
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const limit = searchParams.get('limit');

    if (!center_id) {
      return NextResponse.json(
        { error: 'center_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('program_records')
      .select(`
        *,
        customer:users!program_records_customer_id_fkey(id, full_name, email, phone),
        performed_by:users!program_records_performed_by_user_id_fkey(id, full_name, email),
        branch:branches(id, branch_name)
      `)
      .eq('center_id', center_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (branch_id) {
      query = query.eq('branch_id', branch_id);
    }

    if (program_category) {
      query = query.eq('program_category', program_category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('program_date', date_from);
    }

    if (date_to) {
      query = query.lte('program_date', date_to);
    }

    query = query.order('program_date', { ascending: false });

    if (limit) {
      query = query.limit(Number.parseInt(limit));
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching program records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program records' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/program-history/records
 * Create a new program record for beauty center customer
 */
export const POST = withCenterAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      center_id,
      customer_id,
      booking_id,
      branch_id,
      program_name,
      program_name_en,
      program_code,
      program_category,
      service_ids,
      session_number,
      total_planned_sessions,
      is_part_of_package,
      package_id,
      program_date,
      duration_minutes,
      performed_by_user_id,
      assisted_by_user_ids,
      program_areas,
      products_used,
      equipment_used,
      skin_type,
      skin_concerns,
      allergies,
      contraindications,
      program_intensity,
      program_settings,
      anesthesia_used,
      pain_level,
      satisfaction_rating,
      customer_feedback,
      pre_program_condition,
      immediate_post_program_condition,
      side_effects_observed,
      next_session_recommended_date,
      follow_up_required,
      follow_up_notes,
      status,
      total_cost,
      payment_status,
      consent_form_signed,
      consent_signed_at,
      medical_clearance_required,
      medical_clearance_obtained,
      created_by_user_id,
      notes,
    } = body;

    if (!center_id || !customer_id || !program_name || !program_date) {
      return NextResponse.json(
        { error: 'center_id, customer_id, program_name, and program_date are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_records')
      .insert({
        center_id,
        customer_id,
        booking_id,
        branch_id,
        program_name,
        program_name_en,
        program_code,
        program_category,
        service_ids,
        session_number: session_number ?? 1,
        total_planned_sessions,
        is_part_of_package: is_part_of_package ?? false,
        package_id,
        program_date,
        duration_minutes,
        performed_by_user_id,
        assisted_by_user_ids,
        program_areas,
        products_used,
        equipment_used,
        skin_type,
        skin_concerns,
        allergies,
        contraindications,
        program_intensity,
        program_settings,
        anesthesia_used,
        pain_level,
        satisfaction_rating,
        customer_feedback,
        pre_program_condition,
        immediate_post_program_condition,
        side_effects_observed,
        next_session_recommended_date,
        follow_up_required: follow_up_required ?? false,
        follow_up_notes,
        status: status ?? 'completed',
        total_cost,
        payment_status,
        consent_form_signed: consent_form_signed ?? false,
        consent_signed_at,
        medical_clearance_required: medical_clearance_required ?? false,
        medical_clearance_obtained: medical_clearance_obtained ?? false,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating program record:', error);
    return NextResponse.json(
      { error: 'Failed to create program record' },
      { status: 500 }
    );
  }
});

