"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Textarea } from "@/components/ui/textarea"

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
  created_at: string
}

interface PaymentsResponse {
  payments: BookingPayment[]
  total: number
  limit: number
  offset: number
}

export default function ClinicPaymentsPage() {
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
      "clinic_id",
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
          p.clinic_id,
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
    a.download = `clinic-payments-${stamp}.csv`
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
        "clinic_id",
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

        const res = await fetch(`/api/clinic/payments/booking-payments/list?${params.toString()}`, {
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
            p.clinic_id,
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
      a.download = `clinic-payments-all-${stamp}.csv`
      globalThis.document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      setError("ไม่สามารถ Export CSV (All) ได้")
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

    if (!["clinic_owner", "clinic_admin", "clinic_staff", "manager", "super_admin", "admin"].includes(user.role)) {
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
        const res = await fetch(`/api/clinic/payments/booking-payments/list?${searchParams}`, {
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
        if (!cancelled) setError("ไม่สามารถโหลดรายการชำระเงินได้")
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
  }, [authLoading, user, searchParams])

  useEffect(() => {
    setOffset(0)
  }, [status, method, query, dateFrom, dateTo, limit])

  const page = Math.floor(offset / Math.max(limit, 1)) + 1
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)))
  const canPrev = page > 1
  const canNext = page < totalPages

  const openPromptPayQr = (clinicId: string, amount: number) => {
    const url = `/api/payments/promptpay/qr?clinic_id=${encodeURIComponent(clinicId)}&amount=${encodeURIComponent(String(amount))}`
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
      setError("ไม่สามารถอัปเดตสถานะการชำระเงินได้")
    } finally {
      setMarkPaidSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <Dialog
          open={markPaidOpen}
          onOpenChange={(open) => {
            setMarkPaidOpen(open)
            if (!open) setMarkPaidPayment(null)
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
              <Button onClick={submitMarkPaid} disabled={!markPaidPayment?.id || markPaidSaving}>
                {markPaidSaving ? "Saving..." : "Confirm paid"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ชำระเงิน / Reconciliation</h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">รวมรายการชำระเงินทั้งหมดของคลินิก พร้อมเครื่องมือกระทบยอด</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={!data?.payments?.length || loading}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportCsvAll} disabled={loading || exportAllLoading}>
              {exportAllLoading ? "Exporting..." : "Export CSV (All)"}
            </Button>
            <Button variant="outline" onClick={() => router.push(lp("/clinic/appointments"))}>
              ไปหน้าตารางนัดหมาย
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="text-xs text-gray-600 mb-1">Total</div>
              <div className="text-lg md:text-xl font-bold text-blue-600">
                {data?.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500">
                {data?.payments?.length} รายการ
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="text-xs text-gray-600 mb-1">Paid</div>
              <div className="text-lg md:text-xl font-bold text-green-600">
                {data?.payments?.filter(p => p.payment_status === "paid").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500">
                {data?.payments?.filter(p => p.payment_status === "paid").length} รายการ
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="text-xs text-gray-600 mb-1">Pending</div>
              <div className="text-lg md:text-xl font-bold text-orange-600">
                {data?.payments?.filter(p => p.payment_status === "pending").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500">
                {data?.payments?.filter(p => p.payment_status === "pending").length} รายการ
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="text-xs text-gray-600 mb-1">Refunded</div>
              <div className="text-lg md:text-xl font-bold text-red-600">
                {data?.payments?.filter(p => p.payment_status === "refunded").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500">
                {data?.payments?.filter(p => p.payment_status === "refunded").length} รายการ
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="text-xs text-gray-600 mb-1">Cancelled</div>
              <div className="text-lg md:text-xl font-bold text-gray-600">
                {data?.payments?.filter(p => p.payment_status === "cancelled").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500">
                {data?.payments?.filter(p => p.payment_status === "cancelled").length} รายการ
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">ตัวกรอง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Status</div>
                <select className="rounded border bg-white px-2 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Method</div>
                <select className="rounded border bg-white px-2 py-2 text-sm" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                  <option value="all">All</option>
                  <option value="promptpay">PromptPay</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit card</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex-1 space-y-1">
                <div className="text-xs text-gray-600">Search (payment_id / transaction_id / notes)</div>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหา: ID, transaction ID, หรือ notes..." />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Date from</div>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Date to</div>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Per page</div>
                <select
                  className="rounded border bg-white px-2 py-2 text-sm"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value) || 50)}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">รายการชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10">
                <div className="text-sm text-gray-600">กำลังโหลด...</div>
              </div>
            ) : error ? (
              <div className="py-4">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            ) : (data?.payments?.length || 0) === 0 ? (
              <div className="py-8 text-sm text-gray-600">ไม่พบรายการ</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto -mx-2 md:mx-0">
                  <div className="mb-3 flex items-center justify-between gap-2 flex-wrap text-xs text-gray-600">
                    <div>
                      Total: <span className="font-medium">{total.toLocaleString()}</span>
                    </div>
                    <div>
                      Page <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                    </div>
                  </div>
                  <table className="min-w-full text-xs md:text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="px-2 py-2 text-left font-medium">Created</th>
                        <th className="px-2 py-2 text-left font-medium">Appointment</th>
                        <th className="px-2 py-2 text-left font-medium">Amount</th>
                        <th className="px-2 py-2 text-left font-medium">Method</th>
                        <th className="px-2 py-2 text-left font-medium">Status</th>
                        <th className="px-2 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.payments || []).map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-white/60">
                          <td className="px-2 py-2 align-top whitespace-nowrap">
                            <div className="text-[11px] text-gray-600">{String(p.created_at || "").slice(0, 10)}</div>
                            <div className="font-mono text-[10px] text-gray-500">{p.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-2 py-2 align-top whitespace-nowrap">
                            <a
                              href={lp(`/clinic/appointments?appointment_id=${p.appointment_id}`)}
                              className="font-mono text-xs hover:underline hover:text-blue-600"
                            >
                              {p.appointment_id.slice(0, 8)}...
                            </a>
                          </td>
                          <td className="px-2 py-2 align-top whitespace-nowrap">
                            ฿{Number(p.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-2 align-top">
                            <span className="text-xs">{p.payment_method || "-"}</span>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <Badge variant={p.payment_status === "paid" ? "default" : p.payment_status === "pending" ? "outline" : "destructive"}>
                              {p.payment_status}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="flex items-center gap-2 flex-wrap">
                              {p.payment_method === "promptpay" ? (
                                <Button size="sm" variant="outline" onClick={() => openPromptPayQr(p.clinic_id, Number(p.amount || 0))}>
                                  Open QR
                                </Button>
                              ) : null}
                              {p.payment_status === "pending" ? (
                                <Button size="sm" onClick={() => openMarkPaid(p)}>
                                  Mark paid
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  <div className="mb-3 text-xs text-gray-600">
                    Total: <span className="font-medium">{total.toLocaleString()}</span> • 
                    Page <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                  </div>
                  {(data?.payments || []).map((p) => (
                    <Card key={p.id} className="bg-white">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="text-[11px] text-gray-600">{String(p.created_at || "").slice(0, 10)}</div>
                              <div className="font-mono text-[10px] text-gray-500">{p.id.slice(0, 8)}...</div>
                            </div>
                            <Badge variant={p.payment_status === "paid" ? "default" : p.payment_status === "pending" ? "outline" : "destructive"}>
                              {p.payment_status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Appointment</span>
                              <a
                                href={lp(`/clinic/appointments?appointment_id=${p.appointment_id}`)}
                                className="font-mono text-xs hover:underline hover:text-blue-600"
                              >
                                {p.appointment_id.slice(0, 8)}...
                              </a>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Amount</span>
                              <span className="font-medium">฿{Number(p.amount || 0).toLocaleString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Method</span>
                              <span className="text-xs">{p.payment_method || "-"}</span>
                            </div>
                            
                            {(p.transaction_id || p.notes) && (
                              <div className="space-y-1">
                                {p.transaction_id && (
                                  <div className="text-xs">
                                    <span className="text-gray-600">Transaction ID: </span>
                                    <span className="font-mono">{p.transaction_id}</span>
                                  </div>
                                )}
                                {p.notes && (
                                  <div className="text-xs">
                                    <span className="text-gray-600">Notes: </span>
                                    <span>{p.notes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 pt-2 border-t">
                            {p.payment_method === "promptpay" ? (
                              <Button size="sm" variant="outline" onClick={() => openPromptPayQr(p.clinic_id, Number(p.amount || 0))}>
                                Open QR
                              </Button>
                            ) : null}
                            {p.payment_status === "pending" ? (
                              <Button size="sm" onClick={() => openMarkPaid(p)}>
                                Mark paid
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination - visible on both desktop and mobile */}
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!canPrev) return
                            setOffset(Math.max(0, offset - limit))
                          }}
                        />
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!canNext) return
                            setOffset(offset + limit)
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
