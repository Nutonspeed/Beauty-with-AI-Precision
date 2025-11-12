/**
 * IndexedDB Manager for Multi-Clinic Offline Storage
 * Supports: 120 sales staff × 50 analyses each = 6,000 offline records
 * 
 * Architecture:
 * - Store: analyses (last 50 per sales_staff, clinic-scoped)
 * - Store: leads (all active leads, clinic-scoped)
 * - Store: sync-queue (pending actions when offline)
 * - Store: clinic-cache (clinic metadata, settings)
 * 
 * Data Isolation:
 * - Each sales staff can only access their own clinic's data
 * - Super admin can access all clinics
 * - Automatic cleanup after sync
 */

import type { MultiTenantSkinAnalysis, Lead, Clinic } from '@/types/multi-tenant';

// ============================================================================
// Types
// ============================================================================

export interface OfflineAnalysis extends MultiTenantSkinAnalysis {
  // Offline-specific fields
  offline_created: boolean;
  offline_timestamp: number;
  synced: boolean;
  sync_attempts: number;
  last_sync_error?: string;
}

export interface OfflineLead extends Lead {
  // Offline-specific fields
  offline_created: boolean;
  offline_timestamp: number;
  synced: boolean;
  sync_attempts: number;
  last_sync_error?: string;
}

export interface SyncAction {
  id: string;
  action_type: 'create_analysis' | 'update_analysis' | 'create_lead' | 'update_lead' | 'delete_lead';
  resource_type: 'analysis' | 'lead';
  resource_id: string;
  data: any;
  clinic_id: string;
  sales_staff_id: string;
  created_at: number;
  attempts: number;
  last_error?: string;
}

export interface ClinicCache {
  clinic_id: string;
  clinic_data: Clinic;
  cached_at: number;
  expires_at: number;
}

export interface DBStats {
  analyses_count: number;
  leads_count: number;
  pending_sync_count: number;
  clinic_cache_count: number;
  total_size_mb: number;
  last_cleanup: number | null;
}

// ============================================================================
// IndexedDB Manager Class
// ============================================================================

export class IndexedDBManager {
  private dbName = 'cliniciq-multi-clinic';
  private dbVersion = 2; // Increment for schema changes
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      throw new Error('IndexedDB not supported');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[IndexedDB] Open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        console.log(`[IndexedDB] Upgrading from version ${oldVersion} to ${this.dbVersion}`);

        // Create object stores with indexes
        if (!db.objectStoreNames.contains('analyses')) {
          const analysesStore = db.createObjectStore('analyses', { keyPath: 'id' });
          analysesStore.createIndex('clinic_id', 'clinic_id', { unique: false });
          analysesStore.createIndex('sales_staff_id', 'sales_staff_id', { unique: false });
          analysesStore.createIndex('offline_timestamp', 'offline_timestamp', { unique: false });
          analysesStore.createIndex('synced', 'synced', { unique: false });
          analysesStore.createIndex('clinic_sales', ['clinic_id', 'sales_staff_id'], { unique: false });
        }

        if (!db.objectStoreNames.contains('leads')) {
          const leadsStore = db.createObjectStore('leads', { keyPath: 'id' });
          leadsStore.createIndex('clinic_id', 'clinic_id', { unique: false });
          leadsStore.createIndex('sales_staff_id', 'sales_staff_id', { unique: false });
          leadsStore.createIndex('status', 'status', { unique: false });
          leadsStore.createIndex('synced', 'synced', { unique: false });
          leadsStore.createIndex('clinic_sales', ['clinic_id', 'sales_staff_id'], { unique: false });
        }

        if (!db.objectStoreNames.contains('sync-queue')) {
          const syncStore = db.createObjectStore('sync-queue', { keyPath: 'id' });
          syncStore.createIndex('clinic_id', 'clinic_id', { unique: false });
          syncStore.createIndex('action_type', 'action_type', { unique: false });
          syncStore.createIndex('created_at', 'created_at', { unique: false });
        }

        if (!db.objectStoreNames.contains('clinic-cache')) {
          const cacheStore = db.createObjectStore('clinic-cache', { keyPath: 'clinic_id' });
          cacheStore.createIndex('expires_at', 'expires_at', { unique: false });
        }

        console.log('[IndexedDB] Schema upgrade completed');
      };
    });
  }

  /**
   * Get database instance (auto-initialize if needed)
   */
  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  // ============================================================================
  // Analysis Operations
  // ============================================================================

  /**
   * Save analysis to offline storage (max 50 per sales staff)
   */
  async saveAnalysis(analysis: MultiTenantSkinAnalysis, isOfflineCreated = false): Promise<void> {
    const db = await this.getDB();

    const offlineAnalysis: OfflineAnalysis = {
      ...analysis,
      offline_created: isOfflineCreated,
      offline_timestamp: Date.now(),
      synced: !isOfflineCreated,
      sync_attempts: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['analyses'], 'readwrite');
      const store = transaction.objectStore('analyses');
      const request = store.put(offlineAnalysis);

      request.onsuccess = async () => {
        console.log(`[IndexedDB] Analysis saved: ${analysis.id}`);

        // Cleanup: Keep only last 50 per sales staff
        if (analysis.sales_staff_id) {
          await this.cleanupOldAnalyses(analysis.sales_staff_id, 50);
        }

        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to save analysis:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get analyses for specific sales staff (clinic-scoped)
   */
  async getAnalysesBySalesStaff(
    clinicId: string,
    salesStaffId: string,
    limit = 50
  ): Promise<OfflineAnalysis[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['analyses'], 'readonly');
      const store = transaction.objectStore('analyses');
      const index = store.index('clinic_sales');
      const request = index.getAll([clinicId, salesStaffId]);

      request.onsuccess = () => {
        const results = request.result as OfflineAnalysis[];
        // Sort by timestamp descending, limit results
        const sorted = results
          .sort((a, b) => b.offline_timestamp - a.offline_timestamp)
          .slice(0, limit);
        resolve(sorted);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to get analyses:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get unsynced analyses
   */
  async getUnsyncedAnalyses(): Promise<OfflineAnalysis[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['analyses'], 'readonly');
      const store = transaction.objectStore('analyses');
      const index = store.index('synced');
  const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => {
        resolve(request.result as OfflineAnalysis[]);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark analysis as synced
   */
  async markAnalysisSynced(analysisId: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['analyses'], 'readwrite');
      const store = transaction.objectStore('analyses');
      const getRequest = store.get(analysisId);

      getRequest.onsuccess = () => {
        const analysis = getRequest.result as OfflineAnalysis;
        if (analysis) {
          analysis.synced = true;
          const putRequest = store.put(analysis);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Already deleted
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Cleanup old analyses (keep only last N per sales staff)
   */
  private async cleanupOldAnalyses(salesStaffId: string, keepLast = 50): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['analyses'], 'readwrite');
      const store = transaction.objectStore('analyses');
      const index = store.index('sales_staff_id');
      const request = index.getAll(salesStaffId);

      request.onsuccess = () => {
        const analyses = request.result as OfflineAnalysis[];

        // Sort by timestamp descending
        const sorted = analyses.sort((a, b) => b.offline_timestamp - a.offline_timestamp);

        const now = Date.now();
        const overflow = sorted.slice(keepLast);

        const deletions: OfflineAnalysis[] = [];
        const remainingOverflow: OfflineAnalysis[] = [];

        for (const entry of overflow) {
          const age = now - entry.offline_timestamp;
          if (entry.synced && age > 24 * 60 * 60 * 1000) {
            deletions.push(entry);
          } else {
            remainingOverflow.push(entry);
          }
        }

        const stillOverCapacity = sorted.length - keepLast - deletions.length;
        if (stillOverCapacity > 0) {
          deletions.push(...remainingOverflow.slice(0, stillOverCapacity));
        }

        if (deletions.length === 0) {
          console.log('[IndexedDB] Cleaned up 0 old analyses');
          resolve();
          return;
        }

        const deletionPromises = deletions.map((a) => {
          return new Promise<void>((res, rej) => {
            const deleteRequest = store.delete(a.id);
            deleteRequest.onsuccess = () => res();
            deleteRequest.onerror = () => rej(deleteRequest.error);
          });
        });

        Promise.all(deletionPromises)
          .then(() => {
            console.log(`[IndexedDB] Cleaned up ${deletions.length} old analyses`);
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // Lead Operations
  // ============================================================================

  /**
   * Save lead to offline storage
   */
  async saveLead(lead: Lead, isOfflineCreated = false): Promise<void> {
    const db = await this.getDB();

    const offlineLead: OfflineLead = {
      ...lead,
      offline_created: isOfflineCreated,
      offline_timestamp: Date.now(),
      synced: !isOfflineCreated,
      sync_attempts: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['leads'], 'readwrite');
      const store = transaction.objectStore('leads');
      const request = store.put(offlineLead);

      request.onsuccess = () => {
        console.log(`[IndexedDB] Lead saved: ${lead.id}`);
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Failed to save lead:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get leads for specific sales staff (clinic-scoped)
   */
  async getLeadsBySalesStaff(clinicId: string, salesStaffId: string): Promise<OfflineLead[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['leads'], 'readonly');
      const store = transaction.objectStore('leads');
      const index = store.index('clinic_sales');
      const request = index.getAll([clinicId, salesStaffId]);

      request.onsuccess = () => {
        const results = request.result as OfflineLead[];
        // Sort by created_at descending
        const sorted = results.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        resolve(sorted);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unsynced leads
   */
  async getUnsyncedLeads(): Promise<OfflineLead[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['leads'], 'readonly');
      const store = transaction.objectStore('leads');
      const index = store.index('synced');
  const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => {
        resolve(request.result as OfflineLead[]);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark lead as synced
   */
  async markLeadSynced(leadId: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['leads'], 'readwrite');
      const store = transaction.objectStore('leads');
      const getRequest = store.get(leadId);

      getRequest.onsuccess = () => {
        const lead = getRequest.result as OfflineLead;
        if (lead) {
          lead.synced = true;
          const putRequest = store.put(lead);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Already deleted
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ============================================================================
  // Sync Queue Operations
  // ============================================================================

  /**
   * Add action to sync queue
   */
  async addToSyncQueue(action: Omit<SyncAction, 'id' | 'created_at' | 'attempts'>): Promise<void> {
    const db = await this.getDB();

    const syncAction: SyncAction = {
      ...action,
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: Date.now(),
      attempts: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      const request = store.add(syncAction);

      request.onsuccess = () => {
        console.log(`[IndexedDB] Sync action queued: ${syncAction.id}`);
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending sync actions
   */
  async getPendingSyncActions(): Promise<SyncAction[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync-queue'], 'readonly');
      const store = transaction.objectStore('sync-queue');
      const request = store.getAll();

      request.onsuccess = () => {
        const actions = request.result as SyncAction[];
        // Sort by created_at ascending (FIFO)
        const sorted = actions.sort((a, b) => a.created_at - b.created_at);
        resolve(sorted);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove sync action from queue
   */
  async removeSyncAction(actionId: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      const request = store.delete(actionId);

      request.onsuccess = () => {
        console.log(`[IndexedDB] Sync action removed: ${actionId}`);
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update sync action attempt count
   */
  async updateSyncActionAttempt(actionId: string, error?: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      const getRequest = store.get(actionId);

      getRequest.onsuccess = () => {
        const action = getRequest.result as SyncAction;
        if (action) {
          action.attempts += 1;
          if (error) {
            action.last_error = error;
          }
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Already deleted
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ============================================================================
  // Clinic Cache Operations
  // ============================================================================

  /**
   * Cache clinic data
   */
  async cacheClinic(clinic: Clinic, ttlSeconds = 3600): Promise<void> {
    const db = await this.getDB();

    const cacheEntry: ClinicCache = {
      clinic_id: clinic.id,
      clinic_data: clinic,
      cached_at: Date.now(),
      expires_at: Date.now() + ttlSeconds * 1000,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['clinic-cache'], 'readwrite');
      const store = transaction.objectStore('clinic-cache');
      const request = store.put(cacheEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached clinic data
   */
  async getCachedClinic(clinicId: string): Promise<Clinic | null> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['clinic-cache'], 'readonly');
      const store = transaction.objectStore('clinic-cache');
      const request = store.get(clinicId);

      request.onsuccess = () => {
        const cacheEntry = request.result as ClinicCache;

        if (!cacheEntry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() > cacheEntry.expires_at) {
          console.log(`[IndexedDB] Clinic cache expired: ${clinicId}`);
          resolve(null);
          return;
        }

        resolve(cacheEntry.clinic_data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // Statistics & Maintenance
  // ============================================================================

  /**
   * Get database statistics
   */
  async getStats(): Promise<DBStats> {
    const db = await this.getDB();

    return new Promise(async (resolve, reject) => {
      try {
        const analysesCount = await this.getStoreCount(db, 'analyses');
        const leadsCount = await this.getStoreCount(db, 'leads');
        const pendingSyncCount = await this.getStoreCount(db, 'sync-queue');
        const clinicCacheCount = await this.getStoreCount(db, 'clinic-cache');

        // Estimate size (rough calculation)
        const estimatedSize =
          (analysesCount * 5 + leadsCount * 3 + pendingSyncCount * 2 + clinicCacheCount * 1) / 1024;

        resolve({
          analyses_count: analysesCount,
          leads_count: leadsCount,
          pending_sync_count: pendingSyncCount,
          clinic_cache_count: clinicCacheCount,
          total_size_mb: estimatedSize,
          last_cleanup: null,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clear all data (for testing or reset)
   */
  async clearAll(): Promise<void> {
    const db = await this.getDB();

    const stores = ['analyses', 'leads', 'sync-queue', 'clinic-cache'];

    for (const storeName of stores) {
      console.log(`[IndexedDB] Clearing store ${storeName}`);
      await new Promise<void>((resolveStore, rejectStore) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const clearRequest = store.clear();

        transaction.onerror = () => rejectStore(transaction.error ?? undefined);
        transaction.onabort = () => rejectStore(transaction.error ?? undefined);

        clearRequest.onsuccess = () => resolveStore();
        clearRequest.onerror = () => rejectStore(clearRequest.error ?? undefined);
      });
    }

    console.log('[IndexedDB] All data cleared');
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async getStoreCount(db: IDBDatabase, storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let indexedDBInstance: IndexedDBManager | null = null;

export function getIndexedDB(): IndexedDBManager {
  if (!indexedDBInstance) {
    indexedDBInstance = new IndexedDBManager();
  }
  return indexedDBInstance;
}

export function resetIndexedDB(): void {
  indexedDBInstance = null;
}
