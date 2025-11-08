/**
 * Background Sync Manager
 * Handles offline→online synchronization for multi-clinic system
 * 
 * Features:
 * - Auto-sync when connection restored
 * - Retry with exponential backoff (max 5 attempts)
 * - Conflict resolution with ConflictResolver
 * - Progress tracking for 120 concurrent sales staff
 * - Clinic-scoped sync (only sync own clinic data)
 */

import { getIndexedDB } from '@/lib/db/indexed-db';
import { getConflictResolver } from '@/lib/sync/conflict-resolver';
import type { SyncAction } from '@/lib/db/indexed-db';
import type { ConflictResolution } from '@/lib/sync/conflict-resolver';

// ============================================================================
// Types
// ============================================================================

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  in_progress: boolean;
  current_action?: string;
}

export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  conflicts_resolved: number;
  errors: SyncError[];
}

export interface SyncError {
  action_id: string;
  action_type: string;
  resource_id: string;
  error_message: string;
  attempts: number;
  can_retry: boolean;
}

export type SyncListener = (progress: SyncProgress) => void;

// ============================================================================
// Background Sync Manager Class
// ============================================================================

export class BackgroundSyncManager {
  private isSyncing = false;
  private listeners: SyncListener[] = [];
  private maxRetries = 5;
  private retryDelay = 1000; // 1 second base delay

  constructor() {
    this.setupOnlineListener();
  }

  /**
   * Setup online event listener for auto-sync
   */
  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[BackgroundSync] Connection restored, starting sync...');
      this.syncAll().catch((error) => {
        console.error('[BackgroundSync] Auto-sync failed:', error);
      });
    });
  }

  /**
   * Sync all pending actions
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.warn('[BackgroundSync] Sync already in progress');
      return {
        success: false,
        synced_count: 0,
        failed_count: 0,
        conflicts_resolved: 0,
        errors: [
          {
            action_id: 'N/A',
            action_type: 'N/A',
            resource_id: 'N/A',
            error_message: 'Sync already in progress',
            attempts: 0,
            can_retry: false,
          },
        ],
      };
    }

    this.isSyncing = true;

    const indexedDB = getIndexedDB();
    const conflictResolver = getConflictResolver();

    let syncedCount = 0;
    let failedCount = 0;
    let conflictsResolved = 0;
    const errors: SyncError[] = [];

    try {
      // Get pending actions
      const pendingActions = await indexedDB.getPendingSyncActions();

      console.log(`[BackgroundSync] Found ${pendingActions.length} pending actions`);

      this.notifyProgress({
        total: pendingActions.length,
        completed: 0,
        failed: 0,
        in_progress: true,
      });

      // Process each action
      for (let i = 0; i < pendingActions.length; i++) {
        const action = pendingActions[i];

        this.notifyProgress({
          total: pendingActions.length,
          completed: syncedCount,
          failed: failedCount,
          in_progress: true,
          current_action: `${action.action_type} ${action.resource_type}`,
        });

        try {
          // Check if max retries exceeded
          if (action.attempts >= this.maxRetries) {
            console.error(
              `[BackgroundSync] Max retries exceeded for action ${action.id}`
            );
            errors.push({
              action_id: action.id,
              action_type: action.action_type,
              resource_id: action.resource_id,
              error_message: 'Max retries exceeded',
              attempts: action.attempts,
              can_retry: false,
            });
            failedCount++;
            continue;
          }

          // Process action with exponential backoff
          const delay = this.retryDelay * Math.pow(2, action.attempts);
          if (action.attempts > 0) {
            console.log(
              `[BackgroundSync] Retrying action ${action.id} after ${delay}ms`
            );
            await this.sleep(delay);
          }

          // Sync action
          const result = await this.syncAction(action, conflictResolver);

          if (result.success) {
            // Remove from queue
            await indexedDB.removeSyncAction(action.id);
            syncedCount++;

            if (result.conflict_resolved) {
              conflictsResolved++;
            }

            console.log(
              `[BackgroundSync] Synced action ${action.id} successfully`
            );
          } else {
            // Update attempt count
            await indexedDB.updateSyncActionAttempt(action.id, result.error);
            failedCount++;

            errors.push({
              action_id: action.id,
              action_type: action.action_type,
              resource_id: action.resource_id,
              error_message: result.error || 'Unknown error',
              attempts: action.attempts + 1,
              can_retry: action.attempts + 1 < this.maxRetries,
            });

            console.error(
              `[BackgroundSync] Failed to sync action ${action.id}:`,
              result.error
            );
          }
        } catch (error) {
          console.error(
            `[BackgroundSync] Error processing action ${action.id}:`,
            error
          );
          await indexedDB.updateSyncActionAttempt(
            action.id,
            error instanceof Error ? error.message : 'Unknown error'
          );
          failedCount++;

          errors.push({
            action_id: action.id,
            action_type: action.action_type,
            resource_id: action.resource_id,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            attempts: action.attempts + 1,
            can_retry: action.attempts + 1 < this.maxRetries,
          });
        }
      }

      this.notifyProgress({
        total: pendingActions.length,
        completed: syncedCount,
        failed: failedCount,
        in_progress: false,
      });

      console.log(
        `[BackgroundSync] Sync completed: ${syncedCount} synced, ${failedCount} failed, ${conflictsResolved} conflicts resolved`
      );

      return {
        success: failedCount === 0,
        synced_count: syncedCount,
        failed_count: failedCount,
        conflicts_resolved: conflictsResolved,
        errors,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync individual action
   */
  private async syncAction(
    action: SyncAction,
    conflictResolver: ReturnType<typeof getConflictResolver>
  ): Promise<{ success: boolean; conflict_resolved?: boolean; error?: string }> {
    try {
      switch (action.action_type) {
        case 'create_analysis':
          return await this.syncCreateAnalysis(action);

        case 'update_analysis':
          return await this.syncUpdateAnalysis(action, conflictResolver);

        case 'create_lead':
          return await this.syncCreateLead(action);

        case 'update_lead':
          return await this.syncUpdateLead(action, conflictResolver);

        case 'delete_lead':
          return await this.syncDeleteLead(action);

        default:
          return {
            success: false,
            error: `Unknown action type: ${action.action_type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync create analysis
   */
  private async syncCreateAnalysis(
    action: SyncAction
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/analysis/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to create analysis',
        };
      }

      // Mark as synced in IndexedDB
      const indexedDB = getIndexedDB();
      await indexedDB.markAnalysisSynced(action.resource_id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Sync update analysis with conflict resolution
   */
  private async syncUpdateAnalysis(
    action: SyncAction,
    conflictResolver: ReturnType<typeof getConflictResolver>
  ): Promise<{ success: boolean; conflict_resolved?: boolean; error?: string }> {
    try {
      // Fetch current server data
      const getResponse = await fetch(`/api/analysis/${action.resource_id}`);

      if (!getResponse.ok) {
        return {
          success: false,
          error: 'Failed to fetch server data',
        };
      }

      const serverData = await getResponse.json();

      // Resolve conflicts
      const resolution = conflictResolver.resolveAnalysisConflict(
        serverData.data,
        action.data,
        'last_write_wins'
      );

      // Update with resolved data
      const updateResponse = await fetch(`/api/analysis/${action.resource_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolution.resolved_data),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to update analysis',
        };
      }

      // Mark as synced in IndexedDB
      const indexedDB = getIndexedDB();
      await indexedDB.markAnalysisSynced(action.resource_id);

      return {
        success: true,
        conflict_resolved: resolution.conflicts_found.length > 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Sync create lead
   */
  private async syncCreateLead(
    action: SyncAction
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to create lead',
        };
      }

      // Mark as synced in IndexedDB
      const indexedDB = getIndexedDB();
      await indexedDB.markLeadSynced(action.resource_id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Sync update lead with conflict resolution
   */
  private async syncUpdateLead(
    action: SyncAction,
    conflictResolver: ReturnType<typeof getConflictResolver>
  ): Promise<{ success: boolean; conflict_resolved?: boolean; error?: string }> {
    try {
      // Fetch current server data
      const getResponse = await fetch(`/api/leads/${action.resource_id}`);

      if (!getResponse.ok) {
        return {
          success: false,
          error: 'Failed to fetch server data',
        };
      }

      const serverData = await getResponse.json();

      // Resolve conflicts
      const resolution = conflictResolver.resolveLeadConflict(
        serverData.data,
        action.data,
        'last_write_wins'
      );

      // Update with resolved data
      const updateResponse = await fetch(`/api/leads/${action.resource_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolution.resolved_data),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to update lead',
        };
      }

      // Mark as synced in IndexedDB
      const indexedDB = getIndexedDB();
      await indexedDB.markLeadSynced(action.resource_id);

      return {
        success: true,
        conflict_resolved: resolution.conflicts_found.length > 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Sync delete lead
   */
  private async syncDeleteLead(
    action: SyncAction
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/leads/${action.resource_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to delete lead',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Subscribe to sync progress updates
   */
  subscribe(listener: SyncListener): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of progress
   */
  private notifyProgress(progress: SyncProgress): void {
    this.listeners.forEach((listener) => listener(progress));
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncProgress & { pending_count: number }> {
    const indexedDB = getIndexedDB();
    const pendingActions = await indexedDB.getPendingSyncActions();

    return {
      total: pendingActions.length,
      completed: 0,
      failed: 0,
      in_progress: this.isSyncing,
      pending_count: pendingActions.length,
    };
  }

  /**
   * Check if currently syncing
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let backgroundSyncInstance: BackgroundSyncManager | null = null;

export function getBackgroundSyncManager(): BackgroundSyncManager {
  if (!backgroundSyncInstance) {
    backgroundSyncInstance = new BackgroundSyncManager();
  }
  return backgroundSyncInstance;
}

export function resetBackgroundSyncManager(): void {
  backgroundSyncInstance = null;
}
