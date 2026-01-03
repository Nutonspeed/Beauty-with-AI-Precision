import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/branches/transfers/[id]/complete
 * Complete a transfer (update inventories)
 *
 * This endpoint calls the complete_branch_transfer database function
 * which handles deducting from source, adding to destination, and logging
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

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

    const { data: result, error } = await supabase.rpc('complete_branch_transfer', {
      p_transfer_id: params.id,
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
      .eq('id', params.id)
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
}
