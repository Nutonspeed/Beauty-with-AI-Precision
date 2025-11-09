/**
 * Image Cache Manager
 * LRU (Least Recently Used) cache for analysis images
 * Improves performance by caching frequently accessed images
 */

interface ImageData {
  url: string
  blob: Blob
  dataUrl: string
  timestamp: number
  size: number
  metadata?: {
    width: number
    height: number
    type: string
  }
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  currentSize: number
  maxSize: number
  itemCount: number
}

export class ImageCacheManager {
  private cache: Map<string, ImageData> = new Map()
  private accessOrder: string[] = [] // Track access order for LRU
  private maxSize: number // Max number of images
  private maxBytes: number // Max total cache size in bytes
  private currentBytes: number = 0

  // Statistics
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    currentSize: 0,
    maxSize: 0,
    itemCount: 0,
  }

  constructor(maxSize: number = 50, maxBytes: number = 100 * 1024 * 1024) {
    // Default: 50 images or 100MB
    this.maxSize = maxSize
    this.maxBytes = maxBytes
    this.stats.maxSize = maxSize
  }

  /**
   * Get image from cache
   */
  async get(url: string): Promise<ImageData | null> {
    if (this.cache.has(url)) {
      // Update access order (move to end = most recently used)
      this.updateAccessOrder(url)
      this.stats.hits++
      return this.cache.get(url)!
    }

    this.stats.misses++
    return null
  }

  /**
   * Add or update image in cache
   */
  async set(url: string, blob: Blob, metadata?: ImageData['metadata']): Promise<void> {
    const imageSize = blob.size

    // Don't cache if image is too large (>10MB)
    if (imageSize > 10 * 1024 * 1024) {
      console.warn(`Image too large to cache: ${imageSize} bytes`)
      return
    }

    // Create data URL for immediate display
    const dataUrl = await this.blobToDataUrl(blob)

    const imageData: ImageData = {
      url,
      blob,
      dataUrl,
      timestamp: Date.now(),
      size: imageSize,
      metadata,
    }

    // Evict items if necessary
    await this.evictIfNeeded(imageSize)

    // Add to cache
    this.cache.set(url, imageData)
    this.currentBytes += imageSize
    this.updateAccessOrder(url)

    this.stats.currentSize = this.currentBytes
    this.stats.itemCount = this.cache.size
  }

  /**
   * Check if image exists in cache
   */
  has(url: string): boolean {
    return this.cache.has(url)
  }

  /**
   * Remove specific image from cache
   */
  delete(url: string): boolean {
    const imageData = this.cache.get(url)
    if (imageData) {
      this.currentBytes -= imageData.size
      this.cache.delete(url)
      this.accessOrder = this.accessOrder.filter((u) => u !== url)
      this.stats.currentSize = this.currentBytes
      this.stats.itemCount = this.cache.size
      return true
    }
    return false
  }

  /**
   * Clear all cached images
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.currentBytes = 0
    this.stats.currentSize = 0
    this.stats.itemCount = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total > 0 ? this.stats.hits / total : 0
  }

  /**
   * Preload images for better UX
   */
  async preload(urls: string[]): Promise<void> {
    const loadPromises = urls.map(async (url) => {
      if (this.has(url)) return

      try {
        const response = await fetch(url)
        const blob = await response.blob()

        // Get image dimensions
        const metadata = await this.getImageMetadata(blob)

        await this.set(url, blob, metadata)
      } catch (error) {
        console.error(`Failed to preload image: ${url}`, error)
      }
    })

    await Promise.all(loadPromises)
  }

  // Private methods

  private updateAccessOrder(url: string): void {
    // Remove from current position
    this.accessOrder = this.accessOrder.filter((u) => u !== url)
    // Add to end (most recently used)
    this.accessOrder.push(url)
  }

  private async evictIfNeeded(newImageSize: number): Promise<void> {
    // Evict based on count
    while (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    // Evict based on total size
    while (this.currentBytes + newImageSize > this.maxBytes) {
      if (this.cache.size === 0) break
      this.evictLRU()
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return

    // Remove least recently used (first in access order)
    const lruUrl = this.accessOrder[0]
    const imageData = this.cache.get(lruUrl)

    if (imageData) {
      this.currentBytes -= imageData.size
      this.cache.delete(lruUrl)
      this.accessOrder.shift()
      this.stats.evictions++
      this.stats.currentSize = this.currentBytes
      this.stats.itemCount = this.cache.size
    }
  }

  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private async getImageMetadata(
    blob: Blob
  ): Promise<ImageData['metadata']> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(blob)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.width,
          height: img.height,
          type: blob.type,
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(undefined)
      }

      img.src = url
    })
  }
}

// Singleton instance
let cacheInstance: ImageCacheManager | null = null

/**
 * Get or create cache instance
 */
export function getImageCache(): ImageCacheManager {
  if (!cacheInstance) {
    cacheInstance = new ImageCacheManager()
  }
  return cacheInstance
}

/**
 * Reset cache instance (useful for testing)
 */
export function resetImageCache(): void {
  if (cacheInstance) {
    cacheInstance.clear()
  }
  cacheInstance = null
}
