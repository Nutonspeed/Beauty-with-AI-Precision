import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/marketing/promo-codes/apply
 * Apply promo code to booking for beauty clinic customer
 * 
 * Body:
 * - promo_code_id (required): Promo code ID
 * - customer_id (required): Customer ID
 * - booking_id (optional): Booking ID
 * - order_id (optional): Order ID
 * - original_amount (required): Original amount before discount
 * - discount_amount (required): Discount amount
 * - branch_id (optional): Branch ID
 * 
 * Returns:
 * - success: Boolean
 * - usage_id: UUID of the usage record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      promo_code_id,
      customer_id,
      booking_id = null,
      order_id = null,
      original_amount,
      discount_amount,
      branch_id = null,
    } = body;

    if (!promo_code_id || !customer_id || original_amount === undefined || discount_amount === undefined) {
      return NextResponse.json(
        { error: 'promo_code_id, customer_id, original_amount, and discount_amount are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();

    // Call database function to apply promo code
    const { data: applied, error: applyError } = await supabaseClient.rpc('apply_promo_code', {
      p_promo_code_id: promo_code_id,
      p_customer_id: customer_id,
      p_booking_id: booking_id,
      p_original_amount: original_amount,
      p_discount_amount: discount_amount,
      p_branch_id: branch_id,
    });

    if (applyError) throw applyError;

    if (!applied) {
      return NextResponse.json(
        { error: 'Failed to apply promo code' },
        { status: 400 }
      );
    }

    // Get the usage record that was just created
    const { data: usage, error: usageError } = await supabaseClient
      .from('promo_code_usage')
      .select('*')
      .eq('promo_code_id', promo_code_id)
      .eq('customer_id', customer_id)
      .order('used_at', { ascending: false })
      .limit(1)
      .single();

    if (usageError) throw usageError;

    return NextResponse.json({
      success: true,
      usage_id: usage.id,
      final_amount: usage.final_amount,
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json(
      { error: 'Failed to apply promo code' },
      { status: 500 }
    );
  }
}

