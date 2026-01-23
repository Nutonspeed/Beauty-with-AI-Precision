"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useLocale, useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CreditCard, 
  Search, 
  Loader2, 
  XCircle,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Textarea } from "@/components/ui/textarea"

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
  created_at: string
}

interface PaymentsResponse {
  payments: BookingPayment[]
  total: number
  limit: number
  offset: number
}

export default function CenterPaymentsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()

  const [status, setStatus] = useState<"all" | "pending" | "paid" | "refunded" | "cancelled">("pending")
  const [method, setMethod] = useState<"all" | "promptpay" | "cash" | "credit_card" | "bank_transfer" | "other">("all")
  const [query, setQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  const [data, setData] = useState<PaymentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [markPaidPayment, setMarkPaidPayment] = useState<BookingPayment | null>(null)
  const [markPaidTransactionId, setMarkPaidTransactionId] = useState("")
  const [markPaidNotes, setMarkPaidNotes] = useState("")
  const [markPaidSaving, setMarkPaidSaving] = useState(false)
  const [exportAllLoading, setExportAllLoading] = useState(false)

  const exportCsv = () => {
    const rows = data?.payments || []
    const header = [
      "id",
      "created_at",
      "payment_date",
      "center_id",
      "appointment_id",
      "amount",
      "payment_method",
      "payment_status",
      "transaction_id",
      "notes",
    ]

    const escape = (value: unknown) => {
      const s = value === null || value === undefined ? "" : String(value)
      const escaped = s.replace(/\"/g, '""')
      return `"${escaped}"`
    }

    const lines = [header.join(",")]
    for (const p of rows) {
      lines.push(
        [
          p.id,
          p.created_at,
          p.payment_date,
          p.center_id,
          p.appointment_id,
          p.amount,
          p.payment_method,
          p.payment_status,
          p.transaction_id,
          p.notes,
        ]
          .map(escape)
          .join(","),
      )
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = globalThis.document?.createElement("a")
    if (!a) return
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `center-payments-${stamp}.csv`
    globalThis.document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportCsvAll = async () => {
    try {
      setExportAllLoading(true)

      const header = [
        "id",
        "created_at",
        "payment_date",
        "center_id",
        "appointment_id",
        "amount",
        "payment_method",
        "payment_status",
        "transaction_id",
        "notes",
      ]

      const escape = (value: unknown) => {
        const s = value === null || value === undefined ? "" : String(value)
        const escaped = s.replace(/\"/g, '""')
        return `"${escaped}"`
      }

      const stamp = new Date().toISOString().slice(0, 10)

      const perPage = 200
      let currentOffset = 0
      const maxRows = 5000
      const rows: BookingPayment[] = []

      while (true) {
        const params = new URLSearchParams()
        params.set("limit", String(perPage))
        params.set("offset", String(currentOffset))
        if (status !== "all") params.set("status", status)
        if (method !== "all") params.set("method", method)
        if (query.trim()) params.set("q", query.trim())
        if (dateFrom) params.set("date_from", dateFrom)
        if (dateTo) params.set("date_to", dateTo)

        const res = await fetch(`/api/center/payments/booking-payments/list?${params.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          throw new Error(`Failed to export: ${res.status}`)
        }

        const json: PaymentsResponse = await res.json()
        const pageRows = json?.payments || []

        rows.push(...pageRows)

        if (rows.length >= maxRows) {
          break
        }

        if (pageRows.length < perPage) {
          break
        }

        currentOffset += perPage
      }

      const lines = [header.join(",")]
      for (const p of rows.slice(0, maxRows)) {
        lines.push(
          [
            p.id,
            p.created_at,
            p.payment_date,
            p.center_id,
            p.appointment_id,
            p.amount,
            p.payment_method,
            p.payment_status,
            p.transaction_id,
            p.notes,
          ]
            .map(escape)
            .join(","),
        )
      }

      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = globalThis.document?.createElement("a")
      if (!a) return
      a.href = url
      a.download = `center-payments-all-${stamp}.csv`
      globalThis.document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      setError(t('centers.payments.exportError'))
    } finally {
      setExportAllLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push(lp("/auth/login"))
      return
    }

    if (!["center_owner", "center_admin", "center_staff", "manager", "super_admin", "admin", "sales_staff"].includes(user.role)) {
      router.push(lp("/unauthorized"))
    }
  }, [authLoading, user, router, lp])

  const searchParamsString = useMemo(() => {
    const params = new URLSearchParams()
    params.set("limit", String(limit))
    params.set("offset", String(offset))
    if (status !== "all") params.set("status", status)
    if (method !== "all") params.set("method", method)
    if (query.trim()) params.set("q", query.trim())
    if (dateFrom) params.set("date_from", dateFrom)
    if (dateTo) params.set("date_to", dateTo)
    return params.toString()
  }, [status, method, query, dateFrom, dateTo, limit, offset])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/center/payments/booking-payments/list?${searchParamsString}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          throw new Error(`Failed to load payments: ${res.status}`)
        }

        const json: PaymentsResponse = await res.json()
        if (!cancelled) {
          setData(json)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) setError(t('centers.payments.loadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (!authLoading && user) {
      load()
    }

    return () => {
      cancelled = true
    }
  }, [authLoading, user, searchParamsString, t])

  useEffect(() => {
    setOffset(0)
  }, [status, method, query, dateFrom, dateTo, limit])

  const page = Math.floor(offset / Math.max(limit, 1)) + 1
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)))
  const canPrev = page > 1
  const canNext = page < totalPages

  const openPromptPayQr = (centerId: string, amount: number) => {
    const url = `/api/payments/promptpay/qr?center_id=${encodeURIComponent(centerId)}&amount=${encodeURIComponent(String(amount))}`
    globalThis.open(url, "_blank")
  }

  const openMarkPaid = (payment: BookingPayment) => {
    setMarkPaidPayment(payment)
    setMarkPaidTransactionId(payment.transaction_id || "")
    setMarkPaidNotes(payment.notes || "")
    setMarkPaidOpen(true)
  }

  const submitMarkPaid = async () => {
    const payment = markPaidPayment
    if (!payment) return

    try {
      setMarkPaidSaving(true)
      const res = await fetch(`/api/payments/booking-payments/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          payment_id: payment.id,
          transaction_id: markPaidTransactionId.trim() ? markPaidTransactionId.trim() : null,
          notes: markPaidNotes.trim() ? markPaidNotes.trim() : null,
        }),
      })

      if (!res.ok) throw new Error(`mark-paid failed: ${res.status}`)

      const json = await res.json()
      const updated: BookingPayment | null = json?.payment || null

      if (updated && data) {
        setData({
          ...data,
          payments: data.payments.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
        })
      }

      setMarkPaidOpen(false)
      setMarkPaidPayment(null)
    } catch (e) {
      console.error(e)
      setError(t('centers.payments.updateError'))
    } finally {
      setMarkPaidSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Header - Financial Command Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <CreditCard className="mr-3 h-3.5 w-3.5" />
                {t('centers.payments.financialNode')}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                {t('nav.inventory')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Ledger</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {t('centers.payments.syncDescription')}
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center gap-6 shrink-0">
              <div className="flex gap-4">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-premium italic" onClick={exportCsv} disabled={!data?.payments?.length || loading}>
                  <Download className="mr-3 h-4 w-4" />
                  {t('centers.payments.exportNode')}
                </Button>
                <Button variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={exportCsvAll} disabled={loading || exportAllLoading}>
                  {exportAllLoading ? (
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-3 h-4 w-4" />
                  )}
                  {exportAllLoading ? t('centers.payments.syncingCsv') : t('centers.payments.exportGlobal')}
                </Button>
              </div>
              <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-premium italic" onClick={() => router.push(lp("/center/appointments"))}>
                <Calendar className="mr-3 h-4 w-4" />
                {t('centers.payments.temporalMap')}
              </Button>
            </div>
          </div>

          {/* Financial Metrics Summary Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: t('centers.payments.metrics.totalInflow'), val: data?.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.length, color: 'text-blue-600', icon: ArrowUpRight },
              { label: t('centers.payments.metrics.verified'), val: data?.payments?.filter(p => p.payment_status === "paid").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "paid").length, color: 'text-emerald-600', icon: CreditCard },
              { label: t('centers.payments.metrics.pendingAuth'), val: data?.payments?.filter(p => p.payment_status === "pending").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "pending").length, color: 'text-amber-600', icon: Clock },
              { label: t('centers.payments.metrics.refunded'), val: data?.payments?.filter(p => p.payment_status === "refunded").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "refunded").length, color: 'text-rose-600', icon: ArrowDownRight },
              { label: t('centers.payments.metrics.cancelled'), val: data?.payments?.filter(p => p.payment_status === "cancelled").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "cancelled").length, color: 'text-slate-400', icon: XCircle }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-8">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      <stat.icon className={cn("w-12 h-12", stat.color)} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 italic group-hover:text-slate-900 transition-colors">{stat.label}</p>
                    <div className={cn("text-2xl font-black tracking-tighter italic mb-2 uppercase", stat.color)}>฿{stat.val}</div>
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-6 bg-slate-100 rounded-full group-hover:w-12 group-hover:bg-pink-500 transition-all duration-500" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600">
                        {stat.count} CYCLES
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filtering & Search Interface */}
          <div className="grid gap-10 lg:grid-cols-12 items-end">
            <div className="lg:col-span-2 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.payments.filters.status')}</Label>
              <div className="relative group">
                <select className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-8 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic uppercase shadow-inner" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="all">{t('centers.payments.status.all')}</option>
                  <option value="pending">{t('centers.payments.status.pending')}</option>
                  <option value="paid">{t('centers.payments.status.paid')}</option>
                  <option value="refunded">{t('centers.payments.status.refunded')}</option>
                  <option value="cancelled">{t('centers.payments.status.cancelled')}</option>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-colors group-hover:text-pink-500">
                  <Filter className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.payments.filters.method')}</Label>
              <div className="relative group">
                <select className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-8 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer italic uppercase shadow-inner" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                  <option value="all">{t('centers.payments.methods.all')}</option>
                  <option value="promptpay">{t('centers.payments.methods.promptpay')}</option>
                  <option value="cash">{t('centers.payments.methods.cash')}</option>
                  <option value="credit_card">{t('centers.payments.methods.creditCard')}</option>
                  <option value="bank_transfer">{t('centers.payments.methods.bankTransfer')}</option>
                  <option value="other">{t('centers.payments.methods.other')}</option>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-colors group-hover:text-pink-500">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.payments.filters.search')}</Label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <Input className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner relative z-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('centers.payments.filters.searchPlaceholder')} />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-colors group-hover:text-pink-500">
                  <Search className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.payments.filters.startNode')}</Label>
              <div className="relative">
                <Input type="date" className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-6 italic font-bold shadow-inner" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">{t('centers.payments.filters.endNode')}</Label>
              <div className="relative">
                <Input type="date" className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-6 italic font-bold shadow-inner" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Ledger Interface Table */}
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="space-y-3">
                <CardTitle className="text-4xl font-black text-slate-950 tracking-tight italic flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-pink-50 rounded-2xl shadow-sm">
                    <CreditCard className="h-10 w-10 text-pink-600" />
                  </div>
                  {t('centers.payments.ledger.title')} <span className="text-pink-600 opacity-40 ml-4">[{total.toLocaleString()}]</span>
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('centers.payments.ledger.syncDescription')}</CardDescription>
              </div>
              <div className="flex items-center gap-5 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner">
                <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 italic">Page {page} / {totalPages}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-slate-50/30">
              {loading ? (
                <div className="py-40 text-center space-y-8 bg-white italic">
                  <div className="relative h-20 w-20 mx-auto">
                    <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-pink-600 relative mx-auto" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">Synchronizing Nodes...</p>
                </div>
              ) : error ? (
                <div className="py-40 text-center space-y-8 bg-white italic">
                  <div className="h-32 w-32 rounded-[2.5rem] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-200 mx-auto shadow-inner">
                    <XCircle className="h-16 w-16 text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-rose-600 uppercase tracking-tighter">{error}</p>
                </div>
              ) : (data?.payments || []).length === 0 ? (
                <div className="py-40 text-center space-y-10 bg-white italic">
                  <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
                    <CreditCard className="h-16 w-16" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-3xl font-black text-slate-950 uppercase tracking-tighter">{t('centers.payments.ledger.empty')}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">No financial inflow detected in current node</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.payments.ledger.syncDate')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.payments.ledger.appointmentNode')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.payments.ledger.inflowAmount')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.payments.filters.method')} Vector</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.payments.ledger.authStatus')}</th>
                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centers.payments.ledger.control')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data?.payments.map((p) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group transition-all duration-700 hover:bg-slate-50/50 relative"
                        >
                          <td className="px-10 py-10 align-top">
                            <div className="text-slate-950 font-black tracking-tighter italic text-xl uppercase">{String(p.created_at || "").slice(0, 10)}</div>
                            <div className="text-[10px] text-slate-400 font-black uppercase mt-2 tracking-widest italic group-hover:text-pink-600 transition-colors">{p.id.slice(0, 12)}...</div>
                          </td>
                          <td className="px-10 py-10 align-top">
                            <Link
                              href={lp(`/center/appointments?appointment_id=${p.appointment_id}`)}
                              className="inline-flex items-center gap-4 group/link bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-2xl shadow-inner hover:border-pink-500/20 transition-all duration-700"
                            >
                              <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover/link:bg-pink-500 group-hover/link:text-white transition-all">
                                <Search className="w-4 h-4 text-slate-400 group-hover/link:text-white" />
                              </div>
                              <span className="font-mono text-xs font-bold text-slate-600 group-hover/link:text-pink-600 transition-colors">{p.appointment_id.slice(0, 8)}...</span>
                            </Link>
                          </td>
                          <td className="px-10 py-10 align-top">
                            <span className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover:text-pink-600 transition-colors">฿{Number(p.amount || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-10 py-10 align-top">
                            <Badge variant="outline" className="bg-slate-50 text-[10px] font-black text-slate-400 border-none uppercase tracking-widest px-5 py-2 rounded-full shadow-sm italic">
                              {p.payment_method || t('centers.payments.ledger.unspecified')}
                            </Badge>
                          </td>
                          <td className="px-10 py-10 align-top">
                            <Badge className={cn(
                              "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic",
                              p.payment_status === "paid" ? "bg-emerald-50 text-emerald-600" : p.payment_status === "pending" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {p.payment_status}
                            </Badge>
                          </td>
                          <td className="px-10 py-10 align-top">
                            <div className="flex items-center gap-4">
                              {p.payment_method === "promptpay" && (
                                <Button size="sm" variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm italic" onClick={() => openPromptPayQr(p.center_id, Number(p.amount || 0))}>
                                  {t('centers.payments.ledger.gateway')}
                                </Button>
                              )}
                              {p.payment_status === "pending" && (
                                <Button size="sm" variant="premium" className="h-12 px-6 rounded-xl shadow-xl shadow-pink-500/10 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none italic" onClick={() => openMarkPaid(p)}>
                                  {t('centers.payments.ledger.verifyInflow')}
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            
            {/* Ledger Pagination Infrastructure */}
            <div className="p-10 lg:p-12 border-t border-slate-50 bg-white">
              <Pagination>
                <PaginationContent className="gap-6">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={cn(
                        "rounded-2xl border-slate-200 bg-slate-50 hover:bg-white text-[10px] font-black uppercase tracking-widest h-14 px-8 transition-all shadow-premium italic",
                        !canPrev && "opacity-20 pointer-events-none"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        if (canPrev) setOffset(Math.max(0, offset - limit))
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <div className="h-14 px-10 flex items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl shadow-pink-500/20 font-black text-sm italic uppercase tracking-widest">
                      Node {page}
                    </div>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className={cn(
                        "rounded-2xl border-slate-200 bg-slate-50 hover:bg-white text-[10px] font-black uppercase tracking-widest h-14 px-8 transition-all shadow-premium italic",
                        !canNext && "opacity-20 pointer-events-none"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        if (canNext) setOffset(offset + limit)
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </Card>
        </div>
      </main>

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
            <DialogTitle className="text-4xl font-black text-slate-950 tracking-tight italic uppercase leading-none">{t('centers.payments.ledger.verifyInflow')} Node</DialogTitle>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Authorize aesthetic financial synchronization</p>
          </DialogHeader>

          <div className="space-y-12 py-10">
            {markPaidPayment && (
              <div className="grid grid-cols-2 gap-8 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner relative overflow-hidden group/info">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-pink-500/20 group-hover/info:bg-pink-500 transition-all duration-700" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Payment Vector ID</p>
                  <p className="font-mono text-xs text-slate-950 truncate font-bold">{markPaidPayment.id}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Authorized Amount</p>
                  <p className="text-3xl font-black text-pink-600 italic tracking-tighter uppercase leading-none">฿{Number(markPaidPayment.amount || 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">Reference Hash (Transaction ID)</Label>
                <Input 
                  className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-bold shadow-inner font-mono text-xs" 
                  value={markPaidTransactionId} 
                  onChange={(e) => setMarkPaidTransactionId(e.target.value)} 
                  placeholder="TXN-GLOBAL-SYNC-NODE-001"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">Diagnostic Notes</Label>
                <Textarea 
                  className="rounded-[2rem] border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all p-8 italic font-medium shadow-inner min-h-[140px] resize-none"
                  value={markPaidNotes}
                  onChange={(e) => setMarkPaidNotes(e.target.value)}
                  placeholder="Operational synchronization notes..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-6">
            <Button variant="outline" className="h-16 flex-1 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-sm italic" onClick={() => setMarkPaidOpen(false)}>
              Abort Synchronization
            </Button>
            <Button variant="premium" className="h-16 flex-1 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={submitMarkPaid} disabled={markPaidSaving}>
              {markPaidSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Node"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
