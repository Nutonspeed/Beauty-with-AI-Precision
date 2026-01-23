'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle2, Sparkles, Info, PlusCircle, Zap } from 'lucide-react'
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
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto">
          {/* Plans Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Package className="mr-3 h-3.5 w-3.5" />
                {pricingT('activeNode')}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                {pricingT('title').split(' ').slice(0, 2).join(' ')}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">{pricingT('title').split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {pricingT('subtitle')}
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <div className="flex items-center gap-8 bg-slate-50 p-3 rounded-[1.5rem] border border-slate-100 shadow-inner shrink-0">
              <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors italic", billingCycle === 'monthly' ? "text-slate-950" : "text-slate-400")}>
                {pricingT('billingToggle.monthly')}
              </span>
              <button 
                onClick={() => setBillingCycle((prev: string) => prev === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-16 h-8 rounded-full bg-slate-200 border border-slate-300 p-1 transition-all hover:border-pink-500/30"
              >
                <motion.div 
                  className="w-6 h-6 rounded-full bg-pink-600 shadow-premium"
                  animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-4">
                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors italic", billingCycle === 'annual' ? "text-slate-950" : "text-slate-400")}>
                  {pricingT('billingToggle.annual')}
                </span>
                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] py-1 px-3 italic font-black rounded-full shadow-sm">
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
              <Card className="bg-white shadow-premium rounded-[3.5rem] border border-slate-100 p-10 md:p-16 relative group overflow-hidden transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                  <CheckCircle2 className="w-64 h-48 text-pink-600" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 relative z-10">
                  <div className="space-y-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-600 italic leading-none">{pricingT('activeNode')}</p>
                    <div className="space-y-3">
                      <h2 className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none capitalize">
                        {pricingT('activeTier', { tier: currentPlanId })}
                      </h2>
                      <p className="text-xl text-slate-500 font-light italic tracking-tight">
                        {pricingT('billingCycle')} <span className="text-slate-950 font-black uppercase tracking-widest ml-2">{billingCycle === 'monthly' ? pricingT('billingToggle.monthly') : pricingT('billingToggle.annual')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest transition-all shadow-premium italic">
                      {pricingT('billingHistory')}
                    </Button>
                    <Button variant="premium" className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic">
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
                    "relative flex flex-col h-full border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group overflow-hidden",
                    tier.popular && "border-pink-500/20 lg:scale-105 z-10"
                  )}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    
                    {isCurrent && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-emerald-500 text-white px-8 py-2 rounded-full border-none shadow-2xl shadow-emerald-500/40 uppercase tracking-[0.3em] text-[9px] font-black italic">ACTIVE NODE</Badge>
                      </div>
                    )}

                    <CardHeader className="p-10 space-y-8">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic group-hover:text-pink-600 transition-colors uppercase leading-none">{plansT(`${tier.id}.name`)}</CardTitle>
                        {tier.popular && (
                          <Badge className="bg-pink-600 text-white uppercase tracking-[0.2em] text-[9px] font-black italic border-none shadow-premium px-4 py-1 rounded-full">
                            PREMIUM
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] italic leading-relaxed min-h-[44px]">
                        {plansT(`${tier.id}.tagline`)}
                      </p>
                      <div className="space-y-2">
                        <p className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                          {billingCycle === 'monthly' ? formatPrice(tier.id as any, language) : formatAnnualPrice(tier.id as any, language)}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                          PER CYCLE, {billingCycle === 'annual' ? 'ANNUAL SEQUENCE' : 'MONTHLY SEQUENCE'}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-10 pt-0 flex-1 flex flex-col justify-between space-y-10">
                      {/* Technical Infrastructure */}
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500/60 italic border-b border-pink-500/10 pb-2">{pricingT('quotaNote.salesOnly').replace('_RESTRICTION', '')}</p>
                          <ul className="space-y-4">
                            <li className="flex items-center gap-4 text-xs font-bold text-slate-600 italic uppercase tracking-tight">
                              <div className="h-2 w-2 rounded-full bg-pink-500/40" />
                              <span>{details.maxSalesUsers === -1 ? pricingT('infiniteNodes') : pricingT('authorizedNodes', { count: details.maxSalesUsers })}</span>
                            </li>
                            <li className="flex items-center gap-4 text-xs font-bold text-slate-600 italic uppercase tracking-tight">
                              <div className="h-2 w-2 rounded-full bg-pink-500/40" />
                              <span>{details.quotaPerSales === -1 ? pricingT('unlimitedAnalysis') : pricingT('analysisPerNode', { count: details.quotaPerSales })}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60 italic border-b border-blue-500/10 pb-2">Customer Portal</p>
                          <ul className="space-y-4">
                            <li className="flex items-center gap-4 text-xs font-bold text-slate-600 italic uppercase tracking-tight">
                              <div className="h-2 w-2 rounded-full bg-blue-500/40" />
                              <span>{pricingT('unlimitedAccounts')}</span>
                            </li>
                            <li className="flex items-center gap-4 text-xs font-bold text-slate-600 italic uppercase tracking-tight">
                              <div className="h-2 w-2 rounded-full bg-blue-500/40" />
                              <span>{pricingT('infiniteHistory')}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <Button
                        variant={tier.popular ? "premium" : "outline"}
                        className={cn(
                          "w-full h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] italic shadow-premium",
                          !tier.popular && "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-950"
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
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] p-12 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <Info className="w-32 h-32 text-blue-600" />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Info className="h-8 w-8" />
                </div>
                <h4 className="text-3xl font-black italic text-slate-950 uppercase tracking-tighter leading-none">{pricingT('quotaNote.title')}</h4>
              </div>
              <p className="text-lg text-slate-500 font-light italic leading-relaxed relative z-10">
                {pricingT('quotaNote.description')}
              </p>
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-full px-6 py-2.5 w-fit relative z-10 shadow-inner">
                <Zap className="h-4 w-4 text-pink-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 italic">{pricingT('quotaNote.salesOnly')}</span>
              </div>
            </Card>

            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] p-12 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <PlusCircle className="w-32 h-32 text-purple-600" />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-16 w-16 rounded-[1.5rem] bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                  <PlusCircle className="h-8 w-8" />
                </div>
                <h4 className="text-3xl font-black italic text-slate-950 uppercase tracking-tighter leading-none">{pricingT('addons.title')}</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 relative z-10">
                {[
                  { key: 'extraSalesUser', label: pricingT('addons.extraSalesUser') },
                  { key: 'extraBranch', label: pricingT('addons.extraBranch') },
                  { key: 'extraAnalyses', label: pricingT('addons.extraAnalyses') },
                  { key: 'extraAR', label: pricingT('addons.extraAR') },
                ].map((addon) => (
                  <div key={addon.key} className="space-y-2 group/addon">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover/addon:text-pink-600 transition-colors">{addon.key.replace('extra', 'system')}</p>
                    <p className="text-sm font-black text-slate-950 uppercase italic tracking-tight">{addon.label}</p>
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
            <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="p-16 lg:p-20 pb-8">
                <CardTitle className="text-5xl font-black text-slate-950 tracking-tighter italic flex items-center gap-8 uppercase leading-none">
                  <div className="p-5 bg-pink-50 rounded-2xl shadow-sm">
                    <Sparkles className="h-12 w-12 text-pink-600" />
                  </div>
                  {pricingT('faq.title')}
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-8 italic">{pricingT('faq.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="p-16 lg:p-20 pt-8">
                <div className="grid md:grid-cols-3 gap-16">
                  {[
                    { q: pricingT('faq.q1'), a: pricingT('faq.a1') },
                    { q: pricingT('faq.q2'), a: pricingT('faq.a2') },
                    { q: pricingT('faq.q3'), a: pricingT('faq.a3') }
                  ].map((faq, i) => (
                    <div key={i} className="space-y-6 group/faq">
                      <div className="h-1 w-12 bg-pink-500/20 group-hover/faq:w-full group-hover/faq:bg-pink-500 transition-all duration-1000 rounded-full" />
                      <p className="text-xl font-black text-slate-950 tracking-tight italic uppercase group-hover/faq:text-pink-600 transition-colors leading-tight">{faq.q}</p>
                      <p className="text-lg text-slate-500 font-light italic leading-relaxed group-hover/faq:text-slate-950 transition-colors">{faq.a}</p>
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



