"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface Booking {
  id: string
  booking_date: string
  booking_time: string
  treatment_type: string
  status: string
  notes?: string
  clinic?: {
    name: string
    address: string
  }
}

export function BookingHistoryList({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/customer/bookings")
        const data = await response.json()
        if (data.success) {
          setBookings(data.bookings)
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">Start by booking your first treatment</p>
        <Button>Book Treatment</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h4 className="font-semibold">{booking.treatment_type}</h4>
                <Badge
                  variant={
                    booking.status === "confirmed"
                      ? "default"
                      : booking.status === "completed"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {booking.status}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(booking.booking_date), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{booking.booking_time}</span>
                </div>
                {booking.clinic && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.clinic.name}</span>
                  </div>
                )}
              </div>

              {booking.notes && <p className="mt-2 text-sm text-muted-foreground">{booking.notes}</p>}
            </div>

            <div className="flex flex-col gap-2">
              {booking.status === "confirmed" && (
                <>
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                </>
              )}
              {booking.status === "completed" && (
                <Button size="sm" variant="outline">
                  Book Again
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
