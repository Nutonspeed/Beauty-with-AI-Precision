/**
 * Global AI Model Cache
 * 
 * Purpose: Initialize and cache AI models globally to avoid re-initialization
 * 
 * Benefits:
 * - Eliminate cold start time (-500ms)
 * - Share models across multiple analyses
 * - Reduce memory usage (single instance)
 * - Background initialization (non-blocking)
 */

import { getWorkerManager } from './worker-manager'

interface ModelCacheStatus {
  isInitialized: boolean
  isInitializing: boolean
  initializationTime: number
  lastUsed: Date | null
  totalUsageCount: number
}

class AIModelCache {
  private status: ModelCacheStatus = {
    isInitialized: false,
    isInitializing: false,
    initializationTime: 0,
    lastUsed: null,
    totalUsageCount: 0,
  }

  private initializationPromise: Promise<void> | null = null

  /**
   * Initialize models in background
   * Safe to call multiple times (only initializes once)
   */
  async initializeInBackground(): Promise<void> {
    // Already initialized
    if (this.status.isInitialized) {
      console.log('✅ AI models already initialized')
      return
    }

    // Currently initializing
    if (this.status.isInitializing && this.initializationPromise) {
      console.log('⏳ AI models initialization in progress...')
      return this.initializationPromise
    }

    // Start initialization
    this.status.isInitializing = true
    console.log('🚀 Initializing AI models in background...')
    const startTime = performance.now()

    this.initializationPromise = this.doInitialize()

    try {
      await this.initializationPromise
      
      const initTime = performance.now() - startTime
      this.status.initializationTime = initTime
      this.status.isInitialized = true
      this.status.isInitializing = false

      console.log(`✅ AI models initialized successfully in ${initTime.toFixed(0)}ms`)
      console.log('💾 Models cached and ready for instant use')
    } catch (error) {
      this.status.isInitializing = false
      this.initializationPromise = null
      console.error('❌ Failed to initialize AI models:', error)
      throw error
    }
  }

  /**
   * Ensure models are initialized (wait if necessary)
   */
  async ensureInitialized(): Promise<void> {
    if (this.status.isInitialized) {
      this.recordUsage()
      return
    }

    if (this.status.isInitializing && this.initializationPromise) {
      await this.initializationPromise
      this.recordUsage()
      return
    }

    // Not initialized yet - start now
    await this.initializeInBackground()
    this.recordUsage()
  }

  /**
   * Perform actual initialization
   */
  private async doInitialize(): Promise<void> {
    const workerManager = getWorkerManager()
    await workerManager.initialize()
  }

  /**
   * Record model usage
   */
  private recordUsage(): void {
    this.status.lastUsed = new Date()
    this.status.totalUsageCount++
  }

  /**
   * Get cache status
   */
  getStatus(): ModelCacheStatus {
    return { ...this.status }
  }

  /**
   * Check if ready to use
   */
  isReady(): boolean {
    return this.status.isInitialized
  }

  /**
   * Get time saved by using cache
   */
  getTimeSaved(): number {
    // If initialized, we save the initialization time on each use
    // Except the first use (which pays the cost)
    if (this.status.totalUsageCount > 1) {
      return this.status.initializationTime * (this.status.totalUsageCount - 1)
    }
    return 0
  }

  /**
   * Clear cache (for testing or reset)
   */
  async clear(): Promise<void> {
    console.log('🗑️ Clearing AI model cache...')
    
    const workerManager = getWorkerManager()
    workerManager.terminate()

    this.status = {
      isInitialized: false,
      isInitializing: false,
      initializationTime: 0,
      lastUsed: null,
      totalUsageCount: 0,
    }

    this.initializationPromise = null
    
    console.log('✅ AI model cache cleared')
  }

  /**
   * Get cache statistics
   */
  getStatistics() {
    const timeSaved = this.getTimeSaved()
    const avgTimeSaved = this.status.totalUsageCount > 1 
      ? timeSaved / (this.status.totalUsageCount - 1) 
      : 0

    return {
      isReady: this.isReady(),
      totalUsages: this.status.totalUsageCount,
      initializationTime: this.status.initializationTime,
      totalTimeSaved: timeSaved,
      averageTimeSavedPerUse: avgTimeSaved,
      lastUsed: this.status.lastUsed,
      cacheHitRate: this.status.totalUsageCount > 0 
        ? ((this.status.totalUsageCount - 1) / this.status.totalUsageCount * 100).toFixed(1) + '%'
        : '0%',
    }
  }
}

// Singleton instance
let modelCacheInstance: AIModelCache | null = null

/**
 * Get global model cache instance
 */
export function getModelCache(): AIModelCache {
  if (!modelCacheInstance) {
    modelCacheInstance = new AIModelCache()
  }
  return modelCacheInstance
}

/**
 * Initialize models in background (safe to call on app startup)
 */
export async function initializeModelsInBackground(): Promise<void> {
  const cache = getModelCache()
  
  // Don't block - initialize in background
  cache.initializeInBackground().catch((error) => {
    console.error('Failed to initialize models in background:', error)
  })
}

/**
 * Ensure models are initialized before use
 */
export async function ensureModelsInitialized(): Promise<void> {
  const cache = getModelCache()
  await cache.ensureInitialized()
}

/**
 * Check if models are ready
 */
export function areModelsReady(): boolean {
  const cache = getModelCache()
  return cache.isReady()
}

/**
 * Get model cache statistics
 */
export function getModelCacheStats() {
  const cache = getModelCache()
  return cache.getStatistics()
}

/**
 * Clear model cache
 */
export async function clearModelCache(): Promise<void> {
  const cache = getModelCache()
  await cache.clear()
}

/**
 * React hook for model cache
 */
export function useModelCache() {
  const cache = getModelCache()
  
  return {
    initialize: () => cache.initializeInBackground(),
    ensureReady: () => cache.ensureInitialized(),
    isReady: () => cache.isReady(),
    getStats: () => cache.getStatistics(),
    clear: () => cache.clear(),
  }
}
