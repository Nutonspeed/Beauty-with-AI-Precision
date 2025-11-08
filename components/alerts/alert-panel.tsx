/**
 * Emergency Alert Panel - Display active alerts
 */

'use client';

import { EmergencyAlert, AlertLevel } from '@/lib/emergency-alert-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, XCircle, CheckCircle2, Bell, X } from 'lucide-react';

interface AlertPanelProps {
  alerts: EmergencyAlert[];
  unacknowledgedCount: number;
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  className?: string;
}

const ALERT_COLORS: Record<AlertLevel, string> = {
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-yellow-50 border-yellow-200',
  critical: 'bg-orange-50 border-orange-200',
  emergency: 'bg-red-50 border-red-200',
  'code-blue': 'bg-red-100 border-red-400'
};

const ALERT_BADGE_COLORS: Record<AlertLevel, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
  'code-blue': 'bg-red-200 text-red-900'
};

const ALERT_ICONS: Record<AlertLevel, React.ComponentType<{ className?: string }>> = {
  info: Bell,
  warning: AlertCircle,
  critical: AlertTriangle,
  emergency: AlertTriangle,
  'code-blue': XCircle
};

export function AlertPanel({
  alerts,
  unacknowledgedCount,
  onAcknowledge,
  onDismiss,
  className = ''
}: AlertPanelProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} วันที่แล้ว`;
    if (hours > 0) return `${hours} ชม. ที่แล้ว`;
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
    return 'เมื่อสักครู่';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Emergency Alerts</span>
          </div>
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unacknowledgedCount} ยังไม่รับทราบ
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>ไม่มีการแจ้งเตือนฉุกเฉิน</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = ALERT_ICONS[alert.level];
              return (
                <div
                  key={alert.id}
                  className={`border-2 rounded-lg p-4 ${ALERT_COLORS[alert.level]}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-semibold">{alert.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={ALERT_BADGE_COLORS[alert.level]}>
                        {alert.level.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismiss(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm mb-3">{alert.message}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{formatTime(alert.timestamp)}</span>
                      <span>{formatRelativeTime(alert.timestamp)}</span>
                      {alert.sourceName && <span>จาก: {alert.sourceName}</span>}
                    </div>

                    {alert.requiresAck && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAcknowledge(alert.id)}
                        className="h-7"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        รับทราบ
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
