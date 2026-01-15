"use client"

import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  ArrowRight, 
  Brain, 
  Activity, 
  Microscope, 
  Fingerprint,
  Zap,
  Users
} from "lucide-react"
import { ROISimulator } from "@/components/analytics/roi-simulator"
import { GlobalCommandCenter } from "@/components/visuals/global-command-center"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { useEffect, useRef } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion } from "framer-motion"
import { LandingHeroAdvanced } from "@/components/LandingHeroAdvanced"
import { SUBSCRIPTION_PLANS, formatPrice, formatAnnualPrice } from "@/lib/subscriptions/plans"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useState } from "react"
import { Check, Info, PlusCircle } from "lucide-react"
import { SideNav } from "@/components/ui/side-nav"
import { NumberTicker } from "@/components/ui/number-ticker"
import { MedicalCursor } from "@/components/ui/medical-cursor"
import { FloatingSymbols } from "@/components/ui/floating-symbols"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { GlowCard } from "@/components/ui/glow-card"
import { MedicalPulse } from "@/components/ui/medical-pulse"
import { cn } from "@/lib/utils"
import { ScrollReveal, ZoomOnScroll, ScrollProgressBar } from "@/components/ui/scroll-animations"
import { FeaturesShowcase } from "@/components/sections/FeaturesShowcase"
import { StickyTestimonials } from "@/components/sections/StickyTestimonials"

export default function HomePage() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const locale = useLocale()
  const containerRef = useRef<HTMLElement | null>(null)

  const sectionData = [
    { id: "hero", label: t('common.hero') || "Overview" },
    { id: "roi", label: t('home.roi.badge') },
    { id: "solutions", label: t('home.solutions.badge') },
    { id: "features", label: t('home.howItWorks.title') },
    { id: "cases", label: t('common.caseStudies') },
    { id: "protocol", label: t('home.protocol.title') },
    { id: "global", label: t('common.infrastructure') },
    { id: "pricing", label: t('pricing.title') },
    { id: "contact", label: t('common.getStarted') }
  ]

  useEffect(() => {
    usageTracker.trackPageView("home")
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

  const features = [
    { icon: Brain, key: 'neural' },
    { icon: Microscope, key: 'ar' },
    { icon: Fingerprint, key: 'safety' },
    { icon: Activity, key: 'vitals' },
    { icon: Zap, key: 'speed' },
    { icon: Users, key: 'management' }
  ];

  const plans = [
    { key: 'starter', code: 'PRO-01' },
    { key: 'professional', code: 'PRO-MAX' },
    { key: 'enterprise', code: 'ENT-01' },
    { key: 'platinum', code: 'ULT-01' }
  ];

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <ScrollProgressBar />
      <MedicalCursor />
      <FloatingSymbols />
      <SideNav sections={sectionData} containerRef={containerRef} />
      <main ref={containerRef} className="scroll-smooth">
        {/* 1. Hero Section - With Scroll-Driven Parallax */}
        <section id="hero">
          <LandingHeroAdvanced 
            onPrimary={onHeroCta} 
            onSecondary={onDemoCta}
          />
        </section>

        {/* 2. ROI Section - With Scroll Reveal Effects */}
        <section id="roi" className="relative py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] bg-blue-100/50"
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-indigo-100/50"
              animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 space-y-8">
                <ScrollReveal direction="up">
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase animate-glow-border">
                    {t('home.roi.badge')}
                  </Badge>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.1}>
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                    {t('home.roi.title')}
                  </h2>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.2}>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {t('home.roi.description')}
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

        {/* 3. Experience Selector */}
        <section id="solutions" className="snap-section flex items-center bg-white border-b border-slate-100 relative overflow-hidden group">
          <div className="section-orb bottom-0 -right-20 w-96 h-96 bg-blue-300" />
          <div className="container relative z-10 py-12 lg:py-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-16 max-w-3xl text-center space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase glow-badge">
                {t('home.solutions.badge')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 text-reveal">
                {t('demo.selector.title')} <span className="text-blue-600">{t('demo.selector.subtitle')}</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {t('demo.selector.description')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <MagneticButton strength={0.05} className="w-full h-full group">
                <Link href={lp("/analysis")}>
                  <GlowCard className="h-full border-slate-200 bg-white rounded-2xl overflow-hidden group transition-all duration-300 shadow-sm medical-card-hover">
                    <div className="p-10 space-y-8">
                      <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Brain className="h-8 w-8" />
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
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </GlowCard>
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.05} className="w-full h-full group">
                <Link href={lp("/demo/center")}>
                  <GlowCard className="h-full border-slate-200 bg-white rounded-2xl overflow-hidden group transition-all duration-300 shadow-sm medical-card-hover">
                    <div className="p-10 space-y-8">
                      <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Activity className="h-8 w-8" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {t('demo.selector.revenue.title')}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {t('demo.selector.revenue.description')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest pt-2">
                        {t('demo.selector.revenue.cta')}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </GlowCard>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* 4. Features Showcase - Horizontal Scroll on Vertical Scroll */}
        <section id="features">
          <FeaturesShowcase />
        </section>

        {/* 5. Testimonials - Sticky Reveal */}
        <section id="cases">
          <StickyTestimonials />
        </section>

        {/* 6. Implementation Protocol */}
        <section id="protocol" className="snap-section flex items-center bg-slate-50/50 border-b border-slate-100 relative overflow-hidden group">
          <div className="section-orb bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100" />
          <div className="container relative z-10 py-12 lg:py-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-16 lg:mb-24 max-w-4xl text-center space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase glow-badge">
                {t('home.protocol.badge')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight text-reveal">
                {t('home.protocol.title')}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {t('home.protocol.description')}
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3"
            >
              {[
                { step: "01", key: 'step1' },
                { step: "02", key: 'step2' },
                { step: "03", key: 'step3' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants}
                >
                  <GlowCard className="relative group p-8 rounded-2xl border border-slate-100 bg-slate-50/30 medical-card-hover transition-all duration-300">
                    <div className="text-5xl font-bold text-slate-100 absolute -top-6 -left-2 select-none group-hover:text-blue-50/50 transition-colors">
                      {item.step}
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-600/20 relative">
                        <div className="absolute inset-0 rounded-lg bg-blue-600 animate-ping opacity-20" />
                        <span className="relative z-10">{item.step}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {t(`home.protocol.${item.key}.title` as any)}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {t(`home.protocol.${item.key}.description` as any)}
                      </p>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 7. Global Infrastructure */}
        <section id="global" className="snap-section flex items-center bg-slate-900 overflow-hidden">
          <div className="w-full h-full relative">
            <GlobalCommandCenter />
          </div>
        </section>

        {/* 8. Pricing Section */}
        <section id="pricing" className="py-24 lg:py-32 bg-white relative overflow-hidden">
          <div className="section-orb top-0 right-0 w-96 h-96 bg-blue-50/50" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-16 max-w-3xl text-center space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase">
                {t('pricing.title')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
                {t('pricing.title')}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {t('pricing.subtitle')}
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <span className={cn("text-sm font-medium transition-colors", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-400")}>
                  {t('pricing.billingToggle.monthly')}
                </span>
                <button 
                  onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                  className="relative w-14 h-7 rounded-full bg-slate-100 border border-slate-200 p-1 transition-colors hover:border-blue-300"
                >
                  <motion.div 
                    className="w-5 h-5 rounded-full bg-blue-600 shadow-md"
                    animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium transition-colors", billingCycle === 'annual' ? "text-slate-900" : "text-slate-400")}>
                    {t('pricing.billingToggle.annual')}
                  </span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none text-[10px] py-0 px-2">
                    {t('pricing.billingToggle.saveLabel')}
                  </Badge>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
            >
              {plans.map((plan) => {
                const details = SUBSCRIPTION_PLANS[plan.key as keyof typeof SUBSCRIPTION_PLANS];
                const isPro = plan.key === 'professional';
                
                return (
                  <motion.div key={plan.key} variants={itemVariants}>
                    <GlowCard className={cn(
                      "relative h-full border-slate-200 bg-white rounded-3xl overflow-hidden transition-all duration-500",
                      isPro && "border-blue-500 shadow-2xl shadow-blue-500/10 lg:scale-105 z-20"
                    )}>
                      {isPro && (
                        <div className="absolute top-0 right-0 p-2 px-6 bg-blue-600 text-[9px] font-black text-white uppercase tracking-[0.2em] rounded-bl-2xl">
                          {t('common.recommended')}
                        </div>
                      )}
                      
                      <div className="p-8 flex flex-col h-full space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-slate-900 italic">
                            {t(`pricing.plans.${plan.key}.title` as any)}
                          </h3>
                          <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-relaxed">
                            {t(`pricing.plans.${plan.key}.tagline` as any)}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                              {billingCycle === 'monthly' ? formatPrice(plan.key as any, locale as any) : formatAnnualPrice(plan.key as any, locale as any)}
                            </span>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                              {billingCycle === 'monthly' ? '/mo' : '/yr'}
                            </span>
                          </div>
                          {billingCycle === 'annual' && (
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                              Save {formatPrice(plan.key as any, locale as any)} x 2 months
                            </p>
                          )}
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="space-y-4 flex-1">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t('pricing.salesTools')}</p>
                            <ul className="space-y-2.5">
                              {details.salesFeaturesTH.slice(0, 5).map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                                  <Check className="mt-0.5 h-3.5 w-3.5 text-blue-500 shrink-0" />
                                  <span>{locale === 'th' ? feature : details.salesFeatures[idx]}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-50">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{t('pricing.customerPortal')}</p>
                            <ul className="space-y-2.5">
                              {details.customerFeaturesTH.slice(0, 2).map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs text-slate-500 font-medium italic">
                                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-200 shrink-0" />
                                  <span>{locale === 'th' ? feature : details.customerFeatures[idx]}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Button asChild className={cn(
                          "w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 transition-all active:scale-95 shadow-lg",
                          isPro ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" : "bg-slate-900 hover:bg-slate-800"
                        )}>
                          <Link href={lp("/contact")}>
                            {t('pricing.cta.contactSales')}
                          </Link>
                        </Button>
                      </div>
                    </GlowCard>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Quota & Add-ons Footer */}
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold italic">{t('pricing.quotaNote.title')}</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('pricing.quotaNote.description')}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                  <Zap className="h-3 w-3" />
                  {t('pricing.quotaNote.salesOnly')}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <PlusCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-bold italic">{t('pricing.addons.title')}</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    { key: 'extraSalesUser', label: t('pricing.addons.extraSalesUser') },
                    { key: 'extraBranch', label: t('pricing.addons.extraBranch') },
                    { key: 'extraAnalyses', label: t('pricing.addons.extraAnalyses') },
                    { key: 'extraAR', label: t('pricing.addons.extraAR') },
                  ].map((addon) => (
                    <div key={addon.key} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {addon.key.replace('extra', '')}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{addon.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CTA Section & Footer */}
        <section id="contact" className="snap-section flex flex-col bg-blue-600 text-white">
          <div className="flex-1 flex items-center justify-center">
            <div className="container relative z-10 text-center space-y-10">
              <div className="max-w-3xl mx-auto space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                  {t('home.deployment.title')}
                </h2>
                <p className="text-lg text-blue-100 font-normal">
                  {t('home.deployment.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <MagneticButton strength={0.15}>
                  <Button size="xl" className="h-14 px-10 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold" asChild>
                    <Link href="/analysis" className="flex items-center gap-2">
                      {t('home.startFreeAnalysis')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
                
                <MagneticButton strength={0.1}>
                  <Button size="xl" variant="outline" className="h-14 px-10 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold" asChild>
                    <Link href="/contact">
                      {t('home.cta.contactSales')}
                    </Link>
                  </Button>
                </MagneticButton>
              </div>
            </div>
          </div>
          <Footer />
        </section>
      </main>
    </>
  )
}
