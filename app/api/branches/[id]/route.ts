import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches/[id]
 * Get a specific branch with details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('branches')
      .select(`
        *,
        branch_manager:users!branches_branch_manager_id_fkey(id, email, full_name, avatar_url),
        staff_assignments:branch_staff_assignments(
          id,
          role,
          is_primary_branch,
          is_active,
          user:users(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Get inventory summary
    const { data: inventorySummary } = await supabase.rpc('get_branch_inventory_summary', {
      p_branch_id: params.id,
    });

    return NextResponse.json({
      ...data,
      inventory_summary: inventorySummary?.[0] || null,
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/branches/[id]
 * Update a branch
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // List of allowed fields to update
    const allowedFields = [
      'branch_name',
      'branch_name_en',
      'address',
      'district',
      'city',
      'province',
      'postal_code',
      'phone',
      'email',
      'line_id',
      'latitude',
      'longitude',
      'business_hours',
      'is_main_branch',
      'is_active',
      'accepts_appointments',
      'accepts_walk_ins',
      'max_daily_customers',
      'max_concurrent_appointments',
      'branch_manager_id',
      'facilities',
      'available_services',
      'manages_own_inventory',
      'description',
      'notes',
      'closing_date',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('branches')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'Failed to update branch' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/branches/[id]
 * Delete a branch (soft delete by setting is_active to false)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('branches')
      .update({
        is_active: false,
        closing_date: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Failed to delete branch' },
      { status: 500 }
    );
  }
}
