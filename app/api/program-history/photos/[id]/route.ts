import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/treatment-history/photos/[id]
 * Get treatment photo details for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('treatment_photos')
      .select(`
        *,
        customer:users!treatment_photos_customer_id_fkey(id, full_name, email),
        treatment_record:treatment_records(id, treatment_name, treatment_date, treatment_category),
        uploaded_by:users!treatment_photos_uploaded_by_user_id_fkey(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching treatment photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment photo' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/treatment-history/photos/[id]
 * Update treatment photo for beauty clinic customer
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
      .from('treatment_photos')
      .update(body)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating treatment photo:', error);
    return NextResponse.json(
      { error: 'Failed to update treatment photo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/treatment-history/photos/[id]
 * Delete treatment photo (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('treatment_photos')
      .update({ is_deleted: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting treatment photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete treatment photo' },
      { status: 500 }
    );
  }
}