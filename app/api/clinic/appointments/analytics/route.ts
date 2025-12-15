import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/middleware"

export const dynamic = "force-dynamic"

export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      // Only clinic owners and admins can access
      if (!["clinic_owner", "clinic_admin", "admin"].includes(user.role)) {
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

      // Get all appointments in the period
      const { data: appointments, error: appointmentsError } = await service
        .from("appointments")
        .select("id, status, created_at, appointment_date")
        .eq("clinic_id", user.clinic_id!)
        .gte("appointment_date", startDateStr)
        .lte("appointment_date", endDateStr)

      if (appointmentsError) {
        console.error("Appointments analytics API error:", appointmentsError)
        return NextResponse.json({ error: "Failed to load appointments" }, { status: 500 })
      }

      // Get paid appointments (those with payment)
      const { data: paidAppointments, error: paymentsError } = await service
        .from("booking_payments")
        .select("appointment_id")
        .eq("clinic_id", user.clinic_id!)
        .eq("payment_status", "paid")

      if (paymentsError) {
        console.error("Payments analytics API error:", paymentsError)
        return NextResponse.json({ error: "Failed to load payments" }, { status: 500 })
      }

      // Create a set of paid appointment IDs
      const paidAppointmentIds = new Set(
        (paidAppointments || []).map(p => p.appointment_id)
      )

      // Aggregate analytics
      const statusCounts = {
        scheduled: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      }

      let totalAppointments = 0
      let completedAppointments = 0
      let paidAppointmentsCount = 0

      for (const appointment of appointments || []) {
        totalAppointments++
        statusCounts[appointment.status as keyof typeof statusCounts]++
        
        if (appointment.status === "completed") {
          completedAppointments++
        }
        
        if (paidAppointmentIds.has(appointment.id)) {
          paidAppointmentsCount++
        }
      }

      // Calculate conversion rates
      const completionRate = totalAppointments > 0 
        ? Math.round((completedAppointments / totalAppointments) * 100 * 10) / 10
        : 0

      const paymentRate = totalAppointments > 0
        ? Math.round((paidAppointmentsCount / totalAppointments) * 100 * 10) / 10
        : 0

      const paymentAfterCompletionRate = completedAppointments > 0
        ? Math.round((paidAppointmentsCount / completedAppointments) * 100 * 10) / 10
        : 0

      // Get daily breakdown
      const dailyData = new Map<string, {
        date: string
        total: number
        completed: number
        paid: number
      }>()

      // Initialize daily data
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split("T")[0]
        dailyData.set(dateStr, {
          date: dateStr,
          total: 0,
          completed: 0,
          paid: 0,
        })
      }

      // Fill daily data
      for (const appointment of appointments || []) {
        const dateStr = appointment.appointment_date || appointment.created_at?.split("T")[0]
        if (!dateStr) continue
        
        const day = dailyData.get(dateStr)
        if (!day) continue
        
        day.total++
        if (appointment.status === "completed") {
          day.completed++
        }
        if (paidAppointmentIds.has(appointment.id)) {
          day.paid++
        }
      }

      const result = {
        summary: {
          totalAppointments,
          completedAppointments,
          paidAppointments: paidAppointmentsCount,
          completionRate,
          paymentRate,
          paymentAfterCompletionRate,
        },
        statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({
          status: status.replace('_', ' '),
          count,
          percentage: totalAppointments > 0 
            ? Math.round((count / totalAppointments) * 100 * 10) / 10
            : 0,
        })),
        dailyData: Array.from(dailyData.values()),
      }

      return NextResponse.json(result)
    } catch (e: any) {
      console.error("Appointments analytics API error:", e)
      const message = e?.message || "Internal server error"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  },
  {
    requireAuth: true,
  },
)
