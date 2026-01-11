import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/middleware"

export const dynamic = "force-dynamic"

export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      if (!user.clinic_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (!["super_admin", "admin", "clinic_owner", "clinic_admin", "manager", "clinic_staff"].includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const status = searchParams.get("status")
      const method = searchParams.get("method")
      const q = (searchParams.get("q") || "").trim().toLowerCase()
      const dateFrom = searchParams.get("date_from")
      const dateTo = searchParams.get("date_to")
      const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 200)
      const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

      const service = createServiceClient()

      let query = service
        .from("booking_payments")
        .select("id, clinic_id, appointment_id, amount, payment_method, payment_status, payment_date, transaction_id, notes, created_at", {
          count: "exact",
        })
        .eq("clinic_id", user.clinic_id)

      if (status) query = query.eq("payment_status", status)
      if (method) query = query.eq("payment_method", method)

      // Prefer payment_date; fallback to created_at
      if (dateFrom) query = query.gte("payment_date", dateFrom)
      if (dateTo) query = query.lte("payment_date", dateTo)

      // Basic text search against payment_id/transaction_id/notes (safe, optional)
      if (q) {
        // supabase-js uses PostgREST `or` syntax
        query = query.or(`id.ilike.%${q}%,transaction_id.ilike.%${q}%,notes.ilike.%${q}%`)
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json({ error: "Failed to load payments" }, { status: 500 })
      }

      return NextResponse.json({
        payments: data || [],
        total: count || 0,
        limit,
        offset,
      })
    } catch (e: any) {
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
