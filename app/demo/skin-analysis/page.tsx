"use client"

import React, { useEffect, useRef, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Image as ImageIcon, Sparkles, Eraser, RotateCcw } from "lucide-react"

export default function SkinAnalysisDemoPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [intensity, setIntensity] = useState(0.6)
  const [threshold, setThreshold] = useState(0.35)
  const [showOverlay, setShowOverlay] = useState(true)

  const imgRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)

  const exampleSrc = 
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=960&auto=format&fit=crop" // portrait example

  useEffect(() => {
    if (!imageUrl) return
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (!canvasRef.current || !overlayRef.current) return
      const canvas = canvasRef.current
      const overlay = overlayRef.current
      const ctx = canvas.getContext("2d")!
      const octx = overlay.getContext("2d")!
      // Fit image into max width
      const maxW = 900
      const scale = Math.min(1, maxW / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      canvas.width = w
      canvas.height = h
      overlay.width = w
      overlay.height = h
      ctx.drawImage(img, 0, 0, w, h)
      analyze(w, h)
      setLoading(false)
    }
    img.onerror = () => setLoading(false)
    setLoading(true)
    img.src = imageUrl
    imgRef.current = img
  }, [imageUrl])

  useEffect(() => {
    if (!canvasRef.current || !overlayRef.current) return
    const { width, height } = canvasRef.current
    if (width && height) analyze(width, height)
  }, [intensity, threshold, showOverlay])

  const onFile = (f: File) => {
    const url = URL.createObjectURL(f)
    setImageUrl(url)
  }

  const clearAll = () => {
    setImageUrl(null)
    if (canvasRef.current) {
      const c = canvasRef.current
      const ctx = c.getContext("2d")!
      ctx.clearRect(0, 0, c.width, c.height)
    }
    if (overlayRef.current) {
      const o = overlayRef.current
      const octx = o.getContext("2d")!
      octx.clearRect(0, 0, o.width, o.height)
    }
  }

  function analyze(w: number, h: number) {
    if (!canvasRef.current || !overlayRef.current) return
    const base = canvasRef.current.getContext("2d")!
    const overlay = overlayRef.current.getContext("2d")!

    const imgData = base.getImageData(0, 0, w, h)
    const data = imgData.data

    // Grayscale
    const gray = new Uint8ClampedArray(w * h)
    for (let i = 0; i < w * h; i++) {
      const r = data[i * 4]
      const g = data[i * 4 + 1]
      const b = data[i * 4 + 2]
      gray[i] = (0.2989 * r + 0.587 * g + 0.114 * b) as number
    }

    // Simple edge via Sobel
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
    const mag = new Float32Array(w * h)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let gx = 0,
          gy = 0
        let k = 0
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const idx = (y + j) * w + (x + i)
            const gval = gray[idx]
            gx += gval * sobelX[k]
            gy += gval * sobelY[k]
            k++
          }
        }
        const m = Math.sqrt(gx * gx + gy * gy)
        mag[y * w + x] = m
      }
    }

    // Normalize
    let maxM = 1
    for (let i = 0; i < mag.length; i++) if (mag[i] > maxM) maxM = mag[i]

    overlay.clearRect(0, 0, w, h)
    if (!showOverlay) return

    // Draw edge heatmap + simple spot detection
    const edgeAlpha = 0.25 * intensity
    const spotAlpha = 0.35 * intensity

    // heatmap
    const heat = overlay.createImageData(w, h)
    for (let i = 0; i < w * h; i++) {
      const v = mag[i] / maxM
      const a = Math.min(255, Math.max(0, v * 255 * edgeAlpha))
      // cool-to-warm map: blue -> cyan -> yellow -> red
      const r = Math.min(255, v * 50 + v * v * 205)
      const g = Math.min(255, v * 200)
      const b = Math.min(255, 255 - v * 180)
      heat.data[i * 4] = r
      heat.data[i * 4 + 1] = g
      heat.data[i * 4 + 2] = b
      heat.data[i * 4 + 3] = a
    }
    overlay.putImageData(heat, 0, 0)

    // simple local contrast as spot proxy
    const win = 3
    overlay.globalCompositeOperation = "lighter"
    overlay.fillStyle = `hsla(350, 85%, 55%, ${spotAlpha})`
    for (let y = win; y < h - win; y += 2) {
      for (let x = win; x < w - win; x += 2) {
        let s = 0
        let c = 0
        for (let j = -win; j <= win; j++) {
          for (let i = -win; i <= win; i++) {
            const idx = (y + j) * w + (x + i)
            s += gray[idx]
            c++
          }
        }
        const mean = s / c
        const center = gray[y * w + x]
        const diff = Math.abs(center - mean) / 255
        if (diff > threshold) {
          overlay.beginPath()
          overlay.arc(x, y, 1.4 + diff * 2.4, 0, Math.PI * 2)
          overlay.fill()
        }
      }
    }
    overlay.globalCompositeOperation = "source-over"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8 text-center">
            <Badge className="mb-3 bg-primary/10 text-primary" variant="secondary">
              <Sparkles className="mr-2 h-3 w-3" /> Interactive Demo (Mock)
            </Badge>
            <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Skin Analysis — Instant Preview</h1>
            <p className="text-muted-foreground">อัปโหลดภาพใบหน้าหรือใช้ภาพตัวอย่าง ระบบจะแสดง heatmap ขอบผิวและจุดที่มีคอนทราสต์สูง (mock)</p>
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <Card className="overflow-hidden border-2">
                <CardHeader>
                  <CardTitle>ภาพตัวอย่าง</CardTitle>
                  <CardDescription>รองรับไฟล์ jpg/png | ประมวลผลบนเบราว์เซอร์</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) onFile(f)
                        }}
                      />
                      <Button variant="outline" className="bg-transparent">
                        <ImageIcon className="mr-2 h-4 w-4" /> อัปโหลดภาพ
                      </Button>
                    </label>
                    <Button variant="secondary" onClick={() => setImageUrl(exampleSrc)}>
                      ใช้ภาพตัวอย่าง
                    </Button>
                    <Button variant="ghost" onClick={clearAll}>
                      <RotateCcw className="mr-2 h-4 w-4" /> ล้าง
                    </Button>
                  </div>

                  <div className="mt-6 relative w-full overflow-auto rounded-lg border">
                    <canvas ref={canvasRef} className="block max-w-full" />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        กำลังประมวลผล...
                      </div>
                    )}
                    <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 mix-blend-screen" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>ตั้งค่าเอฟเฟกต์</CardTitle>
                  <CardDescription>ปรับค่าการแสดงผลของ heatmap และจุดคอนทราสต์</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>ความเข้ม (intensity)</span>
                      <span className="text-muted-foreground">{intensity.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[intensity]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={(v) => setIntensity(v[0])}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>เกณฑ์จุดคอนทราสต์ (threshold)</span>
                      <span className="text-muted-foreground">{threshold.toFixed(2)}</span>
                    </div>
                    <Slider value={[threshold]} min={0.1} max={0.7} step={0.05} onValueChange={(v) => setThreshold(v[0])} />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={showOverlay ? "default" : "outline"}
                      onClick={() => setShowOverlay((s) => !s)}
                    >
                      {showOverlay ? <Eraser className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {showOverlay ? "ซ่อน Overlay" : "แสดง Overlay"}
                    </Button>
                  </div>

                  <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                    หมายเหตุ: เดโมนี้เป็น <strong>mock</strong> เพื่อสื่อสารแนวคิดเท่านั้น ไม่ใช่ผลวิเคราะห์ทางการแพทย์
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
