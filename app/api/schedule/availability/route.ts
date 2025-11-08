import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get("staff_id")
    const date = searchParams.get("date")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get staff availability for the date
    const { data: availability, error } = await supabase
      .from("staff_availability")
      .select("*")
      .eq("staff_id", staffId || user.id)
      .eq("date", date)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    // Get existing bookings for the date
    const { data: bookings } = await supabase
      .from("bookings")
      .select("booking_time, duration_minutes")
      .eq("staff_id", staffId || user.id)
      .eq("booking_date", date)
      .eq("status", "confirmed")

    // Generate available time slots
    const slots = generateTimeSlots(availability, bookings || [])

    return NextResponse.json({ availability, slots })
  } catch (error) {
    console.error("[v0] Error fetching availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { date, day_of_week, start_time, end_time, is_available } = body

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("clinic_id").eq("id", user.id).single()

    const { data, error } = await supabase
      .from("staff_availability")
      .upsert({
        staff_id: user.id,
        clinic_id: userData?.clinic_id,
        date,
        day_of_week,
        start_time,
        end_time,
        is_available,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ availability: data })
  } catch (error) {
    console.error("[v0] Error setting availability:", error)
    return NextResponse.json({ error: "Failed to set availability" }, { status: 500 })
  }
}

function generateTimeSlots(
  availability: { start_time: string; end_time: string } | null,
  bookings: { booking_time: string; duration_minutes: number }[],
): string[] {
  if (!availability) {
    return []
  }

  const slots: string[] = []
  const startHour = Number.parseInt(availability.start_time.split(":")[0])
  const endHour = Number.parseInt(availability.end_time.split(":")[0])

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      // Check if slot is already booked
      const isBooked = bookings.some((booking) => {
        const bookingStart = booking.booking_time
        const bookingEnd = addMinutes(bookingStart, booking.duration_minutes)
        return timeSlot >= bookingStart && timeSlot < bookingEnd
      })

      if (!isBooked) {
        slots.push(timeSlot)
      }
    }
  }

  return slots
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`
}
