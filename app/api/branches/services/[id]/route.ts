import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';
import { getSubscriptionStatus } from '@/lib/subscriptions/check-subscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/branches/services/[id]
 * Update branch service
 */
export const PATCH = withClinicAuth(async (req, user) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const body = await req.json();
  const updateData: Record<string, unknown> = {};

  const { data: existing, error: existingError } = await supabase
    .from('branch_services')
    .select('id, branch_id, branch:branches(id, clinic_id)')
    .eq('id', id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: 'Branch service not found' }, { status: 404 });
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

    const { data: existing, error: existingError } = await supabase
      .from('branch_services')
      .select('id, branch_id, branch:branches(id, clinic_id)')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Branch service not found' }, { status: 404 });
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
