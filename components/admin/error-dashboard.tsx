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
  Shield,
  Layers,
  Search,
  Eye,
  FileText,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
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

/*
const TRANSLATIONS = {
  en: {
    title: 'Error Dashboard',
    description: 'Monitor and manage application errors',
    stats: {
      total: 'Total Errors',
      last24h: 'Last 24 Hours',
      errors: 'Errors',
      warnings: 'Warnings',
      info: 'Info',
    },
    filters: {
      title: 'Filters',
      severity: 'Severity',
      all: 'All',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      dateRange: 'Date Range',
      apply: 'Apply',
      clear: 'Clear',
    },
    table: {
      timestamp: 'Timestamp',
      severity: 'Severity',
      message: 'Error Message',
      url: 'URL',
      user: 'User',
      actions: 'Actions',
      noErrors: 'No errors found',
      viewDetails: 'View Details',
      markResolved: 'Mark Resolved',
      resolved: 'Resolved',
    },
    actions: {
      refresh: 'Refresh',
      export: 'Export CSV',
      loading: 'Loading...',
      error: 'Failed to load error logs',
    },
    details: {
      title: 'Error Details',
      message: 'Error Message',
      stack: 'Stack Trace',
      componentStack: 'Component Stack',
      url: 'URL',
      userAgent: 'User Agent',
      timestamp: 'Timestamp',
      context: 'Additional Context',
      close: 'Close',
    },
  },
  th: {
    title: 'แดชบอร์ดข้อผิดพลาด',
    description: 'ติดตามและจัดการข้อผิดพลาดของแอปพลิเคชัน',
    stats: {
      total: 'ข้อผิดพลาดทั้งหมด',
      last24h: '24 ชั่วโมงที่ผ่านมา',
      errors: 'ข้อผิดพลาด',
      warnings: 'คำเตือน',
      info: 'ข้อมูล',
    },
    filters: {
      title: 'ตัวกรอง',
      severity: 'ระดับความรุนแรง',
      all: 'ทั้งหมด',
      error: 'ข้อผิดพลาด',
      warning: 'คำเตือน',
      info: 'ข้อมูล',
      dateRange: 'ช่วงวันที่',
      apply: 'ใช้งาน',
      clear: 'ล้าง',
    },
    table: {
      timestamp: 'เวลา',
      severity: 'ความรุนแรง',
      message: 'ข้อความผิดพลาด',
      url: 'URL',
      user: 'ผู้ใช้',
      actions: 'การดำเนินการ',
      noErrors: 'ไม่พบข้อผิดพลาด',
      viewDetails: 'ดูรายละเอียด',
      markResolved: 'ทำเครื่องหมายว่าแก้ไขแล้ว',
      resolved: 'แก้ไขแล้ว',
    },
    actions: {
      refresh: 'รีเฟรช',
      export: 'ส่งออก CSV',
      loading: 'กำลังโหลด...',
      error: 'โหลดข้อมูลข้อผิดพลาดไม่สำเร็จ',
    },
    details: {
      title: 'รายละเอียดข้อผิดพลาด',
      message: 'ข้อความผิดพลาด',
      stack: 'Stack Trace',
      componentStack: 'Component Stack',
      url: 'URL',
      userAgent: 'User Agent',
      timestamp: 'เวลา',
      context: 'ข้อมูลเพิ่มเติม',
      close: 'ปิด',
    },
  },
};
*/

export function ErrorDashboard({ locale = 'th' }: ErrorDashboardProps) {
  const t = useTranslations();

  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
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
    a.download = `error-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white tracking-tight italic flex items-center justify-center md:justify-start gap-4">
            <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
            {t('errorDashboard.title')}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
            {t('errorDashboard.subtitle')}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-3 h-4 w-4" />
            {t('filters.title').toUpperCase()}
          </Button>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all" onClick={fetchLogs}>
            <RefreshCw className={cn("mr-3 h-4 w-4", loading && "animate-spin")} />
            {t('actions.refresh').toUpperCase()}
          </Button>
          <Button variant="premium" className="h-14 px-8 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border" onClick={exportToCSV} disabled={logs.length === 0}>
            <Download className="mr-3 h-4 w-4" />
            SCHEMA_EXPORT
          </Button>
        </div>
      </div>

      {/* Overview Metrics Grid - Operational Nodes */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: t('errorDashboard.stats.cumulativeVariance'), val: stats.total, sub: t('activityLogsDashboard.globalActivityNodes'), icon: Activity, color: 'text-white', bg: 'bg-white/5' },
            { label: t('errorDashboard.stats.temporalPeak'), val: stats.last24h, sub: t('activityLogsDashboard.realtimeThroughput'), icon: Zap, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: t('errorDashboard.stats.criticalBreaches'), val: stats.bySeverity.error || 0, sub: t('strategicGrowthAdvisor.implementation'), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: t('errorDashboard.stats.stateWarnings'), val: stats.bySeverity.warning || 0, sub: t('regionalGrowthHeatmap.regions.northern'), icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: t('errorDashboard.stats.nominalLogs'), val: stats.bySeverity.info || 0, sub: t('ui.terminal.authVerified'), icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' }
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
      )}

      {/* Filters Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] shadow-2xl relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                <CardTitle className="text-xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <Search className="h-5 w-5 text-cyan-400" />
                  Sector Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 flex gap-8 items-end">
                <div className="flex-1 space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('errorDashboard.filters.severityVector')}</Label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="h-16 w-full rounded-2xl border border-white/5 bg-white/[0.03] px-8 text-sm font-bold italic text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 appearance-none transition-all cursor-pointer"
                  >
                    <option value="all" className="bg-[#020617]">{t('errorDashboard.filters.allProtocol')}</option>
                    <option value="error" className="bg-[#020617] text-red-400">{t('errorDashboard.filters.errorBreach')}</option>
                    <option value="warning" className="bg-[#020617] text-yellow-400">{t('errorDashboard.filters.warningVariance')}</option>
                    <option value="info" className="bg-[#020617] text-blue-400">{t('errorDashboard.filters.infoTelemetry')}</option>
                  </select>
                </div>
                <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest italic" onClick={() => setSeverityFilter('all')}>
                  <X className="h-4 w-4 mr-2" />
                  {t('filters.clear').toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Log Stream */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic">{t('errorDashboard.table.title')}</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('errorDashboard.table.desc', { count: logs.length })}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {error && (
              <div className="p-4 mb-4 text-sm text-red-500 bg-red-500/10 rounded-lg">
                {error}
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="bg-white/[0.02] border-b border-white/5">
                  <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('errorDashboard.table.temporalStamp')}</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('filters.severity')}</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('errorDashboard.table.exceptionMessage')}</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('errorDashboard.table.sourceNode')}</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('errorDashboard.table.entity')}</TableHead>
                  <TableHead className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-32 text-slate-600 uppercase tracking-[0.4em] font-black text-[10px] italic">
                      NO_ANOMALIES_DETECTED_IN_SECTOR
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, idx) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group/row transition-all duration-500 hover:bg-white/[0.03] border-white/5"
                    >
                      <TableCell className="px-10 py-8">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-300 italic">{formatDate(log.created_at).split(',')[0]}</div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{formatDate(log.created_at).split(',')[1]}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(log.severity)}
                          <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner", 
                            log.severity === 'error' ? 'bg-red-500/10 text-red-400' : 
                            log.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
                          )}>
                            {log.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <span className="text-sm font-bold text-white italic group-hover/row:text-pink-400 transition-colors leading-relaxed line-clamp-2 max-w-md">{log.error_message}</span>
                      </TableCell>
                      <TableCell className="px-8 py-8 font-mono text-[10px] text-slate-500 group-hover/row:text-cyan-400 transition-colors">{log.url}</TableCell>
                      <TableCell className="px-8 py-8 text-xs font-black text-slate-400 italic">{log.user_id || 'ANONYMOUS_ENTITY'}</TableCell>
                      <TableCell className="px-10 py-8 text-right">
                        <Button variant="outline" size="sm" className="h-10 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest italic hover:bg-white hover:text-[#020617] transition-all" onClick={() => setSelectedLog(log)}>
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          {t('table.viewDetails').toUpperCase()}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Error Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <Card className="border-white/10 bg-[#020617] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col h-full relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
                <CardHeader className="p-12 border-b border-white/5 shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl border border-white/5 shadow-inner", 
                          selectedLog.severity === 'error' ? 'bg-red-500/10' : 
                          selectedLog.severity === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                        )}>
                          {getSeverityIcon(selectedLog.severity)}
                        </div>
                        <Badge className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-none shadow-inner",
                          selectedLog.severity === 'error' ? 'bg-red-500/10 text-red-400' : 
                          selectedLog.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
                        )}>
                          {t(`filters.${selectedLog.severity}`).toUpperCase()}_PROTOCOL
                        </Badge>
                      </div>
                      <CardTitle className="text-4xl font-black text-white italic tracking-tighter">{t('details.title').toUpperCase()}</CardTitle>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">TEMPORAL_STAMP: {formatDate(selectedLog.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-white/5 text-slate-500" onClick={() => setSelectedLog(null)}>
                      <X className="h-8 w-8" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-12 space-y-12 overflow-y-auto scrollbar-hide">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-pink-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('details.message').toUpperCase()}</h4>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-inner text-lg font-bold text-white italic leading-relaxed break-words">{selectedLog.error_message}</div>
                  </div>

                  {selectedLog.error_stack && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-cyan-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('details.stack').toUpperCase()}</h4>
                      </div>
                      <pre className="p-8 rounded-[2.5rem] bg-[#010409] border border-white/5 text-[11px] font-mono text-slate-400 overflow-x-auto leading-relaxed scrollbar-hide select-all">{selectedLog.error_stack}</pre>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('errorDashboard.details.sourceVector')}</h4>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-[10px] text-slate-300 break-all">{selectedLog.url}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('errorDashboard.details.agentUplink')}</h4>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-[10px] text-slate-300 leading-relaxed">{selectedLog.user_agent}</div>
                    </div>
                  </div>

                  {Object.keys(selectedLog.context).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('errorDashboard.details.contextMetadata')}</h4>
                      </div>
                      <pre className="p-8 rounded-[2.5rem] bg-[#010409] border border-white/5 text-[11px] font-mono text-pink-400/80 overflow-x-auto scrollbar-hide select-all">{JSON.stringify(selectedLog.context, null, 2)}</pre>
                    </div>
                  )}

                  <div className="pt-8 flex justify-end">
                    <Button variant="outline" className="h-16 px-12 rounded-[2rem] border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-white hover:text-[#020617] transition-all" onClick={() => setSelectedLog(null)}>
                      {t('errorDashboard.details.closeTerminal')}
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
