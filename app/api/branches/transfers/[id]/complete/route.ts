import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';
import { getSubscriptionStatus } from '@/lib/subscriptions/check-subscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/branches/transfers/[id]/complete
 * Complete a transfer (update inventories)
 * 
 * This endpoint calls the complete_branch_transfer database function
 * which handles deducting from source, adding to destination, and logging
 */
export const POST = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    const transferId = request.nextUrl.pathname.split('/').at(-2) || '';
    const isGlobalAdmin = ['super_admin', 'admin'].includes(user.role);

    const { data: transferRow, error: transferErr } = await supabase
      .from('branch_transfers')
      .select('id, clinic_id')
      .eq('id', transferId)
      .single();

    if (transferErr || !transferRow) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (!isGlobalAdmin && transferRow.clinic_id !== user.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isGlobalAdmin) {
      const subStatus = await getSubscriptionStatus(transferRow.clinic_id)
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

    const { data: result, error } = await supabase.rpc('complete_branch_transfer', {
      p_transfer_id: transferId,
    });

    if (error) throw error;

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to complete transfer. Check transfer status and stock levels.' },
        { status: 400 }
      );
    }

    // Fetch updated transfer
    const { data: transfer } = await supabase
      .from('branch_transfers')
      .select(`
        *,
        from_branch:branches!branch_transfers_from_branch_id_fkey(id, branch_code, branch_name),
        to_branch:branches!branch_transfers_to_branch_id_fkey(id, branch_code, branch_name),
        items:branch_transfer_items(
          *,
          product:inventory_products(id, product_code, product_name)
        )
      `)
      .eq('id', transferId)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Transfer completed successfully',
      transfer,
    });
  } catch (error) {
    console.error('Error completing transfer:', error);
    return NextResponse.json(
      { error: 'Failed to complete transfer' },
      { status: 500 }
    );
  }
});
