/**
 * Queue Manager
 * Real-time patient queue management system
 */

import wsClient from './websocket-client';

export type QueueStatus = 'waiting' | 'called' | 'in-service' | 'completed' | 'cancelled' | 'no-show';
export type QueuePriority = 'normal' | 'urgent' | 'emergency';

export interface QueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  queueNumber: number;
  clinicId: string;
  doctorId?: string;
  appointmentType: string;
  priority: QueuePriority;
  status: QueueStatus;
  checkInTime: number;
  estimatedWaitTime: number; // in minutes
  estimatedCallTime?: number; // timestamp
  calledTime?: number;
  serviceStartTime?: number;
  serviceEndTime?: number;
  notes?: string;
}

export interface QueueStats {
  total: number;
  waiting: number;
  called: number;
  inService: number;
  completed: number;
  cancelled: number;
  noShow: number;
  averageWaitTime: number;
  averageServiceTime: number;
}

export interface QueueEventHandlers {
  onQueueJoined?: (entry: QueueEntry) => void;
  onQueueUpdated?: (entry: QueueEntry) => void;
  onQueueCalled?: (entry: QueueEntry) => void;
  onQueueCompleted?: (entry: QueueEntry) => void;
  onQueueCancelled?: (entry: QueueEntry) => void;
  onPositionChanged?: (entryId: string, newPosition: number) => void;
  onEstimatedTimeUpdated?: (entryId: string, estimatedWaitTime: number) => void;
  onError?: (error: Error) => void;
}

export class QueueManager {
  private wsClient = wsClient;
  private clinicId: string | null = null;
  private queue: Map<string, QueueEntry> = new Map();
  private handlers: QueueEventHandlers = {};
  private statsUpdateInterval: NodeJS.Timeout | null = null;
  private messageHandler: ((notification: any) => void) | null = null;
  private unsubscribeCallbacks: Array<() => void> = [];

  /**
   * Initialize queue management for a clinic
   */
  initialize(clinicId: string, handlers: QueueEventHandlers): void {
    this.clinicId = clinicId;
    this.handlers = handlers;

    // Create message handler for queue updates
    this.messageHandler = (notification: any) => {
      try {
        if (!notification || typeof notification !== 'object') return;
        
        // Handle different queue events
        if (notification.type === 'queue_update' && notification.data) {
          this.handleQueueUpdate(notification.data);
        }
      } catch (error) {
        console.error('[Queue] Error handling message:', error);
        if (this.handlers.onError) {
          this.handlers.onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    // Subscribe to queue channel
    if (this.messageHandler) {
      this.wsClient.addEventListener('message', this.messageHandler);
      this.unsubscribeCallbacks.push(() => {
        this.wsClient.removeEventListener('message', this.messageHandler!);
      });
    }

    // Start stats updates
    this.startStatsUpdates();

    console.log(`[Queue] Initialized for clinic: ${clinicId}`);
  }

  /**
   * Add patient to queue
   */
  joinQueue(entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'checkInTime' | 'estimatedWaitTime' | 'status'>): QueueEntry {
    const queueNumber = this.getNextQueueNumber();
    const estimatedWaitTime = this.calculateEstimatedWaitTime(entry.priority);

    const newEntry: QueueEntry = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...entry,
      queueNumber,
      status: 'waiting',
      checkInTime: Date.now(),
      estimatedWaitTime,
      estimatedCallTime: Date.now() + estimatedWaitTime * 60000
    };

    this.queue.set(newEntry.id, newEntry);

    // Broadcast to clinic
    this.wsClient.send('queue_join', {
      clinicId: this.clinicId,
      entry: newEntry
    });

    // Call handler
    if (this.handlers.onQueueJoined) {
      this.handlers.onQueueJoined(newEntry);
    }

    // Update positions for all waiting
    this.updateAllPositions();

    return newEntry;
  }

  /**
   * Call next patient in queue
   */
  callNext(doctorId?: string): QueueEntry | null {
    const waitingEntries = this.getEntriesByStatus('waiting');
    
    if (waitingEntries.length === 0) {
      return null;
    }

    // Prioritize by: emergency > urgent > normal, then by queue number
    const sortedEntries = [...waitingEntries].sort((a, b) => {
      const priorityOrder = { emergency: 0, urgent: 1, normal: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.queueNumber - b.queueNumber;
    });

    const nextEntry = sortedEntries[0];
    this.updateQueueEntry(nextEntry.id, {
      status: 'called',
      calledTime: Date.now(),
      doctorId
    });

    return this.queue.get(nextEntry.id) || null;
  }

  /**
   * Call specific patient
   */
  callPatient(entryId: string, doctorId?: string): void {
    const entry = this.queue.get(entryId);
    if (!entry || entry.status !== 'waiting') return;

    this.updateQueueEntry(entryId, {
      status: 'called',
      calledTime: Date.now(),
      doctorId
    });

    if (this.handlers.onQueueCalled) {
      const updatedEntry = this.queue.get(entryId);
      if (updatedEntry) {
        this.handlers.onQueueCalled(updatedEntry);
      }
    }
  }

  /**
   * Start service for patient
   */
  startService(entryId: string): void {
    this.updateQueueEntry(entryId, {
      status: 'in-service',
      serviceStartTime: Date.now()
    });
  }

  /**
   * Complete service
   */
  completeService(entryId: string): void {
    this.updateQueueEntry(entryId, {
      status: 'completed',
      serviceEndTime: Date.now()
    });

    if (this.handlers.onQueueCompleted) {
      const entry = this.queue.get(entryId);
      if (entry) {
        this.handlers.onQueueCompleted(entry);
      }
    }

    // Update positions for remaining entries
    this.updateAllPositions();
  }

  /**
   * Cancel queue entry
   */
  cancelEntry(entryId: string, reason?: string): void {
    this.updateQueueEntry(entryId, {
      status: 'cancelled',
      notes: reason
    });

    if (this.handlers.onQueueCancelled) {
      const entry = this.queue.get(entryId);
      if (entry) {
        this.handlers.onQueueCancelled(entry);
      }
    }

    // Update positions
    this.updateAllPositions();
  }

  /**
   * Mark as no-show
   */
  markNoShow(entryId: string): void {
    this.updateQueueEntry(entryId, {
      status: 'no-show'
    });

    // Update positions
    this.updateAllPositions();
  }

  /**
   * Update queue entry
   */
  private updateQueueEntry(entryId: string, updates: Partial<QueueEntry>): void {
    const entry = this.queue.get(entryId);
    if (!entry) return;

    const updatedEntry = { ...entry, ...updates };
    this.queue.set(entryId, updatedEntry);

    // Broadcast update
    this.wsClient.send('queue_update', {
      clinicId: this.clinicId,
      entry: updatedEntry
    });

    // Call handler
    if (this.handlers.onQueueUpdated) {
      this.handlers.onQueueUpdated(updatedEntry);
    }
  }

  /**
   * Get all queue entries
   */
  getAllEntries(): QueueEntry[] {
    return Array.from(this.queue.values())
      .sort((a, b) => a.checkInTime - b.checkInTime);
  }

  /**
   * Get entries by status
   */
  getEntriesByStatus(status: QueueStatus): QueueEntry[] {
    return Array.from(this.queue.values())
      .filter(entry => entry.status === status)
      .sort((a, b) => {
        const priorityOrder = { emergency: 0, urgent: 1, normal: 2 } as const;
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.queueNumber - b.queueNumber;
      });
  }

  /**
   * Get entry by patient ID
   */
  getEntryByPatientId(patientId: string): QueueEntry | null {
    return Array.from(this.queue.values())
      .find(entry => entry.patientId === patientId && 
             (entry.status === 'waiting' || entry.status === 'called' || entry.status === 'in-service')) || null;
  }

  /**
   * Get position in queue
   */
  getPosition(entryId: string): number {
    const entry = this.queue.get(entryId);
    if (!entry || entry.status !== 'waiting') return -1;

    const waitingEntries = this.getEntriesByStatus('waiting');
    return waitingEntries.findIndex(e => e.id === entryId) + 1;
  }

  /**
   * Calculate estimated wait time
   */
  private calculateEstimatedWaitTime(priority: QueuePriority): number {
    const waitingEntries = this.getEntriesByStatus('waiting');
    const inServiceEntries = this.getEntriesByStatus('in-service');

    // Average service time (default 15 minutes)
    const avgServiceTime = this.getAverageServiceTime();

    // Count entries ahead based on priority
    const priorityOrder = { emergency: 0, urgent: 1, normal: 2 } as const;
    const currentPriorityLevel = priorityOrder[priority];

    const entriesAhead = waitingEntries.filter(entry => {
      const entryPriorityLevel = priorityOrder[entry.priority];
      return entryPriorityLevel < currentPriorityLevel || 
             (entryPriorityLevel === currentPriorityLevel);
    }).length;

    // Add time for current in-service entries
    const inServiceTime = inServiceEntries.length * avgServiceTime;

    return Math.round(entriesAhead * avgServiceTime + inServiceTime);
  }

  /**
   * Update positions and estimated times for all waiting entries
   */
  private updateAllPositions(): void {
    const waitingEntries = this.getEntriesByStatus('waiting');

    waitingEntries.forEach((entry, index) => {
      const position = index + 1;
      const estimatedWaitTime = this.calculateEstimatedWaitTime(entry.priority);

      if (entry.estimatedWaitTime !== estimatedWaitTime) {
        this.queue.set(entry.id, {
          ...entry,
          estimatedWaitTime,
          estimatedCallTime: Date.now() + estimatedWaitTime * 60000
        });

        if (this.handlers.onEstimatedTimeUpdated) {
          this.handlers.onEstimatedTimeUpdated(entry.id, estimatedWaitTime);
        }
      }

      if (this.handlers.onPositionChanged) {
        this.handlers.onPositionChanged(entry.id, position);
      }
    });
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const entries = Array.from(this.queue.values());

    return {
      total: entries.length,
      waiting: entries.filter((e: QueueEntry) => e.status === 'waiting').length,
      called: entries.filter((e: QueueEntry) => e.status === 'called').length,
      inService: entries.filter((e: QueueEntry) => e.status === 'in-service').length,
      completed: entries.filter((e: QueueEntry) => e.status === 'completed').length,
      cancelled: entries.filter((e: QueueEntry) => e.status === 'cancelled').length,
      noShow: entries.filter((e: QueueEntry) => e.status === 'no-show').length,
      averageWaitTime: this.getAverageWaitTime(),
      averageServiceTime: this.getAverageServiceTime()
    };
  }

  /**
   * Calculate average wait time
   */
  private getAverageWaitTime(): number {
    const completedEntries = this.getEntriesByStatus('completed');
    if (completedEntries.length === 0) return 0;

    const totalWaitTime = completedEntries.reduce((sum, entry) => {
      if (entry.calledTime && entry.checkInTime) {
        return sum + (entry.calledTime - entry.checkInTime);
      }
      return sum;
    }, 0);

    return Math.round(totalWaitTime / completedEntries.length / 60000); // Convert to minutes
  }

  /**
   * Calculate average service time
   */
  private getAverageServiceTime(): number {
    const completedEntries = this.getEntriesByStatus('completed');
    if (completedEntries.length === 0) return 15; // Default 15 minutes

    const totalServiceTime = completedEntries.reduce((sum, entry) => {
      if (entry.serviceStartTime && entry.serviceEndTime) {
        return sum + (entry.serviceEndTime - entry.serviceStartTime);
      }
      return sum;
    }, 0);

    return Math.round(totalServiceTime / completedEntries.length / 60000); // Convert to minutes
  }

  /**
   * Get next queue number
   */
  private getNextQueueNumber(): number {
    const entries = Array.from(this.queue.values());
    if (entries.length === 0) return 1;

    const maxNumber = Math.max(...entries.map(e => e.queueNumber));
    return maxNumber + 1;
  }

  /**
   * Start periodic stats updates
   */
  private startStatsUpdates(): void {
    // Clear existing interval if any
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
    }

    // Update stats every minute
    this.statsUpdateInterval = setInterval(() => {
      this.updateAllPositions();
    }, 60000);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Clear stats update interval
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
      this.statsUpdateInterval = null;
    }

    // Remove all event listeners
    this.unsubscribeCallbacks.forEach((unsubscribe: () => void) => unsubscribe());
    this.unsubscribeCallbacks = [];

    // Clear the queue
    this.queue.clear();

    console.log('[Queue] Destroyed');
  }

  /**
   * Handle queue updates from WebSocket
   */
  private handleQueueUpdate(data: any): void {
    if (!data || !data.entry) return;

    const entry = data.entry as QueueEntry;
    this.queue.set(entry.id, entry);

    // Call appropriate handler
    if (this.handlers.onQueueUpdated) {
      this.handlers.onQueueUpdated(entry);
    }
  }
}
