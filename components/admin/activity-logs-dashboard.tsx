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
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [centerFilter, setCenterFilter] = useState('all');
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
      if (centerFilter !== 'all') params.append('centerId', centerFilter);

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
  }, [typeFilter, clinicFilter, offset]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_analysis': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'booking': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'user': return <Users className="h-4 w-4 text-green-500" />;
      case 'center': return <Building2 className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      ai_analysis: 'bg-purple-100 text-purple-700',
      booking: 'bg-blue-100 text-blue-700',
      user: 'bg-green-100 text-green-700',
      center: 'bg-orange-100 text-orange-700',
    };
    return variants[type] || 'bg-gray-100 text-gray-700';
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('activityLogsDashboard.totalEventRegistry'), val: stats?.totalActivities || 0, sub: t('activityLogsDashboard.globalActivityNodes'), icon: Activity, color: 'text-white', bg: 'bg-white/5' },
          { label: t('activityLogsDashboard.temporalCyclesToday'), val: stats?.todayActivities || 0, sub: t('activityLogsDashboard.realtimeThroughput'), icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('activityLogsDashboard.weeklyDelta'), val: stats?.weekActivities || 0, sub: t('activityLogsDashboard.cumulativeFlow'), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: t('activityLogsDashboard.neuralInferences'), val: stats?.byType?.ai_analysis || 0, sub: t('activityLogsDashboard.aiCoreProcessing'), icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' }
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
              <div className="text-3xl font-black text-white tracking-tighter italic">{node.val.toLocaleString()}</div>
              <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{node.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Sector Distribution */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Layers className="h-6 w-6 text-cyan-400" />
            {t('activityLogsDashboard.eventSectorMatrix')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('activityLogsDashboard.sectorBreakdownDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { type: 'ai_analysis', label: t('activityLogsDashboard.neuralInferences'), icon: Brain, color: 'purple', val: stats?.byType?.ai_analysis || 0 },
              { type: 'booking', label: t('activityLogsDashboard.clinicalCycles'), icon: Calendar, color: 'blue', val: stats?.byType?.booking || 0 },
              { type: 'user', label: t('activityLogsDashboard.entityRegistry'), icon: Users, color: 'green', val: stats?.byType?.user || 0 },
              { type: 'center', label: t('activityLogsDashboard.nodeAllocation'), icon: Building2, color: 'orange', val: stats?.byType?.center || 0 },
            ].map(({ type, label, icon: Icon, color, val }) => (
              <div key={type} className="flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-500 group/sector">
                <div className={cn("p-3 rounded-2xl border border-white/5 shadow-inner transition-transform duration-700 group-hover/sector:scale-110", `bg-${color}-500/10`)}>
                  <Icon className={cn("h-6 w-6", `text-${color}-400`)} />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white italic tracking-tighter">{val.toLocaleString()}</div>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Primary Log Registry */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white tracking-tight italic">{t('activityLogsDashboard.temporalLogStream')}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('activityLogsDashboard.immutableLedgerDesc')}</CardDescription>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
                <Input
                  placeholder={t('activityLogsDashboard.searchVectorStream')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 pl-12 pr-6 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all text-sm font-bold italic w-[240px]"
                />
              </div>

              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setOffset(0); }}>
                <SelectTrigger className="h-14 w-[160px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
                  <SelectValue placeholder={t('activityLogsDashboard.filterProtocol')} />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('activityLogsDashboard.globalStream')}</SelectItem>
                  <SelectItem value="ai_analysis" className="text-[10px] font-black uppercase tracking-widest italic">{t('activityLogsDashboard.neuralInference')}</SelectItem>
                  <SelectItem value="booking" className="text-[10px] font-black uppercase tracking-widest italic">{t('activityLogsDashboard.clinicalCycle')}</SelectItem>
                  <SelectItem value="user" className="text-[10px] font-black uppercase tracking-widest italic">{t('activityLogsDashboard.identityAuth')}</SelectItem>
                  <SelectItem value="center" className="text-[10px] font-black uppercase tracking-widest italic">{t('activityLogsDashboard.nodeAllocation')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={centerFilter} onValueChange={(v) => { setCenterFilter(v); setOffset(0); }}>
                <SelectTrigger className="h-14 w-[180px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
                  <SelectValue placeholder={t('activityLogsDashboard.originNode')} />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl max-h-[300px]">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('activityLogsDashboard.globalNetwork')}</SelectItem>
                  {centers.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase tracking-widest italic">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10" onClick={fetchActivities}>
                <RefreshCw className={cn("h-4 w-4 text-slate-400", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/[0.02] border-b border-white/5">
                  <TableHead className="w-20 px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('activityLogsDashboard.type')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('activityLogsDashboard.eventDescription')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('activityLogsDashboard.entityOrigin')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('activityLogsDashboard.sourceNode')}</TableHead>
                  <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('activityLogsDashboard.temporalStamp')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-600 uppercase tracking-[0.4em] font-black text-[10px] italic">
                      {t('activityLogsDashboard.noEventsDetected')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity, idx) => (
                    <motion.tr 
                      key={activity.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group/row transition-all duration-500 hover:bg-white/[0.03]"
                    >
                      <TableCell className="px-10 py-8">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-transform duration-700 group-hover/row:scale-110", getTypeBadge(activity.type).replace('text-', 'bg-opacity-10 bg-'))}>
                          {getTypeIcon(activity.type)}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="space-y-2">
                          <span className="text-sm font-bold text-white italic group-hover/row:text-pink-400 transition-colors leading-relaxed">{activity.description}</span>
                          <Badge className={cn("block w-fit px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner", getTypeBadge(activity.type).replace('bg-', 'bg-opacity-10 text-').replace('100', '400'))}>
                            {activity.action.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-300 italic group-hover/row:text-white transition-colors">{activity.userName}</span>
                          {activity.userEmail && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{activity.userEmail}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-xs font-black text-slate-400 italic uppercase tracking-tighter">{activity.centerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 py-8 text-right">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-300 italic">{formatDate(activity.createdAt).split(',')[0]}</div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{formatDate(activity.createdAt).split(',')[1]}</p>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Telemetry */}
          <div className="p-10 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
              {t('activityLogsDashboard.streamingIdentityMatrix', { range: `${offset + 1} — ${Math.min(offset + limit, total)}`, total })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 h-12 px-6 hover:bg-white/10 transition-all"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('activityLogsDashboard.previousSector')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 h-12 px-6 hover:bg-white/10 transition-all"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">{t('activityLogsDashboard.nextSector')}</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
