'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
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
  Shield,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const t = useTranslations();
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
      oily: 'bg-yellow-500/10 text-yellow-400',
      dry: 'bg-orange-500/10 text-orange-400',
      combination: 'bg-purple-500/10 text-purple-400',
      normal: 'bg-green-500/10 text-green-400',
      sensitive: 'bg-red-500/10 text-red-400',
    };
    return colors[type.toLowerCase()] || 'bg-white/5 text-slate-400';
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('aiAnalyticsDashboard.totalNeuralAnalyses'), val: data.overview.totalAnalyses.toLocaleString(), sub: t('aiAnalyticsDashboard.globalSynapseLoad'), icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: t('aiAnalyticsDashboard.activeCycleLoad'), val: data.overview.analysesThisMonth.toLocaleString(), sub: t('aiAnalyticsDashboard.mtdProcessing'), icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', growth: data.overview.momGrowth },
          { label: t('aiAnalyticsDashboard.meanIntegrityIndex'), val: data.overview.avgOverallScore.toString(), sub: t('aiAnalyticsDashboard.compositeQualityScore'), icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: t('aiAnalyticsDashboard.verifiedEntities'), val: data.overview.uniqueUsers.toLocaleString(), sub: t('aiAnalyticsDashboard.uniqueIdentityNodes'), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
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
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-white tracking-tighter italic">{node.val}</div>
                {node.growth !== undefined && node.growth !== 0 && (
                  <Badge className={cn("px-2 py-0.5 rounded-full border-none shadow-inner text-[8px] font-black italic", node.growth > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
                    {node.growth > 0 ? <TrendingUp className="w-2 h-2 mr-1" /> : <TrendingDown className="w-2 h-2 mr-1" />}
                    {Math.abs(node.growth)}%
                  </Badge>
                )}
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{node.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Temporal Trend Mapping */}
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              {t('aiAnalyticsDashboard.temporalTrendMatrix')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('aiAnalyticsDashboard.trendDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-16">
            <div className="flex items-end gap-2 h-48">
              {data.monthlyTrend.map((item, idx) => {
                const height = (item.count / maxMonthlyCount) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-4 group/bar">
                    <div className="relative w-full flex items-end justify-center h-32">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 4)}%` }}
                        transition={{ duration: 1, delay: idx * 0.05 }}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-t-xl group-hover/bar:bg-purple-600/20 group-hover/bar:border-purple-500/30 transition-all duration-500 relative cursor-pointer"
                        title={`${item.month}: ${item.count}`}
                      />
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

        {/* Neural Score Distribution */}
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Shield className="h-6 w-6 text-pink-400" />
              {t('aiAnalyticsDashboard.qualityVectorDistribution')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('aiAnalyticsDashboard.integrityScoreDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-12 space-y-8">
            {[
              { label: t('aiAnalyticsDashboard.scoreCategories.excellent'), val: data.scoreDistribution.excellent, color: 'from-emerald-500 to-teal-600', shadow: 'rgba(16,185,129,0.3)' },
              { label: t('aiAnalyticsDashboard.scoreCategories.good'), val: data.scoreDistribution.good, color: 'from-blue-500 to-indigo-600', shadow: 'rgba(59,130,246,0.3)' },
              { label: t('aiAnalyticsDashboard.scoreCategories.fair'), val: data.scoreDistribution.fair, color: 'from-yellow-500 to-amber-600', shadow: 'rgba(245,158,11,0.3)' },
              { label: t('aiAnalyticsDashboard.scoreCategories.poor'), val: data.scoreDistribution.poor, color: 'from-rose-500 to-red-600', shadow: 'rgba(244,63,94,0.3)' },
            ].map((item, i) => {
              const total = data.scoreDistribution.excellent + data.scoreDistribution.good + data.scoreDistribution.fair + data.scoreDistribution.poor;
              const percentage = total > 0 ? (item.val / total) * 100 : 0;
              return (
                <div key={item.label} className="space-y-3 group/item">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-widest italic">{item.label}</span>
                    <span className="text-lg font-black text-white italic tracking-tighter">{item.val} <span className="text-[10px] text-slate-600 not-italic ml-1">({percentage.toFixed(1)}%)</span></span>
                  </div>
                  <div className="relative h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className={cn("h-full rounded-full", `bg-gradient-to-r ${item.color}`)}
                      style={{ boxShadow: `0 0 15px ${item.shadow}` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Telemetry Interface - Dynamic Modules */}
      <div className="pt-10">
        <Tabs defaultValue="daily" className="space-y-10">
          <div className="flex items-center justify-center">
            <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2">
              {[
                { value: 'daily', icon: Calendar, label: t('aiAnalyticsDashboard.tabs.daily') },
                { value: 'skinTypes', icon: Layers, label: t('aiAnalyticsDashboard.tabs.skinTypes') },
                { value: 'topClinics', icon: Building2, label: t('aiAnalyticsDashboard.tabs.topClinics') },
                { value: 'recent', icon: Brain, label: t('aiAnalyticsDashboard.tabs.recent') }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic h-full"
                >
                  <tab.icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Daily Sync Tab */}
              <TabsContent value="daily" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                      <Activity className="h-6 w-6 text-blue-400" />
                      {t('aiAnalyticsDashboard.temporalSynchronicity')}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('aiAnalyticsDashboard.meanVelocity', { val: data.overview.avgPerDay })}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16">
                    <div className="flex items-end gap-[3px] h-48">
                      {data.dailyTrend.map((item, idx) => {
                        const height = (item.count / maxDailyCount) * 100;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(height, 2)}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.02 }}
                            className="flex-1 bg-blue-500/20 border-t border-blue-500/30 hover:bg-blue-500/40 transition-all cursor-pointer relative group/daily"
                            title={`${item.date}: ${item.count} analyses`}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover/daily:block text-[8px] font-black text-blue-400">{item.count}</div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
                      <span>{t('aiAnalyticsDashboard.stampStart')}: {data.dailyTrend[0]?.date}</span>
                      <span>{t('aiAnalyticsDashboard.stampEnd')}: {data.dailyTrend[data.dailyTrend.length - 1]?.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dermal Matrix Tab */}
              <TabsContent value="skinTypes" className="mt-0 outline-none">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {data.skinTypeDistribution.map((item, idx) => (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-xl overflow-hidden relative text-center p-8">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <Badge className={cn("px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner mb-6", getSkinTypeBadgeColor(item.type))}>
                          {t('aiAnalyticsDashboard.nodeType', { type: item.type })}
                        </Badge>
                        <div className="text-4xl font-black text-white tracking-tighter italic mb-2">{item.count}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{t('aiAnalyticsDashboard.sectorDensity', { percentage: item.percentage })}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Node Ranking Tab */}
              <TabsContent value="topClinics" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.02] border-b border-white/5">
                          <TableHead className="w-20 px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.rank')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.clinicalUplink')}</TableHead>
                          <TableHead className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.cycleCount')}</TableHead>
                          <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.globalShare')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topClinics.map((clinic, idx) => (
                          <TableRow key={clinic.id} className="group/row transition-all duration-500 hover:bg-white/[0.03] border-white/5">
                            <TableCell className="px-10 py-8">
                              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-black italic shadow-inner border border-white/5", idx === 0 ? 'bg-pink-600 text-white shadow-pink-600/40' : 'bg-white/[0.03] text-slate-500')}>
                                0{idx + 1}
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-8">
                              <span className="text-lg font-bold text-white italic group-hover/row:text-pink-400 transition-colors uppercase tracking-tight">{clinic.name}</span>
                            </TableCell>
                            <TableCell className="px-8 py-8 text-right font-black text-white italic tracking-tighter text-xl">
                              {clinic.analysisCount.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-10 py-8 text-right">
                              <Badge variant="outline" className="bg-white/[0.02] border-white/10 text-emerald-400 text-[10px] font-black rounded-lg px-4 py-1 italic">
                                {((clinic.analysisCount / data.overview.totalAnalyses) * 100).toFixed(1)}% Δ
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Latest Inference Tab */}
              <TabsContent value="recent" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.02] border-b border-white/5">
                          <TableHead className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.originNode')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.dermalType')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.integrityIndex')}</TableHead>
                          <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('aiAnalyticsDashboard.temporalStamp')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentAnalyses.map((analysis, idx) => (
                          <motion.tr 
                            key={analysis.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group/row transition-all duration-500 hover:bg-white/[0.03] border-white/5"
                          >
                            <TableCell className="px-10 py-8">
                              <span className="text-base font-bold text-white italic group-hover/row:text-cyan-400 transition-colors">{analysis.clinicName}</span>
                            </TableCell>
                            <TableCell className="px-8 py-8">
                              <Badge className={cn("px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner", getSkinTypeBadgeColor(analysis.skinType))}>
                                {analysis.skinType}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-8 py-8">
                              <div className="flex items-center gap-3">
                                <div className={cn("h-2 w-2 rounded-full animate-pulse", getScoreColor(analysis.overallScore).replace('text-', 'bg-'))} />
                                <span className={cn("text-xl font-black italic tracking-tighter", getScoreColor(analysis.overallScore))}>
                                  {analysis.overallScore}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-10 py-8 text-right">
                              <div className="space-y-1">
                                <div className="text-sm font-bold text-slate-300 italic">{formatDate(analysis.createdAt).split(',')[0]}</div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">{formatDate(analysis.createdAt).split(',')[1]}</p>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
