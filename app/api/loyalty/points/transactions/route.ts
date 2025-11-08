import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/loyalty/points/transactions
 * List points transactions for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - loyalty_account_id (optional): Filter by loyalty account
 * - transaction_type (optional): Filter by type (earned, redeemed, expired, etc.)
 * - status (optional): Filter by status
 * - limit (optional): Limit results (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const loyalty_account_id = searchParams.get('loyalty_account_id');
    const transaction_type = searchParams.get('transaction_type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('points_transactions')
      .select(`
        *,
        customer:users!points_transactions_customer_id_fkey(id, full_name, email),
        earning_rule:points_earning_rules(id, rule_name, rule_type),
        branch:branches(id, branch_name)
      `)
      .eq('clinic_id', clinic_id);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (loyalty_account_id) {
      query = query.eq('loyalty_account_id', loyalty_account_id);
    }

    if (transaction_type) {
      query = query.eq('transaction_type', transaction_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(Number.parseInt(limit));
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching points transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points transactions' },
      { status: 500 }
    );
  }
}
