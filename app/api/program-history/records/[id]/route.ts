import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/treatment-history/records/[id]
 * Get treatment record details for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('treatment_records')
      .select(`
        *,
        customer:users!treatment_records_customer_id_fkey(id, full_name, email, phone, date_of_birth),
        performed_by:users!treatment_records_performed_by_user_id_fkey(id, full_name, email),
        branch:branches(id, branch_name, address),
        created_by:users!treatment_records_created_by_user_id_fkey(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching treatment record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment record' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/treatment-history/records/[id]
 * Update treatment record for beauty clinic customer
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const body = await request.json();

    const { data, error } = await supabaseClient
      .from('treatment_records')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating treatment record:', error);
    return NextResponse.json(
      { error: 'Failed to update treatment record' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/treatment-history/records/[id]
 * Delete treatment record (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('treatment_records')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting treatment record:', error);
    return NextResponse.json(
      { error: 'Failed to delete treatment record' },
      { status: 500 }
    );
  }
}