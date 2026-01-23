"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProgramSimulator } from "@/components/ar/program-simulator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, ArrowLeft, Zap, Scan, Monitor } from "lucide-react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { cn } from "@/lib/utils"

export default function ARSimulatorPage() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const isThaiLocale = locale === 'th'
  const language = locale as 'th' | 'en'
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Aesthetic Back Navigation */}
          <Link href={lp('/analysis')} className="inline-flex items-center gap-6 text-slate-400 hover:text-pink-600 transition-all group italic">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-pink-500/30 group-hover:bg-pink-50 transition-all shadow-sm">
              <ArrowLeft className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] block leading-none">Sequence_Back</span>
              <span className="text-sm font-light leading-none">{t('arSimulator.backToAnalysis' as any) || 'Return to Diagnostic Engine'}</span>
            </div>
          </Link>

          {/* Precision Header Section */}
          <div className="text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Sparkles className="mr-3 h-3.5 w-3.5" />
                Dimensional Synthesis Module
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase"
            >
              Aesthetic<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">AR_Simulator</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl text-slate-500 font-light max-w-2xl mx-auto italic leading-relaxed tracking-tight"
            >
              Visualize potential biological transformations through real-time augmentation and precision-calibrated outcome mapping.
            </motion.p>
          </div>

          {/* Diagnostic Content Area */}
          <AnimatePresence mode="wait">
            {!uploadedImage ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto"
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="text-center p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="space-y-4">
                      <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                        Parameter Ingestion
                      </CardTitle>
                      <p className="text-pink-600 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        Initialize volumetric data node transmission
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-12 lg:p-16 space-y-12">
                    <div 
                      className="group relative border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center cursor-pointer hover:border-pink-500/30 hover:bg-pink-50/30 transition-all duration-700 shadow-inner overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.02] via-transparent to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative z-10 space-y-10">
                        <div className="mx-auto h-32 w-28 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-pink-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-sm group-hover:border-pink-100">
                          <Upload className="h-14 w-14" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-3xl font-black text-slate-950 group-hover:text-pink-600 transition-colors tracking-tight italic uppercase leading-none">
                            Synchronize Entity Photo
                          </p>
                          <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.4em] italic">
                            Compatible Formats: JPG, PNG, WEBP Node Data
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
                        <span className="w-full border-t border-slate-100" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.4em] italic">
                        <span className="bg-white px-10 text-slate-300">Calibration Protocol</span>
                      </div>
                    </div>

                    <div className="text-center pt-4 space-y-10">
                      <p className="text-[11px] text-slate-400 uppercase tracking-[0.3em] font-black italic">
                        Or deploy from baseline library
                      </p>
                      <Button 
                        variant="outline"
                        size="xl"
                        className="h-20 px-16 rounded-2xl border-slate-200 bg-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-pink-500/30 transition-all hover:scale-105 active:scale-95 shadow-premium italic text-slate-950"
                        onClick={() => setUploadedImage("/test-face.jpg")}
                      >
                        <Scan className="mr-4 h-6 w-6 text-pink-600" />
                        Use Baseline Sample Node
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                key="simulator"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl mx-auto space-y-16"
              >
                <div className="relative rounded-[4rem] border border-slate-100 bg-white shadow-premium overflow-hidden p-2 group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                  <div className="rounded-[3.5rem] overflow-hidden border border-slate-50 relative">
                    <ProgramSimulator 
                      beforeImage={uploadedImage}
                      locale={language}
                      onExport={(image) => {
                        const link = document.createElement('a')
                        link.download = 'aesthetic-simulation-node.png'
                        if (image instanceof Blob) {
                          link.href = URL.createObjectURL(image)
                        } else {
                          link.href = image
                        }
                        link.click()
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                  <Button 
                    variant="outline"
                    size="xl"
                    className="h-20 px-12 rounded-[2rem] border-slate-200 bg-white text-slate-950 hover:bg-slate-50 hover:border-pink-500/30 transition-all hover:scale-105 active:scale-95 shadow-premium italic font-black uppercase tracking-[0.2em] text-[11px]"
                    onClick={() => setUploadedImage(null)}
                  >
                    <ArrowLeft className="mr-4 h-5 w-5" />
                    Reset Data Link
                  </Button>
                  <Button 
                    variant="premium" 
                    size="xl"
                    className="h-20 px-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic"
                    asChild
                  >
                    <Link href={lp('/analysis')}>
                      <Zap className="mr-4 h-6 w-6" />
                      Finalize Program Sequence
                    </Link>
                  </Button>
                </div>

                {/* Additional Simulator Context Nodes interface */}
                <div className="grid md:grid-cols-3 gap-8 pt-12">
                  {[
                    { label: 'Simulation Fidelity', val: '98.2%', icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Diagnostic Weight', val: '468_POINT', icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Inference Latency', val: '0.04s', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' }
                  ].map((m, i) => (
                    <Card key={i} className="border-slate-100 bg-white/80 backdrop-blur-md shadow-sm rounded-[2.5rem] p-8 space-y-6 group/stat hover:border-pink-500/20 transition-all duration-700">
                      <div className="flex items-center justify-between">
                        <div className={cn("p-2 rounded-xl border border-slate-100 shadow-inner", m.bg)}>
                          <m.icon className={cn("h-5 w-5", m.color)} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/stat:text-slate-950 transition-colors italic">{m.label}</span>
                      </div>
                      <div className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none", m.color)}>{m.val}</div>
                    </Card>
                  ))}
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
