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
 * GET /api/loyalty/points/rules/[id]
 * Get points earning rule details for beauty clinic
 */
export const GET = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('points_earning_rules')
      .select(`
        *,
        created_by:users!points_earning_rules_created_by_user_id_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching points earning rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points earning rule' },
      { status: 500 }
    );
  }
})

/**
 * PATCH /api/loyalty/points/rules/[id]
 * Update points earning rule for beauty clinic
 */
export const PATCH = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    const body = await req.json();
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('points_earning_rules')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating points earning rule:', error);
    return NextResponse.json(
      { error: 'Failed to update points earning rule' },
      { status: 500 }
    );
  }
})

/**
 * DELETE /api/loyalty/points/rules/[id]
 * Deactivate points earning rule (soft delete)
 */
export const DELETE = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('points_earning_rules')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting points earning rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete points earning rule' },
      { status: 500 }
    );
  }
})
