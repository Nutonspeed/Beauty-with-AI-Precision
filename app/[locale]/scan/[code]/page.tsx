'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  Sparkles,
  ArrowRight,
  Fingerprint,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from "@/components/footer"
import { useLocalizePath } from "@/lib/i18n/locale-link"

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
  const locale = useLocale()
  const lp = useLocalizePath()
  const router = useRouter()
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
      // Use the scan link
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
      
      // Simulate neural sequencing
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
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-950">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Validating Authorization Node...</p>
        </div>
      </div>
    )
  }

  if (error && !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[2.5rem] p-10 text-center space-y-6 shadow-premium">
          <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <AlertTriangle className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">{t('error.title')}</h3>
            <p className="text-sm text-slate-500 font-light italic leading-relaxed">{error}</p>
          </div>
          <Button onClick={() => router.push(lp('/'))} className="w-full h-14 rounded-xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic">
            Return to Gateway
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      {/* Cinematic Header interface */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-900 italic leading-none">{linkInfo?.center?.name || 'Aesthetic Hub'}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Diagnostic Terminal</p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 font-black uppercase text-[9px] italic shadow-sm animate-pulse">
            <Sparkles className="h-3 w-3 mr-2" />
            Free Sequence
          </Badge>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 px-6 max-w-md mx-auto flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* Step 1: Intro interface */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="mx-auto h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                      <Camera className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="absolute -inset-4 bg-pink-500/5 rounded-full blur-2xl -z-10 animate-glow-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      {linkInfo?.customer_name ? t('intro.welcome', { name: linkInfo.customer_name }) : t('intro.freeScan')}
                    </h1>
                    <p className="text-lg text-slate-500 font-light italic leading-relaxed">
                      {t('intro.description')}
                    </p>
                  </div>
                </div>

                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group">
                  <CardContent className="p-10 space-y-8 bg-slate-50/30">
                    <Button 
                      size="xl"
                      className="w-full h-20 rounded-[2rem] bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 gap-4" 
                      onClick={startCamera}
                    >
                      <Camera className="h-6 w-6" />
                      {t('intro.openCamera')}
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.4em] italic">
                        <span className="bg-slate-50 px-6 text-slate-400">{t('intro.or')}</span>
                      </div>
                    </div>

                    <label className="block group/upload cursor-pointer">
                      <Button variant="outline" size="xl" className="w-full h-20 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[11px] italic shadow-sm hover:bg-slate-50 transition-all group-hover/upload:border-pink-500/20 gap-4" asChild>
                        <span>
                          <Upload className="h-6 w-6 text-slate-300 group-hover/upload:text-pink-600 transition-colors" />
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

                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                    {t('intro.privacyNote')}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Capture interface */}
            {step === 'capture' && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-black text-slate-950 italic uppercase tracking-tight leading-none">{t('capture.title')}</h2>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('capture.subtitle')}</p>
                </div>

                <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-80"
                  />
                  {/* Face guide overlay interface */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 border-2 border-white/20 rounded-[50%] relative">
                      <div className="absolute inset-0 border-2 border-dashed border-pink-500/30 rounded-[50%] animate-spin-slow" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-4">
                        <Badge className="bg-white/10 backdrop-blur-md border-none text-white text-[8px] font-black uppercase tracking-widest">Alignment Node</Badge>
                      </div>
                    </div>
                  </div>
                  {/* Neural status interface */}
                  <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Signal: Nominal</span>
                      </div>
                      <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                        <motion.div animate={{ width: "85%" }} className="h-full bg-blue-500" />
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                      <Fingerprint className="h-5 w-5 text-white/40" />
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <Button 
                  size="xl"
                  className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none" 
                  onClick={capturePhoto}
                >
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mr-4">
                    <Camera className="h-5 w-5" />
                  </div>
                  {t('capture.button')}
                </Button>
              </motion.div>
            )}

            {/* Preview interface */}
            {capturedImage && step !== 'analyzing' && step !== 'done' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-black text-slate-950 italic uppercase tracking-tight leading-none">{t('preview.title')}</h2>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('preview.subtitle')}</p>
                </div>

                <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden border-4 border-white shadow-premium">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-10 left-10">
                    <Badge className="bg-pink-500 text-white border-none italic font-black text-[9px] px-4 py-1 rounded-full uppercase tracking-widest">Unit_Captured</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Button 
                    variant="outline" 
                    size="xl"
                    className="h-18 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm hover:bg-slate-50 transition-all"
                    onClick={() => {
                      setCapturedImage(null)
                      startCamera()
                    }}
                  >
                    {t('preview.retake')}
                  </Button>
                  <Button 
                    size="xl"
                    className="h-18 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white font-black uppercase tracking-[0.2em] text-[10px] italic shadow-2xl shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
                    onClick={performAnalysis}
                  >
                    {t('preview.analyze')}
                    <ArrowRight className="h-4 w-4 ml-3" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Analyzing interface */}
            {step === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 space-y-12"
              >
                <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-pink-100 animate-ping opacity-20" />
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-blue-500/30 animate-spin-slow" />
                  <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-pink-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-pink-500/30">
                    <Sparkles className="h-12 w-12 text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('analyzing.title')}</h2>
                  <p className="text-lg text-slate-500 font-light italic leading-relaxed">{t('analyzing.subtitle')}</p>
                  <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-slate-50 text-[9px] font-black uppercase tracking-[0.3em] italic">{t('analyzing.wait')}</Badge>
                </div>
              </motion.div>
            )}

            {/* Done interface */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-12 py-12"
              >
                <div className="space-y-8">
                  <div className="mx-auto h-28 w-28 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 animate-glow-pulse">
                    <CheckCircle2 className="h-14 w-14" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('done.title')}</h2>
                    <p className="text-xl text-slate-500 font-light italic leading-relaxed">
                      {t('done.subtitle')}
                    </p>
                  </div>
                </div>
                
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                  <CardContent className="p-10 space-y-8 bg-slate-50/30">
                    <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm">
                        <Activity className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-black italic text-slate-950 uppercase tracking-tight leading-none">{t('done.nextSteps')}</h3>
                    </div>
                    <ul className="space-y-6 text-left ml-4">
                      {[
                        t('done.step1'),
                        t('done.step2'),
                        t('done.step3')
                      ].map((step, i) => (
                        <li key={i} className="flex items-center gap-5 group/item">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/30 group-hover/item:scale-150 group-hover/item:bg-emerald-500 transition-all duration-500 shadow-glow-emerald/20" />
                          <span className="text-base text-slate-600 font-medium italic group-hover:text-slate-950 transition-colors">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Button size="xl" variant="premium" className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none">
                  Close Terminal Node
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  )
}
