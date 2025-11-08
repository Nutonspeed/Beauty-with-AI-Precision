'use client';

/**
 * useOffline Hook
 * Manages offline state and provides utilities for offline-first workflows
 * 
 * Features:
 * - Real-time online/offline status
 * - Pending sync count
 * - Manual sync trigger
 * - Save data offline
 * - Optimistic updates
 */

import { useState, useEffect, useCallback } from 'react';
import { getIndexedDB } from '@/lib/db/indexed-db';
import { getBackgroundSyncManager } from '@/lib/sync/background-sync';
import type { MultiTenantSkinAnalysis, Lead } from '@/types/multi-tenant';
import type { SyncProgress, SyncResult } from '@/lib/sync/background-sync';
import { useAuth } from '@/hooks/useAuth';

export interface OfflineState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

export function useOffline() {
  const { user } = useAuth();
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
  });

  // Update online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setOfflineState((prev) => ({ ...prev, isOnline: navigator.onLine }));
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Subscribe to sync progress
  useEffect(() => {
    const syncManager = getBackgroundSyncManager();

    const unsubscribe = syncManager.subscribe((progress: SyncProgress) => {
      setOfflineState((prev) => ({
        ...prev,
        isSyncing: progress.in_progress,
        pendingCount: progress.total - progress.completed,
      }));

      if (!progress.in_progress && progress.completed > 0) {
        setOfflineState((prev) => ({ ...prev, lastSyncTime: new Date() }));
      }
    });

    return unsubscribe;
  }, []);

  // Update pending count periodically
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const indexedDB = getIndexedDB();
        await indexedDB.initialize();
        const actions = await indexedDB.getPendingSyncActions();
        setOfflineState((prev) => ({ ...prev, pendingCount: actions.length }));
      } catch (error) {
        console.error('[useOffline] Failed to get pending count:', error);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Save analysis offline (with optimistic update)
   */
  const saveAnalysisOffline = useCallback(
    async (analysis: MultiTenantSkinAnalysis): Promise<void> => {
      if (!user || !user.clinic_id) {
        throw new Error('User not authenticated or no clinic_id');
      }

      const indexedDB = getIndexedDB();
      await indexedDB.initialize();

      // Add clinic and sales staff info
      const offlineAnalysis: MultiTenantSkinAnalysis = {
        ...analysis,
        clinic_id: user.clinic_id,
        sales_staff_id: user.id,
        created_at: analysis.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to IndexedDB
      await indexedDB.saveAnalysis(offlineAnalysis, !offlineState.isOnline);

      // If offline, add to sync queue
      if (!offlineState.isOnline) {
        await indexedDB.addToSyncQueue({
          action_type: 'create_analysis',
          resource_type: 'analysis',
          resource_id: analysis.id,
          data: offlineAnalysis,
          clinic_id: user.clinic_id,
          sales_staff_id: user.id,
        });

        console.log('[useOffline] Analysis queued for sync:', analysis.id);
      }
    },
    [user, offlineState.isOnline]
  );

  /**
   * Save lead offline (with optimistic update)
   */
  const saveLeadOffline = useCallback(
    async (lead: Lead): Promise<void> => {
      if (!user || !user.clinic_id) {
        throw new Error('User not authenticated or no clinic_id');
      }

      const indexedDB = getIndexedDB();
      await indexedDB.initialize();

      // Add clinic and sales staff info
      const offlineLead: Lead = {
        ...lead,
        clinic_id: user.clinic_id,
        sales_staff_id: user.id,
        created_at: lead.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to IndexedDB
      await indexedDB.saveLead(offlineLead, !offlineState.isOnline);

      // If offline, add to sync queue
      if (!offlineState.isOnline) {
        await indexedDB.addToSyncQueue({
          action_type: 'create_lead',
          resource_type: 'lead',
          resource_id: lead.id,
          data: offlineLead,
          clinic_id: user.clinic_id,
          sales_staff_id: user.id,
        });

        console.log('[useOffline] Lead queued for sync:', lead.id);
      }
    },
    [user, offlineState.isOnline]
  );

  /**
   * Update lead offline
   */
  const updateLeadOffline = useCallback(
    async (leadId: string, updates: Partial<Lead>): Promise<void> => {
      if (!user || !user.clinic_id) {
        throw new Error('User not authenticated or no clinic_id');
      }

      const indexedDB = getIndexedDB();
      await indexedDB.initialize();

      // Get current lead from IndexedDB
      const leads = await indexedDB.getLeadsBySalesStaff(
        user.clinic_id,
        user.id
      );
      const currentLead = leads.find((l) => l.id === leadId);

      if (!currentLead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      // Apply updates
      const updatedLead: Lead = {
        ...currentLead,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Save to IndexedDB
      await indexedDB.saveLead(updatedLead, !offlineState.isOnline);

      // Add to sync queue
      await indexedDB.addToSyncQueue({
        action_type: 'update_lead',
        resource_type: 'lead',
        resource_id: leadId,
        data: updatedLead,
        clinic_id: user.clinic_id,
        sales_staff_id: user.id,
      });

      console.log('[useOffline] Lead update queued for sync:', leadId);
    },
    [user, offlineState.isOnline]
  );

  /**
   * Get offline analyses
   */
  const getOfflineAnalyses = useCallback(
    async (limit = 50): Promise<MultiTenantSkinAnalysis[]> => {
      if (!user || !user.clinic_id) {
        return [];
      }

      const indexedDB = getIndexedDB();
      await indexedDB.initialize();

      const analyses = await indexedDB.getAnalysesBySalesStaff(
        user.clinic_id,
        user.id,
        limit
      );

      return analyses;
    },
    [user]
  );

  /**
   * Get offline leads
   */
  const getOfflineLeads = useCallback(async (): Promise<Lead[]> => {
    if (!user || !user.clinic_id) {
      return [];
    }

    const indexedDB = getIndexedDB();
    await indexedDB.initialize();

    const leads = await indexedDB.getLeadsBySalesStaff(user.clinic_id, user.id);

    return leads;
  }, [user]);

  /**
   * Manually trigger sync
   */
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    const syncManager = getBackgroundSyncManager();
    return await syncManager.syncAll();
  }, []);

  /**
   * Clear all offline data (for testing/reset)
   */
  const clearOfflineData = useCallback(async (): Promise<void> => {
    const indexedDB = getIndexedDB();
    await indexedDB.initialize();
    await indexedDB.clearAll();
    console.log('[useOffline] All offline data cleared');
  }, []);

  /**
   * Get database statistics
   */
  const getDBStats = useCallback(async () => {
    const indexedDB = getIndexedDB();
    await indexedDB.initialize();
    return await indexedDB.getStats();
  }, []);

  return {
    // State
    ...offlineState,

    // Actions
    saveAnalysisOffline,
    saveLeadOffline,
    updateLeadOffline,
    getOfflineAnalyses,
    getOfflineLeads,
    syncNow,
    clearOfflineData,
    getDBStats,

    // Computed
    hasOfflineData: offlineState.pendingCount > 0,
    needsSync: offlineState.pendingCount > 0 && offlineState.isOnline,
  };
}
