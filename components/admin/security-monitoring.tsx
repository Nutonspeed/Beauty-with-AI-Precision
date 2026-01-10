'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Activity, 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet, 
  TrendingUp, 
  TrendingDown,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl';
import { PaginationControls } from './pagination-controls';

interface SecurityOverview {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  activeSessions: number;
  blockedIPs: number;
  unresolvedEvents: number;
  averageRiskScore: number;
}

interface RecentEvent {
  id: string;
  eventType: string;
  severity: string;
  timestamp: string;
  userEmail?: string;
  ipAddress?: string;
  description: string;
  resolved: boolean;
}

interface FailedLoginStats {
  email: string;
  ipAddress: string;
  attemptCount: number;
  lastAttempt: string;
  blocked: boolean;
  blockedUntil?: string;
}

interface ActiveSessionData {
  id: string;
  userEmail: string;
  deviceType: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActivity: string;
  duration: number;
}

interface SuspiciousActivityData {
  id: string;
  activityType: string;
  userEmail?: string;
  ipAddress?: string;
  description: string;
  riskScore: number;
  indicators: string[];
  timestamp: string;
  reviewed: boolean;
}

interface SecurityData {
  overview: SecurityOverview;
  recentEvents: RecentEvent[];
  failedLogins: FailedLoginStats[];
  activeSessions: ActiveSessionData[];
  suspiciousActivities: SuspiciousActivityData[];
  eventTypeDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
}

export default function SecurityMonitoring() {
  const t = useTranslations();
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Pagination state for each tab
  const [eventsPage, setEventsPage] = useState(1)
  const [failedLoginsPage, setFailedLoginsPage] = useState(1)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [suspiciousPage, setSuspiciousPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter state
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  // Debounce search to reduce recomputation while typing
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/admin/security-monitoring');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveEvent = async (id: string) => {
    try {
      setActingId(id)
      const res = await fetch('/api/admin/security-monitoring/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast({ title: t('securityMonitoring.stream.resolved'), variant: 'default' })
        await fetchSecurityData()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: t('common.error'), description: err.error || t('common.retry'), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('common.error'), description: t('common.error'), variant: 'destructive' })
    } finally {
      setActingId(null)
    }
  }

  const markReviewed = async (id: string) => {
    try {
      setActingId(id)
      const res = await fetch('/api/admin/security-monitoring/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reviewed: true }),
      })
      if (res.ok) {
        toast({ title: t('securityMonitoring.variance.verified'), variant: 'default' })
        await fetchSecurityData()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: t('common.error'), description: err.error || t('common.retry'), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('common.error'), description: t('common.error'), variant: 'destructive' })
    } finally {
      setActingId(null)
    }
  }

  useEffect(() => {
    fetchSecurityData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return t('ui.time.justNow');
    if (diffMinutes < 60) return t('ui.time.minsAgo', { val: diffMinutes });
    if (diffMinutes < 1440) return t('ui.time.hoursAgo', { val: Math.floor(diffMinutes / 60) });
    return date.toLocaleDateString();
  };

  const paginate = <T,>(items: T[], page: number, size: number) => {
    const start = (page - 1) * size
    const end = start + size
    return {
      items: items.slice(start, end),
      totalPages: Math.ceil(items.length / size),
      total: items.length,
      hasNext: end < items.length,
      hasPrev: page > 1,
    }
  }

  const filterByDateRange = useCallback((timestamp: string) => {
    if (dateRange === 'all') return true
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    switch (dateRange) {
      case '24h': return diffHours <= 24
      case '7d': return diffHours <= 168
      case '30d': return diffHours <= 720
      default: return true
    }
  }, [dateRange])

  // Memoized filtered datasets to avoid repeated computation during render
  const filteredEvents = useMemo(() => {
    if (!data) return [] as RecentEvent[]
    return data.recentEvents.filter(event => {
      const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter
      const q = debouncedQuery.toLowerCase()
      const matchesSearch = !q ||
        event.userEmail?.toLowerCase().includes(q) ||
        event.ipAddress?.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(event.timestamp)
      return matchesSeverity && matchesSearch && matchesDate
    })
  }, [data, severityFilter, debouncedQuery, filterByDateRange])

  const filteredFailedLogins = useMemo(() => {
    if (!data) return [] as FailedLoginStats[]
    const q = debouncedQuery.toLowerCase()
    return data.failedLogins.filter(login => {
      const matchesSearch = !q ||
        login.email.toLowerCase().includes(q) ||
        login.ipAddress.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(login.lastAttempt)
      return matchesSearch && matchesDate
    })
  }, [data, debouncedQuery, filterByDateRange])

  const filteredSessions = useMemo(() => {
    if (!data) return [] as ActiveSessionData[]
    const q = debouncedQuery.toLowerCase()
    return data.activeSessions.filter(session => {
      const matchesSearch = !q ||
        session.userEmail.toLowerCase().includes(q) ||
        session.ipAddress.toLowerCase().includes(q) ||
        session.location.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(session.lastActivity)
      return matchesSearch && matchesDate
    })
  }, [data, debouncedQuery, filterByDateRange])

  const filteredSuspicious = useMemo(() => {
    if (!data) return [] as SuspiciousActivityData[]
    const q = debouncedQuery.toLowerCase()
    return data.suspiciousActivities.filter(activity => {
      const matchesSearch = !q ||
        activity.userEmail?.toLowerCase().includes(q) ||
        activity.ipAddress?.toLowerCase().includes(q) ||
        activity.description.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(activity.timestamp)
      return matchesSearch && matchesDate
    })
  }, [data, debouncedQuery, filterByDateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t('common.loading')}...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{t('securityMonitoring.errorFetch')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Nodes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('securityMonitoring.overview.securityProtocols'), val: data.overview.totalEvents, sub: t('securityMonitoring.overview.globalIncidentLedger'), icon: Shield, color: 'text-white', bg: 'bg-white/5' },
          { label: t('securityMonitoring.overview.breachThreshold'), val: data.overview.failedLogins, sub: t('securityMonitoring.overview.authFailureIntensity'), icon: Lock, color: 'text-rose-400', bg: 'bg-rose-500/10', badge: data.overview.blockedIPs > 0, badgeText: t('securityMonitoring.overview.blockedVectors', { count: data.overview.blockedIPs }) },
          { label: t('securityMonitoring.overview.activeSessionMatrix'), val: data.overview.activeSessions, sub: t('securityMonitoring.overview.verifiedUplinks'), icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('securityMonitoring.overview.riskScore'), val: data.overview.averageRiskScore, sub: t('securityMonitoring.overview.riskIndex'), icon: AlertTriangle, color: getRiskColor(data.overview.averageRiskScore), bg: 'bg-white/[0.03]' }
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
              <div className="mt-2">
                {node.badge ? (
                  <Badge variant="destructive" className="px-2 py-0 h-4 rounded-full text-[7px] font-black uppercase tracking-tighter">
                    {node.badgeText}
                  </Badge>
                ) : (
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{node.sub}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Alert Vector */}
      {data.overview.unresolvedEvents > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-rose-500/20 bg-rose-500/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(244,63,94,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <AlertTriangle className="w-32 h-32 text-rose-500" />
            </div>
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                  <Shield className="h-8 w-8 text-rose-400 animate-pulse" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 italic">{t('securityMonitoring.overview.unresolvedVariance')}</p>
                  <h3 className="text-3xl font-black text-white tracking-tighter italic">{t('securityMonitoring.overview.criticalNodes', { count: data.overview.unresolvedEvents })}</h3>
                  <p className="text-sm text-slate-500 font-light italic leading-relaxed">{t('securityMonitoring.overview.mitigationDesc')}</p>
                </div>
              </div>
              <Button variant="destructive" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-500/20">
                {t('securityMonitoring.overview.initiateMitigation')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Operational Controls & Filtering */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <CardContent className="p-8">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex-1 min-w-[300px] relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within/search:text-pink-500 transition-colors" />
              <Input
                placeholder={t('securityMonitoring.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setEventsPage(1)
                  setFailedLoginsPage(1)
                  setSessionsPage(1)
                  setSuspiciousPage(1)
                }}
                className="h-14 pl-12 pr-6 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all font-bold italic"
              />
            </div>
            
            <div className="flex gap-3 items-center bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
              {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range)
                    setEventsPage(1)
                    setFailedLoginsPage(1)
                    setSessionsPage(1)
                    setSuspiciousPage(1)
                  }}
                  className={cn(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-500",
                    dateRange === range ? "bg-pink-600 text-white shadow-lg italic" : "text-slate-600 hover:text-slate-300"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-center bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setSeverityFilter(level)
                    setEventsPage(1)
                    setSuspiciousPage(1)
                  }}
                  className={cn(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-500",
                    severityFilter === level ? "bg-white text-[#020617] italic" : "text-slate-600 hover:text-slate-300"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Telemetry Interface */}
      <Tabs defaultValue="events" className="space-y-10">
        <div className="flex items-center justify-center">
          <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2 flex-wrap justify-center">
            {[
              { value: 'events', icon: Shield, label: t('securityMonitoring.tabs.incidentStream') },
              { value: 'failed-logins', icon: Lock, label: t('securityMonitoring.tabs.authFailureLog') },
              { value: 'sessions', icon: Activity, label: t('securityMonitoring.tabs.sessionMatrix') },
              { value: 'suspicious', icon: AlertTriangle, label: t('securityMonitoring.tabs.varianceDetection') }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="rounded-xl px-8 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic h-full flex items-center gap-3"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <TabsContent value="events" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('securityMonitoring.stream.title')}</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('securityMonitoring.stream.desc')}</CardDescription>
                  </div>
                  <Badge variant="outline" className="h-8 rounded-full px-4 border-white/10 text-slate-500 text-[10px] font-black italic">
                    {t('securityMonitoring.stream.vectorsDetected', { count: filteredEvents.length })}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.02] border-b border-white/5">
                          <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.stream.severity')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.stream.eventProtocol')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.stream.entityNode')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.stream.description')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.stream.status')}</TableHead>
                          <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.stream.temporalStamp')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-white/5">
                        {filteredEvents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-20 text-slate-600 uppercase tracking-[0.4em] font-black text-[10px] italic">
                              {t('securityMonitoring.stream.noVectors')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginate(filteredEvents, eventsPage, pageSize).items.map((event) => (
                            <TableRow key={event.id} className="group/row transition-all duration-500 hover:bg-white/[0.03] border-white/5">
                              <TableCell className="px-10 py-8">
                                <Badge variant={getSeverityColor(event.severity) as any} className="px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                  {event.severity}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-8 py-8">
                                <span className="text-sm font-bold text-white italic group-hover/row:text-pink-400 transition-colors">
                                  {event.eventType.replaceAll('_', ' ').toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell className="px-8 py-8">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-slate-300 italic">{event.userEmail || 'NULL_ENTITY'}</div>
                                  <p className="text-[9px] font-black text-slate-600 font-mono">{event.ipAddress || 'NULL_NODE'}</p>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-8">
                                <span className="text-xs text-slate-400 leading-relaxed italic">{event.description}</span>
                              </TableCell>
                              <TableCell className="px-8 py-8">
                                {event.resolved ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none shadow-inner text-[8px] font-black italic rounded-full px-3 py-0.5">{t('securityMonitoring.stream.resolved').toUpperCase()}</Badge>
                                ) : (
                                  <Button size="sm" variant="outline" className="h-8 rounded-xl border-rose-500/30 bg-rose-500/5 text-rose-400 text-[8px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white" disabled={actingId === event.id} onClick={() => resolveEvent(event.id)}>
                                    {actingId === event.id ? t('securityMonitoring.stream.processing') : t('securityMonitoring.stream.mitigate').toUpperCase()}
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell className="px-10 py-8 text-right">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-slate-300 italic">{formatTimestamp(event.timestamp)}</div>
                                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('securityMonitoring.stream.temporalVector')}</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="p-8 border-t border-white/5">
                    <PaginationControls 
                      page={eventsPage}
                      totalPages={paginate(filteredEvents, eventsPage, pageSize).totalPages}
                      pageSize={pageSize}
                      onPageChange={setEventsPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="failed-logins" className="mt-0 outline-none">
              {/* Similar overhaul for Failed Logins Table */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('securityMonitoring.authLog.title')}</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('securityMonitoring.authLog.desc')}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white/[0.02] border-b border-white/5">
                        <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.authLog.entityIdentifier')}</TableHead>
                        <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.authLog.originNode')}</TableHead>
                        <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.authLog.intensity')}</TableHead>
                        <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.authLog.status')}</TableHead>
                        <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.authLog.lastInteraction')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                      {filteredFailedLogins.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-600 font-black italic">{t('securityMonitoring.authLog.noFailures')}</TableCell></TableRow>
                      ) : (
                        paginate(filteredFailedLogins, failedLoginsPage, pageSize).items.map((login) => (
                          <TableRow key={`${login.email}-${login.ipAddress}`} className="group/row transition-all hover:bg-white/[0.03]">
                            <TableCell className="px-10 py-8 text-sm font-bold text-white italic">{login.email}</TableCell>
                            <TableCell className="px-8 py-8 font-mono text-xs text-slate-500">{login.ipAddress}</TableCell>
                            <TableCell className="px-8 py-8">
                              <Badge variant={login.attemptCount >= 5 ? 'destructive' : 'secondary'} className="px-3 py-0.5 rounded-full text-[8px] font-black italic">
                                {t('securityMonitoring.authLog.attempts', { count: login.attemptCount })}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-8 py-8">
                              {login.blocked ? (
                                <Badge className="bg-rose-500/10 text-rose-400 border-none italic text-[8px] rounded-full px-3">{t('securityMonitoring.authLog.blockedNode').toUpperCase()}</Badge>
                              ) : (
                                <Badge className="bg-blue-500/10 text-blue-400 border-none italic text-[8px] rounded-full px-3">{t('securityMonitoring.authLog.monitoring').toUpperCase()}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="px-10 py-8 text-right text-sm font-bold text-slate-300 italic">{formatTimestamp(login.lastAttempt)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <div className="p-8 border-t border-white/5">
                    <PaginationControls 
                      page={failedLoginsPage}
                      totalPages={paginate(filteredFailedLogins, failedLoginsPage, pageSize).totalPages}
                      pageSize={pageSize}
                      onPageChange={setFailedLoginsPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('securityMonitoring.sessions.title')}</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('securityMonitoring.sessions.desc')}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white/[0.02] border-b border-white/5">
                        <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.sessions.entity')}</TableHead>
                        <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.sessions.deviceBrowser')}</TableHead>
                        <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.sessions.geoVector')}</TableHead>
                        <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.sessions.temporalDuration')}</TableHead>
                        <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.sessions.lastActivity')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                      {filteredSessions.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-600 font-black italic">{t('securityMonitoring.sessions.noUplinks')}</TableCell></TableRow>
                      ) : (
                        paginate(filteredSessions, sessionsPage, pageSize).items.map((session) => (
                          <TableRow key={session.id} className="group/row transition-all hover:bg-white/[0.03]">
                            <TableCell className="px-10 py-8 text-sm font-bold text-white italic">{session.userEmail}</TableCell>
                            <TableCell className="px-8 py-8">
                              <div className="flex items-center gap-3">
                                {getDeviceIcon(session.deviceType)}
                                <span className="text-[10px] font-black uppercase text-slate-400">{session.deviceType} / {session.browser}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-8">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 italic uppercase">
                                <Globe className="h-3 w-3 text-cyan-500" /> {session.location} <span className="text-[10px] text-slate-600 font-mono ml-2">[{session.ipAddress}]</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-8 text-sm font-black text-white italic tracking-tighter">{session.duration}m</TableCell>
                            <TableCell className="px-10 py-8 text-right text-sm font-bold text-slate-300 italic">{formatTimestamp(session.lastActivity)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <div className="p-8 border-t border-white/5">
                    <PaginationControls 
                      page={sessionsPage}
                      totalPages={paginate(filteredSessions, sessionsPage, pageSize).totalPages}
                      pageSize={pageSize}
                      onPageChange={setSessionsPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suspicious" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('securityMonitoring.variance.title')}</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('securityMonitoring.variance.desc')}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white/[0.02] border-b border-white/5">
                          <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.variance.riskVector')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.variance.protocolType')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.variance.entityNode')}</TableHead>
                          <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.variance.status')}</TableHead>
                          <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('securityMonitoring.variance.temporalStamp')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-white/5">
                        {filteredSuspicious.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-600 font-black italic uppercase tracking-[0.4em]">{t('securityMonitoring.variance.noAnomalies')}</TableCell></TableRow>
                        ) : (
                          paginate(filteredSuspicious, suspiciousPage, pageSize).items.map((activity) => (
                            <TableRow key={activity.id} className="group/row transition-all hover:bg-white/[0.03]">
                              <TableCell className="px-10 py-8">
                                <div className={cn("flex items-center gap-3 text-xl font-black italic tracking-tighter", getRiskColor(activity.riskScore))}>
                                  {activity.riskScore >= 50 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                  {activity.riskScore}%
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-8">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-white italic uppercase">{activity.activityType.replaceAll('_', ' ')}</div>
                                  <Badge variant="outline" className="h-5 text-[7px] font-black border-white/10 text-slate-500 uppercase">{t('securityMonitoring.variance.analyticIndicators', { count: activity.indicators.length })}</Badge>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-8">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-slate-300 italic">{activity.userEmail || 'NULL_ENTITY'}</div>
                                  <p className="text-[9px] font-black text-slate-600 font-mono">{activity.ipAddress || 'NULL_NODE'}</p>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-8">
                                {activity.reviewed ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none italic text-[8px] rounded-full px-3">{t('securityMonitoring.variance.verified').toUpperCase()}</Badge>
                                ) : (
                                  <Button size="sm" variant="outline" className="h-8 rounded-xl border-amber-500/30 bg-amber-500/5 text-amber-400 text-[8px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-[#020617]" disabled={actingId === activity.id} onClick={() => markReviewed(activity.id)}>
                                    {actingId === activity.id ? t('securityMonitoring.stream.processing') : t('securityMonitoring.variance.markReviewed').toUpperCase()}
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell className="px-10 py-8 text-right text-sm font-bold text-slate-300 italic">{formatTimestamp(activity.timestamp)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="p-8 border-t border-white/5">
                    <PaginationControls 
                      page={suspiciousPage}
                      totalPages={paginate(filteredSuspicious, suspiciousPage, pageSize).totalPages}
                      pageSize={pageSize}
                      onPageChange={setSuspiciousPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
