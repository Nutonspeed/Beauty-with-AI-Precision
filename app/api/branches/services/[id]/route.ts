import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/branches/services/[id]
 * Update branch service
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
      'branch_price',
      'use_clinic_price',
      'daily_capacity',
      'slots_per_day',
      'requires_specialist',
      'required_equipment',
      'available_days',
      'available_time_slots',
      'is_available',
      'available_from_date',
      'available_until_date',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('branch_services')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating branch service:', error);
    return NextResponse.json(
      { error: 'Failed to update branch service' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/branches/services/[id]
 * Remove service from branch (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('branch_services')
      .update({ is_available: false })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error removing branch service:', error);
    return NextResponse.json(
      { error: 'Failed to remove branch service' },
      { status: 500 }
    );
  }
}
