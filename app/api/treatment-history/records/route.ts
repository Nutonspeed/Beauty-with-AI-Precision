import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/records
 * List treatment records for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - branch_id (optional): Filter by branch
 * - treatment_category (optional): Filter by category
 * - status (optional): Filter by status
 * - date_from (optional): Start date
 * - date_to (optional): End date
 * - limit (optional): Limit results (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const branch_id = searchParams.get('branch_id');
    const treatment_category = searchParams.get('treatment_category');
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const limit = searchParams.get('limit');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('treatment_records')
      .select(`
        *,
        customer:users!treatment_records_customer_id_fkey(id, full_name, email, phone),
        performed_by:users!treatment_records_performed_by_user_id_fkey(id, full_name, email),
        branch:branches(id, branch_name)
      `)
      .eq('clinic_id', clinic_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (branch_id) {
      query = query.eq('branch_id', branch_id);
    }

    if (treatment_category) {
      query = query.eq('treatment_category', treatment_category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('treatment_date', date_from);
    }

    if (date_to) {
      query = query.lte('treatment_date', date_to);
    }

    query = query.order('treatment_date', { ascending: false });

    if (limit) {
      query = query.limit(Number.parseInt(limit));
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching treatment records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/treatment-history/records
 * Create a new treatment record for beauty clinic customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      customer_id,
      booking_id,
      branch_id,
      treatment_name,
      treatment_name_en,
      treatment_code,
      treatment_category,
      service_ids,
      session_number,
      total_planned_sessions,
      is_part_of_package,
      package_id,
      treatment_date,
      duration_minutes,
      performed_by_user_id,
      assisted_by_user_ids,
      treatment_areas,
      products_used,
      equipment_used,
      skin_type,
      skin_concerns,
      allergies,
      contraindications,
      treatment_intensity,
      treatment_settings,
      anesthesia_used,
      pain_level,
      satisfaction_rating,
      customer_feedback,
      pre_treatment_condition,
      immediate_post_treatment_condition,
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

    if (!clinic_id || !customer_id || !treatment_name || !treatment_date) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, treatment_name, and treatment_date are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('treatment_records')
      .insert({
        clinic_id,
        customer_id,
        booking_id,
        branch_id,
        treatment_name,
        treatment_name_en,
        treatment_code,
        treatment_category,
        service_ids,
        session_number: session_number ?? 1,
        total_planned_sessions,
        is_part_of_package: is_part_of_package ?? false,
        package_id,
        treatment_date,
        duration_minutes,
        performed_by_user_id,
        assisted_by_user_ids,
        treatment_areas,
        products_used,
        equipment_used,
        skin_type,
        skin_concerns,
        allergies,
        contraindications,
        treatment_intensity,
        treatment_settings,
        anesthesia_used,
        pain_level,
        satisfaction_rating,
        customer_feedback,
        pre_treatment_condition,
        immediate_post_treatment_condition,
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
    console.error('Error creating treatment record:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment record' },
      { status: 500 }
    );
  }
}
