import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/photos/[id]
 * Get program photo details for beauty center customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_photos')
      .select(`
        *,
        customer:users!program_photos_customer_id_fkey(id, full_name, email),
        program_record:program_records(id, program_name, program_date, program_category),
        uploaded_by:users!program_photos_uploaded_by_user_id_fkey(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching program photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program photo' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/program-history/photos/[id]
 * Update program photo for beauty center customer
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
      .from('program_photos')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating program photo:', error);
    return NextResponse.json(
      { error: 'Failed to update program photo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/program-history/photos/[id]
 * Delete program photo (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_photos')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting program photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete program photo' },
      { status: 500 }
    );
  }
}