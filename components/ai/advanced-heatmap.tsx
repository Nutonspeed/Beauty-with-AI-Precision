"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Info, Layers, Eye, EyeOff, Download } from "lucide-react"
import {
  detectFace,
  analyzeSkinConcerns,
  drawFaceLandmarks,
  type SkinConcernArea,
  type FaceDetectionResult,
} from "@/lib/ai/face-detection"
import {
  generateRealHeatmap,
  type HeatmapConfig,
} from "@/lib/ai/heatmap-generator"

interface AdvancedHeatmapProps {
  readonly image: string | null
  readonly isPremium?: boolean
}

export function AdvancedHeatmap({ image, isPremium = false }: AdvancedHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [faceDetection, setFaceDetection] = useState<FaceDetectionResult | null>(null)
  const [skinConcerns, setSkinConcerns] = useState<SkinConcernArea[]>([])
  const [opacity, setOpacity] = useState([70])
  const [showLandmarks, setShowLandmarks] = useState(false)
  const [activeLayer, setActiveLayer] = useState<string>("all")

  // Load and analyze image
  const loadAndAnalyzeImage = useCallback(async (imageUrl: string) => {
    setIsProcessing(true)

    try {
      const img = globalThis.Image ? new globalThis.Image() : new Image()
      img.crossOrigin = "anonymous"
      img.src = imageUrl

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Detect face
      const faceResult = await detectFace(imageData)
      if (faceResult) {
        setFaceDetection(faceResult)

        // Analyze skin concerns
        const concerns = await analyzeSkinConcerns(imageData, faceResult)
        setSkinConcerns(concerns)
      }
    } catch (error) {
      console.error("Error analyzing image:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  useEffect(() => {
    if (!image) return
    loadAndAnalyzeImage(image)
  }, [image, loadAndAnalyzeImage])

  // Render heatmap overlay
  const renderHeatmapOverlay = useCallback(() => {
    if (!skinConcerns.length || !overlayCanvasRef.current || !canvasRef.current) return

    const overlayCanvas = overlayCanvasRef.current
    const mainCanvas = canvasRef.current
    const ctx = overlayCanvas.getContext("2d")
    if (!ctx) return

    overlayCanvas.width = mainCanvas.width
    overlayCanvas.height = mainCanvas.height

    // Clear overlay
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)

    // Filter concerns based on active layer
    const concernType = activeLayer === "all" ? undefined : activeLayer
    const filteredConcerns = concernType
      ? skinConcerns.filter((c) => c.type === concernType)
      : skinConcerns

    if (filteredConcerns.length === 0) {
      return // No concerns to display
    }

    // Generate real heatmap using Canvas API
    const heatmapConfig: HeatmapConfig = {
      width: overlayCanvas.width,
      height: overlayCanvas.height,
      concernType: concernType as 'wrinkle' | 'pigmentation' | 'pore' | 'redness' | 'acne' | 'all' | undefined,
      opacity: opacity[0] / 100,
      blurRadius: 30,
      colorScheme: 'default',
    }

    const heatmapData = generateRealHeatmap(filteredConcerns, heatmapConfig)

    // Draw heatmap on overlay canvas
    ctx.putImageData(heatmapData, 0, 0)

    // Draw bounding boxes for premium users
    if (isPremium) {
      for (const concern of filteredConcerns) {
        const severityColor = {
          low: "#22c55e",
          medium: "#eab308",
          high: "#ef4444",
        }

        ctx.strokeStyle = severityColor[concern.severity]
        ctx.lineWidth = 2
        ctx.strokeRect(
          concern.boundingBox.x,
          concern.boundingBox.y,
          concern.boundingBox.width,
          concern.boundingBox.height
        )

        // Draw label
        ctx.fillStyle = severityColor[concern.severity]
        ctx.font = "12px sans-serif"
        ctx.fillText(
          `${concern.type} (${Math.round(concern.confidence * 100)}%)`,
          concern.boundingBox.x,
          concern.boundingBox.y - 5
        )
      }
    }

    // Draw face landmarks if enabled
    if (showLandmarks && faceDetection && isPremium) {
      drawFaceLandmarks(ctx, faceDetection.landmarks, {
        color: "#00ff00",
        size: 1,
        showConnections: false,
      })
    }
  }, [skinConcerns, opacity, activeLayer, showLandmarks, faceDetection, isPremium])

  useEffect(() => {
    renderHeatmapOverlay()
  }, [renderHeatmapOverlay])

  const handleDownload = () => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `heatmap-${activeLayer}-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const getConcernCount = (type: string) => {
    return skinConcerns.filter((c) => c.type === type).length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced AI Heatmap / แผนที่ความร้อนขั้นสูง</CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time skin concern detection with AI / ตรวจจับปัญหาผิวด้วย AI แบบเรียลไทม์
            </p>
          </div>
          {isPremium && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Layers className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Detection Stats */}
        {faceDetection && (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div className="rounded-lg border bg-muted/30 p-2 text-center">
              <div className="text-xs text-muted-foreground">Face</div>
              <div className="text-sm font-bold text-green-600">
                {Math.round(faceDetection.confidence * 100)}%
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-2 text-center">
              <div className="text-xs text-muted-foreground">Wrinkles</div>
              <div className="text-sm font-bold">{getConcernCount("wrinkle")}</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-2 text-center">
              <div className="text-xs text-muted-foreground">Spots</div>
              <div className="text-sm font-bold">{getConcernCount("pigmentation")}</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-2 text-center">
              <div className="text-xs text-muted-foreground">Pores</div>
              <div className="text-sm font-bold">{getConcernCount("pore")}</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-2 text-center">
              <div className="text-xs text-muted-foreground">Redness</div>
              <div className="text-sm font-bold">{getConcernCount("redness")}</div>
            </div>
          </div>
        )}

        <Tabs value={activeLayer} onValueChange={setActiveLayer} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="wrinkle">Wrinkles</TabsTrigger>
            <TabsTrigger value="pigmentation">Spots</TabsTrigger>
            <TabsTrigger value="pore">Pores</TabsTrigger>
            <TabsTrigger value="redness">Redness</TabsTrigger>
          </TabsList>

          <TabsContent value={activeLayer} className="mt-6">
            {isProcessing ? (
              <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-muted">
                <div className="text-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  <p className="text-sm text-muted-foreground">Analyzing with AI...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Canvas Container */}
                <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-lg border-2 border-border">
                  {image ? (
                    <>
                      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-contain" />
                      <canvas
                        ref={overlayCanvasRef}
                        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
                      />
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="opacity-slider" className="text-sm font-medium">Overlay Opacity / ความเข้มซ้อนทับ</label>
                      <span className="text-sm font-bold text-primary">{opacity[0]}%</span>
                    </div>
                    <Slider id="opacity-slider" value={opacity} onValueChange={setOpacity} min={0} max={100} step={5} />
                  </div>

                  {isPremium && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Face Landmarks / จุดสำคัญบนใบหน้า</span>
                      <Button
                        variant={showLandmarks ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowLandmarks(!showLandmarks)}
                      >
                        {showLandmarks ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                        {showLandmarks ? "Hide" : "Show"}
                      </Button>
                    </div>
                  )}

                  <Button variant="outline" className="w-full" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Heatmap / ดาวน์โหลด
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-500" />
                    <span className="text-xs">Low Severity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-yellow-500" />
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-red-500" />
                    <span className="text-xs">High</span>
                  </div>
                </div>

                {/* Info Message */}
                <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 p-3">
                  <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {(() => {
                      if (activeLayer === "all") {
                        return "Showing all detected skin concerns. Select a specific concern type to focus. / แสดงปัญหาผิวทั้งหมดที่ตรวจพบ เลือกประเภทเพื่อดูเฉพาะ"
                      }
                      const premiumText = isPremium ? "Bounding boxes show exact locations." : "Upgrade for precise locations."
                      const thaiText = isPremium ? "กรอบแสดงตำแหน่งที่แม่นยำ" : "อัปเกรดเพื่อตำแหน่งที่แม่นยำ"
                      return `Showing only ${activeLayer} concerns. ${premiumText} / แสดงเฉพาะ ${activeLayer} ${thaiText}`
                    })()}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA for Free Users */}
        {!isPremium && (
          <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-3">
              <Badge className="shrink-0 bg-yellow-500/20 text-yellow-700" variant="secondary">
                Free Tier
              </Badge>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Upgrade to Premium</strong> for:
                  <br />• Precise bounding box detection / กรอบตรวจจับที่แม่นยำ
                  <br />• 468-point face landmarks / จุดสำคัญ 468 จุดบนใบหน้า
                  <br />• Confidence scores for each concern / คะแนนความมั่นใจแต่ละจุด
                  <br />• Export high-resolution heatmaps / ส่งออกแผนที่ความละเอียดสูง
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
