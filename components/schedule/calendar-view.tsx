"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, User } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"

interface Booking {
  id: string
  booking_date: string
  booking_time: string
  duration_minutes: number
  treatment_type: string
  status: string
  customer: {
    full_name: string
    phone: string
  }
  staff: {
    full_name: string
  }
}

interface CalendarViewProps {
  date: Date
  view: "day" | "week" | "month"
  bookings: Booking[]
  loading: boolean
  onRefresh: () => void
}

export function CalendarView({ date, view, bookings, loading, onRefresh: _onRefresh }: CalendarViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (view === "day") {
    return <DayView date={date} bookings={bookings} />
  }

  if (view === "week") {
    return <WeekView date={date} bookings={bookings} />
  }

  return <MonthView date={date} bookings={bookings} />
}

function DayView({ date, bookings }: { date: Date; bookings: Booking[] }) {
  const dayBookings = bookings.filter((b) => isSameDay(new Date(b.booking_date), date))

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 8 PM

  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-4">{format(date, "EEEE, MMMM d, yyyy")}</h3>
      <div className="space-y-1">
        {hours.map((hour) => {
          const hourBookings = dayBookings.filter((b) => {
            const bookingHour = Number.parseInt(b.booking_time.split(":")[0])
            return bookingHour === hour
          })

          return (
            <div key={hour} className="flex gap-2 min-h-[60px] border-b">
              <div className="w-20 text-sm text-muted-foreground pt-1">{hour.toString().padStart(2, "0")}:00</div>
              <div className="flex-1 space-y-1">
                {hourBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekView({ date, bookings }: { date: Date; bookings: Booking[] }) {
  const weekStart = startOfWeek(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayBookings = bookings.filter((b) => isSameDay(new Date(b.booking_date), day))

          return (
            <div key={day.toISOString()} className="border rounded-lg p-2">
              <div className="font-semibold text-sm mb-2">{format(day, "EEE d")}</div>
              <div className="space-y-1">
                {dayBookings.map((booking) => (
                  <div key={booking.id} className={`text-xs p-1 rounded ${getStatusColor(booking.status)}`}>
                    <div className="font-medium truncate">{booking.booking_time}</div>
                    <div className="truncate">{booking.customer.full_name}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({ date, bookings }: { date: Date; bookings: Booking[] }) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const days = []

  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="text-center font-semibold text-sm p-2">
          {day}
        </div>
      ))}
      {days.map((day) => {
        const dayBookings = bookings.filter((b) => isSameDay(new Date(b.booking_date), day))

        return (
          <div key={day.toISOString()} className="border rounded-lg p-2 min-h-[80px]">
            <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
            <div className="space-y-1">
              {dayBookings.slice(0, 2).map((booking) => (
                <div key={booking.id} className={`text-xs p-1 rounded ${getStatusColor(booking.status)}`}>
                  {booking.booking_time}
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className="text-xs text-muted-foreground">+{dayBookings.length - 2} more</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card className={`p-3 ${getStatusColor(booking.status)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3" />
            <span className="text-sm font-medium">{booking.booking_time}</span>
            <Badge variant="outline" className="text-xs">
              {booking.duration_minutes}m
            </Badge>
          </div>
          <div className="text-sm font-semibold">{booking.treatment_type}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <User className="h-3 w-3" />
            {booking.customer.full_name}
          </div>
        </div>
        <Badge className={getStatusBadgeColor(booking.status)}>{booking.status}</Badge>
      </div>
    </Card>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-blue-50 border-blue-200"
    case "pending":
      return "bg-yellow-50 border-yellow-200"
    case "completed":
      return "bg-green-50 border-green-200"
    case "cancelled":
      return "bg-red-50 border-red-200"
    default:
      return "bg-gray-50"
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return ""
  }
}
