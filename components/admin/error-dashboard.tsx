/**
 * Error Dashboard Component
 * Admin interface for viewing and managing error logs
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RefreshCw,
  Download,
  Filter,
  X,
  Zap,
  Activity,
  Search,
  Eye,
  Globe,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface ErrorLog {
  id: string;
  user_id: string | null;
  error_message: string;
  error_stack: string | null;
  component_stack: string | null;
  url: string;
  user_agent: string;
  severity: 'error' | 'warning' | 'info';
  context: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
}

interface ErrorStats {
  total: number;
  last24h: number;
  bySeverity: {
    error: number;
    warning: number;
    info: number;
  };
}

interface ErrorDashboardProps {
  locale?: string;
}

export function ErrorDashboard({ locale: propLocale = 'th' }: ErrorDashboardProps) {
  const t = useTranslations();
  const currentLocale = useLocale();
  const displayLocale = propLocale || currentLocale;

  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'all') {
        params.append('severity', severityFilter);
      }

      const response = await fetch(`/api/errors/log?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch error logs');
      }

      setLogs(data.data.logs || []);
      setStats(data.data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [severityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-slate-400" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-rose-50 text-rose-600 border-none';
      case 'warning':
        return 'bg-amber-50 text-amber-600 border-none';
      case 'info':
        return 'bg-blue-50 text-blue-600 border-none';
      default:
        return 'bg-slate-50 text-slate-400 border-none';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(displayLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Severity', 'Message', 'URL', 'User ID'];
    const rows = logs.map(log => [
      log.created_at,
      log.severity,
      log.error_message.replace(/,/g, ';'), // Escape commas
      log.url,
      log.user_id || 'Anonymous',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-delta-log-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Error Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Telemetry Actions interface */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center justify-center md:justify-start gap-6 uppercase leading-none">
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
              <Activity className="w-8 h-8 text-rose-600 animate-pulse" />
            </div>
            {t('errorDashboard.title' as any) || 'Fault_Diagnostic_Terminal'}
          </h2>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            {t('errorDashboard.subtitle' as any) || 'Real-time system anomaly monitoring'}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-3 h-4 w-4 text-blue-600" />
            {t('filters.title' as any || 'FILTER_VECTOR')}
          </Button>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all" onClick={fetchLogs}>
            <RefreshCw className={cn("mr-3 h-4 w-4 text-pink-600", loading && "animate-spin")} />
            {t('actions.refresh' as any || 'SYNC_STREAM')}
          </Button>
          <Button variant="premium" className="h-14 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={exportToCSV} disabled={logs.length === 0}>
            <Download className="mr-3 h-4 w-4" />
            SCHEMA_EXPORT
          </Button>
        </div>
      </div>

      {/* Overview Metrics Grid - Operational Nodes */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: t('errorDashboard.stats.cumulativeVariance' as any) || 'Total Variance', val: stats.total, sub: 'Registry Nodes', icon: Activity, color: 'text-slate-950', bg: 'bg-slate-50' },
            { label: t('errorDashboard.stats.temporalPeak' as any) || 'Temporal Peak', val: stats.last24h, sub: 'Active 24h Flux', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Critical Breaches', val: stats.bySeverity.error || 0, sub: 'Immediate Sync Required', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'State Warnings', val: stats.bySeverity.warning || 0, sub: 'Variance Detected', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Nominal Logs', val: stats.bySeverity.info || 0, sub: 'Standard Telemetry', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' }
          ].map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                  <CardTitle className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{node.label}</CardTitle>
                  <div className={cn("p-2 rounded-xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                    <node.icon className={cn("h-4 w-4", node.color)} />
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">{node.val.toLocaleString()}</div>
                  <p className="text-[8px] font-black uppercase tracking-widest mt-3 text-slate-400 italic group-hover:text-slate-600 transition-colors">{node.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters interface */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="border-slate-100 bg-slate-50/30 shadow-inner rounded-[3rem] relative group">
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100 bg-white/50">
                <CardTitle className="text-xl font-black text-slate-950 italic tracking-tighter flex items-center gap-4 uppercase leading-none">
                  <Search className="h-5 w-5 text-blue-600" />
                  Sector Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 flex gap-8 items-end bg-white/30">
                <div className="flex-1 space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ml-4 leading-none">{t('errorDashboard.filters.severityVector' as any || 'SEVERITY_VECTOR')}</Label>
                  <div className="relative group/sel">
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="h-16 w-full rounded-2xl border border-slate-100 bg-white px-8 text-sm font-black italic text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer uppercase shadow-sm"
                    >
                      <option value="all">Global_Protocol</option>
                      <option value="error">Error_Breach</option>
                      <option value="warning">Warning_Variance</option>
                      <option value="info">Info_Telemetry</option>
                    </select>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/sel:text-pink-600 transition-colors">
                      <ChevronRight className="h-5 w-5 transform rotate-90" />
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-slate-50 transition-all" onClick={() => setSeverityFilter('all')}>
                  <X className="h-4 w-4 mr-3 text-rose-600" />
                  Clear_Filter
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Log Stream interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('errorDashboard.table.title' as any) || 'Fault_Log_Stream'}</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Synchronizing immutable system anomalies <span className="text-pink-600 opacity-40 ml-4">[{logs.length} EVENTS]</span></CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                  <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Temporal_Stamp</TableHead>
                  <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Severity</TableHead>
                  <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Exception_Message</TableHead>
                  <TableHead className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Source_Node</TableHead>
                  <TableHead className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-40 text-slate-300 uppercase tracking-[0.5em] font-black text-[11px] italic">
                        NO_ANOMALIES_DETECTED_IN_SECTOR
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log, idx) => (
                      <motion.tr 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group/row transition-all duration-500 hover:bg-slate-50 relative"
                      >
                        <TableCell className="px-10 py-10">
                          <div className="space-y-1">
                            <div className="text-base font-black text-slate-950 italic uppercase tracking-tighter leading-none">{formatDate(log.created_at).split(',')[0]}</div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{formatDate(log.created_at).split(',')[1]}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-4">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-slate-50 shadow-inner transition-all duration-700 group-hover/row:scale-110", getSeverityStyles(log.severity))}>
                              {getSeverityIcon(log.severity)}
                            </div>
                            <Badge className={cn("px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm italic leading-none", getSeverityStyles(log.severity))}>
                              {log.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <span className="text-base font-black text-slate-950 italic group-hover/row:text-pink-600 transition-colors leading-relaxed line-clamp-2 max-w-lg uppercase tracking-tight">{log.error_message}</span>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-4 group/node cursor-pointer">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shadow-inner group-hover/row:bg-blue-50 transition-all">
                              <Globe className="h-4 w-4 text-slate-300 group-hover/row:text-blue-600" />
                            </div>
                            <span className="text-sm font-black text-slate-500 italic uppercase tracking-tighter group-hover/row:text-slate-950 transition-colors truncate max-w-[200px]">{log.url}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10 text-right">
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-300 hover:text-pink-600 transition-all duration-500 shadow-inner group/btn" onClick={() => setSelectedLog(log)}>
                            <Eye className="h-6 w-6" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Error Details Modal interface */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <Card className="border-slate-100 bg-white rounded-[4rem] shadow-premium flex flex-col h-full relative group overflow-hidden selection:bg-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-12 lg:p-16 border-b border-slate-50 bg-slate-50/30 shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className={cn("p-4 rounded-2xl border border-white shadow-premium transition-transform group-hover:scale-110 duration-700", getSeverityStyles(selectedLog.severity))}>
                          {getSeverityIcon(selectedLog.severity)}
                        </div>
                        <Badge className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border-none shadow-sm italic leading-none", getSeverityStyles(selectedLog.severity))}>
                          {selectedLog.severity.toUpperCase()}_PROTOCOL_BREACH
                        </Badge>
                      </div>
                      <CardTitle className="text-4xl lg:text-6xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('details.title' as any || 'Fault_Inference_Log')}</CardTitle>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">TEMPORAL_STAMP: {formatDate(selectedLog.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[1.5rem] bg-white border border-slate-100 text-slate-300 hover:text-rose-600 transition-all shadow-inner" onClick={() => setSelectedLog(null)}>
                      <X className="h-8 w-8" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-12 lg:p-16 space-y-12 overflow-y-auto scrollbar-hide bg-white">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('details.message' as any || 'EXCEPTION_MESSAGE')}</h4>
                    </div>
                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner text-xl font-bold text-slate-950 italic leading-relaxed break-words uppercase tracking-tight">{selectedLog.error_message}</div>
                  </div>

                  {selectedLog.error_stack && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('details.stack' as any || 'STACK_TRACE_NODES')}</h4>
                      </div>
                      <pre className="p-10 rounded-[3rem] bg-slate-950 text-slate-400 text-[11px] font-mono overflow-x-auto leading-relaxed scrollbar-hide select-all shadow-2xl border border-white/5">{selectedLog.error_stack}</pre>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Source_Vector</h4>
                      </div>
                      <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-600 break-all shadow-inner">{selectedLog.url}</div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Agent_Uplink</h4>
                      </div>
                      <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-600 leading-relaxed shadow-inner">{selectedLog.user_agent}</div>
                    </div>
                  </div>

                  {Object.keys(selectedLog.context).length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Context_Metadata</h4>
                      </div>
                      <pre className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 text-[11px] font-mono text-pink-600/80 overflow-x-auto scrollbar-hide select-all shadow-inner">{JSON.stringify(selectedLog.context, null, 2)}</pre>
                    </div>
                  )}

                  <div className="pt-12 flex justify-end">
                    <Button variant="premium" size="xl" className="h-20 px-16 rounded-[2rem] bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none" onClick={() => setSelectedLog(null)}>
                      Close Terminal Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
