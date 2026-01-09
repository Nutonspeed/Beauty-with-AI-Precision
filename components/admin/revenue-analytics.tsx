'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  CreditCard,
  AlertCircle,
  PieChart,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RevenueMetrics {
  overview: {
    mrr: number;
    arr: number;
    totalClinics: number;
    averageRevenuePerClinic: number;
    churnRate: number;
    paymentSuccessRate: number;
    outstandingAmount: number;
  };
  subscriptionDistribution: {
    active: number;
    trial: number;
    past_due: number;
    cancelled: number;
    paused: number;
  };
  revenueByPlan: Array<{
    plan: string;
    revenue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
}

export default function RevenueAnalytics() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/revenue-analytics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch revenue metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load revenue analytics</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      trial: 'bg-blue-500',
      past_due: 'bg-yellow-500',
      cancelled: 'bg-red-500',
      paused: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const totalSubscriptions = Object.values(metrics.subscriptionDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Monthly Recurring Revenue', val: formatCurrency(metrics.overview.mrr), sub: `ARR: ${formatCurrency(metrics.overview.arr)}`, icon: DollarSign, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { label: 'Active Clinical Nodes', val: metrics.overview.totalClinics.toString(), sub: `Avg: ${formatCurrency(metrics.overview.averageRevenuePerClinic)} / node`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Payment Success Velocity', val: `${metrics.overview.paymentSuccessRate}%`, sub: metrics.overview.paymentSuccessRate >= 95 ? 'OPTIMAL_PERFORMANCE' : 'ATTENTION_REQUIRED', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: true, status: metrics.overview.paymentSuccessRate >= 95 ? 'default' : 'destructive' },
          { label: 'Churn Delta (30d)', val: `${metrics.overview.churnRate}%`, sub: metrics.overview.churnRate > 5 ? 'CRITICAL_LEAKAGE' : 'NOMINAL_RETENTION', icon: AlertCircle, color: metrics.overview.churnRate > 5 ? 'text-rose-400' : 'text-cyan-400', bg: metrics.overview.churnRate > 5 ? 'bg-rose-500/10' : 'bg-cyan-500/10', badge: metrics.overview.churnRate > 5, status: 'destructive' }
        ].map((node, i) => (
          <Card key={i} className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{node.label}</CardTitle>
              <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                <node.icon className={cn("h-4 w-4", node.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white tracking-tighter italic">{node.val}</div>
              <div className="mt-2 flex items-center gap-2">
                {node.badge ? (
                  <Badge variant={node.status as any} className="px-2 py-0 h-4 rounded-full text-[7px] font-black uppercase tracking-tighter">
                    {node.sub}
                  </Badge>
                ) : (
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{node.sub}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Outstanding Amount Alert - Critical Vector */}
      {metrics.overview.outstandingAmount > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-rose-500/20 bg-rose-500/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(244,63,94,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <AlertCircle className="w-32 h-32 text-rose-500" />
            </div>
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                  <CreditCard className="h-8 w-8 text-rose-400 animate-pulse" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 italic">Unresolved Financial Inflow</p>
                  <h3 className="text-3xl font-black text-white tracking-tighter italic">{formatCurrency(metrics.overview.outstandingAmount)}</h3>
                  <p className="text-sm text-slate-500 font-light italic leading-relaxed">Outstanding invoice parameters detected. Immediate collection protocol recommended.</p>
                </div>
              </div>
              <Button variant="destructive" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-500/20">
                INITIATE_COLLECTION
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Subscription Matrix Distribution */}
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <PieChart className="h-6 w-6 text-cyan-400" />
              Subscription Distribution
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Global node status matrix breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-12 space-y-6">
            {Object.entries(metrics.subscriptionDistribution).map(([status, count], idx) => {
              const percentage = totalSubscriptions > 0 
                ? ((count / totalSubscriptions) * 100).toFixed(1) 
                : 0;
              
              return (
                <motion.div 
                  key={status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group/row hover:bg-white/[0.04] transition-all duration-500"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("h-3 w-3 rounded-full animate-pulse", getStatusColor(status))} />
                    <span className="text-sm font-bold text-slate-300 group/row:text-white transition-colors uppercase tracking-widest italic">{status.replace('_', ' ')} Vector</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-black text-white italic tracking-tighter">{count}</span>
                    <Badge variant="outline" className="bg-white/[0.03] border-white/10 text-slate-500 text-[10px] font-black rounded-lg px-3 italic">
                      {percentage}%
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Plan Yield Hierarchy */}
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              Plan Yield Performance
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Revenue optimization by service tier</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-12 space-y-10">
            {[...metrics.revenueByPlan]
              .sort((a, b) => b.revenue - a.revenue)
              .map((item, idx) => {
                const maxRevenue = Math.max(...metrics.revenueByPlan.map(p => p.revenue));
                const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                return (
                  <div key={item.plan} className="space-y-4 group/plan">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-white group-hover/plan:text-pink-400 transition-colors uppercase tracking-[0.25em] italic">{item.plan} Tier</span>
                        <p className="text-2xl font-black text-white italic tracking-tighter">{formatCurrency(item.revenue)}</p>
                      </div>
                      <Badge className="bg-white/[0.03] border-white/10 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg px-4 py-1 italic">Active Cycle</Badge>
                    </div>
                    <div className="relative h-2 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 1.5, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-full" 
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* Temporal Inflow Monitor */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Calendar className="h-6 w-6 text-white" />
            Temporal Revenue Dynamics (12M)
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Historical momentum and growth vector mapping</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-16">
          <div className="flex items-end gap-2 h-64">
            {metrics.monthlyTrend.map((item, index) => {
              const maxRevenue = Math.max(...metrics.monthlyTrend.map(m => m.revenue));
              const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const prevRevenue = index > 0 ? metrics.monthlyTrend[index - 1].revenue : 0;
              const growth = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue) * 100 : 0;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-4 group/bar">
                  <div className="relative w-full flex items-end justify-center h-48">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-t-xl group-hover/bar:bg-pink-600/20 group-hover/bar:border-pink-500/30 transition-all duration-500 relative cursor-pointer"
                      title={`${item.month}: ${formatCurrency(item.revenue)}`}
                    >
                      {growth !== 0 && index > 0 && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex items-center gap-2 bg-[#020617] border border-white/10 p-2 rounded-lg backdrop-blur-xl z-20 shadow-2xl">
                          {growth > 0 ? (
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-rose-400" />
                          )}
                          <span className={cn("text-[9px] font-black uppercase", growth > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                            {Math.abs(growth).toFixed(1)}% Δ
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 transform -rotate-45 origin-top-left group-hover/bar:text-white transition-colors">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Vector Analysis */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <CreditCard className="h-6 w-6 text-cyan-400" />
            Ingestion Vector Matrix
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Methodological financial intake distribution (90d)</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.paymentMethods.map((method, idx) => (
              <motion.div 
                key={method.method}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-inner group/vector"
              >
                <div className="text-4xl font-black text-white tracking-tighter italic group-hover/vector:text-cyan-400 transition-colors">{method.count}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2 italic group-hover/vector:text-slate-400 transition-colors">
                  {method.method.replace('_', ' ')} Node
                </div>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/5 text-cyan-400 text-[9px] font-black uppercase tracking-widest shadow-inner">
                  <Zap className="w-2.5 h-2.5 animate-pulse" />
                  {method.percentage}% Delta
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
