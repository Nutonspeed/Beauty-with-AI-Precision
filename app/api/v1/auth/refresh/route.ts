import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { refresh_token } = await request.json()

    if (!refresh_token) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.refreshSession({ refresh_token })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
