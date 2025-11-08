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

    const body = await request.json()
    const { email, password, full_name, phone, role } = body

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    })

    if (authError) throw authError

    // Create user profile
    const { data: user, error: profileError } = await supabase
      .from("users")
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        phone,
        role,
      })
      .select()
      .single()

    if (profileError) throw profileError

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
