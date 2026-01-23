"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Gift,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/context'
import { useTranslations, useLocale } from 'next-intl'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

interface CreditInfo {
  has_credits: boolean
  remaining: number
  total_credits: number
  total_used: number
}

export default function SkinAnalysisPage() {
  const t = useTranslations('customerAnalysis')
  const navT = useTranslations('nav')
  const commonT = useTranslations('common')
  const locale = useLocale()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null)
  const [creditLoading, setCreditLoading] = useState(true)

  // Check customer credits
  useEffect(() => {
    async function checkCredits() {
      if (!user) return
      setCreditLoading(true)
      try {
        const response = await fetch('/api/credits/check?type=analysis')
        const data = await response.json()
        if (data.success) {
          setCreditInfo(data)
        }
      } catch (error) {
        console.error('Error checking credits:', error)
      } finally {
        setCreditLoading(false)
      }
    }
    
    if (user) {
      checkCredits()
    }
  }, [user])

  useEffect(() => {
    if (authLoading && !user) return
    
    if (!user || (!user.role?.startsWith('customer') && user.role !== 'public')) {
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }, [user, authLoading])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalysis = async () => {
    if (!imagePreview) return
    
    // Check if customer has credits
    if (!creditInfo?.has_credits) {
      alert(t('credits.noCreditsAlert'))
      return
    }
    
    setIsAnalyzing(true)
    
    // Use credit before analysis
    try {
      const creditResponse = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analysis' })
      })
      const creditResult = await creditResponse.json()
      
      if (!creditResult.success) {
        alert(creditResult.message || t('credits.useFailedAlert'))
        setIsAnalyzing(false)
        return
      }
      
      // Update credit info
      setCreditInfo(prev => prev ? {
        ...prev,
        remaining: creditResult.credits_remaining,
        total_used: prev.total_used + 1
      } : null)
    } catch (error) {
      console.error('Error using credit:', error)
      setIsAnalyzing(false)
      return
    }
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResults({
        skinScore: 85,
        conditions: [
          { name: 'Acne', severity: 'mild', confidence: 0.75 },
          { name: 'Dryness', severity: 'moderate', confidence: 0.82 },
          { name: 'Fine Lines', severity: 'minimal', confidence: 0.45 }
        ],
        recommendations: [
          'Use gentle cleanser twice daily',
          'Apply moisturizer with hyaluronic acid',
          'Use sunscreen SPF 30+ daily',
          'Consider weekly hydrating mask'
        ],
        products: [
          { name: 'Gentle Cleanser', brand: 'DermCare', price: 450 },
          { name: 'Hydrating Serum', brand: 'SkinLab', price: 1200 },
          { name: 'SPF 50 Sunscreen', brand: 'SunGuard', price: 650 }
        ]
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Initializing Analysis Engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-6xl mx-auto flex-1">
          {/* Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Sparkles className="mr-3 h-3.5 w-3.5" />
                Aesthetic Diagnostic Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                {navT('analysis')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Sequencer</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {t('flow.startDesc')}
              </p>
            </motion.div>

            {/* Credit Status Interface */}
            <div className="shrink-0 flex flex-col items-center lg:items-end gap-4">
              {!creditLoading ? (
                <div className="inline-flex items-center gap-4 px-8 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner group">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-700 group-hover:scale-110",
                    creditInfo?.has_credits ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                  )}>
                    <Gift className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Analysis Quota</p>
                    <p className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
                      {creditInfo?.has_credits 
                        ? t('credits.remaining', { count: creditInfo.remaining })
                        : t('credits.none')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-4 px-8 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('credits.checking')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16">
            {!analysisResults ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50 text-center">
                    <div className="space-y-4">
                      <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{t('flow.startTitle')}</CardTitle>
                      <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{t('flow.startDesc')}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 space-y-12 bg-slate-50/30">
                    {/* Image Ingestion Node */}
                    <div className={cn(
                      "border-2 border-dashed rounded-[3rem] p-12 text-center transition-all duration-700 bg-white group/upload relative overflow-hidden",
                      imagePreview ? "border-pink-500/30 shadow-premium" : "border-slate-200 hover:border-pink-500/20 shadow-inner"
                    )}>
                      {imagePreview ? (
                        <div className="space-y-8 relative z-10">
                          <div className="relative aspect-square max-w-sm mx-auto rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl transition-transform duration-1000 group-hover/upload:scale-[1.02]">
                            <img 
                              src={imagePreview} 
                              alt="Skin preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          </div>
                          <Button 
                            onClick={() => setImagePreview(null)}
                            variant="outline"
                            className="h-14 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50"
                          >
                            {t('flow.differentImage')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-10 relative z-10">
                          <div className="mx-auto h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/upload:scale-110 group-hover/upload:bg-pink-50 group-hover/upload:border-pink-100 transition-all duration-700">
                            <Camera className="h-12 w-12 text-slate-200 group-hover/upload:text-pink-600 transition-colors" />
                          </div>
                          <div className="space-y-6">
                            <label htmlFor="image-upload" className="cursor-pointer inline-block">
                              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white px-12 py-5 rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-pink-500/20 border-none italic">
                                <Upload className="w-5 h-5" />
                                {t('flow.chooseImage')}
                              </span>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('flow.dragDrop')}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Analysis Sequence Trigger */}
                    {imagePreview && (
                      <Button 
                        onClick={handleAnalysis}
                        disabled={isAnalyzing}
                        className="w-full h-20 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic"
                      >
                        {isAnalyzing ? (
                          <div className="flex items-center gap-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            {t('flow.analyzing')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <Play className="w-6 h-6" />
                            {t('flow.startBtn')}
                          </div>
                        )}
                      </Button>
                    )}

                    {/* Diagnostic Protocol Tips */}
                    <Card className="border-slate-100 bg-white shadow-inner rounded-[2.5rem] p-10 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <h4 className="text-xl font-black italic text-slate-950 uppercase tracking-tighter leading-none">{t('flow.tips.title')}</h4>
                      </div>
                      <ul className="space-y-4 ml-4">
                        {(t.raw('flow.tips.list') as string[]).map((tip, i) => (
                          <li key={i} className="flex items-start gap-4 group/tip">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 group-hover/tip:bg-blue-600 transition-all duration-500 mt-1.5" />
                            <p className="text-sm text-slate-500 font-light italic leading-relaxed group-hover/tip:text-slate-950 transition-colors">{tip}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Results Header Protocol */}
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                  <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 text-center space-y-8">
                    <div className="flex items-center justify-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-pulse">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h2 className="text-4xl font-black text-emerald-600 italic uppercase tracking-tighter leading-none">{t('results.complete')}</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full" />
                        <div className="relative text-8xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
                          {analysisResults.skinScore}<span className="text-3xl font-bold opacity-20 ml-2">/100</span>
                        </div>
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('results.yourScore')}</p>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Skin Conditions Protocol */}
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-blue-500/10 group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                      <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-5">
                        <div className="p-3 bg-blue-50 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-700">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        {t('results.conditionsTitle')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12 space-y-8 bg-slate-50/30">
                      {analysisResults.conditions.map((condition: any, index: number) => (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-500/20 transition-all duration-700 relative overflow-hidden group/item">
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-50 group-hover/item:bg-blue-600 transition-all duration-700" />
                          <div className="space-y-2 relative z-10">
                            <h4 className="font-black text-slate-950 text-xl italic uppercase group-hover/item:text-blue-600 transition-colors leading-none">{condition.name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('results.confidence')}: {Math.round(condition.confidence * 100)}%</p>
                          </div>
                          <Badge className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic relative z-10",
                            condition.severity === 'mild' ? "bg-emerald-50 text-emerald-600" : 
                            condition.severity === 'moderate' ? "bg-amber-50 text-amber-600" : 
                            "bg-rose-50 text-rose-600"
                          )}>
                            {condition.severity}
                          </Badge>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Personalized Recommendations Architecture */}
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10 group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                      <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-5">
                        <div className="p-3 bg-pink-50 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-700">
                          <Award className="h-6 w-6 text-pink-600" />
                        </div>
                        {t('results.personalizedRecommendations')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12 space-y-6 bg-slate-50/30">
                      {analysisResults.recommendations.map((rec: string, index: number) => (
                        <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-pink-500/20 transition-all duration-700 relative overflow-hidden group/rec">
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-50 group-hover/rec:bg-pink-600 transition-all duration-700" />
                          <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 shadow-inner group-hover/rec:scale-110 transition-transform duration-700 relative z-10">
                            <CheckCircle className="w-6 h-6 text-pink-600" />
                          </div>
                          <p className="text-lg text-slate-900 font-light italic leading-relaxed relative z-10 group-hover/rec:text-slate-950 transition-colors">{rec}</p>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Product Curation Protocol */}
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-purple-500/10 group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                    <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-5">
                      <div className="p-3 bg-purple-50 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-700">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      {t('results.productsTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      {analysisResults.products.map((product: any, index: number) => (
                        <motion.div key={index} whileHover={{ y: -8 }} transition={{ duration: 0.5 }} className="bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-purple-500/20 hover:shadow-premium transition-all duration-700 space-y-8 relative overflow-hidden group/product">
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover/product:opacity-100 transition-opacity" />
                          <div className="space-y-3">
                            <h4 className="font-black text-2xl text-slate-950 italic uppercase tracking-tight leading-none group-hover/product:text-purple-600 transition-colors">{product.name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{product.brand}</p>
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
                              <span className="text-lg mr-1 font-bold opacity-50">฿</span>
                              {product.price.toLocaleString()}
                            </div>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:text-purple-600 transition-all duration-500 shadow-inner group-hover/product:scale-110">
                              <ChevronRight className="h-6 w-6" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Final Control Sequence */}
                <div className="flex flex-col sm:flex-row gap-8 pt-8">
                  <Button className="flex-1 h-20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white shadow-2xl shadow-pink-500/20 rounded-[2.5rem] font-black tracking-[0.3em] uppercase text-[11px] transition-all hover:scale-105 active:scale-95 italic" size="xl">
                    <Save className="w-6 h-6 mr-4" />
                    {commonT('save')} {navT('analysis')}
                  </Button>
                  <Button variant="outline" className="flex-1 h-20 border-slate-200 bg-white text-slate-950 hover:bg-slate-50 rounded-[2.5rem] font-black tracking-[0.3em] uppercase text-[11px] shadow-premium italic transition-all hover:scale-105 active:scale-95" size="xl" onClick={() => {
                    setAnalysisResults(null)
                    setImagePreview(null)
                  }}>
                    <RefreshCw className="w-6 h-6 mr-4 text-pink-600" />
                    {t('results.newBtn')}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

// Fixed missing icon from lucide
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
