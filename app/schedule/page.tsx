"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarView } from "@/components/schedule/calendar-view"
import { AvailabilityManager } from "@/components/schedule/availability-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [selectedDate, view])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let startDate, endDate

      if (view === "day") {
        startDate = format(selectedDate, "yyyy-MM-dd")
        endDate = startDate
      } else if (view === "week") {
        startDate = format(startOfWeek(selectedDate), "yyyy-MM-dd")
        endDate = format(endOfWeek(selectedDate), "yyyy-MM-dd")
      } else {
        startDate = format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), "yyyy-MM-dd")
        endDate = format(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), "yyyy-MM-dd")
      }

      const response = await fetch(`/api/schedule/bookings?start_date=${startDate}&end_date=${endDate}`)
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error("[v0] Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Schedule & Calendar</h1>
        <p className="text-muted-foreground">Manage appointments and staff availability</p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Clock className="mr-2 h-4 w-4" />
            Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointment Calendar</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={view === "day" ? "default" : "outline"} onClick={() => setView("day")}>
                    Day
                  </Button>
                  <Button size="sm" variant={view === "week" ? "default" : "outline"} onClick={() => setView("week")}>
                    Week
                  </Button>
                  <Button size="sm" variant={view === "month" ? "default" : "outline"} onClick={() => setView("month")}>
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-sm">Cancelled</span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <CalendarView
                    date={selectedDate}
                    view={view}
                    bookings={bookings}
                    loading={loading}
                    onRefresh={fetchBookings}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
