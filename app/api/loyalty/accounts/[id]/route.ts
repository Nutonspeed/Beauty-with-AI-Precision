import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/loyalty/accounts/[id]
 * Get loyalty account details for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('customer_loyalty_accounts')
      .select(`
        *,
        customer:users!customer_loyalty_accounts_customer_id_fkey(id, full_name, email, phone, date_of_birth),
        current_tier:loyalty_tiers(id, tier_name, tier_name_en, tier_level, tier_color, tier_icon, points_multiplier, discount_percentage, perks)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching loyalty account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty account' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/loyalty/accounts/[id]
 * Update loyalty account for beauty clinic customer
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('customer_loyalty_accounts')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating loyalty account:', error);
    return NextResponse.json(
      { error: 'Failed to update loyalty account' },
      { status: 500 }
    );
  }
}
