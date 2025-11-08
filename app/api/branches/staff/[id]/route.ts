import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/branches/staff/[id]
 * Update a staff assignment
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'role',
      'is_primary_branch',
      'working_days',
      'working_hours',
      'is_active',
      'assignment_end_date',
      'permissions',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('branch_staff_assignments')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating staff assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update staff assignment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/branches/staff/[id]
 * Remove staff assignment (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('branch_staff_assignments')
      .update({
        is_active: false,
        assignment_end_date: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error removing staff assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove staff assignment' },
      { status: 500 }
    );
  }
}
