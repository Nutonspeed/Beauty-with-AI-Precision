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
 * GET /api/loyalty/rewards
 * List rewards in catalog for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - reward_type (optional): Filter by reward type
 * - is_active (optional): Filter by active status
 * - is_published (optional): Filter by published status
 * - is_featured (optional): Filter by featured status
 */
export const GET = withClinicAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const reward_type = searchParams.get('reward_type');
    const is_active = searchParams.get('is_active');
    const is_published = searchParams.get('is_published');
    const is_featured = searchParams.get('is_featured');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('rewards_catalog')
      .select(`
        *,
        required_tier:loyalty_tiers(id, tier_name, tier_level),
        created_by:users!rewards_catalog_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('clinic_id', clinic_id);

    if (reward_type) {
      query = query.eq('reward_type', reward_type);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (is_published !== null) {
      query = query.eq('is_published', is_published === 'true');
    }

    if (is_featured !== null) {
      query = query.eq('is_featured', is_featured === 'true');
    }

    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching rewards catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards catalog' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/loyalty/rewards
 * Create a new reward in catalog for beauty clinic
 */
export const POST = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    const {
      clinic_id,
      reward_name,
      reward_name_en,
      description,
      reward_code,
      reward_type,
      points_required,
      reward_value,
      reward_details,
      stock_quantity,
      stock_available,
      max_redemptions_per_customer,
      max_redemptions_per_day,
      required_tier_id,
      applicable_tier_ids,
      valid_from,
      valid_until,
      valid_days_of_week,
      valid_time_ranges,
      branch_ids,
      image_url,
      display_order,
      is_featured,
      is_active,
      is_published,
      created_by_user_id,
      notes,
    } = body;

    if (!clinic_id || !reward_name || !reward_type || !points_required) {
      return NextResponse.json(
        { error: 'clinic_id, reward_name, reward_type, and points_required are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('rewards_catalog')
      .insert({
        clinic_id,
        reward_name,
        reward_name_en,
        description,
        reward_code,
        reward_type,
        points_required,
        reward_value,
        reward_details,
        stock_quantity,
        stock_available: stock_available ?? stock_quantity,
        max_redemptions_per_customer,
        max_redemptions_per_day,
        required_tier_id,
        applicable_tier_ids,
        valid_from,
        valid_until,
        valid_days_of_week,
        valid_time_ranges,
        branch_ids,
        image_url,
        display_order: display_order ?? 0,
        is_featured: is_featured ?? false,
        is_active: is_active ?? true,
        is_published: is_published ?? false,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    );
  }
});

