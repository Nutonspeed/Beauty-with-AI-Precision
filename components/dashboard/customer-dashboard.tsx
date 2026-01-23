"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { 
  Camera, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  History,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import type { UserRole } from '@/lib/auth/role-config';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface CustomerDashboardProps {
  role: UserRole;
}

export default function CustomerDashboard({ role }: CustomerDashboardProps) {
  const t = useTranslations('customerDashboard');
  const locale = useLocale();
  const isPremium = role === 'premium_customer';
  const [showOnboarding, setShowOnboarding] = useState(false);
  const lp = useLocalizePath();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background - Light Theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto">
          {/* Onboarding Infrastructure */}
          <AnimatePresence>
            {showOnboarding && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Alert className="border-pink-500/20 bg-pink-50/30 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-premium relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <Lightbulb className="w-40 h-40 text-pink-500" />
                  </div>
                  <div className="flex items-center gap-10 relative z-10">
                    <div className="h-20 w-20 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-700">
                      <Lightbulb className="h-10 w-10 text-pink-600 animate-pulse" />
                    </div>
                    <AlertDescription className="flex flex-col md:flex-row items-center justify-between w-full gap-10">
                      <div className="space-y-3 text-center md:text-left">
                        <p className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">
                          {t('onboarding.welcome')}
                        </p>
                        <p className="text-xl text-slate-500 font-light leading-relaxed italic">
                          {t('onboarding.newToSystem')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <Button variant="outline" className="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest h-14 px-10 shadow-sm" onClick={dismissOnboarding}>
                          {t('onboarding.bypass')}
                        </Button>
                        <Button variant="premium" className="rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest h-14 px-10 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" asChild>
                          <Link href={lp('/onboarding/customer')}>
                            {t('onboarding.viewGuide')}
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-5">
              <div className="h-1.5 w-16 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-600 italic animate-pulse">System Status: Operational</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              {t('welcome')}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent italic not-italic block mt-6">
                CenterIQ <span className="not-italic">AI</span>
              </span>
            </h1>
            <p className="text-2xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Quick Actions Grid - Infrastructure Modules */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                icon: Camera, 
                title: t('actions.skinSynthesis.title'), 
                desc: t('actions.skinSynthesis.desc'),
                href: '/analysis',
                cta: t('actions.skinSynthesis.cta'),
                color: 'from-pink-500/10 to-pink-600/10',
                iconColor: 'text-pink-600',
                badge: !isPremium ? t('actions.skinSynthesis.badge') : null
              },
              { 
                icon: Sparkles, 
                title: t('actions.arSimulation.title'), 
                desc: t('actions.arSimulation.desc'),
                href: '/ar-simulator',
                cta: t('actions.arSimulation.cta'),
                color: 'from-blue-500/10 to-blue-600/10',
                iconColor: 'text-blue-600',
                badge: !isPremium ? t('actions.arSimulation.badge') : null,
                variant: 'outline'
              },
              { 
                icon: Star, 
                title: t('actions.aestheticProtocol.title'), 
                desc: t('actions.aestheticProtocol.desc'),
                href: '/recommendations',
                cta: t('actions.aestheticProtocol.cta'),
                color: 'from-purple-500/10 to-purple-600/10',
                iconColor: 'text-purple-600',
                badge: 'AI',
                premium: true
              },
              { 
                icon: Calendar, 
                title: t('actions.accessNode.title'), 
                desc: t('actions.accessNode.desc'),
                href: '/booking',
                cta: t('actions.accessNode.cta'),
                color: 'from-indigo-500/10 to-indigo-600/10',
                iconColor: 'text-indigo-600',
                variant: 'outline'
              },
              { 
                icon: BarChart3, 
                title: t('actions.metricsProgress.title'), 
                desc: t('actions.metricsProgress.desc'),
                href: '/analysis/progress',
                cta: t('actions.metricsProgress.cta'),
                color: 'from-cyan-500/10 to-blue-500/10',
                iconColor: 'text-cyan-600',
                variant: 'outline'
              },
              { 
                icon: History, 
                title: t('actions.diagnosticHistory.title'), 
                desc: t('actions.diagnosticHistory.desc'),
                href: '/analysis/history',
                cta: t('actions.diagnosticHistory.cta'),
                color: 'from-rose-500/10 to-red-600/10',
                iconColor: 'text-rose-600',
                variant: 'outline'
              }
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden ${action.premium ? 'border-pink-100' : ''}`}>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${action.color} border border-slate-100 shadow-sm transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                        <action.icon className={`h-10 w-10 ${action.iconColor}`} />
                      </div>
                      {action.badge && (
                        <Badge className={`${action.premium ? 'bg-pink-500 text-white shadow-glow-pink/30' : 'bg-slate-50 text-slate-400 border-slate-100'} uppercase tracking-[0.2em] text-[10px] font-black italic px-4 py-1 rounded-full border-none`}>
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-4">
                      <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic group-hover:text-pink-600 transition-colors uppercase">{action.title}</CardTitle>
                      <CardDescription className="text-lg text-slate-500 font-light leading-relaxed italic">{action.desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <Button 
                      asChild 
                      variant={(action.variant as any) || "premium"} 
                      className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 italic ${action.premium || action.variant !== 'outline' ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white border-none shadow-2xl shadow-pink-500/20' : 'bg-white text-slate-900 border border-slate-200 hover:border-pink-500/30 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <Link href={lp(action.href)} className="flex items-center">
                        {action.cta}
                        <ArrowRight className="ml-4 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Getting Started Guide Infrastructure */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative h-full group hover:border-blue-500/20 transition-all duration-700">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50">
                  <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{t('guide.title')}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 mt-4 italic">{t('guide.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="p-12 lg:p-16 space-y-10">
                  {[
                    { step: "1", title: t('guide.step1.title'), desc: t('guide.step1.desc') },
                    { step: "2", title: t('guide.step2.title'), desc: t('guide.step2.desc') },
                    { step: "3", title: t('guide.step3.title'), desc: t('guide.step3.desc') },
                    { step: "4", title: t('guide.step4.title'), desc: t('guide.step4.desc') }
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-8 group/item">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-sm font-black text-slate-400 group-hover/item:text-pink-600 group-hover/item:bg-white group-hover/item:border-pink-500/30 transition-all duration-500 shadow-sm italic">
                        {s.step}
                      </div>
                      <div className="space-y-2 flex-1">
                        <p className="text-xl font-black text-slate-950 tracking-tight italic group-hover/item:text-pink-600 transition-colors uppercase">{s.title}</p>
                        <p className="text-lg text-slate-500 font-light italic leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full h-20 rounded-[2.5rem] border-slate-200 bg-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 hover:border-pink-500/30 transition-all shadow-premium italic mt-8">
                    <Link href={lp('/onboarding/customer')} className="flex items-center">
                      {t('guide.fullManual')}
                      <ArrowRight className="ml-4 h-6 w-6" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity Module */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative h-full group hover:border-purple-500/20 transition-all duration-700">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
                <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50">
                  <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase">
                    <div className="p-4 bg-slate-50 rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                      <History className="h-8 w-8 text-pink-500 group-hover:text-white" />
                    </div>
                    {t('history.title')}
                  </CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 mt-6 italic">{t('history.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="p-12 lg:p-16">
                  <div className="text-center py-24 space-y-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 border-dashed group-hover:bg-white group-hover:border-pink-500/20 transition-all duration-700 shadow-inner">
                    <div className="mx-auto h-28 w-28 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center text-slate-300 animate-pulse shadow-sm group-hover:text-pink-500 group-hover:border-pink-100 transition-all">
                      <FileText className="h-14 w-14" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-3xl font-black text-slate-950 italic uppercase tracking-tight">{t('history.empty')}</p>
                      <p className="text-xl text-slate-400 font-light italic leading-relaxed">{t('history.emptyDesc')}</p>
                    </div>
                    <Button asChild variant="premium" className="h-18 px-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-pink-500/20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic hover:scale-105 active:scale-95 transition-all">
                      <Link href={lp('/analysis')}>
                        {t('history.beginBtn')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Premium Deployment Infrastructure CTA */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="border-pink-100 bg-pink-50/10 shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/30">
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                  <TrendingUp className="w-80 h-80 text-pink-500" />
                </div>
                <CardContent className="p-16 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-20 relative z-10">
                  <div className="space-y-12 flex-1">
                    <div className="space-y-6">
                      <Badge className="bg-pink-500 text-white px-8 py-3 rounded-full border-none shadow-2xl shadow-pink-500/40 uppercase tracking-[0.3em] text-[10px] font-black italic animate-glow-pulse">ELITE UPGRADE</Badge>
                      <h2 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.8] italic uppercase">
                        {t('premium.title')}
                      </h2>
                      <p className="text-2xl text-slate-500 font-light italic leading-relaxed max-w-2xl">
                        {t('premium.description')}
                      </p>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-10">
                      {(t.raw('premium.features') as string[]).map((item, i) => (
                        <li key={i} className="flex items-center gap-6 group/item cursor-default">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all duration-500">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 group-hover/item:text-white" />
                          </div>
                          <span className="text-lg font-black text-slate-400 group-hover/item:text-slate-950 transition-colors italic uppercase tracking-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0 w-full lg:w-auto">
                    <Button size="xl" className="w-full lg:w-auto h-24 px-20 rounded-[2.5rem] bg-slate-950 hover:bg-pink-600 text-white shadow-2xl shadow-pink-500/20 text-xl font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 italic" asChild>
                      <Link href={lp('/pricing')} className="flex items-center">
                        {t('premium.cta')}
                        <ArrowRight className="ml-6 h-8 w-8" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
