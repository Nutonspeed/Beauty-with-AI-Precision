'use client'

/**
 * Analysis Step Component
 * 
 * Display AI skin analysis results with:
 * - Overall skin score
 * - Skin age vs actual age
 * - Concerns with severity indicators
 * - VISIA metrics
 * - Treatment recommendations
 * - Mobile-optimized layout
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  FileText,
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HybridAnalysisResult } from '@/lib/ai/hybrid-analyzer'

interface AnalysisStepProps {
  readonly images: {
    readonly front?: string
    readonly left?: string
    readonly right?: string
  }
  readonly analysisResults: HybridAnalysisResult | null
  readonly onAnalysisComplete: (results: HybridAnalysisResult) => void
  readonly customerName: string
  readonly isOnline: boolean
}

// Helper to convert base64 to ImageData
async function base64ToImageData(base64: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      resolve(imageData)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = base64
  })
}

export function AnalysisStep({
  images,
  analysisResults,
  onAnalysisComplete,
  customerName,
  isOnline,
}: AnalysisStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Auto-start analysis if images exist but no results
  useEffect(() => {
    if (images.front && !analysisResults && !isAnalyzing && !error) {
      startAnalysis()
    }
  }, [images.front, analysisResults, isAnalyzing, error])

  const startAnalysis = async () => {
    if (!images.front) {
      setError('Front image is required for analysis')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 300)

      // Dynamic import to reduce bundle size
      const { analyzeWithHybrid } = await import('@/lib/ai/hybrid-analyzer')

      // Convert base64 to ImageData
      const imageData = await base64ToImageData(images.front)

      // Run AI analysis
      const results = await analyzeWithHybrid(imageData, {
        mobileOptimized: true,
        useCache: true,
        focus: 'full',
        includeAdvancedFeatures: true,
      })

      clearInterval(progressInterval)
      setProgress(100)

      // Pass results to parent
      onAnalysisComplete(results)
    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Loading state
  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <Sparkles className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Analyzing {customerName}'s Skin</h3>
                <p className="text-sm text-muted-foreground">
                  AI is processing facial features and skin conditions...
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={startAnalysis} className="w-full gap-2">
          <Sparkles className="h-4 w-4" />
          Retry Analysis
        </Button>
      </div>
    )
  }

  // No results yet
  if (!analysisResults) {
    return (
      <div className="space-y-6">
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
            Ready to analyze {customerName}'s skin. This will take 10-15 seconds.
          </AlertDescription>
        </Alert>
        <Button onClick={startAnalysis} className="w-full gap-2" size="lg">
          <Sparkles className="h-5 w-5" />
          Start AI Analysis
        </Button>
      </div>
    )
  }

  // Results display
  const { overallScore, skinCondition, severity, recommendations, visiaMetrics, confidence } = analysisResults

  // Calculate skin age (simplified)
  const skinAge = Math.round(overallScore * 0.5 + 20)
  // Estimate actual age from skin condition (35 as baseline for beauty clinic customers)
  let estimatedAge = 38
  if (overallScore > 70) {
    estimatedAge = 35
  } else if (overallScore > 50) {
    estimatedAge = 32
  }
  const estimatedActualAge = Math.max(25, Math.min(60, estimatedAge))
  const ageDifference = skinAge - estimatedActualAge

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-primary">
            {overallScore.toFixed(1)}/100
          </CardTitle>
          <CardDescription className="text-base">
            Overall Skin Health Score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{skinAge}</p>
              <p className="text-xs text-muted-foreground">Skin Age</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold">{Math.abs(ageDifference)}</p>
                {ageDifference > 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {ageDifference > 0 ? 'Years Older' : 'Years Younger'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skin Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skin Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-base px-4 py-2">
              {skinCondition}
            </Badge>
            <Badge variant="secondary">
              {(confidence * 100).toFixed(0)}% confidence
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Severity</span>
              <span className="font-medium">{severity}/10</span>
            </div>
            <Progress value={severity * 10} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* VISIA Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            VISIA Skin Metrics
          </CardTitle>
          <CardDescription>
            8-point professional skin analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { key: 'spots', label: 'Spots', icon: '⚫' },
              { key: 'wrinkles', label: 'Wrinkles', icon: '📏' },
              { key: 'texture', label: 'Texture', icon: '🔲' },
              { key: 'pores', label: 'Pores', icon: '🔴' },
              { key: 'uvSpots', label: 'UV Damage', icon: '☀️' },
              { key: 'redAreas', label: 'Redness', icon: '🔴' },
              { key: 'hydration', label: 'Hydration', icon: '💧' },
              { key: 'evenness', label: 'Evenness', icon: '✨' },
            ].map((metric) => {
              const value = visiaMetrics[metric.key as keyof typeof visiaMetrics]
              return (
                <div key={metric.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{metric.icon}</span>
                      {metric.label}
                    </span>
                    <span className="font-medium">{value.toFixed(1)}/10</span>
                  </div>
                  <Progress 
                    value={value * 10} 
                    className={cn(
                      "h-1.5",
                      value >= 7 && "bg-red-100 [&>div]:bg-red-500",
                      value >= 4 && value < 7 && "bg-yellow-100 [&>div]:bg-yellow-500",
                      value < 4 && "bg-green-100 [&>div]:bg-green-500"
                    )}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Treatment Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions for {customerName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <Alert key={`rec-${rec.substring(0, 20)}-${index}`} className="bg-green-50 dark:bg-green-950/20 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-900 dark:text-green-100">
                  {rec}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offline Warning */}
      {!isOnline && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            You are offline. Results are saved locally and will sync when online.
          </AlertDescription>
        </Alert>
      )}

      {/* Export Button */}
      <Button variant="outline" className="w-full gap-2">
        <FileText className="h-4 w-4" />
        Export Analysis Report (PDF)
      </Button>
    </div>
  )
}
