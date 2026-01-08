// @ts-nocheck
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  CreditCard,
  Users,
  Package,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    averageOrderValue: number;
    growthRate: number;
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

export default function ClinicRevenuePage() {
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<RevenueData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'trend' | 'payment' | 'appointments'>('trend');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    // Only clinic_owner, clinic_admin, and super_admin can access
    if (!['clinic_owner', 'clinic_admin', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    loadRevenueData();
    
    // Load appointment data if appointments tab is active
    if (activeTab === 'appointments') {
      loadAppointmentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, lp, period, activeTab]);

  const loadAppointmentData = async () => {
    try {
      const response = await fetch(`/api/clinic/appointments/analytics?period=${period}`);
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
  };

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinic/revenue?period=${period}`);
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
  };

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
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto space-y-10 print:space-y-6">
        {/* Header - Executive Style */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5 print:hidden">
          <div className="space-y-2">
            <Badge variant="premium" className="mb-2">{t('revenue.financialIntelligence')}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center gap-4">
              {t('revenue.title')}
            </h1>
            <p className="text-slate-400 font-light max-w-2xl leading-relaxed">
              {t('revenue.subtitle')} 
              {t('revenue.activePeriod')} <span className="text-primary font-medium">{t(`revenue.periods.${period}`)}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-4">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                    period === p ? "bg-primary text-white shadow-glow-primary" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="glass h-11" onClick={() => handleExport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                {t('revenue.export.pdf')}
              </Button>
              <Button variant="premium" className="h-11 shadow-glow-primary" onClick={() => handleExport('excel')}>
                <Download className="mr-2 h-4 w-4" />
                {t('revenue.export.excel')}
              </Button>
            </div>
          </div>
        </div>

        {/* Print Header - High Quality Typography */}
        <div className="hidden print:block text-center mb-10">
          <h1 className="text-3xl font-bold uppercase tracking-widest border-b-4 border-black pb-2 inline-block">{t('revenue.auditReport')}</h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-tight">{t('revenue.activePeriod')} {t(`revenue.periods.${period}`)}</p>
          <p className="text-xs text-gray-500">{t('revenue.enterpriseCloud')}</p>
        </div>

        {/* Executive Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: t('revenue.metrics.totalRevenue'), val: formatCurrency(data.summary.totalRevenue), icon: DollarSign, color: "text-primary", bg: "bg-primary/10", trend: data.summary.growthRate },
            { label: t('revenue.metrics.confirmedBookings'), val: data.summary.totalBookings, icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10", sub: t('revenue.metrics.operationalCycle') },
            { label: t('revenue.metrics.avgTransactionValue'), val: formatCurrency(data.summary.averageOrderValue), icon: Package, color: "text-amber-400", bg: "bg-amber-500/10", sub: t('revenue.metrics.ticketYield') },
            { label: t('revenue.metrics.clientRetention'), val: data.byPaymentMethod.reduce((sum, m) => sum + m.count, 0), icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", sub: t('revenue.metrics.uniquePayors') }
          ].map((m, i) => (
            <Card key={i} className="glass-panel border-white/5 relative group overflow-hidden">
              <CardContent className="p-8">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <m.icon className="w-16 h-16" />
                </div>
                <div className="space-y-4 relative z-10">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">{m.label}</p>
                  <div className="text-3xl font-black text-white tracking-tight">{m.val}</div>
                  <div className="flex items-center gap-2">
                    {m.trend !== undefined ? (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1",
                        m.trend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {m.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(m.trend)}% {t('revenue.metrics.delta')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.sub}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs - Dark Mode Optimized */}
        <Tabs defaultValue="trend" className="space-y-8" value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2 print:hidden">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="trend" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">{t('revenue.tabs.momentum')}</TabsTrigger>
              <TabsTrigger value="payment" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">{t('revenue.tabs.inflow')}</TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">{t('revenue.tabs.utilization')}</TabsTrigger>
            </TabsList>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold hidden md:block">{t('revenue.tabs.realtimeActive')}</p>
          </div>

          <TabsContent value="trend">
            <Card className="glass-panel border-white/5 overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5">
                <CardTitle className="text-xl font-bold tracking-tight">{t('revenue.dynamics.title')}</CardTitle>
                <CardDescription className="text-slate-400 font-light">{t('revenue.dynamics.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="print:hidden">
                  <div className="w-full h-[450px]">
                    <ResponsiveContainer width="100%" height={450}>
                      <LineChart data={data.chartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: '#64748b' }} 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val: number) => `฿${(val/1000)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Legend iconType="circle" />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--primary)"
                          strokeWidth={4}
                          dot={false}
                          activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--primary)' }}
                          name={t('revenue.dynamics.grossRevenue')}
                        />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name={t('revenue.dynamics.cycleVolume')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="hidden print:block mt-6">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">{t('revenue.table.timeline')}</th>
                        <th className="border p-2 text-right">{t('revenue.table.revenueAttributed')}</th>
                        <th className="border p-2 text-right">{t('revenue.table.volume')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.chartData.map((row) => (
                        <tr key={row.date}>
                          <td className="border p-2 font-medium">{row.date}</td>
                          <td className="border p-2 text-right">{formatCurrency(row.revenue)}</td>
                          <td className="border p-2 text-right font-bold">{row.bookings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <div className="grid lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-7 glass-panel border-white/5">
                <CardHeader className="bg-white/5 border-b border-white/5">
                  <CardTitle className="text-xl">{t('revenue.optimization.title')}</CardTitle>
                  <CardDescription className="text-slate-400">{t('revenue.optimization.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.byPaymentMethod}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="method" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickFormatter={(v: number) => `฿${v/1000}k`} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]} name={t('revenue.optimization.grossFlow')}>
                        {data.byPaymentMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 ml-2">{t('revenue.performance.title')}</h3>
                {data.byPaymentMethod.map((method, idx) => (
                  <Card key={method.method} className="glass-panel border-white/5 hover:border-primary/20 transition-all overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all")}>
                            <CreditCard className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{method.method}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">{method.count} {t('revenue.performance.transactionsVerified')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white">{formatCurrency(method.amount)}</p>
                          <p className="text-[9px] text-primary font-bold uppercase tracking-widest">{t('revenue.performance.yield')} {formatCurrency(method.amount / method.count)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Appointments Tab Professionalized */}
          <TabsContent value="appointments">
            <div className="space-y-10">
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { label: t('revenue.operational.throughput'), val: appointmentData?.summary.totalAppointments || 0, sub: t('revenue.operational.historicalLoad'), icon: Calendar },
                  { label: t('revenue.operational.efficiency'), val: `${appointmentData?.summary.completionRate || 0}%`, sub: t('revenue.operational.executionRate'), icon: TrendingUp },
                  { label: t('revenue.operational.velocity'), val: `${appointmentData?.summary.paymentRate || 0}%`, sub: t('revenue.operational.cashflowHealth'), icon: CreditCard }
                ].map((s, i) => (
                  <Card key={i} className="glass-panel border-white/5 hover:bg-white/5 transition-colors">
                    <CardContent className="p-8 text-center space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <s.icon className="h-6 w-6" />
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{s.label}</p>
                      <div className="text-4xl font-black text-white">{s.val}</div>
                      <p className="text-xs text-slate-400 font-light">{s.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="glass-panel border-white/5">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-lg">{t('revenue.operational.statusMatrix')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={appointmentData?.statusBreakdown || []}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          label={(entry: any) => `${entry.percentage}%`}
                        >
                          {(appointmentData?.statusBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-white/5">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-lg">{t('revenue.operational.statusIndex')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {(appointmentData?.statusBreakdown || []).map((status, index) => (
                      <div key={status.status} className="space-y-3 group">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-xs font-bold text-white group-hover:text-primary transition-colors uppercase tracking-widest">{status.status}</span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{status.count} {t('revenue.operational.operationalCycles')}</p>
                          </div>
                          <span className="text-xl font-black text-white">{status.percentage}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${status.percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full rounded-full bg-primary shadow-glow-primary"
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
        </Tabs>
      </div>
    </div>
  );
}
