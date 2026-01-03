import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/loyalty/accounts/[id]/evaluate-tier
 * Evaluate and update customer tier based on points
 * 
 * This calls the database function to check if customer qualifies for tier upgrade/downgrade
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient.rpc('evaluate_customer_tier', {
      p_loyalty_account_id: params.id,
    });

    if (error) throw error;

    // Get updated account details
    const { data: account, error: accountError } = await supabaseClient
      .from('customer_loyalty_accounts')
      .select(`
        *,
        current_tier:loyalty_tiers(id, tier_name, tier_level, tier_color)
      `)
  .eq('id', params.id)
      .single();

    if (accountError) throw accountError;

    return NextResponse.json({
      success: true,
      new_tier_id: data,
      account,
    });
  } catch (error) {
    console.error('Error evaluating customer tier:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate customer tier' },
      { status: 500 }
    );
  }
}
