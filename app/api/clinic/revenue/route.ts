import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { canManageClinicSettings } from "@/lib/auth/clinic-permissions"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get user data with clinic_id
    const { data: userData } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', authUser.id)
      .single()
    
    if (!userData?.clinic_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Use canonical RBAC - only normalized roles for financial data
    if (!canManageClinicSettings(userData.role)) {
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

    // Get all paid payments for the period with optional appointment details
    const { data: payments, error } = await supabase
        .from("booking_payments")
        .select(`
          id, 
          clinic_id, 
          amount, 
          payment_method,
          payment_date, 
          created_at,
          appointments(
            id,
            customer_id,
            staff_id,
            service_type,
            status,
            sales_proposals(
              id,
              sales_leads(
                id,
                lead_source,
                created_by
              )
            )
          )
        `)
        .eq("clinic_id", userData.clinic_id)
        .eq("payment_status", "paid")
        .gte("payment_date", startDateStr)
        .lte("payment_date", endDateStr)

    if (error) {
      console.error("Revenue API error:", error)
      return NextResponse.json({ error: "Failed to load revenue data" }, { status: 500 })
    }

    // Aggregate by date
    const dailyMap = new Map<string, { revenue: number; bookings: number }>()
    const methodMap = new Map<string, { amount: number; count: number }>()
    let totalRevenue = 0
    let totalBookings = 0

    for (const p of payments || []) {
      const date = p.payment_date || p.created_at
      const dateStr = date?.split("T")[0]
      if (!dateStr) continue

      // Daily aggregation
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { revenue: 0, bookings: 0 })
      }
      const daily = dailyMap.get(dateStr)!
      daily.revenue += Number(p.amount || 0)
      daily.bookings += 1

      // Method aggregation
      const method = p.payment_method || "unknown"
      if (!methodMap.has(method)) {
        methodMap.set(method, { amount: 0, count: 0 })
      }
      const methodData = methodMap.get(method)!
      methodData.amount += Number(p.amount || 0)
      methodData.count += 1

      // Totals
      totalRevenue += Number(p.amount || 0)
      totalBookings += 1
    }

    // Fill missing dates with zero
    const chartData = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const dayData = dailyMap.get(dateStr) || { revenue: 0, bookings: 0 }
      chartData.push({
        date: dateStr,
        revenue: dayData.revenue,
        bookings: dayData.bookings,
      })
    }

    // Calculate growth rate (compare with previous period)
    let growthRate = 0
    if (totalRevenue > 0) {
      const prevStartDate = new Date(startDate)
      prevStartDate.setDate(prevStartDate.getDate() - days)
      const prevStartDateStr = prevStartDate.toISOString().split("T")[0]
      const prevEndDateStr = startDate.toISOString().split("T")[0]

      const { data: prevPayments } = await supabase
        .from("booking_payments")
        .select("amount")
        .eq("clinic_id", userData.clinic_id)
        .eq("payment_status", "paid")
        .gte("payment_date", prevStartDateStr)
        .lte("payment_date", prevEndDateStr)

      const prevRevenue = (prevPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)
      if (prevRevenue > 0) {
        growthRate = ((totalRevenue - prevRevenue) / prevRevenue) * 100
      }
    }

    // Format payment method data
    const byPaymentMethod = Array.from(methodMap.entries()).map(([method, data]) => ({
      method: method === "promptpay" ? "PromptPay" : 
              method === "credit_card" ? "Credit Card" :
              method === "bank_transfer" ? "Bank Transfer" :
              method === "cash" ? "Cash" :
              method === "other" ? "Other" : method,
      amount: data.amount,
      count: data.count,
    })).sort((a, b) => b.amount - a.amount)

    const result = {
      summary: {
        totalRevenue,
        totalBookings,
        averageOrderValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
        growthRate: Math.round(growthRate * 10) / 10,
      },
      chartData,
      byPaymentMethod,
    }

    return NextResponse.json(result)
  } catch (e: any) {
    console.error("Revenue API error:", e)
    const message = e?.message || "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
