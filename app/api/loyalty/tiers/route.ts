import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/loyalty/tiers
 * List loyalty tiers for beauty clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - is_active (optional): Filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const is_active = searchParams.get('is_active');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('loyalty_tiers')
      .select('*')
      .eq('clinic_id', clinic_id);

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('tier_level', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty tiers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/tiers
 * Create a new loyalty tier for beauty clinic customers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      tier_name,
      tier_name_en,
      tier_level,
      tier_code,
      min_points,
      min_annual_spending,
      min_visits_per_year,
      points_multiplier,
      discount_percentage,
      birthday_bonus_points,
      perks,
      tier_color,
      tier_icon,
      description,
      is_active,
      display_order,
      created_by_user_id,
      notes,
    } = body;

    if (!clinic_id || !tier_name || !tier_level || !tier_code) {
      return NextResponse.json(
        { error: 'clinic_id, tier_name, tier_level, and tier_code are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('loyalty_tiers')
      .insert({
        clinic_id,
        tier_name,
        tier_name_en,
        tier_level,
        tier_code,
        min_points: min_points ?? 0,
        min_annual_spending,
        min_visits_per_year,
        points_multiplier: points_multiplier ?? 1,
        discount_percentage,
        birthday_bonus_points,
        perks,
        tier_color,
        tier_icon,
        description,
        is_active: is_active ?? true,
        display_order: display_order ?? 0,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating loyalty tier:', error);
    return NextResponse.json(
      { error: 'Failed to create loyalty tier' },
      { status: 500 }
    );
  }
}
