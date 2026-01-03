import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/marketing/promo-codes/[id]/usage
 * Get usage statistics for a promo code used by beauty clinic customers
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    // Get promo code details
    const { data: promoCode, error: codeError } = await supabaseClient
      .from('promo_codes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (codeError) throw codeError;

    // Get usage records
    const { data: usageRecords, error: usageError } = await supabaseClient
      .from('promo_code_usage')
      .select(`
        *,
        customer:users!promo_code_usage_customer_id_fkey(id, full_name, email),
        branch:branches(id, branch_name)
      `)
      .eq('promo_code_id', params.id)
      .order('used_at', { ascending: false });

    if (usageError) throw usageError;

    // Calculate statistics
    const totalUsage = usageRecords?.length || 0;
  const appliedUsage = usageRecords?.filter((r: any) => r.status === 'applied').length || 0;
  const refundedUsage = usageRecords?.filter((r: any) => r.status === 'refunded').length || 0;

    const totalDiscountGiven = usageRecords
      ?.filter((r: any) => r.status === 'applied')
      .reduce((sum: number, r: any) => sum + Number.parseFloat(r.discount_amount || 0), 0) || 0;

    const totalRevenue = usageRecords
      ?.filter((r: any) => r.status === 'applied')
      .reduce((sum: number, r: any) => sum + Number.parseFloat(r.final_amount || 0), 0) || 0;

    const avgDiscount = appliedUsage > 0 ? totalDiscountGiven / appliedUsage : 0;
    const avgOrderValue = appliedUsage > 0 ? totalRevenue / appliedUsage : 0;

    const stats = {
      promo_code: {
        id: promoCode.id,
        code: promoCode.code,
        code_type: promoCode.code_type,
        current_total_uses: promoCode.current_total_uses,
        max_total_uses: promoCode.max_total_uses,
        is_active: promoCode.is_active,
      },
      usage_summary: {
        total_usage: totalUsage,
        applied: appliedUsage,
        refunded: refundedUsage,
  cancelled: usageRecords?.filter((r: any) => r.status === 'cancelled').length || 0,
      },
      financial: {
        total_discount_given: Number.parseFloat(totalDiscountGiven.toFixed(2)),
        total_revenue: Number.parseFloat(totalRevenue.toFixed(2)),
        avg_discount: Number.parseFloat(avgDiscount.toFixed(2)),
        avg_order_value: Number.parseFloat(avgOrderValue.toFixed(2)),
      },
      usage_records: usageRecords,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching promo code usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code usage' },
      { status: 500 }
    );
  }
}
