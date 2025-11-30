/**
 * ONNX Runtime Web Service
 * 
 * High-performance browser-side inference using ONNX Runtime Web.
 * Faster than TensorFlow.js for many models (135ms vs 300ms+).
 * 
 * Features:
 * - WebGL/WebAssembly acceleration
 * - Multi-threaded inference with Web Workers
 * - Supports models from PyTorch, TensorFlow, scikit-learn
 * 
 * @see https://github.com/microsoft/onnxruntime
 */

// Dynamic import to avoid build errors if package not installed
// Install: pnpm add onnxruntime-web
 
let ort: any = null

async function getOrt(): Promise<any> {
  if (!ort) {
    try {
      // @ts-ignore - Dynamic import, package may not be installed
      ort = await import('onnxruntime-web')
      // Configure ONNX Runtime
      if (ort.env?.wasm) {
        ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4
        ort.env.wasm.simd = true
      }
    } catch (e) {
      console.warn('[ONNX] onnxruntime-web not installed. Install with: pnpm add onnxruntime-web')
      throw new Error('ONNX Runtime not available')
    }
  }
  return ort
}

export interface ONNXModel {
  name: string
  path: string
  inputShape: number[]
  outputNames: string[]
  labels?: string[]
}

export interface InferenceResult {
  predictions: number[]
  probabilities: number[]
  topClass: string
  confidence: number
  inferenceTime: number
}

// Available models
export const ONNX_MODELS: Record<string, ONNXModel> = {
  skinTexture: {
    name: 'Skin Texture Analyzer',
    path: '/models/skin_texture.onnx',
    inputShape: [1, 3, 224, 224],
    outputNames: ['output'],
    labels: ['smooth', 'rough', 'oily', 'dry', 'combination']
  },
  poreDetection: {
    name: 'Pore Detection',
    path: '/models/pore_detection.onnx',
    inputShape: [1, 3, 224, 224],
    outputNames: ['pore_score', 'pore_mask'],
    labels: ['minimal', 'small', 'medium', 'large', 'very_large']
  },
  wrinkleDetection: {
    name: 'Wrinkle Detection',
    path: '/models/wrinkle_detection.onnx',
    inputShape: [1, 3, 224, 224],
    outputNames: ['wrinkle_score', 'wrinkle_map'],
    labels: ['none', 'fine_lines', 'moderate', 'deep', 'severe']
  },
  skinCondition: {
    name: 'Skin Condition Classifier',
    path: '/models/skin_condition.onnx',
    inputShape: [1, 3, 224, 224],
    outputNames: ['condition_probs'],
    labels: ['healthy', 'acne', 'rosacea', 'eczema', 'psoriasis', 'melasma', 'aging']
  }
}

/**
 * ONNX Runtime Service Class
 * Manages model loading and inference
 */
export class ONNXRuntimeService {
   
  private sessions: Map<string, any> = new Map()
  private isInitialized = false

  /**
   * Initialize ONNX Runtime with WebGL backend
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Try WebGL first (fastest)
      const ortModule = await getOrt()
      await ortModule.env?.webgl?.pack
      console.log('[ONNX] Using WebGL backend')
    } catch {
      // Fall back to WASM
      console.log('[ONNX] Using WebAssembly backend')
    }

    this.isInitialized = true
  }

  /**
   * Load a model into memory
   */
  async loadModel(modelKey: string): Promise<boolean> {
    const model = ONNX_MODELS[modelKey]
    if (!model) {
      console.error(`[ONNX] Unknown model: ${modelKey}`)
      return false
    }

    if (this.sessions.has(modelKey)) {
      return true // Already loaded
    }

    try {
      console.log(`[ONNX] Loading model: ${model.name}`)
      
      const ortModule = await getOrt()
      const session = await ortModule.InferenceSession.create(model.path, {
        executionProviders: ['webgl', 'wasm'],
        graphOptimizationLevel: 'all'
      })

      this.sessions.set(modelKey, session)
      console.log(`[ONNX] Model loaded: ${model.name}`)
      return true
    } catch (error) {
      console.error(`[ONNX] Failed to load model ${modelKey}:`, error)
      return false
    }
  }

  /**
   * Run inference on an image
   */
  async runInference(
    modelKey: string,
    imageData: ImageData | HTMLCanvasElement | HTMLImageElement
  ): Promise<InferenceResult | null> {
    const startTime = performance.now()

    const model = ONNX_MODELS[modelKey]
    if (!model) {
      console.error(`[ONNX] Unknown model: ${modelKey}`)
      return null
    }

    // Load model if not loaded
    if (!this.sessions.has(modelKey)) {
      const loaded = await this.loadModel(modelKey)
      if (!loaded) return null
    }

    const session = this.sessions.get(modelKey)!

    try {
      // Preprocess image
      const tensor = await this.preprocessImage(imageData, model.inputShape)

      // Run inference
       
      const feeds: Record<string, any> = { input: tensor }
      const results = await session.run(feeds)

      // Get output
      const output = results[model.outputNames[0]]
      const data = output.data as Float32Array

      // Apply softmax for probabilities
      const probabilities = this.softmax(Array.from(data))

      // Find top prediction
      const maxIndex = probabilities.indexOf(Math.max(...probabilities))
      const topClass = model.labels?.[maxIndex] || `class_${maxIndex}`
      const confidence = probabilities[maxIndex]

      const inferenceTime = performance.now() - startTime

      return {
        predictions: Array.from(data),
        probabilities,
        topClass,
        confidence,
        inferenceTime
      }
    } catch (error) {
      console.error(`[ONNX] Inference failed for ${modelKey}:`, error)
      return null
    }
  }

  /**
   * Run multiple models in parallel
   */
  async runMultipleModels(
    modelKeys: string[],
    imageData: ImageData | HTMLCanvasElement | HTMLImageElement
  ): Promise<Record<string, InferenceResult | null>> {
    const results: Record<string, InferenceResult | null> = {}

    // Run all models in parallel
    await Promise.all(
      modelKeys.map(async (key) => {
        results[key] = await this.runInference(key, imageData)
      })
    )

    return results
  }

  /**
   * Preprocess image for model input
   */
   
  private async preprocessImage(
    imageData: ImageData | HTMLCanvasElement | HTMLImageElement,
    inputShape: number[]
  ): Promise<any> {
    const [, channels, height, width] = inputShape

    // Create canvas for resizing
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // Draw image to canvas
    if (imageData instanceof ImageData) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = imageData.width
      tempCanvas.height = imageData.height
      const tempCtx = tempCanvas.getContext('2d')!
      tempCtx.putImageData(imageData, 0, 0)
      ctx.drawImage(tempCanvas, 0, 0, width, height)
    } else {
      ctx.drawImage(imageData, 0, 0, width, height)
    }

    // Get pixel data
    const pixels = ctx.getImageData(0, 0, width, height)
    const { data } = pixels

    // Convert to tensor format [1, 3, H, W] with normalization
    const tensorData = new Float32Array(channels * height * width)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const tensorIdx = y * width + x

        // Normalize to [0, 1] and arrange as CHW
        tensorData[tensorIdx] = data[idx] / 255.0 // R
        tensorData[height * width + tensorIdx] = data[idx + 1] / 255.0 // G
        tensorData[2 * height * width + tensorIdx] = data[idx + 2] / 255.0 // B
      }
    }

    const ortModule = await getOrt()
    return new ortModule.Tensor('float32', tensorData, inputShape)
  }

  /**
   * Apply softmax to convert logits to probabilities
   */
  private softmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits)
    const expValues = logits.map(l => Math.exp(l - maxLogit))
    const sumExp = expValues.reduce((a, b) => a + b, 0)
    return expValues.map(e => e / sumExp)
  }

  /**
   * Unload a model from memory
   */
  async unloadModel(modelKey: string): Promise<void> {
    const session = this.sessions.get(modelKey)
    if (session) {
      await session.release()
      this.sessions.delete(modelKey)
      console.log(`[ONNX] Model unloaded: ${modelKey}`)
    }
  }

  /**
   * Unload all models
   */
  async dispose(): Promise<void> {
    for (const [key, session] of this.sessions) {
      await session.release()
      console.log(`[ONNX] Model unloaded: ${key}`)
    }
    this.sessions.clear()
  }
}

// Singleton instance
let service: ONNXRuntimeService | null = null

export function getONNXService(): ONNXRuntimeService {
  if (!service) {
    service = new ONNXRuntimeService()
  }
  return service
}

/**
 * Quick inference function
 */
export async function inferWithONNX(
  modelKey: string,
  imageData: ImageData | HTMLCanvasElement | HTMLImageElement
): Promise<InferenceResult | null> {
  const onnx = getONNXService()
  await onnx.initialize()
  return onnx.runInference(modelKey, imageData)
}
