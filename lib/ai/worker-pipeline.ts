/**
 * AI Analysis Pipeline with Web Workers
 * 
 * Runs MediaPipe and TensorFlow.js in separate threads
 * Non-blocking UI during 2+ second processing
 */

import { getWorkerManager, type FaceDetectionResult, type SkinAnalysisResult } from './worker-manager'
import { getImageProcessor, type ImageQualityReport } from './image-processor'
import { optimizeImageForAI, OPTIMAL_SIZES } from './image-optimizer'
import { ensureModelsInitialized } from './model-cache'

export interface CompleteAnalysisResult {
  faceDetection: FaceDetectionResult
  skinAnalysis: SkinAnalysisResult
  qualityReport: ImageQualityReport
  totalProcessingTime: number
  timestamp: string
}

export class WorkerAIPipeline {
  private workerManager = getWorkerManager()
  private processor = getImageProcessor()
  private isInitialized = false

  /**
   * Initialize Web Workers (uses model cache for faster initialization)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Pipeline already initialized (using cached models)')
      return
    }

    console.log('🚀 Initializing AI Pipeline with Web Workers...')
    const startTime = performance.now()

    // Initialize worker manager (creates Web Workers)
    await this.workerManager.initialize()

    // Use model cache for faster initialization
    await ensureModelsInitialized()

    const initTime = performance.now() - startTime
    console.log(`✅ Web Worker Pipeline initialized in ${initTime.toFixed(0)}ms`)
    
    this.isInitialized = true
  }

  /**
   * Run complete analysis on uploaded image (non-blocking)
   */
  async analyzeImage(file: File): Promise<CompleteAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const totalStartTime = performance.now()

    // Step 1: Optimize image for AI processing (PERFORMANCE OPTIMIZATION)
    console.log('🎯 Optimizing image for AI processing...')
    const optimized = await optimizeImageForAI(file, {
      targetWidth: OPTIMAL_SIZES.BALANCED.width,
      targetHeight: OPTIMAL_SIZES.BALANCED.height,
      quality: 0.92,
      maintainAspectRatio: true,
    })
    
    console.log(`✅ Image optimized: ${optimized.originalWidth}x${optimized.originalHeight} → ${optimized.width}x${optimized.height}`)
    console.log(`📊 Size reduction: ${((1 - optimized.compressionRatio) * 100).toFixed(1)}%`)
    console.log(`⚡ Optimization time: ${optimized.processingTime.toFixed(0)}ms`)
    
    const imageDataUrl = optimized.dataUrl

    // Step 2 & 3: Run quality check and face detection in parallel (faster!)
    console.log('🔍 Starting parallel quality check + face detection...')
    const imageElement = await this.loadImageFromDataUrl(imageDataUrl)
    
    const [qualityReport, faceDetection] = await Promise.all([
      this.processor.assessQuality(imageElement),
      this.workerManager.detectFace(imageDataUrl)
    ])
    
    if (!qualityReport.isGoodQuality) {
      console.warn('⚠️ Image quality issues detected:', qualityReport.issues)
    }
    
    console.log(`✅ Parallel processing complete:`)
    console.log(`  - Face detected: ${faceDetection.landmarks.length} landmarks, confidence: ${faceDetection.confidence}`)
    console.log(`  - Quality assessed: ${qualityReport.isGoodQuality ? 'Good' : 'Issues detected'}`)

    // Step 4: Analyze skin (in Web Worker - non-blocking!)
    console.log('🧪 Starting skin analysis in Web Worker...')
    const skinAnalysis = await this.workerManager.analyzeSkin(imageDataUrl, faceDetection.landmarks)

    const totalProcessingTime = performance.now() - totalStartTime

    console.log(`✅ Complete analysis finished in ${totalProcessingTime.toFixed(0)}ms`)
    console.log(`  - Image optimization: ${optimized.processingTime.toFixed(0)}ms`)
    console.log(`  - Face detection: ${faceDetection.processingTime.toFixed(0)}ms (Web Worker)`)
    console.log(`  - Skin analysis: ${skinAnalysis.processingTime.toFixed(0)}ms (Web Worker)`)
    console.log(`  - Quality check: ${(totalProcessingTime - optimized.processingTime - faceDetection.processingTime - skinAnalysis.processingTime).toFixed(0)}ms`)

    return {
      faceDetection,
      skinAnalysis,
      qualityReport,
      totalProcessingTime,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Load image from data URL
   */
  private loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image from data URL'))
      img.src = dataUrl
    })
  }

  /**
   * Convert image element to data URL (deprecated - use optimizeImageForAI instead)
   */
  private async imageToDataUrl(image: HTMLImageElement): Promise<string> {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    
    ctx.drawImage(image, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.95)
  }

  /**
   * Run analysis with quality pre-check
   */
  async analyzeWithQualityCheck(file: File): Promise<{
    result?: CompleteAnalysisResult
    qualityIssues?: string[]
  }> {
    const imageElement = await this.processor.fileToImage(file)
    const qualityReport = await this.processor.assessQuality(imageElement)

    // Reject if quality is too poor
    if (qualityReport.score < 40) {
      return {
        qualityIssues: qualityReport.issues,
      }
    }

    try {
      const result = await this.analyzeImage(file)
      return { result }
    } catch (error) {
      console.error('Analysis failed:', error)
      throw error
    }
  }

  /**
   * Batch analyze multiple images
   */
  async analyzeMultiple(files: File[]): Promise<CompleteAnalysisResult[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const results: CompleteAnalysisResult[] = []

    for (const file of files) {
      try {
        const result = await this.analyzeImage(file)
        results.push(result)
      } catch (error) {
        console.error(`Failed to analyze ${file.name}:`, error)
      }
    }

    return results
  }

  /**
   * Get processing status
   */
  getStatus(): {
    initialized: boolean
    backend: string
    useWebWorkers: boolean
  } {
    return {
      initialized: this.isInitialized,
      backend: 'Web Workers',
      useWebWorkers: true,
    }
  }

  /**
   * Cleanup all resources
   */
  dispose(): void {
    this.workerManager.terminate()
    this.isInitialized = false
    console.log('🧹 Web Worker Pipeline disposed')
  }
}

// Singleton instance
let workerPipelineInstance: WorkerAIPipeline | null = null

/**
 * Get Web Worker AI pipeline instance (singleton)
 */
export function getWorkerAIPipeline(): WorkerAIPipeline {
  if (!workerPipelineInstance) {
    workerPipelineInstance = new WorkerAIPipeline()
  }
  return workerPipelineInstance
}

/**
 * React hook for Web Worker AI pipeline
 */
export function useWorkerAIPipeline() {
  const pipeline = getWorkerAIPipeline()
  
  return {
    analyzeImage: (file: File) => pipeline.analyzeImage(file),
    analyzeWithQualityCheck: (file: File) => pipeline.analyzeWithQualityCheck(file),
    analyzeMultiple: (files: File[]) => pipeline.analyzeMultiple(files),
    initialize: () => pipeline.initialize(),
    getStatus: () => pipeline.getStatus(),
    dispose: () => pipeline.dispose(),
  }
}
