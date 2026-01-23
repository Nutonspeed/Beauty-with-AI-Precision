"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
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
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  LayoutGrid,
  Binary
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from '@/hooks/use-toast';

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
// @ts-ignore - Recharts Legend dynamic import type mismatch
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

import { MarketIntelligenceHeatmap } from '@/components/analytics/market-intelligence-heatmap';
import { PredictiveInventory } from '@/components/analytics/predictive-inventory';
import { StaffEfficiency } from '@/components/analytics/staff-efficiency';
import { RevenueForecaster } from '@/components/analytics/revenue-forecaster';
import { AutonomousMarketing } from '@/components/analytics/autonomous-marketing';
import { BranchBenchmarking } from '@/components/analytics/branch-benchmarking';
import { IndustryBenchmarking } from '@/components/analytics/industry-benchmarking';
import { MedicalComplianceAudit } from '@/components/analytics/medical-compliance-audit';
import { ROISimulator } from '@/components/analytics/roi-simulator';
import { AestheticOutcomeQuantifier } from '@/components/analytics/aesthetic-outcome-quantifier';
import { SynapticNotifications } from '@/components/admin/ai-synaptic-notifications';
import { StrategicGrowthAdvisor } from '@/components/admin/strategic-growth-advisor';
import { AIRevenueRecovery } from '@/components/analytics/revenue-recovery';
import { AestheticAssetLifecycle } from '@/components/analytics/aesthetic-asset-lifecycle';
import { MissionControl } from '@/components/analytics/mission-control';
import { IntelligenceCommandPalette } from '@/components/analytics/intelligence-command-palette';
import { AIBoardroomReport } from '@/components/analytics/boardroom-report';

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    averageOrderValue: number;
    growthRate: number;
    aiIntelligence?: {
      totalScans: number;
      conversionRate: number;
      drivenRevenue: number;
      roiMultiplier: number;
    };
  };
  chartData: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  byPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

interface AppointmentAnalytics {
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    paidAppointments: number;
    completionRate: number;
    paymentRate: number;
    paymentAfterCompletionRate: number;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  dailyData: Array<{
    date: string;
    total: number;
    completed: number;
    paid: number;
  }>;
}

const COLORS = ['#ff69b4', '#03a9f4', '#8884d8', '#82ca9d', '#ffc658'];

export default function CenterRevenuePage() {
  const t = useTranslations('revenue');
  const commonT = useTranslations('common');
  const aboutT = useTranslations('about');
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<RevenueData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'mission' | 'trend' | 'payment' | 'appointments' | 'market' | 'inventory' | 'staff' | 'forecast' | 'marketing' | 'benchmarking' | 'industry' | 'audit' | 'roi' | 'outcomes' | 'advisor' | 'recovery' | 'assets' | 'boardroom'>('mission');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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

  const loadAppointmentData = useCallback(async () => {
    try {
      const response = await fetch(`/api/center/appointments/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to load appointment data: ${response.status}`);
      }
      const result = await response.json();
      setAppointmentData(result);
    } catch (error) {
      console.error('Error loading appointment data:', error);
      toast({
        title: commonT('error'),
        description: t('errors.loadAppointments'),
        variant: 'destructive'
      });
    }
  }, [period, commonT, t, toast]);

  const loadRevenueData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/center/revenue?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to load revenue data: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast({
        title: commonT('error'),
        description: t('errors.loadRevenue'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [period, commonT, t, toast]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    if (!['center_owner', 'center_admin', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    loadRevenueData();
    if (activeTab === 'appointments') {
      loadAppointmentData();
    }
  }, [user, authLoading, router, lp, period, activeTab, loadRevenueData, loadAppointmentData]);

  const handleExport = (format: 'pdf' | 'excel') => {
    if (format === 'excel') {
      exportCsv();
    } else {
      window.print();
    }
  };

  const exportCsv = () => {
    if (!data) return;
    const header = [
      t('csv.reportTitle'),
      `${t('csv.periodLabel')} ${t(`periods.${period}`)}`,
      '',
      t('csv.summary'),
      `${t('metrics.totalRevenue')},${data.summary.totalRevenue}`,
      `${t('metrics.confirmedBookings')},${data.summary.totalBookings}`,
      `${t('metrics.avgTransactionValue')},${data.summary.averageOrderValue}`,
      `${aboutT('stats.accuracy')},${data.summary.growthRate}%`,
      '',
      t('csv.dailyRevenue'),
      `${t('csv.columns.date')},${t('csv.columns.revenue')},${t('csv.columns.bookings')}`
    ];
    const dailyRows = data.chartData.map(row => `${row.date},${row.revenue},${row.bookings}`);
    const paymentHeader = ['', t('csv.paymentMethods'), `${t('csv.columns.method')},${t('csv.columns.amount')},${t('csv.columns.count')},${t('csv.columns.average')}`];
    const paymentRows = data.byPaymentMethod.map(method => `${method.method},${method.amount},${method.count},${method.amount / method.count}`);
    const csvContent = [...header, ...dailyRows, ...paymentHeader, ...paymentRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `revenue-report-${period}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: t('export.success'), description: t('export.csvDownloaded') });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Initializing Financial Hub...</p>
        </div>
      </div>
    );
  }

  if (!user || !data) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10 print:bg-white print:text-black">
      <Header />
      
      <IntelligenceCommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={(id) => setActiveTab(id as any)} 
      />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Header */}
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <TrendingUp className="mr-3 h-3.5 w-3.5" />
                  Financial Intelligence Terminal
                </Badge>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                  {t('reportTitle')}<br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">{t('activeNodes')}</span>
                </h1>
                <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                  {t('syncDescription')}
                </p>
              </motion.div>
            </div>
            <div className="lg:col-span-4">
              <div className="rounded-[2.5rem] shadow-premium bg-white border border-slate-100 overflow-hidden">
                <SynapticNotifications />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100 print:hidden">
            <div className="flex flex-wrap items-center gap-8 shrink-0">
              <div className="flex bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-700 italic",
                      period === p ? "bg-pink-600 text-white shadow-premium scale-105" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-6">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-premium italic" onClick={() => handleExport('pdf')}>
                  <Download className="mr-4 h-5 w-5" />
                  {t('pdfExport')}
                </Button>
                <Button variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={() => handleExport('excel')}>
                  <Download className="mr-4 h-5 w-5" />
                  {t('ledgerSync')}
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: t('metrics.totalRevenue'), val: formatCurrency(data.summary.totalRevenue), icon: DollarSign, color: "text-pink-600", bg: "bg-pink-50", trend: data.summary.growthRate },
              { label: t('metrics.confirmedBookings'), val: data.summary.totalBookings, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", sub: t('metrics.operationalCycles') },
              { label: t('metrics.avgTransactionValue'), val: formatCurrency(data.summary.averageOrderValue), icon: Package, color: "text-purple-600", bg: "bg-purple-50", sub: t('metrics.unitYield') },
              { label: t('revenue.metrics.clientRetention'), val: data.byPaymentMethod.reduce((sum, m) => sum + m.count, 0), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", sub: t('metrics.verifiedEntities') }
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-10">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                      <m.icon className={cn("w-20 h-20", m.color)} />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{m.label}</p>
                      <div className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">{m.val}</div>
                      <div className="flex items-center gap-3">
                        {m.trend !== undefined ? (
                          <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic shadow-sm", m.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                            {m.trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-2" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-2" />}
                            {Math.abs(m.trend)}% DELTA
                          </Badge>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{m.sub}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-16">
            <div className="flex justify-center border-b border-slate-100">
              <TabsList className="bg-transparent h-auto p-0 gap-10">
                {[
                  { id: 'mission', label: t('tabs.mission'), icon: LayoutGrid },
                  { id: 'trend', label: t('tabs.trend'), icon: TrendingUp },
                  { id: 'payment', label: t('tabs.payment'), icon: CreditCard },
                  { id: 'appointments', label: t('tabs.appointments'), icon: Calendar },
                  { id: 'forecast', label: t('tabs.forecast'), icon: Binary },
                  { id: 'marketing', label: t('tabs.marketing'), icon: Megaphone }
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="pb-6 rounded-none border-b-[3px] border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent data-[state=active]:text-pink-600 text-[11px] font-black uppercase tracking-[0.3em] transition-all italic hover:text-pink-400"
                  >
                    <tab.icon className="w-4.5 h-4.5 mr-3" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <TabsContent value="mission" className="mt-0 outline-none">
                  <MissionControl />
                </TabsContent>
                
                <TabsContent value="trend" className="mt-0 outline-none">
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                      <CardTitle className="text-2xl font-black text-slate-950 tracking-tight italic uppercase">{t('charts.synthesisDynamics')}</CardTitle>
                      <CardDescription className="text-sm text-slate-500 font-light italic mt-2">{t('charts.dynamicsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-16">
                      <div className="h-[500px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.chartData}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={15} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val: number) => `฿${(val/1000)}k`} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} />
                            <Legend verticalAlign="top" height={60} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={6} dot={false} activeDot={{ r: 10, strokeWidth: 0, fill: '#ec4899' }} name={t('charts.grossInflow')} />
                            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} strokeDasharray="8 8" dot={false} name={t('charts.cycleVolume')} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="mt-0 outline-none">
                  <div className="grid lg:grid-cols-12 gap-10">
                    <Card className="lg:col-span-7 border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                        <CardTitle className="text-2xl font-black text-slate-950 tracking-tight italic uppercase">{t('charts.vectorOptimization')}</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 mt-2 italic">{t('charts.vectorDescription')}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-10 lg:p-16 h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.byPaymentMethod}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                            <XAxis dataKey="method" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dy={15} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickFormatter={(v: number) => `฿${v/1000}k`} dx={-10} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="amount" radius={[12, 12, 0, 0]} name={t('charts.inflowVector')}>
                              {data.byPaymentMethod.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ec4899' : '#3b82f6'} opacity={0.8} stroke="white" strokeWidth={2} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <div className="lg:col-span-5 space-y-8">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic">{t('performance.title')}</h3>
                      <div className="space-y-6">
                        {data.byPaymentMethod.map((method, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                            <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group overflow-hidden relative">
                              <CardContent className="p-8">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:scale-110 group-hover:bg-pink-50 transition-all duration-700 shadow-sm">
                                      <CreditCard className="h-6 w-6 text-pink-600" />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-lg font-black text-slate-950 italic uppercase group-hover:text-pink-600 transition-colors">{method.method}</p>
                                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{method.count} {t('performance.verifiedNodes')}</p>
                                    </div>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <p className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">{formatCurrency(method.amount)}</p>
                                    <p className="text-[9px] text-pink-500/60 font-black uppercase tracking-widest italic">YIELD: {formatCurrency(method.amount / method.count)}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appointments" className="mt-0 outline-none">
                  <div className="space-y-12">
                    <div className="grid gap-8 md:grid-cols-3">
                      {[
                        { label: t('throughput.label'), val: appointmentData?.summary.totalAppointments || 0, sub: t('throughput.sub'), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: t('efficiency.label'), val: `${appointmentData?.summary.completionRate || 0}%`, sub: t('efficiency.sub'), icon: TrendingUp, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
                        { label: t('velocity.label'), val: `${appointmentData?.summary.paymentRate || 0}%`, sub: t('velocity.sub'), icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
                      ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] hover:border-pink-500/20 transition-all duration-700 relative group overflow-hidden">
                            <CardContent className="p-10 text-center space-y-8">
                              <div className={cn("mx-auto h-20 w-20 rounded-[1.5rem] border shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 duration-700", s.bg, s.border)}>
                                <s.icon className={cn("h-10 w-10", s.color)} />
                              </div>
                              <div className="space-y-3">
                                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{s.label}</p>
                                <div className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase">{s.val}</div>
                                <p className="text-[10px] text-pink-600 font-black uppercase tracking-widest italic">{s.sub}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-10">
                      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] relative group overflow-hidden transition-all duration-700 hover:border-pink-500/20">
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                          <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">{t('charts.statusMatrix')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 flex flex-col items-center">
                          <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={appointmentData?.statusBreakdown || []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={90} outerRadius={130} paddingAngle={8} labelLine={false} label={(entry: any) => `${entry.percentage}%`}>
                                  {(appointmentData?.statusBreakdown || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} stroke="white" strokeWidth={2} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] relative group overflow-hidden transition-all duration-700 hover:border-pink-500/20">
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                          <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase">{t('charts.statusIndex')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12 space-y-10">
                          {(appointmentData?.statusBreakdown || []).map((status, index) => (
                            <div key={index} className="space-y-4 group/status">
                              <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                  <span className="text-[11px] font-black text-slate-950 group-hover/status:text-pink-600 transition-colors uppercase tracking-[0.2em] italic">{status.status}</span>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{status.count} {t('metrics.operationalCycles')}</p>
                                </div>
                                <span className="text-2xl font-black text-slate-950 italic tracking-tighter">{status.percentage}%</span>
                              </div>
                              <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden border border-slate-100 shadow-inner">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: `${status.percentage}%` }} transition={{ duration: 1.5, delay: index * 0.1 }} className="h-full rounded-full shadow-glow-pink/20" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="market" className="mt-0 outline-none">
                  <MarketIntelligenceHeatmap isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="inventory" className="mt-0 outline-none">
                  <PredictiveInventory isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="staff" className="mt-0 outline-none">
                  <StaffEfficiency isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="forecast" className="mt-0 outline-none">
                  <RevenueForecaster isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="marketing" className="mt-0 outline-none">
                  <AutonomousMarketing isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="benchmarking" className="mt-0 outline-none">
                  <BranchBenchmarking isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="industry" className="mt-0 outline-none">
                  <IndustryBenchmarking isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="audit" className="mt-0 outline-none">
                  <MedicalComplianceAudit isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="roi" className="mt-0 outline-none">
                  <ROISimulator isEnterprise={user.role === 'super_admin'} />
                </TabsContent>
                <TabsContent value="outcomes" className="mt-0 outline-none">
                  <AestheticOutcomeQuantifier isPremium={user.role === 'super_admin' || user.role === 'center_owner'} />
                </TabsContent>
                <TabsContent value="advisor" className="mt-0 outline-none">
                  <StrategicGrowthAdvisor />
                </TabsContent>
                <TabsContent value="recovery" className="mt-0 outline-none">
                  <AIRevenueRecovery />
                </TabsContent>
                <TabsContent value="assets" className="mt-0 outline-none">
                  <AestheticAssetLifecycle />
                </TabsContent>
                <TabsContent value="boardroom" className="mt-0 outline-none">
                  <AIBoardroomReport />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
