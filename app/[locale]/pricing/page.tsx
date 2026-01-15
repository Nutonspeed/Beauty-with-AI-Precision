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
import { useState } from "react"

export default function PricingPage() {
  const t = useTranslations('pricing')
  const plansT = useTranslations('plans')
  const commonT = useTranslations('common')
  const locale = useLocale()
  const language = locale as 'th' | 'en'
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

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
      color: "from-blue-500/20 to-indigo-600/20"
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
      color: "from-emerald-500/20 to-teal-600/20"
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
      color: "from-amber-500/20 to-orange-600/20"
    }
  ]

  const formatLimit = (value: number, type: 'users' | 'storage' | 'analyses') => {
    if (value === -1) return t('limits.unlimited')
    if (type === 'storage') return `${value} GB`
    if (type === 'analyses') return `${value}/${t('limits.perMonth')}`
    return value.toString()
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        {/* Cinematic Hero Section */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 border-b border-white/5">
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-5xl text-center space-y-10"
            >
              <Badge className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10" variant="outline">
                <TrendingUp className="mr-3 h-3.5 w-3.5 animate-pulse" />
                {t('hero.badge')}
              </Badge>

              <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-tight">
                {t('hero.title')}
                <span className="block mt-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent italic">
                  {t('hero.subtitle')}
                </span>
              </h1>

              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-wide">
                {t('hero.description')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-10 pt-4">
                <div className="flex items-center gap-3 group">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300 transition-colors">{t('hero.freeTrial')}</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300 transition-colors">{t('hero.cancelAnytime')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Architecture - Aesthetic Hub Matrix */}
        <section className="py-32 lg:py-48 relative">
          <div className="container relative z-10">
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
                      className={`relative h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 group ${
                        tier.popular ? 'border-pink-500/20 bg-pink-500/[0.02] shadow-2xl shadow-pink-500/10 lg:scale-105' : 'shadow-2xl'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      
                      {tier.popular && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                          <Badge className="bg-pink-600 text-white px-6 py-2 rounded-full border-none shadow-2xl shadow-pink-600/40 uppercase tracking-[0.2em] text-[9px] font-black italic">
                            {tier.badge}
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="p-10">
                        <div className="mb-10 flex items-center justify-between">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tier.color} border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 relative`}>
                            <Icon className="h-8 w-8 text-white" />
                            {tier.planKey === 'professional' && (
                              <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-pink-600 flex items-center justify-center border-2 border-[#020617] shadow-lg animate-pulse">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          {!tier.popular && (
                            <Badge variant="outline" className="border-white/5 text-slate-500 font-black uppercase tracking-widest text-[8px] bg-white/[0.02]">{tier.badge}</Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-3xl font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors">
                          {tier.name}
                          {tier.planKey === 'professional' && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                          )}
                        </CardTitle>
                        <CardDescription className="min-h-12 text-slate-500 font-light mt-4 leading-relaxed italic">{tier.description}</CardDescription>
                        
                        <div className="mt-10 space-y-1">
                          <div className="text-4xl font-black text-white tracking-tighter">{tier.price}</div>
                          {tier.period && (
                            <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">/ {tier.period}</div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-10 pt-0 space-y-10">
                        {tier.limits.trial > 0 && (
                          <div className="flex items-center gap-3 rounded-2xl bg-pink-500/5 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-pink-400 border border-pink-500/10 shadow-inner">
                            <Clock className="h-4 w-4 animate-pulse" />
                            {t('trial.freeTrial', {days: tier.limits.trial})}
                          </div>
                        )}

                        <Button 
                          size="xl"
                          className={`w-full h-16 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 ${
                            tier.popular 
                              ? 'bg-pink-600 text-white hover:bg-pink-500 shadow-2xl shadow-pink-600/30' 
                              : 'border-white/10 bg-white/5 text-white hover:bg-white/10 border'
                          }`}
                      >
                        <Link href={tier.href}>
                          {tier.cta}
                          <ArrowRight className="ml-3 h-5 w-5" />
                        </Link>
                      </Button>

                      {/* Aesthetic Intelligence Infrastructure */}
                      <div className="grid grid-cols-3 gap-2 rounded-[2rem] bg-white/[0.02] border border-white/5 p-6 text-center shadow-inner relative overflow-hidden group/node">
                        <div className="absolute inset-0 bg-pink-500/[0.01] opacity-0 group-hover/node:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                          <Users className="mx-auto mb-2 h-4 w-4 text-slate-600 group-hover/node:text-pink-400 transition-colors" />
                          <div className="font-bold text-white text-[10px] tracking-tight">{formatLimit(tier.limits.users, 'users')}</div>
                          <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest mt-1">{t('limits.users')}</div>
                        </div>
                        <div className="relative z-10 border-x border-white/5">
                          <Brain className="mx-auto mb-2 h-4 w-4 text-slate-600 group-hover/node:text-cyan-400 transition-colors" />
                          <div className="font-bold text-white text-[10px] tracking-tight">{formatLimit(tier.limits.analyses, 'analyses')}</div>
                          <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest mt-1">AI Nodes</div>
                        </div>
                        <div className="relative z-10">
                          <Zap className="mx-auto mb-2 h-4 w-4 text-slate-600 group-hover/node:text-purple-400 transition-colors" />
                          <div className="font-bold text-white text-[10px] tracking-tight">{tier.planKey === 'starter' ? 'Gemini' : 'Hybrid'}</div>
                          <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest mt-1">Engine</div>
                        </div>
                      </div>

                        {/* Aesthetic Precision Infrastructure */}
                        <div className="space-y-5">
                          {[...(tier as any).features || [], ...(tier as any).salesFeatures || [], ...(tier as any).customerFeatures || []].map((feature: string, index: number) => {
                            const isHub = feature.toLowerCase().includes('hub') || feature.toLowerCase().includes('intelligence');
                            const isSpecialized = feature.toLowerCase().includes('specialized') || feature.toLowerCase().includes('node');
                            const isSales = feature.toLowerCase().includes('conversion') || feature.toLowerCase().includes('enablement');
                            const isHighlight = tier.planKey === 'professional' && (isHub || isSpecialized || isSales);
                            
                            return (
                              <div key={index} className="flex items-start gap-4 text-sm group/item">
                                <div className={`mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                                  isHighlight ? 'bg-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.8)]' : 'bg-pink-500/50 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                                } group-hover/item:bg-pink-500`} />
                                <span className={`font-light leading-snug transition-colors ${
                                  isHighlight ? 'text-white font-bold tracking-tight' : 'text-slate-400 group-hover/item:text-slate-200'
                                }`}>
                                  {feature}
                                  {isHighlight && <Sparkles className="inline-block ml-1.5 h-3 w-3 text-pink-400 animate-pulse" />}
                                </span>
                              </div>
                            );
                          })}
                          {tier.excludedFeatures.map((feature: string, index: number) => (
                            <div key={`ex-${index}`} className="flex items-start gap-4 text-sm opacity-30 grayscale">
                              <X className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-600" />
                              <span className="text-slate-600 font-light leading-snug italic">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Aesthetic Intelligence Comparison Grid - High-End Matrix */}
        <section className="py-32 lg:py-48 relative border-y border-white/5 bg-white/[0.01]">
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-24 max-w-3xl text-center space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                {t('comparison.title')}
              </h2>
              <div className="h-1 w-20 bg-cyan-500/50 mx-auto rounded-full" />
              <p className="text-xl text-slate-400 font-light tracking-wide">
                {t('comparison.description')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-12 py-10 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                        {t('comparison.features')}
                      </th>
                      <th className="px-8 py-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Starter</th>
                      <th className="px-8 py-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-pink-400 bg-pink-500/5">Professional</th>
                      <th className="px-8 py-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
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
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-12 py-8 text-sm font-bold text-white tracking-tight">
                          {row.label}
                        </td>
                        <td className="px-8 py-8 text-center">
                          {row.starter ? <CheckCircle2 className="mx-auto h-5 w-5 text-pink-500/40" /> : <X className="mx-auto h-5 w-5 text-slate-800" />}
                        </td>
                        <td className="px-8 py-8 text-center bg-pink-500/[0.02] group-hover:bg-pink-500/5 transition-colors border-x border-white/5">
                          {row.pro ? <CheckCircle2 className="mx-auto h-5 w-5 text-pink-400" /> : <X className="mx-auto h-5 w-5 text-slate-800" />}
                        </td>
                        <td className="px-8 py-8 text-center">
                          {row.enterprise ? <CheckCircle2 className="mx-auto h-5 w-5 text-pink-500/40" /> : <X className="mx-auto h-5 w-5 text-slate-800" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Aesthetic Intelligence FAQ - Diagnostic Nodes */}
        <section className="py-32 lg:py-48 relative overflow-hidden">
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-24 max-w-2xl text-center space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                {t('faq.title')}
              </h2>
              <div className="h-1 w-20 bg-purple-500/50 mx-auto rounded-full" />
            </motion.div>

            <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-1">
              {[1, 2, 3].map((num) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: num * 0.1 }}
                >
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <CardHeader className="p-10 lg:p-12">
                      <div className="flex gap-8">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-purple-500/30 transition-all duration-500">
                          <Zap className="h-6 w-6 text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <div className="space-y-4">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors duration-500">
                            {t(`faq.q${num}` as any)}
                          </CardTitle>
                          <p className="text-lg text-slate-400 font-light leading-relaxed">
                            {t(`faq.a${num}` as any)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Deployment CTA - Cinematic Section */}
        <section className="relative py-40 overflow-hidden bg-[#020617]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-600/10" />
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center space-y-12"
            >
              <div className="space-y-6">
                <h2 className="text-5xl md:text-8xl font-bold tracking-tight text-white leading-tight">
                  {t('cta.title')}
                </h2>
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                  {t('cta.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Button size="xl" variant="premium" className="h-20 px-16 rounded-3xl shadow-2xl shadow-pink-500/20 text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all" asChild>
                  <Link href="/analysis">
                    <Sparkles className="mr-4 h-7 w-7" />
                    {t('cta.startFree')}
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="h-20 px-16 rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 text-xl font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
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
