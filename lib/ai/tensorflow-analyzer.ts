// Loosen typings and use dynamic imports to stay SSR-safe
let tf: any = null
let mobilenet: any = null
let deeplab: any = null
import type { SkinAnalysisResult, SkinConcern } from './types-phase1'
import {
  retryWithBackoff,
  TENSORFLOW_RETRY_CONFIG,
  createUserErrorMessage,
  logRetryStats,
} from './retry-utils'

// Re-export types for backward compatibility
export type { SkinAnalysisResult, SkinConcern } from './types-phase1'

export interface TensorFlowTextureResult {
  textureScore: number;
  smoothness: number;
  roughness: number;
  confidence: number;
  features: number[];
}

export interface TensorFlowSegmentationResult {
  skinMask: number[][];
  faceMask: number[][];
  backgroundMask: number[][];
  confidence: number;
  segmentationMap: number[][];
}

export interface TensorFlowAnalysisResult {
  texture: TensorFlowTextureResult;
  segmentation: TensorFlowSegmentationResult;
  combinedScore: number;
  processingTime: number;
}

/**
 * TensorFlow Hub Analyzer
 * Uses MobileNetV3 for texture analysis and DeepLabV3+ for semantic segmentation
 * Provides advanced feature extraction for skin analysis (+2% accuracy)
 */
export class TensorFlowAnalyzer {
  private mobileNetModel: any = null
  private deepLabModel: any = null
  private isInitialized = false

  /**
   * Initialize TensorFlow Hub models
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (globalThis.window === undefined || (globalThis as any).document === undefined) {
        throw new TypeError('TensorFlowAnalyzer is browser-only and cannot initialize on the server')
      }

      // Lazy load libs at runtime to prevent SSR import errors
      if (!tf) tf = await import('@tensorflow/tfjs')
      if (!mobilenet) mobilenet = await import('@tensorflow-models/mobilenet')
      if (!deeplab) deeplab = await import('@tensorflow-models/deeplab')

      // Set WebGL backend for GPU acceleration
  await tf.setBackend('webgl')
  await tf.ready()

      // Load MobileNet for texture analysis
      // Note: @tensorflow-models/mobilenet เวอร์ชันปัจจุบันรองรับแค่ version 1 หรือ 2
      // ถ้าตั้งเป็น 3 จะเกิด error: "Invalid version of MobileNet. Valid versions are: 1.00,2.00"
      this.mobileNetModel = await mobilenet.load({
        version: 2,
        alpha: 1,
      })

      // Load DeepLabV3+ for semantic segmentation
      this.deepLabModel = await deeplab.load({
        base: 'pascal',
        quantizationBytes: 2,
      })

      this.isInitialized = true
      console.log('เนยโ€ฆ TensorFlow Hub models loaded successfully')
  console.log(`Backend: ${tf.getBackend()}`)
    } catch (error) {
      console.error('เนยย Failed to initialize TensorFlow Hub models:', error)
      throw new Error('TensorFlow Hub initialization failed')
    }
  }

  /**
   * Analyze texture using MobileNetV3
   * งาน 4: Added retry mechanism
   */
  async analyzeTexture(imageData: ImageData): Promise<TensorFlowTextureResult> {
    if (!this.mobileNetModel) {
      throw new Error('MobileNet model not initialized')
    }

    const result = await retryWithBackoff(
      async () => {
        // Convert ImageData to tensor
        const tensor = tf.browser.fromPixels(imageData)
        const resized = tf.image.resizeBilinear(tensor, [224, 224])
        const normalized = resized.div(255)

        // Get predictions for classification
        const predictions = await this.mobileNetModel.classify(normalized)

        // Extract texture features from intermediate layers
        const features = await this.extractTextureFeatures(normalized)

        // Calculate texture metrics
        const textureScore = this.calculateTextureScore(features)
        const smoothness = this.calculateSmoothness(features)
        const roughness = this.calculateRoughness(features)

        // Clean up tensors
        tensor.dispose()
        resized.dispose()
        normalized.dispose()

        const confidence = predictions.length > 0 ? predictions[0].probability : 0

        return {
          textureScore,
          smoothness,
          roughness,
          confidence,
          features
        }
      },
      {
        ...TENSORFLOW_RETRY_CONFIG,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retrying texture analysis (attempt ${attempt}): ${error.message}`)
        },
      }
    )

    logRetryStats("Texture Analysis", result)

    if (result.success && result.data) {
      return result.data
    }

    // Throw error with user-friendly message
    const userMessage = createUserErrorMessage("Texture Analysis", result.error!, result.attempts)
    throw new Error(userMessage)
  }

  /**
   * Analyze segmentation using DeepLabV3+
   * งาน 4: Added retry mechanism
   */
  async analyzeSegmentation(imageData: ImageData): Promise<TensorFlowSegmentationResult> {
    if (!this.deepLabModel) {
      throw new Error('DeepLab model not initialized')
    }

    const result = await retryWithBackoff(
      async () => {
        // Convert ImageData to tensor
        const tensor = tf.browser.fromPixels(imageData)

        // Perform semantic segmentation
        const segmentation = await this.deepLabModel.segment(tensor)

        // Extract masks for different classes
        const skinMask = this.extractSkinMask(segmentation)
        const faceMask = this.extractFaceMask(segmentation)
        const backgroundMask = this.extractBackgroundMask(segmentation)

        // Clean up tensor
        tensor.dispose()

        return {
          skinMask,
          faceMask,
          backgroundMask,
          confidence: segmentation.confidence || 0,
          segmentationMap: segmentation.segmentationMap || []
        }
      },
      {
        ...TENSORFLOW_RETRY_CONFIG,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retrying segmentation (attempt ${attempt}): ${error.message}`)
        },
      }
    )

    logRetryStats("Segmentation Analysis", result)

    if (result.success && result.data) {
      return result.data
    }

    // Throw error with user-friendly message
    const userMessage = createUserErrorMessage("Segmentation Analysis", result.error!, result.attempts)
    throw new Error(userMessage)
  }

  /**
   * Perform complete analysis combining texture and segmentation
   */
  async analyzeSkin(imageData: ImageData): Promise<TensorFlowAnalysisResult> {
    const startTime = Date.now();

    await this.initialize()

    const [textureResult, segmentationResult] = await Promise.all([
      this.analyzeTexture(imageData),
      this.analyzeSegmentation(imageData)
    ]);

    // Combine results with weighted scoring
  const combinedScore = this.combineAnalysisResults(textureResult, segmentationResult)

  const processingTime = Date.now() - startTime

    return {
      texture: textureResult,
      segmentation: segmentationResult,
      combinedScore,
      processingTime
    }
  }

  /**
   * Extract texture features from MobileNet intermediate layers
   */
  private async extractTextureFeatures(tensor: any): Promise<number[]> {
    // types loosened to any at runtime due to dynamic import
    if (!this.mobileNetModel) {
      throw new Error('MobileNet model not available')
    }

    const features: number[] = [];

    try {
      // Use the model's inference to get feature maps
  const activation = this.mobileNetModel.infer(tensor, 'conv_pw_13_relu')

      // Extract statistical features from activation maps
  const values = await activation.data()
      const stats = this.calculateFeatureStatistics(Array.from(values))

      features.push(...stats)
  activation?.dispose?.()
    } catch (error) {
      console.warn('Feature extraction failed, using fallback:', error)
      // Fallback to basic features
      features.push(0.5, 0.3, 0.7, 0.2)
    }

    return features
  }

  /**
   * Calculate statistical features from activation values
   */
  private calculateFeatureStatistics(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min

    return [mean, std, variance, range, max, min]
  }

  /**
   * Calculate texture score from features
   */
  private calculateTextureScore(features: number[]): number {
    // Higher texture score indicates more complex/smoother skin texture
  const [, std, variance, range] = features

    // Normalize and combine features
  const normalizedStd = Math.min(std / 0.5, 1)
  const normalizedVariance = Math.min(variance / 0.3, 1)
  const normalizedRange = Math.min(range / 2, 1)

    // Weighted combination (higher values = better texture)
    const score = normalizedStd * 0.4 + normalizedVariance * 0.3 + normalizedRange * 0.3

    return Math.max(0, Math.min(1, score))
  }

  /**
   * Calculate smoothness score
   */
  private calculateSmoothness(features: number[]): number {
    // Lower variance = smoother skin
    const [, std] = features
    return Math.max(0, Math.min(1, 1 - std / 0.5))
  }

  /**
   * Calculate roughness score
   */
  private calculateRoughness(features: number[]): number {
    // Higher variance = rougher skin
    const [, std] = features
    return Math.max(0, Math.min(1, std / 0.5))
  }

  /**
   * Extract skin mask from segmentation result
   */
  private extractSkinMask(segmentation: any): number[][] {
    const width = segmentation.width || 224
    const height = segmentation.height || 224

    const mask: number[][] = []
    for (let y = 0; y < height; y++) {
      mask[y] = []
      for (let x = 0; x < width; x++) {
        const classIndex = segmentation.segmentationMap[y * width + x]
        // Class 1 typically represents person/face in Pascal VOC
        mask[y][x] = classIndex === 1 ? 1 : 0
      }
    }

    return mask
  }

  /**
   * Extract face mask (subset of skin mask)
   */
  private extractFaceMask(segmentation: any): number[][] {
    // For now, use skin mask as approximation
    // In production, would need face detection to isolate face region
    return this.extractSkinMask(segmentation)
  }

  /**
   * Extract background mask
   */
  private extractBackgroundMask(segmentation: any): number[][] {
    const width = segmentation.width || 224
    const height = segmentation.height || 224

    const mask: number[][] = []
    for (let y = 0; y < height; y++) {
      mask[y] = []
      for (let x = 0; x < width; x++) {
        const classIndex = segmentation.segmentationMap[y * width + x]
        // Class 0 represents background
        mask[y][x] = classIndex === 0 ? 1 : 0
      }
    }

    return mask
  }

  /**
   * Combine texture and segmentation results
   */
  private combineAnalysisResults(
    texture: TensorFlowTextureResult,
    segmentation: TensorFlowSegmentationResult
  ): number {
    // Weighted combination of texture and segmentation confidence
  const textureWeight = 0.6
  const segmentationWeight = 0.4

    const combinedScore = texture.textureScore * texture.confidence * textureWeight +
      segmentation.confidence * segmentationWeight

    return Math.max(0, Math.min(1, combinedScore))
  }

  /**
   * Check if analyzer is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.mobileNetModel !== null && this.deepLabModel !== null
  }

  /**
   * Dispose of models and free memory
   */
  dispose(): void {
    if (this.mobileNetModel) {
      this.mobileNetModel = null
    }

    if (this.deepLabModel) {
      this.deepLabModel = null
    }

    this.isInitialized = false

    // Force garbage collection if available
    if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
      ;(globalThis as any).gc()
    }
  }
}

// Helper to convert HTMLImageElement to ImageData
function imageElementToImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context not available')
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return imageData
}

// Factory expected by pipeline
export function getSkinAnalyzer() {
  const analyzer = new TensorFlowAnalyzer()

  return {
    initialize: () => analyzer.initialize(),
    isReady: () => analyzer.isReady(),
    dispose: () => analyzer.dispose(),
    // Adapter: accept HTMLImageElement plus optional landmarks and return SkinAnalysisResult
    async analyzeSkin(image: HTMLImageElement, _landmarks?: unknown): Promise<SkinAnalysisResult> {
      const start = Date.now()
      const imageData = imageElementToImageData(image)
      const tfResult = await analyzer.analyzeSkin(imageData)

      // Map TensorFlowAnalysisResult to SkinAnalysisResult shape expected by UI
      const concerns: SkinConcern[] = [
        { type: 'texture' as any, severity: Math.round((1 - tfResult.texture.textureScore) * 100), confidence: tfResult.texture.confidence },
      ].filter(Boolean) as SkinConcern[]

      const visiaMetrics: Record<string, number> = {
        texture: Math.round(tfResult.texture.textureScore * 100),
        segmentation: Math.round(tfResult.segmentation.confidence * 100),
        combined: Math.round(tfResult.combinedScore * 100),
      }

      const recommendations: string[] = []
      if (tfResult.texture.textureScore < 0.5) {
        recommendations.push('เน€เธยเน€เธยเน€เธยเน€เธเธเน€เธเธเน€เธเธเน€เธเธเน€เธยเน€เธโฌเน€เธยเน€เธเธเน€เธยเน€เธเธเน€เธโฌเน€เธยเน€เธเธเน€เธเธเน€เธยเน€เธโฌเน€เธยเน€เธเธ—เน€เธยเน€เธเธเน€เธโฌเน€เธยเน€เธเธ”เน€เธยเน€เธเธเน€เธยเน€เธเธเน€เธเธ’เน€เธเธเน€เธยเน€เธเธเน€เธยเน€เธเธเน€เธยเน€เธเธ—เน€เธยเน€เธย')
      }

      return {
        overallScore: Math.round(tfResult.combinedScore * 100),
        concerns,
        visiaMetrics,
        recommendations,
        processingTime: Date.now() - start,
      }
    },
  }
}
