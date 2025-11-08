import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/loyalty/points/award
 * Award loyalty points to beauty clinic customer
 * 
 * Body:
 * - clinic_id (required): Clinic ID
 * - customer_id (required): Customer ID
 * - points_amount (required): Points to award
 * - source_type (required): Source type (booking, order, referral, etc.)
 * - source_id (optional): Source ID
 * - earning_rule_id (optional): Earning rule ID
 * - transaction_amount (optional): Transaction amount in baht
 * - description (optional): Description
 * - branch_id (optional): Branch ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      customer_id,
      points_amount,
      source_type,
      source_id,
      earning_rule_id,
      transaction_amount,
      description,
      branch_id,
    } = body;

    if (!clinic_id || !customer_id || !points_amount || !source_type) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, points_amount, and source_type are required' },
        { status: 400 }
      );
    }

    // Call database function to award points
    const { data, error } = await supabase.rpc('award_loyalty_points', {
      p_clinic_id: clinic_id,
      p_customer_id: customer_id,
      p_points_amount: points_amount,
      p_source_type: source_type,
      p_source_id: source_id,
      p_earning_rule_id: earning_rule_id,
      p_transaction_amount: transaction_amount,
      p_description: description,
      p_branch_id: branch_id,
    });

    if (error) throw error;

    // Get the transaction that was created
    const { data: transaction, error: txError } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('id', data)
      .single();

    if (txError) throw txError;

    return NextResponse.json({
      success: true,
      transaction_id: data,
      transaction,
    });
  } catch (error) {
    console.error('Error awarding loyalty points:', error);
    return NextResponse.json(
      { error: 'Failed to award loyalty points' },
      { status: 500 }
    );
  }
}
