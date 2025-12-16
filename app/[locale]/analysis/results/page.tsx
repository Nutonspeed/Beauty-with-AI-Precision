"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Wand2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Dynamic imports for heavy components to prevent SSR timeout
const SkinAnalysisRadarChart = dynamic(() => import("@/components/skin-analysis-radar-chart").then(mod => ({ default: mod.SkinAnalysisRadarChart })), { ssr: false })
const AdvancedHeatmap = dynamic(() => import("@/components/ai/advanced-heatmap").then(mod => ({ default: mod.AdvancedHeatmap })), { ssr: false })
const BeforeAfterSlider = dynamic(() => import("@/components/ar/before-after-slider").then(mod => ({ default: mod.BeforeAfterSlider })), { ssr: false })
const Interactive3DViewer = dynamic(() => import("@/components/ar/interactive-3d-viewer").then(mod => ({ default: mod.Interactive3DViewer })), { ssr: false })
import { FaceLandmarksCanvas } from "@/components/ai/face-landmarks-canvas"

interface AnalysisMetric {
  score: number
  grade: "A" | "B" | "C" | "D" | "F"
  trend: "up" | "down" | "stable"
  description_en: string
  description_th: string
}

interface AnalysisResults {
  overall_score: number
  image_url?: string
  metrics: {
    wrinkles: AnalysisMetric
    spots: AnalysisMetric
    pores: AnalysisMetric
    texture: AnalysisMetric
    evenness: AnalysisMetric
    firmness: AnalysisMetric
    radiance: AnalysisMetric
    hydration: AnalysisMetric
  }
  recommendations: Array<{
    title_en: string
    title_th: string
    description_en: string
    description_th: string
    priority: "high" | "medium" | "low"
  }>
  skin_type: string
  age_estimate: number
  confidence: number
  aiData?: {
    totalProcessingTime: number
    faceDetection: {
      landmarks: Array<{ x: number; y: number; z?: number }>
      confidence: number
      processingTime: number
    }
    skinAnalysis: {
      overallScore: number
      processingTime: number
      concerns: Array<{
        type: string
        severity: number
        confidence: number
      }>
    }
    qualityReport?: {
      score: number
      issues: string[]
    }
  }
};

export default function AnalysisResultsPage() {
  const router = useRouter()
  const [analysisImage, setAnalysisImage] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)
  const [tier, setTier] = useState<string>("free")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [leadName, setLeadName] = useState("")
  const [leadPhone, setLeadPhone] = useState("")
  const [leadEmail, setLeadEmail] = useState("")
  const [isSavingLead, setIsSavingLead] = useState(false)

  type ClinicSubscriptionStatus = {
    isActive: boolean
    isTrial: boolean
    isTrialExpired: boolean
    subscriptionStatus: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled'
    plan: string
    message: string
  }

  const [subscription, setSubscription] = useState<ClinicSubscriptionStatus | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  useEffect(() => {
    const storedImage = sessionStorage.getItem("analysisImage")
    const storedResults = sessionStorage.getItem("analysisResults")
    const storedTier = sessionStorage.getItem("analysisTier")

    if (!storedImage || !storedResults) {
      router.push("/analysis")
      return
    }

    setAnalysisImage(storedImage)
    setAnalysisResults(JSON.parse(storedResults))
    setTier(storedTier || "free")
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setSubscriptionLoading(true)
        const res = await fetch('/api/clinic/subscription-status')
        if (!res.ok) {
          setSubscription(null)
          return
        }
        const data = await res.json()
        setSubscription(data?.subscription || null)
      } catch {
        setSubscription(null)
      } finally {
        setSubscriptionLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const getDisplayMetrics = () => {
    if (!analysisResults) return []

    const metricNames = {
      wrinkles: { en: "Wrinkles", th: "ริ้วรอย" },
      spots: { en: "Pigmentation", th: "จุดด่างดำ" },
      pores: { en: "Pores", th: "รูขุมขน" },
      texture: { en: "Texture", th: "พื้นผิว" },
      evenness: { en: "Evenness", th: "ความสม่ำเสมอ" },
      firmness: { en: "Elasticity", th: "ความยืดหยุ่น" },
      radiance: { en: "Brightness", th: "ความกระจ่างใส" },
      hydration: { en: "Hydration", th: "ความชุ่มชื้น" },
    }

    return Object.entries(analysisResults.metrics).map(([key, value]) => ({
      name: metricNames[key as keyof typeof metricNames].en,
      name_th: metricNames[key as keyof typeof metricNames].th,
      score: typeof value.score === 'number' && !isNaN(value.score) ? value.score : 0,
      grade: getGradeLabel(value.grade),
      trend: value.trend,
      description: value.description_en,
      description_th: value.description_th,
    }))
  }

  const getGradeLabel = (grade: string) => {
    const gradeMap: Record<string, string> = {
      A: "Excellent",
      B: "Good",
      C: "Fair",
      D: "Poor",
      F: "Poor",
    }
    return gradeMap[grade] || "Fair"
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "Excellent":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "Good":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "Fair":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "Poor":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (isLoading || !analysisResults) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const displayMetrics = getDisplayMetrics()

  const canCreateLead = subscriptionLoading ? false : (subscription?.isActive ?? true)

  const handleSaveLead = async () => {
    if (!analysisResults) return
    if (!canCreateLead) {
      toast({
        title: "Subscription จำกัดการใช้งาน",
        description: subscription?.message || "Subscription is not active",
        variant: "destructive",
      })
      return
    }
    if (!leadName.trim()) {
      toast({
        title: "กรุณากรอกชื่อลูกค้า",
        description: "ต้องมีชื่อเพื่อบันทึก Lead",
        variant: "destructive",
      })
      return
    }

    setIsSavingLead(true)
    try {
      const metricSummary = Object.entries(analysisResults.metrics)
        .map(([key, value]) => `${key}: ${Math.round((value as any).score ?? 0)}`)
        .join(', ')

      const recommendationTitles = (analysisResults.recommendations || [])
        .map((r) => r.title_th || r.title_en)
        .filter(Boolean)
        .join(', ')

      let campaign: string | null = null
      if (typeof window !== 'undefined') {
        try {
          const params = new URLSearchParams(window.location.search)
          campaign = params.get('campaign')
        } catch {
          campaign = null
        }
      }

      const res = await fetch("/api/sales/quick-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          phone: leadPhone.trim() || null,
          email: leadEmail.trim() || null,
          source: "analysis_results",
          campaign: campaign || undefined,
          notes: [
            `Lead created from analysis results`,
            `Overall score: ${Math.round(analysisResults.overall_score)}`,
            `Skin type: ${analysisResults.skin_type}`,
            `Skin age estimate: ${analysisResults.age_estimate} yrs`,
            metricSummary ? `Key metrics: ${metricSummary}` : null,
            recommendationTitles ? `AI recommendations: ${recommendationTitles}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
          metadata: {
            overall_score: analysisResults.overall_score,
            skin_type: analysisResults.skin_type,
            age_estimate: analysisResults.age_estimate,
            metrics: analysisResults.metrics,
            recommendations: analysisResults.recommendations,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "ไม่สามารถบันทึก Lead ได้")
      }

      toast({
        title: "บันทึก Lead สำเร็จ",
        description: "ลูกค้าถูกเพิ่มเข้าไปใน Sales Pipeline แล้ว",
        action: (
          <ToastAction altText="ดู Sales Dashboard" onClick={() => router.push("/sales/dashboard")}>
            ดู Sales Dashboard
          </ToastAction>
        ),
      })
      setLeadName("")
      setLeadPhone("")
      setLeadEmail("")
    } catch (error: any) {
      console.error("Save lead from analysis failed:", error)
      toast({
        title: "บันทึก Lead ไม่สำเร็จ",
        description: error?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSavingLead(false)
    }
  }

  const handleRequestRemoteConsult = async () => {
    if (!analysisResults) return
    if (!canCreateLead) {
      toast({
        title: "Subscription จำกัดการใช้งาน",
        description: subscription?.message || "Subscription is not active",
        variant: "destructive",
      })
      return
    }
    if (!leadName.trim()) {
      toast({
        title: "กรุณากรอกชื่อลูกค้า",
        description: "ต้องมีชื่อเพื่อส่งคำขอปรึกษาออนไลน์",
        variant: "destructive",
      })
      return
    }

    setIsSavingLead(true)
    try {
      const metricSummary = Object.entries(analysisResults.metrics)
        .map(([key, value]) => `${key}: ${Math.round((value as any).score ?? 0)}`)
        .join(', ')

      const recommendationTitles = (analysisResults.recommendations || [])
        .map((r) => r.title_th || r.title_en)
        .filter(Boolean)
        .join(', ')

      let campaign: string | null = null
      if (typeof window !== 'undefined') {
        try {
          const params = new URLSearchParams(window.location.search)
          campaign = params.get('campaign')
        } catch {
          campaign = null
        }
      }

      const res = await fetch("/api/sales/quick-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          phone: leadPhone.trim() || null,
          email: leadEmail.trim() || null,
          source: "analysis_results_remote_consult",
          campaign: campaign || undefined,
          notes: [
            `Remote online consult requested from analysis results`,
            `Overall score: ${Math.round(analysisResults.overall_score)}`,
            `Skin type: ${analysisResults.skin_type}`,
            `Skin age estimate: ${analysisResults.age_estimate} yrs`,
            metricSummary ? `Key metrics: ${metricSummary}` : null,
            recommendationTitles ? `AI recommendations: ${recommendationTitles}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
          metadata: {
            overall_score: analysisResults.overall_score,
            skin_type: analysisResults.skin_type,
            age_estimate: analysisResults.age_estimate,
            metrics: analysisResults.metrics,
            recommendations: analysisResults.recommendations,
            remote_consult_request: true,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "ไม่สามารถส่งคำขอปรึกษาออนไลน์ได้")
      }

      toast({
        title: "ส่งคำขอปรึกษาออนไลน์สำเร็จ",
        description: "ทีมงานจะติดต่อกลับเพื่อยืนยันเวลานัดหมาย",
      })
      setLeadName("")
      setLeadPhone("")
      setLeadEmail("")
    } catch (error: any) {
      console.error("Request remote consult failed:", error)
      toast({
        title: "ส่งคำขอปรึกษาออนไลน์ไม่สำเร็จ",
        description: error?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSavingLead(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-6 sm:py-8 px-4">
          {/* Header Actions */}
          <div className="mb-6 flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push("/analysis")} 
              className="w-full sm:w-auto self-start bg-background"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-sm">New Analysis / วิเคราะห์ใหม่</span>
            </Button>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2">
              <Button variant="default" size="sm" className="h-9" asChild>
                <Link href="/ar-simulator">
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  <span className="text-xs">Try AR / ทดลอง AR</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9 bg-background">
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                <span className="text-xs">Print / พิมพ์</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 bg-background">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                <span className="text-xs">PDF</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 bg-background">
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                <span className="text-xs">Share / แชร์</span>
              </Button>
              <Button size="sm" className="h-9 col-span-2 sm:col-span-1">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                <span className="text-xs">Book / จองคิว</span>
              </Button>
            </div>
          </div>

          {/* Quick Lead Capture for Sales */}
          <Card className="mb-6 border border-blue-200 bg-blue-50/60">
            {subscriptionLoading ? null : !subscription?.isActive ? (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-3">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-yellow-900">
                      Subscription จำกัดการใช้งาน
                    </div>
                    <div className="text-sm text-yellow-800">{subscription?.message}</div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                บันทึกเป็น Lead สำหรับทีมเซล
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-xs sm:text-sm text-blue-800">
                กรอกข้อมูลติดต่อของลูกค้าเพื่อบันทึกเป็น Lead ใน Sales Pipeline โดยใช้ผลการวิเคราะห์ชุดนี้เป็นพื้นฐาน
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="lead-name" className="text-xs sm:text-sm">ชื่อลูกค้า *</Label>
                  <Input
                    id="lead-name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lead-phone" className="text-xs sm:text-sm">เบอร์โทรศัพท์</Label>
                  <Input
                    id="lead-phone"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lead-email" className="text-xs sm:text-sm">อีเมล (ไม่บังคับ)</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={handleRequestRemoteConsult}
                  disabled={isSavingLead || !canCreateLead}
                >
                  {isSavingLead ? "กำลังส่งคำขอ..." : "ขอปรึกษาออนไลน์"}
                </Button>
                <Button
                  size="sm"
                  className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveLead}
                  disabled={isSavingLead || !canCreateLead}
                >
                  {isSavingLead ? "กำลังบันทึก..." : "บันทึกเป็น Lead"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Results Card */}
          <Card className="mb-6 border-2">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2 text-xl sm:text-2xl">
                    Skin Analysis Results
                    <br />
                    <span className="text-base sm:text-lg text-primary">ผลการวิเคราะห์ผิวหน้า</span>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/10 text-primary text-xs" variant="secondary">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI-Powered
                    </Badge>
                    <Badge 
                      className={`text-xs ${
                        analysisResults.confidence >= 90 
                          ? 'bg-green-100 text-green-800' 
                          : analysisResults.confidence >= 70 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                      variant="outline"
                    >
                      {analysisResults.confidence >= 90 ? '✓ High' : 
                       analysisResults.confidence >= 70 ? '⚠ Medium' : 
                       '⚠ Low'} ({analysisResults.confidence.toFixed(0)}%)
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tier === "premium" ? "Premium" : "Free"}
                    </Badge>
                  </div>
                </div>

                {analysisImage && (
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-lg border-2 border-border mx-auto md:mx-0">
                    <Image src={analysisImage || "/placeholder.svg"} alt="Analysis" fill className="object-cover" />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {/* Overall Score */}
              <div className="mb-6 sm:mb-8 rounded-lg bg-muted/50 p-4 sm:p-6">
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">Overall Skin Health Score</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">คะแนนสุขภาพผิวโดยรวม</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-3xl sm:text-4xl font-bold text-primary">{Math.round(analysisResults.overall_score)}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">out of 100</div>
                  </div>
                </div>
                <Progress value={analysisResults.overall_score} className="h-2 sm:h-3" />

                <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">Skin Age / อายุผิว</div>
                    <div className="text-xl sm:text-2xl font-bold">{analysisResults.age_estimate} <span className="text-sm">yrs</span></div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">Skin Type / ประเภทผิว</div>
                    <div className="text-xl sm:text-2xl font-bold capitalize">{analysisResults.skin_type}</div>
                  </div>
                </div>

                {/* Enhanced Visualization - Show confidence breakdown */}
                {tier === "premium" && (
                  <div className="mt-4 p-4 bg-background rounded-lg border">
                    <h4 className="text-sm font-semibold mb-3">AI Confidence Breakdown / การวิเคราะห์ความมั่นใจ</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Image Quality / คุณภาพภาพ</span>
                        <span className="font-medium text-green-600">95%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Lighting Conditions / แสงสว่าง</span>
                        <span className="font-medium text-green-600">92%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Face Detection / การตรวจจับใบหน้า</span>
                        <span className="font-medium text-green-600">98%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Analysis Accuracy / ความแม่นยำ</span>
                        <span className="font-medium text-yellow-600">{analysisResults.confidence.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs for Different Views */}
              <Tabs defaultValue="visia" className="w-full">
                <TabsList className="w-full h-auto flex-wrap gap-1 p-1 bg-muted">
                  <TabsTrigger value="visia" className="flex-1 min-w-[100px] text-xs sm:text-sm">
                    VISIA
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="flex-1 min-w-[100px] text-xs sm:text-sm">
                    8-Point
                  </TabsTrigger>
                  <TabsTrigger value="radar" className="flex-1 min-w-[100px] text-xs sm:text-sm">
                    Radar
                  </TabsTrigger>
                  <TabsTrigger value="ai-details" className="flex-1 min-w-[100px] text-xs sm:text-sm">
                    <Sparkles className="mr-1 h-3 w-3 hidden sm:inline" />
                    AI
                  </TabsTrigger>
                  <TabsTrigger value="heatmap" className="flex-1 min-w-[100px] text-xs sm:text-sm">
                    <Sparkles className="mr-1 h-3 w-3 hidden sm:inline" />
                    Heatmap
                  </TabsTrigger>
                  <TabsTrigger value="3d" className="flex-1 min-w-[100px] text-xs sm:text-sm">
                    <Wand2 className="mr-1 h-3 w-3 hidden sm:inline" />
                    3D
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="flex-1 min-w-[100px] text-xs sm:text-sm">
                    Compare
                  </TabsTrigger>
                </TabsList>

                {/* VISIA Analysis Tab */}
                <TabsContent value="visia" className="mt-6">
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      {displayMetrics.map((metric) => (
                        <motion.div
                          key={metric.name}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                        >
                          <Card className="border">
                            <CardContent className="p-4">
                              <div className="mb-3 flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{metric.name}</h4>
                                  <p className="text-sm text-muted-foreground">{metric.name_th}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getTrendIcon(metric.trend)}
                                  <Badge className={getGradeColor(metric.grade)} variant="outline">
                                    {metric.grade}
                                  </Badge>
                                </div>
                              </div>

                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-2xl font-bold text-primary">{Math.round(metric.score)}</span>
                                <span className="text-sm text-muted-foreground">/ 100</span>
                              </div>

                              <Progress value={metric.score} className="mb-3 h-2" />

                              <p className="text-xs text-muted-foreground leading-relaxed">{metric.description}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{metric.description_th}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>

                {/* 8-Point Detailed Analysis Tab */}
                <TabsContent value="detailed" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed 8-Point Analysis / วิเคราะห์ 8 จุดแบบละเอียด</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {displayMetrics.map((metric, index) => (
                            <div key={metric.name}>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">
                                      {metric.name} / {metric.name_th}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getGradeColor(metric.grade)} variant="outline">
                                      {metric.grade}
                                    </Badge>
                                    {getTrendIcon(metric.trend)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{Math.round(metric.score)}</div>
                                <div className="text-xs text-muted-foreground">/ 100</div>
                              </div>
                            </div>

                            <Progress value={metric.score} className="mb-2 h-2" />

                            <div className="rounded-lg bg-muted/50 p-3">
                              <p className="text-sm leading-relaxed">{metric.description}</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{metric.description_th}</p>
                            </div>

                            {index < displayMetrics.length - 1 && <Separator className="mt-6" />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                </TabsContent>

                {/* Radar Chart Tab */}
                <TabsContent value="radar" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SkinAnalysisRadarChart data={displayMetrics} />
                  </motion.div>
                </TabsContent>

                {/* AI Processing Details Tab - NEW */}
                <TabsContent value="ai-details" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Real AI Processing Details / รายละเอียดการประมวลผล AI จริง
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          MediaPipe Face Mesh + TensorFlow.js analysis with WebGL acceleration
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {analysisResults?.aiData ? (
                          <>
                            {/* Performance Metrics */}
                            <div className="grid gap-4 md:grid-cols-3">
                              <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Total Time</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      ✅ Real AI
                                    </Badge>
                                  </div>
                                  <div className="text-3xl font-bold text-primary">
                                    {(analysisResults.aiData.totalProcessingTime / 1000).toFixed(2)}s
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {analysisResults.aiData.totalProcessingTime}ms processing
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="border-2 border-blue-500/20 bg-blue-500/5">
                                <CardContent className="p-4">
                                  <div className="text-sm font-medium text-muted-foreground mb-2">Face Detection</div>
                                  <div className="text-3xl font-bold text-blue-600">
                                    {analysisResults.aiData.faceDetection.landmarks.length}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    landmarks detected in {analysisResults.aiData.faceDetection.processingTime}ms
                                  </p>
                                  <div className="mt-2">
                                    <Progress 
                                      value={analysisResults.aiData.faceDetection.confidence * 100} 
                                      className="h-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Confidence: {(analysisResults.aiData.faceDetection.confidence * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="border-2 border-purple-500/20 bg-purple-500/5">
                                <CardContent className="p-4">
                                  <div className="text-sm font-medium text-muted-foreground mb-2">Skin Analysis</div>
                                  <div className="text-3xl font-bold text-purple-600">
                                    {analysisResults.aiData.skinAnalysis.overallScore}/100
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    analyzed in {analysisResults.aiData.skinAnalysis.processingTime}ms
                                  </p>
                                  <div className="mt-2">
                                    <Progress 
                                      value={analysisResults.aiData.skinAnalysis.overallScore} 
                                      className="h-2"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Face Landmarks Visualization */}
                            {analysisResults.aiData.faceDetection.landmarks.length > 0 && (
                              <FaceLandmarksCanvas
                                imageUrl={analysisImage || analysisResults.image_url || '/placeholder-face.jpg'}
                                landmarks={analysisResults.aiData.faceDetection.landmarks}
                                confidence={analysisResults.aiData.faceDetection.confidence}
                              />
                            )}

                            {/* Technology Stack */}
                            <Card className="border">
                              <CardHeader>
                                <h4 className="text-sm font-semibold">AI Technology Stack / เทคโนโลยี AI ที่ใช้</h4>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                    <span className="text-lg">🔷</span>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-sm">MediaPipe Face Mesh</h5>
                                    <p className="text-xs text-muted-foreground">
                                      Google's real-time face detection with {analysisResults.aiData.faceDetection.landmarks.length}-point landmark tracking
                                    </p>
                                    <div className="mt-1 flex gap-2">
                                      <Badge variant="outline" className="text-xs">WebGL Accelerated</Badge>
                                      <Badge variant="outline" className="text-xs">SIMD WASM</Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                                    <span className="text-lg">⚡</span>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-sm">TensorFlow.js</h5>
                                    <p className="text-xs text-muted-foreground">
                                      Advanced skin analysis using custom ML models trained on dermatology datasets
                                    </p>
                                    <div className="mt-1 flex gap-2">
                                      <Badge variant="outline" className="text-xs">WebGL Backend</Badge>
                                      <Badge variant="outline" className="text-xs">GPU Accelerated</Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                    <span className="text-lg">🧪</span>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-sm">Quality Assurance</h5>
                                    <p className="text-xs text-muted-foreground">
                                      Automated image quality checks for lighting, focus, and face positioning
                                    </p>
                                    {analysisResults.aiData.qualityReport && (
                                      <div className="mt-2">
                                        <Progress value={analysisResults.aiData.qualityReport.score} className="h-1" />
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Quality Score: {analysisResults.aiData.qualityReport.score}/100
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Detected Concerns */}
                            {analysisResults.aiData.skinAnalysis.concerns && analysisResults.aiData.skinAnalysis.concerns.length > 0 && (
                              <Card className="border">
                                <CardHeader>
                                  <h4 className="text-sm font-semibold">AI-Detected Skin Concerns / ปัญหาผิวที่ AI ตรวจพบ</h4>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {analysisResults.aiData.skinAnalysis.concerns.map((concern, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium capitalize">{concern.type}</span>
                                            <Badge 
                                              variant="outline" 
                                              className={
                                                concern.severity > 70 
                                                  ? "bg-red-50 text-red-700 border-red-200" 
                                                  : concern.severity > 40 
                                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                                                  : "bg-green-50 text-green-700 border-green-200"
                                              }
                                            >
                                              {concern.severity > 70 ? "High" : concern.severity > 40 ? "Medium" : "Low"}
                                            </Badge>
                                          </div>
                                          <div className="mt-1 flex items-center gap-4">
                                            <div className="flex-1">
                                              <div className="text-xs text-muted-foreground mb-1">Severity</div>
                                              <Progress value={concern.severity} className="h-1.5" />
                                            </div>
                                            <div className="text-right">
                                              <div className="text-xs text-muted-foreground">Confidence</div>
                                              <div className="text-sm font-semibold">{(concern.confidence * 100).toFixed(0)}%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Processing Timeline */}
                            <Card className="border">
                              <CardHeader>
                                <h4 className="text-sm font-semibold">Processing Timeline / ขั้นตอนการประมวลผล</h4>
                              </CardHeader>
                              <CardContent>
                                <div className="relative space-y-4 pl-6">
                                  {/* Timeline line */}
                                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                                  
                                  <div className="relative">
                                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-blue-500" />
                                    <div className="text-sm font-medium">Face Detection - MediaPipe</div>
                                    <div className="text-xs text-muted-foreground">
                                      {analysisResults.aiData.faceDetection.processingTime}ms • {analysisResults.aiData.faceDetection.landmarks.length} landmarks
                                    </div>
                                  </div>

                                  <div className="relative">
                                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-purple-500" />
                                    <div className="text-sm font-medium">Skin Analysis - TensorFlow.js</div>
                                    <div className="text-xs text-muted-foreground">
                                      {analysisResults.aiData.skinAnalysis.processingTime}ms • Score: {analysisResults.aiData.skinAnalysis.overallScore}
                                    </div>
                                  </div>

                                  {analysisResults.aiData.qualityReport && (
                                    <div className="relative">
                                      <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-green-500" />
                                      <div className="text-sm font-medium">Quality Check</div>
                                      <div className="text-xs text-muted-foreground">
                                        Score: {analysisResults.aiData.qualityReport.score}/100
                                        {analysisResults.aiData.qualityReport.issues.length > 0 && 
                                          ` • ${analysisResults.aiData.qualityReport.issues.length} issue(s) detected`
                                        }
                                      </div>
                                    </div>
                                  )}

                                  <div className="relative">
                                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-primary" />
                                    <div className="text-sm font-medium">Total Processing</div>
                                    <div className="text-xs text-muted-foreground">
                                      {analysisResults.aiData.totalProcessingTime}ms ({(analysisResults.aiData.totalProcessingTime / 1000).toFixed(2)}s)
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </>
                        ) : (
                          <div className="p-8 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h4 className="font-semibold mb-2">No AI Processing Data Available</h4>
                            <p className="text-sm text-muted-foreground">
                              This analysis was performed using mock data.
                              <br />
                              Upload a new photo to see real AI processing details.
                            </p>
                            <Button className="mt-4" onClick={() => router.push("/analysis")}>
                              Start New Analysis
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Advanced AI Heatmap Tab - New Enhanced Version */}
                <TabsContent value="heatmap" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              Advanced AI Skin Analysis / วิเคราะห์ผิวด้วย AI ขั้นสูง
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Real-time face detection with multi-layer concern visualization
                            </p>
                          </div>
                          {tier === "premium" && (
                            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <AdvancedHeatmap 
                          image={analysisImage || ""} 
                          isPremium={tier === "premium"} 
                        />
                        {tier === "free" && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Unlock Premium Features
                            </h4>
                            <ul className="text-sm text-purple-700 space-y-1 mb-3">
                              <li>✅ Precise bounding box detection</li>
                              <li>✅ 468-point face landmark visualization</li>
                              <li>✅ Confidence scores per concern</li>
                              <li>✅ High-resolution heatmap export</li>
                            </ul>
                            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                              Upgrade to Premium
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* 3D Interactive View Tab - New */}
                <TabsContent value="3d" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-primary" />
                            Interactive 3D Face Model / โมเดลใบหน้า 3 มิติ
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            360° rotation with real-time treatment preview
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Interactive3DViewer 
                        image={analysisImage || ""} 
                        treatment="comprehensive"
                        intensity={70}
                      />
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">How to Use / วิธีใช้งาน</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>🖱️ <strong>Drag</strong> to rotate the model (Mouse or Touch)</li>
                          <li>🔍 Use <strong>Zoom slider</strong> to adjust size (50-200%)</li>
                          <li>⚡ Toggle <strong>Auto-rotate</strong> for animated preview</li>
                          <li>📐 Click <strong>Quick Angles</strong> for preset views</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                </TabsContent>

                {/* Comparison Tab - Enhanced with Before/After Slider */}
                <TabsContent value="comparison" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Before & After Comparison / เปรียบเทียบก่อน-หลัง</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Interactive slider to visualize treatment results
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <BeforeAfterSlider 
                          beforeImage={analysisImage || ""} 
                          afterImage={analysisImage || ""} // In real app, this would be actual after-treatment photo
                        />
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-2">Track Your Progress / ติดตามผล</h4>
                          <p className="text-sm text-green-700 mb-3">
                            Upload before and after photos from your treatment journey to see real improvements over time.
                          </p>
                          <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            View Analysis History / ดูประวัติการวิเคราะห์
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>

              {/* Top Concerns & Recommendations */}
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* HITL Validation Section - Premium Only */}
                {tier === "premium" && analysisResults.confidence < 90 && (
                  <Card className="lg:col-span-2 border-2 border-blue-500/20 bg-blue-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        Human-in-the-Loop Validation / การตรวจสอบโดยผู้เชี่ยวชาญ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              Our AI detected some areas that need expert validation for maximum accuracy
                            </p>
                            <p className="text-sm text-blue-700">
                              ระบบ AI ตรวจพบบางจุดที่ต้องการการตรวจสอบจากผู้เชี่ยวชาญเพื่อความแม่นยำสูงสุด
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                            Request Expert Review / ขอการตรวจสอบจากผู้เชี่ยวชาญ
                          </Button>
                          <Button variant="outline">
                            Learn More / เรียนรู้เพิ่มเติม
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Priority Recommendations / คำแนะนำสำคัญ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResults.recommendations
                        .filter((rec) => rec.priority === "high")
                        .slice(0, 3)
                        .map((rec, idx) => (
                          <li key={rec.title_en} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-700">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium">{rec.title_en}</p>
                              <p className="text-sm text-muted-foreground">{rec.title_th}</p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Treatment Recommendations / คำแนะนำการรักษา</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResults.recommendations.slice(0, 3).map((rec, idx) => (
                        <li key={rec.title_en} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm leading-relaxed">{rec.description_en}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{rec.description_th}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Upgrade CTA for Free Tier */}
              {tier === "free" && (
                <Card className="mt-8 border-2 border-primary bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-bold">Upgrade to Premium for More Accurate Results</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Get 95-99% accuracy, personalized treatment plans, AR visualization, and HITL validation
                          <br />
                          รับความแม่นยำ 95-99% แผนการรักษาเฉพาะบุคคล AR และการตรวจสอบโดยผู้เชี่ยวชาญ
                        </p>
                      </div>
                      <Button size="lg" className="shrink-0">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
