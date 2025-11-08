import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("item_id")
    const movementType = searchParams.get("movement_type")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

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
      .from('inventory_stock_movements')
      .select(`
        *,
        item:inventory_items(id, sku, name, unit_of_measure)
      `)
      .order('movement_date', { ascending: false })
      .limit(limit)

    if (itemId) {
      query = query.eq('item_id', itemId)
    }

    if (movementType) {
      query = query.eq('movement_type', movementType)
    }

    const { data: movements, error } = await query

    if (error) {
      console.error('[inventory/transactions] Error fetching movements:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      transactions: movements || [],
      count: movements?.length || 0,
    })
  } catch (error) {
    console.error("[inventory/transactions] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { item_id, movement_type, quantity, notes, reference_number, unit_cost } = body

    if (!item_id || !movement_type || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: item_id, movement_type, quantity" },
        { status: 400 }
      )
    }

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

    // Get current item stock
    const { data: item, error: itemError } = await supabaseAdmin
      .from('inventory_items')
      .select('quantity_in_stock, name, cost_price')
      .eq('id', item_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Calculate new quantity based on movement type
    let quantityChange = 0
    if (['purchase', 'adjustment'].includes(movement_type) && quantity > 0) {
      quantityChange = quantity
    } else if (['sale', 'damaged', 'expired'].includes(movement_type) && quantity > 0) {
      quantityChange = -quantity
    } else {
      quantityChange = quantity // For other types, use as-is
    }

    const newQuantity = item.quantity_in_stock + quantityChange

    if (newQuantity < 0) {
      return NextResponse.json(
        { error: `Insufficient stock. Current: ${item.quantity_in_stock}, Requested: ${Math.abs(quantityChange)}` },
        { status: 400 }
      )
    }

    // Create stock movement record
    const movementData = {
      item_id,
      movement_type,
      quantity: quantityChange,
      reference_number,
      notes,
      unit_cost: unit_cost || item.cost_price,
      total_cost: (unit_cost || item.cost_price) * Math.abs(quantityChange),
      movement_date: new Date().toISOString(),
    }

    const { data: movement, error: movementError } = await supabaseAdmin
      .from('inventory_stock_movements')
      .insert([movementData])
      .select()
      .single()

    if (movementError) {
      console.error('[inventory/transactions] Error creating movement:', movementError)
      return NextResponse.json({ error: movementError.message }, { status: 500 })
    }

    // Update item stock quantity
    const { error: updateError } = await supabaseAdmin
      .from('inventory_items')
      .update({ quantity_in_stock: newQuantity })
      .eq('id', item_id)

    if (updateError) {
      console.error('[inventory/transactions] Error updating stock:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      transaction: movement,
      message: `Stock ${movement_type} recorded successfully`,
      new_quantity: newQuantity,
      item_name: item.name,
    })
  } catch (error) {
    console.error("[inventory/transactions] Error:", error)
    return NextResponse.json(
      { error: "Failed to record transaction", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
