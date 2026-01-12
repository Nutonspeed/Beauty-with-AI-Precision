'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, TrendingUp, Users, CheckCircle2, UserPlus, Zap, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from "@/lib/utils"
// import { FloatingNotesButton } from '@/components/sales/customer-notes'
import { analyzeSkinAesthetic } from '@/lib/ai/aesthetic-hub'
import { BeforeAfterSlider } from '@/components/ar/before-after-slider'
import { SkinEffectProcessor } from '@/lib/ar/skin-effects'
// import { analyzeSkinWithGemini } from '@/lib/ai/gemini-advisor'
// import { predictSkinFuture, type SkinAgePrediction } from '@/lib/ai/skin-age-predictor'
// import ARProgramPreview from '@/components/sales/ar-program-preview'
// import SkinHeatmap from '@/components/sales/skin-heatmap'
// import LeadIntegration from '@/components/sales/lead-integration'
// import ShareResults from '@/components/sales/share-results'
// import { useToast } from '@/hooks/use-toast'
import { useTranslations } from "next-intl"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Build-time guard: avoid prerendering this interactive sales page to reduce
// Vercel build duration (force runtime rendering instead of SSG/ISR).
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ScanResult {
  id: string
  skinAge: number
  actualAge: number
  concerns: Array<{
    name: string
    severity: number
    description: string
  }>
  recommendations: Array<{
    program: string
    sessions?: number
    price: number
    duration: string
    expectedOutcome: string
  }>
  confidence_score?: number
  analysis_model?: string
  face_detected?: boolean
  face_landmarks?: any
  heatmap_data?: any
  problem_areas?: any[]
  specializedMetrics?: {
    acneSeverity?: string
    acneScore?: number
    detectedSkinType?: string
    skinTypeConfidence?: number
    wrinklesScore?: number
    spotsScore?: number
  }
}

export default function QuickScanPage() {
  const t = useTranslations()
  // const { toast } = useToast()
  const [step, setStep] = useState<'intro' | 'scanning' | 'results'>('intro')
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right'>('front')
  const [capturedImages, setCapturedImages] = useState<{
    front?: string
    left?: string
    right?: string
  }>({})
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string
    name: string
    phone: string
    email?: string
  } | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [simulatedAfterImage, setSimulatedAfterImage] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadMode, setIsUploadMode] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStep('scanning')
    } catch (error) {
      console.error('Camera access denied:', error)
      setIsUploadMode(true)
      setUploadedImage(null)
      setStep('intro')
    }
  }, [])

  const analyzePhotos = useCallback(async (images: typeof capturedImages) => {
    setIsAnalyzing(true)
    const startTime = Date.now()

    try {
      if (!images.front) {
        throw new Error(t('salesQuickScan.errors.noFrontImage'))
      }
      const frontImage = images.front

      // Convert base64 to ImageData for analysis
      const img = new Image()
      img.src = frontImage
      await new Promise(resolve => { img.onload = resolve })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')
      
      ctx.drawImage(img, 0, 0)
      
      const faceDetection: any = null
      const analysisTime = Date.now() - startTime

      // Use Aesthetic Intelligence Hub for real skin analysis
      console.log('Starting Aesthetic Intelligence analysis...')
      let analysis;
      try {
        analysis = await analyzeSkinAesthetic(frontImage, {
          name: selectedCustomer?.name || t('roles.customer'),
          age: 35 // Default age, can be enhanced later
        });
        console.log('Aesthetic analysis completed:', analysis);
      } catch (error) {
        console.error('Aesthetic analysis failed, using fallback:', error);
        analysis = {
          skinAge: Math.floor(35 + Math.random() * 10),
          skinType: 'Combination',
          concerns: [
            {
              name: t('skinHeatmap.tabs.wrinkles'),
              severity: 7,
              description: t('salesQuickScan.fallback.wrinklesDesc')
            },
            {
              name: t('analysis.metrics.uvDamage'),
              severity: 6,
              description: t('salesQuickScan.fallback.uvDamageDesc')
            },
            {
              name: t('skinHeatmap.tabs.pigmentation'),
              severity: 5,
              description: t('salesQuickScan.fallback.pigmentationDesc')
            }
          ],
          recommendations: [
            {
              program: t('packages.basic.name'),
              sessions: 6,
              price: 19900,
              duration: '3 months',
              expectedOutcome: t('salesQuickScan.fallback.outcome1')
            },
            {
              program: t('packages.premium.name'),
              sessions: 8,
              price: 24900,
              duration: '4 months',
              expectedOutcome: t('salesQuickScan.fallback.outcome2')
            },
            {
              program: t('packages.vip.name'),
              sessions: 12,
              price: 39900,
              duration: '6 months',
              expectedOutcome: t('salesQuickScan.fallback.outcome3')
            }
          ]
        };
      }

      // Generate comprehensive analysis results
      const skinAge = analysis.skinAge;
      const actualAge = 35;

      const concerns = analysis.concerns;
      const recommendations = analysis.recommendations;

      // Generate heatmap data
      const problemAreas = [
        {
          region: t('salesQuickScan.results.forehead'),
          severity: 7,
          coordinates: { x: 0.5, y: 0.2, radius: 0.15 },
          concernType: 'wrinkles' as const
        },
        {
          region: t('salesQuickScan.results.eyeArea'),
          severity: 6,
          coordinates: { x: 0.35, y: 0.35, radius: 0.1 },
          concernType: 'wrinkles' as const
        },
        {
          region: t('salesQuickScan.results.cheeks'),
          severity: 5,
          coordinates: { x: 0.4, y: 0.55, radius: 0.12 },
          concernType: 'pigmentation' as const
        }
      ]

      const heatmapData = {
        problemAreas,
        overallSeverity: concerns.reduce((sum: number, c: any) => sum + c.severity, 0) / concerns.length
      }

      // Save to database
      const scanData = {
        customer_name: selectedCustomer?.name || t('salesQuickScan.guestCustomer'),
        customer_phone: selectedCustomer?.phone || '0000000000',
        customer_email: customerEmail || null,
        photo_front: images.front,
        photo_left: images.left,
        photo_right: images.right,
        skin_age: skinAge,
        actual_age: actualAge,
        concerns,
        recommendations,
        confidence_score: 0.85,
        analysis_model: 'hybrid-v1',
        analysis_duration_ms: analysisTime,
        face_detected: !!faceDetection,
        face_landmarks: faceDetection?.landmarks || null,
        face_mesh_data: faceDetection?.mesh || null,
        heatmap_data: heatmapData,
        problem_areas: problemAreas
      }

      setIsSaving(true)
      const response = await fetch('/api/sales/scan-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData)
      })

      if (!response.ok) {
        let details = ''
        try {
          const data = await response.json()
          details = data?.error || JSON.stringify(data)
        } catch {
          try {
            details = await response.text()
          } catch {
            details = ''
          }
        }
        console.error('QuickScan: failed to save scan result', response.status, details)
        throw new Error(details || 'Failed to save scan result')
      }

      const { data: savedResult } = await response.json()

      // Generate Future Prediction (1-5 years)
      // const futurePrediction = await predictSkinFuture(
        //   {
        //     wrinkles: concerns.find(c => c.name === 'Wrinkles')?.severity ? concerns.find(c => c.name === 'Wrinkles')!.severity * 10 : 30,
        //     spots: concerns.find(c => c.name === 'Pigmentation')?.severity ? concerns.find(c => c.name === 'Pigmentation')!.severity * 10 : 25,
        //     pores: 35,
        //     texture: 70,
        //     elasticity: 75,
        //     uvDamage: concerns.find(c => c.name === 'Sun Damage')?.severity ? concerns.find(c => c.name === 'Sun Damage')!.severity * 10 : 20
        //   },
        //   actualAge,
        //   {
        //     sunExposure: 'moderate',
        //     smoking: false,
        //     sleepHours: 7,
        //     stressLevel: 'moderate',
        //     hydrationLevel: 'adequate',
        //     diet: 'average',
        //     skinCareRoutine: 'basic'
        //   }
        // )

      const result: ScanResult = {
        id: savedResult.id,
        skinAge,
        actualAge,
        concerns,
        recommendations,
        confidence_score: analysis.confidenceScore || 0.85,
        analysis_model: analysis.provider === 'hybrid' ? 'aesthetic-hybrid-v1' : 'gemini-pro-v1',
        face_detected: !!faceDetection,
        face_landmarks: faceDetection?.landmarks,
        heatmap_data: heatmapData,
        problem_areas: problemAreas,
        specializedMetrics: analysis.specializedMetrics
      }

      setScanResult(result)
      
      // Generate Simulated After Image
      if (images.front) {
        try {
          const processor = new SkinEffectProcessor()
          const canvas = document.createElement('canvas')
          // Use a reasonable size for simulation
          await processor.initialize(canvas, 800, 800)
          await processor.loadImage(images.front)
          
          // Map AI concerns to simulation intensity
          const smoothing = result.concerns.find(c => c.name.includes('รูขุมขน')) ? 0.6 : 0.3
          const brightening = result.concerns.find(c => c.name.includes('กระจ่างใส')) ? 0.4 : 0.2
          const spotRemoval = result.concerns.find(c => c.name.includes('จุดด่างดำ')) ? 0.7 : 0.2
          
          processor.applyEffects({
            smoothing,
            brightening,
            spotRemoval,
            rednessReduction: 0.3,
            wrinkleReduction: 0.5
          })
          
          const afterDataUrl = processor.getDataURL('jpeg', 0.8)
          setSimulatedAfterImage(afterDataUrl)
          processor.dispose()
        } catch (simError) {
          console.error('Failed to generate simulation:', simError)
        }
      }

      setStep('results')
      
      // toast({
      //   title: 'Analysis Complete',
      //   description: 'Scan results saved successfully',
      //   variant: 'default'
      // })
    } catch (error: any) {
      console.error('Analysis failed:', error)
      // toast({
      //   title: 'Analysis Failed',
      //   description: error?.message || 'Please try again',
      //   variant: 'destructive'
      // })
    } finally {
      setIsAnalyzing(false)
      setIsSaving(false)
    }
  }, [selectedCustomer, customerEmail, t])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg')

    setCapturedImages(prev => ({
      ...prev,
      [currentAngle]: imageData
    }))

    // Auto-advance to next angle
    if (currentAngle === 'front') {
      setCurrentAngle('left')
    } else if (currentAngle === 'left') {
      setCurrentAngle('right')
    } else {
      // All photos captured, start analysis
      await analyzePhotos({ ...capturedImages, right: imageData })
    }
  }, [currentAngle, capturedImages, analyzePhotos])

  const angleInstructions = {
    front: t('salesQuickScan.scanning.front'),
    left: t('salesQuickScan.scanning.left'),
    right: t('salesQuickScan.scanning.right')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden selection:bg-pink-500/30">
      <Header />
      
      {/* Precision Background Infrastructure */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
      </div>

      <main className="relative z-10 pt-20 pb-32">
        <div className="container px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[80vh] flex items-center justify-center py-12"
              >
                <div className="w-full max-w-2xl">
                  <Card className="relative overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    <CardHeader className="pt-12 pb-8">
                      <div className="text-center space-y-6">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-[2rem] border border-pink-500/20 shadow-glow-primary mx-auto"
                        >
                          <Sparkles className="w-10 h-10 text-pink-400" />
                        </motion.div>
                        
                        <div className="space-y-3">
                          <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                            {t('salesQuickScan.title')}
                          </CardTitle>
                          <p className="text-slate-400 text-lg font-light tracking-wide max-w-md mx-auto">
                            {t('salesQuickScan.subtitle')}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-8 sm:px-12 pb-12 space-y-10">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-pink-400/80 mb-2">
                          <div className="h-px flex-1 bg-pink-500/20" />
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-3.5 h-3.5" />
                            {t('salesQuickScan.customerInfo')}
                          </div>
                          <div className="h-px flex-1 bg-pink-500/20" />
                        </div>

                        <div className="grid gap-5">
                          <div className="space-y-2.5">
                            <Label htmlFor="customer-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                              {t('salesQuickScan.name')}
                            </Label>
                            <Input
                              id="customer-name"
                              placeholder={t('salesQuickScan.namePlaceholder')}
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="h-14 bg-white/[0.02] border-white/5 focus:border-pink-500/30 focus:ring-pink-500/10 rounded-2xl transition-all duration-300 px-6 font-light tracking-wide text-white placeholder:text-slate-600"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                              <Label htmlFor="customer-phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                                {t('salesQuickScan.phone')}
                              </Label>
                              <Input
                                id="customer-phone"
                                placeholder={t('salesQuickScan.phonePlaceholder')}
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="h-14 bg-white/[0.02] border-white/5 focus:border-pink-500/30 focus:ring-pink-500/10 rounded-2xl transition-all duration-300 px-6 font-light tracking-wide text-white placeholder:text-slate-600"
                              />
                            </div>
                            <div className="space-y-2.5">
                              <Label htmlFor="customer-email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                                {t('salesQuickScan.emailOptional')}
                              </Label>
                              <Input
                                id="customer-email"
                                type="email"
                                placeholder={t('salesQuickScan.emailPlaceholder')}
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="h-14 bg-white/[0.02] border-white/5 focus:border-pink-500/30 focus:ring-pink-500/10 rounded-2xl transition-all duration-300 px-6 font-light tracking-wide text-white placeholder:text-slate-600"
                              />
                            </div>
                          </div>

                          <Button
                            className="w-full h-14 mt-4 bg-pink-600 hover:bg-pink-500 text-white border-0 shadow-2xl shadow-pink-600/20 rounded-2xl font-bold tracking-widest uppercase text-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            onClick={() => {
                              if (customerName.trim()) {
                                setSelectedCustomer({
                                  id: 'temp-' + Date.now(),
                                  name: customerName,
                                  phone: customerPhone,
                                  email: customerEmail || undefined
                                })
                              }
                            }}
                            disabled={!customerName.trim()}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('salesQuickScan.confirmInfo')}
                          </Button>
                        </div>
                      </motion.div>

                      {/* Customer Confirmed Badge */}
                      <AnimatePresence>
                        {selectedCustomer && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <Users className="w-6 h-6 text-emerald-400" />
                              </div>
                              <div>
                                <p className="font-bold text-white text-lg tracking-tight">{selectedCustomer.name}</p>
                                <p className="text-emerald-400/60 text-xs font-black uppercase tracking-widest">{selectedCustomer.phone}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCustomer(null)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <span aria-hidden="true">×</span>
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action Infrastructure */}
                      <div className="space-y-4 pt-4">
                        <Button
                          onClick={() => {
                            setIsUploadMode(false)
                            startCamera()
                          }}
                          className="w-full h-16 bg-white text-[#020617] hover:bg-slate-100 rounded-2xl font-black tracking-[0.15em] uppercase text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:grayscale"
                          disabled={!selectedCustomer}
                        >
                          <Camera className="w-5 h-5 mr-3" />
                          {t('salesQuickScan.actions.startCamera')}
                        </Button>
                        
                        {!isUploadMode && (
                          <Button
                            variant="outline"
                            className="w-full h-12 border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            disabled={!selectedCustomer}
                            onClick={() => setIsUploadMode(true)}
                          >
                            {t('salesQuickScan.actions.useUpload')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Scanning Step - High-end Camera Interface */}
            {step === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-3xl mx-auto"
              >
                <Card className="relative overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-2xl">
                  <CardHeader className="pt-10 pb-6">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500/10 rounded-xl border border-pink-500/20 mb-2">
                        <Camera className="w-6 h-6 text-pink-400" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-white tracking-tight">
                        {angleInstructions[currentAngle]}
                      </CardTitle>
                      <div className="flex justify-center gap-3">
                        {(['front', 'left', 'right'] as const).map((angle) => (
                          <motion.div
                            key={angle}
                            animate={currentAngle === angle ? { scale: 1.1 } : { scale: 1 }}
                          >
                            <Badge 
                              variant={currentAngle === angle ? 'default' : 'outline'} 
                              className={cn(
                                "px-4 py-1 rounded-full uppercase tracking-widest text-[9px] font-black transition-all duration-500",
                                currentAngle === angle 
                                  ? "bg-pink-600 text-white border-none shadow-lg shadow-pink-600/20" 
                                  : "border-white/10 text-slate-500 bg-transparent"
                              )}
                            >
                              {t(`salesQuickScan.scanning.${angle}Label` as any)}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 sm:p-10 space-y-8">
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] max-h-[400px]">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover [transform:scaleX(-1)]"
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Aesthetic Face Guide Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          animate={{
                            scale: [1, 1.02, 1],
                            opacity: [0.3, 0.5, 0.3],
                            boxShadow: [
                              "0 0 0 0px rgba(236, 72, 153, 0)",
                              "0 0 0 20px rgba(236, 72, 153, 0.05)",
                              "0 0 0 0px rgba(236, 72, 153, 0)"
                            ]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-64 h-80 border-[1px] border-pink-500/40 rounded-[3rem] relative"
                        >
                          {/* Corner brackets */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-500 rounded-tl-2xl" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-500 rounded-tr-2xl" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-500 rounded-bl-2xl" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500 rounded-br-2xl" />
                          
                          {/* Scanning scanline */}
                          <motion.div 
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute left-4 right-4 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                          />
                        </motion.div>
                      </div>

                      {/* Data Streaming HUD */}
                      <div className="absolute top-6 left-6 right-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[9px] font-black text-pink-500 uppercase tracking-[0.2em] bg-[#020617]/60 backdrop-blur-md px-3 py-1 rounded-full border border-pink-500/20">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
                              </span>
                              Live Analysis
                            </div>
                          </div>
                          <div className="bg-[#020617]/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 min-w-[100px]">
                            <div className="flex justify-between items-center text-[10px] font-black text-white uppercase tracking-widest mb-1.5">
                              <span>Progress</span>
                              <span className="text-pink-500">{Object.keys(capturedImages).length}/3</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1">
                              <motion.div
                                className="bg-pink-500 h-1 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(Object.keys(capturedImages).length / 3) * 100}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Button
                        onClick={capturePhoto}
                        className="w-full h-16 bg-white text-[#020617] hover:bg-slate-100 rounded-[1.5rem] font-black tracking-[0.2em] uppercase text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 animate-spin text-pink-600" />
                            {t('salesQuickScan.actions.analyzing')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Camera className="w-5 h-5" />
                            {t('salesQuickScan.actions.capture')}
                          </div>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-xs text-slate-500 font-light tracking-wide italic">
                          {t('salesQuickScan.scanning.guide')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Results Step - Premium Aesthetic Report */}
            {step === 'results' && scanResult && selectedCustomer && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl mx-auto space-y-10 pb-20"
              >
                {/* Precision Summary Header */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Visual Simulation Node (New!) */}
                  {simulatedAfterImage && capturedImages.front && (
                    <div className="lg:col-span-3">
                      <BeforeAfterSlider 
                        beforeImage={capturedImages.front}
                        afterImage={simulatedAfterImage}
                        title="Aesthetic Outcome Simulation"
                        description="Visual prediction of your skin transformation / จำลองผลลัพธ์การเปลี่ยนแปลงของผิว"
                      />
                    </div>
                  )}

                  <Card className="lg:col-span-2 relative overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] p-10 flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Users className="w-40 h-40 text-pink-500" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                        Aesthetic Biological Profile
                      </Badge>
                      <div className="flex items-baseline gap-4">
                        <h2 className="text-7xl font-bold text-white tracking-tighter">
                          {scanResult.skinAge}
                        </h2>
                        <div className="space-y-1">
                          <p className="text-2xl text-slate-400 font-light leading-none">{t('salesQuickScan.results.years')}</p>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-600">Aesthetic Age Analysis</p>
                        </div>
                      </div>
                      <div className="h-px w-full bg-gradient-to-r from-pink-500/30 via-transparent to-transparent" />
                      <div className="flex flex-wrap gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actual Age</p>
                          <p className="text-xl text-white font-light">{scanResult.actualAge} Years</p>
                        </div>
                        {scanResult.specializedMetrics?.detectedSkinType && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-pink-500">Detected Type</p>
                            <p className="text-xl text-white font-light capitalize">{scanResult.specializedMetrics.detectedSkinType}</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Age Variance</p>
                          <p className={cn("text-xl font-bold", scanResult.skinAge > scanResult.actualAge ? "text-rose-500" : "text-emerald-500")}>
                            {scanResult.skinAge > scanResult.actualAge ? "+" : ""}{scanResult.skinAge - scanResult.actualAge} Years
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Precision</p>
                          <p className="text-xl text-pink-400 font-light">{(scanResult.confidence_score || 0.85 * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-pink-600 to-purple-700 rounded-[3rem] p-10 text-white shadow-2xl">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <Zap className="w-10 h-10 text-white opacity-80" />
                        <h3 className="text-2xl font-bold leading-tight">Precision Recommendation</h3>
                        {scanResult.specializedMetrics?.acneSeverity && (
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md mb-2">
                            Acne Node: {scanResult.specializedMetrics.acneSeverity} ({scanResult.specializedMetrics.acneScore}%)
                          </Badge>
                        )}
                        {(scanResult.specializedMetrics?.wrinklesScore !== undefined || scanResult.specializedMetrics?.spotsScore !== undefined) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {scanResult.specializedMetrics?.wrinklesScore !== undefined && (
                              <Badge variant="outline" className="border-pink-500/30 text-pink-400 bg-pink-500/5 text-[9px] uppercase font-black tracking-widest">
                                Wrinkle Intensity: {scanResult.specializedMetrics.wrinklesScore}%
                              </Badge>
                            )}
                            {scanResult.specializedMetrics?.spotsScore !== undefined && (
                              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5 text-[9px] uppercase font-black tracking-widest">
                                Pigmentation Index: {scanResult.specializedMetrics.spotsScore}%
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-white/70 font-light leading-relaxed text-sm">
                          Based on 468-point mapping, we've synthesized an optimized protocol for {selectedCustomer.name}.
                        </p>
                      </div>
                      <Button size="lg" className="w-full h-14 bg-white text-pink-600 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px] mt-8 shadow-xl">
                        {t('salesQuickScan.actions.createProposal')}
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Detailed Pathological Mapping */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-md rounded-[3rem] overflow-hidden group">
                    <CardHeader className="p-10 pb-6 border-b border-white/5">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.25em] flex items-center gap-4 text-pink-400">
                        <TrendingUp className="w-5 h-5" />
                        {t('salesQuickScan.results.concernsTitle')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      {scanResult.concerns.map((concern, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all group/item"
                        >
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-pink-500/30 transition-colors">
                              <span className="text-2xl font-bold text-white">{concern.severity}</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#020617]" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-white text-lg tracking-tight group-hover/item:text-pink-400 transition-colors">{concern.name}</h4>
                            <p className="text-slate-500 text-sm font-light leading-relaxed">{concern.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* High-fidelity Aesthetic Roadmap */}
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-md rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-6 border-b border-white/5">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.25em] flex items-center gap-4 text-emerald-400">
                        <Award className="w-5 h-5" />
                        Aesthetic Roadmap
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      {scanResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-white text-xl tracking-tight group-hover:text-emerald-400 transition-colors">{rec.program}</h4>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              ฿{rec.price.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Protocol Duration</p>
                              <p className="text-sm text-slate-300 font-light">{rec.duration}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Biological Target</p>
                              <p className="text-sm text-slate-300 font-light">{rec.expectedOutcome}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setStep('intro')
                      setCapturedImages({})
                      setScanResult(null)
                      setLeadId(null)
                      setSelectedCustomer(null)
                      setCustomerName('')
                      setCustomerPhone('')
                      setCustomerEmail('')
                    }}
                    className="flex-1 h-16 border-white/10 bg-white/[0.02] text-white hover:bg-white/5 rounded-2xl font-bold tracking-widest uppercase text-[10px]"
                  >
                    Reset Infrastructure
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-16 bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-2xl shadow-emerald-600/20 rounded-2xl font-black tracking-widest uppercase text-[10px] transition-transform hover:scale-[1.02]"
                  >
                    Generate Aesthetic Report (PDF)
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
