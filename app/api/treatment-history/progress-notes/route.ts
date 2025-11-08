import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/progress-notes
 * List progress notes for beauty clinic customer treatments
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - treatment_record_id (optional): Filter by treatment record
 * - note_type (optional): Filter by note type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const treatment_record_id = searchParams.get('treatment_record_id');
    const note_type = searchParams.get('note_type');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('treatment_progress_notes')
      .select(`
        *,
        customer:users!treatment_progress_notes_customer_id_fkey(id, full_name),
        treatment_record:treatment_records(id, treatment_name, treatment_date),
        created_by:users!treatment_progress_notes_created_by_user_id_fkey(id, full_name)
      `)
      .eq('clinic_id', clinic_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (treatment_record_id) {
      query = query.eq('treatment_record_id', treatment_record_id);
    }

    if (note_type) {
      query = query.eq('note_type', note_type);
    }

    const { data, error } = await query.order('note_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching progress notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/treatment-history/progress-notes
 * Create a new progress note for beauty clinic customer treatment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      customer_id,
      treatment_record_id,
      note_type,
      note_date,
      days_after_treatment,
      title,
      description,
      observations,
      measurements,
      improvement_level,
      condition_status,
      side_effects,
      complications,
      action_required,
      actions_taken,
      medications_prescribed,
      follow_up_scheduled,
      next_follow_up_date,
      photo_ids,
      document_urls,
      created_by_user_id,
    } = body;

    if (!clinic_id || !customer_id || !note_type || !description || !created_by_user_id) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, note_type, description, and created_by_user_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('treatment_progress_notes')
      .insert({
        clinic_id,
        customer_id,
        treatment_record_id,
        note_type,
        note_date: note_date || new Date().toISOString(),
        days_after_treatment,
        title,
        description,
        observations,
        measurements,
        improvement_level,
        condition_status,
        side_effects,
        complications,
        action_required: action_required ?? false,
        actions_taken,
        medications_prescribed,
        follow_up_scheduled: follow_up_scheduled ?? false,
        next_follow_up_date,
        photo_ids,
        document_urls,
        created_by_user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating progress note:', error);
    return NextResponse.json(
      { error: 'Failed to create progress note' },
      { status: 500 }
    );
  }
}
