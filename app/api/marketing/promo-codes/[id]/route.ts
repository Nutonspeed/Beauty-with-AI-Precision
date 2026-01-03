import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/marketing/promo-codes/[id]
 * Get promo code details for beauty clinic
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('promo_codes')
      .select(`
        *,
        campaign:marketing_campaigns(id, campaign_name, campaign_code, campaign_type),
        created_by:users!promo_codes_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketing/promo-codes/[id]
 * Update promo code for beauty clinic customers
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const supabaseClient = getSupabaseClient();

    // If updating code, convert to uppercase
    if (body.code) {
      body.code = body.code.toUpperCase();
    }

    const { data, error } = await supabaseClient
      .from('promo_codes')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketing/promo-codes/[id]
 * Deactivate promo code (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('promo_codes')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
