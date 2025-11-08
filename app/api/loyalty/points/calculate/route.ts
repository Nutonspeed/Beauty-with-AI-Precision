import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/loyalty/points/calculate
 * Calculate points that would be earned based on a transaction
 * 
 * Body:
 * - earning_rule_id (required): Earning rule ID
 * - transaction_amount (required): Transaction amount in baht
 * - customer_tier_id (optional): Customer tier ID for multiplier
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { earning_rule_id, transaction_amount, customer_tier_id } = body;

    if (!earning_rule_id || transaction_amount === undefined) {
      return NextResponse.json(
        { error: 'earning_rule_id and transaction_amount are required' },
        { status: 400 }
      );
    }

    // Call database function to calculate points
    const { data, error } = await supabase.rpc('calculate_points_earned', {
      p_earning_rule_id: earning_rule_id,
      p_transaction_amount: transaction_amount,
      p_customer_tier_id: customer_tier_id,
    });

    if (error) throw error;

    return NextResponse.json({
      points_earned: data,
      transaction_amount,
      earning_rule_id,
      customer_tier_id,
    });
  } catch (error) {
    console.error('Error calculating points:', error);
    return NextResponse.json(
      { error: 'Failed to calculate points' },
      { status: 500 }
    );
  }
}
