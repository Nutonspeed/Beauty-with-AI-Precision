import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/progress-notes/[id]
 * Get progress note details for beauty center customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_progress_notes')
      .select(`
        *,
        customer:users!program_progress_notes_customer_id_fkey(id, full_name, email),
        program_record:program_records(id, program_name, program_date, program_category),
        created_by:users!program_progress_notes_created_by_user_id_fkey(id, full_name, email)
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
 * PATCH /api/program-history/progress-notes/[id]
 * Update progress note for beauty center customer
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const supabaseClient = getSupabaseClient();

    const { data, error } = await supabaseClient
      .from('program_progress_notes')
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
 * DELETE /api/program-history/progress-notes/[id]
 * Delete progress note (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_progress_notes')
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