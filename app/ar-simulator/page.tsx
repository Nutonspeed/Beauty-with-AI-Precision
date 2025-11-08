"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Sparkles, Download, Share2, Zap, Camera, Loader2, Layers, Activity } from "lucide-react"
import { TreatmentSelector } from "@/components/treatment-selector"
import { ARVisualization } from "@/components/ar-visualization"
import { Interactive3DViewer } from "@/components/ar/interactive-3d-viewer"
import { Enhanced3DViewer } from "@/components/ar/enhanced-3d-viewer"
import { AdvancedARViewer } from "@/components/ar/advanced-ar-viewer"
import { LiveARCamera } from "@/components/ar/live-ar-camera"
import { BeforeAfterSlider } from "@/components/ar/before-after-slider"
import { LiveCameraAR } from "@/components/ar/live-camera-ar"
import { useHaptic, HAPTIC_PATTERNS } from "@/lib/hooks/use-haptic"

export default function ARSimulatorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading AR Simulator...</p>
        </div>
      </div>
    }>
      <ARSimulatorContent />
    </Suspense>
  )
}

function ARSimulatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const haptic = useHaptic()
  
  // Support mode parameter from redirected routes (ar-3d, ar-advanced, ar-live)
  const modeParam = searchParams?.get("mode") || "simulator"
  const [analysisImage, setAnalysisImage] = useState<string | null>(null)
  const [selectedTreatment, setSelectedTreatment] = useState<string>("botox")
  const [intensity, setIntensity] = useState([50])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"front" | "side" | "profile">("front")
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(["botox"])
  const [showMultiTreatment, setShowMultiTreatment] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  
  // Determine default tab based on mode parameter
  const [activeTab, setActiveTab] = useState<string>(() => {
    switch(modeParam) {
      case "3d": return "enhanced-3d"
      case "advanced": return "advanced"
      case "live": return "live"
      default: return "ar"
    }
  })

  useEffect(() => {
    const storedImage = sessionStorage.getItem("analysisImage")
    if (!storedImage) {
      router.push("/analysis")
      return
    }
    setAnalysisImage(storedImage)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading AR Simulator...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Button variant="outline" onClick={() => router.push("/analysis/results")} className="mb-2 bg-background">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Results / กลับไปผลลัพธ์
              </Button>
              <h1 className="text-2xl font-bold">
                AR Treatment Simulator
                <br />
                <span className="text-lg text-primary">จำลองผลการรักษาด้วย AR</span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="bg-background">
                <Download className="mr-2 h-4 w-4" />
                Save Result
              </Button>
              <Button variant="outline" size="sm" className="bg-background">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Treatment Selection Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Select Treatment / เลือกการรักษา</CardTitle>
                  <Badge className="w-fit bg-primary/10 text-primary" variant="secondary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI-Powered Preview
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mode / โหมด</span>
                      <Button
                        variant={showMultiTreatment ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          haptic.trigger(HAPTIC_PATTERNS.BUTTON_TAP)
                          setShowMultiTreatment(!showMultiTreatment)
                        }}
                      >
                        {showMultiTreatment ? "Multi-Treatment" : "Single Treatment"}
                      </Button>
                    </div>

                    {showMultiTreatment ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Select multiple treatments to combine:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {["botox", "filler", "laser", "peel", "microneedling", "thread"].map((treatment) => (
                            <Button
                              key={treatment}
                              variant={selectedTreatments.includes(treatment) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                haptic.trigger(HAPTIC_PATTERNS.BUTTON_TAP)
                                if (selectedTreatments.includes(treatment)) {
                                  setSelectedTreatments(selectedTreatments.filter((t) => t !== treatment))
                                } else {
                                  setSelectedTreatments([...selectedTreatments, treatment])
                                  haptic.trigger(HAPTIC_PATTERNS.TREATMENT_APPLIED)
                                }
                              }}
                              className="capitalize"
                            >
                              {treatment}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <TreatmentSelector
                        selectedTreatment={selectedTreatment}
                        onSelectTreatment={setSelectedTreatment}
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Intensity / ความเข้มข้น</div>
                      <span className="text-sm font-bold text-primary">{intensity[0]}%</span>
                    </div>
                    <Slider
                      value={intensity}
                      onValueChange={(value: number[]) => {
                        haptic.trigger("selection")
                        setIntensity(value)
                      }}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtle / เบา</span>
                      <span>Natural / ธรรมชาติ</span>
                      <span>Dramatic / เข้มข้น</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-semibold">Treatment Info</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {getTreatmentInfo(selectedTreatment)}
                    </p>
                  </div>

                  <Button className="w-full" size="lg">
                    <Zap className="mr-2 h-4 w-4" />
                    Book This Treatment / จองการรักษา
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AR Visualization Panel */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview / ดูตัวอย่างสด</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    See how you would look after treatment / ดูว่าคุณจะหน้าตาเป็นอย่างไรหลังการรักษา
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="ar">Simulator</TabsTrigger>
                      <TabsTrigger value="enhanced-3d">
                        <Layers className="mr-1 h-3 w-3" />
                        3D View
                      </TabsTrigger>
                      <TabsTrigger value="advanced">
                        <Activity className="mr-1 h-3 w-3" />
                        Advanced
                      </TabsTrigger>
                      <TabsTrigger value="live">
                        <Camera className="mr-1 h-3 w-3" />
                        Live
                      </TabsTrigger>
                      <TabsTrigger value="comparison">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Compare
                      </TabsTrigger>
                      <TabsTrigger value="interactive">Interactive 3D</TabsTrigger>
                    </TabsList>

                    <TabsContent value="enhanced-3d" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Enhanced3DViewer
                          imageUrl={analysisImage || ""}
                          landmarks={undefined}
                          analysisData={{
                            spots: [],
                            pores: [],
                            wrinkles: []
                          }}
                          showHeatmap={true}
                        />
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Enhanced 3D Features
                          </h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>🎯 468-point facial landmark detection</li>
                            <li>🗺️ Heat map visualization of skin conditions</li>
                            <li>📊 Real-time analysis overlay</li>
                            <li>🔄 Interactive rotation and zoom</li>
                          </ul>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <AdvancedARViewer />
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Advanced AI Features
                          </h4>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>🤖 Real-time object detection with TensorFlow.js</li>
                            <li>👁️ Face mesh with MediaPipe</li>
                            <li>🎨 Custom skin analysis models</li>
                            <li>⚡ GPU-accelerated processing (30+ FPS)</li>
                          </ul>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="live" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <LiveARCamera
                          treatment={showMultiTreatment ? selectedTreatments.join(",") as any : selectedTreatment as any}
                          intensity={intensity[0]}
                          onFaceDetected={setFaceDetected}
                        />
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Live Camera Preview
                          </h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>📹 Real-time treatment simulation on your face</li>
                            <li>✅ Face detection: {faceDetected ? "Detected" : "Searching..."}</li>
                            <li>🎭 Multiple treatment effects supported</li>
                            <li>📸 Capture and save your preview</li>
                          </ul>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="ar" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* View Mode Selector */}
                        <div className="mb-4 flex gap-2">
                          {(["front", "side", "profile"] as const).map((mode) => (
                            <Button
                              key={mode}
                              variant={viewMode === mode ? "default" : "outline"}
                              size="sm"
                              onClick={() => setViewMode(mode)}
                              className="flex-1 capitalize"
                            >
                              {mode}
                            </Button>
                          ))}
                        </div>

                        <ARVisualization
                          image={analysisImage}
                          treatment={showMultiTreatment ? selectedTreatments.join(",") : selectedTreatment}
                          intensity={intensity[0]}
                          viewMode={viewMode}
                          multiTreatment={showMultiTreatment}
                        />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="live" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <LiveCameraAR
                          treatment={showMultiTreatment ? selectedTreatments.join(",") : selectedTreatment}
                          intensity={intensity[0]}
                          onCapture={(imageData) => {
                            sessionStorage.setItem("analysisImage", imageData)
                            setAnalysisImage(imageData)
                          }}
                        />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="comparison" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <BeforeAfterSlider
                          beforeImage={analysisImage || ""}
                          afterImage={analysisImage || ""} // Would be AR-processed image in real app
                        />
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Interactive Comparison
                          </h4>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>🖱️ Drag the slider to compare before and after</li>
                            <li>🔍 Click fullscreen for immersive view</li>
                            <li>💾 Download combined image for reference</li>
                          </ul>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="interactive" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Interactive3DViewer
                          image={analysisImage || ""}
                          treatment={showMultiTreatment ? selectedTreatments.join(",") : selectedTreatment}
                          intensity={intensity[0]}
                        />
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">Interactive 3D Controls</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>
                              🖱️ <strong>Drag</strong> to rotate 360° (Mouse or Touch)
                            </li>
                            <li>
                              🔍 <strong>Zoom</strong> slider to adjust size (50-200%)
                            </li>
                            <li>
                              ⚡ Toggle <strong>Auto-rotate</strong> for animated preview
                            </li>
                            <li>📐 Quick angle presets: Front, Left, Right, 3/4 view</li>
                          </ul>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="3d" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center">
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Sparkles className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="mb-2 text-xl font-bold">3D Face Mapping</h3>
                          <p className="mb-6 text-muted-foreground">
                            Interactive 3D face model with depth mapping and multi-angle visualization
                            <br />
                            โมเดลใบหน้า 3D แบบอินเทอร์แอคทีฟพร้อมการแมปความลึกและการแสดงผลหลายมุม
                          </p>
                          <div className="mx-auto grid max-w-md gap-3 text-sm">
                            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span>Real-time 3D rotation control / หมุนโมเดล 3D แบบเรียลไทม์</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span>Depth mapping visualization / แสดงผลความลึกของใบหน้า</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span>Treatment area highlighting / ไฮไลท์พื้นที่รักษา</span>
                            </div>
                          </div>
                          <Button size="lg" className="mt-6">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Upgrade for 3D Features
                          </Button>
                        </div>
                      </motion.div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="shrink-0 bg-yellow-500/20 text-yellow-700" variant="secondary">
                        Preview Only
                      </Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This is a simulated preview. Actual results may vary. Consult with a professional for accurate
                        expectations.
                        <br />
                        นี่เป็นการจำลองเท่านั้น ผลลัพธ์จริงอาจแตกต่าง ปรึกษาผู้เชี่ยวชาญเพื่อความคาดหวังที่แม่นยำ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Upgrade CTA */}
              <Card className="mt-6 border-2 border-primary bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold">Unlock Advanced AR Features</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Premium users get high-resolution AR, multiple treatment combinations, and 3D face mapping
                        <br />
                        ผู้ใช้ Premium ได้รับ AR ความละเอียดสูง การรวมการรักษาหลายแบบ และการแมปใบหน้า 3D
                      </p>
                    </div>
                    <Button size="lg" className="shrink-0">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function getTreatmentInfo(treatment: string): string {
  const info: Record<string, string> = {
    botox:
      "Botox reduces wrinkles by relaxing facial muscles. Results last 3-6 months. / โบท็อกซ์ลดริ้วรอยโดยผ่อนคลายกล้ามเนื้อใบหน้า ผลคงอยู่ 3-6 เดือน",
    filler:
      "Dermal fillers add volume and smooth lines. Results last 6-18 months. / ฟิลเลอร์เพิ่มปริมาตรและทำให้เส้นเรียบ ผลคงอยู่ 6-18 เดือน",
    laser:
      "Laser treatment improves skin texture and pigmentation. Multiple sessions recommended. / เลเซอร์ปรับปรุงพื้นผิวและสีผิว แนะนำหลายครั้ง",
    peel: "Chemical peels remove dead skin and improve tone. Downtime 3-7 days. / พีลลิ่งเคมีขจัดเซลล์ผิวที่ตายและปรับสีผิว พักฟื้น 3-7 วัน",
    microneedling:
      "Microneedling stimulates collagen production. Minimal downtime. / ไมโครนีดดลิ้งกระตุ้นการผลิตคอลลาเจน พักฟื้นน้อย",
    thread:
      "Thread lift provides instant lifting without surgery. Results last 1-2 years. / ยกกระชับด้วยด้ายให้ผลทันทีโดยไม่ผ่าตัด ผลคงอยู่ 1-2 ปี",
  }
  return info[treatment] || "Select a treatment to see details / เลือกการรักษาเพื่อดูรายละเอียด"
}
