"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ShimmerSkeleton } from "@/components/ui/modern-loader"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Stethoscope } from "lucide-react"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useToast } from "@/hooks/use-toast"

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

interface BookingPayment {
  id: string
  clinic_id: string
  appointment_id: string
  amount: number
  payment_method: string | null
  payment_status: "pending" | "paid" | "refunded" | "cancelled" | string
  payment_date: string | null
  transaction_id: string | null
  notes: string | null
}

const EMPTY_APPOINTMENTS: AppointmentSlot[] = []

type ClinicSubscriptionStatus = {
  isActive: boolean
  isTrial: boolean
  isTrialExpired: boolean
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled'
  plan: string
  message: string
}

export default function ClinicAppointmentsPage() {
  const router = useRouter()
  const lp = useLocalizePath()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const highlightAppointmentId = searchParams.get("appointment_id")
  const currentSearch = useMemo(() => searchParams.toString(), [searchParams])
  const [data, setData] = useState<AppointmentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [subscription, setSubscription] = useState<ClinicSubscriptionStatus | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [paymentsByAppointmentId, setPaymentsByAppointmentId] = useState<Record<string, BookingPayment | undefined>>({})
  const [markPaidLoadingId, setMarkPaidLoadingId] = useState<string | null>(null)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [markPaidPayment, setMarkPaidPayment] = useState<BookingPayment | null>(null)
  const [markPaidTransactionId, setMarkPaidTransactionId] = useState("")
  const [markPaidNotes, setMarkPaidNotes] = useState("")
  const [mineOnly, setMineOnly] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('scheduled')
  const [range, setRange] = useState<'today' | '7d' | '30d'>('today')
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!highlightAppointmentId) return
    setMineOnly(false)
    setStatusFilter('all')
  }, [highlightAppointmentId])

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setSubscriptionLoading(true)
        const res = await fetch('/api/clinic/subscription-status')
        if (!res.ok) {
          setSubscription(null)
          return
        }
        const result = await res.json()
        setSubscription(result?.subscription || null)
      } catch {
        setSubscription(null)
      } finally {
        setSubscriptionLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  // Auto-scroll highlighted appointment into view (after data is loaded)
  useEffect(() => {
    if (!highlightAppointmentId) return
    if (isLoading) return

    const id = `appt-${highlightAppointmentId}`
    const el = globalThis.document?.getElementById(id)
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" })
    }
  }, [highlightAppointmentId, isLoading, currentSearch])

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
          setPaymentsByAppointmentId({})
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

  useEffect(() => {
    let cancelled = false

    const loadPayments = async () => {
      try {
        const appts = data?.appointments || []
        const ids = appts.map((a) => a.id).filter(Boolean) as string[]
        if (ids.length === 0) {
          setPaymentsByAppointmentId({})
          return
        }

        const res = await fetch(`/api/clinic/payments/booking-payments?appointment_ids=${encodeURIComponent(ids.join(","))}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          setPaymentsByAppointmentId({})
          return
        }

        const json = await res.json()
        const payments: BookingPayment[] = Array.isArray(json?.payments) ? json.payments : []
        const map: Record<string, BookingPayment | undefined> = {}
        for (const p of payments) {
          map[p.appointment_id] = p
        }

        if (!cancelled) {
          setPaymentsByAppointmentId(map)
        }
      } catch {
        if (!cancelled) setPaymentsByAppointmentId({})
      }
    }

    loadPayments()

    return () => {
      cancelled = true
    }
  }, [data])

  const handleOpenPromptPayQr = (clinicId: string, amount: number) => {
    const url = `/api/payments/promptpay/qr?clinic_id=${encodeURIComponent(clinicId)}&amount=${encodeURIComponent(String(amount))}`
    globalThis.open(url, "_blank")
  }

  const openMarkPaidDialog = (payment: BookingPayment) => {
    if (!canManagePayments) {
      toast({
        title: 'Subscription จำกัดการใช้งาน',
        description: subscription?.message || 'Subscription is not active',
        variant: 'destructive',
      })
      return
    }
    setMarkPaidPayment(payment)
    setMarkPaidTransactionId(payment.transaction_id || "")
    setMarkPaidNotes(payment.notes || "")
    setMarkPaidOpen(true)
  }

  const submitMarkPaid = async () => {
    const payment = markPaidPayment
    if (!payment?.id) return

    if (!canManagePayments) {
      toast({
        title: 'Subscription จำกัดการใช้งาน',
        description: subscription?.message || 'Subscription is not active',
        variant: 'destructive',
      })
      return
    }

    try {
      setMarkPaidLoadingId(payment.id)
      const res = await fetch(`/api/payments/booking-payments/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          payment_id: payment.id,
          transaction_id: markPaidTransactionId.trim() ? markPaidTransactionId.trim() : null,
          notes: markPaidNotes.trim() ? markPaidNotes.trim() : null,
        }),
      })

      if (!res.ok) {
        throw new Error(`mark-paid failed: ${res.status}`)
      }

      const json = await res.json()
      const updated: BookingPayment | null = json?.payment || null
      if (updated?.appointment_id) {
        setPaymentsByAppointmentId((prev) => ({ ...prev, [updated.appointment_id]: updated }))
      }
      setMarkPaidOpen(false)
      setMarkPaidPayment(null)
    } catch (e) {
      console.error("Mark paid failed:", e)
      setError("ไม่สามารถอัปเดตสถานะการชำระเงินได้")
    } finally {
      setMarkPaidLoadingId(null)
    }
  }

  const appointments = data?.appointments ?? EMPTY_APPOINTMENTS

  const canManagePayments = subscriptionLoading ? false : (subscription?.isActive ?? true)

  const filteredAppointments = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return appointments

    return appointments.filter((a) => {
      const hay = [
        a.id,
        a.customer_name,
        a.customer_email,
        a.customer_phone,
        a.service_name,
        a.appointment_date,
        a.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [appointments, query])

  const highlightAppointmentIdInFiltered = useMemo(() => {
    if (!highlightAppointmentId) return null
    const exists = filteredAppointments.some((a) => a.id === highlightAppointmentId)
    return exists ? highlightAppointmentId : null
  }, [filteredAppointments, highlightAppointmentId])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <Dialog
          open={markPaidOpen}
          onOpenChange={(open) => {
            setMarkPaidOpen(open)
            if (!open) {
              setMarkPaidPayment(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการรับเงิน</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                {markPaidPayment ? (
                  <>
                    Payment ID: <span className="font-mono text-xs">{markPaidPayment.id}</span>
                    <br />
                    Amount: <span className="font-medium">฿{Number(markPaidPayment.amount || 0).toLocaleString()}</span>
                  </>
                ) : null}
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Transaction ID (optional)</div>
                <Input value={markPaidTransactionId} onChange={(e) => setMarkPaidTransactionId(e.target.value)} />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Notes (optional)</div>
                <Textarea value={markPaidNotes} onChange={(e) => setMarkPaidNotes(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMarkPaidOpen(false)
                  setMarkPaidPayment(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitMarkPaid}
                disabled={!markPaidPayment?.id || !canManagePayments || markPaidLoadingId === markPaidPayment.id}
              >
                {markPaidLoadingId && markPaidPayment?.id && markPaidLoadingId === markPaidPayment.id ? "Saving..." : "Confirm paid"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {highlightAppointmentId ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between gap-3">
            <div className="text-sm text-emerald-900">
              กำลังไฮไลท์นัดหมาย: <span className="font-mono text-xs">{highlightAppointmentId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(globalThis.location.href)
                  } catch {
                    // ignore
                  }
                }}
              >
                คัดลอกลิงก์
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const url = new URL(globalThis.location.href)
                  url.searchParams.delete("appointment_id")
                  router.replace(url.pathname + (url.search ? url.search : ""))
                }}
              >
                ล้างไฮไลท์
              </Button>
            </div>
          </div>
        ) : null}

        {!subscriptionLoading && subscription && !subscription.isActive ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-yellow-900">Subscription จำกัดการใช้งาน</div>
                <div className="text-sm text-yellow-800">{subscription.message}</div>
              </div>
            </CardContent>
          </Card>
        ) : null}

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
            <Button
              variant="outline"
              size="sm"
              disabled={!canManagePayments}
              onClick={() => {
                if (!canManagePayments) {
                  toast({
                    title: 'Subscription จำกัดการใช้งาน',
                    description: subscription?.message || 'Subscription is not active',
                    variant: 'destructive',
                  })
                  return
                }
                router.push(lp("/clinic/payments"))
              }}
            >
              Payments
            </Button>
            <Button variant="outline" onClick={() => router.push("/sales/dashboard")}>กลับไป Sales Dashboard</Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              นัดหมายวันนี้ ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-col md:flex-row md:items-center gap-2">
              <input
                className="w-full md:max-w-sm rounded border bg-white px-3 py-2 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหา: ชื่อ/โทร/อีเมล/บริการ/วันที่/สถานะ/ID"
              />
              {query ? (
                <Button size="sm" variant="outline" onClick={() => setQuery("")}>ล้างค้นหา</Button>
              ) : null}
              {highlightAppointmentId && !highlightAppointmentIdInFiltered ? (
                <Badge variant="outline">นัดที่ไฮไลท์อาจถูกกรองออกด้วยคำค้นหา</Badge>
              ) : null}
            </div>

            {filteredAppointments.length === 0 ? (
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
                      <th className="px-2 py-2 text-left font-medium">ชำระเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((a) => {
                      const timeRange = `${a.start_time?.slice(0, 5)} - ${a.end_time?.slice(0, 5)}`
                      const isHighlighted = !!highlightAppointmentId && a.id === highlightAppointmentId
                      const payment = a.id ? paymentsByAppointmentId[a.id] : undefined
                      return (
                        <tr
                          id={a.id ? `appt-${a.id}` : undefined}
                          key={a.id || `${a.clinic_id}-${a.customer_id}-${a.appointment_date}-${a.start_time}`}
                          className={`border-b last:border-0 hover:bg-white/60 ${
                            isHighlighted ? "bg-emerald-50 ring-1 ring-emerald-200" : ""
                          }`}
                        >
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
                          <td className="px-2 py-2 align-top">
                            {payment ? (
                              <div className="flex flex-col gap-1">
                                <Badge variant={payment.payment_status === "paid" ? "default" : payment.payment_status === "pending" ? "outline" : "destructive"}>
                                  {payment.payment_status}
                                </Badge>
                                <div className="text-[11px] text-gray-600">
                                  ฿{Number(payment.amount || 0).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {payment.payment_method === "promptpay" ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (!canManagePayments) {
                                          toast({
                                            title: 'Subscription จำกัดการใช้งาน',
                                            description: subscription?.message || 'Subscription is not active',
                                            variant: 'destructive',
                                          })
                                          return
                                        }
                                        handleOpenPromptPayQr(payment.clinic_id, Number(payment.amount || 0))
                                      }}
                                      disabled={!canManagePayments}
                                    >
                                      Open QR
                                    </Button>
                                  ) : null}
                                  {payment.payment_status === "pending" ? (
                                    <Button
                                      size="sm"
                                      onClick={() => openMarkPaidDialog(payment)}
                                      disabled={!canManagePayments || markPaidLoadingId === payment.id}
                                    >
                                      {markPaidLoadingId === payment.id ? "Saving..." : "Mark paid"}
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-500">-</span>
                            )}
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
