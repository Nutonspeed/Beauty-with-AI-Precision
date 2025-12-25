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

    // Create user record in public.users table
    // Note: For B2B SaaS, users should be created via invitations with clinic_id
    // But for self-registration, we'll create with default role and no clinic
    if (data.user?.id) {
      const { error: userInsertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: name,
          phone: phone || null,
          role: 'customer', // Default role for self-registration
          clinic_id: null, // Will be assigned when invited to clinic
          created_at: new Date().toISOString()
        })

      if (userInsertError) {
        // If user record already exists (from trigger), that's OK
        if (!userInsertError.message.includes('duplicate key')) {
          console.error('Error creating user record:', userInsertError)
          // Don't fail registration - user can be updated later
        }
      }
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
        phone,
        role: 'customer',
        clinic_id: null,
      },
      message: "Registration successful. Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, { rateLimitCategory: 'auth' })
