import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/loyalty/rewards/redeem
 * Redeem a reward with loyalty points for beauty clinic customer
 *
 * Body:
 * - clinic_id (required): Clinic ID
 * - customer_id (required): Customer ID
 * - reward_id (required): Reward ID to redeem
 * - branch_id (optional): Branch ID where redemption occurs
 */
export const POST = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const { clinic_id, customer_id, reward_id, branch_id } = body || {};

    if (!clinic_id || !customer_id || !reward_id) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, and reward_id are required' },
        { status: 400 }
      );
    }

    if (user?.clinic_id && clinic_id !== user.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseClient = getSupabaseClient();

    // Call database function to redeem reward
    const { data, error } = await supabaseClient.rpc('redeem_loyalty_reward', {
      p_clinic_id: clinic_id,
      p_customer_id: customer_id,
      p_reward_id: reward_id,
      p_branch_id: branch_id,
    });

    if (error) {
      if (error.message.includes('Insufficient points')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('out of stock')) {
        return NextResponse.json(
          { error: 'This reward is currently out of stock' },
          { status: 400 }
        );
      }
      throw error;
    }

    const row = (data as any)?.[0] || null;
    if (!row?.success) {
      return NextResponse.json(
        { error: row?.error_message || 'Failed to redeem reward' },
        { status: 400 }
      );
    }

    // Get the redemption details
    const { data: redemption, error: redError } = await supabaseClient
      .from('reward_redemptions')
      .select(`
        *,
        reward:rewards_catalog(id, reward_name, reward_type),
        customer:users!reward_redemptions_customer_id_fkey(id, full_name, email)
      `)
      .eq('id', row.redemption_id)
      .single();

    if (redError) throw redError;

    return NextResponse.json({
      success: true,
      redemption_id: row.redemption_id,
      redemption,
      reward_code: row.reward_code,
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
});

