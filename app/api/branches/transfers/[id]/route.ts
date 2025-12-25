import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';
import { getSubscriptionStatus } from '@/lib/subscriptions/check-subscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches/transfers/[id]
 * Get transfer details
 */
export const GET = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    const isGlobalAdmin = ['super_admin', 'admin'].includes(user.role);

    const { data, error } = await supabase
      .from('branch_transfers')
      .select(`
        *,
        from_branch:branches!branch_transfers_from_branch_id_fkey(id, branch_code, branch_name, city),
        to_branch:branches!branch_transfers_to_branch_id_fkey(id, branch_code, branch_name, city),
        requested_by:users!branch_transfers_requested_by_user_id_fkey(id, full_name, email),
        approved_by:users!branch_transfers_approved_by_user_id_fkey(id, full_name),
        shipped_by:users!branch_transfers_shipped_by_user_id_fkey(id, full_name),
        received_by:users!branch_transfers_received_by_user_id_fkey(id, full_name),
        items:branch_transfer_items(
          *,
          product:inventory_products(id, product_code, product_name, unit, cost_price)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (!isGlobalAdmin && data.clinic_id !== user.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer' },
      { status: 500 }
    );
  }
})

/**
 * PATCH /api/branches/transfers/[id]
 * Update transfer (approve, ship, receive, cancel)
 * 
 * Body:
 * - action (required): 'approve', 'ship', 'receive', 'cancel'
 * - user_id (required): User performing action
 * - Additional fields based on action
 */
export const PATCH = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    const body = await req.json();
    const { action, user_id } = body;

    const isGlobalAdmin = ['super_admin', 'admin'].includes(user.role);
    if (!isGlobalAdmin && user_id && user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'action and user_id are required' },
        { status: 400 }
      );
    }

    // Get current transfer
    const { data: transfer, error: fetchError } = await supabase
      .from('branch_transfers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (!isGlobalAdmin && transfer.clinic_id !== user.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isGlobalAdmin) {
      const subStatus = await getSubscriptionStatus(transfer.clinic_id)
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

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'approve':
        if (transfer.status !== 'pending') {
          return NextResponse.json(
            { error: 'Can only approve pending transfers' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'approved',
          approved_by_user_id: user_id,
          approved_at: new Date().toISOString(),
        };

        // Update approved quantities from items if provided
        if (body.items) {
          for (const item of body.items) {
            await supabase
              .from('branch_transfer_items')
              .update({ quantity_approved: item.quantity_approved })
              .eq('id', item.id);
          }
        }
        break;

      case 'ship':
        if (transfer.status !== 'approved') {
          return NextResponse.json(
            { error: 'Can only ship approved transfers' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'in_transit',
          shipped_by_user_id: user_id,
          shipped_at: new Date().toISOString(),
          tracking_number: body.tracking_number,
          shipping_method: body.shipping_method,
          shipping_cost: body.shipping_cost,
        };

        // Update shipped quantities
        if (body.items) {
          for (const item of body.items) {
            await supabase
              .from('branch_transfer_items')
              .update({ quantity_shipped: item.quantity_shipped })
              .eq('id', item.id);
          }
        }
        break;

      case 'receive':
        if (transfer.status !== 'in_transit') {
          return NextResponse.json(
            { error: 'Can only receive in-transit transfers' },
            { status: 400 }
          );
        }

        // Update received quantities and condition
        if (body.items) {
          for (const item of body.items) {
            await supabase
              .from('branch_transfer_items')
              .update({
                quantity_received: item.quantity_received,
                condition_on_receipt: item.condition_on_receipt || 'good',
              })
              .eq('id', item.id);
          }
        }

        updateData = {
          received_by_user_id: user_id,
          received_at: new Date().toISOString(),
          receiving_notes: body.receiving_notes,
        };
        break;

      case 'cancel':
        if (!['pending', 'approved'].includes(transfer.status)) {
          return NextResponse.json(
            { error: 'Can only cancel pending or approved transfers' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'cancelled',
          notes: body.cancellation_reason,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, ship, receive, or cancel' },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from('branch_transfers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating transfer:', error);
    return NextResponse.json(
      { error: 'Failed to update transfer' },
      { status: 500 }
    );
  }
})
