"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Shield, Zap, Users, BarChart3, Camera, CheckCircle2, ArrowRight, Brain } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import RoiMiniCalculator from "@/components/roi/roi-mini-calculator"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion } from "framer-motion"

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const heroRef = useRef<HTMLElement | null>(null)
  const caseStudyRef = useRef<HTMLElement | null>(null)

  // Page view
  useEffect(() => {
    usageTracker.trackPageView("home")
  }, [])


  // Analytics: time in hero viewport -> usageTracker
  useEffect(() => {
    if (globalThis.window === undefined) { return }
    const el = heroRef.current
    if (!el) return
    let inView = false
    let enterAt = 0
    let total = 0
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.2)
        const now = performance.now()
        if (vis && !inView) { inView = true; enterAt = now }
        else if (!vis && inView) { inView = false; total += now - enterAt }
      },
      { root: null, threshold: [0, 0.2, 0.5, 1] }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      try {
        const ms = Math.round(total)
        usageTracker.trackEvent({
          event: "hero_time_in_view_ms",
          category: "engagement",
          metadata: { page: "home", ms },
        })
      } catch {}
    }
  }, [])

  // Analytics: scroll depth -> usageTracker
  useEffect(() => {
    if (globalThis.window === undefined) { return }
    let maxDepth = 0
    const onScroll = () => {
      const h = document.documentElement
      const docH = h.scrollHeight - h.clientHeight
      if (docH <= 0) return
      const depth = Math.min(100, Math.round((globalThis.scrollY / docH) * 100))
      if (depth > maxDepth) {
        maxDepth = depth
        if (depth === 25 || depth === 50 || depth === 75 || depth === 100) {
          try {
            usageTracker.trackEvent({
              event: "page_scroll_depth",
              category: "engagement",
              metadata: { page: "home", depth },
            })
          } catch {}
        }
      }
    }
    globalThis.addEventListener("scroll", onScroll as EventListener, { passive: true } as AddEventListenerOptions)
    onScroll()
    return () => globalThis.removeEventListener("scroll", onScroll as EventListener)
  }, [])


  const onHeroCta = () => {
    try {
      usageTracker.trackEvent({
        event: "hero_primary_cta_click",
        category: "engagement",
        metadata: { page: "home" },
      })
    } catch {}
  }

  const onDemoCta = () => {
    try {
      usageTracker.trackEvent({
        event: "hero_secondary_cta_click",
        category: "engagement",
        metadata: { page: "home" },
      })
    } catch {}
  }

  // Case study teaser view tracking (fire once)
  useEffect(() => {
    if (globalThis.window === undefined) { return }
    const el = caseStudyRef.current
    if (!el) return
    let fired = false
    const io = new IntersectionObserver(
      (entries) => {
        if (fired) return
        const vis = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.3)
        if (vis) {
          fired = true
          try {
            usageTracker.trackEvent({
              event: "case_study_view",
              category: "engagement",
              metadata: { page: "home", position: "teaser" },
            })
          } catch {}
          io.disconnect()
        }
      },
      { root: null, threshold: [0, 0.3, 0.6] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Structured data (Organization + WebSite). Since this page is a client component we hydrate on client; we still embed JSON-LD for crawlers.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": t('common.appName'),
      "url": siteUrl,
      "logo": `${siteUrl}/og-interactive-sphere.svg`,
      "description": t('common.appDescription'),
      "sameAs": []
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": siteUrl,
      "name": t('common.appName'),
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={query}`,
        "query-input": "required name=query"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": t('home.pricing.freeTier.title'),
      "serviceType": t('home.pricing.freeTier.description'),
      "provider": { "@type": "Organization", "name": t('common.appName') },
      "offers": { "@type": "Offer", "price": 0, "priceCurrency": "THB" }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": t('home.pricing.premium.title'),
      "serviceType": t('home.pricing.premium.description'),
      "provider": { "@type": "Organization", "name": t('common.appName') },
      "offers": { "@type": "Offer", "price": 19900, "priceCurrency": "THB" }
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section - High-end AI Aesthetic */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Advanced Background Layers */}
          <div className="absolute inset-0 -z-20 bg-[#020617]" />
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
            <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[45%] bg-cyan-500/10 rounded-full blur-[100px] animate-float" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent)] opacity-20" />
          </div>
          
          <div className="container relative z-10">
            <div className="mx-auto max-w-5xl text-center">
              {/* Premium Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3 mb-10 px-6 py-2 rounded-full glass-panel"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
                  {t('home.hero.badge')}
                </span>
              </motion.div>

              {/* High-end Typography Headline */}
              <h1 className="mb-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                <span className="block text-white mb-2">
                  {t('home.hero.title')}
                </span>
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent animate-gradient-x inline-block">
                  {t('home.hero.subtitle')}
                </span>
              </h1>

              {/* Sophisticated Description */}
              <p className="mb-12 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light tracking-wide animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                {t('home.hero.description')}
              </p>

              {/* Premium CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <Button size="lg" variant="premium" asChild className="w-full sm:w-auto text-lg h-14 px-10">
                  <Link href="/analysis" onClick={onHeroCta}>
                    {t('home.hero.cta')}
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg h-14 px-10 glass">
                  <Link href="/demo/skin-analysis" onClick={onDemoCta}>
                    {t('home.hero.learnMore')}
                  </Link>
                </Button>
              </div>

              {/* Enterprise Trust Indicators */}
              <div className="mt-20 flex flex-wrap items-center justify-center gap-10 text-xs tracking-[0.15em] font-medium text-white/30 uppercase animate-in fade-in duration-1000 delay-700">
                <span className="flex items-center gap-3 hover:text-white/50 transition-colors cursor-default group">
                  <Shield className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  {t('home.hero.noCreditCard')}
                </span>
                <span className="flex items-center gap-3 hover:text-white/50 transition-colors cursor-default group">
                  <Zap className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  {t('home.freeTierAvailable')}
                </span>
                <span className="flex items-center gap-3 hover:text-white/50 transition-colors cursor-default group">
                  <CheckCircle2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  {t('common.getStarted')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Section - Data Driven Look */}
        <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="container">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <Badge variant="outline" className="mb-6 px-5 py-1.5 rounded-full border-primary/30 text-primary">
                {t('home.roi.performanceAnalytics')}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                {t('home.roi.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home.roi.description')}
              </p>
            </div>
            <div className="mx-auto max-w-5xl premium-card rounded-[2.5rem] bg-white dark:bg-slate-900/50 p-1">
              <RoiMiniCalculator />
            </div>
          </div>
        </section>

        {/* Features Grid - Clean & Modern */}
        <section className="py-32 relative bg-slate-50 dark:bg-[#020617]">
          <div className="container">
            <div className="mx-auto mb-24 max-w-2xl text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('home.features.title')}
              </Badge>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {t('home.whyChooseTitle')}
              </h2>
              <p className="text-xl text-muted-foreground font-light">
                {t('home.whyChooseSubtitle')}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Brain, color: "from-blue-500 to-indigo-600", title: 'home.features.aiPowered.title', desc: 'home.features.aiPowered.description', delay: 0.1 },
                { icon: Camera, color: "from-purple-500 to-pink-600", title: 'home.features.arVisualization.title', desc: 'home.features.arVisualization.description', delay: 0.2 },
                { icon: Shield, color: "from-emerald-500 to-teal-600", title: 'home.features.pdpaCompliant.title', desc: 'home.features.pdpaCompliant.description', delay: 0.3 },
                { icon: BarChart3, color: "from-orange-500 to-amber-600", title: 'home.features.visiaStyle.title', desc: 'home.features.visiaStyle.description', delay: 0.4 },
                { icon: Zap, color: "from-blue-400 to-cyan-500", title: 'home.features.fastAccurate.title', desc: 'home.features.fastAccurate.description', delay: 0.5 },
                { icon: Users, color: "from-rose-500 to-red-600", title: 'home.features.multiClinic.title', desc: 'home.features.multiClinic.description', delay: 0.6 }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                >
                  <Card className="h-full border-border/40 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm premium-card group">
                    <CardContent className="p-10">
                      <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg shadow-black/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-4 text-2xl font-bold tracking-tight">
                        {t(feature.title)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-[17px] font-light">
                        {t(feature.desc)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t('home.howItWorks.subtitle')}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t('home.howItWorks.step1.title')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t('home.howItWorks.step1.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t('home.howItWorks.step2.title')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t('home.howItWorks.step2.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t('home.howItWorks.step3.title')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t('home.howItWorks.step3.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Case Study Teaser */}
  <section ref={caseStudyRef} className="border-y border-border/60 bg-background py-12">
          <div className="container">
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 border-2 border-border/70 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{t('home.caseStudy.title')}</div>
                  <h3 className="mb-2 text-xl font-semibold">{t('home.caseStudy.subtitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('home.caseStudy.description')}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary/40 bg-primary/5 shadow-sm">
                <CardContent className="flex h-full flex-col justify-between p-6">
                  <div>
                    <h4 className="mb-2 text-lg font-semibold">{t('caseStudyTeaser.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('caseStudyTeaser.description')}</p>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/case-studies">{t('caseStudyTeaser.button')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pre-Trust CTA: Encourage Interactive Demo */}
        <section className="border-y border-border/60 bg-background py-10">
          <div className="container">
            <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 text-center">
              <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{t('demoCta.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('demoCta.description')}</p>
              <Button size="lg" variant="outline" asChild className="border-foreground/25 text-foreground hover:bg-foreground/5">
                <Link href="/demo/skin-analysis" onClick={onDemoCta}>{t('demoCta.button')}</Link>
              </Button>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="border-y border-border bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {t('home.cta.title')}
              </h2>
              <p className="mb-8 text-balance text-lg text-primary-foreground/90 leading-relaxed">
                {t('home.cta.description')}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                  <Link href="/analysis">
                    {t('home.startFreeAnalysis')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                >
                  <Link href="/contact">
                    {t('home.cta.contactSales')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers Preview */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display">
                {t('home.pricing.title')}
              </h2>
              <p className="text-balance text-muted-foreground leading-relaxed">
                {t('home.pricing.subtitle')}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              <Card className="border-2 border-border/70 shadow-sm">
                <CardContent className="p-8">
                  <Badge className="mb-4" variant="secondary">
                    {t('home.pricing.freeTier.badge')}
                  </Badge>
                  <h3 className="mb-2 text-2xl font-bold">
                    {t('home.pricing.freeTier.title')}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t('home.pricing.freeTier.description')}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{t('format.currency', { amount: 0 })}</span>
                    <span className="text-muted-foreground"> / {t('home.pricing.freeTier.period')}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {t('home.pricing.freeTier.features.0')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {t('home.pricing.freeTier.features.1')}
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/analysis">
                      {t('home.pricing.freeTier.cta')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary shadow-md">
                <CardContent className="p-8">
                  <Badge className="mb-4 bg-primary text-primary-foreground">
                    {t('home.pricing.premium.badge')}
                  </Badge>
                  <h3 className="mb-2 text-2xl font-bold">
                    {t('home.pricing.premium.title')}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t('home.pricing.premium.description')}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{t('format.currency', { amount: '19,900' })}</span>
                    <span className="text-muted-foreground"> / {t('home.pricing.premium.period')}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{t('home.pricing.premium.features.0')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{t('home.pricing.premium.features.4')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{t('home.pricing.premium.features.5')}</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/contact">
                      {t('home.pricing.premium.cta')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
