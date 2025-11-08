import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches/transfers
 * List branch transfers
 * 
 * Query parameters:
 * - clinic_id (optional): Filter by clinic
 * - from_branch_id (optional): Filter by source branch
 * - to_branch_id (optional): Filter by destination branch
 * - status (optional): Filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const from_branch_id = searchParams.get('from_branch_id');
    const to_branch_id = searchParams.get('to_branch_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('branch_transfers')
      .select(`
        *,
        from_branch:branches!branch_transfers_from_branch_id_fkey(id, branch_code, branch_name),
        to_branch:branches!branch_transfers_to_branch_id_fkey(id, branch_code, branch_name),
        requested_by:users!branch_transfers_requested_by_user_id_fkey(id, full_name),
        items:branch_transfer_items(
          id,
          product_id,
          quantity_requested,
          quantity_approved,
          quantity_shipped,
          quantity_received,
          product:inventory_products(id, product_code, product_name, unit)
        )
      `);

    if (clinic_id) {
      query = query.eq('clinic_id', clinic_id);
    }

    if (from_branch_id) {
      query = query.eq('from_branch_id', from_branch_id);
    }

    if (to_branch_id) {
      query = query.eq('to_branch_id', to_branch_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('requested_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branches/transfers
 * Create a new branch transfer
 * 
 * Body:
 * - clinic_id (required): Clinic ID
 * - from_branch_id (required): Source branch ID
 * - to_branch_id (required): Destination branch ID
 * - requested_by_user_id (required): User requesting transfer
 * - items (required): Array of transfer items
 * - reason (optional): Reason for transfer
 * - expected_delivery_date (optional): Expected delivery date
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      from_branch_id,
      to_branch_id,
      requested_by_user_id,
      items,
      reason,
      priority = 'normal',
      transfer_type = 'manual',
      expected_delivery_date,
    } = body;

    if (!clinic_id || !from_branch_id || !to_branch_id || !requested_by_user_id || !items) {
      return NextResponse.json(
        { error: 'clinic_id, from_branch_id, to_branch_id, requested_by_user_id, and items are required' },
        { status: 400 }
      );
    }

    if (from_branch_id === to_branch_id) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same branch' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate each item has enough stock
    for (const item of items) {
      const { data: isValid } = await supabase.rpc('validate_branch_transfer', {
        p_from_branch_id: from_branch_id,
        p_to_branch_id: to_branch_id,
        p_product_id: item.product_id,
        p_quantity: item.quantity_requested,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.product_id}` },
          { status: 400 }
        );
      }
    }

    // Generate transfer number
    const transferNumber = `TRF-${Date.now()}`;

    // Create transfer
    const { data: transfer, error: transferError } = await supabase
      .from('branch_transfers')
      .insert({
        clinic_id,
        transfer_number: transferNumber,
        from_branch_id,
        to_branch_id,
        requested_by_user_id,
        transfer_type,
        priority,
        reason,
        expected_delivery_date,
        status: 'pending',
      })
      .select()
      .single();

    if (transferError) throw transferError;

    // Create transfer items
    const transferItems = items.map((item) => ({
      transfer_id: transfer.id,
      product_id: item.product_id,
      quantity_requested: item.quantity_requested,
      notes: item.notes,
    }));

    const { error: itemsError } = await supabase
      .from('branch_transfer_items')
      .insert(transferItems);

    if (itemsError) throw itemsError;

    // Fetch complete transfer with items
    const { data: completeTransfer } = await supabase
      .from('branch_transfers')
      .select(`
        *,
        from_branch:branches!branch_transfers_from_branch_id_fkey(id, branch_code, branch_name),
        to_branch:branches!branch_transfers_to_branch_id_fkey(id, branch_code, branch_name),
        items:branch_transfer_items(
          *,
          product:inventory_products(id, product_code, product_name, unit)
        )
      `)
      .eq('id', transfer.id)
      .single();

    return NextResponse.json(completeTransfer, { status: 201 });
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { error: 'Failed to create transfer' },
      { status: 500 }
    );
  }
}
