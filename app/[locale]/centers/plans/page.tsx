'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle2, Sparkles, Info, PlusCircle, Users, Brain, Shield, BarChart3, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { SUBSCRIPTION_PLANS, formatPrice, formatAnnualPrice } from '@/lib/subscriptions/plans'
import { useState, useEffect } from 'react'

export default function CenterPlansPage() {
  const t = useTranslations()
  const plansT = useTranslations('plans')
  const pricingT = useTranslations('pricing')
  const locale = useLocale()
  const language = (locale as 'th' | 'en') || 'th'
  const [currentPlanId, setCurrentPlanId] = useState<string>('starter')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch('/api/center/plan')
        if (res.ok) {
          const data = await res.json()
          setCurrentPlanId(data.planId || 'starter')
          setBillingCycle(data.billingCycle || 'monthly')
        }
      } catch (error) {
        console.error('Error fetching plan:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlan()
  }, [])

  const tiers = [
    {
      id: 'starter',
      details: SUBSCRIPTION_PLANS.starter as any,
      color: "from-blue-500/20 to-indigo-600/20"
    },
    {
      id: 'professional',
      details: SUBSCRIPTION_PLANS.professional as any,
      color: "from-pink-500/20 to-purple-600/20",
      popular: true
    },
    {
      id: 'enterprise',
      details: SUBSCRIPTION_PLANS.enterprise as any,
      color: "from-emerald-500/20 to-teal-600/20"
    },
    {
      id: 'platinum',
      details: SUBSCRIPTION_PLANS.platinum as any,
      color: "from-amber-500/20 to-orange-600/20"
    }
  ]

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto">
          {/* Plans Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Package className="mr-3 h-3.5 w-3.5 animate-pulse" />
                {pricingT('activeNode')}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                {pricingT('title').split(' ').slice(0, 2).join(' ')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">{pricingT('title').split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                {pricingT('subtitle')}
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <div className="flex items-center gap-6 bg-white/[0.03] p-2 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", billingCycle === 'monthly' ? "text-white" : "text-slate-600")}>
                {pricingT('billingToggle.monthly')}
              </span>
              <button 
                onClick={() => setBillingCycle((prev: string) => prev === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 rounded-full bg-white/5 border border-white/10 p-1 transition-colors hover:border-pink-500/30"
              >
                <motion.div 
                  className="w-5 h-5 rounded-full bg-pink-600 shadow-lg shadow-pink-600/40"
                  animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-3">
                <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", billingCycle === 'annual' ? "text-white" : "text-slate-600")}>
                  {pricingT('billingToggle.annual')}
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] py-0 px-2 italic font-black">
                  -2 MONTHS
                </Badge>
              </div>
            </div>
          </div>

          {/* Current Activation State Interface */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000">
                  <CheckCircle2 className="w-48 h-48 text-pink-500" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 relative z-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60 italic">{pricingT('activeNode')}</p>
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black text-white tracking-tighter italic capitalize">
                        {pricingT('activeTier', { tier: currentPlanId })}
                      </h2>
                      <p className="text-lg text-slate-400 font-light italic tracking-wide">
                        {pricingT('billingCycle')} <span className="text-white font-bold uppercase tracking-widest">{billingCycle === 'monthly' ? pricingT('billingToggle.monthly') : pricingT('billingToggle.annual')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Button variant="outline" className="h-14 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                      {pricingT('billingHistory')}
                    </Button>
                    <Button variant="premium" className="h-14 px-10 rounded-xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                      {pricingT('changeCycle')}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Resource Allocation Nodes Grid */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, i) => {
              const isCurrent = tier.id === currentPlanId
              const details = tier.details as any

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                >
                  <Card className={cn(
                    "relative flex flex-col h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 group shadow-2xl overflow-hidden",
                    tier.popular && "border-pink-500/20 bg-pink-500/[0.01] shadow-[0_0_80px_-20px_rgba(236,72,153,0.1)] lg:scale-105"
                  )}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    {isCurrent && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-emerald-500 text-white px-6 py-1.5 rounded-full border-none shadow-2xl shadow-emerald-500/40 uppercase tracking-[0.2em] text-[8px] font-black italic">ACTIVE NODE</Badge>
                      </div>
                    )}

                    <CardHeader className="p-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors uppercase">{plansT(`${tier.id}.name`)}</CardTitle>
                        {tier.popular && (
                          <Badge className="bg-pink-600 text-white uppercase tracking-[0.2em] text-[8px] font-black italic border-none shadow-inner">
                            RECOMMENDED
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-light italic leading-relaxed min-h-[40px]">
                        {plansT(`${tier.id}.tagline`)}
                      </p>
                      <div className="space-y-1">
                        <p className="text-3xl font-black text-white tracking-tighter italic">
                          {billingCycle === 'monthly' ? formatPrice(tier.id as any, language) : formatAnnualPrice(tier.id as any, language)}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 italic">
                          Per month, {billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-10 pt-0 flex-1 flex flex-col justify-between space-y-8">
                      {/* Technical Infrastructure */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-500/60 italic">{pricingT('quotaNote.salesOnly').replace('_RESTRICTION', '')}</p>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs text-slate-400 italic">
                              <Users className="h-3.5 w-3.5 text-pink-500/40" />
                              <span>{details.maxSalesUsers === -1 ? pricingT('infiniteNodes') : pricingT('authorizedNodes', { count: details.maxSalesUsers })}</span>
                            </li>
                            <li className="flex items-center gap-3 text-xs text-slate-400 italic">
                              <Brain className="h-3.5 w-3.5 text-pink-500/40" />
                              <span>{details.quotaPerSales === -1 ? pricingT('unlimitedAnalysis') : pricingT('analysisPerNode', { count: details.quotaPerSales })}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/60 italic">Customer Portal</p>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs text-slate-400 italic">
                              <Shield className="h-3.5 w-3.5 text-cyan-500/40" />
                              <span>{pricingT('unlimitedAccounts')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-xs text-slate-400 italic">
                              <BarChart3 className="h-3.5 w-3.5 text-cyan-500/40" />
                              <span>{pricingT('infiniteHistory')}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <Button
                        variant={tier.popular ? "premium" : "outline"}
                        className={cn(
                          "w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] transition-all hover:scale-[1.02] active:scale-[0.98]",
                          !tier.popular && "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {isCurrent ? pricingT('activeSystem') : pricingT('initializeUpgrade')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Add-ons & Quota Notes Infrastructure */}
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Info className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold italic text-white">{pricingT('quotaNote.title')}</h4>
              </div>
              <p className="text-sm text-slate-500 italic leading-relaxed">
                {pricingT('quotaNote.description')}
              </p>
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-full px-4 py-2 w-fit">
                <Zap className="h-3.5 w-3.5 text-pink-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pricingT('quotaNote.salesOnly')}</span>
              </div>
            </Card>

            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold italic text-white">{pricingT('addons.title')}</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { key: 'extraSalesUser', label: pricingT('addons.extraSalesUser') },
                  { key: 'extraBranch', label: pricingT('addons.extraBranch') },
                  { key: 'extraAnalyses', label: pricingT('addons.extraAnalyses') },
                  { key: 'extraAR', label: pricingT('addons.extraAR') },
                ].map((addon) => (
                  <div key={addon.key} className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 italic">{addon.key.replace('extra', 'system')}</p>
                    <p className="text-xs font-bold text-slate-300">{addon.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Technical Parameter FAQ Nodes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <CardHeader className="p-12 pb-6">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                  {pricingT('faq.title')}
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{pricingT('faq.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="p-12 pt-6">
                <div className="grid md:grid-cols-3 gap-12">
                  {[
                    { q: pricingT('faq.q1'), a: pricingT('faq.a1') },
                    { q: pricingT('faq.q2'), a: pricingT('faq.a2') },
                    { q: pricingT('faq.q3'), a: pricingT('faq.a3') }
                  ].map((faq, i) => (
                    <div key={i} className="space-y-4 group">
                      <div className="h-px w-8 bg-purple-500/50 group-hover:w-full transition-all duration-700" />
                      <p className="font-bold text-white tracking-tight italic group-hover:text-purple-400 transition-colors">{faq.q}</p>
                      <p className="text-sm text-slate-500 font-light italic leading-relaxed group-hover:text-slate-300 transition-colors">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}



