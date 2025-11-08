import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/marketing/promo-codes/validate
 * Validate promo code for beauty clinic customer
 * 
 * Body:
 * - code (required): Promo code to validate
 * - customer_id (required): Customer ID
 * - purchase_amount (required): Total purchase amount
 * - service_ids (optional): Array of service IDs
 * - product_ids (optional): Array of product IDs
 * - branch_id (optional): Branch ID
 * 
 * Returns:
 * - is_valid: Boolean
 * - promo_code_id: UUID if valid
 * - discount_amount: Calculated discount
 * - error_message: Error if invalid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      customer_id,
      purchase_amount,
      service_ids = [],
      product_ids = [],
      branch_id = null,
    } = body;

    if (!code || !customer_id || purchase_amount === undefined) {
      return NextResponse.json(
        { error: 'code, customer_id, and purchase_amount are required' },
        { status: 400 }
      );
    }

    // Call database function to validate
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: code.toUpperCase(),
      p_customer_id: customer_id,
      p_purchase_amount: purchase_amount,
      p_service_ids: service_ids,
      p_product_ids: product_ids,
      p_branch_id: branch_id,
    });

    if (error) throw error;

    // The function returns a single row with validation result
    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      is_valid: result.is_valid,
      promo_code_id: result.promo_code_id,
      discount_amount: result.discount_amount,
      error_message: result.error_message,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
