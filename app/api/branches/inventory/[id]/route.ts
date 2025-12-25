import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';
import { getSubscriptionStatus } from '@/lib/subscriptions/check-subscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/branches/inventory/[id]
 * Update branch inventory item
 */
export const PATCH = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    const { data: existing, error: existingError } = await supabase
      .from('branch_inventory')
      .select('id, branch_id, branch:branches(id, clinic_id)')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const clinicId = (existing as any)?.branch?.clinic_id as string | undefined;
    if (!clinicId) {
      return NextResponse.json({ error: 'Failed to resolve clinic' }, { status: 500 });
    }

    const isGlobalAdmin = ['super_admin', 'admin'].includes(user.role);
    if (!isGlobalAdmin && clinicId !== user.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isGlobalAdmin) {
      const subStatus = await getSubscriptionStatus(clinicId)
      if (!subStatus.isActive || subStatus.isTrialExpired) {
        const statusCode = subStatus.subscriptionStatus === 'past_due' || subStatus.isTrialExpired ? 402 : 403
        return NextResponse.json(
          {
            error: subStatus.message,
            subscription: {
              status: subStatus.subscriptionStatus,
              plan: subStatus.plan,
              isTrial: subStatus.isTrial,
              isTrialExpired: subStatus.isTrialExpired,
            },
          },
          { status: statusCode },
        );
      }
    }

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
