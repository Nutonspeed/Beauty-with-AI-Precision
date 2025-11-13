'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

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

  const getTrendColor = (value: number, inverse = false) => {
    if (inverse) {
      return value > 0 ? 'text-red-500' : 'text-green-500';
    }
    return value > 0 ? 'text-green-500' : 'text-red-500';
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
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.overview.mrr)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ARR: {formatCurrency(metrics.overview.arr)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clinics</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalClinics}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(metrics.overview.averageRevenuePerClinic)}/clinic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.paymentSuccessRate}%</div>
            <Badge 
              variant={metrics.overview.paymentSuccessRate >= 95 ? 'default' : 'destructive'}
              className="mt-1"
            >
              {metrics.overview.paymentSuccessRate >= 95 ? 'Excellent' : 'Needs Attention'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate (30d)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor(metrics.overview.churnRate, true)}`}>
              {metrics.overview.churnRate}%
            </div>
            {metrics.overview.churnRate > 5 && (
              <Badge variant="destructive" className="mt-1">High Risk</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Amount Alert */}
      {metrics.overview.outstandingAmount > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {formatCurrency(metrics.overview.outstandingAmount)}
            </div>
            <p className="text-xs text-yellow-600 mt-1">Requires collection action</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Subscription Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.subscriptionDistribution).map(([status, count]) => {
                const percentage = totalSubscriptions > 0 
                  ? ((count / totalSubscriptions) * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                      <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.revenueByPlan
                .toSorted((a, b) => b.revenue - a.revenue)
                .map((item) => {
                  const maxRevenue = Math.max(...metrics.revenueByPlan.map(p => p.revenue));
                  const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={item.plan} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.plan}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Revenue Trend (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-end gap-1 h-48">
              {metrics.monthlyTrend.map((item, index) => {
                const maxRevenue = Math.max(...metrics.monthlyTrend.map(m => m.revenue));
                const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                const prevRevenue = index > 0 ? metrics.monthlyTrend[index - 1].revenue : 0;
                const growth = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue) * 100 : 0;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center h-40">
                      <div 
                        className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t hover:from-pink-600 hover:to-pink-500 transition-all cursor-pointer"
                        style={{ height: `${barHeight}%` }}
                        title={`${item.month}: ${formatCurrency(item.revenue)}`}
                      >
                        {growth !== 0 && index > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 text-xs">
                            {growth > 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={growth > 0 ? 'text-green-500' : 'text-red-500'}>
                              {Math.abs(growth).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground transform -rotate-45 origin-top-left mt-2">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method Distribution (Last 90 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.paymentMethods.map((method) => (
              <div key={method.method} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{method.count}</div>
                <div className="text-sm text-muted-foreground capitalize mt-1">
                  {method.method.replace('_', ' ')}
                </div>
                <div className="text-xs text-pink-500 mt-1">{method.percentage}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
