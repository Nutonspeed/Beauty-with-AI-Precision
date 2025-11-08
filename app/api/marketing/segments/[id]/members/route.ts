import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/marketing/segments/[id]/members
 * List customer segment members for beauty clinic
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('customer_segment_members')
      .select(`
        *,
        customer:users!customer_segment_members_customer_id_fkey(
          id,
          full_name,
          email,
          phone,
          date_of_birth,
          gender
        )
      `)
  .eq('segment_id', params.id);

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('added_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching segment members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segment members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/segments/[id]/members
 * Add customers to segment
 * 
 * Body:
 * - customer_ids (required): Array of customer IDs to add
 * - added_by_user_id (optional): User ID who added the members
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { customer_ids, added_by_user_id } = body;

    if (!customer_ids || !Array.isArray(customer_ids) || customer_ids.length === 0) {
      return NextResponse.json(
        { error: 'customer_ids array is required' },
        { status: 400 }
      );
    }

    // Create member records for each customer
    const members = customer_ids.map(customer_id => ({
      segment_id: params.id,
      customer_id,
      added_by_user_id,
      is_active: true,
    }));

    const { data, error } = await supabase
      .from('customer_segment_members')
      .upsert(members, {
        onConflict: 'segment_id,customer_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    // Update segment customer count
    await supabase.rpc('update_segment_customer_count', {
  p_segment_id: params.id,
    });

    return NextResponse.json({
      success: true,
      added_count: data?.length || 0,
      members: data,
    });
  } catch (error) {
    console.error('Error adding segment members:', error);
    return NextResponse.json(
      { error: 'Failed to add segment members' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketing/segments/[id]/members
 * Remove customers from segment
 * 
 * Body:
 * - customer_ids (required): Array of customer IDs to remove
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { customer_ids } = body;

    if (!customer_ids || !Array.isArray(customer_ids) || customer_ids.length === 0) {
      return NextResponse.json(
        { error: 'customer_ids array is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('customer_segment_members')
      .update({ is_active: false })
      .eq('segment_id', params.id)
      .in('customer_id', customer_ids)
      .select();

    if (error) throw error;

    // Update segment customer count
    await supabase.rpc('update_segment_customer_count', {
  p_segment_id: params.id,
    });

    return NextResponse.json({
      success: true,
      removed_count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error removing segment members:', error);
    return NextResponse.json(
      { error: 'Failed to remove segment members' },
      { status: 500 }
    );
  }
}
