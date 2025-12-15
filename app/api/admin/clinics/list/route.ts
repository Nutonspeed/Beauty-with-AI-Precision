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

      // Get all clinics with basic info
      let query = service
        .from("clinics")
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

      const { data: clinics, error, count } = await query.range(offset, offset + limit - 1)

      if (error) {
        console.error("Admin clinics API error:", error)
        return NextResponse.json({ error: "Failed to load clinics" }, { status: 500 })
      }

      // Get additional metrics for each clinic
      const clinicIds = (clinics || []).map(c => c.id)
      
      // Get user counts per clinic
      const { data: clinicUsers } = await service
        .from("users")
        .select("clinic_id, role")
        .in("clinic_id", clinicIds)

      // Get revenue data for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

      const { data: payments } = await service
        .from("booking_payments")
        .select("clinic_id, amount")
        .eq("payment_status", "paid")
        .gte("payment_date", thirtyDaysAgoStr)
        .in("clinic_id", clinicIds)

      // Aggregate metrics
      const userCounts = new Map<string, { total: number; owners: number; staff: number }>()
      const revenueMap = new Map<string, number>()

      for (const user of clinicUsers || []) {
        if (!userCounts.has(user.clinic_id)) {
          userCounts.set(user.clinic_id, { total: 0, owners: 0, staff: 0 })
        }
        const counts = userCounts.get(user.clinic_id)!
        counts.total++
        if (user.role === "clinic_owner") counts.owners++
        if (["clinic_admin", "manager", "clinic_staff"].includes(user.role)) counts.staff++
      }

      for (const payment of payments || []) {
        const current = revenueMap.get(payment.clinic_id) || 0
        revenueMap.set(payment.clinic_id, current + Number(payment.amount || 0))
      }

      // Combine all data
      const enrichedClinics = (clinics || []).map(clinic => ({
        ...clinic,
        userCount: userCounts.get(clinic.id)?.total || 0,
        ownerCount: userCounts.get(clinic.id)?.owners || 0,
        staffCount: userCounts.get(clinic.id)?.staff || 0,
        revenue30Days: revenueMap.get(clinic.id) || 0,
        subscriptionStatus: clinic.subscription_expires_at 
          ? new Date(clinic.subscription_expires_at) > new Date() 
            ? "active" 
            : "expired"
          : "none",
      }))

      return NextResponse.json({
        clinics: enrichedClinics,
        total: count || 0,
        limit,
        offset,
      })
    } catch (e: any) {
      console.error("Admin clinics API error:", e)
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
