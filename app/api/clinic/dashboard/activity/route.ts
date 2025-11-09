import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/clinic/dashboard/activity - Get recent activity feed
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch recent activities from multiple sources
    const activities: any[] = []

    // Recent bookings (last 24 hours)
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, created_at, customer_name, treatment_type, payment_amount, status")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(5)

    if (bookings) {
      bookings.forEach((booking) => {
        activities.push({
          id: `booking-${booking.id}`,
          type: "booking",
          title: `นัดหมายใหม่: ${booking.treatment_type}`,
          description: `${booking.customer_name} • ฿${booking.payment_amount?.toLocaleString() || 0}`,
          timestamp: booking.created_at,
          metadata: booking,
        })
      })
    }

    // Recent customers (last 24 hours)
    const { data: customers } = await supabase
      .from("customers")
      .select("id, created_at, name, email, lead_status")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(5)

    if (customers) {
      customers.forEach((customer) => {
        const statusText =
          customer.lead_status === "hot"
            ? "🔥 ลูกค้าศักยภาพสูง"
            : customer.lead_status === "warm"
              ? "⭐ ลูกค้าสนใจ"
              : "📝 ลูกค้าใหม่"
        activities.push({
          id: `customer-${customer.id}`,
          type: "customer",
          title: `ลูกค้าใหม่: ${customer.name}`,
          description: `${statusText} • ${customer.email}`,
          timestamp: customer.created_at,
          metadata: customer,
        })
      })
    }

    // Recent staff updates (last 24 hours)
    const { data: staff } = await supabase
      .from("clinic_staff")
      .select("id, created_at, full_name, role, status")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(3)

    if (staff) {
      staff.forEach((member) => {
        const roleText =
          member.role === "doctor"
            ? "👨‍⚕️ แพทย์"
            : member.role === "nurse"
              ? "👩‍⚕️ พยาบาล"
              : member.role === "therapist"
                ? "💆 นักบำบัด"
                : "👔 ทีมงาน"
        activities.push({
          id: `staff-${member.id}`,
          type: "staff",
          title: `ทีมงานใหม่: ${member.full_name}`,
          description: `${roleText} • สถานะ: ${member.status}`,
          timestamp: member.created_at,
          metadata: member,
        })
      })
    }

    // Recent revenue milestones (payments today)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todayRevenue } = await supabase
      .from("bookings")
      .select("payment_amount, payment_status")
      .gte("booking_date", todayStart.toISOString())
      .eq("payment_status", "paid")

    if (todayRevenue && todayRevenue.length > 0) {
      const totalRevenue = todayRevenue.reduce(
        (sum, booking) => sum + (booking.payment_amount || 0),
        0
      )
      if (totalRevenue > 0) {
        activities.push({
          id: `revenue-today`,
          type: "revenue",
          title: `รายได้วันนี้: ฿${totalRevenue.toLocaleString()}`,
          description: `${todayRevenue.length} รายการชำระเงินแล้ว`,
          timestamp: new Date().toISOString(),
          metadata: { revenue: totalRevenue, count: todayRevenue.length },
        })
      }
    }

    // Sort all activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      activities: activities.slice(0, 10), // Return top 10
      total: activities.length,
    })
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
