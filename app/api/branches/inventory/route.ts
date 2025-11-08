import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches/inventory
 * Get inventory for a branch
 * 
 * Query parameters:
 * - branch_id (required): Branch ID
 * - low_stock (optional): Filter low stock items only
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get('branch_id');
    const low_stock = searchParams.get('low_stock');

    if (!branch_id) {
      return NextResponse.json(
        { error: 'branch_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('branch_inventory')
      .select(`
        *,
        product:inventory_products(
          id,
          product_code,
          product_name,
          category_id,
          unit,
          cost_price,
          selling_price
        )
      `)
      .eq('branch_id', branch_id)
      .eq('is_available', true);

    if (low_stock === 'true') {
      // Filter items where current_stock <= reorder_point
      const { data: allItems } = await query;
      const lowStockItems = allItems?.filter(
        (item) => item.current_stock <= item.reorder_point
      );
      return NextResponse.json(lowStockItems || []);
    }

    const { data, error } = await query.order('current_stock', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching branch inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch inventory' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branches/inventory
 * Add or update inventory for a branch
 * 
 * Body:
 * - branch_id (required): Branch ID
 * - product_id (required): Product ID
 * - current_stock (optional): Current stock level
 * - minimum_stock (optional): Minimum stock level
 * - reorder_point (optional): Reorder point
 * - storage_location (optional): Storage location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branch_id,
      product_id,
      current_stock = 0,
      minimum_stock = 0,
      maximum_stock,
      reorder_point = 0,
      storage_location,
      bin_location,
      auto_reorder_enabled = false,
      reorder_quantity,
    } = body;

    if (!branch_id || !product_id) {
      return NextResponse.json(
        { error: 'branch_id and product_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('branch_inventory')
      .upsert(
        {
          branch_id,
          product_id,
          current_stock,
          minimum_stock,
          maximum_stock,
          reorder_point,
          storage_location,
          bin_location,
          auto_reorder_enabled,
          reorder_quantity,
          is_available: true,
        },
        {
          onConflict: 'branch_id,product_id',
        }
      )
      .select(`
        *,
        product:inventory_products(id, product_code, product_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error updating branch inventory:', error);
    return NextResponse.json(
      { error: 'Failed to update branch inventory' },
      { status: 500 }
    );
  }
}
