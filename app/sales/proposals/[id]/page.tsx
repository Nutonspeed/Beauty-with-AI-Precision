"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Proposal {
  id: string
  lead_id: string
  title: string
  status: string
  total_value: number
  treatments: Array<{
    name: string
    price: number
    sessions?: number
    description?: string
  }>
  lead?: {
    id: string
    name: string
  } | null
}

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [bookingTime, setBookingTime] = useState<string>("14:00:00")
  const [bookingServiceId, setBookingServiceId] = useState<string>("")
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [serviceOptions, setServiceOptions] = useState<{ service_id: string; label: string }[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [staffOptions, setStaffOptions] = useState<{ staff_id: string; label: string }[]>([])
  const [bookingStaffId, setBookingStaffId] = useState<string>("")

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/sales/proposals?id=${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to load proposal")
        }

    // Lazy-load staff list (active clinic staff)
    if (staffOptions.length === 0) {
      try {
        setIsLoadingStaff(true)
        const res = await fetch("/api/clinic/staff?status=active&limit=100")
        if (res.ok) {
          const json = await res.json()
          const data = (json as any)?.data as any[] | undefined
          if (Array.isArray(data)) {
            const options = data.map((row) => {
              const id = (row as any).user_id as string | undefined
              const name = (row as any).full_name as string | undefined
              return id
                ? { staff_id: id, label: name || "Staff" }
                : null
            }).filter(Boolean) as { staff_id: string; label: string }[]
            setStaffOptions(options)
          }
        }
      } catch (error) {
        console.error("Failed to load staff for booking dropdown:", error)
      } finally {
        setIsLoadingStaff(false)
      }
    }
        const json = await res.json()
        const data = Array.isArray(json?.data) ? json.data[0] : json
        setProposal(data)
      } catch (error) {
        console.error("Load proposal failed:", error)
        toast({
          title: "ไม่สามารถโหลด Proposal ได้",
          description: "กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProposal()
    }
  }, [params.id, toast])

  const handleSend = async () => {
    if (!proposal) return
    if (!confirm("ส่ง proposal นี้ให้ลูกค้า?")) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/sales/proposals/${proposal.id}/send`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to send proposal")
      toast({ title: "ส่ง proposal สำเร็จ!" })
      router.refresh?.()
    } catch (error) {
      console.error("Send proposal failed:", error)
      toast({
        title: "ไม่สามารถส่ง proposal ได้",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleAccept = async () => {
    if (!proposal) return
    if (!confirm("ยืนยันว่าลูกค้ายอมรับ proposal นี้?")) return

    setIsAccepting(true)
    try {
      const res = await fetch(`/api/sales/proposals/${proposal.id}/accept`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to accept proposal")
      toast({ title: "ยอมรับ proposal สำเร็จ!" })
      router.refresh?.()
    } catch (error) {
      console.error("Accept proposal failed:", error)
      toast({
        title: "ไม่สามารถยอมรับ proposal ได้",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!proposal) return
    const reason = prompt("เหตุผลที่ปฏิเสธ (ถ้ามี):")
    if (reason === null) return

    setIsRejecting(true)
    try {
      const res = await fetch(`/api/sales/proposals/${proposal.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Not specified" }),
      })
      if (!res.ok) throw new Error("Failed to reject proposal")
      toast({ title: "ปฏิเสธ proposal แล้ว" })
      router.refresh?.()
    } catch (error) {
      console.error("Reject proposal failed:", error)
      toast({
        title: "ไม่สามารถปฏิเสธ proposal ได้",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const openBookingModal = async () => {
    if (!proposal) return
    if (proposal.status !== "accepted") {
      toast({
        title: "ยังไม่สามารถสร้าง Booking ได้",
        description: "กรุณาให้ลูกค้ายอมรับ Proposal ก่อน (สถานะ accepted)",
        variant: "destructive",
      })
      return
    }

    // Auto-fill from first treatment if it has service_id
    const firstTreatment: any = proposal.treatments?.[0] || {}
    const fromTreatment = firstTreatment?.service_id as string | undefined
    if (fromTreatment) {
      setBookingServiceId(fromTreatment)
    }

    // Lazy-load services for dropdown on first open
    if (serviceOptions.length === 0) {
      try {
        setIsLoadingServices(true)
        const res = await fetch("/api/branches/services?is_available=true")
        if (res.ok) {
          const data = await res.json()
          const options = (data as any[]).map((row) => {
            const service = (row as any).service || {}
            const id = service.id as string | undefined
            const name =
              (service.service_name as string | undefined) ||
              (service.service_name_en as string | undefined) ||
              "Service"
            return id
              ? { service_id: id, label: name }
              : null
          }).filter(Boolean) as { service_id: string; label: string }[]
          setServiceOptions(options)
          // If we still don't have a service_id, default to first option
          if (!fromTreatment && options.length > 0) {
            setBookingServiceId(options[0].service_id)
          }
        }
      } catch (error) {
        console.error("Failed to load services for booking dropdown:", error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    setShowBookingModal(true)
  }

  const handleCreateBooking = async () => {
    if (!proposal) return
    if (!bookingDate || !bookingTime) return

    let serviceId = bookingServiceId
    if (!serviceId) {
      toast({
        title: "กรุณากรอก Service ID",
        description: "จำเป็นต้องระบุ service_id สำหรับการสร้าง Booking",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)
    try {
      const res = await fetch(`/api/sales/proposals/${proposal.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_date: bookingDate,
          booking_time: bookingTime,
          service_id: serviceId,
          staff_id: bookingStaffId || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "ไม่สามารถสร้าง Booking ได้")
      }

      const booking = await res.json()

      toast({
        title: "สร้าง Booking สำเร็จ",
        description: "สร้างการจองจาก Proposal นี้แล้ว",
      })

      // ไปหน้ารวม Booking (รองรับ locale ผ่าน re-export ที่ /booking)
      router.push("/booking")
      setShowBookingModal(false)
    } catch (error: any) {
      console.error("Create booking from proposal failed:", error)
      toast({
        title: "สร้าง Booking ไม่สำเร็จ",
        description: error?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">กำลังโหลด Proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold">ไม่พบ Proposal</p>
            <Button onClick={() => router.push("/sales/proposals")}>
              กลับไปหน้า Proposals
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const total = Number(proposal.total_value) || 0

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {showBookingModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border">
            <h2 className="mb-4 text-lg font-semibold">สร้าง Booking จาก Proposal นี้</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">วันที่จอง (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className="w-full rounded border px-2 py-1 text-sm bg-background"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">เวลาจอง (HH:MM:SS)</label>
                <input
                  type="time"
                  className="w-full rounded border px-2 py-1 text-sm bg-background"
                  value={bookingTime.slice(0, 5)}
                  onChange={(e) => setBookingTime(`${e.target.value}:00`)}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Service (บริการ)</label>
                {serviceOptions.length > 0 ? (
                  <select
                    className="w-full rounded border px-2 py-1 text-sm bg-background"
                    value={bookingServiceId}
                    onChange={(e) => setBookingServiceId(e.target.value)}
                  >
                    {serviceOptions.map((opt) => (
                      <option key={opt.service_id} value={opt.service_id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full rounded border px-2 py-1 text-sm bg-background"
                    placeholder="service_id (UUID)"
                    value={bookingServiceId}
                    onChange={(e) => setBookingServiceId(e.target.value)}
                  />
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  เลือกบริการจากรายการที่สาขามี หรือกรอก service_id เองถ้าจำเป็น
                </p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Staff (ผู้ดูแล)</label>
                {isLoadingStaff ? (
                  <p className="text-[11px] text-muted-foreground">กำลังโหลดรายชื่อ Staff...</p>
                ) : staffOptions.length > 0 ? (
                  <select
                    className="w-full rounded border px-2 py-1 text-sm bg-background"
                    value={bookingStaffId}
                    onChange={(e) => setBookingStaffId(e.target.value)}
                  >
                    <option value="">เลือก Staff (ไม่บังคับ)</option>
                    {staffOptions.map((opt) => (
                      <option key={opt.staff_id} value={opt.staff_id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    ไม่มีรายชื่อ Staff ให้เลือก (ระบบยังไม่ตั้งค่า clinic_staff)
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2 text-sm">
              <Button variant="outline" size="sm" onClick={() => setShowBookingModal(false)}>
                ยกเลิก
              </Button>
              <Button size="sm" onClick={handleCreateBooking} disabled={isBooking}>
                {isBooking ? "กำลังสร้าง Booking..." : "ยืนยัน Booking"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <div className="border-b bg-background">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Proposal Detail</h1>
                <p className="text-sm text-muted-foreground">
                  ใบเสนอราคาสำหรับลูกค้า: {proposal.lead?.name || "-"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="uppercase tracking-wide">
              {proposal.status}
            </Badge>
          </div>
        </div>

        <div className="container py-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{proposal.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">ชื่อลูกค้า</div>
                  <div className="font-semibold">{proposal.lead?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">มูลค่ารวมโดยประมาณ</div>
                  <div className="text-xl font-bold text-green-600">฿{total.toLocaleString()}</div>
                </div>
              </div>

              {proposal.lead_id && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/sales/leads/${proposal.lead_id}`)}
                  >
                    ดู Lead นี้
                  </Button>
                </div>
              )}

              <div className="pt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openBookingModal}
                  disabled={isBooking}
                >
                  สร้าง Booking จาก Proposal นี้
                </Button>
              </div>

              {proposal.treatments?.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="text-xs text-muted-foreground">รายละเอียดทรีตเมนต์</div>
                  <div className="space-y-2">
                    {proposal.treatments.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-4 rounded-lg border bg-background p-3"
                      >
                        <div>
                          <div className="font-semibold text-sm">{t.name}</div>
                          {t.sessions && (
                            <div className="text-xs text-muted-foreground">
                              จำนวนครั้ง: {t.sessions}
                            </div>
                          )}
                          {t.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {t.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm font-semibold min-w-[80px]">
                          ฿{(t.price || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
