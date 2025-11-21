/**
 * Customer Dashboard Component
 * Phase 2 Week 4 Task 4.3
 * 
 * Main analytics dashboard displaying trends, metrics, and insights
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrendChart from './trend-chart';
import {
  TrendPeriod,
  TrendsResponse,
  METRIC_CONFIGS,
} from '@/types/analytics';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

// =============================================
// Types
// =============================================

interface CustomerDashboardProps {
  customerId: string;
  defaultPeriod?: TrendPeriod;
}

// =============================================
// Period Selector Component
// =============================================

const PeriodSelector = ({
  selected,
  onChange,
}: {
  selected: TrendPeriod;
  onChange: (period: TrendPeriod) => void;
}) => {
  const periods: { value: TrendPeriod; label: string }[] = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selected === period.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
};

// =============================================
// Metric Card Component
// =============================================

const MetricCard = ({
  name,
  current,
  change,
  changePercent,
  trend,
  color,
  icon: _icon,
}: {
  name: string;
  current: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'stable' | 'worsening';
  color: string;
  icon: string;
}) => {
  let TrendIcon = Minus;
  if (trend === 'improving') {
    TrendIcon = TrendingUp;
  } else if (trend === 'worsening') {
    TrendIcon = TrendingDown;
  }

  let trendColor = 'text-gray-600';
  if (trend === 'improving') {
    trendColor = 'text-green-600';
  } else if (trend === 'worsening') {
    trendColor = 'text-red-600';
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <div
          className="h-4 w-4 rounded"
          style={{ backgroundColor: color }}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{current.toFixed(1)}</div>
        <div className={`flex items-center text-xs ${trendColor}`}>
          <TrendIcon className="mr-1 h-4 w-4" />
          <span className="font-medium">
            {changePercent > 0 ? '+' : ''}
            {changePercent.toFixed(1)}%
          </span>
          <span className="ml-1 text-muted-foreground">
            ({change > 0 ? '+' : ''}
            {change.toFixed(1)} pts)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================
// Insights Panel Component
// =============================================

const InsightsPanel = ({ trends }: { trends: TrendsResponse }) => {
  const insights = [];

  // Generate insights based on trends
  if (trends.metrics.overall.changePercent > 5) {
    insights.push({
      type: 'success',
      title: 'Great Progress!',
      message: `Your overall skin score improved by ${trends.metrics.overall.changePercent.toFixed(1)}%`,
      icon: CheckCircle,
    });
  }

  if (trends.metrics.spots.trend === 'improving') {
    insights.push({
      type: 'success',
      title: 'Spots Improving',
      message: 'Your acne treatment is showing positive results',
      icon: CheckCircle,
    });
  }

  if (trends.metrics.wrinkles.trend === 'worsening') {
    insights.push({
      type: 'warning',
      title: 'Wrinkles Need Attention',
      message: 'Consider adding anti-aging treatments',
      icon: AlertCircle,
    });
  }

  if (trends.summary.treatmentAdherence < 0.5) {
    insights.push({
      type: 'warning',
      title: 'Low Analysis Frequency',
      message: 'Regular tracking helps achieve better results',
      icon: AlertCircle,
    });
  }

  if (trends.summary.improvementRate > 2) {
    insights.push({
      type: 'success',
      title: 'Excellent Improvement Rate',
      message: `Your skin is improving ${trends.summary.improvementRate.toFixed(1)} points per month`,
      icon: Award,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Keep Going!',
      message: 'Continue your skincare routine for best results',
      icon: Info,
    });
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`rounded-lg border p-3 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{insight.title}</h4>
                  <p className="text-sm">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// =============================================
// Main Component
// =============================================

export default function CustomerDashboard({
  customerId,
  defaultPeriod = '3m',
}: CustomerDashboardProps) {
  const [period, setPeriod] = useState<TrendPeriod>(defaultPeriod);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trends data
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/analytics/trends?customerId=${customerId}&period=${period}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }

        const data = await response.json();
        setTrends(data);
      } catch (err) {
        console.error('Error fetching trends:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [customerId, period]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Error state
  if (error || !trends) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold">
              {error || 'Failed to load data'}
            </h3>
            <Button className="mt-4" onClick={() => globalThis.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your skin improvement over time
          </p>
        </div>
        <PeriodSelector selected={period} onChange={setPeriod} />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trends.summary.totalAnalyses}
            </div>
            <p className="text-xs text-muted-foreground">
              in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trends.summary.averageScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              out of 100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Improvement Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trends.summary.improvementRate > 0 ? '+' : ''}
              {trends.summary.improvementRate.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              points per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Analysis Frequency
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trends.summary.treatmentAdherence.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              analyses per month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(METRIC_CONFIGS).map((config) => {
          const metric = trends.metrics[config.key as keyof typeof trends.metrics];
          return (
            <MetricCard
              key={config.key}
              name={config.label}
              current={metric.current}
              change={metric.change}
              changePercent={metric.changePercent}
              trend={metric.trend}
              color={config.color}
              icon={config.icon}
            />
          );
        })}
      </div>

      {/* Trend Chart */}
      <TrendChart metrics={trends.metrics} />

      {/* Insights Panel */}
      <InsightsPanel trends={trends} />
    </div>
  );
}
