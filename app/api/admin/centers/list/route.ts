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
      const status = searchParams.get("status")
      const q = (searchParams.get("q") || "").trim().toLowerCase()
      const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 200)
      const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

      const service = createServiceClient()

      // Get all centers with basic info
      let query = service
        .from("centers")
        .select(`
          id,
          name,
          email,
          phone,
          address,
          city,
          province,
          postal_code,
          is_active,
          created_at,
          subscription_plan,
          subscription_expires_at
        `, { count: "exact" })
        .order("created_at", { ascending: false })

      if (status === "active") {
        query = query.eq("is_active", true)
      } else if (status === "inactive") {
        query = query.eq("is_active", false)
      }

      if (q) {
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,city.ilike.%${q}%`)
      }

      const { data: centers, error, count } = await query.range(offset, offset + limit - 1)

      if (error) {
        console.error("Admin centers API error:", error)
        return NextResponse.json({ error: "Failed to load centers" }, { status: 500 })
      }

      // Get additional metrics for each center
      const centerIds = (centers || []).map(c => c.id)
      
      // Get user counts per center
      const { data: centerUsers } = await service
        .from("users")
        .select("center_id, role")
        .in("center_id", centerIds)

      // Get revenue data for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

      const { data: payments } = await service
        .from("payments")
        .select("center_id, amount")
        .eq("payment_status", "paid")
        .gte("payment_date", thirtyDaysAgoStr)
        .in("center_id", centerIds)

      // Aggregate metrics
      const userCounts = new Map<string, { total: number; owners: number; staff: number }>()
      const revenueMap = new Map<string, number>()

      for (const user of centerUsers || []) {
        if (!userCounts.has(user.center_id)) {
          userCounts.set(user.center_id, { total: 0, owners: 0, staff: 0 })
        }
        const counts = userCounts.get(user.center_id)!
        counts.total++
        if (user.role === "center_owner") counts.owners++
        if (["center_admin", "manager", "center_staff"].includes(user.role)) counts.staff++
      }

      for (const payment of payments || []) {
        const current = revenueMap.get(payment.center_id) || 0
        revenueMap.set(payment.center_id, current + Number(payment.amount || 0))
      }

      // Combine all data
      const enrichedCenters = (centers || []).map(center => ({
        ...center,
        userCount: userCounts.get(center.id)?.total || 0,
        ownerCount: userCounts.get(center.id)?.owners || 0,
        staffCount: userCounts.get(center.id)?.staff || 0,
        revenue30Days: revenueMap.get(center.id) || 0,
        subscriptionStatus: center.subscription_expires_at 
          ? new Date(center.subscription_expires_at) > new Date() 
            ? "active" 
            : "expired"
          : "none",
      }))

      return NextResponse.json({
        centers: enrichedCenters,
        total: count || 0,
        limit,
        offset,
      })
    } catch (e: any) {
      console.error("Admin centers API error:", e)
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
