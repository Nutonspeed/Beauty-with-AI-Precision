import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/loyalty/tiers/[id]
 * Get loyalty tier details for beauty clinic
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('loyalty_tiers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching loyalty tier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty tier' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/loyalty/tiers/[id]
 * Update loyalty tier for beauty clinic customers
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
      .from('loyalty_tiers')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating loyalty tier:', error);
    return NextResponse.json(
      { error: 'Failed to update loyalty tier' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/loyalty/tiers/[id]
 * Deactivate loyalty tier (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('loyalty_tiers')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting loyalty tier:', error);
    return NextResponse.json(
      { error: 'Failed to delete loyalty tier' },
      { status: 500 }
    );
  }
}
