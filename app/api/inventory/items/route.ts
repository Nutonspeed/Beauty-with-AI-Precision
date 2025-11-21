import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withClinicAuth } from "@/lib/auth/middleware"

export const GET = withClinicAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const lowStock = searchParams.get("low_stock") === "true"
    const categoryId = searchParams.get("category_id")
    const search = searchParams.get("search")

    // Use service role to bypass RLS for now
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    let query = supabaseAdmin
      .from('inventory_items')
      .select(`
        *,
        category:inventory_categories(id, name),
        supplier:inventory_suppliers(id, name)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true })

    // Filter by low stock (quantity <= min_stock_level)
    if (lowStock) {
      // Use raw SQL for comparing columns
      const { data: allItems } = await supabaseAdmin
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(id, name),
          supplier:inventory_suppliers(id, name)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true })

      const lowStockItems = allItems?.filter(item => item.quantity_in_stock <= item.min_stock_level) || []
      
      // Transform data
      const transformedItems = lowStockItems.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        category: item.category?.name || 'Uncategorized',
        category_id: item.category_id,
        supplier_name: item.supplier?.name || 'Unknown',
        supplier_id: item.supplier_id,
        quantity_in_stock: item.quantity_in_stock,
        min_stock_level: item.min_stock_level,
        reorder_point: item.reorder_point,
        reorder_quantity: item.reorder_quantity,
        unit_price: Number(item.unit_price),
        cost_price: Number(item.cost_price),
        unit_of_measure: item.unit_of_measure,
        barcode: item.barcode,
        location: item.location,
        is_low_stock: true,
        is_out_of_stock: item.quantity_in_stock === 0,
        stock_value: item.quantity_in_stock * Number(item.unit_price),
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))

      return NextResponse.json({
        items: transformedItems,
        count: transformedItems.length,
      })
    }

    // Filter by category
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // Search by name or SKU
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('[inventory/items] Error fetching items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match UI expectations
    const transformedItems = items?.map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category?.name || 'Uncategorized',
      category_id: item.category_id,
      supplier_name: item.supplier?.name || 'Unknown',
      supplier_id: item.supplier_id,
      quantity_in_stock: item.quantity_in_stock,
      min_stock_level: item.min_stock_level,
      reorder_point: item.reorder_point,
      reorder_quantity: item.reorder_quantity,
      unit_price: Number(item.unit_price),
      cost_price: Number(item.cost_price),
      unit_of_measure: item.unit_of_measure,
      barcode: item.barcode,
      location: item.location,
      is_low_stock: item.quantity_in_stock <= item.min_stock_level,
      is_out_of_stock: item.quantity_in_stock === 0,
      stock_value: item.quantity_in_stock * Number(item.unit_price),
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) || []

    return NextResponse.json({
      items: transformedItems,
      count: transformedItems.length,
    })
  } catch (error) {
    console.error("[inventory/items] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory items", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
});

export const POST = withClinicAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: item, error } = await supabaseAdmin
      .from('inventory_items')
      .insert([{
        sku: body.sku,
        name: body.name,
        description: body.description,
        category_id: body.category_id,
        supplier_id: body.supplier_id,
        quantity_in_stock: body.quantity_in_stock || 0,
        min_stock_level: body.min_stock_level || 0,
        reorder_point: body.reorder_point || 10,
        reorder_quantity: body.reorder_quantity || 50,
        unit_price: body.unit_price || 0,
        cost_price: body.cost_price || 0,
        unit_of_measure: body.unit_of_measure || 'units',
        barcode: body.barcode,
        location: body.location,
        expiry_tracking: body.expiry_tracking || false,
        batch_tracking: body.batch_tracking || false,
      }])
      .select()
      .single()

    if (error) {
      console.error('[inventory/items] Error creating item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item, message: 'Item created successfully' })
  } catch (error) {
    console.error("[inventory/items] Error:", error)
    return NextResponse.json(
      { error: "Failed to create inventory item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
});
