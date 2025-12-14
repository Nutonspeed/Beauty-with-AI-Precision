import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { withPublicAccess } from "@/lib/auth/middleware"

export const POST = withPublicAccess(async (request: Request) => {
  try {
    const { email, password, name, phone } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 })
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
        phone,
      },
      message: "Registration successful. Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, { rateLimitCategory: 'auth' })
