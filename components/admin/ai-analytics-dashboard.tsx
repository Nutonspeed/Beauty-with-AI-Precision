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
  performance: {
    avgProcessingTime: number;
    providerDistribution: Record<string, number>;
    successRate: number;
    errorCount: number;
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
  topCenters: Array<{ id: string; name: string; analysisCount: number }>;
  recentAnalyses: Array<{
    id: string;
    centerName: string;
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
  const [activeTab, setActiveTab] = useState('daily');

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
    return new Date(dateString).toLocaleString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getSkinTypeBadgeStyles = (type: string) => {
    const colors: Record<string, string> = {
      oily: 'bg-amber-50 text-amber-600',
      dry: 'bg-orange-50 text-orange-600',
      combination: 'bg-purple-50 text-purple-600',
      normal: 'bg-emerald-50 text-emerald-600',
      sensitive: 'bg-rose-50 text-rose-600',
    };
    return colors[type.toLowerCase()] || 'bg-slate-50 text-slate-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Aggregating Inference Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 italic">
        <div className="h-20 w-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-600" />
        </div>
        <p className="text-rose-600 font-black uppercase tracking-widest text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const maxMonthlyCount = Math.max(...data.monthlyTrend.map((m) => m.count), 1);
  const maxDailyCount = Math.max(...data.dailyTrend.map((d) => d.count), 1);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t('aiAnalyticsDashboard.totalNeuralAnalyses' as any) || 'Total Inferences', val: data.overview.totalAnalyses.toLocaleString(), sub: t('aiAnalyticsDashboard.globalSynapseLoad' as any) || 'Network Sequence Load', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: t('aiAnalyticsDashboard.activeCycleLoad' as any) || 'MTD Activity', val: data.overview.analysesThisMonth.toLocaleString(), sub: t('aiAnalyticsDashboard.mtdProcessing' as any) || 'Monthly Throughput', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', growth: data.overview.momGrowth },
          { label: t('aiAnalyticsDashboard.meanIntegrityIndex' as any) || 'Integrity Index', val: data.overview.avgOverallScore.toString(), sub: t('aiAnalyticsDashboard.compositeQualityScore' as any) || 'Average Node Score', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('aiAnalyticsDashboard.verifiedEntities' as any) || 'Entity Nodes', val: data.overview.uniqueUsers.toLocaleString(), sub: t('aiAnalyticsDashboard.uniqueIdentityNodes' as any) || 'Unique Identifiers', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((node, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{node.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                  <node.icon className={cn("h-5 w-5", node.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="flex items-end gap-4">
                  <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{node.val}</div>
                  {node.growth !== undefined && node.growth !== 0 && (
                    <Badge className={cn("px-3 py-1 rounded-full border-none shadow-sm text-[10px] font-black italic mb-1", node.growth > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                      {node.growth > 0 ? '+' : '-'}{Math.abs(node.growth)}% Δ
                    </Badge>
                  )}
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-400 italic group-hover:text-slate-600 transition-colors">{node.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance & Telemetry Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Inference Latency', val: `${data.performance.avgProcessingTime}ms`, sub: 'Mean Processing Time', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Neural response interval' },
          { label: 'Node Reliability', val: `${data.performance.successRate}%`, sub: 'Successful Sequences', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Network integrity coefficient' },
          { label: 'Engine Distribution', val: Object.keys(data.performance.providerDistribution).length.toString(), sub: 'Active Model Nodes', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Hybrid inference cluster' }
        ].map((node, i) => (
          <Card key={i} className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{node.label}</CardTitle>
              <div className={cn("p-2.5 rounded-xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                <node.icon className={cn("h-5 w-5", node.color)} />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{node.val}</div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{node.sub}</p>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">{node.desc}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Temporal Trend Mapping interface */}
        <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-purple-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              {t('aiAnalyticsDashboard.temporalTrendMatrix' as any) || 'Inference_Chronology'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('aiAnalyticsDashboard.trendDesc' as any) || 'Logarithmic analysis of neural activity nodes'}</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-16 bg-white">
            <div className="flex items-end gap-3 h-56 relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01]" />
              {data.monthlyTrend.map((item, idx) => {
                const height = (item.count / maxMonthlyCount) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-6 group/bar relative z-10">
                    <div className="relative w-full flex items-end justify-center h-40">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 6)}%` }}
                        transition={{ duration: 1, delay: idx * 0.05 }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-t-2xl group-hover/bar:bg-purple-50 group-hover/bar:border-purple-200 transition-all duration-500 relative cursor-pointer shadow-inner group-hover/bar:shadow-sm"
                      />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        <Badge className="bg-purple-600 text-white border-none font-black text-[9px] italic px-3 py-1 rounded-lg uppercase tracking-widest">{item.count}</Badge>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 transform -rotate-45 origin-top-left group-hover/bar:text-purple-600 transition-colors italic whitespace-nowrap">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Neural Distribution interface */}
        <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
                <Shield className="h-8 w-8 text-pink-600" />
              </div>
              {t('aiAnalyticsDashboard.qualityVectorDistribution' as any) || 'Index_Distribution'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('aiAnalyticsDashboard.integrityScoreDesc' as any) || 'Yield assessment across global entity nodes'}</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-16 space-y-10 bg-white">
            {[
              { label: t('aiAnalyticsDashboard.scoreCategories.excellent' as any) || 'Nominal_Elite', val: data.scoreDistribution.excellent, color: 'bg-emerald-500 shadow-glow-emerald', bg: 'bg-emerald-50' },
              { label: t('aiAnalyticsDashboard.scoreCategories.good' as any) || 'Operational_High', val: data.scoreDistribution.good, color: 'bg-blue-500 shadow-glow-blue', bg: 'bg-blue-50' },
              { label: t('aiAnalyticsDashboard.scoreCategories.fair' as any) || 'Baseline_Protocol', val: data.scoreDistribution.fair, color: 'bg-amber-500 shadow-glow-amber', bg: 'bg-amber-50' },
              { label: t('aiAnalyticsDashboard.scoreCategories.poor' as any) || 'Inference_Delta', val: data.scoreDistribution.poor, color: 'bg-rose-500 shadow-glow-rose', bg: 'bg-rose-50' },
            ].map((item, i) => {
              const total = data.scoreDistribution.excellent + data.scoreDistribution.good + data.scoreDistribution.fair + data.scoreDistribution.poor;
              const percentage = total > 0 ? (item.val / total) * 100 : 0;
              return (
                <div key={item.label} className="space-y-4 group/item">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 group-hover/item:text-slate-950 transition-colors uppercase tracking-widest italic">{item.label}</span>
                    <span className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{item.val} <span className="text-[9px] text-slate-300 not-italic ml-2">({percentage.toFixed(1)}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5 relative group/bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Telemetry Interface interface */}
      <div className="pt-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <div className="flex items-center justify-center">
            <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
              {[
                { value: 'daily', icon: Calendar, label: 'Temporal_Sync' },
                { value: 'skinTypes', icon: Layers, label: 'Dermal_Matrix' },
                { value: 'topCenters', icon: Building2, label: 'Node_Hierarchy' },
                { value: 'recent', icon: Brain, label: 'Inference_Log' }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full"
                >
                  <tab.icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Temporal Sync Tab interface */}
              <TabsContent value="daily" className="mt-0 outline-none">
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
                    <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                      Temporal Synchronization
                    </CardTitle>
                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Throughput velocity index: <span className="text-blue-600 font-black">{data.overview.avgPerDay} NODES/DAY</span></CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-16 bg-white">
                    <div className="flex items-end gap-[4px] h-56 relative">
                      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
                      {data.dailyTrend.map((item, idx) => {
                        const height = (item.count / maxDailyCount) * 100;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(height, 4)}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.01 }}
                            className="flex-1 bg-slate-50 border-t border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer relative group/daily shadow-inner"
                            title={`${item.date}: ${item.count} inferences`}
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/daily:opacity-100 transition-opacity">
                              <Badge className="bg-blue-600 text-white border-none font-black text-[8px] italic px-2 py-0.5 rounded-md uppercase tracking-widest">{item.count}</Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                      <span className="flex items-center gap-3"><Clock className="h-3 w-3 text-blue-500" /> STAMP_START: {data.dailyTrend[0]?.date}</span>
                      <span className="flex items-center gap-3">STAMP_END: {data.dailyTrend[data.dailyTrend.length - 1]?.date} <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-glow-emerald animate-pulse" /></span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dermal Matrix interface */}
              <TabsContent value="skinTypes" className="mt-0 outline-none">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                  {data.skinTypeDistribution.map((item, idx) => (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] hover:border-pink-500/20 transition-all duration-700 group overflow-hidden relative text-center p-10 flex flex-col items-center justify-between h-full">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Badge className={cn("px-6 py-2 rounded-full border-none shadow-sm text-[10px] font-black uppercase tracking-widest italic mb-8 group-hover:scale-110 transition-transform", getSkinTypeBadgeStyles(item.type))}>
                          {item.type} Node
                        </Badge>
                        <div className="space-y-2">
                          <div className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none group-hover:text-pink-600 transition-colors">{item.count}</div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600 transition-colors">{item.percentage}% Cluster</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Hierarchy interface */}
              <TabsContent value="topCenters" className="mt-0 outline-none">
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-emerald-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-0 bg-slate-50/30">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/50 border-b border-slate-100 hover:bg-white/50">
                          <TableHead className="w-24 px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Rank</TableHead>
                          <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Node_Identity</TableHead>
                          <TableHead className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sequence_Volume</TableHead>
                          <TableHead className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Network_Share</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {data.topCenters.map((center, idx) => (
                          <TableRow key={center.id} className="group/row transition-all duration-500 hover:bg-white relative">
                            <TableCell className="px-10 py-10">
                              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center font-black italic shadow-inner border border-slate-50 transition-all duration-700 group-hover/row:scale-110", idx === 0 ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-slate-50 text-slate-300')}>
                                0{idx + 1}
                              </div>
                            </TableCell>
                            <TableCell className="px-10 py-10">
                              <span className="text-xl font-black text-slate-950 italic group-hover/row:text-pink-600 transition-colors uppercase tracking-tight leading-none">{center.name}</span>
                            </TableCell>
                            <TableCell className="px-10 py-10 text-right">
                              <div className="space-y-1">
                                <p className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{center.analysisCount.toLocaleString()}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Cycles_Verified</p>
                              </div>
                            </TableCell>
                            <TableCell className="px-10 py-10 text-right">
                              <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase italic shadow-sm group-hover/row:scale-110 transition-transform">
                                {((center.analysisCount / data.overview.totalAnalyses) * 100).toFixed(1)}% Yield
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logs interface */}
              <TabsContent value="recent" className="mt-0 outline-none">
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-cyan-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-0 bg-slate-50/30">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/50 border-b border-slate-100 hover:bg-white/50">
                          <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Origin_Node</TableHead>
                          <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Matrix_Protocol</TableHead>
                          <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Integrity_Index</TableHead>
                          <TableHead className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Temporal_Stamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {data.recentAnalyses.map((analysis, idx) => (
                          <motion.tr 
                            key={analysis.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="group/row transition-all duration-500 hover:bg-white relative"
                          >
                            <TableCell className="px-10 py-10">
                              <div className="flex items-center gap-4">
                                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/30 group-hover/row:scale-150 group-hover/row:bg-cyan-600 transition-all shadow-glow-cyan/20" />
                                <span className="text-lg font-black text-slate-950 italic group-hover/row:text-cyan-600 transition-colors uppercase tracking-tight leading-none">{analysis.centerName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-10 py-10">
                              <Badge className={cn("px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic", getSkinTypeBadgeStyles(analysis.skinType))}>
                                {analysis.skinType}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-10 py-10">
                              <div className="flex items-center gap-4">
                                <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse shadow-sm", getScoreColor(analysis.overallScore).replace('text', 'bg'))} />
                                <span className={cn("text-2xl font-black italic tracking-tighter uppercase leading-none", getScoreColor(analysis.overallScore))}>
                                  {analysis.overallScore}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-10 py-10 text-right">
                              <div className="space-y-1">
                                <div className="text-base font-black text-slate-950 italic uppercase tracking-tighter leading-none">{formatDate(analysis.createdAt).split(',')[0]}</div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{formatDate(analysis.createdAt).split(',')[1]}</p>
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
