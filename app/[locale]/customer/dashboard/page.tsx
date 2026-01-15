'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Calendar,
  Camera,
  TrendingUp,
  User,
  Brain,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShimmerSkeleton } from '@/components/ui/modern-loader'
import { useTranslations } from 'next-intl'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import dynamic from 'next/dynamic'
import { Footer } from '@/components/footer'

// @ts-ignore
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
// @ts-ignore
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const DigitalTwinModule = dynamic(() => import('@/components/DigitalTwinModule').then(mod => mod.DigitalTwinModule), { ssr: false });

import { RegimenTracker } from '@/components/client/regimen-tracker';
import { VirtualConcierge } from '@/components/client/virtual-concierge';
import { AestheticLoyalty } from '@/components/client/aesthetic-loyalty';
import { IoTTelemetrySync } from '@/components/client/iot-telemetry-sync';
import { AestheticOutcomeQuantifier } from '@/components/analytics/aesthetic-outcome-quantifier';
import { BioDigitalTwinEvolution } from '@/components/client/bio-digital-twin-evolution';
import { RecommendedPrograms } from '@/components/client/recommended-programs';
import { AestheticMilestones } from '@/components/client/aesthetic-milestones';
import { SmartNotificationsFeed } from '@/components/client/smart-notifications-feed';

export default function CustomerDashboard() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const isPremium = user?.role === 'customer_premium' || user?.role === 'center_owner' || user?.role === 'super_admin';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (authLoading && !user) return
    
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }, [user, authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="space-y-4">
            <ShimmerSkeleton className="h-12 w-64 bg-slate-200" />
            <ShimmerSkeleton className="h-4 w-96 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <ShimmerSkeleton key={i} className="h-40 rounded-[2.5rem] bg-slate-200" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8"><ShimmerSkeleton className="h-[400px] rounded-[3rem] bg-slate-200" /></div>
            <div className="lg:col-span-4"><ShimmerSkeleton className="h-[400px] rounded-[3rem] bg-slate-200" /></div>
          </div>
        </div>
      </div>
    )
  }

  const chartData = [
    { date: '2025-10', score: 65 },
    { date: '2025-11', score: 72 },
    { date: '2025-12', score: 78 },
    { date: '2026-01', score: 85 },
  ];

  // Customer Quick Actions - Analysis available if customer has credits from sales
  const quickActions = [
    { 
      label: t('nav.analysis'), 
      href: lp('/customer/analysis'), 
      icon: Camera, 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      description: t('salesPresentations.quickActions.analysis.description')
    },
    { 
      label: t('nav.booking'), 
      href: lp('/booking'), 
      icon: Calendar, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      description: t('salesPresentations.quickActions.booking.description')
    },
    { 
      label: t('salesPresentations.quickActions.progress.label'), 
      href: lp('/customer/analysis/history'), 
      icon: TrendingUp, 
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      description: t('salesPresentations.quickActions.progress.description')
    },
    { 
      label: t('nav.profile'), 
      href: lp('/profile'), 
      icon: User, 
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      description: t('salesPresentations.quickActions.profile.description')
    }
  ]

  const recentActivity = [
    { type: 'analysis', date: '2026-01-05', result: 'Aesthetic Score: 85/100', icon: Brain, color: 'text-blue-600' },
    { type: 'appointment', date: '2026-01-08', result: 'Aesthetic Program Cycle Completed', icon: Calendar, color: 'text-indigo-600' },
    { type: 'product', date: '2026-01-10', result: 'Protocol Ingestion Started', icon: Zap, color: 'text-amber-600' }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-500/30">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10 px-6 py-12 w-full">
        {/* Header - Elite User Interface */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-200"
        >
          <div className="space-y-3">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-blue-500/5">
              <Activity className="mr-2 h-3 w-3 animate-pulse" />
              {t('header.badge')}
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight italic">
              {t('nav.dashboard')}{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent not-italic text-2xl tracking-[0.3em] font-black uppercase">
                {user?.full_name?.split(' ')[0] || t('header.defaultClient')}{t('header.nodeSuffix')}
              </span>
            </h1>
            <p className="text-slate-500 font-light tracking-wide text-lg italic">{t('header.description')}</p>
          </div>
          
          <div className="flex gap-4">
            <button className="h-14 px-8 rounded-2xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest italic transition-all" onClick={() => router.push(lp('/customer/analysis/history'))}>
              {t('buttons.myProgress')}
            </button>
            <button className="h-14 px-8 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 text-[10px] font-black uppercase tracking-widest italic border-none hover:scale-105 active:scale-95 transition-all" onClick={() => router.push(lp('/customer/analysis'))}>
              {t('buttons.analyzeSkin')}
            </button>
          </div>
        </motion.div>

        {/* Quick Actions Grid - Precision Access */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="h-full border-white bg-white/60 backdrop-blur-xl hover:bg-white/80 hover:border-blue-500/20 transition-all group overflow-hidden rounded-[2.5rem] cursor-pointer shadow-premium">
                  <CardContent className="p-8 relative">
                    <div className={cn("absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity", action.color)}>
                      <action.icon className="w-16 h-16" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500", action.bg, action.color, action.border, "group-hover:scale-110 shadow-sm")}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 tracking-tight italic group-hover:text-blue-600 transition-colors">{action.label}</h3>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-relaxed mt-1">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content - Temporal Evolution Chart */}
          <div className="lg:col-span-8 space-y-10">
            <RecommendedPrograms isPremium={isPremium} />
            <SmartNotificationsFeed />
            <AestheticMilestones isPremium={isPremium} />
            <BioDigitalTwinEvolution isPremium={isPremium} />
            <AestheticOutcomeQuantifier isPremium={isPremium} />
            <IoTTelemetrySync isPremium={isPremium} />
            <AestheticLoyalty isPremium={isPremium} />
            <RegimenTracker isPremium={isPremium} />

            <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight italic">{t('journey.title')}</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('journey.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="p-10 lg:p-16 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={15} 
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={-10} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.05)', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#2563eb' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={6} 
                      dot={{ r: 6, fill: 'white', strokeWidth: 3, stroke: '#2563eb' }} 
                      activeDot={{ r: 10, fill: '#2563eb', strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity Stream */}
            <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
              <CardHeader className="p-10 pb-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight italic">{t('logs.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 space-y-8">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn("h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-all", activity.color)}>
                        <activity.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 italic group-hover:text-blue-600 transition-colors capitalize">{activity.type}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 italic tracking-tight">{activity.result}</p>
                      <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Verified</Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Premium Insights */}
          <div className="lg:col-span-4 space-y-10">
            <VirtualConcierge isPremium={isPremium} />

            {/* Digital Twin Visualization - PREMIUM VALUE */}
            <Card className="relative overflow-hidden border-blue-500/10 bg-blue-500/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-premium group min-h-[450px]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  {t('digitalTwin.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0 flex flex-col items-center justify-center space-y-10 flex-1">
                {isPremium ? (
                  <>
                    <div className="w-full aspect-square rounded-[3rem] overflow-hidden border border-slate-100 relative bg-slate-50 shadow-inner">
                      <DigitalTwinModule />
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em]">{t('digitalTwin.neuralLinkActive')}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-900 italic">{t('digitalTwin.synchronized')}</p>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">{t('digitalTwin.bioNode')}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900 italic uppercase tracking-tighter">{t('digitalTwin.premiumRequired')}</p>
                      <p className="text-xs text-slate-500 leading-relaxed italic">{t('digitalTwin.upgradeDesc')}</p>
                    </div>
                    <Button variant="premium" size="sm" className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest italic" asChild>
                      <Link href={lp('/pricing')}>{t('digitalTwin.upgradeBtn')}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Metrics Index */}
            <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative">
              <CardHeader className="p-10 pb-6 border-b border-slate-100">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('vitals.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {[
                  { label: t('vitals.aestheticScore'), val: '85/100', trend: '+12%', color: 'text-emerald-600' },
                  { label: t('vitals.cellularHydration'), val: '72%', trend: '+5%', color: 'text-blue-600' },
                  { label: t('vitals.textureUniformity'), val: '91%', trend: t('vitals.stable'), color: 'text-slate-600' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic transition-colors group-hover:text-slate-600">{stat.label}</p>
                      <p className={cn("text-2xl font-black italic tracking-tighter", stat.color)}>{stat.val}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400 italic">{stat.trend}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
