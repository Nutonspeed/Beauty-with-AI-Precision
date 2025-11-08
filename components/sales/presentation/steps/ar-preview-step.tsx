'use client'

/**
 * AR Preview Step Component
 * 
 * Interactive AR treatment preview with:
 * - Before/After comparison slider
 * - Treatment selector carousel
 * - Intensity controls
 * - Multiple treatment selection
 * - Mobile-optimized controls
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  AlertCircle,
  Eye,
  Zap,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ARVisualization } from '@/components/ar-visualization'
import { BeforeAfterSlider } from '@/components/ar/before-after-slider'
import type { HybridAnalysisResult } from '@/lib/ai/hybrid-analyzer'
import { TREATMENT_OPTIONS } from '@/lib/sales/presentation-catalog'

interface ARPreviewStepProps {
  readonly image: string
  readonly analysisResults: HybridAnalysisResult | null
  readonly selectedTreatments: string[]
  readonly onUpdate: (treatments: string[]) => void
  readonly customerName: string
}

export function ARPreviewStep({
  image,
  analysisResults,
  selectedTreatments,
  onUpdate,
  customerName,
}: ARPreviewStepProps) {
  const [intensity, setIntensity] = useState(70)
  const [viewMode, setViewMode] = useState<'ar' | 'comparison'>('ar')
  const [processedImage, setProcessedImage] = useState<string | null>(null)

  // Generate processed image when treatments or intensity change
  useEffect(() => {
    if (selectedTreatments.length === 0 || !image) {
      setProcessedImage(null)
      return
    }

    const generateProcessedImage = async () => {
      try {
        // Create offscreen canvas for processing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Load original image
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = image
        })

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Apply simple treatment effects (placeholder for actual AR processing)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const effectIntensity = intensity / 100

        // Apply treatments based on selection
        for (let i = 0; i < data.length; i += 4) {
          if (selectedTreatments.includes('botox') || selectedTreatments.includes('filler')) {
            // Smoothing effect
            data[i] = Math.min(255, data[i] * (1 + 0.1 * effectIntensity))
            data[i + 1] = Math.min(255, data[i + 1] * (1 + 0.1 * effectIntensity))
            data[i + 2] = Math.min(255, data[i + 2] * (1 + 0.1 * effectIntensity))
          }
          if (selectedTreatments.includes('laser') || selectedTreatments.includes('peel')) {
            // Brightening effect
            data[i] = Math.min(255, data[i] + 5 * effectIntensity)
            data[i + 1] = Math.min(255, data[i + 1] + 5 * effectIntensity)
            data[i + 2] = Math.min(255, data[i + 2] + 5 * effectIntensity)
          }
        }

        ctx.putImageData(imageData, 0, 0)
        const processed = canvas.toDataURL('image/jpeg', 0.9)
        setProcessedImage(processed)
      } catch (error) {
        console.error('Error generating processed image:', error)
        setProcessedImage(null)
      }
    }

    generateProcessedImage()
  }, [selectedTreatments, intensity, image])

  // Get recommended treatments based on analysis
  const recommendedTreatments = analysisResults 
    ? TREATMENT_OPTIONS.filter(treatment => {
        // Check if any concerns match
        const concerns = analysisResults.recommendations
          .join(' ')
          .toLowerCase()
        return treatment.concerns.some(concern => 
          concerns.includes(concern.replace('_', ' '))
        )
      })
    : []

  const toggleTreatment = (treatmentId: string) => {
    if (selectedTreatments.includes(treatmentId)) {
      onUpdate(selectedTreatments.filter(id => id !== treatmentId))
      return
    }

    if (selectedTreatments.length >= 3) {
      return
    }

    onUpdate([...selectedTreatments, treatmentId])
  }

  const handleViewModeChange = (mode: string) => {
    if (mode === 'ar' || mode === 'comparison') {
      setViewMode(mode)
    }
  }

  // No image available
  if (!image) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No image available for AR preview. Please go back to the scan step.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900 dark:text-purple-100">
          Select treatments and adjust intensity to preview results for {customerName}. 
          Drag the slider in comparison mode to see before/after.
        </AlertDescription>
      </Alert>

      {/* View Mode Tabs */}
  <Tabs value={viewMode} onValueChange={handleViewModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ar" className="gap-2">
            <Eye className="h-4 w-4" />
            AR Preview
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        {/* AR Preview Tab */}
        <TabsContent value="ar" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              {selectedTreatments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Eye className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select at least one treatment below to preview
                  </p>
                </div>
              ) : (
                <ARVisualization
                  image={image}
                  treatment={selectedTreatments.join(',')}
                  intensity={intensity}
                  compact={false}
                  viewMode="front"
                  multiTreatment={selectedTreatments.length > 1}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              {selectedTreatments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select treatments to see before/after comparison
                  </p>
                </div>
              ) : (
                <BeforeAfterSlider
                  beforeImage={image}
                  afterImage={processedImage || image}
                  title="Treatment Preview"
                  description="Drag to compare before and after"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Intensity Control */}
      {selectedTreatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Treatment Intensity
            </CardTitle>
            <CardDescription>
              Adjust the intensity of selected treatments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Intensity</span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {intensity}%
                </Badge>
              </div>
              <Slider
                value={[intensity]}
                onValueChange={(value) => setIntensity(value[0])}
                min={0}
                max={100}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtle</span>
                <span>Natural</span>
                <span>Dramatic</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIntensity(30)}
                className="flex-1"
              >
                Mild (30%)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIntensity(60)}
                className="flex-1"
              >
                Moderate (60%)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIntensity(90)}
                className="flex-1"
              >
                Intensive (90%)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Treatments</CardTitle>
          <CardDescription>
            Choose up to 3 treatments (recommended treatments highlighted)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {TREATMENT_OPTIONS.map((treatment) => {
              const isSelected = selectedTreatments.includes(treatment.id)
              const isRecommended = recommendedTreatments.some(t => t.id === treatment.id)
              const canSelect = isSelected || selectedTreatments.length < 3

              return (
                <button
                  key={treatment.id}
                  onClick={() => canSelect && toggleTreatment(treatment.id)}
                  disabled={!canSelect}
                  className={cn(
                    "relative p-4 rounded-lg border-2 text-left transition-all",
                    "hover:shadow-md active:scale-98",
                    isSelected && "ring-2 ring-primary ring-offset-2",
                    !canSelect && "opacity-50 cursor-not-allowed",
                    treatment.colorClass
                  )}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 bg-green-500 text-white"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-3xl">{treatment.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{treatment.name}</h4>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs opacity-80">{treatment.description}</p>
                    </div>

                    {/* Selection Indicator */}
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isSelected 
                          ? "bg-primary border-primary" 
                          : "border-gray-300 bg-white"
                      )}
                    >
                      {isSelected ? (
                        <Minus className="h-4 w-4 text-white" />
                      ) : (
                        <Plus className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selection Counter */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
              <strong>{selectedTreatments.length}</strong> of 3 treatments selected
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selected Treatments Summary */}
      {selectedTreatments.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Selected Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedTreatments.map((id) => {
                const treatment = TREATMENT_OPTIONS.find(t => t.id === id)
                if (!treatment) return null
                
                return (
                  <div 
                    key={id}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-2xl">{treatment.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{treatment.name}</p>
                      <p className="text-xs text-muted-foreground">{treatment.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTreatment(id)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
