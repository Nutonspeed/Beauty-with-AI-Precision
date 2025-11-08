'use client'

import { useRef, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getAIPipeline, type CompleteAnalysisResult } from '@/lib/ai/pipeline'
import { Activity, AlertCircle, Camera, CheckCircle2, Upload, XCircle, Zap } from 'lucide-react'

/**
 * Lab: Full Pipeline Analysis (legacy /ai-test)
 */
export function PipelineAnalysisLab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<CompleteAnalysisResult | null>(null)
  const [error, setError] = useState<string>('')
  const [initStatus, setInitStatus] = useState<'idle' | 'initializing' | 'ready' | 'error'>('idle')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pipeline = getAIPipeline()

  const handleInitialize = async () => {
    setInitStatus('initializing')
    setError('')

    try {
      await pipeline.initialize()
      setInitStatus('ready')
    } catch (err) {
      setInitStatus('error')
      setError(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setResult(null)
    setError('')

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    if (initStatus !== 'ready') {
      setError('Please initialize AI models first')
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setError('')

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const analysisResult = await pipeline.analyzeWithQualityCheck(selectedFile)

      clearInterval(progressInterval)
      setProgress(100)

      if (analysisResult.qualityIssues) {
        setError(`Image quality issues: ${analysisResult.qualityIssues.join(', ')}`)
      } else if (analysisResult.result) {
        setResult(analysisResult.result)

        if (canvasRef.current && previewUrl) {
          drawLandmarks(analysisResult.result)
        }
      }
    } catch (err) {
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const drawLandmarks = async (analysisResult: CompleteAnalysisResult) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      ctx.fillStyle = '#00ff00'
      analysisResult.faceDetection.landmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width
        const y = landmark.y * canvas.height

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()
      })

      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 2
      const bbox = analysisResult.faceDetection.boundingBox
      ctx.strokeRect(
        bbox.xMin * canvas.width,
        bbox.yMin * canvas.height,
        bbox.width * canvas.width,
        bbox.height * canvas.height,
      )
    }
    img.src = previewUrl
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">🧪 AI Analysis Lab</h1>
        <p className="text-muted-foreground">
          Validate MediaPipe face detection and TensorFlow.js skin analysis end-to-end
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Initialize AI Models</CardTitle>
          <CardDescription>
            Load MediaPipe FaceMesh and TensorFlow.js models (one-time setup)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleInitialize}
              disabled={initStatus === 'initializing' || initStatus === 'ready'}
              variant={initStatus === 'ready' ? 'outline' : 'default'}
            >
              <Zap className="mr-2 h-4 w-4" />
              {initStatus === 'idle' && 'Initialize AI'}
              {initStatus === 'initializing' && 'Initializing...'}
              {initStatus === 'ready' && 'Ready ✓'}
              {initStatus === 'error' && 'Retry'}
            </Button>

            {initStatus === 'ready' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Models Loaded
              </Badge>
            )}
            {initStatus === 'error' && (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Failed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Upload Face Image</CardTitle>
          <CardDescription>Select a clear frontal face photo for analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              aria-label="Upload face image"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>

            {selectedFile && (
              <Badge variant="secondary">
                <Camera className="mr-1 h-3 w-3" />
                {selectedFile.name}
              </Badge>
            )}
          </div>

          {previewUrl && (
            <div className="relative max-w-md overflow-hidden rounded-lg border">
              <img src={previewUrl} alt="Preview" className="h-auto w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Run Analysis</CardTitle>
          <CardDescription>Detect 468 face landmarks and analyze skin concerns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || initStatus !== 'ready' || isAnalyzing}
            size="lg"
          >
            <Activity className="mr-2 h-5 w-5" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Face'}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">Processing: {progress}%</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Face Detection Result</CardTitle>
              <CardDescription>468 landmarks (green) + bounding box (red)</CardDescription>
            </CardHeader>
            <CardContent>
              <canvas ref={canvasRef} className="max-w-full rounded-lg border" />
            </CardContent>
          </Card>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>⚡ Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Processing Time:</span>
                  <Badge>{result.totalProcessingTime.toFixed(0)}ms</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Face Detection:</span>
                  <Badge variant="secondary">
                    {result.faceDetection.processingTime.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Skin Analysis:</span>
                  <Badge variant="secondary">
                    {result.skinAnalysis.processingTime.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <Badge variant={result.totalProcessingTime < 500 ? 'default' : 'destructive'}>
                    {'<'} 500ms {result.totalProcessingTime < 500 ? '✓' : '✗'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Image Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall Score:</span>
                  <Badge>{result.qualityReport.score.toFixed(0)}/100</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Blur:</span>
                  <Badge variant="secondary">
                    {result.qualityReport.metrics.blur.toFixed(0)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Brightness:</span>
                  <Badge variant="secondary">
                    {result.qualityReport.metrics.brightness.toFixed(0)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Sharpness:</span>
                  <Badge variant="secondary">
                    {result.qualityReport.metrics.sharpness.toFixed(0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🔬 Skin Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Overall Skin Score:</span>
                <Badge
                  variant={result.skinAnalysis.overallScore > 70 ? 'default' : 'destructive'}
                  className="text-lg"
                >
                  {result.skinAnalysis.overallScore.toFixed(0)}/100
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Detected Concerns:</h4>
                {result.skinAnalysis.concerns.length > 0 ? (
                  result.skinAnalysis.concerns.map((concern: any, index: number) => (
                    <div key={index} className="flex items-center justify-between rounded bg-muted p-2">
                      <span className="capitalize">{concern.type.replace('_', ' ')}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Severity: {concern.severity.toFixed(0)}</Badge>
                        <Badge variant="outline">
                          Confidence: {(concern.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No major concerns detected! ✨</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">VISIA Metrics:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.skinAnalysis.visiaMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between rounded bg-muted p-2 text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-semibold">{(value as number).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations:</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {result.skinAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔧 Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Landmarks Detected:</span>
                <span className="font-mono">{result.faceDetection.landmarks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Detection Confidence:</span>
                <span className="font-mono">{(result.faceDetection.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Analysis Timestamp:</span>
                <span className="font-mono">{result.timestamp.toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
