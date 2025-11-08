"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Heart,
  Star,
  Clock,
  DollarSign,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import Link from "next/link"
import { motion } from "framer-motion"

interface Recommendation {
  id: string
  type: "treatment" | "product" | "lifestyle"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  confidence: number
  targetMetrics: string[]
  expectedImprovement: string
  timeframe: string
  cost?: {
    min: number
    max: number
  }
  status?: "pending" | "completed" | "in-progress"
}

export default function RecommendationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/auth/login?callbackUrl=/recommendations")
      return
    }

    // Load recommendations
    loadRecommendations()
  }, [user, authLoading, router])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      // Simulated data - Replace with actual API call
      const mockRecommendations: Recommendation[] = [
        {
          id: "1",
          type: "treatment",
          title: "Laser Treatment for Dark Spots",
          description: "Q-switched laser therapy to target pigmentation and dark spots. Highly effective for melasma and sun damage.",
          priority: "high",
          confidence: 0.89,
          targetMetrics: ["spots", "pigmentation"],
          expectedImprovement: "60-80% reduction in dark spots",
          timeframe: "4-6 sessions over 3 months",
          cost: { min: 15000, max: 25000 },
          status: "pending",
        },
        {
          id: "2",
          type: "treatment",
          title: "HydraFacial Deep Cleanse",
          description: "Medical-grade facial treatment to improve pore clarity and skin texture. Removes impurities and hydrates skin.",
          priority: "high",
          confidence: 0.85,
          targetMetrics: ["pores", "texture", "hydration"],
          expectedImprovement: "40-50% pore size reduction",
          timeframe: "Monthly sessions for 3 months",
          cost: { min: 3500, max: 5000 },
          status: "pending",
        },
        {
          id: "3",
          type: "product",
          title: "Vitamin C Serum",
          description: "20% L-Ascorbic Acid serum to brighten skin and reduce pigmentation. Use morning and evening.",
          priority: "high",
          confidence: 0.92,
          targetMetrics: ["spots", "evenness", "brightness"],
          expectedImprovement: "Brighter, more even skin tone",
          timeframe: "Visible results in 4-6 weeks",
          cost: { min: 1200, max: 2500 },
          status: "pending",
        },
        {
          id: "4",
          type: "product",
          title: "Niacinamide 10% Serum",
          description: "Reduces pore appearance, controls oil, and improves skin texture. Apply after cleansing.",
          priority: "medium",
          confidence: 0.88,
          targetMetrics: ["pores", "texture", "oiliness"],
          expectedImprovement: "Refined pores and smoother texture",
          timeframe: "2-3 weeks for visible results",
          cost: { min: 800, max: 1500 },
          status: "pending",
        },
        {
          id: "5",
          type: "lifestyle",
          title: "Daily Sunscreen (SPF 50+)",
          description: "Essential for preventing further pigmentation and protecting against UV damage. Apply every 2 hours.",
          priority: "high",
          confidence: 0.95,
          targetMetrics: ["spots", "pigmentation", "aging"],
          expectedImprovement: "Prevents new dark spots",
          timeframe: "Daily use",
          cost: { min: 500, max: 1200 },
          status: "in-progress",
        },
        {
          id: "6",
          type: "lifestyle",
          title: "Sleep Optimization",
          description: "Aim for 7-8 hours of quality sleep. Skin repairs itself during sleep, improving overall complexion.",
          priority: "medium",
          confidence: 0.82,
          targetMetrics: ["overall", "texture", "glow"],
          expectedImprovement: "Better skin regeneration",
          timeframe: "Ongoing habit",
          status: "in-progress",
        },
      ]

      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error("Failed to load recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "treatment":
        return <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      case "product":
        return <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case "lifestyle":
        return <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">กำลังโหลดคำแนะนำ...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const treatmentRecs = recommendations.filter((r) => r.type === "treatment")
  const productRecs = recommendations.filter((r) => r.type === "product")
  const lifestyleRecs = recommendations.filter((r) => r.type === "lifestyle")
  const highPriorityRecs = recommendations.filter((r) => r.priority === "high")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">
                  Personalized Recommendations
                  <br />
                  <span className="text-primary">คำแนะนำเฉพาะบุคคล</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                AI-powered recommendations based on your skin analysis and profile
                <br />
                คำแนะนำจาก AI ที่ปรับแต่งตามผลการวิเคราะห์และโปรไฟล์ของคุณ
              </p>
            </div>

            {/* Priority Alert */}
            {highPriorityRecs.length > 0 && (
              <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-foreground">
                  <strong>Priority Actions:</strong> You have {highPriorityRecs.length} high-priority
                  recommendations that could significantly improve your skin health.
                  <br />
                  <span className="text-sm text-muted-foreground">
                    มีคำแนะนำสำคัญ {highPriorityRecs.length} รายการที่ควรดำเนินการเร็วที่สุด
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-foreground">{recommendations.length}</p>
                      <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                    </div>
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">High Priority</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {highPriorityRecs.length}
                      </p>
                      <p className="text-xs text-muted-foreground">ควรทำด่วน</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Treatments</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {treatmentRecs.length}
                      </p>
                      <p className="text-xs text-muted-foreground">ทรีทเมนต์</p>
                    </div>
                    <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Products</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {productRecs.length}
                      </p>
                      <p className="text-xs text-muted-foreground">ผลิตภัณฑ์</p>
                    </div>
                    <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
                <TabsTrigger value="treatments">Treatments ({treatmentRecs.length})</TabsTrigger>
                <TabsTrigger value="products">Products ({productRecs.length})</TabsTrigger>
                <TabsTrigger value="lifestyle">Lifestyle ({lifestyleRecs.length})</TabsTrigger>
              </TabsList>

              {/* All Recommendations */}
              <TabsContent value="all" className="space-y-4 mt-6">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {getTypeIcon(rec.type)}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-xl text-foreground">{rec.title}</CardTitle>
                                <Badge variant={getPriorityBadge(rec.priority)}>
                                  {rec.priority.toUpperCase()}
                                </Badge>
                                {rec.status && (
                                  <Badge variant="outline" className="capitalize">
                                    {rec.status}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-base">
                                {rec.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Confidence */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">AI Confidence:</span>
                            <span className="font-medium text-foreground">
                              {Math.round(rec.confidence * 100)}%
                            </span>
                          </div>
                          <Progress value={rec.confidence * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Details Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Target Metrics */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Target Areas / เป้าหมาย:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {rec.targetMetrics.map((metric) => (
                                <Badge key={metric} variant="secondary" className="capitalize">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Expected Results */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Expected Results / ผลที่คาดหวัง:
                            </p>
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                              <p className="text-sm text-foreground">{rec.expectedImprovement}</p>
                            </div>
                          </div>

                          {/* Timeframe */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Timeframe / ระยะเวลา:
                            </p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <p className="text-sm text-foreground">{rec.timeframe}</p>
                            </div>
                          </div>

                          {/* Cost */}
                          {rec.cost && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Cost / ราคา:
                              </p>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <p className="text-sm text-foreground">
                                  ฿{rec.cost.min.toLocaleString()} - ฿
                                  {rec.cost.max.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex gap-2">
                          {rec.type === "treatment" && (
                            <Button asChild className="flex-1">
                              <Link href="/booking">
                                จองนัดหมาย
                                <Calendar className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {rec.type === "product" && (
                            <Button asChild variant="outline" className="flex-1">
                              <Link href="/shop-demo">
                                ดูผลิตภัณฑ์
                                <ShoppingBag className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Treatment Recommendations */}
              <TabsContent value="treatments" className="space-y-4 mt-6">
                {treatmentRecs.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-foreground">{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full">
                          <Link href="/booking">
                            จองนัดหมาย
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Product Recommendations */}
              <TabsContent value="products" className="space-y-4 mt-6">
                {productRecs.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-foreground">{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/shop-demo">
                            ดูผลิตภัณฑ์
                            <ShoppingBag className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Lifestyle Recommendations */}
              <TabsContent value="lifestyle" className="space-y-4 mt-6">
                {lifestyleRecs.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-foreground">{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span>Implement this daily habit for best results</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-foreground">Need More Analysis?</CardTitle>
                <CardDescription className="text-base">
                  Upload a new photo to get updated recommendations based on your current skin condition
                  <br />
                  อัปโหลดภาพใหม่เพื่อรับคำแนะนำที่อัปเดตตามสภาพผิวปัจจุบัน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg">
                  <Link href="/analysis">
                    <Sparkles className="mr-2 h-5 w-5" />
                    วิเคราะห์ผิวใหม่
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
