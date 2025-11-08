/**
 * Web Worker Manager
 * 
 * Manages Web Workers for AI processing
 * Provides promise-based API for worker communication
 * 
 * Note: MediaPipe runs on main thread due to DOM requirements
 * Note: TensorFlow.js also runs on main thread temporarily (Web Worker issues with Next.js)
 */

import { detectFaceMainThread } from './mediapipe-main-thread'
import { processSkinAnalysisMainThread } from './skin-analysis-main-thread'

export interface FaceDetectionResult {
  landmarks: Array<{ x: number; y: number; z: number }>
  boundingBox: {
    xMin: number
    yMin: number
    width: number
    height: number
  }
  confidence: number
  processingTime: number
}

export interface SkinAnalysisResult {
  overallScore: number
  visiaMetrics: {
    wrinkles: { score: number; grade: string; trend: string }
    spots: { score: number; grade: string; trend: string }
    texture: { score: number; grade: string; trend: string }
    pores: { score: number; grade: string; trend: string }
    evenness: { score: number; grade: string; trend: string }
    firmness: { score: number; grade: string; trend: string }
    radiance: { score: number; grade: string; trend: string }
    hydration: { score: number; grade: string; trend: string }
  }
  concerns: Array<{
    type: string
    severity: string
    confidence: number
  }>
  recommendations: string[]
  processingTime: number
}

class WorkerManager {
  private faceDetectionWorker: Worker | null = null
  private skinAnalysisWorker: Worker | null = null
  private isInitialized = false

  /**
   * Initialize Web Workers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🔧 Creating skin analysis Web Worker...')
      
      // Check if we're in browser environment
      if (typeof globalThis.window === 'undefined') {
        throw new TypeError('Workers can only be initialized in browser environment')
      }

      // For now, skip Web Worker and run on main thread (temporary fix)
      // TODO: Properly configure Web Workers with Next.js
      console.log('⚠️  Running skin analysis on main thread (Web Worker disabled temporarily)')
      
      this.isInitialized = true
      console.log('✅ Workers initialized (main thread mode)')
      console.log('ℹ️  MediaPipe runs on main thread')
    } catch (error) {
      console.error('❌ Failed to initialize workers:', error)
      
      // Cleanup on failure
      if (this.skinAnalysisWorker) {
        this.skinAnalysisWorker.terminate()
        this.skinAnalysisWorker = null
      }
      
      throw error
    }
  }

  /**
   * Detect face using MediaPipe (main thread)
   * MediaPipe requires DOM APIs not available in Web Workers
   */
  async detectFace(imageDataUrl: string): Promise<FaceDetectionResult> {
    // Use main thread implementation
    return await detectFaceMainThread(imageDataUrl)
  }

  /**
   * Analyze skin using TensorFlow.js (Main Thread - temporary)
   * TODO: Move back to Web Worker once Next.js configuration is fixed
   */
  async analyzeSkin(
    imageDataUrl: string,
    landmarks: Array<{ x: number; y: number; z: number }>
  ): Promise<SkinAnalysisResult> {
    // Use main thread implementation temporarily
    return await processSkinAnalysisMainThread(imageDataUrl, landmarks)
  }

  /**
   * Terminate workers
   */
  terminate(): void {
    if (this.faceDetectionWorker) {
      this.faceDetectionWorker.terminate()
      this.faceDetectionWorker = null
    }

    if (this.skinAnalysisWorker) {
      this.skinAnalysisWorker.terminate()
      this.skinAnalysisWorker = null
    }

    this.isInitialized = false
    console.log('🔌 Web Workers terminated')
  }

  /**
   * Send message to worker and wait for response
   */
  private sendMessage(
    worker: Worker,
    message: Record<string, unknown>
  ): Promise<{ type: string; result?: unknown; error?: string }> {
    return new Promise((resolve, reject) => {
      const messageType = message.type as string
      console.log(`📤 Sending message to worker: ${messageType}`)
      
      const timeout = setTimeout(() => {
        console.error(`⏰ Worker timeout after 30s for message: ${messageType}`)
        worker.removeEventListener('message', handler)
        worker.removeEventListener('error', errorHandler)
        reject(new Error(`Worker timeout: ${messageType} took longer than 30 seconds`))
      }, 30000) // 30 second timeout

      const handler = (event: MessageEvent) => {
        console.log(`📥 Received response from worker:`, event.data.type)
        clearTimeout(timeout)
        worker.removeEventListener('message', handler)
        worker.removeEventListener('error', errorHandler)
        resolve(event.data)
      }

      const errorHandler = (error: ErrorEvent) => {
        console.error(`❌ Worker error:`, error.message)
        clearTimeout(timeout)
        worker.removeEventListener('message', handler)
        worker.removeEventListener('error', errorHandler)
        reject(new Error(`Worker error: ${error.message}`))
      }

      worker.addEventListener('message', handler)
      worker.addEventListener('error', errorHandler)

      worker.postMessage(message)
    })
  }
}

// Singleton instance
let workerManager: WorkerManager | null = null

/**
 * Get or create WorkerManager instance
 */
export function getWorkerManager(): WorkerManager {
  if (!workerManager) {
    workerManager = new WorkerManager()
  }
  return workerManager
}

/**
 * Initialize workers (call once on app startup)
 */
export async function initializeWorkers(): Promise<void> {
  const manager = getWorkerManager()
  await manager.initialize()
}

/**
 * Terminate all workers (call on cleanup)
 */
export function terminateWorkers(): void {
  if (workerManager) {
    workerManager.terminate()
    workerManager = null
  }
}
