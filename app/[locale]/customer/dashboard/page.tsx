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
  Zap
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
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-100',
      description: t('salesPresentations.quickActions.analysis.description')
    },
    { 
      label: t('nav.booking'), 
      href: lp('/booking'), 
      icon: Calendar, 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      description: t('salesPresentations.quickActions.booking.description')
    },
    { 
      label: t('salesPresentations.quickActions.progress.label'), 
      href: lp('/customer/analysis/history'), 
      icon: TrendingUp, 
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      description: t('salesPresentations.quickActions.progress.description')
    },
    { 
      label: t('nav.profile'), 
      href: lp('/profile'), 
      icon: User, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      description: t('salesPresentations.quickActions.profile.description')
    }
  ]

  const recentActivity = [
    { type: 'analysis', date: '2026-01-05', result: 'Aesthetic Score: 85/100', icon: Brain, color: 'text-blue-600' },
    { type: 'appointment', date: '2026-01-08', result: 'Aesthetic Program Cycle Completed', icon: Calendar, color: 'text-indigo-600' },
    { type: 'product', date: '2026-01-10', result: 'Protocol Ingestion Started', icon: Zap, color: 'text-amber-600' }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10 px-6 py-12 w-full">
        {/* Header - Elite User Interface */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-slate-100"
        >
          <div className="space-y-6">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
              <Activity className="mr-3 h-3.5 w-3.5" />
              {t('header.badge')}
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              {t('nav.dashboard')}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">
                {user?.full_name?.split(' ')[0] || t('header.defaultClient')}{t('header.nodeSuffix')}
              </span>
            </h1>
            <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
              {t('header.description')}
            </p>
          </div>
          
          <div className="flex gap-6">
            <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-premium italic" onClick={() => router.push(lp('/customer/analysis/history'))}>
              {t('buttons.myProgress')}
            </Button>
            <Button variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={() => router.push(lp('/customer/analysis'))}>
              {t('buttons.analyzeSkin')}
            </Button>
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
                <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full cursor-pointer">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-10 relative">
                    <div className={cn("absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700", action.color)}>
                      <action.icon className="w-20 h-20" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 shadow-sm group-hover:scale-110", action.bg, action.color, action.border)}>
                        <action.icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-black text-2xl text-slate-950 tracking-tight italic group-hover:text-pink-600 transition-colors uppercase">{action.label}</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-relaxed italic group-hover:text-slate-600 transition-colors">{action.description}</p>
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

            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic uppercase">{t('journey.title')}</CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('journey.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="p-10 lg:p-16 h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={15} 
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={-10} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#ec4899', letterSpacing: '0.1em' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#ec4899" 
                      strokeWidth={6} 
                      dot={{ r: 8, fill: 'white', strokeWidth: 4, stroke: '#ec4899' }} 
                      activeDot={{ r: 12, fill: '#ec4899', strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity Stream */}
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic uppercase">{t('logs.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 space-y-8 bg-slate-50/30">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group shadow-sm hover:shadow-premium"
                  >
                    <div className="flex items-center gap-8">
                      <div className={cn("h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all duration-700", activity.color.replace('600', '500'))}>
                        <activity.icon className="h-8 w-8" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-black text-xl text-slate-950 italic group-hover:text-pink-600 transition-colors uppercase leading-none">{activity.type}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest italic">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-black text-slate-950 italic tracking-tight uppercase leading-none">{activity.result}</p>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-none text-emerald-600 bg-emerald-50 italic px-4 py-1 rounded-full shadow-sm">Verified Node</Badge>
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
            <Card className="relative overflow-hidden border-slate-100 bg-white shadow-premium rounded-[3rem] group min-h-[500px] transition-all duration-700 hover:border-pink-500/20">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-600 flex items-center gap-4 italic leading-none">
                  <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse shadow-glow-pink" />
                  {t('digitalTwin.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 flex flex-col items-center justify-center space-y-12 flex-1 bg-slate-50/30">
                {isPremium ? (
                  <>
                    <div className="w-full aspect-square rounded-[3.5rem] overflow-hidden border border-slate-100 relative bg-white shadow-inner group-hover:shadow-premium transition-all duration-700">
                      <DigitalTwinModule />
                      <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 shadow-premium">
                        <div className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping" />
                        <span className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] italic">{t('digitalTwin.neuralLinkActive')}</span>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tight">{t('digitalTwin.synchronized')}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] italic">{t('digitalTwin.bioNode')}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-10">
                    <div className="h-28 w-28 rounded-[2.5rem] bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-700">
                      <ShieldCheck className="h-14 w-14 text-pink-600" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tight">{t('digitalTwin.premiumRequired')}</p>
                      <p className="text-sm text-slate-500 leading-relaxed italic max-w-[280px] mx-auto">{t('digitalTwin.upgradeDesc')}</p>
                    </div>
                    <Button variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic w-full" asChild>
                      <Link href={lp('/pricing')}>{t('digitalTwin.upgradeBtn')}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Metrics Index */}
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('vitals.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 space-y-10 bg-slate-50/30">
                {[
                  { label: t('vitals.aestheticScore'), val: '85/100', trend: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: t('vitals.cellularHydration'), val: '72%', trend: '+5%', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: t('vitals.textureUniformity'), val: '91%', trend: t('vitals.stable'), color: 'text-slate-600', bg: 'bg-slate-50' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic transition-colors group-hover:text-pink-600">{stat.label}</p>
                      <p className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none", stat.color)}>{stat.val}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-none italic px-4 py-1.5 rounded-full shadow-sm", stat.bg, stat.color)}>{stat.trend}</Badge>
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
