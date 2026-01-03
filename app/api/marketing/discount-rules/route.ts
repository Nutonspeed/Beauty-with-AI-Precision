import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/marketing/discount-rules
 * List discount rules for beauty clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - campaign_id (optional): Filter by campaign
 * - rule_type (optional): Filter by rule type
 * - is_active (optional): Filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const campaign_id = searchParams.get('campaign_id');
    const rule_type = searchParams.get('rule_type');
    const is_active = searchParams.get('is_active');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('discount_rules')
      .select(`
        *,
        campaign:marketing_campaigns(id, campaign_name, campaign_code),
        created_by:users!discount_rules_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('clinic_id', clinic_id);

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (rule_type) {
      query = query.eq('rule_type', rule_type);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('priority', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching discount rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount rules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/discount-rules
 * Create a new discount rule for beauty clinic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      campaign_id,
      rule_name,
      rule_name_en,
      description,
      rule_type,
      rule_config,
      applies_to,
      applicable_service_ids,
      applicable_product_ids,
      applicable_category_ids,
      priority,
      valid_from,
      valid_until,
      valid_days_of_week,
      valid_time_ranges,
      max_applications_per_transaction,
      max_total_applications,
      is_active,
      created_by_user_id,
      notes,
    } = body;

    if (!clinic_id || !rule_name || !rule_type || !rule_config) {
      return NextResponse.json(
        { error: 'clinic_id, rule_name, rule_type, and rule_config are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('discount_rules')
      .insert({
        clinic_id,
        campaign_id,
        rule_name,
        rule_name_en,
        description,
        rule_type,
        rule_config,
        applies_to,
        applicable_service_ids,
        applicable_product_ids,
        applicable_category_ids,
        priority: priority ?? 0,
        valid_from,
        valid_until,
        valid_days_of_week,
        valid_time_ranges,
        max_applications_per_transaction,
        max_total_applications,
        is_active: is_active ?? true,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating discount rule:', error);
    return NextResponse.json(
      { error: 'Failed to create discount rule' },
      { status: 500 }
    );
  }
}

