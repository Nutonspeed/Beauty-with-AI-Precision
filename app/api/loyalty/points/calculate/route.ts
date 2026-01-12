import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCenterAuth } from '@/lib/auth/middleware';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/loyalty/points/calculate
 * Calculate points that would be earned based on a transaction
 * 
 * Body:
 * - earning_rule_id (required): Earning rule ID
 * - transaction_amount (required): Transaction amount in baht
 * - customer_tier_id (optional): Customer tier ID for multiplier
 */
export const POST = withCenterAuth(async (request: NextRequest, user: any) => {
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const center_id = body?.center_id;
  if (!center_id) {
    return NextResponse.json({ error: 'center_id is required' }, { status: 400 });
  }
  if (user?.center_id && center_id !== user.center_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Reuse the existing implementation logic
  const { earning_rule_id, transaction_amount, customer_tier_id } = body || {};
  if (!earning_rule_id || transaction_amount === undefined) {
    return NextResponse.json(
      { error: 'earning_rule_id and transaction_amount are required' },
      { status: 400 }
    );
  }

  const supabaseClient = getSupabaseClient();
  const { data, error } = await supabaseClient.rpc('calculate_points_earned', {
    p_earning_rule_id: earning_rule_id,
    p_transaction_amount: transaction_amount,
    p_customer_tier_id: customer_tier_id,
  });

  if (error) {
    console.error('Error calculating points:', error);
    return NextResponse.json(
      { error: 'Failed to calculate points' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    points_earned: data,
    transaction_amount,
    earning_rule_id,
    customer_tier_id,
  });
});

