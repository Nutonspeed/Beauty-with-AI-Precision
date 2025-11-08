import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/loyalty/accounts
 * List customer loyalty accounts for beauty clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by specific customer
 * - tier_id (optional): Filter by tier
 * - is_active (optional): Filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const tier_id = searchParams.get('tier_id');
    const is_active = searchParams.get('is_active');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('customer_loyalty_accounts')
      .select(`
        *,
        customer:users!customer_loyalty_accounts_customer_id_fkey(id, full_name, email, phone),
        current_tier:loyalty_tiers(id, tier_name, tier_level, tier_color)
      `)
      .eq('clinic_id', clinic_id);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (tier_id) {
      query = query.eq('current_tier_id', tier_id);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('available_points', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching loyalty accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty accounts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/accounts
 * Create a new loyalty account for beauty clinic customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinic_id, customer_id, notes } = body;

    if (!clinic_id || !customer_id) {
      return NextResponse.json(
        { error: 'clinic_id and customer_id are required' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('customer_loyalty_accounts')
      .select('id')
      .eq('clinic_id', clinic_id)
      .eq('customer_id', customer_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Loyalty account already exists for this customer' },
        { status: 400 }
      );
    }

    // Generate membership number
    const membership_number = 'LOYAL-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data, error } = await supabase
      .from('customer_loyalty_accounts')
      .insert({
        clinic_id,
        customer_id,
        membership_number,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating loyalty account:', error);
    return NextResponse.json(
      { error: 'Failed to create loyalty account' },
      { status: 500 }
    );
  }
}
