"use client"

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel
export const dynamic = "force-dynamic"
export const revalidate = 0

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProgramSimulator } from "@/components/ar/program-simulator"
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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          {/* Clinical Back Navigation */}
          <Link href={lp('/analysis')} className="inline-flex items-center gap-4 text-slate-500 hover:text-pink-400 transition-all mb-16 group">
            <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-pink-500/30 group-hover:bg-pink-500/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('arSimulator.backToAnalysis')}</span>
          </Link>

          {/* Precision Header Section */}
          <div className="text-center mb-24 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Sparkles className="mr-3 h-3.5 w-3.5 animate-pulse" />
                {t('arSimulator.badge')}
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-tight"
            >
              {isThaiLocale ? 'ระบบจำลอง' : 'Aesthetic'} <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent italic">{t('arSimulator.aestheticAr')}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
            >
              {t('arSimulator.description')}
            </motion.p>
          </div>

          {/* Diagnostic Content Area */}
          {!uploadedImage ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto"
            >
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="text-center pt-12 pb-4">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight">
                    {t('arSimulator.uploadImage')}
                  </CardTitle>
                  <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em] mt-2">{t('arSimulator.assetSynthesisDesc')}</p>
                </CardHeader>
                <CardContent className="p-12 pt-8 space-y-10">
                  <div 
                    className="group relative border-2 border-dashed border-white/5 rounded-[2.5rem] p-20 text-center cursor-pointer hover:border-pink-500/30 hover:bg-pink-500/5 transition-all duration-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-pink-500/[0.02] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-8">
                      <div className="mx-auto h-24 w-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-pink-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-inner">
                        <Upload className="h-10 w-10" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-2xl font-bold text-white group-hover:text-pink-400 transition-colors tracking-tight">
                          {t('arSimulator.clickToUpload')}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">
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
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
                      <span className="bg-[#020617] px-6 text-slate-600">{t('arSimulator.calibrationProtocol')}</span>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-[0.3em] font-black">
                      {t('arSimulator.orUseSample')}
                    </p>
                    <Button 
                      variant="outline"
                      className="h-14 px-12 rounded-2xl border-white/10 bg-white/5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-pink-500/20 transition-all hover:scale-105 active:scale-95"
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
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-6xl mx-auto space-y-16"
            >
              <div className="relative rounded-[3rem] border border-pink-500/20 bg-white/[0.01] backdrop-blur-3xl overflow-hidden p-1 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
                <ProgramSimulator 
                  beforeImage={uploadedImage}
                  locale={language}
                  onExport={(image) => {
                    const link = document.createElement('a')
                    link.download = 'aesthetic-simulation.png'
                    if (image instanceof Blob) {
                      link.href = URL.createObjectURL(image)
                    } else {
                      link.href = image
                    }
                    link.click()
                  }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Button 
                  variant="outline"
                  className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-pink-500/20 transition-all hover:scale-105 active:scale-95"
                  onClick={() => setUploadedImage(null)}
                >
                  {t('arSimulator.uploadNewImage')}
                </Button>
                <Link href={lp('/analysis')}>
                  <Button variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">
                    {t('arSimulator.finalizeProgram')}
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
