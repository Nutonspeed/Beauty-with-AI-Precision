"use client"

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel
export const dynamic = "force-dynamic"
export const revalidate = 0

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TreatmentSimulator } from "@/components/ar/treatment-simulator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { motion } from "framer-motion"

export default function ARSimulatorPage() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const isThaiLocale = locale === 'th'
  const language = locale as 'th' | 'en'
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container relative z-10 py-12 md:py-20">
          {/* Back Button - Sophisticated Style */}
          <Link href={lp('/analysis')} className="inline-flex items-center gap-3 text-slate-500 hover:text-primary transition-colors mb-10 group">
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/30 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">{t('arSimulator.backToAnalysis')}</span>
          </Link>

          {/* Header Section */}
          <div className="text-center mb-16 space-y-6">
            <Badge variant="premium" className="px-6 py-1.5 shadow-glow-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('arSimulator.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {isThaiLocale ? 'ระบบจำลอง' : 'Clinical'} <span className="text-primary text-elevated">{t('arSimulator.clinicalAr')}</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              {t('arSimulator.description')}
            </p>
          </div>

          {/* Content Area */}
          {!uploadedImage ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="glass-panel border-white/5 overflow-hidden">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-white">
                    {t('arSimulator.uploadImage')}
                  </CardTitle>
                  <p className="text-slate-500 text-sm font-light">{t('arSimulator.assetSynthesisDesc')}</p>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div 
                    className="group relative border-2 border-dashed border-white/10 rounded-[2rem] p-16 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all duration-500"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-6">
                      <div className="mx-auto h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                        <Upload className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-medium text-white group-hover:text-primary transition-colors">
                          {t('arSimulator.clickToUpload')}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">
                          {t('arSimulator.supports')}
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                      <span className="bg-[#020617] px-4 text-slate-600">{t('arSimulator.calibrationProtocol')}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">
                      {t('arSimulator.orUseSample')}
                    </p>
                    <Button 
                      variant="outline"
                      className="glass px-10 h-12 text-xs font-bold uppercase tracking-widest"
                      onClick={() => setUploadedImage("/images/samples/face-sample.jpg")}
                    >
                      {t('arSimulator.useSampleImage')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-10"
            >
              <div className="glass-panel border-primary/20 rounded-[2.5rem] overflow-hidden p-1 shadow-glow-primary">
                <TreatmentSimulator 
                  beforeImage={uploadedImage}
                  locale={language}
                  onExport={(image) => {
                    const link = document.createElement('a')
                    link.download = 'clinical-simulation.png'
                    if (image instanceof Blob) {
                      link.href = URL.createObjectURL(image)
                    } else {
                      link.href = image
                    }
                    link.click()
                  }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="outline"
                  className="glass px-8 h-12 uppercase tracking-widest font-bold text-xs"
                  onClick={() => setUploadedImage(null)}
                >
                  {t('arSimulator.uploadNewImage')}
                </Button>
                <Link href={lp('/analysis')}>
                  <Button variant="premium" className="px-8 h-12 uppercase tracking-widest font-black text-xs shadow-glow-primary">
                    {t('arSimulator.finalizeTreatment')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
