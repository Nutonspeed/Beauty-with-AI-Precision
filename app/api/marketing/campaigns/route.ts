import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/marketing/campaigns
 * List marketing campaigns for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - status (optional): Filter by status
 * - campaign_type (optional): Filter by campaign type
 * - is_active (optional): Filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const status = searchParams.get('status');
    const campaign_type = searchParams.get('campaign_type');
    const is_active = searchParams.get('is_active');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('marketing_campaigns')
      .select(`
        *,
        created_by:users!marketing_campaigns_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('clinic_id', clinic_id);

    if (status) {
      query = query.eq('status', status);
    }

    if (campaign_type) {
      query = query.eq('campaign_type', campaign_type);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/campaigns
 * Create a new marketing campaign for beauty clinic customers
 * 
 * Body:
 * - clinic_id (required): Clinic ID
 * - campaign_code (required): Unique campaign code
 * - campaign_name (required): Campaign name
 * - campaign_type (required): Campaign type
 * - start_date (required): Start date
 * - end_date (required): End date
 * - Other optional fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      campaign_code,
      campaign_name,
      campaign_name_en,
      description,
      campaign_type,
      start_date,
      end_date,
      target_audience,
      min_purchase_amount,
      max_uses_per_customer,
      channels,
      total_budget,
      target_customers,
      status = 'draft',
      created_by_user_id,
      notes,
    } = body;

    if (!clinic_id || !campaign_code || !campaign_name || !campaign_type || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'clinic_id, campaign_code, campaign_name, campaign_type, start_date, and end_date are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('marketing_campaigns')
      .insert({
        clinic_id,
        campaign_code,
        campaign_name,
        campaign_name_en,
        description,
        campaign_type,
        start_date,
        end_date,
        target_audience,
        min_purchase_amount,
        max_uses_per_customer,
        channels,
        total_budget,
        target_customers,
        status,
        created_by_user_id,
        notes,
        is_active: status === 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

