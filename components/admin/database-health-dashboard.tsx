'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Database,
  Activity,
  HardDrive,
  Link as LinkIcon,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface HealthCheck {
  count: number;
  status: 'ok' | 'warning' | 'error';
}

interface HealthData {
  health_status: 'healthy' | 'needs_attention' | 'critical';
  database_size: string;
  timestamp: string;
  checks: {
    foreign_keys: HealthCheck;
    indexes: HealthCheck;
    orphaned_analyses: HealthCheck;
    orphaned_leads: HealthCheck;
    duplicate_invitations: HealthCheck;
    invalid_user_refs: HealthCheck;
  };
  table_counts: {
    users: number;
    clinics: number;
    invitations: number;
    sales_leads: number;
    appointments: number;
    skin_analyses: number;
  };
}

interface HealthResponse {
  success: boolean;
  timestamp: string;
  health: HealthData;
  error?: string;
}

export default function DatabaseHealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health/database');
      const data: HealthResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch health data');
      }
      
      setHealth(data.health);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchHealth, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'needs_attention':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      ok: 'default',
      healthy: 'default',
      warning: 'outline',
      needs_attention: 'outline',
      error: 'destructive',
      critical: 'destructive',
    };
    
    const colors: Record<string, string> = {
      ok: 'bg-green-500',
      healthy: 'bg-green-500',
      warning: 'bg-yellow-500',
      needs_attention: 'bg-yellow-500',
      error: 'bg-red-500',
      critical: 'bg-red-500',
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className={colors[status]}>
        {status.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">กำลังตรวจสอบสุขภาพฐานข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-6 w-6" />
              เกิดข้อผิดพลาด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchHealth}>
              <RefreshCw className="h-4 w-4 mr-2" />
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Health Monitor</h1>
          <p className="text-muted-foreground">
            ตรวจสอบสุขภาพและประสิทธิภาพของฐานข้อมูล
          </p>
        </div>
        <Button onClick={fetchHealth} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(health.health_status)}
              <div>
                <CardTitle>สถานะโดยรวม</CardTitle>
                <CardDescription>
                  อัพเดตล่าสุด: {lastUpdate?.toLocaleString('th-TH') || '-'}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(health.health_status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ขนาดฐานข้อมูล</p>
                <p className="text-lg font-semibold">{health.database_size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Foreign Keys</p>
                <p className="text-lg font-semibold">{health.checks.foreign_keys.count}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Indexes</p>
                <p className="text-lg font-semibold">{health.checks.indexes.count}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">สถานะ</p>
                <p className="text-lg font-semibold text-green-500">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Foreign Keys */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Foreign Keys</CardTitle>
              {getStatusIcon(health.checks.foreign_keys.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {health.checks.foreign_keys.count}
            </div>
            <p className="text-sm text-muted-foreground">
              ความสัมพันธ์ของตารางทั้งหมด
            </p>
          </CardContent>
        </Card>

        {/* Indexes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Indexes</CardTitle>
              {getStatusIcon(health.checks.indexes.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {health.checks.indexes.count}
            </div>
            <p className="text-sm text-muted-foreground">
              ดัชนีสำหรับเพิ่มประสิทธิภาพ
            </p>
          </CardContent>
        </Card>

        {/* Orphaned Analyses */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Orphaned Analyses</CardTitle>
              {getStatusIcon(health.checks.orphaned_analyses.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {health.checks.orphaned_analyses.count}
            </div>
            <p className="text-sm text-muted-foreground">
              วิเคราะห์ที่ไม่มีเจ้าของ
            </p>
          </CardContent>
        </Card>

        {/* Orphaned Leads */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Orphaned Leads</CardTitle>
              {getStatusIcon(health.checks.orphaned_leads.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {health.checks.orphaned_leads.count}
            </div>
            <p className="text-sm text-muted-foreground">
              ลีดที่ไม่มีเจ้าของ
            </p>
          </CardContent>
        </Card>

        {/* Duplicate Invitations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Duplicate Invitations</CardTitle>
              {getStatusIcon(health.checks.duplicate_invitations.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {health.checks.duplicate_invitations.count}
            </div>
            <p className="text-sm text-muted-foreground">
              คำเชิญที่ซ้ำกัน
            </p>
          </CardContent>
        </Card>

        {/* Invalid User Refs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Invalid User Refs</CardTitle>
              {getStatusIcon(health.checks.invalid_user_refs.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {health.checks.invalid_user_refs.count}
            </div>
            <p className="text-sm text-muted-foreground">
              การอ้างอิงผู้ใช้ที่ไม่ถูกต้อง
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Counts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            จำนวนข้อมูลในตาราง
          </CardTitle>
          <CardDescription>
            จำนวนแถวข้อมูลในตารางสำคัญ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Users</p>
              <p className="text-2xl font-bold">{health.table_counts.users}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Clinics</p>
              <p className="text-2xl font-bold">{health.table_counts.clinics}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Invitations</p>
              <p className="text-2xl font-bold">{health.table_counts.invitations}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Sales Leads</p>
              <p className="text-2xl font-bold">{health.table_counts.sales_leads}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Appointments</p>
              <p className="text-2xl font-bold">{health.table_counts.appointments}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Skin Analyses</p>
              <p className="text-2xl font-bold">{health.table_counts.skin_analyses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {health.health_status !== 'healthy' && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-5 w-5" />
              คำแนะนำ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {health.checks.orphaned_analyses.count > 0 && (
                <li>พบข้อมูลวิเคราะห์ที่ไม่มีเจ้าของ ({health.checks.orphaned_analyses.count} รายการ)</li>
              )}
              {health.checks.orphaned_leads.count > 0 && (
                <li>พบลีดที่ไม่มีเจ้าของ ({health.checks.orphaned_leads.count} รายการ)</li>
              )}
              {health.checks.duplicate_invitations.count > 0 && (
                <li>พบคำเชิญที่ซ้ำกัน ({health.checks.duplicate_invitations.count} รายการ)</li>
              )}
              {health.checks.invalid_user_refs.count > 0 && (
                <li>พบการอ้างอิงผู้ใช้ที่ไม่ถูกต้อง ({health.checks.invalid_user_refs.count} รายการ)</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
