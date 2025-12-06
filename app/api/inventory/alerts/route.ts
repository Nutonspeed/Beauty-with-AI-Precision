import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withClinicAuth } from "@/lib/auth/middleware"

// GET /api/inventory/alerts - List active stock alerts
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const alert_type = searchParams.get("alert_type")
    const is_resolved = searchParams.get("is_resolved")

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
      .from('inventory_stock_alerts')
      .select(`
        *,
        item:inventory_items(
          id,
          name,
          sku,
          quantity_in_stock,
          min_stock_level,
          reorder_point
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by alert type
    if (alert_type) {
      query = query.eq('alert_type', alert_type)
    }

    // Filter by resolved status
    if (is_resolved !== null) {
      const resolved = is_resolved === 'true'
      query = query.eq('is_resolved', resolved)
    } else {
      // Default: only show unresolved alerts
      query = query.eq('is_resolved', false)
    }

    const { data: alerts, error } = await query

    if (error) {
      console.error('[inventory/alerts] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error) {
    console.error("[inventory/alerts] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch alerts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
})

// PATCH /api/inventory/alerts/[id] - Resolve alert (future implementation)
// This would be in a separate [id]/route.ts file
