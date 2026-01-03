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
 * GET /api/loyalty/redemptions
 * List reward redemptions for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - reward_id (optional): Filter by reward
 * - status (optional): Filter by status
 * - limit (optional): Limit results (default 100)
 */
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const reward_id = searchParams.get('reward_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('rewards_redemptions')
      .select(`
        *,
        customer:users!rewards_redemptions_customer_id_fkey(id, full_name, email, phone),
        reward:rewards_catalog(id, reward_name, reward_type, reward_value),
        branch:branches(id, branch_name)
      `)
      .eq('clinic_id', clinic_id);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (reward_id) {
      query = query.eq('reward_id', reward_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('redeemed_at', { ascending: false });

    if (limit) {
      query = query.limit(Number.parseInt(limit));
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemptions' },
      { status: 500 }
    );
  }
})

