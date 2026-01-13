"use client"

import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  ArrowRight, 
  Brain, 
  Activity, 
  Microscope, 
  Fingerprint, 
  Globe, 
  Calculator,
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
import { LandingHero } from "@/components/LandingHero"
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { CaseStudyCarousel } from "@/components/CaseStudyCarousel"
import { SideNav } from "@/components/ui/side-nav"
import { NumberTicker } from "@/components/ui/number-ticker"
import { MedicalCursor } from "@/components/ui/medical-cursor"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const locale = useLocale()
  const containerRef = useRef<HTMLElement | null>(null)

  const sectionData = [
    { id: "hero", label: t('common.hero' as any) || "Overview" },
    { id: "roi", label: "Strategic ROI" },
    { id: "solutions", label: "Solutions" },
    { id: "features", label: "Capabilities" },
    { id: "cases", label: "Case Studies" },
    { id: "protocol", label: "Protocol" },
    { id: "global", label: "Infrastructure" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Get Started" }
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

  return (
    <>
      <MedicalCursor />
      <SideNav sections={sectionData} containerRef={containerRef} />
      <main ref={containerRef} className="snap-container">
        {/* 1. Hero Section */}
        <section id="hero" className="snap-section relative border-b border-slate-100">
          <LandingHero 
            _onPrimary={onHeroCta} 
            _onSecondary={onDemoCta}
          />
        </section>

        {/* 2. ROI Section */}
        <section id="roi" className="snap-section flex items-center bg-slate-50/50 border-b border-slate-100 overflow-hidden group">
          <div className="section-orb top-0 -left-20 w-80 h-80 bg-blue-400" />
          <div className="scan-line opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="container relative z-10 py-12 lg:py-0">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 space-y-8"
              >
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase glow-badge">
                  CenterIQ Strategic ROI
                </Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight text-reveal">
                Quantify Your <br />
                <span className="text-blue-600">Business Growth</span>
              </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Use our Strategic ROI Simulator to calculate the precise financial impact of AI integration on your aesthetic center's operations.
                </p>
                <div className="flex items-center gap-12 pt-4">
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
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 lg:p-12 shadow-xl shadow-slate-200/50"
              >
                <ROISimulator isEnterprise={true} />
              </motion.div>
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
                Explore Solutions
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 text-reveal">
                {t('demo.selector.title')} <span className="text-blue-600">{t('demo.selector.subtitle')}</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {t('demo.selector.description')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Link href={lp("/analysis")}>
                <Card className="h-full border-slate-200 bg-white rounded-2xl overflow-hidden group transition-all duration-300 shadow-sm medical-card-hover">
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
                </Card>
              </Link>

              <Link href={lp("/demo/center")}>
                <Card className="h-full border-slate-200 bg-white rounded-2xl overflow-hidden group transition-all duration-300 shadow-sm medical-card-hover">
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
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section id="features" className="snap-section flex items-center bg-slate-50/50 border-b border-slate-100 relative overflow-hidden group">
          <div className="section-orb top-1/2 -left-40 w-[500px] h-[500px] bg-indigo-200" />
          <div className="scan-line opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="container relative z-10 py-12 lg:py-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-16 lg:mb-20 max-w-3xl text-center space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase glow-badge">
                Core Capabilities
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 text-reveal">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {t('home.features.description')}
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full border-slate-200 bg-white rounded-2xl transition-all medical-card-hover group">
                    <CardContent className="p-8 space-y-6">
                      <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 transition-colors">
                          {t(`home.features.${feature.key}.title` as any)}
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-normal text-sm">
                          {t(`home.features.${feature.key}.description` as any)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Case Studies */}
        <section id="cases" className="snap-section flex items-center bg-white border-b border-slate-100">
          <div className="container relative z-10">
            <CaseStudyCarousel />
          </div>
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

            <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
              {[
                { step: "01", key: 'step1' },
                { step: "02", key: 'step2' },
                { step: "03", key: 'step3' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group p-8 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-5xl font-bold text-slate-100 absolute -top-6 -left-2 select-none group-hover:text-blue-50 transition-colors">
                    {item.step}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {t(`home.protocol.${item.key}.title` as any)}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {t(`home.protocol.${item.key}.description` as any)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Global Infrastructure */}
        <section id="global" className="snap-section flex items-center bg-slate-900 overflow-hidden">
          <div className="w-full h-full relative">
            <GlobalCommandCenter />
          </div>
        </section>

        {/* 8. Pricing Section */}
        <section id="pricing" className="snap-section flex items-center bg-white border-b border-slate-100 relative overflow-hidden group">
          <div className="section-orb top-0 right-0 w-96 h-96 bg-blue-50" />
          <div className="container relative z-10 py-12 lg:py-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-16 lg:mb-20 max-w-3xl text-center space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase glow-badge">
                {t('home.subscription.badge')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 text-reveal">
                Simple <span className="text-blue-600">Pricing</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {t('home.subscription.description')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, i) => {
                const details = SUBSCRIPTION_PLANS[plan.key as keyof typeof SUBSCRIPTION_PLANS];
                const isPro = plan.key === 'professional';
                
                return (
                  <motion.div
                    key={plan.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className={cn(
                      "relative h-full border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-sm medical-card-hover",
                      isPro && "border-blue-500 shadow-blue-100 shadow-xl lg:scale-105 z-20"
                    )}>
                      {isPro && (
                        <div className="absolute top-0 right-0 p-2 px-6 bg-blue-600 text-[9px] font-bold text-white uppercase tracking-wider rounded-bl-xl">
                          Recommended
                        </div>
                      )}
                      <CardContent className="p-8 flex flex-col h-full space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            {t(`pricing.plans.${plan.key}.name` as any)}
                          </h3>
                          <p className="text-sm text-slate-500 min-h-[40px]">
                            {t(`pricing.plans.${plan.key}.description` as any)}
                          </p>
                        </div>
                        
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-slate-900">฿{details.price.toLocaleString()}</span>
                          <span className="text-slate-500 text-xs font-medium">/month</span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <ul className="space-y-3 flex-1">
                          {[0, 1, 2].map((idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span>{t(`pricing.plans.${plan.key}.features.${idx}` as any)}</span>
                            </li>
                          ))}
                        </ul>

                        <Button asChild className={cn(
                          "w-full rounded-xl font-bold uppercase tracking-wider h-12",
                          isPro ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800"
                        )}>
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
                <Button size="xl" className="h-14 px-10 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold" asChild>
                  <Link href="/analysis" className="flex items-center gap-2">
                    {t('home.startFreeAnalysis')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="h-14 px-10 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold" asChild>
                  <Link href="/contact">
                    {t('home.cta.contactSales')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <Footer />
        </section>
      </main>
    </>
  )
}
