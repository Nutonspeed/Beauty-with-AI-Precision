"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShimmerSkeleton } from "@/components/ui/modern-loader"
import { Calendar, Clock, User, Stethoscope } from "lucide-react"

interface AppointmentSlot {
  id?: string
  clinic_id: string
  customer_id: string
  doctor_id: string | null
  room_id: string | null
  service_id: string | null
  appointment_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  service_name: string
  service_price: number | null
  status: string
  confirmation_status?: string | null
  payment_status?: string | null
}

interface AppointmentsResponse {
  appointments: AppointmentSlot[]
  total: number
  limit: number
  offset: number
}

export default function ClinicAppointmentsPage() {
  const router = useRouter()
  const [data, setData] = useState<AppointmentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mineOnly, setMineOnly] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('scheduled')
  const [range, setRange] = useState<'today' | '7d' | '30d'>('today')

  useEffect(() => {
    let cancelled = false

    const loadAppointments = async () => {
      try {
        const today = new Date()
        let dateFrom = today.toISOString().slice(0, 10)
        let dateTo = ''

        if (range === '7d' || range === '30d') {
          const from = new Date(today)
          const days = range === '7d' ? 7 : 30
          from.setDate(from.getDate() - (days - 1))
          dateFrom = from.toISOString().slice(0, 10)
          dateTo = today.toISOString().slice(0, 10)
        }

        const mineParam = mineOnly ? '&doctor_id=me' : ''
        const statusParam = statusFilter === 'all' ? '' : `&status=${statusFilter}`
        const rangeParams = `&date_from=${dateFrom}${dateTo ? `&date_to=${dateTo}` : ''}`
        const search = `?limit=50${rangeParams}${mineParam}${statusParam}`
        const res = await fetch(`/api/appointments${search}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          throw new Error(`Failed to load appointments: ${res.status}`)
        }

        const json: AppointmentsResponse = await res.json()
        if (!cancelled) {
          setData(json)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Load appointments failed:", err)
        if (!cancelled) {
          setError("ไม่สามารถโหลดตารางนัดได้")
          setIsLoading(false)
        }
      }
    }

    loadAppointments()

    return () => {
      cancelled = true
    }
  }, [mineOnly, statusFilter, range])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <ShimmerSkeleton className="h-8 w-48" />
              <ShimmerSkeleton className="h-4 w-32" />
            </div>
            <ShimmerSkeleton className="h-10 w-32 rounded-lg" />
          </div>
          <ShimmerSkeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-sm md:text-base">{error}</p>
          <Button onClick={() => router.refresh()}>ลองใหม่อีกครั้ง</Button>
        </div>
      </div>
    )
  }

  const appointments = data?.appointments || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ตารางนัดหมายวันนี้</h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              ดูคิวลูกค้าและนัดหมายของทีมงานแบบเรียลไทม์
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-1 text-xs md:text-sm">
              <span className="text-gray-600">ช่วง:</span>
              <div className="flex rounded-lg border bg-white overflow-hidden text-xs">
                {([
                  { label: 'วันนี้', value: 'today' },
                  { label: '7 วัน', value: '7d' },
                  { label: '30 วัน', value: '30d' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRange(opt.value)}
                    className={`px-2 py-1 border-r last:border-r-0 transition-colors ${
                      range === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm">
              <span className="text-gray-600">สถานะ:</span>
              <select
                className="rounded border bg-white px-2 py-1 text-xs md:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button
              variant={mineOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setMineOnly((v) => !v)}
            >
              {mineOnly ? "แสดงเฉพาะนัดของฉัน" : "แสดงนัดของทุกคน"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/sales/dashboard")}>กลับไป Sales Dashboard</Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              นัดหมายวันนี้ ({appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-gray-600">วันนี้ยังไม่มีนัดหมาย</p>
            ) : (
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <table className="min-w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="px-2 py-2 text-left font-medium">เวลา</th>
                      <th className="px-2 py-2 text-left font-medium">ลูกค้า</th>
                      <th className="px-2 py-2 text-left font-medium">บริการ</th>
                      <th className="px-2 py-2 text-left font-medium">ผู้ดูแล</th>
                      <th className="px-2 py-2 text-left font-medium">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => {
                      const timeRange = `${a.start_time?.slice(0, 5)} - ${a.end_time?.slice(0, 5)}`
                      return (
                        <tr key={a.id || `${a.clinic_id}-${a.customer_id}-${a.appointment_date}-${a.start_time}`} className="border-b last:border-0 hover:bg-white/60">
                          <td className="px-2 py-2 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span>{timeRange}</span>
                            </div>
                            <div className="text-[11px] text-gray-500">{a.appointment_date}</div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-500" />
                              <span className="font-medium">{a.customer_name}</span>
                            </div>
                            <div className="text-[11px] text-gray-500">{a.customer_phone || a.customer_email || "-"}</div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="font-medium">{a.service_name}</div>
                            {typeof a.service_price === "number" && (
                              <div className="text-[11px] text-gray-500">฿{a.service_price.toLocaleString()}</div>
                            )}
                          </td>
                          <td className="px-2 py-2 align-top">
                            {a.doctor_id ? (
                              <div className="flex items-center gap-1 text-xs">
                                <Stethoscope className="w-3 h-3 text-gray-500" />
                                <span>{a.doctor_id}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-500">ไม่ระบุ</span>
                            )}
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="flex flex-col gap-1">
                              <Badge variant={a.status === "completed" ? "default" : a.status === "cancelled" ? "destructive" : "outline"}>
                                {a.status}
                              </Badge>
                              {a.payment_status && (
                                <span className="text-[10px] uppercase tracking-wide text-gray-500">
                                  Payment: {a.payment_status}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
