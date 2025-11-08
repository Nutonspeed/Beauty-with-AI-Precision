import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/progress-notes/[id]
 * Get progress note details for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('treatment_progress_notes')
      .select(`
        *,
        customer:users!treatment_progress_notes_customer_id_fkey(id, full_name, email),
        treatment_record:treatment_records(id, treatment_name, treatment_date, treatment_category),
        created_by:users!treatment_progress_notes_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching progress note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress note' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/treatment-history/progress-notes/[id]
 * Update progress note for beauty clinic customer
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('treatment_progress_notes')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating progress note:', error);
    return NextResponse.json(
      { error: 'Failed to update progress note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/treatment-history/progress-notes/[id]
 * Delete progress note (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('treatment_progress_notes')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting progress note:', error);
    return NextResponse.json(
      { error: 'Failed to delete progress note' },
      { status: 500 }
    );
  }
}
