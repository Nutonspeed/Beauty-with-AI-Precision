"use client"

import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Zap, Users, ArrowRight, Brain, Activity, Microscope, Fingerprint, Globe, Zap as ZapIcon, ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import RoiMiniCalculator from "@/components/roi/roi-mini-calculator"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion, useScroll, useTransform } from "framer-motion"
import { LandingHero } from "@/components/LandingHero"
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans"
import { useLocalizePath } from "@/lib/i18n/locale-link"

import { ScannerCursor } from "@/components/ScannerCursor"
import { DigitalTwinModule } from "@/components/DigitalTwinModule"
import { SectionScanner } from "@/components/effects/LaserScanner"
import { LiveTelemetry } from "@/components/effects/LiveTelemetry"
import { FuturisticScrollGuide } from "@/components/effects/FuturisticScrollGuide"

export default function HomePage() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const heroRef = useRef<HTMLElement | null>(null)
  const caseStudyRef = useRef<HTMLElement | null>(null)

  // Force dark theme on mount for this page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    return () => {
      // Optional: restore theme on unmount if needed, 
      // but usually the root layout handles this.
    };
  }, []);

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
      "name": t('pricing.plans.starter.name'),
      "serviceType": t('pricing.plans.starter.description'),
      "provider": { "@type": "Organization", "name": t('common.appName') },
      "offers": { "@type": "Offer", "price": SUBSCRIPTION_PLANS.starter.price, "priceCurrency": "THB" }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": t('pricing.plans.professional.name'),
      "serviceType": t('pricing.plans.professional.description'),
      "provider": { "@type": "Organization", "name": t('common.appName') },
      "offers": { "@type": "Offer", "price": SUBSCRIPTION_PLANS.professional.price, "priceCurrency": "THB" }
    }
  ]

  return (
    <>
      <FuturisticScrollGuide />
      <main className="relative min-h-screen bg-[#020617] selection:bg-pink-500/30">
        <ScannerCursor />
        <div className="relative z-10">
          {/* Advanced Landing Hero Component */}
          <motion.section 
            ref={heroRef}
            style={{ opacity, scale }}
            className="relative border-b border-white/5"
          >
            <LandingHero 
              _onPrimary={onHeroCta} 
              _onSecondary={onDemoCta}
            />
          </motion.section>

          {/* Infrastructure Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              style={{ 
                y: useTransform(scrollYProgress, [0, 1], [0, 200]),
                opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 0.1, 0.05])
              }}
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/20 rounded-full blur-[120px]" 
            />
            <motion.div 
              style={{ 
                y: useTransform(scrollYProgress, [0, 1], [0, -300]),
                opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 0.1, 0.05])
              }}
              className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px]" 
            />
            <motion.div 
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
              className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" 
            />
          </div>

          {/* ROI Section - Precision Analytics Architecture */}
          <SectionScanner color="rgba(236, 72, 153, 0.6)">
            <section className="py-32 lg:py-64 relative border-b border-white/5 bg-white/[0.01]">
              <div className="container relative z-10">
                <div className="grid lg:grid-cols-12 gap-20 items-center">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="lg:col-span-5 space-y-10"
                  >
                    <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                      <Activity className="mr-3 h-3.5 w-3.5 animate-pulse" />
                      {t('home.roi.performanceAnalytics')}
                    </Badge>
                    <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                      Profit<br />
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent not-italic">Orchestration</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-light tracking-widest leading-relaxed italic">
                      {t('home.roi.description')}
                    </p>
                    <LiveTelemetry className="max-w-[200px] pt-4" />

                    <div className="flex items-center gap-8 pt-6">
                      <div className="space-y-1">
                        <div className="text-3xl font-black text-white italic">+45%</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">{t('home.roi.avgRevenueUplift')}</div>
                      </div>
                      <div className="h-10 w-px bg-white/5" />
                      <div className="space-y-1">
                        <div className="text-3xl font-black text-white italic">2.4x</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">{t('home.roi.clientRetention')}</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="lg:col-span-7 rounded-[3.5rem] border border-white/5 bg-white/[0.01] p-12 lg:p-16 backdrop-blur-3xl shadow-[0_0_80px_-20px_rgba(236,72,153,0.15)] relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 bg-pink-500/5 blur-[100px] rounded-full" />
                    <RoiMiniCalculator />
                  </motion.div>
                </div>
              </div>
            </section>
          </SectionScanner>

        {/* Digital Twin Section - New Futuristic Element */}
        <section className="py-32 lg:py-48 relative border-b border-white/5">
          <div className="container relative z-10">
            <DigitalTwinModule />
          </div>
        </section>

        {/* Interactive Experience Selector - NEW SECTION */}
        <section className="py-32 lg:py-64 relative bg-white/[0.01] border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-32 max-w-4xl text-center space-y-10"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-cyan-500/30 text-cyan-400 bg-cyan-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black">
                <Sparkles className="mr-3 h-3.5 w-3.5" />
                Zero-Friction Access
              </Badge>
              <h2 className="text-5xl md:text-9xl font-bold tracking-tighter text-white leading-tight italic">
                Choose Your<br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent not-italic">Interface</span>
              </h2>
              <p className="text-xl text-slate-500 font-light tracking-[0.2em] italic max-w-2xl mx-auto leading-relaxed">
                Experience the platform from two distinct perspectives. No registration required for interactive simulations.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* AI Analysis Demo Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Link href={lp("/analysis")}>
                  <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden group hover:border-pink-500/30 transition-all duration-700 shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    <div className="p-12 space-y-10">
                      <div className="h-20 w-20 rounded-3xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                        <Brain className="h-10 w-10 text-pink-500 group-hover:text-white" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-bold text-white italic group-hover:text-pink-400 transition-colors tracking-tighter">
                          AI_Dermatology_Engine
                        </h3>
                        <p className="text-xl text-slate-500 font-light italic leading-relaxed group-hover:text-slate-300 transition-colors">
                          Upload or capture a face scan to receive instant clinical-grade skin analysis and treatment recommendations.
                        </p>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 animate-pulse">LAUNCH_ANALYSIS_SIM</span>
                        <ArrowRight className="h-5 w-5 text-pink-500 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Clinic Management Demo Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Link href={lp("/demo/clinic")}>
                  <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden group hover:border-cyan-500/30 transition-all duration-700 shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    <div className="p-12 space-y-10">
                      <div className="h-20 w-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-700">
                        <Activity className="h-10 w-10 text-cyan-500 group-hover:text-white" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-bold text-white italic group-hover:text-cyan-400 transition-colors tracking-tighter">
                          Revenue_Control_Terminal
                        </h3>
                        <p className="text-xl text-slate-500 font-light italic leading-relaxed group-hover:text-slate-300 transition-colors">
                          Step into the command center. Monitor financial inflow, operational yield, and predictive analytics in real-time.
                        </p>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 animate-pulse">ENTER_COMMAND_CENTER</span>
                        <ArrowRight className="h-5 w-5 text-cyan-500 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Clinical Intelligence Grid - Infrastructure Modules */}
        <SectionScanner color="rgba(14, 165, 233, 0.6)">
          <section className="py-32 lg:py-64 relative">
            <div className="container relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mx-auto mb-32 max-w-4xl text-center space-y-8"
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-cyan-500/30 text-cyan-400 bg-cyan-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-cyan-500/10">
                  <Sparkles className="mr-3 h-3.5 w-3.5" />
                  {t('home.features.badge')}
                </Badge>
                <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                  {t('home.features.title').split(' ')[0]}<br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent not-italic">{t('home.features.title').split(' ')[1]}</span>
                </h2>
                <p className="text-xl text-slate-400 font-light tracking-widest max-w-3xl mx-auto italic leading-relaxed">
                  {t('home.features.description')}
                </p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-3 flex justify-end mb-4">
                  <LiveTelemetry className="w-full max-w-[250px] bg-white/[0.02] p-4 rounded-2xl border border-white/5" />
                </div>
                {[
                  { icon: Brain, color: "from-blue-500/20 to-indigo-600/20", iconColor: "text-blue-400", delay: 0.1, code: 'MOD-AI-PX', key: 'neural' },
                  { icon: Microscope, color: "from-purple-500/20 to-pink-600/20", iconColor: "text-purple-400", delay: 0.2, code: 'MOD-AR-VIS', key: 'ar' },
                  { icon: Fingerprint, color: "from-emerald-500/20 to-teal-600/20", iconColor: "text-emerald-400", delay: 0.3, code: 'MOD-SEC-IO', key: 'safety' },
                  { icon: Activity, color: "from-orange-500/20 to-amber-600/20", iconColor: "text-orange-400", delay: 0.4, code: 'MOD-MET-TRK', key: 'vitals' },
                  { icon: Zap, color: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400", delay: 0.5, code: 'MOD-PERF-X', key: 'speed' },
                  { icon: Users, color: "from-rose-500/20 to-red-600/20", iconColor: "text-rose-400", delay: 0.6, code: 'MOD-NODE-CTL', key: 'management' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 group shadow-2xl overflow-hidden relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <div className="absolute top-8 right-8 font-mono text-[8px] text-white/10 group-hover:text-white/30 transition-colors uppercase tracking-[0.3em]">
                        {feature.code}
                      </div>
                      <CardContent className="p-12">
                        <div className={`mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.color} border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 relative`}>
                          <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <feature.icon className={`h-10 w-10 ${feature.iconColor} relative z-10`} />
                        </div>
                        <h3 className="mb-6 text-3xl font-bold tracking-tighter text-white group-hover:text-pink-400 transition-colors italic">
                          {t(`home.features.${feature.key}.title` as any)}
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-lg font-light italic group-hover:text-slate-300 transition-colors">
                          {t(`home.features.${feature.key}.description` as any)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionScanner>

        {/* Diagnostic Protocol - Cinematic Progress Flow */}
        <section className="py-32 lg:py-64 bg-white/[0.01] relative border-y border-white/5">
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mx-auto mb-40 max-w-4xl text-center space-y-10"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-purple-500/30 text-purple-400 bg-purple-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black">
                {t('home.protocol.badge')}
              </Badge>
              <h2 className="text-5xl md:text-9xl font-bold tracking-tighter text-white leading-tight italic">
                {t('home.protocol.title').split(' ')[0]}<br />
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent not-italic">{t('home.protocol.title').split(' ')[1]}</span>
              </h2>
              <p className="text-2xl text-slate-500 font-light tracking-widest italic max-w-2xl mx-auto leading-relaxed">
                {t('home.protocol.description')}
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-7xl gap-32 md:grid-cols-3 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-y-1/2 hidden md:block" />
              {[
                { step: "01", key: 'step1' },
                { step: "02", key: 'step2' },
                { step: "03", key: 'step3' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 1 }}
                  className="relative group"
                >
                  <div className="text-[12rem] font-black text-white/[0.02] absolute -top-40 -left-16 select-none group-hover:text-pink-500/[0.05] transition-colors duration-1000 italic font-mono">
                    {item.step}
                  </div>
                  <div className="relative z-10 space-y-8 p-10 rounded-[3rem] border border-transparent group-hover:border-white/5 group-hover:bg-white/[0.02] transition-all duration-700 backdrop-blur-md">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xl font-black italic text-pink-500 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-inner">
                      {item.step}
                    </div>
                    <h3 className="text-4xl font-bold text-white group-hover:text-pink-400 transition-colors tracking-tighter italic">
                      {t(`home.protocol.${item.key}.title` as any)}
                    </h3>
                    <p className="text-xl text-slate-500 leading-relaxed font-light italic group-hover:text-slate-300 transition-colors duration-700">
                      {t(`home.protocol.${item.key}.description` as any)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Deployment CTA - Bold Cinematic Section */}
        <section className="relative py-48 overflow-hidden bg-[#020617]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-600/5 to-purple-600/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center" />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/10 blur-[150px] rounded-full"
            />
          </div>
          
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-6xl text-center space-y-20"
            >
              <div className="space-y-10">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black animate-pulse">
                  {t('home.deployment.badge')}
                </Badge>
                <h2 className="text-6xl md:text-[10rem] font-bold tracking-tighter text-white leading-[0.85] italic">
                  {t('home.deployment.title').split(' ')[0]}<br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">{t('home.deployment.title').split(' ')[1]}</span>
                </h2>
                <p className="text-2xl text-slate-500 font-light tracking-[0.2em] leading-relaxed max-w-3xl mx-auto italic">
                  {t('home.deployment.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-12 justify-center items-center">
                <Button size="xl" variant="premium" className="h-24 px-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/30 text-xl font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all group" asChild>
                  <Link href="/analysis" className="flex items-center gap-6">
                    {t('home.startFreeAnalysis')}
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="h-24 px-20 rounded-[2.5rem] border-white/5 bg-white/[0.02] text-white backdrop-blur-3xl hover:bg-white/[0.05] hover:border-white/10 text-xl font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border italic"
                  asChild
                >
                  <Link href="/contact" className="flex items-center gap-4">
                    <Globe className="h-6 w-6 text-cyan-500/50" />
                    {t('home.cta.contactSales')}
                  </Link>
                </Button>
              </div>

              <div className="pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-10 opacity-40 grayscale group-hover:opacity-100 transition-opacity">
                {[
                  { label: 'Latency', val: '< 150ms' },
                  { label: 'Uptime', val: '99.99%' },
                  { label: 'Encryption', val: 'AES-256' },
                  { label: 'Node Sync', val: 'Real-time' }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-600">{stat.label}</div>
                    <div className="text-sm font-mono text-white tracking-tighter">{stat.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Tiers - Elite Infrastructure Preview */}
        <section className="py-32 lg:py-64 relative overflow-hidden bg-white/[0.01]">
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-40 max-w-4xl text-center space-y-10"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black">
                {t('home.subscription.badge')}
              </Badge>
              <h2 className="text-5xl md:text-9xl font-bold tracking-tighter text-white leading-tight italic">
                {t('home.subscription.title').split(' ')[0]}<br />
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent not-italic">{t('home.subscription.title').split(' ')[1]}</span>
              </h2>
              <p className="text-xl text-slate-500 font-light tracking-[0.2em] italic max-w-2xl mx-auto leading-relaxed">
                {t('home.subscription.description')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { key: 'starter', code: 'PRT-NODE-01' },
                  { key: 'professional', code: 'PRT-NODE-PRO' },
                  { key: 'enterprise', code: 'PRT-NODE-ENT' },
                  { key: 'platinum', code: 'PRT-NODE-ULT' }
                ].map((plan, i) => {
                  const details = SUBSCRIPTION_PLANS[plan.key as keyof typeof SUBSCRIPTION_PLANS];
                  const isPro = plan.key === 'professional';
                  const isEnterprise = plan.key === 'enterprise';
                  const isPlatinum = plan.key === 'platinum';
                  
                  return (
                    <motion.div
                      key={plan.key}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <Card className={`relative h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden transition-all duration-700 hover:bg-white/[0.02] hover:border-white/10 group shadow-2xl ${
                        isPro ? 'border-pink-500/20 bg-pink-500/[0.02] shadow-[0_0_100px_-20px_rgba(236,72,153,0.2)] lg:scale-105 z-20' : ''
                      } ${isPlatinum ? 'border-amber-500/20 bg-amber-500/[0.01]' : ''}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        {isPro && (
                          <div className="absolute top-0 right-0 p-3 px-12 bg-pink-600 text-[10px] font-black text-white uppercase tracking-[0.4em] rounded-bl-[2rem] italic shadow-2xl">
                            Most Popular
                          </div>
                        )}
                        {isPlatinum && (
                          <div className="absolute top-0 right-0 p-3 px-12 bg-amber-600 text-[10px] font-black text-white uppercase tracking-[0.4em] rounded-bl-[2rem] italic shadow-2xl">
                            Ultimate
                          </div>
                        )}
                        <div className="absolute top-12 right-12 font-mono text-[8px] text-white/10 group-hover:text-white/30 transition-colors uppercase tracking-[0.3em]">
                          {plan.code}
                        </div>
                        <CardContent className="p-10 lg:p-12 flex flex-col h-full">
                          <Badge className={`mb-8 w-fit ${isPro ? 'bg-pink-500 text-white' : isPlatinum ? 'bg-amber-500 text-white' : 'bg-white/[0.03] text-slate-500'} border-none px-6 py-1.5 rounded-full uppercase tracking-widest text-[9px] font-black`} variant="default">
                            {t(`pricing.plans.${plan.key}.badge` as any)}
                          </Badge>
                          <h3 className={`mb-4 text-3xl font-bold text-white group-hover:text-pink-400 transition-colors tracking-tighter italic ${isPlatinum ? 'group-hover:text-amber-400' : ''}`}>
                            {t(`pricing.plans.${plan.key}.name` as any)}
                          </h3>
                          <p className="mb-10 text-sm text-slate-500 font-light leading-relaxed italic h-12 line-clamp-2">
                            {t(`pricing.plans.${plan.key}.description` as any)}
                          </p>
                          <div className="mb-10 space-y-3">
                            <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">{details.name}</div>
                            <div className="flex items-baseline gap-3">
                              <span className="text-4xl font-black text-white tracking-tighter">฿{details.price.toLocaleString()}</span>
                              <span className="text-slate-600 text-sm font-black uppercase tracking-[0.2em]">/ {t('pricing.limits.perMonth')}</span>
                            </div>
                          </div>
                          <div className="h-px w-full bg-white/5 mb-10" />
                          <ul className="mb-10 space-y-4 flex-1">
                            {(isPlatinum ? [0, 1, 2] : isEnterprise ? [0, 1, 2] : isPro ? [0, 1, 2] : [0, 1, 2]).map((idx) => (
                              <li key={idx} className="flex items-start gap-3 text-slate-400 group/item text-xs">
                                <div className={`mt-1 h-1.5 w-1.5 rounded-full ${isPro ? 'bg-pink-500' : isPlatinum ? 'bg-amber-500' : 'bg-pink-500/30'} transition-all shadow-[0_0_10px_rgba(236,72,153,0.5)]`} />
                                <span className="font-light tracking-wide italic leading-relaxed">{t(`pricing.plans.${plan.key}.features.${idx}` as any)}</span>
                              </li>
                            ))}
                          </ul>
                          <Button asChild size="lg" className={`w-full h-16 rounded-[1.5rem] border-white/10 ${isPro ? 'bg-pink-600 text-white hover:bg-pink-500 shadow-2xl shadow-pink-600/50' : isPlatinum ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-2xl shadow-amber-600/50' : 'bg-white/5 text-white hover:bg-white/10'} text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 border`}>
                            <Link href={plan.key === 'starter' ? lp("/analysis") : lp("/contact")}>
                              {t(`pricing.plans.${plan.key}.cta` as any)}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
            </div>
          </div>
        </section>
      </div>
    </main>

    <Footer />
  </>
  )
}
