import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/middleware"

export const dynamic = "force-dynamic"

export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      // Only super_admin can access cross-clinic data
      if (user.role !== "super_admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const period = searchParams.get("period") || "30d"
      
      // Calculate date range
      const now = new Date()
      const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 30
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - days + 1)
      const startDateStr = startDate.toISOString().split("T")[0]
      const endDateStr = now.toISOString().split("T")[0]

      const service = createServiceClient()

      // Get all clinics
      const { data: clinics, error: clinicsError } = await service
        .from("clinics")
        .select("id, name, created_at")
        .eq("is_active", true)

      if (clinicsError) {
        console.error("Admin performance API - clinics error:", clinicsError)
        return NextResponse.json({ error: "Failed to load clinics" }, { status: 500 })
      }

      // Get system-wide stats
      const [usersCount, analysesCount] = await Promise.all([
        service.from("users").select("id", { count: "exact", head: true }),
        service.from("skin_analyses").select("id", { count: "exact", head: true })
      ])

      // Get all paid payments for the period
      const { data: payments, error } = await service
        .from("booking_payments")
        .select("id, clinic_id, amount, payment_date, created_at")
        .eq("payment_status", "paid")
        .gte("payment_date", startDateStr)
        .lte("payment_date", endDateStr)

      if (error) {
        console.error("Admin performance API error:", error)
        return NextResponse.json({ error: "Failed to load performance data" }, { status: 500 })
      }

      // Aggregate by clinic
      const clinicMap = new Map<string, { revenue: number; bookings: number }>()
      let totalRevenue = 0
      let totalBookings = 0

      for (const p of payments || []) {
        if (!p.clinic_id) continue
        
        if (!clinicMap.has(p.clinic_id)) {
          clinicMap.set(p.clinic_id, { revenue: 0, bookings: 0 })
        }
        
        const clinic = clinicMap.get(p.clinic_id)!
        clinic.revenue += Number(p.amount || 0)
        clinic.bookings += 1
        
        totalRevenue += Number(p.amount || 0)
        totalBookings += 1
      }

      // Combine with clinic info and sort by revenue
      const clinicPerformance = (clinics || [])
        .map(clinic => {
          const perf = clinicMap.get(clinic.id) || { revenue: 0, bookings: 0 }
          return {
            id: clinic.id,
            name: clinic.name,
            revenue: perf.revenue,
            bookings: perf.bookings,
            averageOrderValue: perf.bookings > 0 ? Math.round(perf.revenue / perf.bookings) : 0
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10) // Top 10 clinics

      // Calculate growth rate (compare with previous period)
      let growthRate = 0
      if (totalRevenue > 0) {
        const prevStartDate = new Date(startDate)
        prevStartDate.setDate(prevStartDate.getDate() - days)
        const prevStartDateStr = prevStartDate.toISOString().split("T")[0]
        const prevEndDateStr = startDate.toISOString().split("T")[0]

        const { data: prevPayments } = await service
          .from("booking_payments")
          .select("amount")
          .eq("payment_status", "paid")
          .gte("payment_date", prevStartDateStr)
          .lte("payment_date", prevEndDateStr)

        const prevRevenue = (prevPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)
        if (prevRevenue > 0) {
          growthRate = ((totalRevenue - prevRevenue) / prevRevenue) * 100
        }
      }

      const result = {
        systemStats: {
          totalUsers: usersCount.count || 0,
          activeClinics: clinics?.length || 0,
          totalAnalyses: analysesCount.count || 0,
          totalRevenue,
          totalBookings,
          growthRate: Math.round(growthRate * 10) / 10,
          averageOrderValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0
        },
        topClinics: clinicPerformance.slice(0, 5), // Top 5 for dashboard
        allClinics: clinicPerformance // All 10 for detailed view
      }

      return NextResponse.json(result)
    } catch (e: any) {
      console.error("Admin performance API error:", e)
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
