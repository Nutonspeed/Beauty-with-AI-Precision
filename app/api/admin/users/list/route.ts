import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/middleware"

export const dynamic = "force-dynamic"

export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      // Only super_admin can access
      if (user.role !== "super_admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const role = searchParams.get("role")
      const status = searchParams.get("status")
      const q = (searchParams.get("q") || "").trim().toLowerCase()
      const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 200)
      const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

      const service = createServiceClient()

      let query = service
        .from("users")
        .select(`
          id, 
          email, 
          role, 
          created_at, 
          last_sign_in_at,
          user_profiles(
            first_name,
            last_name,
            phone,
            avatar_url
          ),
          clinics!inner(
            id,
            name
          )
        `, { count: "exact" })
        .order("created_at", { ascending: false })

      if (role && role !== "all") {
        query = query.eq("role", role)
      }

      if (q) {
        query = query.or(`email.ilike.%${q}%,user_profiles.first_name.ilike.%${q}%,user_profiles.last_name.ilike.%${q}%,clinics.name.ilike.%${q}%`)
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1)

      if (error) {
        console.error("Admin users API error:", error)
        return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
      }

      // Transform data to flatten structure
      const users = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.user_profiles?.first_name || "",
        lastName: user.user_profiles?.last_name || "",
        phone: user.user_profiles?.phone || "",
        avatarUrl: user.user_profiles?.avatar_url || "",
        clinicId: user.clinics?.id || "",
        clinicName: user.clinics?.name || "",
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
      }))

      return NextResponse.json({
        users,
        total: count || 0,
        limit,
        offset,
      })
    } catch (e: any) {
      console.error("Admin users API error:", e)
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
