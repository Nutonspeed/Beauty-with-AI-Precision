"use client"

import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Target,
  ArrowRight,
  Flame,
  BarChart3,
  Zap,
  Sparkles,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SalesDashboard() {
  const t = useTranslations('dashboard.sales');
  const lp = useLocalizePath();

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
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto">
          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-5">
              <div className="h-1.5 w-16 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-600 italic animate-pulse">Sales Command Node: Online</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              {t('title')}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent italic not-italic block mt-6">
                Yield <span className="not-italic">Intelligence</span>
              </span>
            </h1>
            <p className="text-2xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('stats.hotLeadsToday'), val: "12", sub: t('stats.fromYesterday', { count: 3 }), icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: t('stats.revenueMonth'), val: "฿245,000", sub: t('stats.fromLastMonth', { percent: '18%' }), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: t('stats.conversionRate'), val: "34%", sub: t('stats.fromLastMonth', { percent: '2%' }), icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: t('stats.pendingMessages'), val: "8", sub: t('stats.respondWithin'), icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-500 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{stat.label}</CardTitle>
                    <div className={cn("p-3 rounded-xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{stat.val}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-3 text-slate-400 italic">
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Hot Leads Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group hover:border-orange-500/20 transition-all duration-700 h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-12 pb-8 border-b border-slate-50">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-orange-50 rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-700">
                      <Flame className="h-8 w-8 text-orange-600 group-hover:text-white" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{t('actions.hotLeads')}</CardTitle>
                      <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-600 italic">High-conversion probability leads</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12 space-y-8">
                  <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 shadow-inner group-hover:bg-white transition-all duration-700 text-center space-y-6">
                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                      <Activity className="h-10 w-10 text-orange-500" />
                    </div>
                    <p className="text-xl text-slate-500 font-light italic leading-relaxed">
                      {t('actions.hotLeadsCount', { count: 12 })}
                    </p>
                    <Button asChild className="w-full h-18 rounded-2xl bg-slate-950 hover:bg-orange-600 text-white shadow-2xl shadow-orange-500/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 italic border-none">
                      <Link href={lp('/sales/dashboard')}>
                        {t('actions.viewAllHotLeads')}
                        <ArrowRight className="ml-4 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Messages Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group hover:border-purple-500/20 transition-all duration-700 h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-12 pb-8 border-b border-slate-50">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-purple-50 rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-700">
                      <MessageSquare className="h-8 w-8 text-purple-600 group-hover:text-white" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{t('actions.messages')}</CardTitle>
                      <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-purple-600 italic">Active communications stream</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12 space-y-8">
                  <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 shadow-inner group-hover:bg-white transition-all duration-700 text-center space-y-6">
                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                      <Sparkles className="h-10 w-10 text-purple-500" />
                    </div>
                    <p className="text-xl text-slate-500 font-light italic leading-relaxed">
                      {t('actions.messagesCount', { count: 8 })}
                    </p>
                    <Button asChild variant="outline" className="w-full h-18 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105">
                      <Link href={lp('/chat')}>
                        {t('actions.openChat')}
                        <ArrowRight className="ml-4 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Secondary Actions Grid */}
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', title: t('actions.customerList'), desc: t('actions.customerListDesc'), href: '/customer', cta: t('actions.viewList') },
              { icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50', title: t('actions.salesReport'), desc: t('actions.salesReportDesc'), href: '/reports', cta: t('actions.viewReport') },
              { icon: Target, color: 'text-purple-600', bg: 'bg-purple-50', title: t('actions.monthlyGoal'), desc: t('actions.monthlyGoalDesc'), progress: 68 }
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
              >
                <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 space-y-8">
                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-50 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3", action.bg)}>
                      <action.icon className={cn("h-8 w-8", action.color)} />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic group-hover:text-pink-600 transition-colors uppercase leading-none">{action.title}</CardTitle>
                      <CardDescription className="text-lg text-slate-500 font-light leading-relaxed italic">{action.desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    {action.href ? (
                      <Button asChild variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] hover:border-pink-500/30 hover:bg-slate-50 shadow-sm transition-all italic">
                        <Link href={lp(action.href)}>
                          {action.cta}
                          <ArrowRight className="ml-3 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                          <span className="text-slate-400">{t('actions.progress')}:</span>
                          <span className="text-pink-600">{action.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-50 rounded-full h-2.5 border border-slate-100 shadow-inner overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${action.progress}%` }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 h-full rounded-full shadow-glow-pink" 
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Yield Strategy Advisor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-pink-500/20 bg-pink-50/10 shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/30">
              <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                <Zap className="w-80 h-80 text-pink-500" />
              </div>
              <CardContent className="p-12 lg:p-20 relative z-10 space-y-12">
                <div className="space-y-6">
                  <Badge className="bg-pink-500 text-white px-8 py-3 rounded-full border-none shadow-2xl shadow-pink-500/40 uppercase tracking-[0.3em] text-[10px] font-black italic animate-glow-pulse">Yield_Optimization_Protocol</Badge>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter leading-tight italic uppercase">
                    {t('tips.title')}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  {[
                    t('tips.item1'),
                    t('tips.item2'),
                    t('tips.item3'),
                    t('tips.item4')
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-6 group/item">
                      <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:bg-pink-500 group-hover/item:text-white transition-all duration-500">
                        <Sparkles className="h-5 w-5 text-pink-600 group-hover/item:text-white" />
                      </div>
                      <p className="text-lg text-slate-500 font-light italic leading-relaxed group-hover/item:text-slate-950 transition-colors">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
