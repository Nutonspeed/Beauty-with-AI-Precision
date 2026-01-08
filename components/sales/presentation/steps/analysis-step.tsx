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

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const startAnalysis = useCallback(async () => {
    if (!images.front) {
      setError(t('salesWizard.steps.analysis.frontImageRequired'))
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
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsAnalyzing(false)
    }
  }, [images.front, onAnalysisComplete, t])

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
                <h3 className="text-lg font-semibold">{t('salesWizard.steps.analysis.analyzingTitle', { name: customerName })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('salesWizard.steps.analysis.analyzingDesc')}
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {t('salesWizard.steps.analysis.percentComplete', { percent: progress })}
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
          {t('salesWizard.steps.analysis.retryAnalysis')}
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
            {t('salesWizard.steps.analysis.readyAlert', { name: customerName })}
          </AlertDescription>
        </Alert>
        <Button onClick={startAnalysis} className="w-full gap-2" size="lg">
          <Sparkles className="h-5 w-5" />
          {t('salesWizard.steps.analysis.startAIAnalysis')}
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
            {t('salesWizard.steps.analysis.healthScoreTitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{skinAge}</p>
              <p className="text-xs text-muted-foreground">{t('salesWizard.steps.analysis.skinAgeLabel')}</p>
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
                {ageDifference > 0 ? t('salesWizard.steps.analysis.yearsOlder') : t('salesWizard.steps.analysis.yearsYounger')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skin Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('salesWizard.steps.analysis.skinConditionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-base px-4 py-2">
              {skinCondition}
            </Badge>
            <Badge variant="secondary">
              {t('salesWizard.steps.analysis.confidenceLabel', { percent: (confidence * 100).toFixed(0) })}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('salesWizard.steps.analysis.severityLabel')}</span>
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
            {t('salesWizard.steps.analysis.visiaTitle')}
          </CardTitle>
          <CardDescription>
            {t('salesWizard.steps.analysis.visiaDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { key: 'spots', label: t('analysis.modes.spots'), icon: '⚫' },
              { key: 'wrinkles', label: t('analysis.modes.wrinkles'), icon: '📏' },
              { key: 'texture', label: t('analysis.modes.texture'), icon: '🔲' },
              { key: 'pores', label: t('analysis.modes.pores'), icon: '🔴' },
              { key: 'uvSpots', label: t('analysis.modes.uv_spots'), icon: '☀️' },
              { key: 'redAreas', label: t('analysis.modes.red_areas'), icon: '🔴' },
              { key: 'hydration', label: t('analysis.results.hydration'), icon: '💧' },
              { key: 'evenness', label: t('analysis.results.evenness'), icon: '✨' },
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
            {t('salesWizard.steps.analysis.recommendationsTitle')}
          </CardTitle>
          <CardDescription>
            {t('salesWizard.steps.analysis.recommendationsDesc', { name: customerName })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              // Support both legacy string[] and new object[] format
              const item = typeof rec === 'string' ? { text: rec, confidence: 0.8, priority: 'medium' as const } : rec
              const confidencePct = Math.round(item.confidence * 100)
              let priorityColor = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              if (item.priority === 'high') {
                priorityColor = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              } else if (item.priority === 'medium') {
                priorityColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
              }
              return (
                <Alert
                  key={`rec-${item.text.substring(0, 28)}-${index}`}
                  className="bg-green-50 dark:bg-green-950/20 border-green-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-900 dark:text-green-100 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{item.text}</span>
                      <Badge className={"text-[10px] px-2 py-0.5 font-semibold " + priorityColor}>
                        {item.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {confidencePct}%
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Offline Warning */}
      {!isOnline && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {t('salesWizard.steps.analysis.offlineWarning')}
          </AlertDescription>
        </Alert>
      )}

      {/* Export Button */}
      <Button variant="outline" className="w-full gap-2">
        <FileText className="h-4 w-4" />
        {t('salesWizard.steps.analysis.exportReport')}
      </Button>
    </div>
  )
}
