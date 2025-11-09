"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Camera, X, Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { resizeImage, compressImage } from "@/lib/image-optimizer"
import { CameraPositioningGuide } from "@/components/camera-positioning-guide"
import { validateImageQuality, getQualityFeedback } from "@/lib/image-quality-validator"
import { NotificationManager } from "@/lib/notifications/notification-manager"
import type { AnalysisMode } from "@/types"

const MODE_PROGRESS: Record<AnalysisMode, string> = {
  local: "Running local computer vision pipeline...",
  hf: "Running Hugging Face enhanced analysis...",
  auto: "Selecting fastest analysis pipeline...",
}

const MODE_LABEL: Record<AnalysisMode, string> = {
  local: "Start Local Analysis / เริ่มวิเคราะห์แบบออฟไลน์",
  hf: "Start AI Analysis / เริ่มวิเคราะห์ด้วย AI",
  auto: "Start Analysis / เริ่มการวิเคราะห์",
}

interface SkinAnalysisUploadProps {
  isLoggedIn?: boolean
  analysisMode?: AnalysisMode
}

export function SkinAnalysisUpload({ isLoggedIn = false, analysisMode = "auto" }: Readonly<SkinAnalysisUploadProps>) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<string>("")
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isPositionValid, setIsPositionValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const locale = (() => {
    const segments = pathname.split("/").filter(Boolean)
    const candidate = segments[0]?.toLowerCase()
    const supportedLocales = new Set(["th", "en"])
    return candidate && supportedLocales.has(candidate) ? candidate : "th"
  })()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setSelectedImage(imageData)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
            setSelectedFile(file)
          }
        }, "image/jpeg")

        stopCamera()
      }
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage || !selectedFile) return

    const maxBytes = 10 * 1024 * 1024
    if (selectedFile.size > maxBytes) {
      setError("File is too large. Please choose an image under 10MB.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // PHASE 1 ENHANCEMENT: Validate image quality BEFORE optimization
      setAnalysisProgress("Validating image quality...")
      
      const img = document.createElement("img")
      img.src = selectedImage
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const qualityScore = await validateImageQuality(img)
      console.log("[QUALITY] 🔍 Image Quality Score:", qualityScore)

      if (qualityScore.overall === "rejected") {
        setError(getQualityFeedback(qualityScore))
        setIsAnalyzing(false)
        return
      }

      if (qualityScore.overall === "warning") {
        console.warn("[QUALITY] ⚠️ Warning:", getQualityFeedback(qualityScore))
      }

      // Step 1: Optimize image (resize + compress)
      setAnalysisProgress("Optimizing image...")
      console.log("[OPTIMIZER] 🛠️ === OPTIMIZING IMAGE ===")
      console.log("[OPTIMIZER] 📊 Original:", {
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
        name: selectedFile.name
      })

      const resizeResult = await resizeImage(selectedFile, 1024, 1024)
      console.log("[OPTIMIZER] ✂️ Resized:", {
        dimensions: `${resizeResult.width}x${resizeResult.height}`,
        time: `${resizeResult.processingTime.toFixed(1)}ms`
      })

      const compressResult = await compressImage(resizeResult.data, { quality: 0.85 })
      console.log("[OPTIMIZER] 🗜️ Compressed:", {
        originalSize: `${(resizeResult.originalSize / 1024).toFixed(2)} KB`,
        optimizedSize: `${(compressResult.size / 1024).toFixed(2)} KB`,
        reduction: `${(((resizeResult.originalSize - compressResult.size) / resizeResult.originalSize) * 100).toFixed(1)}%`,
        time: `${compressResult.processingTime.toFixed(1)}ms`
      })

      // Step 2: Proceed with analysis using optimized image
      console.log("[HYBRID] 🔬 === STARTING HYBRID AI ANALYSIS ===")
      console.log("[HYBRID] 📊 Optimized File Info:", {
        size: `${(compressResult.size / 1024).toFixed(2)} KB`,
        quality: 85,
      })

      // Use new Hybrid AI API (Phase 1: MediaPipe + TensorFlow + HuggingFace + 6 CV algorithms)
      setAnalysisProgress(MODE_PROGRESS[analysisMode])
      console.log("[HYBRID] 🔬 Using Phase 1 Hybrid Pipeline (MediaPipe 35% + TensorFlow 40% + HuggingFace 25%)...")

      const analysisResponse = await fetch("/api/skin-analysis/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: compressResult.dataUrl, // Use optimized image
          mode: analysisMode,
          patientInfo: {
            name: "",
            age: 0,
            gender: "unknown",
            skinType: "",
          },
        }),
      })

      const analysisData = await analysisResponse.json()

      if (!analysisResponse.ok) {
        const errorMsg = `Hybrid analysis failed: ${analysisData.error || "Unknown error"}`
        setError(errorMsg)
        NotificationManager.error(
          locale === "th" ? "การวิเคราะห์ล้มเหลว" : "Analysis Failed",
          {
            description: analysisData.error || "Unknown error",
            action: {
              label: locale === "th" ? "ลองอีกครั้ง" : "Retry",
              onClick: () => {
                setError(null)
                setIsAnalyzing(false)
              },
            },
          }
        )
        setIsAnalyzing(false)
        return
      }

      console.log("[HYBRID] ✅ Hybrid analysis complete:", analysisData)
      console.log("[HYBRID] 📊 Analysis ID:", analysisData.id)
      console.log("[HYBRID] 🎯 Overall Score:", analysisData.overall_score)

      // Show success notification
      NotificationManager.analysisSaved(
        analysisData.id,
        () => router.push(`/${locale}/analysis/detail/${analysisData.id}`),
        locale
      )

      // Redirect to VISIA report (with Advanced Analysis tab)
      router.push(`/${locale}/analysis/detail/${analysisData.id}`)
    } catch (err) {
      console.error("[v0] ❌ === ANALYSIS ERROR ===")
      console.error("[v0] ❌ Error:", err)

      let errorMessage = "Unknown error"
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "string") {
        errorMessage = err
      }

      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("load MediaPipe")
      ) {
        errorMessage =
          "❌ Network Error - Cannot load AI models\n\nPlease check your internet connection.\nMediaPipe and TensorFlow need to download models from CDN.\n\n---\n\n❌ ข้อผิดพลาดเครือข่าย - ไม่สามารถโหลดโมเดล AI\n\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\nMediaPipe และ TensorFlow ต้องดาวน์โหลดโมเดลจาก CDN"
        
        // Show network error notification
        NotificationManager.networkError(locale, () => {
          setError(null)
          setIsAnalyzing(false)
        })
      } else {
        // Show generic error notification
        NotificationManager.error(
          locale === "th" ? "เกิดข้อผิดพลาด" : "An Error Occurred",
          {
            description: errorMessage,
            action: {
              label: locale === "th" ? "ลองอีกครั้ง" : "Retry",
              onClick: () => {
                setError(null)
                setIsAnalyzing(false)
              },
            },
          }
        )
      }

      setError(errorMessage)
      setIsAnalyzing(false)
      setAnalysisProgress("")
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress("")
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {analysisProgress && (
            <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {analysisProgress}
              </div>
            </div>
          )}

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" onClick={stopCamera}>
                <Upload className="mr-2 h-4 w-4" />
                Upload / อัปโหลด
              </TabsTrigger>
              <TabsTrigger value="camera" onClick={() => !selectedImage && startCamera()}>
                <Camera className="mr-2 h-4 w-4" />
                Camera / กล้อง
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              {selectedImage ? (
                <div className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image src={selectedImage || "/placeholder.svg"} alt="Selected" fill className="object-contain" />
                  </div>
                  <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={clearImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                  data-tour="upload-button"
                  type="button"
                >
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-center text-sm font-medium">
                    Click to upload or drag and drop
                    <br />
                    คลิกเพื่ออัปโหลดหรือลากและวาง
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    PNG, JPG or JPEG (MAX. 10MB)
                    <br />
                    PNG, JPG หรือ JPEG (สูงสุด 10MB)
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload face image for skin analysis"
              />
            </TabsContent>

            <TabsContent value="camera" className="mt-6">
              {selectedImage ? (
                <div className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image src={selectedImage || "/placeholder.svg"} alt="Captured" fill className="object-contain" />
                  </div>
                  <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={clearImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative min-h-[400px] overflow-hidden rounded-lg bg-black">
                  {isCameraActive ? (
                    <div className="relative">
                      {/* Hidden video for positioning guide */}
                      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                      
                      <CameraPositioningGuide
                        videoStream={streamRef.current || undefined}
                        onPositionValid={setIsPositionValid}
                        showOverlay={true}
                      />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <Button 
                          size="lg" 
                          onClick={capturePhoto} 
                          className="rounded-full"
                          disabled={!isPositionValid}
                        >
                          <Camera className="mr-2 h-5 w-5" />
                          {isPositionValid ? "Capture / ถ่ายภาพ" : "Adjust Position / จัดท่า"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[400px] flex-col items-center justify-center">
                      <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        Camera not active
                        <br />
                        กล้องยังไม่เปิด
                      </p>
                      <Button onClick={startCamera}>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera / เปิดกล้อง
                      </Button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {selectedImage && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="flex-1" onClick={handleAnalyze} disabled={isAnalyzing} data-tour="analyze-button">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {MODE_PROGRESS[analysisMode]}
                  </>
                ) : (
                  <>
                    {MODE_LABEL[analysisMode]}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={clearImage}
                disabled={isAnalyzing}
                className="bg-transparent"
              >
                Choose Different Photo / เลือกรูปใหม่
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
