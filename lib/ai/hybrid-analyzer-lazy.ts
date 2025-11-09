/**
 * Lazy-loaded Hybrid Analyzer
 * Loads AI models on-demand to reduce initial bundle size
 * and improve initial page load performance
 */

import type { HybridAnalysisResult } from './hybrid-analyzer'

// Type for the actual analyzer (loaded dynamically)
type HybridAnalyzerType = typeof import('./hybrid-analyzer').HybridAnalyzer

let analyzerInstance: InstanceType<HybridAnalyzerType> | null = null
let analyzerPromise: Promise<InstanceType<HybridAnalyzerType>> | null = null

/**
 * Get or create lazy-loaded analyzer instance
 * Uses singleton pattern to avoid loading models multiple times
 */
async function getAnalyzer(): Promise<InstanceType<HybridAnalyzerType>> {
  // Return existing instance if available
  if (analyzerInstance) {
    return analyzerInstance
  }

  // Return existing promise if loading
  if (analyzerPromise) {
    return analyzerPromise
  }

  // Start loading
  analyzerPromise = (async () => {
    console.log('🚀 Loading AI models on-demand...')
    const startTime = performance.now()

    // Dynamically import the actual analyzer
    const { HybridAnalyzer } = await import('./hybrid-analyzer')

    // Create instance
    const analyzer = new HybridAnalyzer()

    // Initialize models
    await analyzer.initialize()

    const loadTime = performance.now() - startTime
    console.log(`✅ AI models loaded in ${loadTime.toFixed(0)}ms`)

    analyzerInstance = analyzer
    analyzerPromise = null // Clear promise
    return analyzer
  })()

  return analyzerPromise
}

/**
 * Analyze skin with lazy-loaded AI models
 * Automatically loads models on first use
 */
export async function analyzeSkin(
  imageData: ImageData | string
): Promise<HybridAnalysisResult> {
  const analyzer = await getAnalyzer()
  return analyzer.analyzeSkin(imageData)
}

/**
 * Check if analyzer is loaded
 */
export function isAnalyzerLoaded(): boolean {
  return analyzerInstance !== null
}

/**
 * Preload analyzer (useful for better UX)
 * Call this when you know analysis will be needed soon
 */
export async function preloadAnalyzer(): Promise<void> {
  await getAnalyzer()
}

/**
 * Reset analyzer (useful for testing or memory management)
 */
export async function resetAnalyzer(): Promise<void> {
  if (analyzerInstance) {
    // Cleanup if analyzer has cleanup method
    if ('cleanup' in analyzerInstance && typeof analyzerInstance.cleanup === 'function') {
      await analyzerInstance.cleanup()
    }
  }
  analyzerInstance = null
  analyzerPromise = null
}

/**
 * Get analyzer loading status
 */
export function getAnalyzerStatus(): {
  loaded: boolean
  loading: boolean
} {
  return {
    loaded: analyzerInstance !== null,
    loading: analyzerPromise !== null,
  }
}

// Export types
export type { HybridAnalysisResult } from './hybrid-analyzer'
