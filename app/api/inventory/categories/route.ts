import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET /api/inventory/categories - List all categories
export async function GET() {
  try {
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

    const { data: categories, error } = await supabaseAdmin
      .from('inventory_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('[inventory/categories] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error("[inventory/categories] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST /api/inventory/categories - Create new category
export async function POST(request: NextRequest) {
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

    const { data: category, error } = await supabaseAdmin
      .from('inventory_categories')
      .insert([{
        name: body.name,
        description: body.description,
      }])
      .select()
      .single()

    if (error) {
      console.error('[inventory/categories] Error creating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category, message: 'Category created successfully' })
  } catch (error) {
    console.error("[inventory/categories] Error:", error)
    return NextResponse.json(
      { error: "Failed to create category", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
