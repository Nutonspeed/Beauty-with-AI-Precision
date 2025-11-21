/**
 * React hook for queue management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  QueueManager,
  QueueEntry,
  QueueStats,
  QueueStatus
} from '@/lib/queue-manager';

interface UseQueueProps {
  clinicId: string;
  enabled?: boolean;
}

export function useQueue({ clinicId, enabled = true }: UseQueueProps) {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    waiting: 0,
    called: 0,
    inService: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    averageWaitTime: 0,
    averageServiceTime: 0
  });

  const managerRef = useRef<QueueManager | null>(null);

  // Initialize manager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new QueueManager();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
    };
  }, []);

  /**
   * Update entries from manager
   */
  const updateEntries = useCallback(() => {
    if (!managerRef.current) return;
    const allEntries = managerRef.current.getAllEntries();
    setEntries(allEntries);
  }, []);

  /**
   * Update stats from manager
   */
  const updateStats = useCallback(() => {
    if (!managerRef.current) return;
    const currentStats = managerRef.current.getStats();
    setStats(currentStats);
  }, []);

  // Initialize queue
  useEffect(() => {
    if (enabled && managerRef.current) {
      managerRef.current.initialize(clinicId, {
        onQueueJoined: () => {
          updateEntries();
          updateStats();
        },
        onQueueUpdated: () => {
          updateEntries();
          updateStats();
        },
        onQueueCalled: () => {
          updateEntries();
          updateStats();
        },
        onQueueCompleted: () => {
          updateEntries();
          updateStats();
        },
        onQueueCancelled: () => {
          updateEntries();
          updateStats();
        },
        onPositionChanged: () => {
          updateEntries();
        },
        onEstimatedTimeUpdated: () => {
          updateEntries();
        }
      });

      updateEntries();
      updateStats();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
      }
    };
  }, [clinicId, enabled, updateEntries, updateStats]);

  /**
   * Join queue
   */
  const joinQueue = useCallback((
    entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'checkInTime' | 'estimatedWaitTime' | 'status'>
  ): QueueEntry | null => {
    if (!managerRef.current) return null;
    const newEntry = managerRef.current.joinQueue(entry);
    updateEntries();
    updateStats();
    return newEntry;
  }, [updateEntries, updateStats]);

  /**
   * Call next patient
   */
  const callNext = useCallback((doctorId?: string): QueueEntry | null => {
    if (!managerRef.current) return null;
    const entry = managerRef.current.callNext(doctorId);
    updateEntries();
    updateStats();
    return entry;
  }, [updateEntries, updateStats]);

  /**
   * Call specific patient
   */
  const callPatient = useCallback((entryId: string, doctorId?: string) => {
    if (managerRef.current) {
      managerRef.current.callPatient(entryId, doctorId);
      updateEntries();
      updateStats();
    }
  }, [updateEntries, updateStats]);

  /**
   * Start service
   */
  const startService = useCallback((entryId: string) => {
    if (managerRef.current) {
      managerRef.current.startService(entryId);
      updateEntries();
      updateStats();
    }
  }, [updateEntries, updateStats]);

  /**
   * Complete service
   */
  const completeService = useCallback((entryId: string) => {
    if (managerRef.current) {
      managerRef.current.completeService(entryId);
      updateEntries();
      updateStats();
    }
  }, [updateEntries, updateStats]);

  /**
   * Cancel entry
   */
  const cancelEntry = useCallback((entryId: string, reason?: string) => {
    if (managerRef.current) {
      managerRef.current.cancelEntry(entryId, reason);
      updateEntries();
      updateStats();
    }
  }, [updateEntries, updateStats]);

  /**
   * Mark as no-show
   */
  const markNoShow = useCallback((entryId: string) => {
    if (managerRef.current) {
      managerRef.current.markNoShow(entryId);
      updateEntries();
      updateStats();
    }
  }, [updateEntries, updateStats]);

  /**
   * Get entries by status
   */
  const getEntriesByStatus = useCallback((status: QueueStatus): QueueEntry[] => {
    if (!managerRef.current) return [];
    return managerRef.current.getEntriesByStatus(status);
  }, []);

  /**
   * Get position in queue
   */
  const getPosition = useCallback((entryId: string): number => {
    if (!managerRef.current) return -1;
    return managerRef.current.getPosition(entryId);
  }, []);

  /**
   * Get entry by patient ID
   */
  const getEntryByPatientId = useCallback((patientId: string): QueueEntry | null => {
    if (!managerRef.current) return null;
    return managerRef.current.getEntryByPatientId(patientId);
  }, []);

  return {
    // State
    entries,
    stats,

    // Actions
    joinQueue,
    callNext,
    callPatient,
    startService,
    completeService,
    cancelEntry,
    markNoShow,

    // Queries
    getEntriesByStatus,
    getPosition,
    getEntryByPatientId
  };
}
