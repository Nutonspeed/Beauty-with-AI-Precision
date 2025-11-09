"use client"

import { useState } from "react"
import { MultiAngleCamera, type CapturedView } from "@/components/ar/multi-angle-camera"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"

export default function MultiAngleAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const [capturedViews, setCapturedViews] = useState<CapturedView[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const locale = (params.locale as string) || "th"

  const handleCaptureComplete = async (views: CapturedView[]) => {
    console.log("[v0] Multi-angle capture complete:", views.length, "views")
    setCapturedViews(views)
  }

  const handleAnalyze = async () => {
    if (capturedViews.length !== 3) return

    setIsAnalyzing(true)

    try {
      console.log("[v0] Starting multi-angle analysis...")

      // Send all 3 views to API
      const response = await fetch("/api/skin-analysis/multi-angle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          views: capturedViews.map((v) => ({
            angle: v.angle,
            image: v.imageData,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed")
      }

  console.log("[v0] Multi-angle analysis complete:", result.id)
  router.push(`/${locale}/analysis/detail/${result.id}`)
    } catch (error) {
      console.error("[v0] Multi-angle analysis error:", error)
      alert("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Multi-Angle Skin Analysis</h1>
          <p className="text-muted-foreground">VISIA-style 3-view capture for comprehensive analysis</p>
        </div>
      </div>

      {/* Camera */}
      {capturedViews.length === 0 && <MultiAngleCamera onComplete={handleCaptureComplete} />}

      {/* Preview Captured Views */}
      {capturedViews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Captured Views / ภาพที่ถ่ายแล้ว</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {capturedViews.map((view) => (
                <div key={view.angle} className="space-y-2">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-primary">
                    <Image
                      src={view.imageData || "/placeholder.svg"}
                      alt={`${view.angle} view`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-center capitalize">{view.angle} View</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1 gap-2" size="lg">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing / กำลังวิเคราะห์...
                  </>
                ) : (
                  "Start Analysis / เริ่มวิเคราะห์"
                )}
              </Button>
              <Button onClick={() => setCapturedViews([])} variant="outline" size="lg" disabled={isAnalyzing}>
                Retake / ถ่ายใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
