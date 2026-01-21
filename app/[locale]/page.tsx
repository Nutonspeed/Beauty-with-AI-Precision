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
  Users,
  Check,
  Info,
  PlusCircle
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { VideoHeroSkeleton } from "@/components/sections/VideoHeroSkeleton"
import { SUBSCRIPTION_PLANS, formatPrice, formatAnnualPrice } from "@/lib/subscriptions/plans"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { SideNav } from "@/components/ui/side-nav"
import { NumberTicker } from "@/components/ui/number-ticker"
import { MedicalCursor } from "@/components/ui/medical-cursor"
import { FloatingSymbols } from "@/components/ui/floating-symbols"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { GlowCard } from "@/components/ui/glow-card"
import { MedicalPulse } from "@/components/ui/medical-pulse"
import { cn } from "@/lib/utils"
import { ScrollReveal, ZoomOnScroll, ScrollProgressBar } from "@/components/ui/scroll-animations"

// Lazy load heavy components
const ROISimulator = dynamic(() => import("@/components/analytics/roi-simulator").then(mod => ({ default: mod.ROISimulator })), { ssr: false })
const GlobalCommandCenter = dynamic(() => import("@/components/visuals/global-command-center").then(mod => ({ default: mod.GlobalCommandCenter })), { ssr: false })
const VideoHeroSection = dynamic(
  () => import("@/components/sections/VideoHeroSection").then(mod => ({ default: mod.VideoHeroSection })),
  { loading: () => <VideoHeroSkeleton />, ssr: false }
)
const FeaturesShowcase = dynamic(() => import("@/components/sections/FeaturesShowcase").then(mod => ({ default: mod.FeaturesShowcase })), { ssr: false })
const StickyTestimonials = dynamic(() => import("@/components/sections/StickyTestimonials").then(mod => ({ default: mod.StickyTestimonials })), { ssr: false })
const ProtocolFlow = dynamic(() => import("@/components/sections/ProtocolFlow").then(mod => ({ default: mod.ProtocolFlow })), { ssr: false })
const TrustSection = dynamic(() => import("@/components/sections/TrustSection").then(mod => ({ default: mod.TrustSection })), { ssr: false })

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

  const pricingMeta = {
    starter: {
      bestFor: t('pricing.bestFor.starter'),
      cta: t('pricing.plans.starter.cta'),
      href: lp('/analysis'),
    },
    professional: {
      bestFor: t('pricing.bestFor.professional'),
      cta: t('pricing.plans.professional.cta'),
      href: lp('/contact'),
    },
    enterprise: {
      bestFor: t('pricing.bestFor.enterprise'),
      cta: t('pricing.plans.enterprise.cta'),
      href: lp('/contact'),
    },
    platinum: {
      bestFor: t('pricing.bestFor.platinum'),
      cta: t('pricing.plans.platinum.cta'),
      href: lp('/contact'),
    },
  } as const;

  const pricingMetrics = [
    { label: t('pricing.metrics.uptimeLabel'), value: t('pricing.metrics.uptimeValue') },
    { label: t('pricing.metrics.supportLabel'), value: t('pricing.metrics.supportValue') },
    { label: t('pricing.metrics.deploymentLabel'), value: t('pricing.metrics.deploymentValue') },
  ];

  const trustBadges = [
    t('trust.badges.pdpa'),
    t('trust.badges.iso'),
    t('trust.badges.encryption'),
    t('trust.badges.verified'),
  ];

  const formatLimit = (value: number, suffix?: string) => {
    if (value === -1) return t('pricing.limits.unlimited');
    const formatted = value.toLocaleString();
    if (suffix) return `${formatted} ${suffix}`;
    return formatted;
  };

  const formatAnalysisQuota = (value: number) => {
    if (value === -1) return t('pricing.limits.unlimited');
    return value.toLocaleString();
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
          <VideoHeroSection />
        </section>

        {/* Trust Badges & Client Logos */}
        <TrustSection />

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
        <ProtocolFlow />

        {/* 7. Global Infrastructure */}
        <section id="global" className="snap-section flex items-center bg-slate-900 overflow-hidden">
          <div className="w-full h-full relative">
            <GlobalCommandCenter />
          </div>
        </section>

        {/* 8. Pricing Section */}
        <section id="pricing" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100/70 via-white to-cyan-100/70 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-100/60 to-white/40 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
                backgroundSize: '120px 120px',
              }}
            />
          </div>
          <div className="container relative z-10 space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start"
            >
              <div className="space-y-6">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase">
                  {t('pricing.hero.badge')}
                </Badge>
                <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                    {t('pricing.hero.subtitle')}
                  </p>
                  <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-slate-900">
                    {t('pricing.hero.title')}
                  </h2>
                  <p className="text-lg text-slate-600 max-w-2xl">
                    {t('pricing.hero.description')}
                  </p>
                </div>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  {/* Billing Toggle */}
                  <div className="flex items-center gap-4">
                    <span className={cn("text-sm font-medium transition-colors", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-400")}>
                      {t('pricing.billingToggle.monthly')}
                    </span>
                    <button
                      onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                      className="relative w-14 h-7 rounded-full bg-white border border-slate-200 p-1 transition-colors hover:border-blue-300"
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

                  <div className="space-y-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-500">{t('pricing.hero.freeTrial')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-slate-500">{t('pricing.hero.cancelAnytime')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <GlowCard className="rounded-[32px] border-slate-200/70 bg-white/90 shadow-premium backdrop-blur">
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                      {t('pricing.metrics.title')}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-[0.2em]"
                    >
                      {t('pricing.metrics.verified')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {pricingMetrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {metric.label}
                        </p>
                        <p className="text-lg font-black text-slate-900">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trustBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{t('pricing.metrics.noteLabel')}</span> {t('pricing.metrics.note')}
                  </div>
                </div>
              </GlowCard>
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
                const meta = pricingMeta[plan.key as keyof typeof pricingMeta];
                const quotaValue = details.quotaPerSales === -1
                  ? t('pricing.limits.unlimited')
                  : `${formatAnalysisQuota(details.quotaPerSales)} ${t('pricing.limits.perMonth')}`;
                const arQuotaValue = details.arQuotaPerSales === -1
                  ? t('pricing.limits.unlimited')
                  : `${formatLimit(details.arQuotaPerSales)} ${t('pricing.limits.perMonth')}`;
                const limitRows = [
                  { label: t('pricing.limits.users'), value: formatLimit(details.maxSalesUsers) },
                  { label: t('pricing.limits.analysis'), value: quotaValue },
                  { label: t('pricing.limits.arSimulations'), value: arQuotaValue },
                  { label: t('pricing.limits.branches'), value: formatLimit(details.maxBranches) },
                  { label: t('pricing.limits.storage'), value: formatLimit(details.maxStorageGB, 'GB') },
                  { label: t('pricing.limits.trial'), value: t('pricing.trial.freeTrial', { days: details.trialDays }), span: true },
                ];
                
                return (
                  <motion.div key={plan.key} variants={itemVariants}>
                    <GlowCard className={cn(
                      "relative h-full border-slate-200/80 bg-white/90 rounded-[32px] overflow-hidden transition-all duration-500 shadow-premium",
                      isPro && "border-blue-500 shadow-2xl shadow-blue-500/20 lg:-translate-y-2 z-20"
                    )}>
                      {isPro && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-blue-600 text-[9px] font-black text-white uppercase tracking-[0.3em] shadow-lg">
                          {t('common.recommended')}
                        </div>
                      )}
                      
                      <div className="p-8 flex flex-col h-full gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                            <span>{plan.code}</span>
                            <span className="text-emerald-500">{t('pricing.metrics.verified')}</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600">
                              {meta.bestFor}
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900">
                              {t(`pricing.plans.${plan.key}.title` as any)}
                            </h3>
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-relaxed">
                              {t(`pricing.plans.${plan.key}.tagline` as any)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 tracking-tight">
                              {billingCycle === 'monthly' ? formatPrice(plan.key as any, locale as any) : formatAnnualPrice(plan.key as any, locale as any)}
                            </span>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                              {billingCycle === 'monthly' ? '/mo' : '/yr'}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-emerald-600">
                            {billingCycle === 'annual'
                              ? t('pricing.billingToggle.saveLabel')
                              : t('pricing.trial.freeTrial', { days: details.trialDays })}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {limitRows.map((row) => (
                            <div
                              key={row.label}
                              className={cn(
                                "rounded-2xl border border-slate-100 bg-white px-3 py-2",
                                row.span && "col-span-2"
                              )}
                            >
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {row.label}
                              </p>
                              <p className="text-sm font-bold text-slate-700">
                                {row.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4 flex-1">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t('pricing.salesTools')}</p>
                            <ul className="space-y-2.5">
                              {details.salesFeaturesTH.slice(0, 4).map((feature, idx) => (
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
                          <Link href={meta.href}>
                            {meta.cta}
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
