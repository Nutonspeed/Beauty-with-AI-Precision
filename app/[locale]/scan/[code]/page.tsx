'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LinkInfo {
  id: string
  code: string
  customer_name?: string
  customer_phone?: string
  status: string
  uses_remaining: number
  expires_at?: string
  center?: {
    name: string
    logo_url?: string
  }
}

export default function CustomerScanPage() {
  const t = useTranslations('scan_page')
  const params = useParams()
  const code = params.code as string
  
  const [loading, setLoading] = useState(true)
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [step, setStep] = useState<'intro' | 'capture' | 'analyzing' | 'done'>('intro')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch link info
  useEffect(() => {
    async function fetchLinkInfo() {
      try {
        const response = await fetch(`/api/scan-link/${code}`)
        const data = await response.json()
        
        if (data.success) {
          setLinkInfo(data.link)
          setIsValid(data.is_valid)
          if (!data.is_valid) {
            setError(data.link.status === 'expired' ? t('error.expired') : 
                    data.link.status === 'used' ? t('error.used') : t('error.invalid'))
          }
        } else {
          setError(data.error || t('error.notFound'))
        }
      } catch (err) {
        setError(t('error.generic'))
      } finally {
        setLoading(false)
      }
    }
    
    if (code) {
      fetchLinkInfo()
    }
  }, [code, t])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStep('capture')
    } catch (error) {
      console.error('Camera access denied:', error)
      setError(t('error.camera'))
    }
  }, [t])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      setCapturedImage(imageData)
      
      // Stop camera
      const stream = video.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  // Use the scan link and perform analysis
  const performAnalysis = async () => {
    if (!capturedImage) return
    
    setIsAnalyzing(true)
    setStep('analyzing')
    
    try {
      // Use the scan link (this will charge quota to sales user)
      const useResponse = await fetch(`/api/scan-link/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const useResult = await useResponse.json()
      
      if (!useResult.success) {
        setError(useResult.error || t('error.linkAction'))
        setStep('intro')
        setIsAnalyzing(false)
        return
      }
      
      // TODO: Perform actual skin analysis here
      // For now, simulate analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setStep('done')
    } catch (err) {
      setError(t('error.analysis'))
      setStep('intro')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error && !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-600 mb-2">{t('error.title')}</h1>
            <p className="text-slate-600">{error}</p>
            <p className="text-sm text-slate-500 mt-4">{t('error.contactSupport')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            {linkInfo?.center?.name && (
              <p className="text-sm font-medium text-slate-900">{linkInfo.center.name}</p>
            )}
            <p className="text-xs text-slate-500">AI Skin Analysis</p>
          </div>
          <Badge variant="outline" className="border-blue-200 text-blue-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Free Scan
          </Badge>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Intro */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-8">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-10 w-10 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {linkInfo?.customer_name ? t('intro.welcome', { name: linkInfo.customer_name }) : t('intro.freeScan')}
                </h1>
                <p className="text-slate-600">
                  {t('intro.description')}
                </p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Button 
                    className="w-full h-14 text-lg gap-3" 
                    onClick={startCamera}
                  >
                    <Camera className="h-5 w-5" />
                    {t('intro.openCamera')}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">{t('intro.or')}</span>
                    </div>
                  </div>

                  <label className="block">
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        {t('intro.uploadPhoto')}
                      </span>
                    </Button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                  </label>
                </CardContent>
              </Card>

              <div className="text-center text-xs text-slate-500">
                <p>{t('intro.privacyNote')}</p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Capture */}
          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold">{t('capture.title')}</h2>
                <p className="text-sm text-slate-500">{t('capture.subtitle')}</p>
              </div>

              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 border-4 border-white/50 rounded-[50%]" />
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <Button 
                className="w-full h-14 text-lg" 
                onClick={capturePhoto}
              >
                <Camera className="h-5 w-5 mr-2" />
                {t('capture.button')}
              </Button>
            </motion.div>
          )}

          {/* Preview captured image */}
          {capturedImage && step !== 'analyzing' && step !== 'done' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold">{t('preview.title')}</h2>
                <p className="text-sm text-slate-500">{t('preview.subtitle')}</p>
              </div>

              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCapturedImage(null)
                    startCamera()
                  }}
                >
                  {t('preview.retake')}
                </Button>
                <Button onClick={performAnalysis}>
                  {t('preview.analyze')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Analyzing */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="relative h-32 w-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-blue-400 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t('analyzing.title')}</h2>
              <p className="text-slate-600">{t('analyzing.subtitle')}</p>
              <p className="text-sm text-slate-500 mt-2">{t('analyzing.wait')}</p>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('done.title')}</h2>
              <p className="text-slate-600 mb-6">
                {t('done.subtitle')}
              </p>
              
              <Card className="text-left">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">{t('done.nextSteps')}</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {t('done.step1')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {t('done.step2')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {t('done.step3')}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
