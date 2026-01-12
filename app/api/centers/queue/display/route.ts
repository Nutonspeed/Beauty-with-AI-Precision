import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * GET /api/center/queue/display
 * 
 * Returns current queue status for display screen
 * - Current serving client
 * - Next 3-5 clients in queue
 * - Updated timestamp
 * 
 * Query params:
 * - centerId: string (required)
 * - limit: number (default: 3) - how many next clients to show
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get("centerId")
    const limit = parseInt(searchParams.get("limit") || "3", 10)

    if (!centerId) {
      return NextResponse.json(
        { error: "centerId is required" },
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

    // Get current serving client (status = 'serving' or 'called')
    const { data: servingData, error: servingError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        queue_number,
        booking_time,
        program_type,
        status,
        check_in_time,
        customer_name,
        customers (
          id,
          full_name,
          phone
        ),
        center_staff (
          id,
          full_name,
          role
        )
      `
      )
      .eq("center_id", centerId)
      .eq("booking_date", new Date().toISOString().split("T")[0])
      .in("status", ["serving", "called"])
      .order("booking_time", { ascending: true })
      .limit(1)
      .single()

    if (servingError && servingError.code !== "PGRST116") {
      console.error("[queue/display] Error fetching serving:", servingError)
    }

    // Get next clients in queue (status = 'waiting' or 'checked_in')
    const { data: nextData, error: nextError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        queue_number,
        booking_time,
        program_type,
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
      .eq("center_id", centerId)
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
    const AVERAGE_SERVICE_TIME = 15 // minutes per client
    const nextWithEstimates = (nextData || []).map((booking: any, index) => {
      const estimatedWait = (index + 1) * AVERAGE_SERVICE_TIME
      const customer = Array.isArray(booking.customers) ? booking.customers[0] : booking.customers
      return {
        id: booking.id,
        queueNumber: booking.queue_number || `Q-${booking.id.slice(0, 6)}`,
        clientName: customer?.full_name || booking.customer_name || "ลูกค้า",
        status: booking.status,
        programType: booking.program_type,
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
          const staff = Array.isArray((servingData as any).center_staff) 
            ? (servingData as any).center_staff[0] 
            : (servingData as any).center_staff
          return {
            id: servingData.id,
            queueNumber: servingData.queue_number || `Q-${servingData.id.slice(0, 6)}`,
            clientName: customer?.full_name || servingData.customer_name || "ลูกค้า",
            status: servingData.status,
            programType: servingData.program_type,
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
      .eq("center_id", centerId)
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
