import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * GET /api/clinic/queue/display
 * 
 * Returns current queue status for display screen
 * - Current serving patient
 * - Next 3-5 patients in queue
 * - Updated timestamp
 * 
 * Query params:
 * - clinicId: string (required)
 * - limit: number (default: 3) - how many next patients to show
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get("clinicId")
    const limit = parseInt(searchParams.get("limit") || "3", 10)

    if (!clinicId) {
      return NextResponse.json(
        { error: "clinicId is required" },
        { status: 400 }
      )
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get current serving patient (status = 'serving' or 'called')
    const { data: servingData, error: servingError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        queue_number,
        booking_time,
        treatment_type,
        status,
        check_in_time,
        customer_name,
        customers (
          id,
          full_name,
          phone
        ),
        clinic_staff (
          id,
          full_name,
          role
        )
      `
      )
      .eq("clinic_id", clinicId)
      .eq("booking_date", new Date().toISOString().split("T")[0])
      .in("status", ["serving", "called"])
      .order("booking_time", { ascending: true })
      .limit(1)
      .single()

    if (servingError && servingError.code !== "PGRST116") {
      console.error("[queue/display] Error fetching serving:", servingError)
    }

    // Get next patients in queue (status = 'waiting' or 'checked_in')
    const { data: nextData, error: nextError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        queue_number,
        booking_time,
        treatment_type,
        status,
        check_in_time,
        customer_name,
        customers (
          id,
          full_name,
          phone
        )
      `
      )
      .eq("clinic_id", clinicId)
      .eq("booking_date", new Date().toISOString().split("T")[0])
      .in("status", ["waiting", "checked_in"])
      .order("queue_number", { ascending: true })
      .limit(limit)

    if (nextError) {
      console.error("[queue/display] Error fetching next:", nextError)
      return NextResponse.json(
        { error: nextError.message },
        { status: 500 }
      )
    }

    // Calculate estimated wait times
    const AVERAGE_SERVICE_TIME = 15 // minutes per patient
    const nextWithEstimates = (nextData || []).map((booking: any, index) => {
      const estimatedWait = (index + 1) * AVERAGE_SERVICE_TIME
      const customer = Array.isArray(booking.customers) ? booking.customers[0] : booking.customers
      return {
        id: booking.id,
        queueNumber: booking.queue_number || `Q-${booking.id.slice(0, 6)}`,
        patientName: customer?.full_name || booking.customer_name || "ลูกค้า",
        status: booking.status,
        treatmentType: booking.treatment_type,
        estimatedWait,
        checkInTime: booking.check_in_time,
      }
    })

    // Format current serving
    const currentServing = servingData
      ? (() => {
          const customer = Array.isArray((servingData as any).customers) 
            ? (servingData as any).customers[0] 
            : (servingData as any).customers
          const staff = Array.isArray((servingData as any).clinic_staff) 
            ? (servingData as any).clinic_staff[0] 
            : (servingData as any).clinic_staff
          return {
            id: servingData.id,
            queueNumber: servingData.queue_number || `Q-${servingData.id.slice(0, 6)}`,
            patientName: customer?.full_name || servingData.customer_name || "ลูกค้า",
            status: servingData.status,
            treatmentType: servingData.treatment_type,
            room: (servingData as any).room_number || "ห้อง 1", // Default to room 1 if not assigned
            doctor: staff?.full_name || "แพทย์",
            checkInTime: servingData.check_in_time,
          }
        })()
      : null

    // Get queue statistics
    const { data: statsData } = await supabaseAdmin
      .from("bookings")
      .select("status", { count: "exact" })
      .eq("clinic_id", clinicId)
      .eq("booking_date", new Date().toISOString().split("T")[0])
      .in("status", ["waiting", "checked_in", "serving", "called"])

    const stats = {
      totalWaiting: statsData?.filter((b) => b.status === "waiting" || b.status === "checked_in").length || 0,
      currentServing: servingData ? 1 : 0,
      averageWaitTime: AVERAGE_SERVICE_TIME,
    }

    return NextResponse.json({
      success: true,
      currentServing,
      nextInQueue: nextWithEstimates,
      stats,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[queue/display] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
