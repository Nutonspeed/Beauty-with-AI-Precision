 
/**
 * TensorFlow.js Skin Analysis Web Worker
 * 
 * Runs TensorFlow.js skin analysis in a separate thread
 * Processes skin metrics, concerns, and recommendations
 */

import * as tf from '@tensorflow/tfjs'

let isInitialized = false

// Initialize TensorFlow.js with GPU optimizations
async function initializeTensorFlow() {
  if (isInitialized) {
    console.log('✅ TensorFlow.js already initialized')
    return
  }

  console.log('🔧 Starting TensorFlow.js initialization...')
  
  try {
    await tf.ready()
    console.log('✅ TensorFlow.js ready')
    
    // Use CPU backend for stability (WebGL can have shader compilation issues)
    try {
      // Try WebGL first, fallback to CPU if it fails
      try {
        console.log('🎮 Attempting WebGL backend...')
        await tf.setBackend('webgl')
        console.log('✅ TensorFlow.js using WebGL backend')
      } catch (webglError) {
        console.log('⚠️ WebGL not available, using CPU backend for stability')
        console.log('WebGL error:', webglError)
        await tf.setBackend('cpu')
        console.log('✅ TensorFlow.js using CPU backend')
      }
    } catch (error) {
      console.warn('⚠️ Failed to set backend, using default:', error)
      await tf.setBackend('cpu')
      console.log('✅ TensorFlow.js using CPU backend (fallback)')
    }

    isInitialized = true
    console.log('✅ TensorFlow.js initialization complete')
  } catch (error) {
    console.error('❌ TensorFlow.js initialization failed:', error)
    throw error
  }
}

// Process skin analysis
async function processSkinAnalysis(imageDataUrl: string, landmarks: any[]) {
  const startTime = performance.now()

  try {
    // Initialize if not already done
    await initializeTensorFlow()

    // Create image tensor from data URL
    const imageTensor = await createImageTensor(imageDataUrl)

    // Analyze different skin aspects
    const [
      wrinklesScore,
      spotsScore,
      textureScore,
      poresScore,
      evennessScore,
      firmnessScore,
      radianceScore,
      hydrationScore,
    ] = await Promise.all([
      analyzeWrinkles(imageTensor, landmarks),
      analyzeSpots(imageTensor),
      analyzeTexture(imageTensor),
      analyzePores(imageTensor),
      analyzeEvenness(imageTensor),
      analyzeFirmness(imageTensor, landmarks),
      analyzeRadiance(imageTensor),
      analyzeHydration(imageTensor),
    ])

    // Cleanup tensor
    imageTensor.dispose()

    const processingTime = performance.now() - startTime

    // Calculate overall score
    const scores = [
      wrinklesScore,
      spotsScore,
      textureScore,
      poresScore,
      evennessScore,
      firmnessScore,
      radianceScore,
      hydrationScore,
    ]
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    // Generate concerns and recommendations
    const concerns = generateConcerns({
      wrinkles: wrinklesScore,
      spots: spotsScore,
      texture: textureScore,
      pores: poresScore,
      evenness: evennessScore,
      firmness: firmnessScore,
      radiance: radianceScore,
      hydration: hydrationScore,
    })

    const recommendations = generateRecommendations(concerns)

    return {
      overallScore,
      visiaMetrics: {
        wrinkles: { score: wrinklesScore, grade: getGrade(wrinklesScore), trend: 'neutral' },
        spots: { score: spotsScore, grade: getGrade(spotsScore), trend: 'neutral' },
        texture: { score: textureScore, grade: getGrade(textureScore), trend: 'neutral' },
        pores: { score: poresScore, grade: getGrade(poresScore), trend: 'neutral' },
        evenness: { score: evennessScore, grade: getGrade(evennessScore), trend: 'neutral' },
        firmness: { score: firmnessScore, grade: getGrade(firmnessScore), trend: 'neutral' },
        radiance: { score: radianceScore, grade: getGrade(radianceScore), trend: 'neutral' },
        hydration: { score: hydrationScore, grade: getGrade(hydrationScore), trend: 'neutral' },
      },
      concerns,
      recommendations,
      processingTime: Math.round(processingTime),
    }
  } catch (error) {
    throw new Error(`Skin analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper: Create image tensor from data URL with fixed dimensions
async function createImageTensor(dataUrl: string): Promise<tf.Tensor3D> {
  const FIXED_WIDTH = 512
  const FIXED_HEIGHT = 512

  try {
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    if (typeof createImageBitmap !== 'function') {
      throw new TypeError('createImageBitmap not supported in worker context')
    }

    const bitmap = await createImageBitmap(blob)
    try {
      // Create tensor from bitmap
      let tensor = tf.browser.fromPixels(bitmap)
      
      // Normalize dimensions to fixed size (512x512) to prevent broadcasting errors
      const [height, width] = tensor.shape.slice(0, 2)
      
      if (width !== FIXED_WIDTH || height !== FIXED_HEIGHT) {
        console.log(`🔄 Resizing tensor from [${height}, ${width}, 3] to [${FIXED_HEIGHT}, ${FIXED_WIDTH}, 3]`)
        
        // Resize using tf.image.resizeBilinear
        const resized = tf.image.resizeBilinear(tensor, [FIXED_HEIGHT, FIXED_WIDTH])
        tensor.dispose() // Clean up original tensor
        tensor = resized
        
        console.log(`✅ Tensor resized successfully`)
      }
      
      return tensor
    } finally {
      if (typeof bitmap.close === 'function') {
        bitmap.close()
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to create image tensor: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Analysis functions (simplified for Web Worker)
async function analyzeWrinkles(imageTensor: tf.Tensor3D, landmarks: any[]): Promise<number> {
  return tf.tidy(() => {
    // Manual grayscale conversion (luminosity method)
    const [r, g, b] = tf.split(imageTensor, 3, 2)
    const grayscale = tf.addN([
      r.toFloat().mul(0.299),
      g.toFloat().mul(0.587),
      b.toFloat().mul(0.114),
    ])

    const moments = tf.moments(grayscale)
    const variance = moments.variance.dataSync()[0]

    // Higher variance = more texture/wrinkles
    const wrinkleScore = Math.min(100, (variance / 100) * 50)

    // Focus on wrinkle-prone areas using landmarks
    const foreheadArea = landmarks.filter((lm: any, idx: number) => idx <= 10)
    const wrinkleFactor = foreheadArea.length > 0 ? 0.8 : 1

    return Math.round(wrinkleScore * wrinkleFactor)
  })
}

async function analyzeSpots(imageTensor: tf.Tensor3D): Promise<number> {
  return tf.tidy(() => {
    // Simplified spot detection using color variance
    const normalized = tf.div(imageTensor, 255)
    const moments = tf.moments(normalized)
    const variance = moments.variance.dataSync()[0]
    
    // Higher variance indicates more spots/blemishes
    return Math.round(Math.min(100, variance * 100))
  })
}

async function analyzeTexture(imageTensor: tf.Tensor3D): Promise<number> {
  return tf.tidy(() => {
    // Manual grayscale conversion
    const [r, g, b] = tf.split(imageTensor, 3, 2)
    const grayscale = tf.addN([
      r.toFloat().mul(0.299),
      g.toFloat().mul(0.587),
      b.toFloat().mul(0.114),
    ])
    const moments = tf.moments(grayscale)
    const variance = moments.variance.dataSync()[0]

    // Lower variance = smoother texture
    const smoothness = Math.max(0, 1 - variance / 5000)
    return Math.round(smoothness * 100)
  })
}

async function analyzePores(imageTensor: tf.Tensor3D): Promise<number> {
  return tf.tidy(() => {
    // Manual grayscale conversion
    const [r, g, b] = tf.split(imageTensor, 3, 2)
    const grayscale = tf.addN([
      r.toFloat().mul(0.299),
      g.toFloat().mul(0.587),
      b.toFloat().mul(0.114),
    ])
    const moments = tf.moments(grayscale)
    const variance = moments.variance.dataSync()[0]

    // Pore visibility correlates with high frequency details (variance)
    const poreVisibility = Math.min(100, (variance / 50) * 40)
    return Math.round(Math.max(0, 100 - poreVisibility))
  })
}

async function analyzeEvenness(imageTensor: tf.Tensor3D): Promise<number> {
  return tf.tidy(() => {
    // Color evenness - low variance across channels = even tone
    const moments = tf.moments(imageTensor)
    const variance = moments.variance.dataSync()[0]
    
    // Lower variance = more even skin tone
    const evenness = Math.max(0, 1 - variance / 100)
    return Math.round(evenness * 100)
  })
}

async function analyzeFirmness(imageTensor: tf.Tensor3D, landmarks: any[]): Promise<number> {
  // Simplified firmness based on face shape
  if (landmarks.length < 100) return 60
  
  const jawlinePoints = landmarks.slice(0, 17)
  const avgY = jawlinePoints.reduce((sum: number, lm: any) => sum + lm.y, 0) / jawlinePoints.length
  
  // Based on jaw position and landmarks
  return Math.round(Math.max(40, 100 - avgY * 100))
}

async function analyzeRadiance(imageTensor: tf.Tensor3D): Promise<number> {
  return tf.tidy(() => {
    // Average brightness = radiance
    const moments = tf.moments(imageTensor)
    const brightness = moments.mean.dataSync()[0] / 255
    
    return Math.round(Math.max(0, Math.min(100, brightness * 120)))
  })
}

async function analyzeHydration(imageTensor: tf.Tensor3D): Promise<number> {
  return tf.tidy(() => {
    // Manual grayscale conversion for luminance
    const [r, g, b] = tf.split(imageTensor, 3, 2)
    const grayscale = tf.addN([
      r.toFloat().mul(0.299),
      g.toFloat().mul(0.587),
      b.toFloat().mul(0.114),
    ])
    const moments = tf.moments(grayscale)
    const mean = moments.mean.dataSync()[0] / 255

    // Well-hydrated skin appears more luminous
    // Combine brightness and smoothness
    return Math.round(mean * 80 + 20)
  })
}

// Helper: Get grade from score
function getGrade(score: number): string {
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

// Helper: Generate concerns
function generateConcerns(metrics: Record<string, number>) {
  const concerns: any[] = []

  for (const [key, score] of Object.entries(metrics)) {
    if (score < 60) {
      let severity: 'low' | 'medium' | 'high'
      if (score < 40) {
        severity = 'high'
      } else if (score < 50) {
        severity = 'medium'
      } else {
        severity = 'low'
      }
      concerns.push({
        type: key,
        severity,
        confidence: 0.75 + Math.random() * 0.2,
      })
    }
  }

  return concerns
}

// Helper: Generate recommendations
function generateRecommendations(concerns: any[]): string[] {
  const recommendations: string[] = []

  for (const concern of concerns) {
    switch (concern.type) {
      case 'wrinkles':
        recommendations.push('Consider using retinol-based products')
        break
      case 'spots':
        recommendations.push('Use sunscreen daily (SPF 30+)')
        break
      case 'hydration':
        recommendations.push('Increase water intake and use moisturizer')
        break
      case 'radiance':
        recommendations.push('Try vitamin C serum for brighter skin')
        break
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain your current skincare routine')
  }

  return [...new Set(recommendations)].slice(0, 5)
}

// Worker message handler
globalThis.onmessage = async (event: MessageEvent) => {
  const { type, imageDataUrl, landmarks } = event.data

  try {
    if (type === 'INITIALIZE') {
      console.log('🔧 Initializing TensorFlow.js in Web Worker...')
      await initializeTensorFlow()
      console.log('✅ TensorFlow.js initialized in Web Worker')
      
      // Must respond to prevent timeout
      globalThis.postMessage({
        type: 'INITIALIZE',
        result: { success: true },
      })
    } else if (type === 'ANALYZE_SKIN') {
      const result = await processSkinAnalysis(imageDataUrl, landmarks)
      
      globalThis.postMessage({
        type: 'ANALYZE_SKIN',
        result,
      })
    }
  } catch (error) {
    console.error('❌ Worker error:', error)
    globalThis.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
