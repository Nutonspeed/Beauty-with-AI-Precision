/**
 * API Cache Headers Utility
 * Consistent caching strategy for all API routes
 */

export type CacheStrategy = 
  | 'no-cache'      // Always fresh
  | 'private'       // User-specific, cacheable
  | 'public-short'  // Public, 1 minute
  | 'public-medium' // Public, 5 minutes  
  | 'public-long'   // Public, 1 hour
  | 'immutable'     // Never changes

const cacheConfigs: Record<CacheStrategy, string> = {
  'no-cache': 'no-cache, no-store, must-revalidate',
  'private': 'private, max-age=60, stale-while-revalidate=300',
  'public-short': 'public, max-age=60, stale-while-revalidate=120',
  'public-medium': 'public, max-age=300, stale-while-revalidate=600',
  'public-long': 'public, max-age=3600, stale-while-revalidate=7200',
  'immutable': 'public, max-age=31536000, immutable',
}

/**
 * Get cache control header value
 */
export function getCacheControl(strategy: CacheStrategy): string {
  return cacheConfigs[strategy]
}

/**
 * Create headers object with cache control
 */
export function withCacheHeaders(
  strategy: CacheStrategy,
  additionalHeaders?: Record<string, string>
): HeadersInit {
  return {
    'Cache-Control': getCacheControl(strategy),
    ...additionalHeaders,
  }
}

/**
 * Recommended cache strategies by endpoint type
 */
export const recommendedStrategies = {
  // User-specific data
  userProfile: 'private' as CacheStrategy,
  userSettings: 'private' as CacheStrategy,
  
  // Frequently changing
  notifications: 'no-cache' as CacheStrategy,
  realtime: 'no-cache' as CacheStrategy,
  
  // Semi-static
  treatments: 'public-medium' as CacheStrategy,
  products: 'public-medium' as CacheStrategy,
  
  // Rarely changing
  clinicInfo: 'public-long' as CacheStrategy,
  staticContent: 'public-long' as CacheStrategy,
  
  // Never changes
  assets: 'immutable' as CacheStrategy,
}

/**
 * Example usage in API route:
 * 
 * import { withCacheHeaders } from '@/lib/api/cache-headers'
 * 
 * return NextResponse.json(data, {
 *   headers: withCacheHeaders('public-medium')
 * })
 */
