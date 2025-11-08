import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") // 'all', 'users', 'bookings', 'analyses'

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const results: any = {
      users: [],
      bookings: [],
      analyses: [],
      treatments: [],
    }

    // Search users
    if (!type || type === "all" || type === "users") {
      const { data: users } = await supabase
        .from("users")
        .select("id, name, email, role")
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

      results.users = users || []
    }

    // Search bookings
    if (!type || type === "all" || type === "bookings") {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, customer:users!customer_id(name, email)")
        .or(`treatment.ilike.%${query}%,notes.ilike.%${query}%`)
        .limit(10)

      results.bookings = bookings || []
    }

    // Search analyses
    if (!type || type === "all" || type === "analyses") {
      const { data: analyses } = await supabase.from("analyses").select("*").limit(10)

      results.analyses = analyses || []
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
