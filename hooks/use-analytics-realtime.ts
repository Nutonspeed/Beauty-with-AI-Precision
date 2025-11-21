'use client';

import { useEffect, useState } from 'react';
import WebSocketClient from '@/lib/websocket-client';
import type { ConnectionStatus } from '@/lib/reconnection-manager';

export interface RealtimeAnalytics {
  bookingRate: number;
  revenue: number;
  activeUsers: number;
  trend: 'up' | 'down';
  timestamp: number;
}

export function useAnalyticsRealtime() {
  const [analytics, setAnalytics] = useState<RealtimeAnalytics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wsClient = WebSocketClient; // ใช้ singleton instance โดยตรง

    // ฟังก์ชันจัดการข้อความ
    const handleMessage = (message: any) => {
      // ตรวจสอบว่าเป็นข้อความ analytics หรือไม่
      if (message.type === 'analytics_update' || message.data?.type === 'analytics_update') {
        setAnalytics({
          bookingRate: message.data?.bookingRate || 0,
          revenue: message.data?.revenue || 0,
          activeUsers: message.data?.activeUsers || 0,
          trend: message.data?.trend || 'up',
          timestamp: message.data?.timestamp || Date.now()
        });
      }
    };

    // ฟังก์ชันจัดการสถานะการเชื่อมต่อ
    const handleStatusChange = (status: ConnectionStatus) => {
      setIsConnected(status.connected);
      if (status.error) {
        setError(status.error);
      }
    };

    // ลงทะเบียน listeners
    const unsubscribeMessage = wsClient.subscribe(handleMessage);
    const unsubscribeStatus = wsClient.onStatusChange(handleStatusChange);

    // เชื่อมต่อ WebSocket
    wsClient.connect();

    return () => {
      // ยกเลิกการลงทะเบียน listeners เมื่อ component unmount
      unsubscribeMessage();
      if (unsubscribeStatus) {
        unsubscribeStatus();
      }
    };
  }, []);

  return {
    analytics,
    isConnected,
    error
  };
}
