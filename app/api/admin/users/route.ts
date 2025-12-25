import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Fetch all users
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, full_name, phone, role, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // SECURITY: Admin should use invitation system, not direct creation
    // This endpoint is deprecated for user creation
    return NextResponse.json(
      { 
        error: "Direct user creation is deprecated. Please use the invitation system (/api/users/invite) with proper role permissions.",
        alternatives: [
          "Use /api/users/create with proper permissions",
          "Use /api/invitations to send invitations"
        ]
      }, 
      { status: 410 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
