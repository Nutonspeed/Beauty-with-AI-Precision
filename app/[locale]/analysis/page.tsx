"use client"

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel
export const dynamic = 'force-dynamic'

import { AIErrorBoundary } from "@/components/error-boundary"
import { AnalysisTutorialWrapper } from "@/components/tutorial/analysis-tutorial-wrapper"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LightingQualityChecker } from "@/components/lighting-quality-checker"
import { AnalysisInteractionPanel } from "@/components/analysis-interaction-panel"
import { Info, Lightbulb, Camera, ShieldCheck, Activity, Brain, Sparkles, Crosshair } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, useScroll, useSpring } from "framer-motion"
import { GradientSpinner } from "@/components/ui/modern-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale, useTranslations } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"

function AnalysisContent() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const isThaiLocale = locale === 'th'
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setIsLoggedIn(true) // Temp for demo during development if needed, but better keep logic
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative h-20 w-20 mx-auto">
              <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
              <GradientSpinner size="lg" className="relative" />
            </div>
            <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-[10px] italic">{t('analysis.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
      <Header />
      
      {/* Precision Progress Bar - High-End Aesthetic */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 z-[60] origin-left shadow-glow-pink/20"
        style={{ scaleX }}
      />

      {/* Tutorial Wrapper */}
      <AnalysisTutorialWrapper />

      <main className="flex-1 relative overflow-hidden">
        {/* Advanced Medical Background - Light Theme */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none animate-float" />

        <section className="container relative z-10 py-20 md:py-32">
          <div className="mx-auto max-w-6xl space-y-24">
            {/* Cinematic Header Section */}
            <div className="text-center space-y-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse">
                  <Activity className="mr-3 h-3.5 w-3.5" />
                  {t('analysis.heroBadge')}
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic"
              >
                <span className="block mb-4">{t('analysis.title')}</span>
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic uppercase text-3xl md:text-5xl tracking-[0.3em] block mt-4">
                  Precision Engine
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-500 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-tight italic"
              >
                {t('analysis.description')}
              </motion.p>
            </div>

            {!isLoggedIn && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[3rem] border border-pink-500/20 bg-pink-500/[0.02] p-10 backdrop-blur-xl group shadow-premium"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                  <ShieldCheck className="h-32 w-32 text-pink-500" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                  <div className="h-20 w-20 rounded-[2rem] bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
                    <Info className="h-10 w-10 text-pink-600" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h4 className="text-pink-600 uppercase tracking-[0.3em] text-[10px] font-black italic">
                      {t('analysis.trialMode.title')}
                    </h4>
                    <p className="text-slate-600 text-xl font-light leading-relaxed italic">
                      {t('analysis.trialMode.description')}
                    </p>
                  </div>
                  <Button variant="premium" size="lg" asChild className="shrink-0 h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px]">
                    <Link href={lp("/auth/login")}>{t('analysis.authNow')}</Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* High-Tech Practical Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group hover:border-pink-500/20 transition-all duration-700">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-10">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-5 text-pink-600 italic">
                      <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                        <Camera className="h-6 w-6" />
                      </div>
                      {t('analysis.guidance.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                    <ul className="grid grid-cols-1 gap-8">
                      {[
                        { key: 'orientation', icon: Crosshair },
                        { key: 'radius', icon: Activity },
                        { key: 'tension', icon: Brain },
                        { key: 'optical', icon: Sparkles }
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-8 group/item">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover/item:border-pink-500/30 group-hover/item:bg-pink-500/5 transition-all duration-700 shadow-sm">
                            <item.icon className="h-6 w-6 text-slate-400 group-hover/item:text-pink-600 transition-colors" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover/item:text-pink-600 transition-colors italic">
                              {t(`analysis.guidance.items.${item.key}`)}
                            </p>
                            <div className="h-[2px] w-12 bg-slate-100 group-hover/item:w-full group-hover/item:bg-gradient-to-r group-hover/item:from-pink-500 group-hover/item:to-blue-600 transition-all duration-700" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="h-full"
              >
                <div className="h-full rounded-[3rem] shadow-premium overflow-hidden">
                  <LightingQualityChecker />
                </div>
              </motion.div>
            </div>

            {/* Interaction Panel - The Core Aesthetic Experience */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-600/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="relative rounded-[3.5rem] border border-slate-100 bg-white shadow-premium overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <div className="p-2 md:p-4">
                  <AnalysisInteractionPanel isLoggedIn={isLoggedIn} />
                </div>
              </div>
            </motion.div>

            {/* Professional Medical Disclosure */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-[3rem] border border-slate-100 bg-slate-50/30 p-12 backdrop-blur-md shadow-premium"
            >
              <div className="flex items-center gap-8 mb-12">
                <div className="h-16 w-16 rounded-[1.5rem] bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shadow-lg shadow-pink-500/5">
                  <Lightbulb className="h-8 w-8 text-pink-600" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-950 italic">{t('analysis.bestPractices.title')}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-x-20 gap-y-12">
                {[
                  'illumination',
                  'preparation',
                  'consistency',
                  'verification'
                ].map((key, i) => (
                  <div key={i} className="group/disclosure space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 group-hover/disclosure:translate-x-2 transition-transform italic">
                      {t(`analysis.bestPractices.items.${key}.title`)}
                    </h4>
                    <p className="text-lg text-slate-500 font-light leading-relaxed group-hover/disclosure:text-slate-900 transition-colors italic">
                      {t(`analysis.bestPractices.items.${key}.desc`)}
                    </p>
                    <div className="h-1 w-8 bg-slate-200 rounded-full group-hover/disclosure:w-16 group-hover/disclosure:bg-pink-500 transition-all duration-500" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <AIErrorBoundary>
      <AnalysisContent />
    </AIErrorBoundary>
  )
}
