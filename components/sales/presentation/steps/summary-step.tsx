'use client'

/**
 * Summary & E-Signature Step Component
 * 
 * Final step with:
 * - Complete data review (accordion/tabs)
 * - Touch-optimized signature canvas
 * - Action buttons (Send PDF, Schedule, Save)
 * - Completion confirmation
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations, useLocale } from 'next-intl'
import { th, enUS } from 'date-fns/locale'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  FileText,
  CheckCircle2,
  Send,
  Calendar,
  Save,
  Download,
  Mail,
  MessageSquare,
  RotateCcw,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PresentationData } from '@/lib/sales/presentation-types'
import { getProgramDisplayName } from '@/lib/sales/presentation-catalog'
import { getProduct3DManager } from '@/lib/ar/product-3d-viewer'

interface SummaryStepProps {
  readonly data: PresentationData
  readonly onSignature: (signature: string) => void
  readonly onComplete: (completedAt: Date) => void
  readonly isOnline: boolean
}

export function SummaryStep({
  data,
  onSignature,
  onComplete,
  isOnline,
}: SummaryStepProps) {
  const t = useTranslations()
  const locale = useLocale()
  const dateLocale = locale === 'th' ? th : enUS
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signature, setSignature] = useState<string | null>(data.signature)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
  const productManager = useMemo(() => getProduct3DManager(), [])

  const analysisSummary = useMemo(() => {
    if (!data.analysisResults) {
      return null
    }

    const { overallScore, skinCondition, recommendations } = data.analysisResults
    const normalizedScore = overallScore > 1 ? overallScore : overallScore * 100
    const skinAge = Math.round(normalizedScore * 0.5 + 20)

    let estimatedActualAge = 38
    if (normalizedScore > 70) {
      estimatedActualAge = 35
    } else if (normalizedScore > 50) {
      estimatedActualAge = 32
    }
    const ageDifference = skinAge - estimatedActualAge

    return {
      skinAge,
      estimatedActualAge,
      ageDifference,
      skinCondition,
      recommendationsCount: recommendations.length,
    }
  }, [data.analysisResults])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2 // 2x for retina
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Set drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if any
    if (signature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = signature
    }
  }, [signature])

  // Get coordinates relative to canvas
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (!coords) return

    setIsDrawing(true)
    setLastPoint(coords)
  }

  // Draw on canvas
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !lastPoint) return

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw line
    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()

    setLastPoint(coords)
  }

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setLastPoint(null)
      
      // Save signature as data URL
      const canvas = canvasRef.current
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png')
        setSignature(dataUrl)
        onSignature(dataUrl)
      }
    }
  }

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    
    setSignature(null)
    onSignature('')
  }

  // Complete presentation
  const handleComplete = () => {
    if (!signature) {
      alert(t('salesWizard.steps.summary.signAlert'))
      return
    }

    onComplete(new Date())
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-sm text-green-900 dark:text-green-100">
          {t('salesWizard.steps.summary.instructions')}
        </AlertDescription>
      </Alert>

      {/* Offline Warning */}
      {!isOnline && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {t('salesWizard.steps.summary.offlineWarning')}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Review Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('salesWizard.steps.summary.summaryTitle')}
          </CardTitle>
          <CardDescription>{t('salesWizard.steps.summary.summaryDesc')}</CardDescription>
        </CardHeader>

        <CardContent>
          <Accordion type="multiple" defaultValue={['client', 'proposal']} className="w-full">
            {/* Client Info */}
            <AccordionItem value="client">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Badge>1</Badge>
                  {t('salesWizard.steps.summary.sectionClientInfo' as any) || t('salesWizard.steps.summary.sectionCustomerInfo')}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm pl-8">
                  <p><strong>{t('common.name')}:</strong> {data.client.name}</p>
                  <p><strong>{t('common.phone')}:</strong> {data.client.phone}</p>
                  {data.client.email && (
                    <p><strong>{t('common.email')}:</strong> {data.client.email}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Scanned Images */}
            <AccordionItem value="scans">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Badge>2</Badge>
                  {t('salesWizard.steps.summary.sectionScannedImages')}
                  <Badge variant="secondary">{t('salesWizard.steps.summary.photosCount', { count: Object.values(data.scannedImages).filter(Boolean).length })}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-2 pl-8">
                  {data.scannedImages.front && (
                    <div>
                      <img src={data.scannedImages.front} alt={t('salesWizard.steps.summary.angleFront')} className="w-full rounded aspect-square object-cover" />
                      <p className="text-xs text-center mt-1">{t('salesWizard.steps.summary.angleFront')}</p>
                    </div>
                  )}
                  {data.scannedImages.left && (
                    <div>
                      <img src={data.scannedImages.left} alt={t('salesWizard.steps.summary.angleLeft')} className="w-full rounded aspect-square object-cover" />
                      <p className="text-xs text-center mt-1">{t('salesWizard.steps.summary.angleLeft')}</p>
                    </div>
                  )}
                  {data.scannedImages.right && (
                    <div>
                      <img src={data.scannedImages.right} alt={t('salesWizard.steps.summary.angleRight')} className="w-full rounded aspect-square object-cover" />
                      <p className="text-xs text-center mt-1">{t('salesWizard.steps.summary.angleRight')}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Analysis Results */}
            {analysisSummary && (
              <AccordionItem value="analysis">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Badge>3</Badge>
                    {t('salesWizard.steps.summary.sectionAIAnalysis')}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-8">
                    {analysisSummary && (
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>{t('salesWizard.steps.summary.skinAge')}:</strong> {analysisSummary.skinAge} {t('salesQuickScan.results.years')}
                        </p>
                        <p>
                          <strong>{t('salesWizard.steps.summary.condition')}:</strong> {analysisSummary.skinCondition}
                        </p>
                        <p>
                          <strong>{t('salesWizard.steps.summary.ageDiff')}:</strong> {analysisSummary.ageDifference > 0 ? '+' : ''}{analysisSummary.ageDifference} {t('salesQuickScan.results.years')}
                        </p>
                        <p>
                          <strong>{t('salesWizard.steps.summary.personalizedTips')}:</strong> {t('salesWizard.steps.summary.personalizedTips', { count: analysisSummary.recommendationsCount })}
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Selected Programs */}
            <AccordionItem value="programs">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Badge>4</Badge>
                  {t('salesWizard.steps.summary.sectionPrograms')}
                  <Badge variant="secondary">{t('salesWizard.steps.summary.itemsCount', { count: data.selectedPrograms.length })}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pl-8">
                  {data.selectedPrograms.map((program: string) => (
                    <div key={program} className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      {getProgramDisplayName(program, t)}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Selected Products */}
            <AccordionItem value="products">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Badge>5</Badge>
                  {t('salesWizard.steps.summary.sectionProducts')}
                  <Badge variant="secondary">{t('salesWizard.steps.summary.itemsCount', { count: data.selectedProducts.length })}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pl-8">
                  {data.selectedProducts.map((product: string) => (
                    <div key={product} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3 w-3 text-blue-500" />
                      {productManager.getProduct(product)?.name ?? product}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Proposal */}
            {data.proposal && (
              <AccordionItem value="proposal">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Badge>6</Badge>
                    {t('salesWizard.steps.summary.sectionProposal')}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-8">
                    <div className="text-sm">
                      <strong>{t('salesWizard.steps.proposal.subtotalLabel')}</strong> ฿{data.proposal.subtotal.toLocaleString()}
                      <br />
                      <strong>{t('salesWizard.steps.proposal.discountLabel')}:</strong> -฿{data.proposal.discountAmount.toLocaleString()}
                      <br />
                      <strong className="text-lg text-primary">{t('salesWizard.steps.proposal.totalFinalLabel')} ฿{data.proposal.total.toLocaleString()}</strong>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('salesWizard.steps.summary.paymentTerms')}: {data.proposal.paymentTerms}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>

      {/* E-Signature Canvas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('salesWizard.steps.summary.signatureTitle')}</CardTitle>
              <CardDescription>{t('salesWizard.steps.summary.signatureDesc')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearSignature}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {t('salesWizard.steps.summary.clearButton')}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={cn(
                "w-full h-48 border-2 border-dashed rounded-lg cursor-crosshair",
                "bg-white dark:bg-gray-900",
                "touch-none", // Prevent browser default touch behaviors
                signature ? "border-green-300" : "border-gray-300"
              )}
            />
            
            {!signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground">{t('salesWizard.steps.summary.signHerePrompt')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">{t('salesWizard.steps.summary.nextStepsTitle')}</CardTitle>
          <CardDescription>{t('salesWizard.steps.summary.nextStepsDesc')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Send via Line */}
            <Button
              variant="outline"
              size="lg"
              disabled={!signature || !isOnline}
              className="h-auto py-4 flex-col gap-2"
            >
              <MessageSquare className="h-6 w-6 text-green-600" />
              <span className="text-xs">{t('salesWizard.steps.summary.sendLine')}</span>
            </Button>

            {/* Send via Email */}
            <Button
              variant="outline"
              size="lg"
              disabled={!signature || !isOnline}
              className="h-auto py-4 flex-col gap-2"
            >
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="text-xs">{t('salesWizard.steps.summary.sendEmail')}</span>
            </Button>

            {/* Download PDF */}
            <Button
              variant="outline"
              size="lg"
              disabled={!signature}
              className="h-auto py-4 flex-col gap-2"
            >
              <Download className="h-6 w-6 text-purple-600" />
              <span className="text-xs">{t('salesWizard.steps.summary.downloadPDF')}</span>
            </Button>

            {/* Schedule Appointment */}
            <Button
              variant="outline"
              size="lg"
              disabled={!signature}
              className="h-auto py-4 flex-col gap-2"
            >
              <Calendar className="h-6 w-6 text-orange-600" />
              <span className="text-xs">{t('salesWizard.steps.summary.scheduleVisit')}</span>
            </Button>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            {/* Save to Notes */}
            <Button
              variant="secondary"
              size="lg"
              disabled={!signature}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {t('salesWizard.steps.summary.saveToNotes')}
            </Button>

            {/* Complete */}
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={!signature}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Send className="h-4 w-4" />
              {t('salesWizard.steps.summary.completeButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {data.completedAt && (
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900 dark:text-green-100">
            {t('salesWizard.steps.summary.completedAlert', { date: data.completedAt.toLocaleString() })}
          </AlertDescription>
        </Alert>
      )}

      {/* Signature Required Warning */}
      {!signature && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {t('salesWizard.steps.summary.signatureRequired')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
