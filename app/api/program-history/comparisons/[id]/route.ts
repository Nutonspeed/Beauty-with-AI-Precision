import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/treatment-history/comparisons/[id]
 * Get treatment comparison details for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('treatment_comparisons')
      .select(`
        *,
        customer:users!treatment_comparisons_customer_id_fkey(id, full_name, email),
        created_by:users!treatment_comparisons_created_by_user_id_fkey(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching treatment comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment comparison' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/treatment-history/comparisons/[id]
 * Update treatment comparison for beauty clinic customer
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
      .from('treatment_comparisons')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating treatment comparison:', error);
    return NextResponse.json(
      { error: 'Failed to update treatment comparison' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/treatment-history/comparisons/[id]
 * Delete treatment comparison (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('treatment_comparisons')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting treatment comparison:', error);
    return NextResponse.json(
      { error: 'Failed to delete treatment comparison' },
      { status: 500 }
    );
  }
}