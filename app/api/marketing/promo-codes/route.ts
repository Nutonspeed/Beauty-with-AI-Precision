import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/marketing/promo-codes
 * List promo codes for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - campaign_id (optional): Filter by campaign
 * - is_active (optional): Filter by active status
 * - is_public (optional): Filter by public visibility
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const campaign_id = searchParams.get('campaign_id');
    const is_active = searchParams.get('is_active');
    const is_public = searchParams.get('is_public');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('promo_codes')
      .select(`
        *,
        campaign:marketing_campaigns(id, campaign_name, campaign_code),
        created_by:users!promo_codes_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('clinic_id', clinic_id);

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (is_public !== null) {
      query = query.eq('is_public', is_public === 'true');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/promo-codes
 * Create a new promo code for beauty clinic customers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      campaign_id,
      code,
      code_type,
      discount_percentage,
      discount_amount,
      max_discount_amount,
      applies_to,
      applicable_service_ids,
      applicable_product_ids,
      applicable_category_ids,
      min_purchase_amount,
      min_items_quantity,
      requires_new_customer,
      branch_ids,
      max_total_uses,
      max_uses_per_customer,
      valid_from,
      valid_until,
      can_combine_with_other_promos,
      excludes_sale_items,
      is_active,
      is_public,
      description,
      description_en,
      terms_and_conditions,
      created_by_user_id,
      notes,
    } = body;

    if (!clinic_id || !code || !code_type) {
      return NextResponse.json(
        { error: 'clinic_id, code, and code_type are required' },
        { status: 400 }
      );
    }

    // Validate code_type specific requirements
    if (code_type === 'percentage' && !discount_percentage) {
      return NextResponse.json(
        { error: 'discount_percentage is required for percentage type' },
        { status: 400 }
      );
    }

    if (code_type === 'fixed_amount' && !discount_amount) {
      return NextResponse.json(
        { error: 'discount_amount is required for fixed_amount type' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        clinic_id,
        campaign_id,
        code: code.toUpperCase(), // Store codes in uppercase
        code_type,
        discount_percentage,
        discount_amount,
        max_discount_amount,
        applies_to,
        applicable_service_ids,
        applicable_product_ids,
        applicable_category_ids,
        min_purchase_amount,
        min_items_quantity,
        requires_new_customer,
        branch_ids,
        max_total_uses,
        max_uses_per_customer,
        valid_from,
        valid_until,
        can_combine_with_other_promos,
        excludes_sale_items,
        is_active: is_active ?? true,
        is_public: is_public ?? true,
        description,
        description_en,
        terms_and_conditions,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}
