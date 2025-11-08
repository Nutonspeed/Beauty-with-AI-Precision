import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinic_id, customer_id, reward_id, branch_id } = body;

    if (!clinic_id || !customer_id || !reward_id) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, and reward_id are required' },
        { status: 400 }
      );
    }

    // Call database function to redeem reward
    const { data, error } = await supabase.rpc('redeem_reward_with_points', {
      p_clinic_id: clinic_id,
      p_customer_id: customer_id,
      p_reward_id: reward_id,
      p_branch_id: branch_id,
    });

    if (error) {
      // Handle specific error messages from the function
      if (error.message.includes('Insufficient points')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('out of stock')) {
        return NextResponse.json(
          { error: 'This reward is currently out of stock' },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get the redemption details
    const { data: redemption, error: redError } = await supabase
      .from('rewards_redemptions')
      .select(`
        *,
        reward:rewards_catalog(id, reward_name, reward_type),
        customer:users!rewards_redemptions_customer_id_fkey(id, full_name, email)
      `)
      .eq('id', data)
      .single();

    if (redError) throw redError;

    return NextResponse.json({
      success: true,
      redemption_id: data,
      redemption,
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}
