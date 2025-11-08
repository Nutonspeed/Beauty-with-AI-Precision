import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

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

    // Use service client to bypass RLS for SELECT
    const serviceClient = createServiceClient()
    let { data: userData } = await serviceClient
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single()

    // Auto-create user record if doesn't exist (for demo accounts)
    if (!userData) {
      const defaultRole = user.email?.includes("admin") ? "super_admin" 
                       : user.email?.includes("clinic-owner") ? "clinic_admin"  // Changed from clinic_owner
                       : user.email?.includes("sales") ? "sales_staff"
                       : "free_user"  // Changed from customer_free

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

    return NextResponse.json({
      role: userData.role,
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
