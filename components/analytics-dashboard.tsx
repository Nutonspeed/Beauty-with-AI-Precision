'use client';

/**
 * Analytics Dashboard Component
 * Main dashboard with metrics, charts, and insights
 */

import { useState } from 'react';
import { useMetrics, useInsights, useChartData, usePredictions } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Star,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    period: 'daily' as const,
  });

  // Fetch real-time metrics (refresh every 30 seconds)
  const { metrics, loading: metricsLoading, refresh: refreshMetrics } = useMetrics(undefined, 30000);

  // Fetch insights (refresh every 5 minutes)
  const {
    insights,
    loading: insightsLoading,
    refresh: refreshInsights,
    dismissInsight,
  } = useInsights(undefined, 300000);

  // Fetch chart data
  const {
    chartData: revenueChartData,
    loading: chartLoading,
  } = useChartData(['revenue'], dateRange);

  // Fetch predictions
  const { predictions, predict } = usePredictions();

  const getMetricIcon = (metricId: string) => {
    const icons: Record<string, React.ReactNode> = {
      'revenue-today': <DollarSign className="w-4 h-4" />,
      'appointments-today': <Calendar className="w-4 h-4" />,
      'new-customers': <Users className="w-4 h-4" />,
      'satisfaction-score': <Star className="w-4 h-4" />,
      'avg-service-time': <Clock className="w-4 h-4" />,
      'conversion-rate': <Target className="w-4 h-4" />,
    };
    return icons[metricId] || <TrendingUp className="w-4 h-4" />;
  };

  const getInsightIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      info: <Info className="w-5 h-5 text-blue-500" />,
      recommendation: <Lightbulb className="w-5 h-5 text-purple-500" />,
    };
    return icons[type] || <Info className="w-5 h-5" />;
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === 'THB') {
      return `฿${value.toLocaleString()}`;
    } else if (unit === '%') {
      return `${value}%`;
    } else if (unit === 'score') {
      return value.toFixed(1);
    } else if (unit === 'minutes') {
      return `${value} min`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => { refreshMetrics(); refreshInsights(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsLoading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading metrics...</div>
          </div>
        ) : (
          metrics.map((metric) => (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.name}
                </CardTitle>
                {getMetricIcon(metric.id)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(metric.value, metric.unit)}
                </div>
                {metric.changePercent !== undefined && (
                  <div className="flex items-center text-sm mt-2">
                    {metric.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : metric.trend === 'down' ? (
                      <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    ) : null}
                    <span className={
                      metric.trend === 'up' ? 'text-green-500' :
                      metric.trend === 'down' ? 'text-red-500' :
                      'text-muted-foreground'
                    }>
                      {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground ml-1">from yesterday</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                ) : revenueChartData ? (
                  <Line
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                    height={250}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">No data available</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Automated Insights</CardTitle>
                <CardDescription>AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {insightsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-muted-foreground">Loading insights...</div>
                    </div>
                  ) : insights.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-muted-foreground">No insights available</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {insights.map((insight) => (
                        <div
                          key={insight.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          {getInsightIcon(insight.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm">{insight.title}</h4>
                              <Badge variant={
                                insight.impact === 'high' ? 'destructive' :
                                insight.impact === 'medium' ? 'default' :
                                'secondary'
                              }>
                                {insight.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {insight.description}
                            </p>
                            {insight.suggestedAction && (
                              <p className="text-sm text-blue-600">
                                💡 {insight.suggestedAction}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissInsight(insight.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Revenue analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>Customer insights and demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Customer analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Team and operational performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Performance metrics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
              <CardDescription>Future trends and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => predict('revenue', 30)}>
                  Generate Revenue Forecast (30 days)
                </Button>
                {predictions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Forecast Results</h4>
                    <div className="text-sm text-muted-foreground">
                      {predictions.length} predictions generated
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
