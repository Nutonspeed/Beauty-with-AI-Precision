import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/outcomes
 * List treatment outcomes for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - treatment_record_id (optional): Filter by treatment record
 * - overall_result (optional): Filter by result
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const treatment_record_id = searchParams.get('treatment_record_id');
    const overall_result = searchParams.get('overall_result');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('treatment_outcomes')
      .select(`
        *,
        customer:users!treatment_outcomes_customer_id_fkey(id, full_name, email),
        treatment_record:treatment_records(id, treatment_name, treatment_category),
        assessor:users!treatment_outcomes_assessor_user_id_fkey(id, full_name)
      `)
      .eq('clinic_id', clinic_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (treatment_record_id) {
      query = query.eq('treatment_record_id', treatment_record_id);
    }

    if (overall_result) {
      query = query.eq('overall_result', overall_result);
    }

    const { data, error } = await query.order('assessment_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching treatment outcomes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment outcomes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/treatment-history/outcomes
 * Create a new treatment outcome assessment for beauty clinic customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      customer_id,
      treatment_record_id,
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
      treatment_start_date,
      treatment_end_date,
      total_duration_days,
      maintenance_required,
      maintenance_schedule,
      recommended_products,
      recommended_follow_up_treatments,
      would_recommend,
      testimonial,
      testimonial_approved_for_use,
      total_cost_incurred,
      notes,
    } = body;

    if (!clinic_id || !customer_id || !assessment_date || !overall_result) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, assessment_date, and overall_result are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('treatment_outcomes')
      .insert({
        clinic_id,
        customer_id,
        treatment_record_id,
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
        treatment_start_date,
        treatment_end_date,
        total_duration_days,
        maintenance_required: maintenance_required ?? false,
        maintenance_schedule,
        recommended_products,
        recommended_follow_up_treatments,
        would_recommend,
        testimonial,
        testimonial_approved_for_use: testimonial_approved_for_use ?? false,
        total_cost_incurred,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating treatment outcome:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment outcome' },
      { status: 500 }
    );
  }
}
