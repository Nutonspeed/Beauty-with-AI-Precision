"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2 } from "lucide-react"
import { getAIPipeline } from "@/lib/ai/pipeline"
import { getWorkerAIPipeline } from "@/lib/ai/worker-pipeline"

interface PerformanceResult {
  method: string
  totalTime: number
  faceDetectionTime: number
  skinAnalysisTime: number
  landmarks: number
  overallScore: number
  uiBlocked: boolean
}

export default function WorkerTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isTestingMain, setIsTestingMain] = useState(false)
  const [isTestingWorker, setIsTestingWorker] = useState(false)
  const [mainThreadResult, setMainThreadResult] = useState<PerformanceResult | null>(null)
  const [workerResult, setWorkerResult] = useState<PerformanceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Reset results when new file selected
      setMainThreadResult(null)
      setWorkerResult(null)
      setError(null)
    }
  }

  const testMainThread = async () => {
    if (!selectedFile) return

    setIsTestingMain(true)
    setError(null)

    try {
      console.log("🧪 Testing Main Thread Pipeline...")
      const startTime = performance.now()
      
      const pipeline = getAIPipeline()
      await pipeline.initialize()
      
      const { result } = await pipeline.analyzeWithQualityCheck(selectedFile)
      
      if (!result) {
        throw new Error("Analysis failed - quality check did not pass")
      }

      const totalTime = performance.now() - startTime

      setMainThreadResult({
        method: "Main Thread",
        totalTime: Math.round(totalTime),
        faceDetectionTime: result.faceDetection.processingTime,
        skinAnalysisTime: result.skinAnalysis.processingTime,
        landmarks: result.faceDetection.landmarks.length,
        overallScore: result.skinAnalysis.overallScore,
        uiBlocked: true, // Main thread blocks UI
      })

      console.log(`✅ Main Thread completed in ${totalTime.toFixed(0)}ms`)
    } catch (err) {
      console.error("❌ Main Thread error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsTestingMain(false)
    }
  }

  const testWorker = async () => {
    if (!selectedFile) return

    setIsTestingWorker(true)
    setError(null)

    try {
      console.log("🧪 Testing Web Worker Pipeline...")
      const startTime = performance.now()
      
      const pipeline = getWorkerAIPipeline()
      await pipeline.initialize()
      
      const { result } = await pipeline.analyzeWithQualityCheck(selectedFile)
      
      if (!result) {
        throw new Error("Analysis failed - quality check did not pass")
      }

      const totalTime = performance.now() - startTime

      setWorkerResult({
        method: "Web Worker",
        totalTime: Math.round(totalTime),
        faceDetectionTime: result.faceDetection.processingTime,
        skinAnalysisTime: result.skinAnalysis.processingTime,
        landmarks: result.faceDetection.landmarks.length,
        overallScore: result.skinAnalysis.overallScore,
        uiBlocked: false, // Workers don't block UI
      })

      console.log(`✅ Web Worker completed in ${totalTime.toFixed(0)}ms`)
    } catch (err) {
      console.error("❌ Web Worker error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsTestingWorker(false)
    }
  }

  const testBoth = async () => {
    await testMainThread()
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testWorker()
  }

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Web Worker Performance Test</h1>
        <p className="text-muted-foreground">
          Compare AI processing: Main Thread vs Web Workers
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* File Upload */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>1. Upload Test Image</CardTitle>
          <CardDescription>Select a face image to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedImage ? (
            <div
              className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-center text-sm font-medium">
                Click to upload test image
              </p>
              <p className="text-center text-xs text-muted-foreground">
                PNG, JPG or JPEG (MAX. 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload test image"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <img src={selectedImage} alt="Selected" className="h-full w-full object-contain" />
              </div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose Different Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      {selectedFile && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. Run Performance Tests</CardTitle>
            <CardDescription>Compare processing methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={testMainThread} 
                disabled={isTestingMain || isTestingWorker}
                variant="outline"
              >
                {isTestingMain ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Main Thread...
                  </>
                ) : (
                  "Test Main Thread"
                )}
              </Button>

              <Button 
                onClick={testWorker} 
                disabled={isTestingMain || isTestingWorker}
                variant="outline"
              >
                {isTestingWorker ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Web Worker...
                  </>
                ) : (
                  "Test Web Worker"
                )}
              </Button>

              <Button 
                onClick={testBoth} 
                disabled={isTestingMain || isTestingWorker}
              >
                {isTestingMain || isTestingWorker ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  "Test Both (Recommended)"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Comparison */}
      {(mainThreadResult || workerResult) && (
        <Card>
          <CardHeader>
            <CardTitle>3. Performance Results</CardTitle>
            <CardDescription>Processing time comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Main Thread Result */}
              {mainThreadResult && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Main Thread</h3>
                    <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-700">
                      UI BLOCKED ❌
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Time:</span>
                      <span className="font-mono font-semibold">{mainThreadResult.totalTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Face Detection:</span>
                      <span className="font-mono">{mainThreadResult.faceDetectionTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Skin Analysis:</span>
                      <span className="font-mono">{mainThreadResult.skinAnalysisTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Landmarks:</span>
                      <span className="font-mono">{mainThreadResult.landmarks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overall Score:</span>
                      <span className="font-mono">{mainThreadResult.overallScore}</span>
                    </div>
                  </div>

                  <div className="rounded bg-orange-500/10 p-3 text-xs text-orange-700">
                    ⚠️ UI freezes during processing. User cannot interact with the page.
                  </div>
                </div>
              )}

              {/* Web Worker Result */}
              {workerResult && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Web Worker</h3>
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-700">
                      UI FREE ✅
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Time:</span>
                      <span className="font-mono font-semibold">{workerResult.totalTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Face Detection:</span>
                      <span className="font-mono">{workerResult.faceDetectionTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Skin Analysis:</span>
                      <span className="font-mono">{workerResult.skinAnalysisTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Landmarks:</span>
                      <span className="font-mono">{workerResult.landmarks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overall Score:</span>
                      <span className="font-mono">{workerResult.overallScore}</span>
                    </div>
                  </div>

                  <div className="rounded bg-green-500/10 p-3 text-xs text-green-700">
                    ✅ UI remains responsive. User can scroll, click, and interact during processing.
                  </div>
                </div>
              )}
            </div>

            {/* Comparison Summary */}
            {mainThreadResult && workerResult && (
              <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <h4 className="mb-3 font-semibold text-blue-700">Comparison Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time Difference:</span>
                    <span className="font-mono">
                      {workerResult.totalTime > mainThreadResult.totalTime ? '+' : ''}
                      {(workerResult.totalTime - mainThreadResult.totalTime)}ms
                      {' '}
                      ({(((workerResult.totalTime - mainThreadResult.totalTime) / mainThreadResult.totalTime) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>UI Responsiveness:</span>
                    <span className="font-semibold text-green-700">
                      Web Worker is {mainThreadResult.uiBlocked && !workerResult.uiBlocked ? 'MUCH' : ''} better ✨
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Results Accuracy:</span>
                    <span className="font-mono">
                      {mainThreadResult.landmarks === workerResult.landmarks && 
                       mainThreadResult.overallScore === workerResult.overallScore 
                        ? '100% Identical ✅' 
                        : 'Different results ⚠️'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-blue-500/20 pt-4 text-xs text-blue-700">
                  💡 <strong>Key Insight:</strong> Web Workers may have slight overhead (~50-200ms) but provide 
                  significantly better user experience by keeping the UI responsive during heavy processing.
                  For production apps, non-blocking UI is essential for professional UX.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Upload a face image (ideally a front-facing portrait)</p>
            <p>2. Click "Test Both" to run both pipelines sequentially</p>
            <p>3. Observe the performance metrics and UI responsiveness</p>
            <p>4. <strong>Try interacting with the page during processing</strong> to feel the difference!</p>
            <p className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-blue-700">
              💡 <strong>Pro Tip:</strong> During Main Thread test, try scrolling or clicking buttons - 
              you'll notice the UI is frozen. During Web Worker test, the UI stays responsive!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
