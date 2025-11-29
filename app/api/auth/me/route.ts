import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * GET /api/auth/me
 * Get current user's profile and role for redirect purposes
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('Authorization')
    let session = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data } = await supabase.auth.getUser(token)
      if (data.user) {
        session = { user: data.user }
      }
    } else {
      // Fallback to cookie session
      const { data: { session: cookieSession } } = await supabase.auth.getSession()
      session = cookieSession
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user profile from profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, role, full_name, avatar_url, clinic_id, is_active")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("[/api/auth/me] Profile fetch error:", error)
      // Return basic info from auth user if profile not found
      return NextResponse.json({
        success: true,
        data: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'customer',
          full_name: session.user.user_metadata?.full_name || null,
          avatar_url: null,
          clinic_id: null,
          is_active: true,
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error("[/api/auth/me] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
