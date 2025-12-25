"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MapPin, Clock, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { useState, useEffect } from "react"

interface ScheduleData {
  today: string
  staff: {
    id: string
    name: string
    role: string
  }
  summary: {
    total: number
    completed: number
    pending: number
    inProgress: number
    cancelled: number
  }
  appointments: Array<{
    id: string
    time: string
    duration: number
    status: string
    customer: string
    customerPhone: string
    treatment: string
    room: string
    branch: string
    notes?: string
  }>
}

export default function MySchedulePage() {
  const { language } = useLanguage()
  const [schedule, setSchedule] = useState<ScheduleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/staff/schedule?date=${today}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }
      
      const data = await response.json()
      setSchedule(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-indigo-100 text-indigo-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { th: string; en: string } } = {
      completed: { th: 'เสร็จแล้ว', en: 'Completed' },
      scheduled: { th: 'นัดหมาย', en: 'Scheduled' },
      confirmed: { th: 'ยืนยันแล้ว', en: 'Confirmed' },
      in_progress: { th: 'กำลังดำเนินการ', en: 'In Progress' },
      cancelled: { th: 'ยกเลิก', en: 'Cancelled' },
      no_show: { th: 'ไม่มา', en: 'No Show' }
    }
    return statusMap[status]?.[language] || status
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {language === "th" ? "ตารางงานของฉัน" : "My Schedule"}
            </h1>
            <p className="text-muted-foreground">
              {language === "th" 
                ? `วันนี้ ${new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                : `Today ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            </p>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6 text-center">
                    <div className="h-8 w-16 mx-auto bg-gray-200 animate-pulse rounded"></div>
                    <div className="mt-2 h-4 w-24 mx-auto bg-gray-200 animate-pulse rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="mb-8">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{schedule?.summary.total || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "th" ? "นัดหมายวันนี้" : "Today's Appointments"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-emerald-500">{schedule?.summary.completed || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "th" ? "เสร็จแล้ว" : "Completed"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-amber-500">{schedule?.summary.pending || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "th" ? "รอดำเนินการ" : "Pending"}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Schedule List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {language === "th" ? "ตารางนัดหมาย" : "Appointment Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="h-12 w-16 bg-gray-200 animate-pulse rounded"></div>
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                      <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : schedule?.appointments && schedule.appointments.length > 0 ? (
                  schedule.appointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-center sm:text-left sm:min-w-[60px]">
                        <div className="text-lg font-bold">{appointment.time}</div>
                        <div className="text-xs text-muted-foreground">{appointment.duration} นาที</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {appointment.customer}
                        </div>
                        <div className="text-sm text-muted-foreground">{appointment.treatment}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                        <MapPin className="h-4 w-4" />
                        {appointment.room}
                      </div>
                      
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {language === "th" ? "ไม่มีนัดหมายวันนี้" : "No appointments today"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
