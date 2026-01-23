"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  Calendar,
  Users,
  Package,
  Activity,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';

// Dynamic imports for recharts
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#ff69b4', '#03a9f4', '#8b5cf6', '#f59e0b', '#10b981'];

const MOCK_DATA = {
  summary: {
    totalRevenue: 1245800,
    totalBookings: 342,
    averageOrderValue: 3642,
    growthRate: 24.5,
  },
  chartData: [
    { date: '2025-12-01', revenue: 32000, bookings: 12 },
    { date: '2025-12-05', revenue: 45000, bookings: 15 },
    { date: '2025-12-10', revenue: 38000, bookings: 10 },
    { date: '2025-12-15', revenue: 52000, bookings: 18 },
    { date: '2025-12-20', revenue: 41000, bookings: 14 },
    { date: '2025-12-25', revenue: 68000, bookings: 22 },
    { date: '2025-12-30', revenue: 55000, bookings: 19 },
  ],
  byPaymentMethod: [
    { method: 'Credit Card', amount: 650000, count: 180 },
    { method: 'Bank Transfer', amount: 420000, count: 110 },
    { method: 'Cash', amount: 120000, count: 40 },
    { method: 'Installment', amount: 55800, count: 12 },
  ]
};

export default function CenterDemoPage() {
  const t = useTranslations();
  const locale = useLocale();
  const lp = useLocalizePath();
  const [activeTab, setActiveTab] = useState<'trend' | 'payment'>('trend');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Demo Banner */}
        <div className="bg-pink-500/5 border-b border-pink-500/10 py-3 text-center relative z-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-600 flex items-center justify-center gap-6 italic">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive_Demo_Environment
            <Sparkles className="h-3.5 w-3.5" />
          </p>
        </div>

        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Header - Financial Command Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Activity className="mr-3 h-3.5 w-3.5" />
                  Live Revenue Orchestration
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                {t('demo.center.title' as any) || 'Center'}<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">{t('demo.center.subtitle' as any) || 'Orchestration'}</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {t('demo.center.description' as any) || 'Monitor real-time infrastructure nominals and financial yield synchronization.'}
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center gap-6 shrink-0">
              <Button variant="premium" size="xl" className="h-18 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic group" asChild>
                <Link href={lp("/auth/login")}>
                  {t('common.getStarted' as any) || 'Authorize Access'}
                  <ArrowUpRight className="ml-4 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Revenue Inflow', val: formatCurrency(MOCK_DATA.summary.totalRevenue), icon: DollarSign, trend: MOCK_DATA.summary.growthRate, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'System Cycles', val: MOCK_DATA.summary.totalBookings, icon: Calendar, trend: 12.4, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: 'Avg Node Yield', val: formatCurrency(MOCK_DATA.summary.averageOrderValue), icon: Package, trend: -2.1, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Entity Reach', val: '1,204', icon: Users, trend: 8.5, color: 'text-purple-600', bg: 'bg-purple-50' }
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-10 flex flex-col justify-between h-full">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      <m.icon className={cn("w-20 h-20", m.color)} />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{m.label}</p>
                      <div className={cn("text-3xl font-black tracking-tighter italic uppercase leading-none", m.color)}>{m.val}</div>
                      <Badge className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm italic",
                        m.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {m.trend >= 0 ? '+' : ''}{m.trend}% Δ
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Locked Features Preview */}
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <Tabs defaultValue="trend" className="space-y-12" value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <div className="flex items-center justify-center">
                  <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[1.5rem] h-auto gap-4 shadow-inner">
                    <TabsTrigger value="trend" className="rounded-xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] italic">
                      <TrendingUp className="w-4 h-4 mr-3" />
                      Momentum Sync
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="rounded-xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] italic">
                      <LayoutGrid className="w-4 h-4 mr-3" />
                      Vector Analysis
                    </TabsTrigger>
                  </TabsList>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TabsContent value="trend" className="mt-0 outline-none">
                      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                          <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-6 leading-none">
                            <div className="p-4 bg-pink-50 rounded-2xl shadow-sm">
                              <TrendingUp className="h-8 w-8 text-pink-600" />
                            </div>
                            Revenue Synthesis Momentum
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-16 h-[500px] bg-slate-50/30">
                          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-inner h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={MOCK_DATA.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: '900' }} axisLine={false} tickLine={false} dy={15} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: '900' }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#ff69b4" strokeWidth={6} dot={false} activeDot={{ r: 10, fill: '#ff69b4', stroke: '#fff', strokeWidth: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="payment" className="mt-0 outline-none">
                      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                          <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-6 leading-none">
                            <div className="p-4 bg-blue-50 rounded-2xl shadow-sm">
                              <LayoutGrid className="h-8 w-8 text-blue-600" />
                            </div>
                            Financial Vector Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-16 h-[500px] bg-slate-50/30">
                          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-inner h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={MOCK_DATA.byPaymentMethod}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="method" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} axisLine={false} dy={15} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} axisLine={false} dx={-10} />
                                <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                                  {MOCK_DATA.byPaymentMethod.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>

            <div className="lg:col-span-4 space-y-12">
              <Card className="border-pink-100 bg-pink-50/30 backdrop-blur-xl rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-fit">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                  <ShieldCheck className="w-48 h-48 text-pink-600" />
                </div>
                <CardContent className="p-10 lg:p-12 space-y-10 relative z-10">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-pink-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-10 w-10 text-pink-600" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Enterprise Protocol</h3>
                    <p className="text-lg text-slate-500 font-light leading-relaxed italic">
                      Unlock high-precision financial orchestration and automated node synchronization for your aesthetic network.
                    </p>
                  </div>
                  <div className="space-y-6 pt-4">
                    {[
                      'Advanced Revenue Telemetry',
                      'Inventory Vector Management',
                      'Node Yield Optimization',
                      'Lifetime Customer Archetypes'
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-5 group/feat">
                        <div className="h-1.5 w-1.5 rounded-full bg-pink-500/30 group-hover/feat:bg-pink-600 transition-all duration-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/feat:text-slate-950 transition-colors italic">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="premium" size="xl" className="w-full h-20 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" asChild>
                    <Link href={lp("/auth/login")}>Activate System Node</Link>
                  </Button>
                </CardContent>
              </Card>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-[3.5rem] border border-slate-100 bg-white p-12 shadow-premium relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500 transition-all duration-700" />
                <div className="space-y-8 relative z-10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">System Diagnostics</p>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end text-slate-950">
                      <span className="text-[11px] font-black uppercase tracking-widest italic">Node Reliability</span>
                      <span className="text-4xl font-black italic tracking-tighter text-emerald-600">99.9%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5">
                      <motion.div animate={{ width: "99.9%" }} transition={{ duration: 2 }} className="h-full bg-emerald-500 rounded-full shadow-glow-emerald/30" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
