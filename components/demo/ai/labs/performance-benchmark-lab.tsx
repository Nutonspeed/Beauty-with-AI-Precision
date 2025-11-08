'use client'

import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { generateRealHeatmap, overlayHeatmapOnImage } from '@/lib/ai/heatmap-generator'
import { getSkinConcernDetector } from '@/lib/ai/models/skin-concern-detector'
import { CheckCircle2, Clock, MemoryStick, Play, Target, Upload, XCircle } from 'lucide-react'

type TestResult = {
  name: string
  time: number
  detections: number
  confidence: number
  status: 'pass' | 'fail'
}

/**
 * Lab: Performance Benchmark (legacy /test-ai-performance)
 */
export function PerformanceBenchmarkLab() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [totalTime, setTotalTime] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        setImageLoaded(true)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const runTests = async () => {
    const canvas = canvasRef.current
    const heatmapCanvas = heatmapCanvasRef.current
    if (!canvas || !heatmapCanvas) return

    setIsLoading(true)
    setTestResults([])
    setTotalTime(0)

    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const results: TestResult[] = []

      const detector = await getSkinConcernDetector()

      const runSingleTest = async (
        name: string,
        fn: (data: ImageData) => Promise<Array<{ confidence: number }>>,
        threshold: number,
      ) => {
        const startTime = performance.now()
        const detections = await fn(imageData)
        const endTime = performance.now()

        const time = endTime - startTime
        const confidence =
          detections.length > 0
            ? detections.reduce((sum, item) => sum + item.confidence, 0) / detections.length
            : 0

        results.push({
          name,
          time,
          detections: detections.length,
          confidence,
          status: time < threshold ? 'pass' : 'fail',
        })
        setTestResults([...results])
        return detections
      }

      const wrinkles = await runSingleTest('Wrinkle Detection', detector.detectWrinkles, 500)
      const pigmentation = await runSingleTest('Pigmentation Detection', detector.detectPigmentation, 500)
      const pores = await runSingleTest('Pore Detection', detector.detectPores, 500)
      const redness = await runSingleTest('Redness Detection', detector.detectRedness, 500)

      const allConcerns = [...wrinkles, ...pigmentation, ...pores, ...redness]
      const startTime = performance.now()
      const heatmap = generateRealHeatmap(allConcerns as any, {
        width: canvas.width,
        height: canvas.height,
        concernType: 'all',
        opacity: 0.7,
        blurRadius: 30,
        colorScheme: 'thermal',
      })
      const endTime = performance.now()

      results.push({
        name: 'Heatmap Generation',
        time: endTime - startTime,
        detections: 1,
        confidence: 1,
        status: endTime - startTime < 200 ? 'pass' : 'fail',
      })
      setTestResults([...results])

      const overlaid = overlayHeatmapOnImage(imageData, heatmap, 'multiply', 0.6)
      heatmapCanvas.width = canvas.width
      heatmapCanvas.height = canvas.height
      const heatmapCtx = heatmapCanvas.getContext('2d')
      heatmapCtx?.putImageData(overlaid, 0, 0)

      setTotalTime(results.reduce((sum, item) => sum + item.time, 0))
    } catch (error) {
      console.error('Performance test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTestImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f0d5c4')
    gradient.addColorStop(0.5, '#e8c7b0')
    gradient.addColorStop(1, '#d4a88c')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 30 - 15
      imageData.data[i] += noise
      imageData.data[i + 1] += noise
      imageData.data[i + 2] += noise
    }
    ctx.putImageData(imageData, 0, 0)

    setImageLoaded(true)
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center">
        <h2 className="text-3xl font-bold">AI Performance Testing</h2>
        <p className="text-muted-foreground">วัดประสิทธิภาพการตรวจจับ + การสร้าง Heatmap</p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">Phase 12</Badge>
          <Badge variant="outline">Real AI Models</Badge>
          <Badge variant="outline">Heuristic Detection</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Test Image
          </CardTitle>
          <CardDescription>อัปโหลดภาพจริงหรือสร้างข้อมูลจำลองสำหรับทดสอบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              aria-label="เลือกไฟล์ภาพสำหรับทดสอบ"
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
            />
            <Button onClick={generateTestImage} variant="outline">
              Generate Test Image
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <figure>
              <figcaption className="mb-2 text-sm font-medium">Original Image</figcaption>
              <canvas ref={canvasRef} className="max-h-[300px] w-full rounded-lg border bg-muted" />
            </figure>
            <figure>
              <figcaption className="mb-2 text-sm font-medium">Heatmap Result</figcaption>
              <canvas
                ref={heatmapCanvasRef}
                className="max-h-[300px] w-full rounded-lg border bg-muted"
              />
            </figure>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Performance Tests
          </CardTitle>
          <CardDescription>ประมวลผลทุกอัลกอริทึมและวัดเวลา</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={!imageLoaded || isLoading} className="w-full" size="lg">
            {isLoading ? 'Running Tests...' : 'Start Tests'}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>สรุปประสิทธิภาพของแต่ละอัลกอริทึม</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result) => (
              <div key={result.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.status === 'pass' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {result.time.toFixed(2)}ms
                    </span>
                    <span>Detections: {result.detections}</span>
                    <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <ProgressBar
                  value={(result.time / 500) * 100}
                  className={result.status === 'pass' ? 'bg-green-100' : 'bg-red-100'}
                />
              </div>
            ))}

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Time</span>
                <span>{totalTime.toFixed(2)}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Target</span>
                <span className={totalTime < 2000 ? 'text-green-500' : 'text-red-500'}>
                  {'<'}2000ms {totalTime < 2000 ? '✅ PASS' : '❌ FAIL'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Detections</span>
                <span>{testResults.reduce((sum, item) => sum + item.detections, 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Confidence</span>
                <span>
                  {(
                    (testResults.reduce((sum, item) => sum + item.confidence, 0) / testResults.length) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            ข้อมูลเพิ่มเติม
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Heuristic Detection:</strong> ใช้ edge detection, color analysis และ texture analysis แทน ML Models
          </p>
          <p>
            <strong>Expected Performance:</strong> 100-200ms ต่อขั้นตอน ความแม่นยำ 60-70%
          </p>
          <p>
            <strong>Real ML Models:</strong> คาดว่าจะให้ความแม่นยำกว่า 85% เมื่อมี dataset สำหรับ train
          </p>
          <p>
            <strong>Next Steps:</strong> ดูไฟล์ PHASE12_AI_MODELS_README.md สำหรับแผนการ train models
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
