import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/marketing/discount-rules/[id]
 * Get discount rule details for beauty clinic
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('discount_rules')
      .select(`
        *,
        campaign:marketing_campaigns(id, campaign_name, campaign_code),
        created_by:users!discount_rules_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching discount rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount rule' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketing/discount-rules/[id]
 * Update discount rule for beauty clinic
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const supabaseClient = getSupabaseClient();

    const { data, error } = await supabaseClient
      .from('discount_rules')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating discount rule:', error);
    return NextResponse.json(
      { error: 'Failed to update discount rule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketing/discount-rules/[id]
 * Deactivate discount rule (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('discount_rules')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting discount rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete discount rule' },
      { status: 500 }
    );
  }
}
