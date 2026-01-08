"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Shield, Zap, Users, BarChart3, Camera, CheckCircle2, ArrowRight, Brain, Activity, Microscope, Fingerprint } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import RoiMiniCalculator from "@/components/roi/roi-mini-calculator"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion, useScroll, useTransform } from "framer-motion"
import { LandingHero } from "@/components/LandingHero"

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const heroRef = useRef<HTMLElement | null>(null)
  const caseStudyRef = useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

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

      <main className="flex-1 bg-[#020617]">
        {/* Advanced Landing Hero Component */}
        <motion.section 
          style={{ opacity, scale }}
          className="relative"
        >
          <LandingHero 
            _onPrimary={onHeroCta} 
            _onSecondary={onDemoCta}
          />
        </motion.section>

        {/* ROI Section - Medical Data Driven */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-[#0f172a]" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mb-20 max-w-3xl text-center"
            >
              <Badge variant="outline" className="mb-6 px-5 py-1.5 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-sm">
                {t('home.roi.performanceAnalytics')}
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight md:text-6xl mb-8 text-white">
                {t('home.roi.title')}
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed font-light">
                {t('home.roi.description')}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mx-auto max-w-5xl rounded-[3rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-2xl shadow-2xl"
            >
              <RoiMiniCalculator />
            </motion.div>
          </div>
        </section>

        {/* Features Grid - Clinical Tech Style */}
        <section className="py-40 relative bg-[#0f172a]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mx-auto mb-24 max-w-2xl text-center"
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('home.features.title')}
              </Badge>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl text-white">
                {t('home.whyChooseTitle')}
              </h2>
              <p className="text-xl text-gray-400 font-light">
                {t('home.whyChooseSubtitle')}
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Brain, color: "from-blue-500/20 to-indigo-600/20", iconColor: "text-blue-400", title: 'home.features.aiPowered.title', desc: 'home.features.aiPowered.description', delay: 0.1 },
                { icon: Microscope, color: "from-purple-500/20 to-pink-600/20", iconColor: "text-purple-400", title: 'home.features.arVisualization.title', desc: 'home.features.arVisualization.description', delay: 0.2 },
                { icon: Fingerprint, color: "from-emerald-500/20 to-teal-600/20", iconColor: "text-emerald-400", title: 'home.features.pdpaCompliant.title', desc: 'home.features.pdpaCompliant.description', delay: 0.3 },
                { icon: Activity, color: "from-orange-500/20 to-amber-600/20", iconColor: "text-orange-400", title: 'home.features.visiaStyle.title', desc: 'home.features.visiaStyle.description', delay: 0.4 },
                { icon: Zap, color: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400", title: 'home.features.fastAccurate.title', desc: 'home.features.fastAccurate.description', delay: 0.5 },
                { icon: Users, color: "from-rose-500/20 to-red-600/20", iconColor: "text-rose-400", title: 'home.features.multiClinic.title', desc: 'home.features.multiClinic.description', delay: 0.6 }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-md transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 group">
                    <CardContent className="p-10">
                      <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} border border-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                      </div>
                      <h3 className="mb-4 text-2xl font-bold tracking-tight text-white group-hover:text-pink-400 transition-colors">
                        {t(feature.title)}
                      </h3>
                      <p className="text-gray-400 leading-relaxed text-[16px] font-light">
                        {t(feature.desc)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Clean Cinematic Steps */}
        <section className="py-40 bg-[#020617] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mx-auto mb-24 max-w-2xl text-center"
            >
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl text-white">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-xl text-gray-400 font-light">
                {t('home.howItWorks.subtitle')}
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-3 relative">
              {[
                { step: "01", title: 'home.howItWorks.step1.title', desc: 'home.howItWorks.step1.description' },
                { step: "02", title: 'home.howItWorks.step2.title', desc: 'home.howItWorks.step2.description' },
                { step: "03", title: 'home.howItWorks.step3.title', desc: 'home.howItWorks.step3.description' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                  className="relative group"
                >
                  <div className="text-[8rem] font-bold text-white/[0.02] absolute -top-20 -left-10 select-none group-hover:text-pink-500/[0.05] transition-colors duration-700">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <h3 className="mb-4 text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">
                      {t(item.title)}
                    </h3>
                    <p className="text-gray-400 leading-relaxed font-light whitespace-pre-line">
                      {t(item.desc)}
                    </p>
                  </div>
                </motion.div>
              ))}
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


        {/* CTA Section - Bold Enterprise Look */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-pink-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-50" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center"
            >
              <h2 className="mb-8 text-4xl font-bold tracking-tight md:text-6xl text-white">
                {t('home.cta.title')}
              </h2>
              <p className="mb-12 text-xl text-white/90 leading-relaxed font-light">
                {t('home.cta.description')}
              </p>
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                <Button size="xl" variant="secondary" asChild className="w-full sm:w-auto h-16 px-12 text-lg rounded-full shadow-2xl transition-transform hover:scale-105">
                  <Link href="/analysis">
                    {t('home.startFreeAnalysis')}
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  asChild
                  className="w-full h-16 px-12 text-lg rounded-full border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 sm:w-auto transition-transform hover:scale-105"
                >
                  <Link href="/contact">
                    {t('home.cta.contactSales')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Tiers Preview - Luxury Modern */}
        <section className="py-40 bg-[#020617] relative">
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-24 max-w-2xl text-center"
            >
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl text-white">
                {t('home.pricing.title')}
              </h2>
              <p className="text-xl text-gray-400 font-light">
                {t('home.pricing.subtitle')}
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-white/10 group">
                  <CardContent className="p-12">
                    <Badge className="mb-6 bg-gray-500/10 text-gray-400 border-gray-500/20" variant="secondary">
                      {t('home.pricing.freeTier.badge')}
                    </Badge>
                    <h3 className="mb-4 text-3xl font-bold text-white group-hover:text-pink-400 transition-colors">
                      {t('home.pricing.freeTier.title')}
                    </h3>
                    <p className="mb-8 text-gray-400 font-light">
                      {t('home.pricing.freeTier.description')}
                    </p>
                    <div className="mb-10">
                      <span className="text-5xl font-bold text-white">฿0</span>
                      <span className="text-gray-500 text-lg"> / {t('home.pricing.freeTier.period')}</span>
                    </div>
                    <ul className="mb-12 space-y-5">
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle2 className="h-5 w-5 text-pink-500" />
                        {t('home.pricing.freeTier.features.0')}
                      </li>
                      <li className="flex items-center gap-3 text-gray-300">
                        <CheckCircle2 className="h-5 w-5 text-pink-500" />
                        {t('home.pricing.freeTier.features.1')}
                      </li>
                    </ul>
                    <Button asChild size="xl" variant="outline" className="w-full h-14 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                      <Link href="/analysis">
                        {t('home.pricing.freeTier.cta')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="relative border-pink-500/30 bg-pink-500/[0.02] backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-pink-500/50 shadow-2xl shadow-pink-500/5">
                  <div className="absolute top-0 right-0 p-1 px-4 bg-pink-600 text-[10px] font-bold text-white uppercase tracking-widest rounded-bl-xl">
                    Premium
                  </div>
                  <CardContent className="p-12">
                    <Badge className="mb-6 bg-pink-500 text-white" variant="default">
                      {t('home.pricing.premium.badge')}
                    </Badge>
                    <h3 className="mb-4 text-3xl font-bold text-white">
                      {t('home.pricing.premium.title')}
                    </h3>
                    <p className="mb-8 text-gray-400 font-light">
                      {t('home.pricing.premium.description')}
                    </p>
                    <div className="mb-10">
                      <span className="text-5xl font-bold text-white">฿19,900</span>
                      <span className="text-gray-500 text-lg"> / {t('home.pricing.premium.period')}</span>
                    </div>
                    <ul className="mb-12 space-y-5">
                      <li className="flex items-start gap-3 text-gray-300">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-pink-500" />
                        <span className="leading-tight">{t('home.pricing.premium.features.0')}</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-300">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-pink-500" />
                        <span className="leading-tight">{t('home.pricing.premium.features.4')}</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-300">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-pink-500" />
                        <span className="leading-tight">{t('home.pricing.premium.features.5')}</span>
                      </li>
                    </ul>
                    <Button asChild size="xl" className="w-full h-14 rounded-full bg-pink-600 text-white hover:bg-pink-500 shadow-lg shadow-pink-600/20">
                      <Link href="/contact">
                        {t('home.pricing.premium.cta')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
