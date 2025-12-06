import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withClinicAuth } from "@/lib/auth/middleware"

// GET /api/inventory/suppliers - List all suppliers
export const GET = withClinicAuth(async (request: NextRequest) => {
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

    const { data: suppliers, error } = await supabaseAdmin
      .from('inventory_suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('[inventory/suppliers] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ suppliers: suppliers || [] })
  } catch (error) {
    console.error("[inventory/suppliers] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch suppliers", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
})

// POST /api/inventory/suppliers - Create new supplier
export const POST = withClinicAuth(async (request: NextRequest) => {
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

    const { data: supplier, error } = await supabaseAdmin
      .from('inventory_suppliers')
      .insert([{
        name: body.name,
        contact_person: body.contact_person,
        email: body.email,
        phone: body.phone,
        address: body.address,
        tax_id: body.tax_id,
        payment_terms: body.payment_terms,
        notes: body.notes,
      }])
      .select()
      .single()

    if (error) {
      console.error('[inventory/suppliers] Error creating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ supplier, message: 'Supplier created successfully' })
  } catch (error) {
    console.error("[inventory/suppliers] Error:", error)
    return NextResponse.json(
      { error: "Failed to create supplier", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
})
