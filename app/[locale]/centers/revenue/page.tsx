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
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  LayoutGrid,
  Globe,
  Calculator,
  Binary,
  ShieldAlert,
  Gauge,
  Brain,
  Cpu,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function CenterRevenuePage() {
  const t = useTranslations();
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
        title: t('common.error'),
        description: t('revenue.errors.loadAppointments'),
        variant: 'destructive'
      });
    }
  }, [period, t, toast]);

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
        title: t('common.error'),
        description: t('revenue.errors.loadRevenue'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [period, t, toast]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    // Only center_owner, center_admin, and super_admin can access
    if (!['center_owner', 'center_admin', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    loadRevenueData();
    
    // Load appointment data if appointments tab is active
    if (activeTab === 'appointments') {
      loadAppointmentData();
    }
  }, [user, authLoading, router, lp, period, activeTab, loadRevenueData, loadAppointmentData]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointmentData();
    }
  }, [user, authLoading, router, lp, period, activeTab, loadRevenueData, loadAppointmentData]);

  const handleExport = (format: 'pdf' | 'excel') => {
    if (format === 'excel') {
      exportCsv();
    } else {
      // For PDF, use browser print functionality
      window.print();
    }
  };

  const exportCsv = () => {
    if (!data) return;

    // Create CSV content
    const header = [
      t('revenue.csv.reportTitle'),
      `${t('revenue.csv.periodLabel')} ${t(`revenue.periods.${period}`)}`,
      '',
      t('revenue.csv.summary'),
      `${t('revenue.metrics.totalRevenue')},${data.summary.totalRevenue}`,
      `${t('revenue.metrics.confirmedBookings')},${data.summary.totalBookings}`,
      `${t('revenue.metrics.avgTransactionValue')},${data.summary.averageOrderValue}`,
      `${t('about.stats.accuracy')},${data.summary.growthRate}%`,
      '',
      t('revenue.csv.dailyRevenue'),
      `${t('revenue.csv.columns.date')},${t('revenue.csv.columns.revenue')},${t('revenue.csv.columns.bookings')}`
    ];

    // Add daily data
    const dailyRows = data.chartData.map(row => 
      `${row.date},${row.revenue},${row.bookings}`
    );

    // Add payment methods section
    const paymentHeader = [
      '',
      t('revenue.csv.paymentMethods'),
      `${t('revenue.csv.columns.method')},${t('revenue.csv.columns.amount')},${t('revenue.csv.columns.count')},${t('revenue.csv.columns.average')}`
    ];

    const paymentRows = data.byPaymentMethod.map(method => 
      `${method.method},${method.amount},${method.count},${method.amount / method.count}`
    );

    // Combine all sections
    const csvContent = [
      ...header,
      ...dailyRows,
      ...paymentHeader,
      ...paymentRows
    ].join('\n');

    // Create and download file
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

    toast({
      title: t('revenue.export.success'),
      description: t('revenue.export.csvDownloaded')
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{t('revenue.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || !data) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-500/30 print:bg-white print:text-black">
      <Header />
      
      <IntelligenceCommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={(id) => setActiveTab(id as any)} 
      />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Header - Financial Command Interface */}
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-blue-500/5">
                  <TrendingUp className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  Aesthetic Intelligence Terminal
                </Badge>
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-slate-900 leading-[0.9] italic">
                  Revenue<br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent not-italic text-2xl tracking-[0.3em] font-black uppercase">Active Nodes MTD</span>
                </h1>
                <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                  Orchestrate aesthetic financial flows and monitor yield optimization cycles with precision telemetry.
                </p>
              </motion.div>
            </div>
            <div className="lg:col-span-4">
              <SynapticNotifications />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-200 print:hidden">
            
            <div className="flex flex-wrap items-center gap-6 shrink-0">
              <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-inner">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500",
                      period === p ? "bg-blue-600 text-white shadow-xl shadow-blue-600/40 italic" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" onClick={() => handleExport('pdf')}>
                  <Download className="mr-3 h-4 w-4" />
                  PDF_EXPORT
                </Button>
                <Button variant="premium" className="h-14 px-8 rounded-2xl shadow-xl shadow-blue-600/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border-none bg-blue-600 text-white" onClick={() => handleExport('excel')}>
                  <Download className="mr-3 h-4 w-4" />
                  LEDGER_SYNC
                </Button>
              </div>
            </div>
          </div>

          {/* Executive Metrics Grid - Aesthetic Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: t('revenue.metrics.totalRevenue'), val: formatCurrency(data.summary.totalRevenue), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50", trend: data.summary.growthRate },
              { label: t('revenue.metrics.confirmedBookings'), val: data.summary.totalBookings, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50", sub: "Operational Cycles" },
              { label: t('revenue.metrics.avgTransactionValue'), val: formatCurrency(data.summary.averageOrderValue), icon: Package, color: "text-cyan-600", bg: "bg-cyan-50", sub: "Unit Yield" },
              { label: t('revenue.metrics.clientRetention'), val: data.byPaymentMethod.reduce((sum, m) => sum + m.count, 0), icon: Users, color: "text-slate-600", bg: "bg-slate-50", sub: "Verified Entities" }
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500 hover:bg-white/80 group shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                  <CardContent className="p-10">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                      <m.icon className="w-20 h-20 text-blue-500" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 italic">{m.label}</p>
                      <div className="text-3xl font-black text-slate-900 tracking-tighter italic">{m.val}</div>
                      <div className="flex items-center gap-3">
                        {m.trend !== undefined ? (
                          <Badge className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm",
                            m.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {m.trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1.5" /> : <ArrowDownRight className="w-3 h-3 mr-1.5" />}
                            {Math.abs(m.trend)}% DELTA
                          </Badge>
                        ) : (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{m.sub}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-12">
            <div className="flex justify-center border-b border-slate-200">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                {[
                  { id: 'mission', label: 'Mission_Control', icon: LayoutGrid },
                  { id: 'trend', label: 'Temporal_Dynamics', icon: TrendingUp },
                  { id: 'payment', label: 'Vector_Optimization', icon: CreditCard },
                  { id: 'appointments', label: 'Throughput_Matrix', icon: Calendar },
                  { id: 'forecast', label: 'Predictive_Revenue', icon: Binary },
                  { id: 'marketing', label: 'Autonomous_Growth', icon: Megaphone }
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="mission" className="mt-0 outline-none">
                  <div className="grid gap-10">
                    <MissionControl />
                  </div>
                </TabsContent>
        <TabsContent value="trend" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-royalblue-500/20 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                    <CardTitle className="text-2xl font-bold text-royalblue-500 tracking-tight italic">Synthesis Dynamics</CardTitle>
                    <CardDescription className="text-sm text-slate-500 font-light italic mt-2">Historical revenue momentum and cycle volume analytics</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16">
                    <div className="print:hidden h-[500px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data?.chartData || []}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                            dy={15}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                            axisLine={false} 
                            tickLine={false} 
                            dx={-10} 
                            tickFormatter={(val: number) => `฿${(val/1000)}k`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.05)', borderRadius: '24px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563eb' }}
                          />
                          <Legend verticalAlign="top" height={60} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6 }} />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={6}
                            dot={false}
                            activeDot={{ r: 10, strokeWidth: 0, fill: '#2563eb' }}
                            name="Gross Inflow"
                          />
                          <Line
                            type="monotone"
                            dataKey="bookings"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            strokeDasharray="8 8"
                            dot={false}
                            name="Cycle Volume"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="mt-0 outline-none">
                <div className="grid lg:grid-cols-12 gap-10">
                  <Card className="lg:col-span-7 border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                      <CardTitle className="text-2xl font-bold text-royalblue-500 tracking-tight italic">Vector Optimization</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Aesthetic financial ingestion method breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-16 h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.byPaymentMethod}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="method" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} dy={15} />
                          <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickFormatter={(v: number) => `฿${v/1000}k`} dx={-10} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                          />
                          <Bar dataKey="amount" radius={[12, 12, 0, 0]} name="Inflow Vector">
                            {data.byPaymentMethod.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="lg:col-span-5 space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4 italic">Operational Performance</h3>
                    <div className="space-y-6">
                      {data.byPaymentMethod.map((method, idx) => (
                        <motion.div
                          key={method.method}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] hover:border-pink-500/20 transition-all duration-500 group overflow-hidden relative shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            <CardContent className="p-8">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/10 group-hover:scale-110 group-hover:border-pink-500/30 transition-all duration-700 shadow-inner">
                                    <CreditCard className="h-6 w-6 text-pink-400" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-lg font-bold text-white italic group-hover:text-pink-400 transition-colors">{method.method}</p>
                                    <p className="text-[9px] uppercase font-black text-slate-600 tracking-widest">{method.count} Verified Nodes</p>
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <p className="text-2xl font-black text-white tracking-tighter italic">{formatCurrency(method.amount)}</p>
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
                        { label: "Throughput", val: appointmentData?.summary.totalAppointments || 0, sub: "Cumulative Cycles", icon: Calendar, color: 'text-blue-400' },
                        { label: "Efficiency", val: `${appointmentData?.summary.completionRate || 0}%`, sub: "Execution Yield", icon: TrendingUp, color: 'text-pink-400' },
                        { label: "Velocity", val: `${appointmentData?.summary.paymentRate || 0}%`, sub: "Liquidity Index", icon: CreditCard, color: 'text-emerald-400' }
                      ].map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 shadow-2xl relative group">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            <CardContent className="p-10 text-center space-y-6">
                              <div className="mx-auto h-16 w-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                                <s.icon className={cn("h-8 w-8", s.color)} />
                              </div>
                              <div className="space-y-2">
                                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-600 italic">{s.label}</p>
                                <div className="text-5xl font-black text-white tracking-tighter italic">{s.val}</div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{s.sub}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-2xl relative group overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Status Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12 flex flex-col items-center">
                          <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={appointmentData?.statusBreakdown || []}
                                  dataKey="count"
                                  nameKey="status"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={90}
                                  outerRadius={130}
                                  paddingAngle={8}
                                  labelLine={false}
                                  label={(entry: any) => `${entry.percentage}%`}
                                >
                                  {(appointmentData?.statusBreakdown || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-2xl relative group overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Status Index</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 lg:p-12 space-y-10">
                          {(appointmentData?.statusBreakdown || []).map((status, index) => (
                            <div key={status.status} className="space-y-4 group/status">
                              <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-white group-hover/status:text-pink-400 transition-colors uppercase tracking-[0.25em] italic">{status.status}</span>
                                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{status.count} Operational Cycles</p>
                                </div>
                                <span className="text-2xl font-black text-white italic tracking-tighter">{status.percentage}%</span>
                              </div>
                              <div className="w-full bg-white/[0.02] rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${status.percentage}%` }}
                                  transition={{ duration: 1.5, delay: index * 0.1 }}
                                  className="h-full rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
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
