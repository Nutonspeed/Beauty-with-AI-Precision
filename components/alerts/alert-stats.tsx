/**
 * Alert Statistics Panel
 */

'use client';

import { AlertLevel } from '@/lib/emergency-alert-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, AlertCircle, Bell, CheckCircle2 } from 'lucide-react';

interface AlertStatsProps {
  statistics: {
    total: number;
    byLevel: Record<AlertLevel, number>;
    requiresAck: number;
    acknowledged: number;
  };
  className?: string;
}

export function AlertStats({ statistics, className = '' }: AlertStatsProps) {
  const { total, byLevel, requiresAck, acknowledged } = statistics;
  const ackRate = requiresAck > 0 ? Math.round((acknowledged / requiresAck) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <span>สถิติการแจ้งเตือน</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            <span className="text-sm">การแจ้งเตือนทั้งหมด</span>
          </div>
          <Badge variant="secondary">{total}</Badge>
        </div>

        {/* By Level */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            ตามระดับความสำคัญ
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Info</span>
              <Badge className="bg-blue-100 text-blue-800">{byLevel.info}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Warning</span>
              <Badge className="bg-yellow-100 text-yellow-800">{byLevel.warning}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Critical</span>
              <Badge className="bg-orange-100 text-orange-800">{byLevel.critical}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Emergency</span>
              <Badge className="bg-red-100 text-red-800">{byLevel.emergency}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm col-span-2">
              <span>Code Blue</span>
              <Badge className="bg-red-200 text-red-900">{byLevel['code-blue']}</Badge>
            </div>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            การรับทราบ
          </h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>ต้องรับทราบ</span>
              <Badge variant="outline">{requiresAck}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>รับทราบแล้ว</span>
              <Badge className="bg-green-100 text-green-800">{acknowledged}</Badge>
            </div>
            {requiresAck > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>อัตราการรับทราบ</span>
                  <span className="font-medium">{ackRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      ackRate >= 75
                        ? 'bg-green-500'
                        : ackRate >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${ackRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
