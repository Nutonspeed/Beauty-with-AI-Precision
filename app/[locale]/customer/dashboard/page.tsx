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
import { useAuth } from '@/lib/auth/context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShimmerSkeleton } from '@/components/ui/modern-loader'
import { useTranslations } from 'next-intl'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import dynamic from 'next/dynamic'

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

import { RegimenTracker } from '@/components/customer/regimen-tracker';
import { VirtualConcierge } from '@/components/customer/virtual-concierge';
import { AestheticLoyalty } from '@/components/customer/aesthetic-loyalty';
import { IoTTelemetrySync } from '@/components/customer/iot-telemetry-sync';
import { ClinicalOutcomeQuantifier } from '@/components/analytics/clinical-outcome-quantifier';
import { BioDigitalTwinEvolution } from '@/components/customer/bio-digital-twin-evolution';

export default function CustomerDashboard() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const isPremium = user?.role === 'customer_premium' || user?.role === 'clinic_owner' || user?.role === 'super_admin';

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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="space-y-4">
            <ShimmerSkeleton className="h-12 w-64" />
            <ShimmerSkeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <ShimmerSkeleton key={i} className="h-40 rounded-[2.5rem]" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8"><ShimmerSkeleton className="h-[400px] rounded-[3rem]" /></div>
            <div className="lg:col-span-4"><ShimmerSkeleton className="h-[400px] rounded-[3rem]" /></div>
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

  const quickActions = [
    { 
      label: t('nav.analysis'), 
      href: lp('/analysis'), 
      icon: Camera, 
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      description: 'AI Precision Skin Diagnostic'
    },
    { 
      label: t('nav.booking'), 
      href: lp('/booking'), 
      icon: Calendar, 
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      description: 'Initialize Clinical Protocol'
    },
    { 
      label: t('nav.overview'), 
      href: lp('/customer/analysis/history'), 
      icon: TrendingUp, 
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      description: 'Temporal Health Metrics'
    },
    { 
      label: t('nav.profile'), 
      href: lp('/profile'), 
      icon: User, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      description: 'User Node Configuration'
    }
  ]

  const recentActivity = [
    { type: 'analysis', date: '2026-01-05', result: 'Skin Score: 85/100', icon: Brain, color: 'text-pink-400' },
    { type: 'appointment', date: '2025-12-28', result: 'Clinical Cycle Completed', icon: Calendar, color: 'text-cyan-400' },
    { type: 'product', date: '2025-12-15', result: 'Protocol Ingestion Started', icon: Zap, color: 'text-amber-400' }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header - Elite User Interface */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5"
        >
          <div className="space-y-3">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black">
              <Activity className="mr-2 h-3 w-3 animate-pulse" />
              Biological Synchronized Dashboard
            </Badge>
            <h1 className="text-5xl font-bold text-white tracking-tight italic">
              {t('nav.dashboard')}{' '}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic text-2xl tracking-[0.3em] font-black uppercase">
                {user?.full_name?.split(' ')[0] || 'User'}_Node
              </span>
            </h1>
            <p className="text-slate-500 font-light tracking-wide text-lg">Orchestrating your biological evolution with AI Precision.</p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest italic" asChild>
              <Link href={lp('/profile')}>Edit_Schema</Link>
            </Button>
            <Button variant="premium" className="h-14 px-8 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest italic border" asChild>
              <Link href={lp('/analysis')}>Initialize_Scan</Link>
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
                <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl hover:bg-white/[0.03] hover:border-white/10 transition-all group overflow-hidden rounded-[2.5rem] cursor-pointer">
                  <CardContent className="p-8 relative">
                    <div className={cn("absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity", action.color)}>
                      <action.icon className="w-16 h-16" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500", action.bg, action.color, action.border, "group-hover:scale-110")}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{action.label}</h3>
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
            <BioDigitalTwinEvolution isPremium={isPremium} />
            <ClinicalOutcomeQuantifier isPremium={isPremium} />
            <IoTTelemetrySync isPremium={isPremium} />
            <AestheticLoyalty isPremium={isPremium} />
            <RegimenTracker isPremium={isPremium} />

            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Skin Health Journey</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Temporal health index progression metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-10 lg:p-16 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={15} 
                    />
                    <YAxis 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={-10} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '24px' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#ec4899" 
                      strokeWidth={6} 
                      dot={{ r: 6, fill: '#020617', strokeWidth: 2, stroke: '#ec4899' }} 
                      activeDot={{ r: 10, fill: '#ec4899', strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity Stream */}
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              <CardHeader className="p-10 pb-6 border-b border-white/5">
                <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Temporal Activity Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 space-y-8">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn("h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all", activity.color)}>
                        <activity.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-white italic group-hover:text-pink-400 transition-colors capitalize">{activity.type}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white italic tracking-tight">{activity.result}</p>
                      <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-400 bg-emerald-500/5">Verified</Badge>
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
            <Card className="relative overflow-hidden border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[3rem] shadow-2xl group min-h-[450px]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-pink-400 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  AI Digital Twin Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0 flex flex-col items-center justify-center space-y-10 flex-1">
                {isPremium ? (
                  <>
                    <div className="w-full aspect-square rounded-[3rem] overflow-hidden border border-white/5 relative">
                      <DigitalTwinModule />
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                        <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">Neural_Link_Active</span>
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <h4 className="text-xl font-bold text-white italic">Interactive Visualization</h4>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">Your unique biological signature mapped across 468 precision nodes.</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-10 py-10">
                    <div className="h-24 w-24 rounded-3xl bg-pink-500/5 border border-pink-500/10 flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck className="h-12 w-12 text-pink-500/40" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-white italic">Unlock Digital Twin</h4>
                      <p className="text-sm text-slate-500 font-light leading-relaxed">Upgrade to Professional to access your 360° interactive 3D face model and AI outcome simulations.</p>
                    </div>
                    <Button variant="premium" className="w-full h-14 rounded-2xl border shadow-xl shadow-pink-500/20 uppercase text-[10px] font-black tracking-widest italic" asChild>
                      <Link href={lp('/pricing')}>Upgrade Now</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Metrics Index */}
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <CardHeader className="p-10 pb-6 border-b border-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Biological Vitals</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {[
                  { label: 'Skin Health Score', val: '85/100', trend: '+12%', color: 'text-emerald-400' },
                  { label: 'Cellular Hydration', val: '72%', trend: '+5%', color: 'text-cyan-400' },
                  { label: 'Texture Uniformity', val: '91%', trend: 'Stable', color: 'text-slate-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic transition-colors group-hover:text-slate-400">{stat.label}</p>
                      <p className={cn("text-2xl font-black italic tracking-tighter", stat.color)}>{stat.val}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/5 text-slate-500 italic">{stat.trend}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
