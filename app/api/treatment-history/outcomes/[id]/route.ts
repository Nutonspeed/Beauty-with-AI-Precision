import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/outcomes/[id]
 * Get treatment outcome details for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('treatment_outcomes')
      .select(`
        *,
        customer:users!treatment_outcomes_customer_id_fkey(id, full_name, email, phone),
        treatment_record:treatment_records(id, treatment_name, treatment_category, treatment_date),
        assessor:users!treatment_outcomes_assessor_user_id_fkey(id, full_name, email)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching treatment outcome:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment outcome' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/treatment-history/outcomes/[id]
 * Update treatment outcome for beauty clinic customer
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('treatment_outcomes')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating treatment outcome:', error);
    return NextResponse.json(
      { error: 'Failed to update treatment outcome' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/treatment-history/outcomes/[id]
 * Delete treatment outcome (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('treatment_outcomes')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting treatment outcome:', error);
    return NextResponse.json(
      { error: 'Failed to delete treatment outcome' },
      { status: 500 }
    );
  }
}
