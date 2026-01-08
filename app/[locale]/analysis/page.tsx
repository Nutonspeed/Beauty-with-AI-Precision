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
import { Info, Lightbulb, Camera, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200">
      <Header />

      {/* Tutorial Wrapper */}
      <AnalysisTutorialWrapper />

      <main className="flex-1 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <section className="container relative z-10 py-16 md:py-24">
          <div className="mx-auto max-w-6xl space-y-12">
            {/* Header Section */}
            <div className="text-center space-y-6">
              <Badge variant="premium" className="px-6 py-1.5 shadow-glow-primary">
                {t('analysis.heroBadge')}
              </Badge>
              <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                {t('analysis.title')}
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                {t('analysis.description')}
              </p>
            </div>

            {!isLoggedIn && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel border-amber-500/20 bg-amber-500/5 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6"
              >
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Info className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-amber-200/90 text-sm font-medium leading-relaxed">
                    <strong className="text-amber-400 uppercase tracking-widest text-xs block mb-1">
                      {t('analysis.trialMode.title')}
                    </strong>
                    {t('analysis.trialMode.description')}
                  </div>
                </div>
                <Button variant="premium" size="sm" asChild className="shrink-0 shadow-lg shadow-amber-500/20">
                  <Link href={lp("/auth/login")}>{t('analysis.authNow')}</Link>
                </Button>
              </motion.div>
            )}

            {/* Practical Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-panel border-white/5 overflow-hidden group">
                <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                    <Camera className="h-4 w-4 text-primary" />
                    {t('analysis.guidance.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {[
                      { key: 'orientation' },
                      { key: 'radius' },
                      { key: 'tension' },
                      { key: 'optical' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 group/item">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">
                            {t(`analysis.guidance.items.${item.key}`)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <LightingQualityChecker />
            </div>

            {/* Interaction Panel - The Core Experience */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
              <AnalysisInteractionPanel isLoggedIn={isLoggedIn} />
            </div>

            {/* Professional Disclosure */}
            <div className="glass-panel border-white/5 p-8 rounded-[2.5rem] bg-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">{t('analysis.bestPractices.title')}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  'illumination',
                  'preparation',
                  'consistency',
                  'verification'
                ].map((key, i) => (
                  <div key={i} className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                      {t(`analysis.bestPractices.items.${key}.title`)}
                    </h4>
                    <p className="text-sm text-slate-400 font-light leading-relaxed">
                      {t(`analysis.bestPractices.items.${key}.desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
