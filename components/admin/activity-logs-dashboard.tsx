'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Brain,
  Calendar,
  Building2,
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Layers,
  TrendingUp,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  description: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  centerId: string | null;
  centerName: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface Stats {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  byType: {
    ai_analysis: number;
    booking: number;
    user: number;
    center: number;
  };
}

interface Center {
  id: string;
  name: string;
}

export default function ActivityLogsDashboard() {
  const t = useTranslations();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [_centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [_centerFilter, _setCenterFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (typeFilter !== 'all') params.append('action', typeFilter);
      if (_centerFilter !== 'all') params.append('centerId', _centerFilter);

      const res = await fetch(`/api/admin/activity-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setActivities(data.activities || []);
      setStats(data.stats || null);
      setCenters(data.centers || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, _centerFilter, offset]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_analysis': return <Brain className="h-4 w-4 text-purple-600" />;
      case 'booking': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'user': return <Users className="h-4 w-4 text-pink-600" />;
      case 'center': return <Building2 className="h-4 w-4 text-emerald-600" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTypeBadgeStyles = (type: string) => {
    const variants: Record<string, string> = {
      ai_analysis: 'bg-purple-50 text-purple-600',
      booking: 'bg-blue-50 text-blue-600',
      user: 'bg-pink-50 text-pink-600',
      center: 'bg-emerald-50 text-emerald-600',
    };
    return variants[type] || 'bg-slate-50 text-slate-400';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredActivities = activities.filter(a =>
    searchTerm === '' ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.centerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t('activityLogsDashboard.totalEventRegistry' as any) || 'Total Events', val: stats?.totalActivities || 0, sub: t('activityLogsDashboard.globalActivityNodes' as any) || 'Operational Nodes', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('activityLogsDashboard.temporalCyclesToday' as any) || 'Daily Cycles', val: stats?.todayActivities || 0, sub: t('activityLogsDashboard.realtimeThroughput' as any) || 'Real-time Flux', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('activityLogsDashboard.weeklyDelta' as any) || 'Weekly Delta', val: stats?.weekActivities || 0, sub: t('activityLogsDashboard.cumulativeFlow' as any) || 'Aggregated Stream', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('activityLogsDashboard.neuralInferences' as any) || 'Neural Syncs', val: stats?.byType?.ai_analysis || 0, sub: t('activityLogsDashboard.aiCoreProcessing' as any) || 'Inference Load', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((node, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{node.label}</CardTitle>
                <div className={cn("p-2.5 rounded-xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                  <node.icon className={cn("h-5 w-5", node.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{node.val.toLocaleString()}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-400 italic group-hover:text-slate-600 transition-colors">{node.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity Sector Distribution */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
                  <Layers className="h-8 w-8 text-blue-600" />
                </div>
                {t('activityLogsDashboard.eventSectorMatrix' as any) || 'Event_Sector_Matrix'}
              </CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('activityLogsDashboard.sectorBreakdownDesc' as any) || 'Biometric and operational node distribution'}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 lg:p-12 bg-slate-50/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { type: 'ai_analysis', label: t('activityLogsDashboard.neuralInferences' as any) || 'Neural Sync', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', val: stats?.byType?.ai_analysis || 0 },
              { type: 'booking', label: t('activityLogsDashboard.aestheticCycles' as any) || 'Aesthetic Cycle', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', val: stats?.byType?.booking || 0 },
              { type: 'user', label: t('activityLogsDashboard.entityRegistry' as any) || 'Identity Node', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', val: stats?.byType?.user || 0 },
              { type: 'center', label: t('activityLogsDashboard.nodeAllocation' as any) || 'Network Uplink', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', val: stats?.byType?.center || 0 },
            ].map(({ type, label, icon: Icon, color, bg, val }) => (
              <div key={type} className="flex flex-col items-center gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-pink-500/20 transition-all duration-700 group/sector shadow-sm">
                <div className={cn("p-4 rounded-2xl border border-slate-50 shadow-inner transition-all duration-700 group-hover/sector:scale-110 group-hover/sector:bg-white", bg)}>
                  <Icon className={cn("h-8 w-8", color)} />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{val.toLocaleString()}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/sector:text-pink-600 transition-colors">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Primary Log Registry interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('activityLogsDashboard.temporalLogStream' as any) || 'Temporal_Protocol_Ledger'}</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('activityLogsDashboard.immutableLedgerDesc' as any) || 'Authorized immutable event synchronization'}</CardDescription>
            </div>
            
            <div className="flex gap-4 flex-wrap justify-center">
              <div className="relative group/search">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within/search:text-pink-600 transition-colors" />
                <Input
                  placeholder={t('activityLogsDashboard.searchVectorStream' as any) || 'Search_Stream_Nodes...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 pl-14 pr-8 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all text-sm font-bold italic w-[280px] shadow-inner"
                />
              </div>

              <div className="flex gap-4">
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setOffset(0); }}>
                  <SelectTrigger className="h-14 w-[180px] rounded-2xl border-slate-100 bg-slate-50 px-6 text-[10px] font-black uppercase tracking-widest text-slate-950 focus:ring-pink-500/10 appearance-none transition-all italic shadow-inner">
                    <SelectValue placeholder="Protocol_Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                    <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Global_Stream</SelectItem>
                    <SelectItem value="ai_analysis" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Neural_Inference</SelectItem>
                    <SelectItem value="booking" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Aesthetic_Cycle</SelectItem>
                    <SelectItem value="user" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Identity_Auth</SelectItem>
                    <SelectItem value="center" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Node_Allocation</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white hover:border-pink-500/20 transition-all shadow-inner group/refresh" onClick={fetchActivities}>
                  <RefreshCw className={cn("h-5 w-5 text-slate-300 group-hover/refresh:text-pink-600 transition-all", loading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-slate-50/30">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50 border-b border-slate-100 hover:bg-white/50">
                  <TableHead className="w-24 px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Type</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Event_Description</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Entity_Origin</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Node</TableHead>
                  <TableHead className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Temporal_Stamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-32 text-slate-300 uppercase tracking-[0.5em] font-black text-[11px] italic">
                        No_Events_Detected_In_Stream
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity, idx) => (
                      <motion.tr 
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group/row transition-all duration-500 hover:bg-white relative"
                      >
                        <TableCell className="px-10 py-10">
                          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border border-slate-50 shadow-inner transition-all duration-700 group-hover/row:scale-110", getTypeBadgeStyles(activity.type))}>
                            {getTypeIcon(activity.type)}
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="space-y-3">
                            <span className="text-base font-black text-slate-950 italic group-hover/row:text-pink-600 transition-colors leading-relaxed uppercase tracking-tight">{activity.description}</span>
                            <div className="flex items-center gap-3">
                              <Badge className={cn("block w-fit px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm italic", getTypeBadgeStyles(activity.type))}>
                                {activity.action.replace(/_/g, ' ')}
                              </Badge>
                              <div className="h-px w-8 bg-slate-100 group-hover/row:w-12 group-hover/row:bg-pink-200 transition-all duration-700" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="space-y-1.5 group/entity cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 group-hover/row:bg-blue-600 transition-all shadow-glow-blue/20" />
                              <span className="text-base font-black text-slate-950 italic group-hover/row:text-blue-600 transition-colors uppercase tracking-tight leading-none">{activity.userName}</span>
                            </div>
                            {activity.userEmail && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4.5 block">{activity.userEmail}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-4 group/node cursor-pointer">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shadow-inner group-hover/row:bg-pink-50 transition-all">
                              <Building2 className="h-4 w-4 text-slate-300 group-hover/row:text-pink-600" />
                            </div>
                            <span className="text-sm font-black text-slate-500 italic uppercase tracking-tighter group-hover/row:text-slate-950 transition-colors">{activity.centerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10 text-right">
                          <div className="space-y-1">
                            <div className="text-base font-black text-slate-950 italic uppercase tracking-tighter leading-none">{formatDate(activity.createdAt).split(',')[0]}</div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{formatDate(activity.createdAt).split(',')[1]}</p>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Pagination Telemetry interface */}
          <div className="p-10 border-t border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <Info className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                {t('activityLogsDashboard.streamingIdentityMatrix' as any || 'Sequence_Registry_Index')}: <span className="text-slate-950">{offset + 1} — {Math.min(offset + limit, total)}</span> <span className="text-slate-200 mx-2">//</span> TOTAL_NODES: <span className="text-pink-600">{total}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-slate-200 bg-white h-14 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-3" />
                Prev_Sector
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-slate-200 bg-white h-14 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                Next_Sector
                <ChevronRight className="h-4 w-4 ml-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
