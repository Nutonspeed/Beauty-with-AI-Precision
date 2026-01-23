"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  CheckCircle2, 
  X,
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Crown, 
  Building2, 
  Users, 
  Zap, 
  Clock,
  Cpu,
  Globe,
  Brain
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { SUBSCRIPTION_PLANS, formatPrice, formatAnnualPrice } from "@/lib/subscriptions/plans"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function PricingPage() {
  const t = useTranslations('pricing')
  const plansT = useTranslations('plans')
  const locale = useLocale()
  const language = locale as 'th' | 'en'

  const pricingTiers = [
    {
      planKey: 'starter' as const,
      name: plansT('starter.name'),
      badge: plansT('starter.badge' as any) || 'Starter',
      icon: Cpu,
      price: formatPrice('starter', language),
      priceAnnual: formatAnnualPrice('starter', language),
      period: t('plans.starter.period'),
      limits: {
        users: SUBSCRIPTION_PLANS.starter.maxSalesUsers,
        storage: SUBSCRIPTION_PLANS.starter.maxStorageGB,
        analyses: SUBSCRIPTION_PLANS.starter.quotaPerSales,
        trial: SUBSCRIPTION_PLANS.starter.trialDays
      },
      description: t('plans.starter.description'),
      salesFeatures: plansT.raw('starter.features'),
      customerFeatures: plansT.raw('starter.customerFeatures'),
      excludedFeatures: plansT.raw('starter.limitations'),
      cta: t('plans.starter.cta'),
      href: "/auth/login",
      variant: "outline" as const,
      color: "from-sky-500/20 to-cyan-400/20"
    },
    {
      planKey: 'professional' as const,
      name: plansT('professional.name'),
      badge: plansT('professional.badge' as any) || 'Recommended',
      icon: Crown,
      price: formatPrice('professional', language),
      priceAnnual: formatAnnualPrice('professional', language),
      period: t('plans.professional.period'),
      limits: {
        users: SUBSCRIPTION_PLANS.professional.maxSalesUsers,
        storage: SUBSCRIPTION_PLANS.professional.maxStorageGB,
        analyses: SUBSCRIPTION_PLANS.professional.quotaPerSales,
        trial: SUBSCRIPTION_PLANS.professional.trialDays
      },
      description: t('plans.professional.description'),
      salesFeatures: plansT.raw('professional.features'),
      customerFeatures: plansT.raw('professional.customerFeatures'),
      excludedFeatures: [],
      cta: t('plans.professional.cta'),
      href: "/contact?plan=professional",
      variant: "default" as const,
      popular: true,
      color: "from-pink-500/20 to-purple-600/20"
    },
    {
      planKey: 'enterprise' as const,
      name: plansT('enterprise.name'),
      badge: plansT('enterprise.badge' as any) || 'Enterprise',
      icon: Building2,
      price: formatPrice('enterprise', language),
      priceAnnual: formatAnnualPrice('enterprise', language),
      period: t('plans.enterprise.period'),
      limits: {
        users: SUBSCRIPTION_PLANS.enterprise.maxSalesUsers,
        storage: SUBSCRIPTION_PLANS.enterprise.maxStorageGB,
        analyses: SUBSCRIPTION_PLANS.enterprise.quotaPerSales,
        trial: SUBSCRIPTION_PLANS.enterprise.trialDays
      },
      description: t('plans.enterprise.description'),
      salesFeatures: plansT.raw('enterprise.features'),
      customerFeatures: plansT.raw('enterprise.customerFeatures'),
      excludedFeatures: [],
      cta: t('plans.enterprise.cta'),
      href: "/contact?plan=enterprise",
      variant: "outline" as const,
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      planKey: 'platinum' as const,
      name: plansT('platinum.name'),
      badge: plansT('platinum.badge' as any) || 'Platinum',
      icon: Globe,
      price: formatPrice('platinum', language),
      priceAnnual: formatAnnualPrice('platinum', language),
      period: t('plans.platinum.period'),
      limits: {
        users: SUBSCRIPTION_PLANS.platinum.maxSalesUsers,
        storage: SUBSCRIPTION_PLANS.platinum.maxStorageGB,
        analyses: SUBSCRIPTION_PLANS.platinum.quotaPerSales,
        trial: SUBSCRIPTION_PLANS.platinum.trialDays
      },
      description: t('plans.platinum.description'),
      salesFeatures: plansT.raw('platinum.features'),
      customerFeatures: plansT.raw('platinum.customerFeatures'),
      excludedFeatures: [],
      cta: t('plans.platinum.cta'),
      href: "/contact?plan=platinum",
      variant: "outline" as const,
      color: "from-slate-500/20 to-blue-500/20"
    }
  ]

  const formatLimit = (value: number, type: 'users' | 'storage' | 'analyses') => {
    if (value === -1) return t('limits.unlimited')
    if (type === 'storage') return `${value} GB`
    if (type === 'analyses') return `${value}/${t('limits.perMonth')}`
    return value.toString()
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        {/* Cinematic Hero Section */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 border-b border-slate-100">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-5xl text-center space-y-12"
            >
              <Badge className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic" variant="outline">
                <TrendingUp className="mr-3 h-3.5 w-3.5 text-pink-500" />
                {t('hero.badge')}
              </Badge>

              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                {t('hero.title')}
                <span className="block mt-6 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic uppercase text-3xl md:text-5xl tracking-[0.3em]">
                  {t('hero.subtitle')}
                </span>
              </h1>

              <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-tight italic">
                {t('hero.description')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-12 pt-6">
                <div className="flex items-center gap-4 group">
                  <div className="h-2 w-2 rounded-full bg-pink-500 shadow-glow-pink" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{t('hero.freeTrial')}</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-glow-blue" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{t('hero.cancelAnytime')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Architecture */}
        <section className="py-32 lg:py-48 relative">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {pricingTiers.map((tier, i) => {
                const Icon = tier.icon
                return (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card 
                      className={cn(
                        "relative h-full border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group flex flex-col",
                        tier.popular && 'border-pink-500/30 shadow-2xl shadow-pink-500/10 lg:-translate-y-4'
                      )}
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {tier.popular && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                          <Badge className="bg-pink-500 text-white px-8 py-2.5 rounded-full border-none shadow-2xl shadow-pink-500/30 uppercase tracking-[0.3em] text-[10px] font-black animate-glow-pulse italic">
                            {tier.badge}
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="p-10 pb-6">
                        <div className="mb-12 flex items-center justify-between">
                          <div className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-50 shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 relative",
                            tier.popular ? "bg-pink-50" : "bg-slate-50"
                          )}>
                            <Icon className={cn("h-8 w-8", tier.popular ? 'text-pink-600 shadow-glow-pink/30' : 'text-slate-300')} />
                            {tier.planKey === 'professional' && (
                              <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-pink-500 flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          {!tier.popular && (
                            <Badge variant="outline" className="border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[8px] bg-slate-50/50 italic px-4 py-1.5 rounded-full">{tier.badge}</Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter group-hover:text-pink-600 transition-colors italic uppercase leading-none">
                          {tier.name}
                          {tier.planKey === 'professional' && (
                            <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping shadow-glow-pink" />
                          )}
                        </CardTitle>
                        <CardDescription className="min-h-12 text-slate-500 font-light mt-6 leading-relaxed italic text-lg">{tier.description}</CardDescription>
                        
                        <div className="mt-12 space-y-2">
                          <div className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{tier.price}</div>
                          {tier.period && (
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic pl-1">/ {tier.period}</div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-10 pt-0 space-y-12 flex-1 flex flex-col justify-between">
                        <div className="space-y-12">
                          {tier.limits.trial > 0 && (
                            <div className="flex items-center gap-4 rounded-2xl bg-pink-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 border border-pink-100 shadow-inner italic">
                              <Clock className="h-4 w-4 text-pink-500" />
                              {t('trial.freeTrial', {days: tier.limits.trial})}
                            </div>
                          )}

                          <Button 
                            size="xl"
                            className={cn(
                              "w-full h-18 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 italic",
                              tier.popular 
                                ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white shadow-2xl shadow-pink-500/20 border-none' 
                                : 'bg-white text-slate-950 border border-slate-200 hover:border-pink-500/30 hover:bg-slate-50 shadow-premium'
                            )}
                            asChild
                          >
                            <Link href={tier.href} className="flex items-center justify-center">
                              {tier.cta}
                              <ArrowRight className="ml-4 h-5 w-5" />
                            </Link>
                          </Button>

                          {/* Metric Infrastructure interface */}
                          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center shadow-inner relative overflow-hidden group/node">
                            <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover/node:opacity-100 transition-opacity duration-700" />
                            <div className="relative z-10">
                              <Users className="mx-auto mb-3 h-4 w-4 text-slate-300 group-hover/node:text-pink-600 transition-all duration-500" />
                              <div className="font-black text-slate-950 text-[10px] tracking-tight italic uppercase leading-none">{formatLimit(tier.limits.users, 'users')}</div>
                              <div className="text-[7px] text-slate-400 uppercase font-black tracking-widest mt-2 italic">{t('limits.users')}</div>
                            </div>
                            <div className="relative z-10 border-x border-slate-200">
                              <Brain className="mx-auto mb-3 h-4 w-4 text-slate-300 group-hover/node:text-purple-600 transition-all duration-500" />
                              <div className="font-black text-slate-950 text-[10px] tracking-tight italic uppercase leading-none">{formatLimit(tier.limits.analyses, 'analyses')}</div>
                              <div className="text-[7px] text-slate-400 uppercase font-black tracking-widest mt-2 italic">{t('limits.analysis')}</div>
                            </div>
                            <div className="relative z-10">
                              <Zap className="mx-auto mb-3 h-4 w-4 text-slate-300 group-hover/node:text-blue-600 transition-all duration-500" />
                              <div className="font-black text-slate-950 text-[10px] tracking-tight italic uppercase leading-none">{tier.planKey === 'starter' ? 'Gemini' : 'Hybrid'}</div>
                              <div className="text-[7px] text-slate-400 uppercase font-black tracking-widest mt-2 italic">{t('limits.engine')}</div>
                            </div>
                          </div>

                          {/* Features Sequence interface */}
                          <div className="space-y-6 pt-4">
                            {[...(tier as any).features || [], ...(tier as any).salesFeatures || [], ...(tier as any).customerFeatures || []].map((feature: string, index: number) => {
                              const isHub = feature.toLowerCase().includes('hub') || feature.toLowerCase().includes('intelligence');
                              const isSpecialized = feature.toLowerCase().includes('specialized') || feature.toLowerCase().includes('node');
                              const isSales = feature.toLowerCase().includes('conversion') || feature.toLowerCase().includes('enablement');
                              const isHighlight = tier.planKey === 'professional' && (isHub || isSpecialized || isSales);
                              
                              return (
                                <div key={index} className="flex items-start gap-5 text-sm group/item">
                                  <div className={cn(
                                    "mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-500",
                                    isHighlight ? 'bg-pink-500 shadow-glow-pink' : 'bg-slate-200 group-hover/item:bg-pink-500 group-hover/item:scale-150'
                                  )} />
                                  <span className={cn(
                                    "text-[13px] leading-snug transition-colors italic",
                                    isHighlight ? 'text-slate-950 font-black tracking-tight' : 'text-slate-500 group-hover/item:text-slate-950 font-light'
                                  )}>
                                    {feature}
                                    {isHighlight && <Sparkles className="inline-block ml-2 h-3 w-3 text-pink-500 animate-pulse" />}
                                  </span>
                                </div>
                              );
                            })}
                            {tier.excludedFeatures.map((feature: string, index: number) => (
                              <div key={`ex-${index}`} className="flex items-start gap-5 text-sm opacity-30 group/ex">
                                <X className="mt-1.5 h-3.5 w-3.5 shrink-0 text-slate-300 group-hover/ex:text-rose-600 transition-colors" />
                                <span className="text-[13px] text-slate-400 font-light leading-snug italic line-through decoration-slate-300">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Comparison Matrix interface */}
        <section className="py-32 lg:py-48 relative border-y border-slate-100 bg-white">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-32 max-w-3xl text-center space-y-10"
            >
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase">
                {t('comparison.title')}
              </h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-blue-600 mx-auto rounded-full" />
              <p className="text-xl text-slate-500 font-light tracking-tight italic">
                {t('comparison.description')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-[3.5rem] border border-slate-100 bg-white shadow-premium relative group"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                        {t('comparison.features')}
                      </th>
                      <th className="px-8 py-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('plans.starter.title')}</th>
                      <th className="px-8 py-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-pink-600 bg-pink-50/50 italic">{t('plans.professional.title')}</th>
                      <th className="px-8 py-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('plans.enterprise.title')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[ 
                      { label: t('comparison.aiAnalysis'), starter: true, pro: true, enterprise: true },
                      { label: t('comparison.aestheticMetrics'), starter: true, pro: true, enterprise: true },
                      { label: t('comparison.saveHistory'), starter: false, pro: true, enterprise: true },
                      { label: t('comparison.arSimulator'), starter: false, pro: true, enterprise: true },
                      { label: t('comparison.predictiveSales'), starter: false, pro: true, enterprise: true },
                      { label: t('comparison.roiSimulator'), starter: false, pro: true, enterprise: true },
                      { label: t('comparison.ads'), starter: false, pro: false, enterprise: true },
                      { label: t('comparison.complianceAudit'), starter: false, pro: false, enterprise: true },
                      { label: t('comparison.revenueForecast'), starter: false, pro: false, enterprise: true },
                      { label: t('comparison.multiBranch'), starter: false, pro: false, enterprise: true }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group/row relative">
                        <td className="px-12 py-10 text-xl font-black text-slate-950 tracking-tighter italic uppercase group-hover/row:text-pink-600 transition-colors leading-none">
                          {row.label}
                        </td>
                        <td className="px-8 py-10 text-center">
                          {row.starter ? <CheckCircle2 className="mx-auto h-7 w-7 text-slate-200" /> : <X className="mx-auto h-7 w-7 text-slate-50" />}
                        </td>
                        <td className="px-8 py-10 text-center bg-pink-50/20 group-hover/row:bg-pink-50/40 transition-colors border-x border-slate-100">
                          {row.pro ? <CheckCircle2 className="mx-auto h-7 w-7 text-pink-500 shadow-glow-pink/30" /> : <X className="mx-auto h-7 w-7 text-slate-200" />}
                        </td>
                        <td className="px-8 py-10 text-center">
                          {row.enterprise ? <CheckCircle2 className="mx-auto h-7 w-7 text-blue-500 shadow-glow-blue/30" /> : <X className="mx-auto h-7 w-7 text-slate-50" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Global Deployment CTA interface */}
        <section className="relative py-48 overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-600/10" />
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center space-y-16"
            >
              <div className="space-y-8">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] italic uppercase">
                  {t('cta.title')}
                </h2>
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto italic tracking-tight">
                  {t('cta.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
                <Button size="xl" variant="premium" className="h-20 px-16 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white border-none italic" asChild>
                  <Link href="/analysis">
                    <Sparkles className="mr-4 h-7 w-7" />
                    {t('cta.startFree')}
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="h-20 px-16 rounded-[2rem] border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 italic shadow-premium"
                  asChild
                >
                  <Link href="/contact">
                    <Building2 className="mr-4 h-7 w-7" />
                    {t('cta.contactSales')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
