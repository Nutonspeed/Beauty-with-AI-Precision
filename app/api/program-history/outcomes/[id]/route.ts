import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/outcomes/[id]
 * Get program outcome details for beauty center customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_outcomes')
      .select(`
        *,
        customer:users!program_outcomes_customer_id_fkey(id, full_name, email, phone),
        program_record:program_records(id, program_name, program_category, program_date),
        assessor:users!program_outcomes_assessor_user_id_fkey(id, full_name, email)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching program outcome:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program outcome' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/program-history/outcomes/[id]
 * Update program outcome for beauty center customer
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
      .from('program_outcomes')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating program outcome:', error);
    return NextResponse.json(
      { error: 'Failed to update program outcome' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/program-history/outcomes/[id]
 * Delete program outcome (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_outcomes')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting program outcome:', error);
    return NextResponse.json(
      { error: 'Failed to delete program outcome' },
      { status: 500 }
    );
  }
}