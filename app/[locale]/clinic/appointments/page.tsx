"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ShimmerSkeleton } from "@/components/ui/modern-loader"
import { Alert } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, User, Stethoscope, XCircle, CheckCircle2, Loader2, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLocale, useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { Textarea } from "@/components/ui/textarea"

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

export default function ClinicAppointmentsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const lp = useLocalizePath()
  const searchParams = useSearchParams()
  const highlightAppointmentId = searchParams.get("appointment_id")
  const currentSearch = useMemo(() => searchParams.toString(), [searchParams])
  const [data, setData] = useState<AppointmentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    setMarkPaidPayment(payment)
    setMarkPaidTransactionId(payment.transaction_id || "")
    setMarkPaidNotes(payment.notes || "")
    setMarkPaidOpen(true)
  }

  const submitMarkPaid = async () => {
    const payment = markPaidPayment
    if (!payment?.id) return

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
      <div className="min-h-screen bg-[#020617] p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center pb-8 border-b border-white/5">
            <div className="space-y-4">
              <ShimmerSkeleton className="h-10 w-64 bg-white/5" />
              <ShimmerSkeleton className="h-4 w-48 bg-white/5" />
            </div>
            <ShimmerSkeleton className="h-14 w-40 rounded-2xl bg-white/5" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <ShimmerSkeleton key={i} className="h-32 rounded-[1.5rem] bg-white/5" />
            ))}
          </div>
          <ShimmerSkeleton className="h-[500px] rounded-[3rem] bg-white/5" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <XCircle className="mx-auto h-16 w-16 text-rose-500 opacity-20" />
          <p className="text-rose-400 font-bold italic">{error}</p>
          <Button onClick={() => router.refresh()} variant="outline" className="rounded-xl border-white/10 text-white">Retry Connection</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-12 max-w-7xl mx-auto">
          {/* Appointment Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Calendar className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Temporal Scheduling Node
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Appointment<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Synchronizer</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Monitor real-time clinical cycles and team resource allocation with precision.
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 shadow-inner">
                {(['today', '7d', '30d'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRange(opt)}
                    className={cn(
                      "px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500",
                      range === opt ? "bg-pink-600 text-white shadow-2xl shadow-pink-600/40 italic" : "text-slate-600 hover:text-slate-300"
                    )}
                  >
                    {opt === 'today' ? 'Today' : opt === '7d' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
              <Button variant="premium" className="h-14 px-8 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" onClick={() => router.push(lp("/clinic/payments"))}>
                Financial Nodes
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {highlightAppointmentId && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Alert className="border-emerald-500/20 bg-emerald-500/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between gap-8 relative z-10 w-full">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner">
                        <Stethoscope className="h-6 w-6 text-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-sm font-bold text-white tracking-tight italic">
                        Active Selection Node: <span className="font-mono text-emerald-400 ml-2">{highlightAppointmentId}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-10 px-6" onClick={async () => {
                        try { await navigator.clipboard.writeText(globalThis.location.href) } catch {}
                      }}>
                        Copy Link
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-10 px-6" onClick={() => {
                        const url = new URL(globalThis.location.href)
                        url.searchParams.delete("appointment_id")
                        router.replace(url.pathname + (url.search ? url.search : ""))
                      }}>
                        Bypass Selection
                      </Button>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtering Infrastructure */}
          <div className="grid gap-8 md:grid-cols-12 items-end">
            <div className="md:col-span-5 space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Search Diagnostics</Label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <Input
                  className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6 relative z-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ID / Name / Phone / Service / Status..."
                />
              </div>
            </div>
            
            <div className="md:col-span-3 space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Status Filter</Label>
              <div className="relative">
                <select
                  className="h-14 w-full rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 appearance-none transition-all cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all" className="bg-[#020617]">GLOBAL VIEW</option>
                  <option value="scheduled" className="bg-[#020617]">SCHEDULED</option>
                  <option value="completed" className="bg-[#020617]">COMPLETED</option>
                  <option value="cancelled" className="bg-[#020617]">CANCELLED</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex items-center gap-4">
              <Button
                variant={mineOnly ? "premium" : "outline"}
                className={cn(
                  "flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all",
                  !mineOnly && "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setMineOnly((v) => !v)}
              >
                {mineOnly ? "My Nodes Only" : "Global Node View"}
              </Button>
              {query && (
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white" onClick={() => setQuery("")}>
                  <XCircle className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>

          {/* Appointments Grid Table - Clinical Infrastructure Style */}
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-pink-500" />
                  Live Cycle Monitor ({filteredAppointments.length})
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Real-time clinical synchronization</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAppointments.length === 0 ? (
                <div className="py-32 text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 animate-pulse shadow-inner">
                    <Calendar className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-slate-500 italic">Temporal Void</p>
                    <p className="text-sm text-slate-700 font-light uppercase tracking-widest">No cycles detected for current parameters.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Cycle Time</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Client Identity</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Clinical Protocol</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Operator Node</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Status Vector</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Financial Inflow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAppointments.map((a) => {
                        const timeRange = `${a.start_time?.slice(0, 5)} - ${a.end_time?.slice(0, 5)}`
                        const isHighlighted = !!highlightAppointmentId && a.id === highlightAppointmentId
                        const payment = a.id ? paymentsByAppointmentId[a.id] : undefined
                        return (
                          <motion.tr
                            id={a.id ? `appt-${a.id}` : undefined}
                            key={a.id || `${a.clinic_id}-${a.customer_id}-${a.appointment_date}-${a.start_time}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              "group transition-all duration-500 hover:bg-white/[0.03]",
                              isHighlighted && "bg-emerald-500/5 ring-1 ring-emerald-500/20"
                            )}
                          >
                            <td className="px-8 py-8 align-top">
                              <div className="flex items-center gap-3 text-white font-bold tracking-tighter italic">
                                <Clock className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
                                <span>{timeRange}</span>
                              </div>
                              <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-2">{a.appointment_date}</div>
                            </td>
                            <td className="px-8 py-8 align-top">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-pink-500/30 transition-all shadow-inner">
                                  <User className="w-5 h-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                  <p className="font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{a.customer_name}</p>
                                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{a.customer_phone || "PRIVATE NODE"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-8 align-top">
                              <p className="font-bold text-slate-300 italic group-hover:text-white transition-colors">{a.service_name}</p>
                              {typeof a.service_price === "number" && (
                                <p className="text-[10px] text-pink-500/60 font-black uppercase tracking-widest mt-1">VAL: ฿{a.service_price.toLocaleString()}</p>
                              )}
                            </td>
                            <td className="px-8 py-8 align-top">
                              {a.doctor_id ? (
                                <div className="flex items-center gap-3 group/op">
                                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover/op:bg-blue-500 group-hover/op:text-white transition-all shadow-inner">
                                    <Stethoscope className="w-4 h-4 text-blue-400 group-hover/op:text-white" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/op:text-blue-400 transition-colors">{a.doctor_id}</span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-white/[0.02] text-[8px] font-black text-slate-700 border-white/5">UNASSIGNED</Badge>
                              )}
                            </td>
                            <td className="px-8 py-8 align-top">
                              <div className="space-y-3">
                                <Badge className={cn(
                                  "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner",
                                  a.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : a.status === "cancelled" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                                )}>
                                  {a.status}
                                </Badge>
                                {a.payment_status && (
                                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 pl-1">SEQ: {a.payment_status}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-8 align-top">
                              {payment ? (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <Badge className={cn(
                                      "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner",
                                      payment.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" : payment.payment_status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                                    )}>
                                      {payment.payment_status}
                                    </Badge>
                                    <span className="text-lg font-black text-white italic tracking-tighter">฿{Number(payment.amount || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    {payment.payment_method === "promptpay" && (
                                      <Button
                                        variant="outline"
                                        className="h-10 px-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
                                        onClick={() => handleOpenPromptPayQr(payment.clinic_id, Number(payment.amount || 0))}
                                      >
                                        Open Gateway
                                      </Button>
                                    )}
                                    {payment.payment_status === "pending" && (
                                      <Button
                                        variant="premium"
                                        className="h-10 px-6 rounded-xl shadow-2xl shadow-pink-500/10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                                        onClick={() => openMarkPaidDialog(payment)}
                                        disabled={markPaidLoadingId === payment.id}
                                      >
                                        {markPaidLoadingId === payment.id ? "SYNCING..." : "Verify Payment"}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="h-px w-8 bg-white/10 block mt-4" />
                              )}
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialog UI Upgrade - Clinical Precision */}
      <Dialog
        open={markPaidOpen}
        onOpenChange={(open) => {
          setMarkPaidOpen(open)
          if (!open) setMarkPaidPayment(null)
        }}
      >
        <DialogContent className="glass-panel border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-lg bg-[#020617]/90 backdrop-blur-3xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          <DialogHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-inner mb-2">
              <CreditCard className="h-8 w-8 text-pink-400" />
            </div>
            <DialogTitle className="text-3xl font-bold text-white tracking-tight italic">Verify Inflow Node</DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Authorize clinical financial synchronization</p>
          </DialogHeader>

          <div className="space-y-10 py-8">
            {markPaidPayment && (
              <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Payment Vector ID</p>
                  <p className="font-mono text-xs text-slate-400 truncate">{markPaidPayment.id}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Authorized Amount</p>
                  <p className="text-2xl font-black text-pink-400 italic tracking-tighter">฿{Number(markPaidPayment.amount || 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Reference Hash (Transaction ID)</Label>
                <Input 
                  className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 px-6 font-mono text-xs" 
                  value={markPaidTransactionId} 
                  onChange={(e) => setMarkPaidTransactionId(e.target.value)} 
                  placeholder="TXN-GLOBAL-SYNC-NODE-001"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Diagnostic Notes</Label>
                <Textarea 
                  className="rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 px-6 py-4 resize-none italic font-light" 
                  value={markPaidNotes} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMarkPaidNotes(e.target.value)} 
                  placeholder="Optional clinical synchronization parameters..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
              onClick={() => {
                setMarkPaidOpen(false)
                setMarkPaidPayment(null)
              }}
            >
              Abort SYNC
            </Button>
            <Button
              variant="premium"
              className="flex-1 h-14 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              onClick={submitMarkPaid}
              disabled={!markPaidPayment?.id || markPaidLoadingId === markPaidPayment.id}
            >
              {markPaidLoadingId && markPaidPayment?.id && markPaidLoadingId === markPaidPayment.id ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  SYNCING...
                </div>
              ) : "Authorize Sync"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
