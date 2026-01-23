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
import { Calendar, Clock, User, XCircle, CheckCircle2, Loader2, CreditCard, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLocale, useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { Textarea } from "@/components/ui/textarea"

interface AppointmentSlot {
  id?: string
  center_id: string
  customer_id: string
  specialist_id: string | null
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
  center_id: string
  appointment_id: string
  amount: number
  payment_method: string | null
  payment_status: "pending" | "paid" | "refunded" | "cancelled" | string
  payment_date: string | null
  transaction_id: string | null
  notes: string | null
}

const EMPTY_APPOINTMENTS: AppointmentSlot[] = []

export default function CenterAppointmentsPage() {
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

        const specialistParam = mineOnly ? '&specialist_id=me' : ''
        const statusParam = statusFilter === 'all' ? '' : `&status=${statusFilter}`
        const rangeParams = `&date_from=${dateFrom}${dateTo ? `&date_to=${dateTo}` : ''}`
        const search = `?limit=50${rangeParams}${specialistParam}${statusFilter !== 'all' ? statusParam : ''}`
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
          setError(t('revenue.errors.loadAppointments'))
          setIsLoading(false)
        }
      }
    }

    loadAppointments()

    return () => {
      cancelled = true
    }
  }, [mineOnly, statusFilter, range, t])

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

        const res = await fetch(`/api/center/payments/booking-payments?appointment_ids=${encodeURIComponent(ids.join(","))}`, {
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

  const handleOpenPromptPayQr = (centerId: string, amount: number) => {
    const url = `/api/payments/promptpay/qr?center_id=${encodeURIComponent(centerId)}&amount=${encodeURIComponent(String(amount))}`
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6 text-slate-950">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex justify-between items-end pb-12 border-b border-slate-100">
            <div className="space-y-6">
              <ShimmerSkeleton className="h-12 w-64 bg-slate-100" />
              <ShimmerSkeleton className="h-4 w-96 bg-slate-100" />
            </div>
            <ShimmerSkeleton className="h-16 w-48 rounded-2xl bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <ShimmerSkeleton key={i} className="h-40 rounded-[2.5rem] bg-slate-100" />
            ))}
          </div>
          <ShimmerSkeleton className="h-[600px] rounded-[3.5rem] bg-slate-100" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-slate-900">
        <div className="text-center space-y-8">
          <div className="relative h-24 w-24 mx-auto">
            <div className="absolute inset-0 bg-rose-500/10 blur-2xl rounded-full animate-pulse" />
            <XCircle className="h-16 w-16 text-rose-500 relative mx-auto opacity-40" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">{error}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Temporal Synchronization Failure</p>
          </div>
          <Button onClick={() => router.refresh()} variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 italic shadow-premium">Retry Connection</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Appointment Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Calendar className="mr-3 h-3.5 w-3.5" />
                {t('revenue.metrics.operationalCycles')}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                {t('nav.booking')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Synchronizer</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {t('centers.appointments.syncDescription')}
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center gap-6 shrink-0">
              <div className="flex bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
                {(['today', '7d', '30d'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRange(opt)}
                    className={cn(
                      "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-700 italic",
                      range === opt ? "bg-pink-600 text-white shadow-premium scale-105" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {opt === 'today' ? t('centers.appointments.today') : opt === '7d' ? t('centers.appointments.days7') : t('centers.appointments.days30')}
                  </button>
                ))}
              </div>
              <Button variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={() => router.push(lp("/center/payments"))}>
                {t('centers.appointments.financialNodes')}
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
                <Alert className="border-emerald-100 bg-emerald-50/50 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-premium relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <CheckCircle2 className="w-28 h-28 text-emerald-600" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10 w-full">
                    <div className="flex items-center gap-8">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="h-8 w-8 text-emerald-600 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">
                          {t('centers.appointments.activeSelection')}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">
                          VECTOR ID: <span className="font-mono ml-2">{highlightAppointmentId}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" className="h-12 px-8 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest shadow-sm italic transition-all hover:scale-105 active:scale-95" onClick={async () => {
                        try { await navigator.clipboard.writeText(globalThis.location.href) } catch {}
                      }}>
                        {t('centers.appointments.copyLink')}
                      </Button>
                      <Button variant="outline" size="sm" className="h-12 px-8 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest shadow-sm italic transition-all hover:scale-105 active:scale-95" onClick={() => {
                        const url = new URL(globalThis.location.href)
                        url.searchParams.delete("appointment_id")
                        router.replace(url.pathname + (url.search ? url.search : ""))
                      }}>
                        {t('centers.appointments.bypassSelection')}
                      </Button>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtering Infrastructure */}
          <div className="grid gap-10 lg:grid-cols-12 items-end">
            <div className="lg:col-span-5 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.appointments.searchDiagnostics')}</Label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <Input
                  className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 relative z-10 shadow-inner italic text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ID / Name / Phone / Service / Status..."
                />
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.appointments.statusFilter')}</Label>
              <div className="relative group">
                <select
                  className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-8 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic uppercase shadow-inner"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">{t('centers.appointments.globalView')}</option>
                  <option value="scheduled">SCHEDULED</option>
                  <option value="completed">COMPLETED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-colors group-hover:text-pink-500">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center gap-6">
              <Button
                variant={mineOnly ? "premium" : "outline"}
                className={cn(
                  "flex-1 h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all italic shadow-premium",
                  !mineOnly && "border-slate-200 bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900"
                )}
                onClick={() => setMineOnly((v) => !v)}
              >
                {mineOnly ? t('centers.appointments.myNodesOnly') : t('centers.appointments.globalNodeView')}
              </Button>
              {query && (
                <Button variant="ghost" size="icon" className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-pink-600 transition-colors shadow-inner" onClick={() => setQuery("")}>
                  <XCircle className="h-7 w-7" />
                </Button>
              )}
            </div>
          </div>

          {/* Appointments Grid Table - Aesthetic Infrastructure Style */}
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="space-y-3">
                <CardTitle className="text-4xl font-black text-slate-950 tracking-tight italic flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-pink-50 rounded-2xl shadow-sm">
                    <Calendar className="h-10 w-10 text-pink-600" />
                  </div>
                  {t('centers.appointments.liveMonitor')} <span className="text-pink-600 opacity-40 ml-4">[{filteredAppointments.length}]</span>
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('centers.appointments.syncDescription')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-slate-50/30">
              {filteredAppointments.length === 0 ? (
                <div className="py-40 text-center space-y-10 bg-white italic">
                  <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
                    <Calendar className="h-16 w-16" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-3xl font-black text-slate-950 uppercase tracking-tighter">{t('centers.appointments.temporalVoid')}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('centers.appointments.noCycles')}</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.appointments.table.cycleTime')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.appointments.table.clientIdentity')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.appointments.table.aestheticProgram')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.appointments.table.operatorNode')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.appointments.table.statusVector')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.appointments.table.financialInflow')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredAppointments.map((a) => {
                        const timeRange = `${a.start_time?.slice(0, 5)} - ${a.end_time?.slice(0, 5)}`
                        const isHighlighted = !!highlightAppointmentId && a.id === highlightAppointmentId
                        const payment = a.id ? paymentsByAppointmentId[a.id] : undefined
                        return (
                          <motion.tr
                            id={a.id ? `appt-${a.id}` : undefined}
                            key={a.id || `${a.center_id}-${a.customer_id}-${a.appointment_date}-${a.start_time}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              "group transition-all duration-700 hover:bg-slate-50/50 relative",
                              isHighlighted && "bg-emerald-50/50"
                            )}
                          >
                            <td className="px-10 py-10 align-top">
                              {isHighlighted && <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500 shadow-glow-emerald" />}
                              <div className="flex items-center gap-4 text-slate-950 font-black tracking-tighter italic text-xl uppercase">
                                <Clock className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform duration-700" />
                                <span>{timeRange}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3 italic">{a.appointment_date}</div>
                            </td>
                            <td className="px-10 py-10 align-top">
                              <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-pink-500/20 transition-all duration-700 shadow-inner">
                                  <User className="w-7 h-7 text-slate-300 group-hover:text-pink-600 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                  <p className="font-black text-xl text-slate-950 tracking-tight italic group-hover:text-pink-600 transition-colors uppercase leading-none">{a.customer_name}</p>
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{a.customer_phone || t('centers.appointments.table.privateNode')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-10 align-top">
                              <p className="font-black text-lg text-slate-600 italic group-hover:text-slate-950 transition-colors uppercase leading-none">{a.service_name}</p>
                              {typeof a.service_price === "number" && (
                                <p className="text-[10px] text-pink-500/60 font-black uppercase tracking-widest mt-3 italic bg-pink-50/50 px-3 py-1 rounded-full inline-block">VAL: ฿{a.service_price.toLocaleString()}</p>
                              )}
                            </td>
                            <td className="px-10 py-10 align-top">
                              {a.specialist_id ? (
                                <div className="flex items-center gap-4 group/op">
                                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover/op:bg-blue-600 group-hover/op:text-white transition-all duration-700 shadow-sm">
                                    <User className="w-5 h-5 text-blue-600 group-hover/op:text-white" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/op:text-blue-600 transition-colors italic">{a.specialist_id}</span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-slate-50 text-[9px] font-black text-slate-400 border-none italic px-4 py-1.5 rounded-full shadow-sm">{t('centers.appointments.table.unassigned')}</Badge>
                              )}
                            </td>
                            <td className="px-10 py-10 align-top">
                              <div className="space-y-4">
                                <Badge className={cn(
                                  "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic",
                                  a.status === "completed" ? "bg-emerald-50 text-emerald-600" : a.status === "cancelled" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                )}>
                                  {a.status}
                                </Badge>
                                {a.payment_status && (
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2 italic">SEQ: {a.payment_status}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-10 py-10 align-top">
                              {payment ? (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <Badge className={cn(
                                      "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic",
                                      payment.payment_status === "paid" ? "bg-emerald-50 text-emerald-600" : payment.payment_status === "pending" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                      {payment.payment_status}
                                    </Badge>
                                    <span className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">฿{Number(payment.amount || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-4 flex-wrap">
                                    {payment.payment_method === "promptpay" && (
                                      <Button
                                        variant="outline"
                                        className="h-12 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm italic"
                                        onClick={() => handleOpenPromptPayQr(payment.center_id, Number(payment.amount || 0))}
                                      >
                                        {t('centers.appointments.table.openGateway')}
                                      </Button>
                                    )}
                                    {payment.payment_status === "pending" && (
                                      <Button
                                        variant="premium"
                                        className="h-12 px-6 rounded-xl shadow-xl shadow-pink-500/10 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none italic"
                                        onClick={() => openMarkPaidDialog(payment)}
                                        disabled={markPaidLoadingId === payment.id}
                                      >
                                        {markPaidLoadingId === payment.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : t('centers.appointments.table.verifyPayment')}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-px w-10 bg-slate-100 mt-6" />
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

      <Footer />

      {/* Dialog UI Upgrade - Aesthetic Precision */}
      <Dialog
        open={markPaidOpen}
        onOpenChange={(open) => {
          setMarkPaidOpen(open)
          if (!open) setMarkPaidPayment(null)
        }}
      >
        <DialogContent className="border-slate-100 p-12 rounded-[3.5rem] shadow-premium max-w-xl bg-white overflow-hidden selection:bg-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <DialogHeader className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-pink-50 border border-pink-100 shadow-sm mb-2 group">
              <CreditCard className="h-10 w-10 text-pink-600 transition-transform duration-700 group-hover:scale-110" />
            </div>
            <DialogTitle className="text-4xl font-black text-slate-950 tracking-tight italic uppercase leading-none">{t('centers.appointments.dialog.verifyInflow')}</DialogTitle>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.appointments.dialog.authorizeFinancial')}</p>
          </DialogHeader>

          <div className="space-y-12 py-10">
            {markPaidPayment && (
              <div className="grid grid-cols-2 gap-8 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner relative overflow-hidden group/info">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-pink-500/20 group-hover/info:bg-pink-500 transition-all duration-700" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{t('centers.appointments.dialog.paymentVectorId')}</p>
                  <p className="font-mono text-xs text-slate-950 truncate font-bold">{markPaidPayment.id}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{t('centers.appointments.dialog.authorizedAmount')}</p>
                  <p className="text-3xl font-black text-pink-600 italic tracking-tighter uppercase leading-none">฿{Number(markPaidPayment.amount || 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.appointments.dialog.referenceHash')}</Label>
                <Input 
                  value={markPaidTransactionId}
                  onChange={(e) => setMarkPaidTransactionId(e.target.value)}
                  className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner"
                  placeholder="TXN-VECTOR-ID..."
                />
              </div>
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.appointments.dialog.logNotes')}</Label>
                <Textarea 
                  value={markPaidNotes}
                  onChange={(e) => setMarkPaidNotes(e.target.value)}
                  className="rounded-[2rem] border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all p-8 italic font-medium shadow-inner min-h-[140px] resize-none"
                  placeholder="Operational synchronization notes..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-6">
            <Button variant="outline" className="h-16 flex-1 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-sm italic" onClick={() => setMarkPaidOpen(false)}>
              {t('centers.appointments.dialog.abort')}
            </Button>
            <Button variant="premium" className="h-16 flex-1 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={submitMarkPaid}>
              {t('centers.appointments.dialog.authorize')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
