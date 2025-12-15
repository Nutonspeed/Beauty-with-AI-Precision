import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/middleware"

export const dynamic = "force-dynamic"

export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      if (!user.clinic_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (!["super_admin", "admin", "clinic_owner", "clinic_admin", "manager"].includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const body = await request.json().catch(() => ({}))
      const payment_id = typeof body.payment_id === "string" ? body.payment_id : ""
      const transaction_id = typeof body.transaction_id === "string" ? body.transaction_id.trim() : null
      const notes = typeof body.notes === "string" ? body.notes.trim() : null
      const paid_at = typeof body.paid_at === "string" ? body.paid_at : null

      if (!payment_id) {
        return NextResponse.json({ error: "payment_id is required" }, { status: 400 })
      }

      const service = createServiceClient()

      const { data: existing, error: existingErr } = await service
        .from("booking_payments")
        .select("id, clinic_id, payment_status")
        .eq("id", payment_id)
        .single()

      if (existingErr || !existing) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }

      if (existing.clinic_id !== user.clinic_id && !["super_admin", "admin"].includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (existing.payment_status === "paid") {
        return NextResponse.json({ success: true, payment: existing })
      }

      const nowIso = new Date().toISOString()
      const update: any = {
        payment_status: "paid",
        payment_date: paid_at || nowIso,
        updated_at: nowIso,
      }

      if (transaction_id) update.transaction_id = transaction_id
      if (notes) update.notes = notes

      const { data: updated, error: updErr } = await service
        .from("booking_payments")
        .update(update)
        .eq("id", payment_id)
        .select("*")
        .single()

      if (updErr || !updated) {
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
      }

      // Best-effort audit log
      try {
        await service.from("activity_logs").insert({
          user_id: user.id,
          clinic_id: existing.clinic_id,
          action: "mark_payment_paid",
          resource_type: "booking_payment",
          resource_id: payment_id,
          details: {
            previous_status: existing.payment_status,
            new_status: "paid",
            transaction_id: updated.transaction_id,
            notes: updated.notes,
          },
          created_at: nowIso,
        })
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, payment: updated })
    } catch (e: any) {
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
