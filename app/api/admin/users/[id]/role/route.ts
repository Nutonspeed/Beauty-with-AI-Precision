import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { withAuthContext } from "@/lib/auth/middleware"

export const dynamic = "force-dynamic"

export const PATCH = withAuthContext(
  async (request: NextRequest, user, context: { params: Promise<{ id: string }> }) => {
    try {
      if (user.role !== "super_admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const { id } = await context.params
      const { role } = await request.json()

      const validRoles = [
        "super_admin",
        "admin",
        "clinic_owner",
        "clinic_admin",
        "manager",
        "clinic_staff",
        "customer",
      ]

      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }

      if (id === user.id && role !== "super_admin") {
        return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
      }

      const service = createServiceClient()
      const { error } = await service.from("users").update({ role }).eq("id", id)

      if (error) {
        console.error("Role update error:", error)
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } catch (e: any) {
      console.error("Role update API error:", e)
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
