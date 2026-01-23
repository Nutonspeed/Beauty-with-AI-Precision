"use client"

import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  ArrowRight,
  Brain,
  Activity,
  Zap,
  TrendingUp,
  Sparkles,
  Building2
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
import { Header } from "@/components/header"

// Lazy load heavy components
const ROISimulator = dynamic(() => import("@/components/analytics/roi-simulator").then(mod => ({ default: mod.ROISimulator })), { ssr: false })
const GlobalCommandCenter = dynamic(() => import("@/components/visuals/global-command-center").then(mod => ({ default: mod.GlobalCommandCenter })), { ssr: false })
const VideoHeroSection = dynamic(
  () => import("@/components/sections/VideoHeroSection").then(mod => ({ default: mod.VideoHeroSection })),
  { loading: () => <VideoHeroSkeleton /> }
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
    { id: "hero", label: t('common.hero' as any) || "Overview" },
    { id: "roi", label: t('home.roi.badge' as any) || "ROI" },
    { id: "solutions", label: t('home.solutions.badge' as any) || "Solutions" },
    { id: "features", label: t('home.howItWorks.title' as any) || "Features" },
    { id: "cases", label: t('common.caseStudies' as any) || "Cases" },
    { id: "protocol", label: t('home.protocol.title' as any) || "Protocol" },
    { id: "global", label: t('common.infrastructure' as any) || "Network" },
    { id: "pricing", label: t('pricing.title' as any) || "Pricing" },
    { id: "contact", label: t('common.getStarted' as any) || "Connect" }
  ]

  useEffect(() => {
    usageTracker.trackPageView("home")
  }, [])

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

  const plans = [
    { key: 'starter', code: 'ST' },
    { key: 'professional', code: 'PRO' },
    { key: 'enterprise', code: 'ENT' },
    { key: 'platinum', code: 'PLT' }
  ] as const

  const pricingMeta = {
    starter: {
      bestFor: t('pricing.bestFor.starter' as any) || 'Best for boutique clinics',
      cta: t('pricing.plans.starter.cta' as any) || 'Start free',
      href: lp('/auth/login')
    },
    professional: {
      bestFor: t('pricing.bestFor.professional' as any) || 'Best for growing sales teams',
      cta: t('pricing.plans.professional.cta' as any) || 'Talk to us',
      href: lp('/contact?plan=professional')
    },
    enterprise: {
      bestFor: t('pricing.bestFor.enterprise' as any) || 'Best for multi-branch operators',
      cta: t('pricing.plans.enterprise.cta' as any) || 'Book a consult',
      href: lp('/contact?plan=enterprise')
    },
    platinum: {
      bestFor: t('pricing.bestFor.platinum' as any) || 'Best for global brands',
      cta: t('pricing.plans.platinum.cta' as any) || 'Design my plan',
      href: lp('/contact?plan=platinum')
    }
  }

  const formatLimit = (value: number) => {
    if (value === -1) return t('pricing.limits.unlimited' as any) || 'Unlimited'
    return value.toString()
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f6f2] text-slate-950 selection:bg-pink-500/10">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,214,229,0.45),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(196,221,255,0.4),_transparent_60%)] opacity-70" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply bg-[url('/textures/noise.svg')] bg-[size:160px_160px]" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <ScrollProgressBar />
        <MedicalCursor />
        <FloatingSymbols />
        <Header />
        <SideNav sections={sectionData} containerRef={containerRef} />
        
        <main ref={containerRef as any} className="flex-1 relative overflow-hidden flex flex-col">
        {/* 1. Cinematic Hero Section */}
        <section id="hero" className="relative">
          <VideoHeroSection />
        </section>

        {/* Global Trust interface */}
        <TrustSection />

        {/* 2. Precision ROI Section */}
        <section id="roi" className="relative py-20 lg:py-32 bg-transparent overflow-hidden">
          {/* Infrastructure Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
          </div>

          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              <div className="lg:col-span-5 space-y-10">
                <ScrollReveal direction="up">
                  <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 font-black tracking-[0.3em] text-[10px] uppercase shadow-sm animate-pulse italic">
                    <TrendingUp className="mr-3 h-3.5 w-3.5" />
                    {t('home.roi.badge' as any) || 'Economic Synchronicity'}
                  </Badge>
                </ScrollReveal>

                <div className="space-y-6">
                  <ScrollReveal direction="up" delay={0.1}>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.85] italic uppercase">
                      {t('home.roi.title' as any) || 'Quantitative'}<br />
                      <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-4">Yield Growth</span>
                    </h2>
                  </ScrollReveal>

                  <ScrollReveal direction="up" delay={0.2}>
                    <p className="text-xl text-slate-500 font-light leading-relaxed tracking-tight italic">
                      {t('home.roi.description' as any) || 'Orchestrate a significant uplift in center performance through precision-calibrated patient conversion nodes.'}
                    </p>
                  </ScrollReveal>
                </div>

                <ScrollReveal direction="up" delay={0.3}>
                  <div className="flex items-center gap-12 pt-8 relative">
                    <MedicalPulse className="absolute -bottom-12 left-0 w-full h-4 text-pink-500/10" />
                    <div className="space-y-2 group">
                      <div className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover:text-pink-600 transition-colors">
                        <NumberTicker value={45} suffix="%" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('home.roi.avgRevenueUplift' as any) || 'Revenue Node Lift'}</div>
                    </div>
                    <Separator orientation="vertical" className="h-16 bg-slate-100" />
                    <div className="space-y-2 group">
                      <div className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover:text-blue-600 transition-colors">
                        <NumberTicker value={2.4} decimalPlaces={1} suffix="x" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('home.roi.clientRetention' as any) || 'Retention Vector'}</div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              <ZoomOnScroll className="lg:col-span-7">
                <Card className="rounded-[4rem] border-slate-100 bg-white p-4 lg:p-6 shadow-premium hover:border-pink-500/20 transition-all duration-1000 relative group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="rounded-[3.5rem] overflow-hidden border border-slate-50">
                    <ROISimulator isEnterprise={true} />
                  </div>
                </Card>
              </ZoomOnScroll>
            </div>
          </div>
        </section>

        {/* 3. Aesthetic Solution Matrix interface */}
        <section id="solutions" className="relative py-20 lg:py-32 bg-slate-50/30 border-y border-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-24 max-w-4xl text-center space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-white font-black tracking-[0.3em] text-[10px] uppercase shadow-sm italic animate-pulse">
                {t('home.solutions.badge' as any) || 'Orchestration Hubs'}
              </Badge>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.85] italic uppercase">
                {t('demo.selector.title' as any) || 'Select your'}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6">{t('demo.selector.subtitle' as any) || 'Experience Sequence'}</span>
              </h2>
              <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto italic leading-relaxed tracking-tight">
                {t('demo.selector.description' as any) || 'Navigate through our dual-track diagnostic ecosystem designed for both consumers and professional clinicians.'}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {[
                { 
                  href: "/analysis", 
                  icon: Brain, 
                  title: t('demo.selector.ai.title' as any) || 'Neural Consumer Node',
                  desc: t('demo.selector.ai.description' as any) || 'Synchronize your individual biological parameters with our 468-point neural mapping sequence.',
                  cta: t('demo.selector.ai.cta' as any) || 'Initialize Scan',
                  color: 'text-pink-600',
                  bg: 'bg-pink-50'
                },
                { 
                  href: "/demo/center", 
                  icon: Activity, 
                  title: t('demo.selector.revenue.title' as any) || 'Clinical Yield Console',
                  desc: t('demo.selector.revenue.description' as any) || 'Orchestrate multi-branch financial yield and synchronize operational telemetry across your network.',
                  cta: t('demo.selector.revenue.cta' as any) || 'Launch Console',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50'
                }
              ].map((node, i) => (
                <MagneticButton key={i} strength={0.05} className="w-full">
                  <Link href={lp(node.href)} className="block h-full group">
                    <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden group-hover:border-pink-500/20 transition-all duration-700 relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-12 space-y-10 flex flex-col justify-between h-full bg-slate-50/30 group-hover:bg-white transition-all duration-700">
                        <div className="space-y-10">
                          <div className={cn("h-20 w-20 rounded-[1.5rem] border border-slate-100 shadow-inner flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-3", node.bg, node.color)}>
                            <node.icon className="h-10 w-10" />
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tight group-hover:text-pink-600 transition-colors leading-none">
                              {node.title}
                            </h3>
                            <p className="text-lg text-slate-500 font-light italic leading-relaxed">
                              {node.desc}
                            </p>
                          </div>
                        </div>
                        <div className="pt-8 border-t border-slate-100 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 group-hover:translate-x-2 transition-all italic">
                          {node.cta}
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </MagneticButton>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Modular Features Sequence */}
        <section id="features" className="relative">
          <FeaturesShowcase />
        </section>

        {/* 5. Chronology Testimonials */}
        <section id="cases" className="relative bg-transparent">
          <StickyTestimonials />
        </section>

        {/* 6. Precision Protocol interface */}
        <ProtocolFlow />

        {/* 7. Global Infrastructure Node */}
        <section id="global" className="bg-slate-950 relative overflow-hidden min-h-[70vh] flex flex-col justify-center py-24 lg:py-36">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-600/5 pointer-events-none" />
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="mx-auto mb-24 max-w-4xl text-center space-y-8">
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/20 text-pink-500 bg-white/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic shadow-2xl">
                Infrastructure_Global_Deployment
              </Badge>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] italic uppercase">
                Aesthetic<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em]">Network_Sync</span>
              </h2>
            </div>
            <div className="rounded-[4rem] border border-white/5 bg-black/40 backdrop-blur-3xl p-2 shadow-2xl relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-600/5 rounded-[5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="rounded-[3.5rem] overflow-hidden border border-white/5 relative z-10">
                <GlobalCommandCenter />
              </div>
            </div>
          </div>
        </section>

        {/* 8. Pricing Matrix interface */}
        <section id="pricing" className="py-20 lg:py-36 bg-transparent relative overflow-hidden border-y border-slate-100">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-pink-500/5 blur-[120px] animate-glow-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01]" />
          </div>
          
          <div className="container relative z-10 mx-auto px-6 max-w-7xl space-y-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-start"
            >
              <div className="space-y-10">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 font-black tracking-[0.3em] text-[10px] uppercase shadow-sm italic animate-pulse">
                  {t('pricing.hero.badge' as any) || 'License Orchestration'}
                </Badge>
                <div className="space-y-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-500/60 italic leading-none">
                    {t('pricing.hero.subtitle' as any) || 'Infrastructure Access Levels'}
                  </p>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.85] italic uppercase">
                    {t('pricing.hero.title' as any) || 'Protocol'} <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-4">Tiers</span>
                  </h2>
                  <p className="text-xl text-slate-500 font-light leading-relaxed italic max-w-2xl tracking-tight">
                    {t('pricing.hero.description' as any) || 'Scale your aesthetic network with precision-calibrated nodes designed for global deployment.'}
                  </p>
                </div>

                <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                  {/* Billing Toggle interface */}
                  <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-full border border-slate-100 shadow-inner">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={cn(
                        "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic",
                        billingCycle === 'monthly' ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t('pricing.billingToggle.monthly' as any) || 'Cycle_Monthly'}
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={cn(
                        "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic relative group",
                        billingCycle === 'annual' ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t('pricing.billingToggle.annual' as any) || 'Temporal_Annual'}
                      <div className="absolute -top-4 -right-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform">Save 20%</div>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-8">
                    {[
                      { label: t('pricing.hero.freeTrial' as any) || 'Free_Sequence', color: 'bg-pink-500' },
                      { label: t('pricing.hero.cancelAnytime' as any) || 'De-Authorize_Anytime', color: 'bg-blue-500' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className={cn("h-1.5 w-1.5 rounded-full shadow-lg transition-all group-hover:scale-150", item.color)} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-950 transition-colors italic">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <GlowCard className="rounded-[3.5rem] border-slate-100 bg-white/80 shadow-premium backdrop-blur-xl group hover:border-pink-500/20 transition-all duration-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <div className="p-12 space-y-10 relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-950 italic">
                      {t('pricing.metrics.title' as any) || 'System_Nominals'}
                    </p>
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-emerald-500/30 text-emerald-600 bg-emerald-50 text-[9px] font-black uppercase tracking-[0.2em] italic shadow-sm">
                      {t('pricing.metrics.verified' as any) || 'Synchronized'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: t('pricing.metrics.uptimeLabel' as any) || 'UPTIME', value: '99.9%' },
                      { label: t('pricing.metrics.supportLabel' as any) || 'RESPONSE', value: 'Instant' },
                      { label: t('pricing.metrics.deploymentLabel' as any) || 'LATENCY', value: '3ms' }
                    ].map((m) => (
                      <div key={m.label} className="rounded-2xl border border-slate-50 bg-slate-50/50 px-6 py-5 shadow-inner text-center group/metric hover:bg-white hover:border-pink-500/20 transition-all duration-500">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 italic group-hover/metric:text-slate-950 transition-colors">
                          {m.label}
                        </p>
                        <p className="text-2xl font-black text-slate-950 italic uppercase group-hover/metric:text-pink-600 transition-colors">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      'ISO-27001 Certified',
                      'PDPA Protocol Synchronized',
                      'Quantum-Safe Encryption',
                      'High-Yield Performance'
                    ].map((badge) => (
                      <Badge key={badge} variant="outline" className="rounded-full border-slate-100 bg-white px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400 italic shadow-sm hover:border-blue-500/20 hover:text-blue-600 transition-all duration-500">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
            >
              {plans.map((plan) => {
                const details = SUBSCRIPTION_PLANS[plan.key as keyof typeof SUBSCRIPTION_PLANS];
                const isPro = plan.key === 'professional';
                const meta = (pricingMeta as any)[plan.key];
                
                return (
                  <motion.div key={plan.key} variants={itemVariants} className="group/plan h-full">
                    <GlowCard className={cn(
                      "relative h-full border-slate-100 bg-white rounded-[3.5rem] overflow-hidden transition-all duration-700 shadow-premium flex flex-col",
                      isPro && "border-pink-500/30 shadow-2xl shadow-pink-500/10 lg:-translate-y-4 z-20 ring-1 ring-pink-500/10"
                    )}>
                      {isPro && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                          <Badge className="bg-pink-500 text-white px-8 py-2.5 rounded-full border-none shadow-2xl shadow-pink-500/30 uppercase tracking-[0.3em] text-[10px] font-black animate-glow-pulse italic">
                            {t('common.recommended' as any) || 'Aesthetic_Choice'}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="p-10 flex flex-col h-full gap-10 bg-slate-50/30 group-hover/plan:bg-white transition-all duration-700">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">
                            <span>{plan.code}</span>
                            <span className="text-emerald-500">Verified_Node</span>
                          </div>
                          <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 animate-pulse italic leading-none">
                              {meta?.bestFor}
                            </p>
                            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/plan:text-pink-600 transition-colors">
                              {t(`pricing.plans.${plan.key}.title` as any)}
                            </h3>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-relaxed italic">
                              {t(`pricing.plans.${plan.key}.tagline` as any)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2 leading-none">
                            <span className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                              {billingCycle === 'monthly' ? formatPrice(plan.key as any, locale as any) : formatAnnualPrice(plan.key as any, locale as any)}
                            </span>
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest italic leading-none opacity-40">
                              /{billingCycle === 'monthly' ? 'MO' : 'YR'}
                            </span>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic leading-none pl-1">
                            {billingCycle === 'annual'
                              ? t('pricing.billingToggle.saveLabel' as any)
                              : `Cycle: ${billingCycle.toUpperCase()}`}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: t('pricing.limits.users' as any) || 'USERS', value: formatLimit(details.maxSalesUsers) },
                            { label: t('pricing.limits.analysis' as any) || 'SYNCS', value: details.quotaPerSales === -1 ? 'Unlimited' : `${details.quotaPerSales}/MO` }
                          ].map((row) => (
                            <div key={row.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner group-hover/plan:shadow-sm transition-all text-center">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 italic leading-none">{row.label}</p>
                              <p className="text-lg font-black text-slate-950 italic uppercase leading-none">{row.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-6 flex-1">
                          <div className="space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 italic leading-none flex items-center gap-3">
                              <Zap className="h-3 w-3" />
                              Infrastructure Features
                            </p>
                            <ul className="space-y-4">
                              {details.salesFeatures.slice(0, 4).map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-[12px] text-slate-500 font-light italic leading-snug group/item">
                                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-500/30 group-hover/item:scale-150 group-hover/item:bg-pink-500 transition-all duration-500 shadow-glow-pink/20" />
                                  <span className="group-hover/item:text-slate-950 transition-colors">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Button asChild className={cn(
                          "w-full rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] h-16 transition-all hover:scale-105 active:scale-95 italic shadow-2xl",
                          isPro 
                            ? "bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white shadow-pink-500/20" 
                            : "bg-slate-950 text-white border-none shadow-slate-900/20"
                        )}>
                          <Link href={meta.href}>
                            {meta.cta}
                            <ArrowRight className="ml-4 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </GlowCard>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* 9. Final CTA - Transformation interface */}
        <section id="contact" className="relative py-32 lg:py-40 overflow-hidden bg-slate-950 flex items-center justify-center min-h-[60vh]">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-600/10 opacity-50" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-5xl text-center space-y-16"
            >
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Badge variant="outline" className="px-8 py-3 rounded-full border-pink-500/30 text-pink-500 bg-white/5 backdrop-blur-md uppercase tracking-[0.5em] text-[11px] font-black shadow-2xl animate-glow-pulse italic">
                    <Sparkles className="mr-4 h-5 w-5" />
                    Autonomous_Growth_Engine
                  </Badge>
                </motion.div>
                
                <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] italic uppercase">
                  Ready to<br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-8 tracking-[0.1em]">Synchronize?</span>
                </h2>
                
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-3xl mx-auto italic tracking-tight">
                  Authorize your center node into our precision aesthetic ecosystem and realize significant yield uplift across all operational vectors.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
                <Button size="xl" className="h-24 px-16 rounded-[3rem] shadow-2xl shadow-pink-500/30 text-[12px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic group" asChild>
                  <Link href={lp('/analysis')}>
                    <Brain className="mr-5 h-8 w-8" />
                    {t('cta.startFree' as any) || 'Initialize Free Sequence'}
                    <ArrowRight className="ml-5 h-8 w-8 group-hover:translate-x-3 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="h-24 px-16 rounded-[3rem] border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-[12px] font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 italic shadow-premium"
                  asChild
                >
                  <Link href={lp('/contact')}>
                    <Building2 className="mr-5 h-8 w-8 text-blue-400" />
                    {t('cta.contactSales' as any) || 'Partner_Protocol'}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}

function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
  return (
    <div className={cn(
      "bg-slate-100",
      orientation === 'horizontal' ? "h-px w-full" : "w-px h-full",
      className
    )} />
  )
}
