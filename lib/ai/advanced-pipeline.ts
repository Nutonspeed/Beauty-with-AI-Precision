/**
 * Advanced AI Analysis Pipeline with Enhanced Metrics
 * 
 * ยกระดับจาก pipeline.ts โดยเพิ่ม Enhanced Metrics และ Advanced Algorithms
 */

import { getMediaPipeDetector, type FaceDetectionResult } from './mediapipe-detector'
import { getSkinAnalyzer } from './tensorflow-analyzer'
import { getImageProcessor, type ImageQualityReport } from './image-processor'
import { getEnhancedMetricsCalculator, type EnhancedMetricsResult } from './enhanced-skin-metrics'
import type { SkinAnalysisResult } from './types-phase1'

export interface AdvancedAnalysisResult {
  // Basic results
  faceDetection: FaceDetectionResult
  skinAnalysis: SkinAnalysisResult
  qualityReport: ImageQualityReport
  
  // Enhanced metrics (ใหม่!)
  enhancedMetrics?: EnhancedMetricsResult
  
  // Performance metrics
  totalProcessingTime: number
  breakdown: {
    faceDetection: number
    skinAnalysis: number
    enhancedMetrics?: number
    qualityCheck: number
  }
  
  timestamp: Date
}

export interface AdvancedAnalysisOptions {
  // Enable enhanced metrics (ระดับ Premium/Clinical)
  useEnhancedMetrics?: boolean
  
  // User information for better analysis
  chronologicalAge?: number
  skinType?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'
  
  // Quality thresholds
  minQualityScore?: number
  
  // Processing options
  enableParallelProcessing?: boolean
  maxProcessingTime?: number
}

export class AdvancedAIPipeline {
  private detector = getMediaPipeDetector()
  private analyzer = getSkinAnalyzer()
  private processor = getImageProcessor()
  private metricsCalculator = getEnhancedMetricsCalculator()
  private isInitialized = false

  /**
   * Initialize all AI models
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🚀 Initializing Advanced AI Pipeline...')
    const startTime = performance.now()

    await Promise.all([
      this.detector.initialize(),
      this.analyzer.initialize(),
    ])

    const initTime = performance.now() - startTime
    console.log(`✅ Advanced AI Pipeline initialized in ${initTime.toFixed(0)}ms`)
    
    this.isInitialized = true
  }

  /**
   * Run advanced analysis with enhanced metrics
   */
  async analyzeImage(
    file: File, 
    options: AdvancedAnalysisOptions = {}
  ): Promise<AdvancedAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const totalStartTime = performance.now()
    const breakdown = {
      faceDetection: 0,
      skinAnalysis: 0,
      enhancedMetrics: 0,
      qualityCheck: 0
    }

    // Step 1: Convert file to image
    const imageElement = await this.processor.fileToImage(file)

    // Step 2: Check image quality
    const qualityStartTime = performance.now()
    const qualityReport = await this.processor.assessQuality(imageElement)
    breakdown.qualityCheck = performance.now() - qualityStartTime
    
    const minQuality = options.minQualityScore || 40
    if (qualityReport.score < minQuality) {
      throw new Error(
        `คุณภาพภาพต่ำเกินไป (${qualityReport.score}/${minQuality})\n` +
        `ปัญหา: ${qualityReport.issues.join(', ')}\n\n` +
        'แนะนำ:\n' +
        '- ใช้แสงสว่างที่ดี\n' +
        '- ถ่ายในสถานที่มีแสงเพียงพอ\n' +
        '- หลีกเลี่ยงภาพเบลอ\n' +
        '- ใช้กล้องความละเอียดสูง'
      )
    }
    
    if (!qualityReport.isGoodQuality) {
      console.warn('⚠️ Image quality issues detected:', qualityReport.issues)
    }

    // Step 3: Detect face landmarks
    console.log('🔍 Starting face detection with MediaPipe...')
    const detectionStartTime = performance.now()
    const faceDetection = await this.detector.detectFace(imageElement)
    breakdown.faceDetection = performance.now() - detectionStartTime
    
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
      throw new Error(
        `การวางท่าถ่ายรูปไม่เหมาะสม: ${validation.issues.join(', ')}\n\n` +
        'แนะนำ:\n' +
        '- หันหน้าเข้ากล้องตรงๆ\n' +
        '- อยู่กึ่งกลางเฟรม\n' +
        '- ระยะห่างจากกล้องพอเหมาะ'
      )
    }

    // Step 5: Run analyses (parallel if enabled)
    const analysisStartTime = performance.now()
    
    let skinAnalysis: SkinAnalysisResult
    let enhancedMetrics: EnhancedMetricsResult | undefined
    
    if (options.enableParallelProcessing && options.useEnhancedMetrics) {
      // Parallel processing for speed
      console.log('⚡ Running parallel analysis...')
      
      // Get ImageData for enhanced metrics
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = imageElement.width
      canvas.height = imageElement.height
      ctx.drawImage(imageElement, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      const [skinResult, metricsResult] = await Promise.all([
        this.analyzer.analyzeSkin(imageElement, faceDetection.landmarks),
        this.metricsCalculator.calculate(imageData, faceDetection.landmarks, {
          chronologicalAge: options.chronologicalAge,
          skinType: options.skinType
        })
      ])
      
      skinAnalysis = skinResult
      enhancedMetrics = metricsResult
      breakdown.enhancedMetrics = performance.now() - analysisStartTime - skinResult.processingTime
      
    } else {
      // Sequential processing
      skinAnalysis = await this.analyzer.analyzeSkin(imageElement, faceDetection.landmarks)
      
      if (options.useEnhancedMetrics) {
        console.log('📊 Calculating enhanced metrics...')
        const metricsStartTime = performance.now()
        
        // Get ImageData
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = imageElement.width
        canvas.height = imageElement.height
        ctx.drawImage(imageElement, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        enhancedMetrics = await this.metricsCalculator.calculate(imageData, faceDetection.landmarks, {
          chronologicalAge: options.chronologicalAge,
          skinType: options.skinType
        })
        
        breakdown.enhancedMetrics = performance.now() - metricsStartTime
      }
    }
    
    breakdown.skinAnalysis = performance.now() - analysisStartTime - (breakdown.enhancedMetrics || 0)

    const totalProcessingTime = performance.now() - totalStartTime

    // Log performance
    console.log(`✅ Advanced analysis finished in ${totalProcessingTime.toFixed(0)}ms`)
    console.log(`  - Face detection: ${breakdown.faceDetection.toFixed(0)}ms`)
    console.log(`  - Skin analysis: ${breakdown.skinAnalysis.toFixed(0)}ms`)
    if (breakdown.enhancedMetrics) {
      console.log(`  - Enhanced metrics: ${breakdown.enhancedMetrics.toFixed(0)}ms`)
    }
    console.log(`  - Quality check: ${breakdown.qualityCheck.toFixed(0)}ms`)

    return {
      faceDetection,
      skinAnalysis,
      qualityReport,
      enhancedMetrics,
      totalProcessingTime,
      breakdown,
      timestamp: new Date(),
    }
  }

  /**
   * Run analysis with automatic tier detection
   * Free tier: Basic metrics only
   * Premium tier: Enhanced metrics
   * Clinical tier: Enhanced metrics + detailed reports
   */
  async analyzeWithTier(
    file: File,
    tier: 'free' | 'premium' | 'clinical',
    options: Omit<AdvancedAnalysisOptions, 'useEnhancedMetrics'> = {}
  ): Promise<AdvancedAnalysisResult> {
    const enhancedOptions: AdvancedAnalysisOptions = {
      ...options,
      useEnhancedMetrics: tier !== 'free',
      enableParallelProcessing: tier === 'clinical',
      minQualityScore: tier === 'clinical' ? 60 : tier === 'premium' ? 50 : 40
    }
    
    console.log(`🎯 Running ${tier.toUpperCase()} tier analysis...`)
    
    return this.analyzeImage(file, enhancedOptions)
  }

  /**
   * Batch analyze multiple images
   */
  async analyzeMultiple(
    files: File[], 
    options: AdvancedAnalysisOptions = {}
  ): Promise<AdvancedAnalysisResult[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const results: AdvancedAnalysisResult[] = []
    const totalStartTime = performance.now()

    console.log(`📦 Batch analyzing ${files.length} images...`)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`[${i + 1}/${files.length}] Processing ${file.name}...`)
      
      try {
        const result = await this.analyzeImage(file, options)
        results.push(result)
      } catch (error) {
        console.error(`❌ Failed to analyze ${file.name}:`, error)
      }
    }

    const totalTime = performance.now() - totalStartTime
    console.log(`✅ Batch analysis completed in ${totalTime.toFixed(0)}ms`)
    console.log(`  - Success: ${results.length}/${files.length}`)
    console.log(`  - Average: ${(totalTime / files.length).toFixed(0)}ms per image`)

    return results
  }

  /**
   * Compare two images for progress tracking
   */
  async compareProgress(
    beforeFile: File,
    afterFile: File,
    options: AdvancedAnalysisOptions = {}
  ): Promise<{
    before: AdvancedAnalysisResult
    after: AdvancedAnalysisResult
    improvements: {
      spots: number
      pores: number
      wrinkles: number
      texture: number
      redness?: number
      overallHealth?: number
    }
    summary: string
  }> {
    console.log('🔄 Comparing before & after images...')
    
    const [before, after] = await this.analyzeMultiple([beforeFile, afterFile], {
      ...options,
      useEnhancedMetrics: true // Always use enhanced metrics for comparison
    })

    // Calculate improvements
    const improvements = {
      spots: (after.enhancedMetrics?.spots.score || 0) - (before.enhancedMetrics?.spots.score || 0),
      pores: (after.enhancedMetrics?.pores.score || 0) - (before.enhancedMetrics?.pores.score || 0),
      wrinkles: (after.enhancedMetrics?.wrinkles.score || 0) - (before.enhancedMetrics?.wrinkles.score || 0),
      texture: (after.enhancedMetrics?.texture.score || 0) - (before.enhancedMetrics?.texture.score || 0),
      redness: after.enhancedMetrics && before.enhancedMetrics 
        ? after.enhancedMetrics.redness.score - before.enhancedMetrics.redness.score 
        : undefined,
      overallHealth: after.enhancedMetrics && before.enhancedMetrics
        ? after.enhancedMetrics.overallHealth.score - before.enhancedMetrics.overallHealth.score
        : undefined
    }

    // Generate summary
    const positiveChanges: string[] = []
    const negativeChanges: string[] = []
    
    if (improvements.spots > 5) positiveChanges.push(`ฝ้า-กระลดลง ${improvements.spots.toFixed(0)} คะแนน`)
    else if (improvements.spots < -5) negativeChanges.push(`ฝ้า-กระเพิ่มขึ้น ${Math.abs(improvements.spots).toFixed(0)} คะแนน`)
    
    if (improvements.wrinkles > 5) positiveChanges.push(`ริ้วรอยลดลง ${improvements.wrinkles.toFixed(0)} คะแนน`)
    else if (improvements.wrinkles < -5) negativeChanges.push(`ริ้วรอยเพิ่มขึ้น ${Math.abs(improvements.wrinkles).toFixed(0)} คะแนน`)
    
    if (improvements.texture > 5) positiveChanges.push(`ผิวเรียบเนียนขึ้น ${improvements.texture.toFixed(0)} คะแนน`)
    
    let summary = ''
    if (positiveChanges.length > 0) {
      summary += '✨ การปรับปรุง: ' + positiveChanges.join(', ') + '\n'
    }
    if (negativeChanges.length > 0) {
      summary += '⚠️ ควรดูแล: ' + negativeChanges.join(', ')
    }
    if (positiveChanges.length === 0 && negativeChanges.length === 0) {
      summary = 'ไม่มีการเปลี่ยนแปลงที่สำคัญ'
    }

    return {
      before,
      after,
      improvements,
      summary
    }
  }

  /**
   * Get processing status
   */
  getStatus(): {
    initialized: boolean
    backend: string
    capabilities: {
      basicAnalysis: boolean
      enhancedMetrics: boolean
      batchProcessing: boolean
      progressTracking: boolean
    }
    memoryUsage?: {
      numTensors: number
      numBytes: number
    }
  } {
    return {
      initialized: this.isInitialized,
      backend: typeof window !== 'undefined' ? 'browser' : 'server',
      capabilities: {
        basicAnalysis: true,
        enhancedMetrics: true,
        batchProcessing: true,
        progressTracking: true
      },
      memoryUsage: this.isInitialized && typeof window !== 'undefined' 
        ? require('@tensorflow/tfjs').memory() 
        : undefined,
    }
  }

  /**
   * Cleanup all resources
   */
  dispose(): void {
    this.detector.dispose()
    this.analyzer.dispose()
    this.isInitialized = false
    console.log('🧹 Advanced AI Pipeline disposed')
  }
}

// Singleton instance
let advancedPipelineInstance: AdvancedAIPipeline | null = null

/**
 * Get Advanced AI pipeline instance (singleton)
 */
export function getAdvancedAIPipeline(): AdvancedAIPipeline {
  if (!advancedPipelineInstance) {
    advancedPipelineInstance = new AdvancedAIPipeline()
  }
  return advancedPipelineInstance
}

/**
 * React hook for Advanced AI pipeline
 */
export function useAdvancedAIPipeline() {
  const pipeline = getAdvancedAIPipeline()
  
  return {
    analyzeImage: (file: File, options?: AdvancedAnalysisOptions) => 
      pipeline.analyzeImage(file, options),
    analyzeWithTier: (file: File, tier: 'free' | 'premium' | 'clinical', options?: Omit<AdvancedAnalysisOptions, 'useEnhancedMetrics'>) =>
      pipeline.analyzeWithTier(file, tier, options),
    analyzeMultiple: (files: File[], options?: AdvancedAnalysisOptions) => 
      pipeline.analyzeMultiple(files, options),
    compareProgress: (beforeFile: File, afterFile: File, options?: AdvancedAnalysisOptions) =>
      pipeline.compareProgress(beforeFile, afterFile, options),
    initialize: () => pipeline.initialize(),
    getStatus: () => pipeline.getStatus(),
    dispose: () => pipeline.dispose(),
  }
}
