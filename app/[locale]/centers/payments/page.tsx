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
  XCircle 
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
  const isThaiLocale = locale === 'th'
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

      // Use current filters, but iterate pages.
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

  const searchParams = useMemo(() => {
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
        const res = await fetch(`/api/center/payments/booking-payments/list?${searchParams}`, {
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
  }, [authLoading, user, searchParams, t])

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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-12 max-w-7xl mx-auto flex-1">
          {/* Header - Financial Command Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <CreditCard className="mr-3 h-3.5 w-3.5 animate-pulse" />
                {t('centers.payments.financialNode')}
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9] italic">
                {t('nav.inventory')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Ledger</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                {t('centers.payments.syncDescription')}
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="flex gap-3">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" onClick={exportCsv} disabled={!data?.payments?.length || loading}>
                  {t('centers.payments.exportNode')}
                </Button>
                <Button variant="premium" className="h-14 px-8 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" onClick={exportCsvAll} disabled={loading || exportAllLoading}>
                  {exportAllLoading ? t('centers.payments.syncingCsv') : "{t('centers.payments.exportGlobal')}"}
                </Button>
              </div>
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all" onClick={() => router.push(lp("/center/appointments"))}>
                {t('centers.payments.temporalMap')}
              </Button>
            </div>
          </div>

          {/* Financial Metrics Summary Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: t('centers.payments.metrics.totalInflow'), val: data?.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: t('centers.payments.metrics.verified'), val: data?.payments?.filter(p => p.payment_status === "paid").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "paid").length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: t('centers.payments.metrics.pendingAuth'), val: data?.payments?.filter(p => p.payment_status === "pending").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "pending").length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: t('centers.payments.metrics.refunded'), val: data?.payments?.filter(p => p.payment_status === "refunded").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "refunded").length, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              { label: t('centers.payments.metrics.cancelled'), val: data?.payments?.filter(p => p.payment_status === "cancelled").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(), count: data?.payments?.filter(p => p.payment_status === "cancelled").length, color: 'text-slate-400', bg: 'bg-white/5' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[1.5rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardContent className="p-6">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3 italic">{stat.label}</p>
                    <div className={cn("text-xl font-black tracking-tighter italic mb-1", stat.color)}>฿{stat.val}</div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-700">{stat.count} t('centers.payments.metrics.cycles')</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filtering & Search Interface */}
          <div className="grid gap-6 md:grid-cols-12 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('centers.payments.filters.status')}</Label>
              <select className="h-12 w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 text-[10px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 appearance-none transition-all cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="all" className="bg-[#020617]">{t('centers.payments.status.all')}</option>
                <option value="pending" className="bg-[#020617]">{t('centers.payments.status.pending')}</option>
                <option value="paid" className="bg-[#020617]">{t('centers.payments.status.paid')}</option>
                <option value="refunded" className="bg-[#020617]">{t('centers.payments.status.refunded')}</option>
                <option value="cancelled" className="bg-[#020617]">{t('centers.payments.status.cancelled')}</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('centers.payments.filters.method')}</Label>
              <select className="h-12 w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 text-[10px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 appearance-none transition-all cursor-pointer" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                <option value="all" className="bg-[#020617]">{t('centers.payments.methods.all')}</option>
                <option value="promptpay" className="bg-[#020617]">{t('centers.payments.methods.promptpay')}</option>
                <option value="cash" className="bg-[#020617]">{t('centers.payments.methods.cash')}</option>
                <option value="credit_card" className="bg-[#020617]">{t('centers.payments.methods.creditCard')}</option>
                <option value="bank_transfer" className="bg-[#020617]">{t('centers.payments.methods.bankTransfer')}</option>
                <option value="other" className="bg-[#020617]">{t('centers.payments.methods.other')}</option>
              </select>
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('centers.payments.filters.search')}</Label>
              <Input className="h-12 rounded-xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 transition-all px-6 text-xs" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('centers.payments.filters.searchPlaceholder')} />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('centers.payments.filters.startNode')}</Label>
              <Input type="date" className="h-12 rounded-xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 transition-all px-4 text-[10px] font-bold" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('centers.payments.filters.endNode')}</Label>
              <Input type="date" className="h-12 rounded-xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 transition-all px-4 text-[10px] font-bold" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Ledger Interface Table */}
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-pink-500" />
                  t('centers.payments.ledger.title') ({total.toLocaleString()})
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">t('centers.payments.ledger.syncDescription')</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                Page {page} / {totalPages}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-40 text-center space-y-6">
                  <Loader2 className="mx-auto h-12 w-12 text-pink-500 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Synchronizing Nodes...</p>
                </div>
              ) : error ? (
                <div className="py-40 text-center space-y-6">
                  <XCircle className="mx-auto h-12 w-12 text-rose-500" />
                  <p className="text-lg font-bold text-rose-400 italic">{error}</p>
                </div>
              ) : (data?.payments || []).length === 0 ? (
                <div className="py-40 text-center space-y-6">
                  <CreditCard className="mx-auto h-12 w-12 text-slate-700 animate-pulse" />
                  <p className="text-xl font-bold text-slate-500 italic">t('centers.payments.ledger.empty')</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">t('centers.payments.ledger.syncDate')</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">t('centers.payments.ledger.appointmentNode')</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">t('centers.payments.ledger.inflowAmount')</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">t('centers.payments.filters.method') Vector</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">t('centers.payments.ledger.authStatus')</th>
                        <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">t('centers.payments.ledger.control')</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data?.payments.map((p) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group transition-all duration-500 hover:bg-white/[0.03]"
                        >
                          <td className="px-8 py-8 align-top">
                            <div className="text-white font-bold tracking-tighter italic">{String(p.created_at || "").slice(0, 10)}</div>
                            <div className="text-[9px] font-mono text-slate-600 uppercase mt-1 tracking-widest">{p.id.slice(0, 12)}...</div>
                          </td>
                          <td className="px-8 py-8 align-top">
                            <Link
                              href={lp(`/center/appointments?appointment_id=${p.appointment_id}`)}
                              className="inline-flex items-center gap-2 group/link"
                            >
                              <div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover/link:border-pink-500/30 transition-all">
                                <Search className="w-3.5 h-3.5 text-slate-500 group-hover/link:text-pink-400" />
                              </div>
                              <span className="font-mono text-xs text-slate-400 group-hover/link:text-white transition-colors">{p.appointment_id.slice(0, 8)}...</span>
                            </Link>
                          </td>
                          <td className="px-8 py-8 align-top">
                            <span className="text-xl font-black text-white italic tracking-tighter">฿{Number(p.amount || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-8 align-top">
                            <Badge variant="outline" className="bg-white/[0.02] text-[8px] font-black text-slate-500 border-white/5 uppercase tracking-widest px-3 py-1 rounded-lg">
                              {p.payment_method || t('centers.payments.ledger.unspecified')}
                            </Badge>
                          </td>
                          <td className="px-8 py-8 align-top">
                            <Badge className={cn(
                              "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner",
                              p.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" : p.payment_status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                            )}>
                              {p.payment_status}
                            </Badge>
                          </td>
                          <td className="px-8 py-8 align-top">
                            <div className="flex items-center gap-3">
                              {p.payment_method === "promptpay" && (
                                <Button size="sm" variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all" onClick={() => openPromptPayQr(p.center_id, Number(p.amount || 0))}>
                                  {t('centers.payments.ledger.gateway')}
                                </Button>
                              )}
                              {p.payment_status === "pending" && (
                                <Button size="sm" variant="premium" className="h-10 rounded-xl shadow-2xl shadow-pink-500/20 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" onClick={() => openMarkPaid(p)}>
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
            <div className="p-8 lg:p-10 border-t border-white/5 bg-white/[0.01]">
              <Pagination>
                <PaginationContent className="gap-4">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={cn(
                        "rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-12 px-6 transition-all",
                        !canPrev && "opacity-20 pointer-events-none"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        if (canPrev) setOffset(Math.max(0, offset - limit))
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <div className="h-12 px-6 flex items-center justify-center rounded-xl bg-pink-600 text-white shadow-2xl shadow-pink-600/40 font-black text-xs italic">
                      Node {page}
                    </div>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className={cn(
                        "rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-12 px-6 transition-all",
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
        <DialogContent className="glass-panel border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-lg bg-[#020617]/90 backdrop-blur-3xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          <DialogHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 shadow-inner mb-2">
              <CreditCard className="h-8 w-8 text-pink-400" />
            </div>
            <DialogTitle className="text-3xl font-bold text-white tracking-tight italic">{t('centers.payments.ledger.verifyInflow')} Node</DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Authorize aesthetic financial synchronization</p>
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
                  onChange={(e) => setMarkPaidNotes(e.target.value)} 
                  placeholder="Optional aesthetic synchronization parameters..."
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
              disabled={!markPaidPayment?.id || markPaidSaving}
            >
              {markPaidSaving ? (
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
