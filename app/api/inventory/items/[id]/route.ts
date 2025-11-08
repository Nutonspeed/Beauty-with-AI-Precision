import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

// GET /api/inventory/items/[id] - Get single item
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
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
      .select(`
        *,
        category:inventory_categories(id, name),
        supplier:inventory_suppliers(id, name, email, phone)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('[inventory/items/[id]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Calculate additional fields
    const is_low_stock = item.quantity_in_stock <= item.min_stock_level
    const is_out_of_stock = item.quantity_in_stock === 0
    const stock_value = item.quantity_in_stock * (item.cost_price || 0)

    return NextResponse.json({
      item: {
        ...item,
        is_low_stock,
        is_out_of_stock,
        stock_value,
      }
    })
  } catch (error) {
    console.error("[inventory/items/[id]] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// PUT /api/inventory/items/[id] - Update item
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
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

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.barcode !== undefined) updateData.barcode = body.barcode
    if (body.category_id !== undefined) updateData.category_id = body.category_id
    if (body.supplier_id !== undefined) updateData.supplier_id = body.supplier_id
    if (body.unit_of_measure !== undefined) updateData.unit_of_measure = body.unit_of_measure
    if (body.unit_price !== undefined) updateData.unit_price = body.unit_price
    if (body.cost_price !== undefined) updateData.cost_price = body.cost_price
    if (body.min_stock_level !== undefined) updateData.min_stock_level = body.min_stock_level
    if (body.reorder_point !== undefined) updateData.reorder_point = body.reorder_point
    if (body.reorder_quantity !== undefined) updateData.reorder_quantity = body.reorder_quantity
    if (body.location !== undefined) updateData.location = body.location
    if (body.expiry_date !== undefined) updateData.expiry_date = body.expiry_date
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    // Note: quantity_in_stock should NOT be updated directly
    // Use stock movements API instead

    const { data: item, error } = await supabaseAdmin
      .from('inventory_items')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        category:inventory_categories(id, name),
        supplier:inventory_suppliers(id, name)
      `)
      .single()

    if (error) {
      console.error('[inventory/items/[id]] Error updating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item, message: 'Item updated successfully' })
  } catch (error) {
    console.error("[inventory/items/[id]] Error:", error)
    return NextResponse.json(
      { error: "Failed to update item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE /api/inventory/items/[id] - Soft delete (deactivate) item
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
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

    // Soft delete: set is_active = false instead of actual deletion
    const { data: item, error } = await supabaseAdmin
      .from('inventory_items')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[inventory/items/[id]] Error deleting:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      item, 
      message: 'Item deactivated successfully' 
    })
  } catch (error) {
    console.error("[inventory/items/[id]] Error:", error)
    return NextResponse.json(
      { error: "Failed to delete item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
