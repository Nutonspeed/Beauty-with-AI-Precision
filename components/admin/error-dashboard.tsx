/**
 * Error Dashboard Component
 * Admin interface for viewing and managing error logs
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  RefreshCw,
  Download,
  Filter,
  X
} from 'lucide-react';

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

export function ErrorDashboard({ locale = 'th' }: ErrorDashboardProps) {
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async () => {
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
  };

  useEffect(() => {
    fetchLogs();
  }, [severityFilter]);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            {t.filters.title}
          </Button>
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.actions.refresh}
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {t.actions.export}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.stats.total}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.stats.last24h}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last24h}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                {t.stats.errors}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.bySeverity.error || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                {t.stats.warnings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.bySeverity.warning || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                {t.stats.info}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.bySeverity.info || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>{t.filters.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  {t.filters.severity}
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="all">{t.filters.all}</option>
                  <option value="error">{t.filters.error}</option>
                  <option value="warning">{t.filters.warning}</option>
                  <option value="info">{t.filters.info}</option>
                </select>
              </div>
              <Button variant="outline" onClick={() => setSeverityFilter('all')}>
                <X className="h-4 w-4 mr-2" />
                {t.filters.clear}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t.actions.loading}</p>
        </div>
      )}

      {/* Error Logs Table */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>{t.table.timestamp}</CardTitle>
            <CardDescription>
              {logs.length} {logs.length === 1 ? 'error' : 'errors'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">{t.table.noErrors}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="py-3 px-4">{t.table.timestamp}</th>
                      <th className="py-3 px-4">{t.table.severity}</th>
                      <th className="py-3 px-4">{t.table.message}</th>
                      <th className="py-3 px-4">{t.table.url}</th>
                      <th className="py-3 px-4">{t.table.user}</th>
                      <th className="py-3 px-4">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(log.severity)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-md truncate" title={log.error_message}>
                          {log.error_message}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-sm" title={log.url}>
                          {log.url}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {log.user_id || 'Anonymous'}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            {t.table.viewDetails}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getSeverityIcon(selectedLog.severity)}
                    {t.details.title}
                  </CardTitle>
                  <CardDescription>{formatDate(selectedLog.created_at)}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{t.details.message}</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedLog.error_message}</p>
              </div>

              {selectedLog.error_stack && (
                <div>
                  <h4 className="font-medium mb-2">{t.details.stack}</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {selectedLog.error_stack}
                  </pre>
                </div>
              )}

              {selectedLog.component_stack && (
                <div>
                  <h4 className="font-medium mb-2">{t.details.componentStack}</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {selectedLog.component_stack}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">{t.details.url}</h4>
                <p className="text-sm bg-muted p-3 rounded break-all">{selectedLog.url}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t.details.userAgent}</h4>
                <p className="text-sm bg-muted p-3 rounded break-all">{selectedLog.user_agent}</p>
              </div>

              {Object.keys(selectedLog.context).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">{t.details.context}</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  {t.details.close}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
