import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { normalizeRole } from "@/lib/auth/role-normalize"

export async function GET(request: NextRequest) {
  console.log("[check-role] API called") // Debug log
  try {
    const supabase = await createServerClient()
    
    // Use getUser() instead of getSession() for better security
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Prefer role from user_metadata if present
    const metaRole = (user.user_metadata as any)?.role as string | undefined

    // Use service client to bypass RLS for SELECT
    const serviceClient = createServiceClient()
    let { data: userData } = await serviceClient
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single()

    // Auto-create user record if doesn't exist (for demo/demo accounts)
    if (!userData) {
      const email = user.email || ""
      const defaultRole = metaRole
        ?? (email.includes("superadmin") || email.includes("admin") ? "super_admin"
          : (email.includes("clinicowner") || email.includes("clinic-owner")) ? "clinic_owner"
          : email.includes("sales") ? "sales_staff"
          : email.includes("customer") ? "customer"
          : "customer")

      const { data: newUser, error: insertError } = await serviceClient
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          role: defaultRole,
          full_name: user.email?.split("@")[0].replace("-", " ") || "Demo User",
        })
        .select("role, clinic_id")
        .single()

      if (insertError) {
        console.error("[v0] Error inserting user:", insertError)
      } else {
        console.log("[v0] Created new user:", newUser)
      }

      userData = newUser
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const canonicalRole = normalizeRole(metaRole ?? userData.role)

    return NextResponse.json({
      role: canonicalRole,
      email: user.email,
      clinicId: userData.clinic_id,
    })
  } catch (error) {
    console.error("[v0] Error checking role:", error)
    return NextResponse.json(
      { error: "Failed to check role", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
