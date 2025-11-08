import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("audit_logs")
      .select("*, user:users(name, email)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (action) {
      query = query.eq("action", action)
    }

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: logs, error } = await query

    if (error) throw error

    return NextResponse.json({ logs, pagination: { limit, offset, total: logs.length } })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
