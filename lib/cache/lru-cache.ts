/**
 * Simple LRU (Least Recently Used) Cache
 * In-memory caching for frequently accessed data
 * 
 * Use Cases:
 * - Analysis results (avoid re-querying database)
 * - User profiles
 * - Clinic data
 * 
 * For Production: Consider Redis/Memcached for distributed caching
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export class LRUCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number; // Time to live in milliseconds

  constructor(maxSize: number = 1000, defaultTTLSeconds: number = 300) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttlSeconds?: number): void {
    const now = Date.now();
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiresAt: now + ttl,
      accessCount: 0,
      lastAccessed: now,
    });
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set pattern: Get from cache, or compute and store
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttlSeconds);
    
    return value;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let totalAccessCount = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      totalAccessCount += entry.accessCount;
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccessCount,
      expiredCount,
      hitRate: totalAccessCount > 0 ? (this.cache.size / totalAccessCount) * 100 : 0,
    };
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

// ============================================================================
// Global Cache Instances (Singletons)
// ============================================================================

// Analysis cache (300 seconds = 5 minutes)
export const analysisCache = new LRUCache<any>(500, 300);

// User cache (600 seconds = 10 minutes)
export const userCache = new LRUCache<any>(200, 600);

// Clinic cache (3600 seconds = 1 hour)
export const clinicCache = new LRUCache<any>(50, 3600);

// General cache
export const generalCache = new LRUCache<any>(1000, 300);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Cache key generators
 */
export const CacheKeys = {
  analysis: (id: string) => `analysis:${id}`,
  analysisHistory: (userId: string) => `analysis:history:${userId}`,
  clinicAnalyses: (clinicId: string, page: number = 1) => 
    `analysis:clinic:${clinicId}:page:${page}`,
  salesAnalyses: (salesId: string, page: number = 1) => 
    `analysis:sales:${salesId}:page:${page}`,
  
  user: (id: string) => `user:${id}`,
  userWithClinic: (id: string) => `user:clinic:${id}`,
  
  clinic: (id: string) => `clinic:${id}`,
  clinicStats: (id: string) => `clinic:stats:${id}`,
  clinicStaff: (id: string) => `clinic:staff:${id}`,
  
  lead: (id: string) => `lead:${id}`,
  clinicLeads: (clinicId: string, status?: string) => 
    `lead:clinic:${clinicId}:${status || 'all'}`,
  salesLeads: (salesId: string, status?: string) => 
    `lead:sales:${salesId}:${status || 'all'}`,
};

/**
 * Invalidate related cache keys
 */
export function invalidateAnalysisCache(analysisId: string, userId?: string, clinicId?: string) {
  analysisCache.delete(CacheKeys.analysis(analysisId));
  
  if (userId) {
    analysisCache.delete(CacheKeys.analysisHistory(userId));
  }
  
  if (clinicId) {
    // Invalidate all pages (simple approach: clear all clinic analyses)
    for (let i = 1; i <= 10; i++) {
      analysisCache.delete(CacheKeys.clinicAnalyses(clinicId, i));
    }
  }
}

export function invalidateUserCache(userId: string) {
  userCache.delete(CacheKeys.user(userId));
  userCache.delete(CacheKeys.userWithClinic(userId));
}

export function invalidateClinicCache(clinicId: string) {
  clinicCache.delete(CacheKeys.clinic(clinicId));
  clinicCache.delete(CacheKeys.clinicStats(clinicId));
  clinicCache.delete(CacheKeys.clinicStaff(clinicId));
}

export function invalidateLeadCache(leadId: string, salesId?: string, clinicId?: string) {
  generalCache.delete(CacheKeys.lead(leadId));
  
  if (salesId) {
    generalCache.delete(CacheKeys.salesLeads(salesId));
    generalCache.delete(CacheKeys.salesLeads(salesId, 'hot'));
    generalCache.delete(CacheKeys.salesLeads(salesId, 'warm'));
  }
  
  if (clinicId) {
    generalCache.delete(CacheKeys.clinicLeads(clinicId));
  }
}

// ============================================================================
// Auto Cleanup (Run every 5 minutes)
// ============================================================================

if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    const removed = {
      analysis: analysisCache.cleanup(),
      user: userCache.cleanup(),
      clinic: clinicCache.cleanup(),
      general: generalCache.cleanup(),
    };
    
    const total = removed.analysis + removed.user + removed.clinic + removed.general;
    
    if (total > 0) {
      console.log('[Cache] Cleaned up expired entries:', removed);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

export default {
  analysisCache,
  userCache,
  clinicCache,
  generalCache,
  CacheKeys,
  invalidateAnalysisCache,
  invalidateUserCache,
  invalidateClinicCache,
  invalidateLeadCache,
};
