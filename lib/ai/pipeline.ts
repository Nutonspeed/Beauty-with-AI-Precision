/**
 * Complete AI Analysis Pipeline
 * 
 * Orchestrates face detection + skin analysis workflow
 * Phase 8: Real AI Integration
 */

import { getMediaPipeDetector, type FaceDetectionResult } from './mediapipe-detector'
import { getSkinAnalyzer } from './tensorflow-analyzer'
import { getImageProcessor, type ImageQualityReport } from './image-processor'
import type { SkinAnalysisResult } from './types-phase1'

export interface CompleteAnalysisResult {
  faceDetection: FaceDetectionResult
  skinAnalysis: SkinAnalysisResult
  qualityReport: ImageQualityReport
  totalProcessingTime: number
  timestamp: Date
}

export class AIAnalysisPipeline {
  private detector = getMediaPipeDetector()
  private analyzer = getSkinAnalyzer()
  private processor = getImageProcessor()
  private isInitialized = false

  /**
   * Initialize all AI models
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🚀 Initializing AI Pipeline...')
    const startTime = performance.now()

    await Promise.all([
      this.detector.initialize(),
      this.analyzer.initialize(),
    ])

    const initTime = performance.now() - startTime
    console.log(`✅ AI Pipeline initialized in ${initTime.toFixed(0)}ms`)
    
    this.isInitialized = true
  }

  /**
   * Run complete analysis on uploaded image
   */
  async analyzeImage(file: File): Promise<CompleteAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const totalStartTime = performance.now()

    // Step 1: Convert file to image
    const imageElement = await this.processor.fileToImage(file)

    // Step 2: Check image quality
    const qualityReport = await this.processor.assessQuality(imageElement)
    
    if (!qualityReport.isGoodQuality) {
      console.warn('⚠️ Image quality issues detected:', qualityReport.issues)
    }

    // Step 3: Detect face landmarks
    console.log('🔍 Starting face detection with MediaPipe...')
    const faceDetection = await this.detector.detectFace(imageElement)
    
    if (!faceDetection) {
      throw new Error(
        'ไม่พบใบหน้าในรูปภาพ กรุณาตรวจสอบ:\n' +
        '1. ใบหน้าอยู่ตรงกลางรูป\n' +
        '2. แสงสว่างเพียงพอ\n' +
        '3. ใบหน้าไม่มีอะไรบัง (แว่น/หน้ากาก)\n' +
        '4. รูปชัดเจน ไม่เบลอ\n' +
        '5. ขนาดรูปไม่เล็กเกินไป (แนะนำ > 512px)'
      )
    }

    // Step 4: Validate face position
    const validation = this.detector.validateFacePosition(faceDetection)
    
    if (!validation.isValid) {
      throw new Error(`Face position issues: ${validation.issues.join(', ')}`)
    }

    // Step 5: Analyze skin
    const skinAnalysis = await this.analyzer.analyzeSkin(imageElement, faceDetection.landmarks)

    const totalProcessingTime = performance.now() - totalStartTime

    console.log(`✅ Complete analysis finished in ${totalProcessingTime.toFixed(0)}ms`)
    console.log(`  - Face detection: ${faceDetection.processingTime.toFixed(0)}ms`)
    console.log(`  - Skin analysis: ${skinAnalysis.processingTime.toFixed(0)}ms`)
    console.log(`  - Quality check: ${(totalProcessingTime - faceDetection.processingTime - skinAnalysis.processingTime).toFixed(0)}ms`)

    return {
      faceDetection,
      skinAnalysis,
      qualityReport,
      totalProcessingTime,
      timestamp: new Date(),
    }
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
    memoryUsage?: {
      numTensors: number
      numBytes: number
    }
  } {
    return {
      initialized: this.isInitialized,
      backend: typeof window !== 'undefined' ? 'browser' : 'server',
      memoryUsage: this.isInitialized ? require('@tensorflow/tfjs').memory() : undefined,
    }
  }

  /**
   * Cleanup all resources
   */
  dispose(): void {
    this.detector.dispose()
    this.analyzer.dispose()
    this.isInitialized = false
    console.log('🧹 AI Pipeline disposed')
  }
}

// Singleton instance
let pipelineInstance: AIAnalysisPipeline | null = null

/**
 * Get AI pipeline instance (singleton)
 */
export function getAIPipeline(): AIAnalysisPipeline {
  if (!pipelineInstance) {
    pipelineInstance = new AIAnalysisPipeline()
  }
  return pipelineInstance
}

/**
 * React hook for AI pipeline
 */
export function useAIPipeline() {
  const pipeline = getAIPipeline()
  
  return {
    analyzeImage: (file: File) => pipeline.analyzeImage(file),
    analyzeWithQualityCheck: (file: File) => pipeline.analyzeWithQualityCheck(file),
    analyzeMultiple: (files: File[]) => pipeline.analyzeMultiple(files),
    initialize: () => pipeline.initialize(),
    getStatus: () => pipeline.getStatus(),
    dispose: () => pipeline.dispose(),
  }
}
