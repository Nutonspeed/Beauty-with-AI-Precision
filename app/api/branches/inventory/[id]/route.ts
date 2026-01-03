import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

/**
 * PATCH /api/branches/inventory/[id]
 * Update branch inventory item
 */
export const PATCH = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'current_stock',
      'minimum_stock',
      'maximum_stock',
      'reorder_point',
      'storage_location',
      'bin_location',
      'is_available',
      'auto_reorder_enabled',
      'reorder_quantity',
      'last_stock_count',
      'last_stock_count_date',
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
      .from('branch_inventory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating branch inventory:', error);
    return NextResponse.json(
      { error: 'Failed to update branch inventory' },
      { status: 500 }
    );
  }
})
