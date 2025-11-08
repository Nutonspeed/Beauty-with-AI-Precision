import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    const { full_name, phone, role } = body

  const resolvedParams = await context.params

    // Update user profile
    const { data: user, error } = await supabase
      .from("users")
      .update({
        full_name,
        phone,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resolvedParams.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

  const resolvedParams = await context.params

    // Delete user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(resolvedParams.id)
    if (authError) throw authError

    // Delete user profile (should cascade automatically)
    const { error: profileError } = await supabase.from("users").delete().eq("id", resolvedParams.id)
    if (profileError) throw profileError

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
