import { MediaPipeAnalyzer } from "./mediapipe-analyzer-phase1";
import { TensorFlowAnalyzer } from "./tensorflow-analyzer";
import { HuggingFaceAnalyzer } from "./huggingface-analyzer";

export interface CacheEntry {
  key: string;
  result: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  size: number; // Approximate size in bytes
  accessCount: number; // Track access frequency
  lastAccess: number; // Last access timestamp
}

export interface LRUNode {
  key: string;
  value: CacheEntry;
  prev: LRUNode | null;
  next: LRUNode | null;
}

export interface PerformanceMetrics {
  initializationTime: number;
  inferenceTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  modelLoadTime: {
    mediapipe: number;
    tensorflow: number;
    huggingface: number;
  };
  cacheStats: {
    hits: number;
    misses: number;
    evictions: number;
    totalSize: number;
  };
}

/**
 * LRU Cache Implementation
 * Evicts least recently used items when cache is full
 */
class LRUCache {
  private capacity: number;
  private cache = new Map<string, LRUNode>();
  private head: LRUNode | null = null;
  private tail: LRUNode | null = null;
  private currentSize = 0;
  private maxSizeBytes: number;
  private evictionCount = 0;

  constructor(capacity: number, maxSizeBytes = 50 * 1024 * 1024) { // 50MB default
    this.capacity = capacity;
    this.maxSizeBytes = maxSizeBytes;
  }

  /**
   * Get value from cache and move to front (most recently used)
   */
  get(key: string): CacheEntry | null {
    const node = this.cache.get(key);
    if (!node) return null;

    // Move to front (most recently used)
    this.moveToFront(node);
    
    // Update access stats
    node.value.accessCount++;
    node.value.lastAccess = Date.now();

    return node.value;
  }

  /**
   * Put value in cache
   */
  put(key: string, value: CacheEntry): void {
    // Check if key already exists
    let node = this.cache.get(key);
    
    if (node) {
      // Update existing node
      this.currentSize -= node.value.size;
      node.value = value;
      this.currentSize += value.size;
      this.moveToFront(node);
    } else {
      // Create new node
      node = { key, value, prev: null, next: null };
      this.cache.set(key, node);
      this.currentSize += value.size;
      this.addToFront(node);

      // Evict if over capacity or size limit
      while ((this.cache.size > this.capacity || this.currentSize > this.maxSizeBytes) && this.tail) {
        this.evictLRU();
      }
    }
  }

  /**
   * Remove entry from cache
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    this.currentSize -= node.value.size;
    return true;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get total size in bytes
   */
  get totalSize(): number {
    return this.currentSize;
  }

  /**
   * Get eviction count
   */
  get evictions(): number {
    return this.evictionCount;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.currentSize = 0;
    this.evictionCount = 0;
  }

  /**
   * Get all entries (for iteration)
   */
  entries(): Array<[string, CacheEntry]> {
    const result: Array<[string, CacheEntry]> = [];
    for (const [key, node] of this.cache.entries()) {
      result.push([key, node.value]);
    }
    return result;
  }

  // === LRU Helpers ===

  private moveToFront(node: LRUNode): void {
    if (node === this.head) return;
    
    this.removeNode(node);
    this.addToFront(node);
  }

  private addToFront(node: LRUNode): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private evictLRU(): void {
    if (!this.tail) return;

    const evicted = this.tail;
    this.removeNode(evicted);
    this.cache.delete(evicted.key);
    this.currentSize -= evicted.value.size;
    this.evictionCount++;
  }
}

/**
 * Performance Optimizer for Hybrid AI Analyzer
 * Implements LRU caching, lazy loading, and parallel processing optimizations
 */
export class PerformanceOptimizer {
  private cache: LRUCache;
  private lazyLoadPromises = new Map<string, Promise<any>>();
  private metrics: PerformanceMetrics = {
    initializationTime: 0,
    inferenceTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    modelLoadTime: {
      mediapipe: 0,
      tensorflow: 0,
      huggingface: 0
    },
    cacheStats: {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0
    }
  };

  private cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };

  // Configuration
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum cache entries (increased from 50)
  private readonly MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50MB
  private readonly CONCURRENT_LIMIT = 3; // Max concurrent model loads

  constructor() {
    this.cache = new LRUCache(this.MAX_CACHE_SIZE, this.MAX_CACHE_BYTES);
  }

  /**
   * Generate cache key for image data
   */
  public buildCacheKey(imageData: ImageData, model: string, params?: any): string {
    // Handle null/undefined imageData
    if (!imageData || !imageData.data) {
      return `${model}_invalid_${Date.now()}`;
    }

    // Create a simple hash of image data for caching
    const data = imageData.data.slice(0, 100); // Use first 100 pixels for hash
    const hash = this.simpleHash(data);

    const paramStr = params ? JSON.stringify(params) : '';
    return `${model}_${hash}_${paramStr}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(data: Uint8ClampedArray): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Public helper to compute a stable image hash for external use
   */
  public computeImageHash(imageData: ImageData): string {
    if (!imageData || !imageData.data) return `invalid_${Date.now()}`;
    const data = imageData.data.slice(0, 100);
    return this.simpleHash(data);
  }

  /**
   * Check if result is cached and valid
   */
  private getCachedResult(key: string): any | null {
    this.cacheStats.totalRequests++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    this.cacheStats.hits++;
    return entry.result;
  }

  /**
   * Cache result with TTL and size tracking
   */
  private setCachedResult(key: string, result: any, ttl = this.CACHE_TTL): void {
    // Estimate result size (rough approximation)
    const size = this.estimateSize(result);

    const entry: CacheEntry = {
      key,
      result,
      timestamp: Date.now(),
      ttl,
      size,
      accessCount: 1,
      lastAccess: Date.now()
    };

    this.cache.put(key, entry);
  }

  /**
   * Estimate object size in bytes (rough approximation)
   */
  private estimateSize(obj: any): number {
    if (obj === null || obj === undefined) return 0;
    
    const type = typeof obj;
    if (type === 'string') return obj.length * 2; // UTF-16
    if (type === 'number') return 8;
    if (type === 'boolean') return 4;
    
    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.estimateSize(item), 0);
    }
    
    if (type === 'object') {
      // Rough estimate for objects
      const jsonStr = JSON.stringify(obj);
      return jsonStr.length * 2;
    }
    
    return 100; // Default estimate
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return total > 0 ? this.cacheStats.hits / total : 0;
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate cache by pattern
   * @param pattern - Regex pattern to match cache keys
   */
  invalidateCacheByPattern(pattern: RegExp): number {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    return keysToDelete.length;
  }

  /**
   * Invalidate all cache for a specific model
   * @param model - Model name ('mediapipe', 'tensorflow', 'huggingface', or 'combined:*')
   */
  invalidateModel(model: string): number {
    const pattern = new RegExp(`^${model.replace('*', '.*')}_`);
    return this.invalidateCacheByPattern(pattern);
  }

  /**
   * Warm up cache with precomputed results
   * @param imageData - Image to cache
   * @param results - Precomputed results
   */
  warmCache(imageData: ImageData, results: {
    mediapipe?: any;
    tensorflow?: any;
    huggingface?: any;
    combined?: any;
  }): void {
    if (results.mediapipe) {
      const key = this.buildCacheKey(imageData, 'mediapipe');
      this.setCachedResult(key, results.mediapipe);
    }

    if (results.tensorflow) {
      const key = this.buildCacheKey(imageData, 'tensorflow');
      this.setCachedResult(key, results.tensorflow);
    }

    if (results.huggingface) {
      const key = this.buildCacheKey(imageData, 'huggingface');
      this.setCachedResult(key, results.huggingface);
    }

    if (results.combined) {
      const key = this.buildCacheKey(imageData, 'combined:hybrid');
      this.setCachedResult(key, results.combined);
    }
  }

  /**
   * Lazy load MediaPipe analyzer
   */
  async lazyLoadMediaPipe(): Promise<MediaPipeAnalyzer> {
    const key = 'mediapipe';

    if (this.lazyLoadPromises.has(key)) {
      return this.lazyLoadPromises.get(key)!;
    }

    const loadPromise = (async () => {
      const startTime = Date.now();
      const analyzer = new MediaPipeAnalyzer();
      await analyzer.initialize();
      this.metrics.modelLoadTime.mediapipe = Date.now() - startTime;
      return analyzer;
    })();

    this.lazyLoadPromises.set(key, loadPromise);
    return loadPromise;
  }

  /**
   * Lazy load TensorFlow analyzer
   */
  async lazyLoadTensorFlow(): Promise<TensorFlowAnalyzer> {
    const key = 'tensorflow';

    if (this.lazyLoadPromises.has(key)) {
      return this.lazyLoadPromises.get(key)!;
    }

    const loadPromise = (async () => {
      const startTime = Date.now();
      const analyzer = new TensorFlowAnalyzer();
      await analyzer.initialize();
      this.metrics.modelLoadTime.tensorflow = Date.now() - startTime;
      return analyzer;
    })();

    this.lazyLoadPromises.set(key, loadPromise);
    return loadPromise;
  }

  /**
   * Lazy load Hugging Face analyzer
   */
  async lazyLoadHuggingFace(): Promise<HuggingFaceAnalyzer> {
    const key = 'huggingface';

    if (this.lazyLoadPromises.has(key)) {
      return this.lazyLoadPromises.get(key)!;
    }

    const loadPromise = (async () => {
      const startTime = Date.now();
      const analyzer = new HuggingFaceAnalyzer();
      await analyzer.initialize();
      this.metrics.modelLoadTime.huggingface = Date.now() - startTime;
      return analyzer;
    })();

    this.lazyLoadPromises.set(key, loadPromise);
    return loadPromise;
  }

  /**
   * Optimized MediaPipe analysis with caching
   */
  async analyzeWithMediaPipe(imageData: ImageData, useCache = true): Promise<any> {
  const cacheKey = this.buildCacheKey(imageData, 'mediapipe');

    if (useCache) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    const analyzer = await this.lazyLoadMediaPipe();
    const startTime = Date.now();
    const result = await analyzer.analyzeSkin(imageData);
    this.metrics.inferenceTime = Date.now() - startTime;

    if (useCache) {
      this.setCachedResult(cacheKey, result);
    }

    return result;
  }

  /**
   * Optimized TensorFlow analysis with caching
   */
  async analyzeWithTensorFlow(imageData: ImageData, useCache = true): Promise<any> {
  const cacheKey = this.buildCacheKey(imageData, 'tensorflow');

    if (useCache) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    const analyzer = await this.lazyLoadTensorFlow();
    const startTime = Date.now();
    const result = await analyzer.analyzeSkin(imageData);
    this.metrics.inferenceTime = Date.now() - startTime;

    if (useCache) {
      this.setCachedResult(cacheKey, result);
    }

    return result;
  }

  /**
   * Optimized Hugging Face analysis with caching
   */
  async analyzeWithHuggingFace(imageData: ImageData, useCache = true): Promise<any> {
  const cacheKey = this.buildCacheKey(imageData, 'huggingface');

    if (useCache) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    const analyzer = await this.lazyLoadHuggingFace();
    const startTime = Date.now();
    const result = await analyzer.analyzeSkin(imageData);
    this.metrics.inferenceTime = Date.now() - startTime;

    if (useCache) {
      this.setCachedResult(cacheKey, result);
    }

    return result;
  }

  /**
   * Parallel analysis with optimized loading
   */
  async analyzeParallel(imageData: ImageData, useCache = true): Promise<{
    mediapipe: any;
    tensorflow: any;
    huggingface: any;
  }> {
    // Start all lazy loads concurrently
    const loadPromises = [
      this.lazyLoadMediaPipe(),
      this.lazyLoadTensorFlow(),
      this.lazyLoadHuggingFace()
    ];

    // Wait for all models to be ready
    const [mpAnalyzer, tfAnalyzer, hfAnalyzer] = await Promise.all(loadPromises);

    // Check cache for each model
    const cacheKeys = [
      this.buildCacheKey(imageData, 'mediapipe'),
      this.buildCacheKey(imageData, 'tensorflow'),
      this.buildCacheKey(imageData, 'huggingface')
    ];

    const cachedResults = useCache ? cacheKeys.map(key => this.getCachedResult(key)) : [null, null, null];

    // Run analyses for non-cached results
    const analysisPromises = [
      cachedResults[0] || mpAnalyzer.analyzeSkin(imageData),
      cachedResults[1] || tfAnalyzer.analyzeSkin(imageData),
      cachedResults[2] || hfAnalyzer.analyzeSkin(imageData)
    ];

    const startTime = Date.now();
    const results = await Promise.all(analysisPromises);
    this.metrics.inferenceTime = Date.now() - startTime;

    // Cache new results
    if (useCache) {
      results.forEach((result, index) => {
        if (!cachedResults[index]) {
          this.setCachedResult(cacheKeys[index], result);
        }
      });
    }

    return {
      mediapipe: results[0],
      tensorflow: results[1],
      huggingface: results[2]
    };
  }

  /**
   * Memory-optimized analysis for mobile devices
   */
  async analyzeMobileOptimized(imageData: ImageData): Promise<{
    mediapipe: any;
    tensorflow: any;
    huggingface: any;
  }> {
    // For mobile, prioritize MediaPipe and TensorFlow, skip HuggingFace if memory is low
    const isLowMemory = this.isLowMemoryDevice();

    if (isLowMemory) {
      console.log('Low memory detected, using lightweight analysis');

      // Load only essential models
      const [mpAnalyzer, tfAnalyzer] = await Promise.all([
        this.lazyLoadMediaPipe(),
        this.lazyLoadTensorFlow()
      ]);

      const results = await Promise.all([
        this.analyzeWithMediaPipe(imageData, true),
        this.analyzeWithTensorFlow(imageData, true)
      ]);

      return {
        mediapipe: results[0],
        tensorflow: results[1],
        huggingface: null // Skip heavy model
      };
    }

    // Normal parallel analysis for devices with sufficient memory
    return this.analyzeParallel(imageData, true);
  }

  /**
   * Check if device is mobile
   */
  isMobileDevice(): boolean {
    if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if device has low memory
   */
  isLowMemoryDevice(): boolean {
    // Check available memory (if available)
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedPercent = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
      return usedPercent > 0.8; // Consider low memory if >80% used
    }

    // Fallback: assume mobile devices have limited memory
    return this.isMobileDevice();
  }

  /**
   * Generic combined-result cache helpers for high-level analyzers
   */
  public getCachedCombined(imageData: ImageData, namespace = 'hybrid', params?: any): any | null {
    const key = this.buildCacheKey(imageData, `combined:${namespace}`, params);
    return this.getCachedResult(key);
  }

  public setCachedCombined(
    imageData: ImageData,
    value: any,
    namespace = 'hybrid',
    params?: any,
    ttl = this.CACHE_TTL
  ): void {
    const key = this.buildCacheKey(imageData, `combined:${namespace}`, params);
    this.setCachedResult(key, value, ttl);
  }

  /**
   * Preload models for better performance
   */
  async preloadModels(): Promise<void> {
    const startTime = Date.now();

    // Preload all models concurrently with concurrency limit
    const loadPromises = [
      this.lazyLoadMediaPipe(),
      this.lazyLoadTensorFlow(),
      this.lazyLoadHuggingFace()
    ];

    await Promise.all(loadPromises);
    this.metrics.initializationTime = Date.now() - startTime;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.metrics.cacheHitRate = this.getCacheHitRate();
    this.metrics.memoryUsage = this.cache.size;
    this.metrics.cacheStats = {
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses,
      evictions: this.cache.evictions,
      totalSize: this.cache.totalSize
    };

    return { ...this.metrics };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheStats.hits = 0;
    this.cacheStats.misses = 0;
    this.cacheStats.totalRequests = 0;
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    size: number;
    capacity: number;
    totalSize: number;
    maxSize: number;
    hitRate: number;
    hits: number;
    misses: number;
    evictions: number;
  } {
    return {
      size: this.cache.size,
      capacity: this.MAX_CACHE_SIZE,
      totalSize: this.cache.totalSize,
      maxSize: this.MAX_CACHE_BYTES,
      hitRate: this.getCacheHitRate(),
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses,
      evictions: this.cache.evictions
    };
  }

  /**
   * Dispose of loaded models to free memory
   */
  dispose(): void {
    this.cache.clear();
    this.lazyLoadPromises.clear();
    this.cacheStats.hits = 0;
    this.cacheStats.misses = 0;
    this.cacheStats.totalRequests = 0;

    // Force garbage collection if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }
}

// Singleton instance
let optimizerInstance: PerformanceOptimizer | null = null;

/**
 * Get performance optimizer instance (singleton)
 */
export function getPerformanceOptimizer(): PerformanceOptimizer {
  optimizerInstance ??= new PerformanceOptimizer();
  return optimizerInstance;
}
