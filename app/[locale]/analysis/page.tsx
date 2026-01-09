"use client"

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#020617]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative h-20 w-20 mx-auto">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <GradientSpinner size="lg" className="relative" />
            </div>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">{t('analysis.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      {/* Precision Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Tutorial Wrapper */}
      <AnalysisTutorialWrapper />

      <main className="flex-1 relative overflow-hidden">
        {/* Advanced Medical Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none animate-float" />

        <section className="container relative z-10 py-20 md:py-32">
          <div className="mx-auto max-w-6xl space-y-20">
            {/* Cinematic Header Section */}
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-bold shadow-lg shadow-pink-500/5">
                  <Activity className="mr-2 h-3.5 w-3.5 animate-pulse" />
                  {t('analysis.heroBadge')}
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-[1.1]"
              >
                <span className="block mb-2">{t('analysis.title')}</span>
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent italic">
                  Precision Engine
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide"
              >
                {t('analysis.description')}
              </motion.p>
            </div>

            {!isLoggedIn && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.02] p-8 backdrop-blur-xl group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="h-24 w-24 text-amber-500" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner">
                    <Info className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-amber-400 uppercase tracking-[0.2em] text-xs font-black mb-2">
                      {t('analysis.trialMode.title')}
                    </h4>
                    <p className="text-amber-200/70 text-lg font-light leading-relaxed">
                      {t('analysis.trialMode.description')}
                    </p>
                  </div>
                  <Button variant="premium" size="lg" asChild className="shrink-0 h-14 px-10 rounded-full shadow-2xl shadow-amber-500/10 hover:scale-105 active:scale-95 transition-transform">
                    <Link href={lp("/auth/login")}>{t('analysis.authNow')}</Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* High-Tech Practical Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-colors">
                  <CardHeader className="bg-white/[0.03] border-b border-white/5 p-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.25em] flex items-center gap-4 text-pink-400">
                      <div className="p-2 bg-pink-500/10 rounded-lg">
                        <Camera className="h-5 w-5" />
                      </div>
                      {t('analysis.guidance.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <ul className="grid grid-cols-1 gap-6">
                      {[
                        { key: 'orientation', icon: Crosshair },
                        { key: 'radius', icon: Activity },
                        { key: 'tension', icon: Brain },
                        { key: 'optical', icon: Sparkles }
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-6 group/item">
                          <div className="h-12 w-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 group-hover/item:border-pink-500/30 group-hover/item:bg-pink-500/5 transition-all duration-500">
                            <item.icon className="h-5 w-5 text-slate-500 group-hover/item:text-pink-400 transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white uppercase tracking-widest group-hover/item:text-pink-400 transition-colors">
                              {t(`analysis.guidance.items.${item.key}`)}
                            </p>
                            <div className="h-px w-8 bg-pink-500/20 group-hover/item:w-full transition-all duration-700" />
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
              >
                <LightingQualityChecker />
              </motion.div>
            </div>

            {/* Interaction Panel - The Core Clinical Experience */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="relative rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="p-1">
                  <AnalysisInteractionPanel isLoggedIn={isLoggedIn} />
                </div>
              </div>
            </motion.div>

            {/* Professional Medical Disclosure */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent p-10 backdrop-blur-md"
            >
              <div className="flex items-center gap-6 mb-10">
                <div className="h-14 w-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shadow-lg shadow-pink-500/5">
                  <Lightbulb className="h-7 w-7 text-pink-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white italic">{t('analysis.bestPractices.title')}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
                {[
                  'illumination',
                  'preparation',
                  'consistency',
                  'verification'
                ].map((key, i) => (
                  <div key={i} className="group/disclosure">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-pink-500 mb-3 group-hover/disclosure:translate-x-1 transition-transform">
                      {t(`analysis.bestPractices.items.${key}.title`)}
                    </h4>
                    <p className="text-[16px] text-slate-400 font-light leading-relaxed group-hover/disclosure:text-slate-300 transition-colors">
                      {t(`analysis.bestPractices.items.${key}.desc`)}
                    </p>
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
