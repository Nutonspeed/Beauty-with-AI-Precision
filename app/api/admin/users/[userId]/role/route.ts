import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/middleware"

export const dynamic = "force-dynamic"

export const PATCH = withAuth(
  async (request: NextRequest, user) => {
    try {
      // Only super_admin can change roles
      if (user.role !== "super_admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Extract userId from URL
      const url = new URL(request.url)
      const pathSegments = url.pathname.split('/')
      const userId = pathSegments[pathSegments.length - 2] // Get userId from /api/admin/users/[userId]/role

      const { role } = await request.json()

      // Validate role
      const validRoles = ["super_admin", "admin", "clinic_owner", "clinic_admin", "manager", "clinic_staff", "customer"]
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }

      // Prevent self-demotion
      if (userId === user.id && role !== "super_admin") {
        return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
      }

      const service = createServiceClient()

      // Update user role
      const { error } = await service
        .from("users")
        .update({ role })
        .eq("id", userId)

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
