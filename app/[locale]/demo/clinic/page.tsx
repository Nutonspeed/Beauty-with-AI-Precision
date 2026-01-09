"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  Download,
  Calendar,
  CreditCard,
  Users,
  Package,
  Activity,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Lock
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';

// @ts-ignore
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
// @ts-ignore
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
// @ts-ignore
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
// @ts-ignore
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
// @ts-ignore
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
// @ts-ignore
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
// @ts-ignore
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
// @ts-ignore
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#ec4899', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

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

export default function ClinicDemoPage() {
  const t = useTranslations();
  const lp = useLocalizePath();
  const [activeTab, setActiveTab] = useState<'trend' | 'payment'>('trend');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Demo Banner */}
        <div className="bg-pink-600/10 border-b border-pink-500/20 py-2 text-center relative z-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400 flex items-center justify-center gap-4">
            <Sparkles className="h-3 w-3" />
            Interactive_Demo_Environment
            <Sparkles className="h-3 w-3" />
          </p>
        </div>

        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Header - Financial Command Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Activity className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Live Revenue Orchestration
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Clinic<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic text-2xl tracking-[0.3em] font-black uppercase">Command_Terminal</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Experience the precision of clinical yield management. Monitor real-time financial flows and operational cycles.
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center gap-6 shrink-0">
              <Button variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border group" asChild>
                <Link href={lp("/auth/login")}>
                  {t('common.getStarted')}
                  <ArrowUpRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: 'Total Inflow', val: formatCurrency(MOCK_DATA.summary.totalRevenue), icon: DollarSign, trend: MOCK_DATA.summary.growthRate },
              { label: 'Ops Cycles', val: MOCK_DATA.summary.totalBookings, icon: Calendar, trend: 12.4 },
              { label: 'Avg Yield', val: formatCurrency(MOCK_DATA.summary.averageOrderValue), icon: Package, trend: -2.1 },
              { label: 'Active Entities', val: '1,204', icon: Users, trend: 8.5 }
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] transition-all duration-500 hover:bg-white/[0.03] group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardContent className="p-8 lg:p-10">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      <m.icon className="w-20 h-20" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-600 italic">{m.label}</p>
                      <div className="text-3xl font-black text-white tracking-tighter italic">{m.val}</div>
                      <Badge className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner",
                        m.trend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
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
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <Tabs defaultValue="trend" className="space-y-12" value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2">
                  <TabsTrigger value="trend" className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic">
                    Momentum_Graph
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic">
                    Vector_Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trend" className="mt-0 outline-none">
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                      <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Synthesis Dynamics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-16 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_DATA.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={15} />
                          <YAxis tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
                          <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '24px' }} />
                          <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={6} dot={false} activeDot={{ r: 10 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="mt-0 outline-none">
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                      <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Vector Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-16 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_DATA.byPaymentMethod}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="method" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dy={15} />
                          <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dx={-10} />
                          <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                            {MOCK_DATA.byPaymentMethod.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-4 space-y-10">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative group p-10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <div className="space-y-8">
                  <div className="h-16 w-16 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                    <ShieldCheck className="h-8 w-8 text-pink-500" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white italic">Enterprise Protocols</h3>
                    <p className="text-sm text-slate-500 font-light leading-relaxed">
                      Unlock advanced predictive analytics, multi-node synchronization, and automated yield optimization.
                    </p>
                  </div>
                  <div className="space-y-4 pt-4">
                    {[
                      'Predictive_Revenue_AI',
                      'Automated_Inventory_Sync',
                      'Multi_Branch_Orchestration',
                      'Patient_Lifetime_Value_ML'
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-4 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <Lock className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="premium" className="w-full h-16 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border" asChild>
                    <Link href={lp("/auth/login")}>ACTIVATE_FULL_ACCESS</Link>
                  </Button>
                </div>
              </Card>

              <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-10 backdrop-blur-md space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic text-center">System_Diagnostics_Active</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Node_Connectivity</span>
                    <span className="text-emerald-500">99.9%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: "99%" }} className="h-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
