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
      const appointmentIdsRaw = searchParams.get("appointment_ids") || ""
      const appointmentIds = appointmentIdsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      if (appointmentIds.length === 0) {
        return NextResponse.json({ payments: [] })
      }

      const service = createServiceClient()

      // Ensure these appointments belong to the user's clinic (unless global admin)
      if (!["super_admin", "admin"].includes(user.role)) {
        const { data: appts, error: apptErr } = await service
          .from("appointments")
          .select("id, clinic_id")
          .in("id", appointmentIds)

        if (apptErr) {
          return NextResponse.json({ error: "Failed to validate appointments" }, { status: 500 })
        }

        const allInClinic = (appts || []).every((a) => a.clinic_id === user.clinic_id)
        if (!allInClinic) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }

      const { data: payments, error } = await service
        .from("booking_payments")
        .select("id, clinic_id, appointment_id, amount, payment_method, payment_status, payment_date, transaction_id, notes")
        .in("appointment_id", appointmentIds)

      if (error) {
        return NextResponse.json({ error: "Failed to load payments" }, { status: 500 })
      }

      // Choose the most relevant payment per appointment (prefer pending, else latest with payment_date)
      const byAppt: Record<string, any[]> = {}
      for (const p of payments || []) {
        const key = String(p.appointment_id)
        byAppt[key] ||= []
        byAppt[key].push(p)
      }

      const deduped = Object.values(byAppt).map((arr) => {
        const pending = arr.find((p) => p.payment_status === "pending")
        if (pending) return pending
        return arr
          .slice()
          .sort((a, b) => String(b.payment_date || "").localeCompare(String(a.payment_date || "")))[0]
      })

      return NextResponse.json({ payments: deduped })
    } catch (e: any) {
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
