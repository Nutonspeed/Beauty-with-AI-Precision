import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

 * PATCH /api/branches/services/[id]
 * Update branch service
 */
export const PATCH = withClinicAuth(async (req, user) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const body = await req.json();
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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data, error } = await supabase
    .from('branch_services')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json(data);
});

/**
 * DELETE /api/branches/services/[id]
 * Remove service from branch (soft delete)
 */
export const DELETE = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await supabase
      .from('branch_services')
      .update({ is_available: false })
      .eq('id', id)
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
})
