import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/comparisons/[id]
 * Get program comparison details for beauty center customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_comparisons')
      .select(`
        *,
        customer:users!program_comparisons_customer_id_fkey(id, full_name, email),
        created_by:users!program_comparisons_created_by_user_id_fkey(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching program comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program comparison' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/program-history/comparisons/[id]
 * Update program comparison for beauty center customer
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
      .from('program_comparisons')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating program comparison:', error);
    return NextResponse.json(
      { error: 'Failed to update program comparison' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/program-history/comparisons/[id]
 * Delete program comparison (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_comparisons')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting program comparison:', error);
    return NextResponse.json(
      { error: 'Failed to delete program comparison' },
      { status: 500 }
    );
  }
}