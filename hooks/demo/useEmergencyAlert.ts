/**
 * Demo hook: emergency alert system orchestration
 */
"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import EmergencyAlertManager, {
  type AlertAcknowledgment,
  type AlertLevel,
  type EmergencyAlert,
} from '@/lib/emergency-alert-manager';

export interface UseEmergencyAlertOptions {
  facilityId: string;
  userId?: string;
  userName?: string;
  autoSubscribe?: boolean;
  playSound?: boolean;
  showBrowserNotification?: boolean;
}

export interface UseEmergencyAlertReturn {
  activeAlerts: EmergencyAlert[];
  alertHistory: EmergencyAlert[];
  unacknowledgedCount: number;
  statistics: {
    total: number;
    byLevel: Record<AlertLevel, number>;
    requiresAck: number;
    acknowledged: number;
  };
  error: Error | null;
  broadcastAlert: (
    alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'priority'>,
  ) => Promise<EmergencyAlert | null>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  clearAllAlerts: () => void;
  getAlertsByLevel: (level: AlertLevel) => EmergencyAlert[];
}

export function useEmergencyAlert(options: UseEmergencyAlertOptions): UseEmergencyAlertReturn {
  const {
    facilityId,
    userId = 'anonymous',
    userName,
    autoSubscribe = true,
    playSound = true,
    showBrowserNotification = true,
  } = options;

  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<EmergencyAlert[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [statistics, setStatistics] = useState({
    total: 0,
    byLevel: {
      info: 0,
      warning: 0,
      critical: 0,
      emergency: 0,
      'code-blue': 0,
    } as Record<AlertLevel, number>,
    requiresAck: 0,
    acknowledged: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  const managerRef = useRef(EmergencyAlertManager);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateState = useCallback(() => {
    const alerts = managerRef.current.getActiveAlerts(facilityId);
    const history = managerRef.current.getAlertHistory(facilityId);
    const stats = managerRef.current.getStatistics(facilityId);
    const unacked = managerRef.current.getUnacknowledgedAlerts(userId, facilityId);

    setActiveAlerts(alerts);
    setAlertHistory(history);
    setStatistics(stats);
    setUnacknowledgedCount(unacked.length);
  }, [facilityId, userId]);

  useEffect(() => {
    if (typeof globalThis.window !== 'undefined' && playSound) {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playSound]);

  const playAlertSound = useCallback(
    (level: AlertLevel) => {
      if (!playSound || !audioRef.current) return;

      const frequencies: Record<AlertLevel, number> = {
        info: 440,
        warning: 554,
        critical: 659,
        emergency: 880,
        'code-blue': 1047,
      };

      const duration: Record<AlertLevel, number> = {
        info: 200,
        warning: 400,
        critical: 600,
        emergency: 800,
        'code-blue': 1000,
      };

      try {
        const AudioContext =
          globalThis.AudioContext || (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const audioContext = new (AudioContext as typeof globalThis.AudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequencies[level];
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration[level] / 1000,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration[level] / 1000);
      } catch (err) {
        console.warn('[useEmergencyAlert] Audio playback error:', err);
      }
    },
    [playSound],
  );

  const showNotification = useCallback(
    (alert: EmergencyAlert) => {
      if (!showBrowserNotification || typeof globalThis.window === 'undefined') return;

      if ('Notification' in globalThis && Notification.permission === 'granted') {
        const notification = new Notification(alert.title, {
          body: alert.message,
          icon: '/alert-icon.png',
          badge: '/alert-badge.png',
          tag: alert.id,
          requireInteraction:
            alert.level === 'emergency' || alert.level === 'code-blue',
        });

        notification.onclick = () => {
          globalThis.focus();
          notification.close();
        };
      }
    },
    [showBrowserNotification],
  );

  useEffect(() => {
    const handleAlertReceived = (alert: EmergencyAlert) => {
      if (alert.facilityId !== facilityId) return;

      console.log('[useEmergencyAlert] Alert received:', alert.id);

      playAlertSound(alert.level);
      showNotification(alert);
      updateState();
    };

    const handleAlertDismissed = (alertId: string) => {
      console.log('[useEmergencyAlert] Alert dismissed:', alertId);
      updateState();
    };

    const handleAlertAcknowledged = (ack: AlertAcknowledgment) => {
      console.log('[useEmergencyAlert] Alert acknowledged:', ack.alertId);
      updateState();
    };

    const handleAlertUpdated = (alert: EmergencyAlert) => {
      if (alert.facilityId !== facilityId) return;
      console.log('[useEmergencyAlert] Alert updated:', alert.id);
      updateState();
    };

    const handleError = (err: Error) => {
      console.error('[useEmergencyAlert] Error:', err);
      setError(err);
    };

    managerRef.current.initialize({
      onAlertReceived: handleAlertReceived,
      onAlertDismissed: handleAlertDismissed,
      onAlertAcknowledged: handleAlertAcknowledged,
      onAlertUpdated: handleAlertUpdated,
      onError: handleError,
    });

    if (autoSubscribe) {
      managerRef.current.subscribe(facilityId);
    }

    updateState();

    return () => {
      if (autoSubscribe) {
        managerRef.current.unsubscribe(facilityId);
      }
    };
  }, [
    facilityId,
    autoSubscribe,
    playAlertSound,
    showNotification,
    updateState,
  ]);

  const broadcastAlert = useCallback(
    async (
      alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'priority'>,
    ): Promise<EmergencyAlert | null> => {
      try {
        setError(null);
        const newAlert = await managerRef.current.broadcastAlert(alert);
        updateState();
        return newAlert;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to broadcast alert');
        setError(error);
        console.error('[useEmergencyAlert] Broadcast error:', error);
        return null;
      }
    },
    [updateState],
  );

  const acknowledgeAlert = useCallback(
    async (alertId: string): Promise<void> => {
      try {
        setError(null);
        await managerRef.current.acknowledgeAlert(alertId, userId, userName);
        updateState();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to acknowledge alert');
        setError(error);
        console.error('[useEmergencyAlert] Acknowledge error:', error);
      }
    },
    [userId, userName, updateState],
  );

  const dismissAlert = useCallback(
    async (alertId: string): Promise<void> => {
      try {
        setError(null);
        await managerRef.current.dismissAlert(alertId);
        updateState();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to dismiss alert');
        setError(error);
        console.error('[useEmergencyAlert] Dismiss error:', error);
      }
    },
    [updateState],
  );

  const clearAllAlerts = useCallback(() => {
    try {
      setError(null);
      managerRef.current.clearAllAlerts(facilityId);
      updateState();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear alerts');
      setError(error);
      console.error('[useEmergencyAlert] Clear error:', error);
    }
  }, [facilityId, updateState]);

  const getAlertsByLevel = useCallback(
    (level: AlertLevel): EmergencyAlert[] => {
      return managerRef.current.getAlertsByLevel(level, facilityId);
    },
    [facilityId],
  );

  return {
    activeAlerts,
    alertHistory,
    unacknowledgedCount,
    statistics,
    error,
    broadcastAlert,
    acknowledgeAlert,
    dismissAlert,
    clearAllAlerts,
    getAlertsByLevel,
  };
}
