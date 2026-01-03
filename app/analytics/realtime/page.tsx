'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AnalyticsData {
  bookingRate: number;
  revenue: number;
  activeUsers: number;
  trend: 'up' | 'down';
  timestamp: number;
}

interface ChartDataPoint {
  time: string;
  bookings: number;
  revenue: number;
  users: number;
}

export default function RealtimeAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    bookingRate: 0,
    revenue: 0,
    activeUsers: 0,
    trend: 'up',
    timestamp: Date.now()
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection to analytics:realtime channel
    setIsConnected(true);

    // Simulate initial data
    const initialData: ChartDataPoint[] = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now - i * 60000);
      initialData.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        bookings: Math.floor(Math.random() * 10) + 5,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        users: Math.floor(Math.random() * 50) + 20
      });
    }
    setChartData(initialData);

    // Simulate realtime updates every 10 seconds
    const interval = setInterval(() => {
      const newBookingRate = Math.floor(Math.random() * 10) + 5;
      const newRevenue = Math.floor(Math.random() * 50000) + 10000;
      const newActiveUsers = Math.floor(Math.random() * 50) + 20;
      const prevBookingRate = analyticsData.bookingRate || newBookingRate;

      setAnalyticsData({
        bookingRate: newBookingRate,
        revenue: newRevenue,
        activeUsers: newActiveUsers,
        trend: newBookingRate > prevBookingRate ? 'up' : 'down',
        timestamp: Date.now()
      });

      // Add new data point to chart
      setChartData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          bookings: newBookingRate,
          revenue: newRevenue,
          users: newActiveUsers
        };
        const updated = [...prev.slice(-9), newPoint];
        return updated;
      });
    }, 10000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [analyticsData.bookingRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Realtime Analytics</h1>
          <p className="text-muted-foreground">Live metrics updated every 10 seconds</p>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="h-6">
          {isConnected ? '● Live' : '○ Disconnected'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bookingRate} / hour</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.trend === 'up' ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={analyticsData.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.trend === 'up' ? 'Increasing' : 'Decreasing'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue)}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Rate Trend</CardTitle>
            <CardDescription>Bookings per hour over the last 10 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Hourly revenue over the last 10 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(142 76% 36%)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Users Trend</CardTitle>
            <CardDescription>Real-time active users over the last 10 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(217 91% 60%)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
