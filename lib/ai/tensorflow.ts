import * as tf from '@tensorflow/tfjs'
// Fallback for missing TensorFlow WASM
const _tfjsWasm = {
  setWasmPath: (_path: string) => {
    // Fallback implementation
  }
}

// Initialize TensorFlow.js
tf.setBackend('wasm')

export class SkinAnalysisModel {
  private model: tf.LayersModel | null = null
  private isModelLoaded = false

  async loadModel() {
    if (this.isModelLoaded) return

    try {
      // Load pre-trained skin analysis model
      const modelUrl = '/models/skin-analysis/model.json'
      this.model = await tf.loadLayersModel(modelUrl)
      this.isModelLoaded = true
      console.log('Skin analysis model loaded successfully')
    } catch (error) {
      console.error('Failed to load skin analysis model:', error)
      // Fallback to a simple model for demo
      this.createFallbackModel()
    }
  }

  private createFallbackModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 8, activation: 'sigmoid' }) // 8 skin concerns
      ],
    })
    this.isModelLoaded = true
  }

  async analyzeImage(imageElement: HTMLImageElement): Promise<SkinAnalysisResult> {
    if (!this.model || !this.isModelLoaded) {
      await this.loadModel()
    }

    if (!this.model) {
      throw new Error('Model not loaded')
    }

    // Preprocess image
    const tensor = tf.browser.fromPixels(imageElement)
    const resized = tf.image.resizeBilinear(tensor, [224, 224])
    const normalized = resized.div(255.0)
    const batched = normalized.expandDims(0)

    // Make prediction
    const predictions = this.model.predict(batched) as tf.Tensor
    const scores = await predictions.data()

    // Clean up tensors
    tensor.dispose()
    resized.dispose()
    normalized.dispose()
    batched.dispose()
    predictions.dispose()

    // Map scores to skin concerns
    const concerns = [
      'acne', 'wrinkles', 'dark_spots', 'texture',
      'pores', 'redness', 'dryness', 'oiliness'
    ]

    const results: SkinAnalysisResult = {
      scores: {},
      primaryConcern: '',
      confidence: 0,
    }

    let maxScore = 0
    concerns.forEach((concern, index) => {
      results.scores[concern] = scores[index]
      if (scores[index] > maxScore) {
        maxScore = scores[index]
        results.primaryConcern = concern
      }
    })

    results.confidence = maxScore
    return results
  }
}

export interface SkinAnalysisResult {
  scores: Record<string, number>
  primaryConcern: string
  confidence: number
}

export const skinAnalysisModel = new SkinAnalysisModel()
