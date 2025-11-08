import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/loyalty/redemptions/[id]
 * Get redemption details for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('rewards_redemptions')
      .select(`
        *,
        customer:users!rewards_redemptions_customer_id_fkey(id, full_name, email, phone),
        reward:rewards_catalog(id, reward_name, reward_type, reward_value, reward_details),
        branch:branches(id, branch_name),
        approved_by:users!rewards_redemptions_approved_by_user_id_fkey(id, full_name),
        cancelled_by:users!rewards_redemptions_cancelled_by_user_id_fkey(id, full_name)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching redemption:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemption' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/loyalty/redemptions/[id]
 * Update redemption status for beauty clinic (approve, mark as used, etc.)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('rewards_redemptions')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating redemption:', error);
    return NextResponse.json(
      { error: 'Failed to update redemption' },
      { status: 500 }
    );
  }
}
