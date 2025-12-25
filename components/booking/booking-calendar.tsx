"use client"

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { th } from 'date-fns/locale'

interface Booking {
  id: string
  customer_name: string
  customer_email: string
  staff_name: string
  service_name: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  room_name?: string
  notes?: string
}

interface BookingCalendarProps {
  bookings?: Booking[]
  onDateSelect?: (date: Date) => void
  onBookingClick?: (booking: Booking) => void
  view?: 'month' | 'week' | 'day'
  className?: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export function BookingCalendar({ 
  bookings = [], 
  onDateSelect, 
  onBookingClick,
  view = 'month',
  className 
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get days for current view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days
  const startPadding = monthStart.getDay()
  const endPadding = 6 - monthEnd.getDay()
  const paddingStart = Array(startPadding).fill(null)
  const paddingEnd = Array(endPadding).fill(null)

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.start_time.split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookingsByDate[dateStr] || []
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: th })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding start */}
            {paddingStart.map((_, index) => (
              <div key={`start-${index}`} className="p-2" />
            ))}

            {/* Actual days */}
            {calendarDays.map((date) => {
              const dayBookings = getBookingsForDate(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isToday = isSameDay(date, new Date())

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors",
                    isSelected && "ring-2 ring-primary",
                    isToday && "bg-primary/5",
                    "hover:bg-muted/50"
                  )}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(date, 'd')}
                  </div>
                  <ScrollArea className="h-[60px]">
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer truncate",
                            statusColors[booking.status]
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onBookingClick?.(booking)
                          }}
                        >
                          <div className="font-medium">{booking.customer_name}</div>
                          <div className="opacity-75">
                            {format(new Date(booking.start_time), 'HH:mm')}
                          </div>
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayBookings.length - 3} เพิ่ม
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}

            {/* Padding end */}
            {paddingEnd.map((_, index) => (
              <div key={`end-${index}`} className="p-2" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(selectedDate, 'd MMMM yyyy', { locale: th })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getBookingsForDate(selectedDate).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  ไม่มีการนัดหมายในวันนี้
                </p>
              ) : (
                getBookingsForDate(selectedDate).map((booking) => (
                  <div
                    key={booking.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      "hover:bg-muted/50"
                    )}
                    onClick={() => onBookingClick?.(booking)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{booking.customer_name}</span>
                          <Badge variant="outline" className={statusColors[booking.status]}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {booking.staff_name}
                          </div>
                          {booking.room_name && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {booking.room_name}
                            </div>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
