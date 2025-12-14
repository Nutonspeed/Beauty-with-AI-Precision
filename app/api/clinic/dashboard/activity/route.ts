import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

type ActivityType = "booking" | "staff" | "revenue"

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const activities: Activity[] = []

    // user profile
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select("clinic_id, role, email")
      .eq("id", user.id)
      .single()

    if (userErr) {
      console.error("[clinic/activity] Failed to fetch user profile:", userErr)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    if (!userData || (userData.role !== "clinic_owner" && userData.role !== "clinic_staff")) {
      return NextResponse.json({ error: "Forbidden - Clinic access required" }, { status: 403 })
    }

    const clinicId = userData.clinic_id
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated with user" }, { status: 400 })
    }

    const admin = createServiceClient()

    // bookings
    const { data: bookings, error: bookingErr } = await admin
      .from("bookings")
      .select("id, booking_date, status, price")
      .eq("clinic_id", clinicId)
      .in("status", ["confirmed", "completed", "cancelled"])
      .order("booking_date", { ascending: false })
      .limit(20)

    if (bookingErr) console.error("[clinic/activity] Error fetching bookings:", bookingErr)

    bookings?.forEach((b) => {
      activities.push({
        id: String(b.id),
        type: "booking",
        title: `Booking ${b.status || "updated"}`,
        description: `ยอด ${Number((b as any).price || 0).toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
          minimumFractionDigits: 0,
        })}`,
        timestamp: (b as any).booking_date,
        metadata: { status: (b as any).status, price: (b as any).price },
      })
    })

    // staff (last 24h)
    const { data: staff, error: staffErr } = await admin
      .from("clinic_staff")
      .select("id, created_at, full_name, role, status, clinic_id")
      .eq("clinic_id", clinicId)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(3)

    if (staffErr) console.error("[clinic/activity] Error fetching staff:", staffErr)

    staff?.forEach((member) => {
      const roleText =
        (member as any).role === "doctor"
          ? "👨‍⚕️ แพทย์"
          : (member as any).role === "nurse"
            ? "👩‍⚕️ พยาบาล"
            : (member as any).role === "therapist"
              ? "💆 นักบำบัด"
              : "👔 ทีมงาน"

      activities.push({
        id: `staff-${(member as any).id}`,
        type: "staff",
        title: `ทีมงานใหม่: ${(member as any).full_name}`,
        description: `${roleText} • สถานะ: ${(member as any).status}`,
        timestamp: (member as any).created_at,
        metadata: member,
      })
    })

    // revenue today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todayRevenue, error: revErr } = await admin
      .from("bookings")
      .select("booking_date, price, status")
      .eq("clinic_id", clinicId)
      .in("status", ["completed", "confirmed"])
      .gte("booking_date", todayStart.toISOString())

    if (revErr) console.error("[clinic/activity] Error fetching revenue:", revErr)

    if (todayRevenue && todayRevenue.length > 0) {
      const totalRevenue = todayRevenue.reduce(
        (sum, booking) => sum + (Number((booking as any).price) || 0),
        0
      )
      if (totalRevenue > 0) {
        activities.push({
          id: "revenue-today",
          type: "revenue",
          title: `รายได้วันนี้: ฿${totalRevenue.toLocaleString()}`,
          description: `${todayRevenue.length} รายการชำระเงินแล้ว`,
          timestamp: new Date().toISOString(),
          metadata: { revenue: totalRevenue, count: todayRevenue.length },
        })
      }
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      activities: activities.slice(0, 10),
      total: activities.length,
    })
  } catch (error) {
    console.error("[clinic/activity] Unexpected error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
