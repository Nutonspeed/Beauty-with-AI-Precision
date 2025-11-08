/**
 * Alert History Viewer
 */

'use client';

import { EmergencyAlert, AlertLevel } from '@/lib/emergency-alert-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface AlertHistoryProps {
  history: EmergencyAlert[];
  className?: string;
}

const ALERT_BADGE_COLORS: Record<AlertLevel, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
  'code-blue': 'bg-red-200 text-red-900'
};

export function AlertHistory({ history, className = '' }: AlertHistoryProps) {
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>ประวัติการแจ้งเตือน</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            ไม่มีประวัติ
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((alert) => (
              <div
                key={alert.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge className={`${ALERT_BADGE_COLORS[alert.level]} text-xs`}>
                    {alert.level.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDateTime(alert.timestamp)}</span>
                  {alert.sourceName && <span>จาก: {alert.sourceName}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
