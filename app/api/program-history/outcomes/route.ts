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
 * GET /api/program-history/outcomes
 * List program outcomes for beauty center customers
 * 
 * Query parameters:
 * - center_id (required): Center ID
 * - customer_id (optional): Filter by customer
 * - program_record_id (optional): Filter by program record
 * - overall_result (optional): Filter by result
 */
export const GET = withCenterAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const center_id = searchParams.get('center_id');
    const customer_id = searchParams.get('customer_id');
    const program_record_id = searchParams.get('program_record_id');
    const overall_result = searchParams.get('overall_result');

    if (!center_id) {
      return NextResponse.json(
        { error: 'center_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('program_outcomes')
      .select(`
        *,
        customer:users!program_outcomes_customer_id_fkey(id, full_name, email),
        program_record:program_records(id, program_name, program_category),
        assessor:users!program_outcomes_assessor_user_id_fkey(id, full_name)
      `)
      .eq('center_id', center_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (program_record_id) {
      query = query.eq('program_record_id', program_record_id);
    }

    if (overall_result) {
      query = query.eq('overall_result', overall_result);
    }

    const { data, error } = await query.order('assessment_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching program outcomes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program outcomes' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/program-history/outcomes
 * Create a new program outcome assessment for beauty center customer
 */
export const POST = withCenterAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      center_id,
      customer_id,
      program_record_id,
      assessment_date,
      assessor_user_id,
      overall_result,
      goals_achieved,
      customer_satisfaction,
      primary_goal,
      primary_goal_achieved,
      secondary_goals,
      secondary_goals_achieved,
      before_measurements,
      after_measurements,
      improvement_percentage,
      before_photo_ids,
      after_photo_ids,
      visual_improvement_rating,
      skin_condition_improvement,
      side_effects_summary,
      complications_summary,
      total_sessions_completed,
      program_start_date,
      program_end_date,
      total_duration_days,
      maintenance_required,
      maintenance_schedule,
      recommended_products,
      recommended_follow_up_programs,
      would_recommend,
      testimonial,
      testimonial_approved_for_use,
      total_cost_incurred,
      notes,
    } = body;

    if (!center_id || !customer_id || !assessment_date || !overall_result) {
      return NextResponse.json(
        { error: 'center_id, customer_id, assessment_date, and overall_result are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_outcomes')
      .insert({
        center_id,
        customer_id,
        program_record_id,
        assessment_date,
        assessor_user_id,
        overall_result,
        goals_achieved: goals_achieved ?? false,
        customer_satisfaction,
        primary_goal,
        primary_goal_achieved,
        secondary_goals,
        secondary_goals_achieved,
        before_measurements,
        after_measurements,
        improvement_percentage,
        before_photo_ids,
        after_photo_ids,
        visual_improvement_rating,
        skin_condition_improvement,
        side_effects_summary,
        complications_summary,
        total_sessions_completed,
        program_start_date,
        program_end_date,
        total_duration_days,
        maintenance_required: maintenance_required ?? false,
        maintenance_schedule,
        recommended_products,
        recommended_follow_up_programs,
        would_recommend,
        testimonial,
        testimonial_approved_for_use: testimonial_approved_for_use ?? false,
        total_cost_incurred,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    const outcome = data;
    return NextResponse.json(outcome, { status: 201 });
  } catch (error) {
    console.error('Error creating program outcome:', error);
    return NextResponse.json(
      { error: 'Failed to create program outcome' },
      { status: 500 }
    );
  }
});

