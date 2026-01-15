"use client"

import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  ArrowRight, 
  Brain, 
  Activity
} from "lucide-react"
import { ROISimulator } from "@/components/analytics/roi-simulator"
import { GlobalCommandCenter } from "@/components/visuals/global-command-center"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion } from "framer-motion"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { SideNav } from "@/components/ui/side-nav"
import { NumberTicker } from "@/components/ui/number-ticker"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { GlowCard } from "@/components/ui/glow-card"
import { MedicalPulse } from "@/components/ui/medical-pulse"
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans"
import { cn } from "@/lib/utils"

import { LandingHeroAdvanced } from "@/components/LandingHeroAdvanced"
import { FeaturesShowcase } from "@/components/sections/FeaturesShowcase"
import { StickyTestimonials } from "@/components/sections/StickyTestimonials"
import { 
  ScrollReveal, 
  ZoomOnScroll,
  ScrollProgressBar
} from "@/components/ui/scroll-animations"

export default function HomePageAdvanced() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const containerRef = useRef<HTMLElement | null>(null)

  const sectionData = [
    { id: "hero", label: "Overview" },
    { id: "roi", label: "Strategic ROI" },
    { id: "solutions", label: "Solutions" },
    { id: "features", label: "Capabilities" },
    { id: "testimonials", label: "Success Stories" },
    { id: "global", label: "Infrastructure" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Get Started" }
  ]

  useEffect(() => {
    usageTracker.trackPageView("home")
  }, [])

  const plans = [
    { key: 'starter', code: 'PRO-01' },
    { key: 'professional', code: 'PRO-MAX' },
    { key: 'enterprise', code: 'ENT-01' },
    { key: 'platinum', code: 'ULT-01' }
  ]

  return (
    <>
      <ScrollProgressBar />
      <SideNav sections={sectionData} containerRef={containerRef} />
      
      <main ref={containerRef} className="bg-white">
        {/* 1. Hero Section - With Scroll Parallax */}
        <section id="hero">
          <LandingHeroAdvanced />
        </section>

        {/* 2. ROI Section - With Scroll Reveal */}
        <section id="roi" className="relative py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] bg-blue-100/50"
              animate={{ 
                x: [0, 50, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-indigo-100/50"
              animate={{ 
                x: [0, -30, 0],
                y: [0, -50, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 space-y-8">
                <ScrollReveal direction="up">
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase animate-glow-border">
                    CenterIQ Strategic ROI
                  </Badge>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.1}>
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                    Quantify Your <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Business Growth
                    </span>
                  </h2>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.2}>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Use our Strategic ROI Simulator to calculate the precise financial impact of AI integration on your aesthetic center's operations.
                  </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.3}>
                  <div className="flex items-center gap-12 pt-4 relative">
                    <MedicalPulse className="absolute -bottom-8 left-0 w-full h-4 text-blue-500/20" />
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-slate-900">
                        <NumberTicker value={45} suffix="%" />
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('home.roi.avgRevenueUplift')}</div>
                    </div>
                    <div className="h-12 w-px bg-slate-200" />
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-slate-900">
                        <NumberTicker value={2.4} decimalPlaces={1} suffix="x" />
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('home.roi.clientRetention')}</div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              <ZoomOnScroll className="lg:col-span-7">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-12 shadow-2xl shadow-blue-500/10">
                  <ROISimulator isEnterprise={true} />
                </div>
              </ZoomOnScroll>
            </div>
          </div>
        </section>

        {/* 3. Solutions Selector */}
        <section id="solutions" className="relative py-32 bg-white overflow-hidden">
          <div className="container relative z-10">
            <div className="mx-auto mb-16 max-w-3xl text-center space-y-6">
              <ScrollReveal>
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase">
                  Explore Solutions
                </Badge>
              </ScrollReveal>
              
              <ScrollReveal delay={0.1}>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
                  {t('demo.selector.title')} <span className="text-blue-600">{t('demo.selector.subtitle')}</span>
                </h2>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  {t('demo.selector.description')}
                </p>
              </ScrollReveal>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <ScrollReveal direction="left" delay={0.2}>
                <MagneticButton strength={0.05} className="w-full h-full group">
                  <Link href={lp("/analysis")}>
                    <GlowCard className="h-full border-slate-200 bg-white rounded-2xl overflow-hidden group transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20">
                      <div className="p-10 space-y-8">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/30">
                          <Brain className="h-10 w-10" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {t('demo.selector.ai.title')}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {t('demo.selector.ai.description')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest pt-2">
                          {t('demo.selector.ai.cta')}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </GlowCard>
                  </Link>
                </MagneticButton>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.3}>
                <MagneticButton strength={0.05} className="w-full h-full group">
                  <Link href={lp("/demo/center")}>
                    <GlowCard className="h-full border-slate-200 bg-white rounded-2xl overflow-hidden group transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20">
                      <div className="p-10 space-y-8">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-emerald-500/30">
                          <Activity className="h-10 w-10" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {t('demo.selector.revenue.title')}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {t('demo.selector.revenue.description')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest pt-2">
                          {t('demo.selector.revenue.cta')}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </GlowCard>
                  </Link>
                </MagneticButton>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 4. Features Showcase - Horizontal Scroll */}
        <section id="features">
          <FeaturesShowcase />
        </section>

        {/* 5. Testimonials - Sticky Reveal */}
        <section id="testimonials">
          <StickyTestimonials />
        </section>

        {/* 6. Global Infrastructure */}
        <section id="global" className="h-screen bg-slate-900 overflow-hidden">
          <GlobalCommandCenter />
        </section>

        {/* 7. Pricing Section */}
        <section id="pricing" className="relative py-32 bg-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] bg-blue-50" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] bg-indigo-50" />
          </div>

          <div className="container relative z-10">
            <div className="mx-auto mb-16 lg:mb-20 max-w-3xl text-center space-y-6">
              <ScrollReveal>
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase">
                  {t('home.subscription.badge')}
                </Badge>
              </ScrollReveal>
              
              <ScrollReveal delay={0.1}>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
                  Simple <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pricing</span>
                </h2>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  {t('home.subscription.description')}
                </p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, i) => {
                const details = SUBSCRIPTION_PLANS[plan.key as keyof typeof SUBSCRIPTION_PLANS]
                const isPro = plan.key === 'professional'
                
                return (
                  <ScrollReveal key={plan.key} direction="up" delay={i * 0.1}>
                    <MagneticButton strength={0.03} className="w-full h-full group">
                      <GlowCard className={cn(
                        "relative h-full border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-500 shadow-lg hover:shadow-2xl",
                        isPro && "border-blue-500 shadow-blue-100 shadow-xl lg:scale-105 z-20 hover:shadow-blue-200"
                      )}>
                        {isPro && (
                          <div className="absolute top-0 right-0 p-2 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-[9px] font-bold text-white uppercase tracking-wider rounded-bl-xl">
                            Recommended
                          </div>
                        )}
                        <div className="p-8 flex flex-col h-full space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">
                              {t(`pricing.plans.${plan.key}.name` as any)}
                            </h3>
                            <p className="text-sm text-slate-500 min-h-[40px]">
                              {t(`pricing.plans.${plan.key}.description` as any)}
                            </p>
                          </div>
                          
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                              ฿{details.price.toLocaleString()}
                            </span>
                            <span className="text-slate-500 text-xs font-medium">/month</span>
                          </div>

                          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                          <ul className="space-y-3 flex-1">
                            {[0, 1, 2].map((idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span>{t(`pricing.plans.${plan.key}.features.${idx}` as any)}</span>
                              </li>
                            ))}
                          </ul>

                          <Button asChild className={cn(
                            "w-full rounded-xl font-bold uppercase tracking-wider h-12 transition-all duration-300 active:scale-95",
                            isPro 
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30" 
                              : "bg-slate-900 hover:bg-slate-800"
                          )}>
                            <Link href={plan.key === 'starter' ? lp("/analysis") : lp("/contact")}>
                              {t(`pricing.plans.${plan.key}.cta` as any)}
                            </Link>
                          </Button>
                        </div>
                      </GlowCard>
                    </MagneticButton>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* 8. Final CTA Section */}
        <section id="contact" className="relative py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] bg-white/10"
              animate={{ 
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-white/5"
              animate={{ 
                x: [0, -80, 0],
                y: [0, -60, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />
          </div>

          <div className="container relative z-10 text-center space-y-10">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                  {t('home.deployment.title')}
                </h2>
                <p className="text-lg text-blue-100 font-normal">
                  {t('home.deployment.description')}
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <MagneticButton strength={0.15}>
                  <Button size="xl" className="h-16 px-12 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-2xl shadow-black/20 transition-all hover:scale-105" asChild>
                    <Link href="/analysis" className="flex items-center gap-3">
                      {t('home.startFreeAnalysis')}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </MagneticButton>
                
                <MagneticButton strength={0.1}>
                  <Button size="xl" variant="outline" className="h-16 px-12 rounded-2xl border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold backdrop-blur-sm" asChild>
                    <Link href="/contact">
                      {t('home.cta.contactSales')}
                    </Link>
                  </Button>
                </MagneticButton>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
