'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  BarChart3,
  Calendar,
  Loader2,
  Sparkles,
  Building2,
} from 'lucide-react';

interface AIAnalyticsData {
  overview: {
    totalAnalyses: number;
    analysesThisMonth: number;
    analysesLastMonth: number;
    momGrowth: number;
    avgPerDay: number;
    avgOverallScore: number;
    uniqueUsers: number;
  };
  monthlyTrend: Array<{ month: string; count: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
  skinTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
  scoreDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  topClinics: Array<{ id: string; name: string; analysisCount: number }>;
  recentAnalyses: Array<{
    id: string;
    clinicName: string;
    skinType: string;
    overallScore: number;
    createdAt: string;
  }>;
}

export default function AIAnalyticsDashboard() {
  const [data, setData] = useState<AIAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/ai-analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch AI analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSkinTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      oily: 'bg-yellow-100 text-yellow-800',
      dry: 'bg-orange-100 text-orange-800',
      combination: 'bg-purple-100 text-purple-800',
      normal: 'bg-green-100 text-green-800',
      sensitive: 'bg-red-100 text-red-800',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const maxMonthlyCount = Math.max(...data.monthlyTrend.map((m) => m.count), 1);
  const maxDailyCount = Math.max(...data.dailyTrend.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 p-2 rounded-full bg-purple-100 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{data.overview.totalAnalyses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Activity className="w-10 h-10 p-2 rounded-full bg-blue-100 text-blue-600" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{data.overview.analysesThisMonth}</p>
                  {data.overview.momGrowth !== 0 && (
                    <Badge className={data.overview.momGrowth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {data.overview.momGrowth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(data.overview.momGrowth)}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-10 h-10 p-2 rounded-full bg-yellow-100 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{data.overview.avgOverallScore}</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 p-2 rounded-full bg-green-100 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{data.overview.uniqueUsers}</p>
                <p className="text-xs text-muted-foreground">Unique Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Trend (12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {data.monthlyTrend.map((item, idx) => {
                const height = (item.count / maxMonthlyCount) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{item.count}</span>
                    <div
                      className="w-full bg-purple-500/80 rounded-t transition-all hover:bg-purple-600"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground rotate-[-45deg] origin-center whitespace-nowrap">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Excellent (80-100)', value: data.scoreDistribution.excellent, color: 'bg-green-500' },
                { label: 'Good (60-79)', value: data.scoreDistribution.good, color: 'bg-blue-500' },
                { label: 'Fair (40-59)', value: data.scoreDistribution.fair, color: 'bg-yellow-500' },
                { label: 'Poor (0-39)', value: data.scoreDistribution.poor, color: 'bg-red-500' },
              ].map((item) => {
                const total = data.scoreDistribution.excellent + data.scoreDistribution.good + data.scoreDistribution.fair + data.scoreDistribution.poor;
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.value} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily" className="gap-1">
            <Calendar className="w-4 h-4" />
            Daily (30d)
          </TabsTrigger>
          <TabsTrigger value="skinTypes" className="gap-1">
            <Activity className="w-4 h-4" />
            Skin Types
          </TabsTrigger>
          <TabsTrigger value="topClinics" className="gap-1">
            <Building2 className="w-4 h-4" />
            Top Clinics
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-1">
            <Brain className="w-4 h-4" />
            Recent
          </TabsTrigger>
        </TabsList>

        {/* Daily Trend Tab */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Analyses (Last 30 Days)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Average: {data.overview.avgPerDay} analyses per day
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-[2px] h-32">
                {data.dailyTrend.map((item, idx) => {
                  const height = (item.count / maxDailyCount) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-blue-500/80 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${item.date}: ${item.count} analyses`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{data.dailyTrend[0]?.date}</span>
                <span>{data.dailyTrend[data.dailyTrend.length - 1]?.date}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skin Types Tab */}
        <TabsContent value="skinTypes">
          <Card>
            <CardContent className="pt-6">
              {data.skinTypeDistribution.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No data available</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {data.skinTypeDistribution.map((item) => (
                    <div
                      key={item.type}
                      className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow"
                    >
                      <Badge className={getSkinTypeBadgeColor(item.type)}>
                        {item.type}
                      </Badge>
                      <p className="text-2xl font-bold mt-2">{item.count}</p>
                      <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Clinics Tab */}
        <TabsContent value="topClinics">
          <Card>
            <CardContent className="pt-6">
              {data.topClinics.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No clinic data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Clinic Name</TableHead>
                      <TableHead className="text-right">Analyses</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topClinics.map((clinic, idx) => (
                      <TableRow key={clinic.id}>
                        <TableCell>
                          <Badge variant={idx === 0 ? 'default' : 'outline'}>
                            {idx + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{clinic.name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {clinic.analysisCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {((clinic.analysisCount / data.overview.totalAnalyses) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Analyses Tab */}
        <TabsContent value="recent">
          <Card>
            <CardContent className="pt-6">
              {data.recentAnalyses.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent analyses</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Skin Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell className="font-medium">{analysis.clinicName}</TableCell>
                        <TableCell>
                          <Badge className={getSkinTypeBadgeColor(analysis.skinType)}>
                            {analysis.skinType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getScoreColor(analysis.overallScore)}`}>
                            {analysis.overallScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(analysis.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
