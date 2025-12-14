import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/loyalty/points/rules
 * List points earning rules for beauty clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - rule_type (optional): Filter by rule type
 * - is_active (optional): Filter by active status
 */
export const GET = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const rule_type = searchParams.get('rule_type');
    const is_active = searchParams.get('is_active');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    if (user?.clinic_id && clinic_id !== user.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let query = supabase
      .from('points_earning_rules')
      .select(`
        *,
        created_by:users!points_earning_rules_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('clinic_id', clinic_id);

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
    console.error('Error fetching points earning rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points earning rules' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/loyalty/points/rules
 * Create a new points earning rule for beauty clinic
 */
export const POST = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      return new NextResponse(null, { status: 204 });
    }
    const {
      clinic_id,
      rule_name,
      rule_name_en,
      description,
      rule_type,
      points_calculation_method,
      points_value,
      min_transaction_amount,
      max_points_per_transaction,
      applies_to,
      applicable_service_ids,
      applicable_product_ids,
      applicable_category_ids,
      applicable_tier_ids,
      valid_from,
      valid_until,
      valid_days_of_week,
      valid_time_ranges,
      points_approval_required,
      points_pending_days,
      points_expiry_days,
      priority,
      max_applications_per_customer_per_day,
      max_applications_per_customer_total,
      is_active,
      created_by_user_id,
      notes,
    } = body;

    if (!clinic_id || !rule_name || !rule_type || !points_calculation_method || points_value === undefined) {
      return NextResponse.json(
        { error: 'clinic_id, rule_name, rule_type, points_calculation_method, and points_value are required' },
        { status: 400 }
      );
    }

    if (user?.clinic_id && clinic_id !== user.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('points_earning_rules')
      .insert({
        clinic_id,
        rule_name,
        rule_name_en,
        description,
        rule_type,
        points_calculation_method,
        points_value,
        min_transaction_amount,
        max_points_per_transaction,
        applies_to: applies_to ?? 'all',
        applicable_service_ids,
        applicable_product_ids,
        applicable_category_ids,
        applicable_tier_ids,
        valid_from,
        valid_until,
        valid_days_of_week,
        valid_time_ranges,
        points_approval_required: points_approval_required ?? false,
        points_pending_days: points_pending_days ?? 0,
        points_expiry_days,
        priority: priority ?? 0,
        max_applications_per_customer_per_day,
        max_applications_per_customer_total,
        is_active: is_active ?? true,
        created_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating points earning rule:', error);
    return NextResponse.json(
      { error: 'Failed to create points earning rule' },
      { status: 500 }
    );
  }
});
