"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Sparkles, FileText } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  source: string | null
  score: number | null
  estimated_value?: number | null
  metadata?: {
    overall_score?: number
    skin_type?: string
    age_estimate?: number
    metrics?: Record<string, { score: number }>
    recommendations?: Array<{
      title_en?: string
      title_th?: string
      description_en?: string
      description_th?: string
      priority?: string
      price?: number
      sessions?: number
    }>
  } | null
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingProposal, setIsCreatingProposal] = useState(false)

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await fetch(`/api/sales/leads/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to load lead")
        }
        const data = await res.json()
        setLead(data)
      } catch (error) {
        console.error("Load lead detail failed:", error)
        toast({
          title: "ไม่สามารถโหลดข้อมูล Lead ได้",
          description: "กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchLead()
    }
  }, [params.id, toast])

  const handleCreateProposal = async () => {
    if (!lead) return
    const meta = lead.metadata || {}
    const recs = meta.recommendations || []

    if (!recs.length) {
      toast({
        title: "ไม่มีข้อมูลคำแนะนำจาก AI",
        description: "ไม่พบรายการทรีตเมนต์จาก metadata ของ Lead นี้",
        variant: "destructive",
      })
      return
    }

    setIsCreatingProposal(true)
    try {
      const treatments = recs.map((r) => ({
        name: r.title_th || r.title_en || "Treatment",
        price: r.price || 0,
        sessions: r.sessions || 1,
        description: r.description_th || r.description_en || "",
        // reserved for future mapping to services table
        service_id: (r as any).service_id ?? null,
      }))

      const subtotal = treatments.reduce((sum, t) => sum + t.price, 0)

      const res = await fetch("/api/sales/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          title: `AI Proposal for ${lead.name}`,
          treatments,
          subtotal,
          discount_percent: 0,
          discount_amount: 0,
          total_value: subtotal,
          valid_until: null,
          payment_terms: null,
          terms_and_conditions: null,
          notes: "Generated automatically from AI skin analysis metadata.",
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "ไม่สามารถสร้าง Proposal ได้")
      }

      const proposal = await res.json()

      toast({
        title: "สร้าง Proposal สำเร็จ",
        description: `สร้างใบเสนอราคาจากผล AI ให้กับ ${lead.name} แล้ว`,
      })

      // หลังสร้างสำเร็จ พาไปหน้า Proposal Detail
      if (proposal?.id) {
        router.push(`/sales/proposals/${proposal.id}`)
      }
    } catch (error: any) {
      console.error("Create proposal failed:", error)
      toast({
        title: "สร้าง Proposal ไม่สำเร็จ",
        description: error?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsCreatingProposal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล Lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold">ไม่พบข้อมูล Lead</p>
            <Button onClick={() => router.push("/sales/leads")}>
              กลับไปหน้า Leads
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const overallScore = lead.metadata?.overall_score
  const skinType = lead.metadata?.skin_type
  const ageEstimate = lead.metadata?.age_estimate
  const metrics = lead.metadata?.metrics || {}
  const recommendations = lead.metadata?.recommendations || []

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex-1">
        <div className="border-b bg-background">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sales/leads">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leads
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Lead Detail</h1>
                <p className="text-sm text-muted-foreground">ดูรายละเอียด Lead และผลวิเคราะห์ผิวจาก AI</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-6">
          {/* Basic Lead Info */}
          <Card>
            <CardHeader>
              <CardTitle>{lead.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-4">
                <div>
                  <div className="text-muted-foreground">อีเมล</div>
                  <div>{lead.email || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">เบอร์โทร</div>
                  <div>{lead.phone || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">สถานะ</div>
                  <Badge variant="outline">{lead.status}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">แหล่งที่มา</div>
                  <Badge variant="secondary">{lead.source || "-"}</Badge>
                </div>
              </div>
              {typeof lead.score === "number" && (
                <div className="mt-2">
                  <div className="text-muted-foreground text-xs">Lead Score</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{lead.score}</span>
                    <Progress value={lead.score} className="h-2 w-40" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Skin Analysis Summary */}
          {overallScore !== undefined && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  สรุปผลวิเคราะห์ผิวจาก AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-muted-foreground text-xs">คะแนนสุขภาพผิวรวม</div>
                    <div className="text-3xl font-bold text-blue-600">{Math.round(overallScore)}</div>
                  </div>
                  {typeof ageEstimate === "number" && (
                    <div>
                      <div className="text-muted-foreground text-xs">อายุผิวโดยประมาณ</div>
                      <div className="text-2xl font-bold">{ageEstimate} ปี</div>
                    </div>
                  )}
                  {skinType && (
                    <div>
                      <div className="text-muted-foreground text-xs">ประเภทผิว</div>
                      <div className="text-lg font-semibold capitalize">{skinType}</div>
                    </div>
                  )}
                </div>

                {Object.keys(metrics).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">ตัวชี้วัดหลัก</div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {Object.entries(metrics).map(([key, value]) => (
                        <div key={key} className="p-3 rounded-lg bg-muted/70">
                          <div className="text-xs text-muted-foreground mb-1">{key}</div>
                          <div className="text-lg font-semibold">{Math.round((value as any).score || 0)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">ทรีตเมนต์ที่ AI แนะนำ</div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {recommendations.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-lg border bg-background flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-sm">{r.title_th || r.title_en || "Treatment"}</div>
                            <div className="text-xs text-muted-foreground">{r.description_th || r.description_en}</div>
                          </div>
                          <div className="text-right text-sm font-semibold">
                            {r.price ? `฿${r.price.toLocaleString()}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleCreateProposal}
                    disabled={isCreatingProposal}
                  >
                    {isCreatingProposal ? "กำลังสร้าง Proposal..." : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        สร้าง Proposal จาก AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
