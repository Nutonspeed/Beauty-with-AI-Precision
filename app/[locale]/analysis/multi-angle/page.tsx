"use client"

import { useState } from "react"
import { MultiAngleCamera, type CapturedView } from "@/components/ar/multi-angle-camera"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Camera, Zap, Box } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { AnalysisProgressIndicator } from "@/components/analysis/AnalysisProgressIndicator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useLocalizePath } from "@/lib/i18n/locale-link"

export default function MultiAngleAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const lp = useLocalizePath()
  const [capturedViews, setCapturedViews] = useState<CapturedView[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const locale = (params.locale as string) || "th"

  const handleCaptureComplete = async (views: CapturedView[]) => {
    console.log("[v0] Multi-angle capture complete:", views.length, "views")
    setCapturedViews(views)
  }

  const handleAnalyze = async () => {
    if (capturedViews.length !== 3) return

    setIsAnalyzing(true)

    try {
      console.log("[v0] Starting multi-angle analysis...")

      const response = await fetch("/api/skin-analysis/multi-angle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          views: capturedViews.map((v) => ({
            angle: v.angle,
            image: v.imageData,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed")
      }

      console.log("[v0] Multi-angle analysis complete:", result.id)
      router.push(`/${locale}/analysis/detail/${result.id}`)
    } catch (error) {
      console.error("[v0] Multi-angle analysis error:", error)
      alert("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
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

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-5xl mx-auto flex-1">
          {/* Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600" onClick={() => router.back()}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Box className="mr-3 h-3.5 w-3.5" />
                  Dimensional Scanning Node
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Multi-Angle<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Analysis Sequence</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                Synchronize comprehensive aesthetic data through VISIA-style 3-view volumetric capture.
              </p>
            </motion.div>
          </div>

          <div className="mt-16">
            <AnimatePresence mode="wait">
              {capturedViews.length === 0 ? (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group">
                    <CardContent className="p-0">
                      <MultiAngleCamera onComplete={handleCaptureComplete} />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 text-center space-y-4">
                      <div className="mx-auto h-16 w-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm mb-2">
                        <Camera className="h-8 w-8 text-pink-600" />
                      </div>
                      <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                        Captured Dimensional Views
                      </CardTitle>
                      <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                        Verify volumetric data alignment before processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {capturedViews.map((view) => (
                          <motion.div 
                            key={view.angle} 
                            whileHover={{ y: -8 }}
                            className="space-y-4 text-center group/view"
                          >
                            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-premium bg-white">
                              <Image
                                src={view.imageData || "/placeholder.svg"}
                                alt={`${view.angle} view`}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover/view:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/view:opacity-100 transition-all duration-700" />
                              <div className="absolute top-6 right-6">
                                <div className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm">
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] font-black text-slate-950 uppercase tracking-[0.3em] italic group-hover/view:text-pink-600 transition-colors">
                              {view.angle} Node View
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Analysis Progress Interface */}
                      {isAnalyzing ? (
                        <div className="py-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-inner">
                          <AnalysisProgressIndicator
                            autoStart={true}
                            showTimeEstimate={true}
                            showDescription={true}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                          <Button 
                            onClick={handleAnalyze} 
                            disabled={isAnalyzing} 
                            className="flex-1 h-20 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic"
                          >
                            <Zap className="w-6 h-6 mr-4" />
                            Initialize Analysis Sequence
                          </Button>
                          <Button 
                            onClick={() => setCapturedViews([])} 
                            variant="outline" 
                            disabled={isAnalyzing}
                            className="h-20 px-12 rounded-[2rem] border-slate-200 bg-white text-slate-950 hover:bg-slate-50 font-black uppercase tracking-[0.2em] text-[11px] transition-all italic shadow-premium"
                          >
                            Retake Capture
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
