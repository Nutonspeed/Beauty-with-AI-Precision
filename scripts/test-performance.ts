/**
 * Performance Testing for Real AI Models
 * Phase 12: Test inference time, memory usage, and accuracy
 */

import { getSkinConcernDetector } from '../lib/ai/models/skin-concern-detector'
import { generateRealHeatmap } from '../lib/ai/heatmap-generator'
import type { DetectionResult } from '../lib/ai/models/skin-concern-detector'

interface PerformanceMetrics {
  testName: string
  inferenceTime: number
  memoryUsed: number
  detectionsFound: number
  averageConfidence: number
}

/**
 * Load test image
 */
async function loadTestImage(imagePath: string): Promise<ImageData> {
  // In browser environment
  if (typeof window !== 'undefined') {
    const img = new Image()
    img.src = imagePath
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    return ctx.getImageData(0, 0, img.width, img.height)
  }

  // In Node.js environment (for testing)
  // Would need node-canvas library
  throw new Error('Node.js environment not implemented. Run tests in browser.')
}

/**
 * Test detector performance
 */
async function testDetectorPerformance(
  detector: any,
  imageData: ImageData,
  detectionType: 'wrinkles' | 'pigmentation' | 'pores' | 'redness'
): Promise<PerformanceMetrics> {
  // Clear memory before test
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memBefore = (performance as any).memory.usedJSHeapSize
    
    // Run detection
    const startTime = performance.now()
    let results: DetectionResult[] = []

    switch (detectionType) {
      case 'wrinkles':
        results = await detector.detectWrinkles(imageData)
        break
      case 'pigmentation':
        results = await detector.detectPigmentation(imageData)
        break
      case 'pores':
        results = await detector.detectPores(imageData)
        break
      case 'redness':
        results = await detector.detectRedness(imageData)
        break
    }

    const inferenceTime = performance.now() - startTime
    const memAfter = (performance as any).memory.usedJSHeapSize
    const memoryUsed = memAfter - memBefore

    // Calculate average confidence
    const avgConfidence =
      results.length > 0 ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length : 0

    return {
      testName: `${detectionType} detection`,
      inferenceTime,
      memoryUsed,
      detectionsFound: results.length,
      averageConfidence: avgConfidence,
    }
  }

  throw new Error('Performance API not available')
}

/**
 * Test heatmap generation performance
 */
async function testHeatmapPerformance(
  concerns: DetectionResult[],
  width: number,
  height: number
): Promise<PerformanceMetrics> {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memBefore = (performance as any).memory.usedJSHeapSize
    
    const startTime = performance.now()
    const heatmap = generateRealHeatmap(concerns as any, {
      width,
      height,
      concernType: 'all',
      opacity: 0.7,
      blurRadius: 30,
      colorScheme: 'thermal',
    })
    const inferenceTime = performance.now() - startTime
    
    const memAfter = (performance as any).memory.usedJSHeapSize
    const memoryUsed = memAfter - memBefore

    return {
      testName: 'Heatmap generation',
      inferenceTime,
      memoryUsed,
      detectionsFound: heatmap ? 1 : 0,
      averageConfidence: 1.0,
    }
  }

  throw new Error('Performance API not available')
}

/**
 * Run comprehensive performance test suite
 */
export async function runPerformanceTests(testImagePath: string): Promise<void> {
  console.log('🚀 Starting Performance Tests for Real AI Models')
  console.log('=' .repeat(60))

  try {
    // Initialize detector
    console.log('\n📥 Initializing detector...')
    const detector = await getSkinConcernDetector()
    console.log('✅ Detector initialized')

    // Load test image
    console.log(`\n📷 Loading test image: ${testImagePath}`)
    const imageData = await loadTestImage(testImagePath)
    console.log(`✅ Image loaded: ${imageData.width}x${imageData.height}`)

    // Run detection tests
    const tests = ['wrinkles', 'pigmentation', 'pores', 'redness'] as const
    const metrics: PerformanceMetrics[] = []

    console.log('\n🔍 Running Detection Tests...')
    for (const testType of tests) {
      const metric = await testDetectorPerformance(detector, imageData, testType)
      metrics.push(metric)
      console.log(
        `  ${testType.padEnd(15)}: ${metric.inferenceTime.toFixed(2)}ms, ` +
          `${metric.detectionsFound} detections, ` +
          `${(metric.averageConfidence * 100).toFixed(1)}% avg confidence`
      )
    }

    // Collect all detections for heatmap test
    const [wrinkles, pigmentation, pores, redness] = await Promise.all([
      detector.detectWrinkles(imageData),
      detector.detectPigmentation(imageData),
      detector.detectPores(imageData),
      detector.detectRedness(imageData),
    ])

    const allConcerns = [...wrinkles, ...pigmentation, ...pores, ...redness]

    // Test heatmap generation
    console.log('\n🎨 Testing Heatmap Generation...')
    const heatmapMetric = await testHeatmapPerformance(
      allConcerns,
      imageData.width,
      imageData.height
    )
    metrics.push(heatmapMetric)
    console.log(`  Heatmap generation: ${heatmapMetric.inferenceTime.toFixed(2)}ms`)

    // Calculate totals
    const totalTime = metrics.reduce((sum, m) => sum + m.inferenceTime, 0)
    const totalMemory = metrics.reduce((sum, m) => sum + m.memoryUsed, 0)
    const totalDetections = metrics.reduce((sum, m) => sum + m.detectionsFound, 0)

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 PERFORMANCE SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Inference Time: ${totalTime.toFixed(2)}ms`)
    console.log(`Total Memory Used: ${(totalMemory / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Total Detections: ${totalDetections}`)
    console.log(
      `Average Confidence: ${(
        metrics.reduce((sum, m) => sum + m.averageConfidence, 0) / metrics.length *
        100
      ).toFixed(1)}%`
    )

    // Performance targets
    console.log('\n🎯 PERFORMANCE TARGETS:')
    const targetTime = 2000 // 2 seconds total
    const targetMemory = 200 // 200 MB
    const passingTime = totalTime <= targetTime
    const passingMemory = totalMemory <= targetMemory * 1024 * 1024

    console.log(
      `  ⏱️  Total Time: ${totalTime.toFixed(2)}ms / ${targetTime}ms ${
        passingTime ? '✅ PASS' : '❌ FAIL'
      }`
    )
    console.log(
      `  💾 Memory: ${(totalMemory / 1024 / 1024).toFixed(2)}MB / ${targetMemory}MB ${
        passingMemory ? '✅ PASS' : '❌ FAIL'
      }`
    )

    if (passingTime && passingMemory) {
      console.log('\n✅ ALL PERFORMANCE TARGETS MET!')
    } else {
      console.log('\n⚠️ Some performance targets not met. Consider optimization.')
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    if (!passingTime) {
      console.log(
        '  - Enable WebGL backend for TensorFlow.js (faster GPU inference)'
      )
      console.log('  - Use model quantization to reduce model size')
      console.log('  - Implement parallel detection with Web Workers')
    }
    if (!passingMemory) {
      console.log('  - Dispose unused tensors after inference')
      console.log('  - Use model caching to avoid reloading')
      console.log('  - Implement memory pooling for image processing')
    }
    if (passingTime && passingMemory) {
      console.log('  - Performance is excellent! Consider deploying to production.')
      console.log('  - Monitor real-world usage for further optimization opportunities.')
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error)
  }
}

/**
 * Quick performance test (for development)
 */
export async function quickPerformanceTest(): Promise<void> {
  console.log('⚡ Quick Performance Test (Synthetic Data)')
  console.log('=' .repeat(60))

  try {
    // Create synthetic test image
    const width = 640
    const height = 480
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // Fill with random colors (simulating skin tones)
    const imageData = ctx.createImageData(width, height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 180 + Math.random() * 50 // R
      imageData.data[i + 1] = 140 + Math.random() * 40 // G
      imageData.data[i + 2] = 120 + Math.random() * 30 // B
      imageData.data[i + 3] = 255 // A
    }

    console.log(`\n📷 Synthetic image: ${width}x${height}`)

    // Initialize detector
    console.log('\n📥 Initializing detector...')
    const startInit = performance.now()
    const detector = await getSkinConcernDetector()
    const initTime = performance.now() - startInit
    console.log(`✅ Detector initialized in ${initTime.toFixed(2)}ms`)

    // Run all detections in parallel
    console.log('\n🔍 Running parallel detection...')
    const startDetection = performance.now()
    const [wrinkles, pigmentation, pores, redness] = await Promise.all([
      detector.detectWrinkles(imageData),
      detector.detectPigmentation(imageData),
      detector.detectPores(imageData),
      detector.detectRedness(imageData),
    ])
    const detectionTime = performance.now() - startDetection

    const totalDetections =
      wrinkles.length + pigmentation.length + pores.length + redness.length

    console.log(`✅ Detection complete in ${detectionTime.toFixed(2)}ms`)
    console.log(
      `   - Wrinkles: ${wrinkles.length}, Pigmentation: ${pigmentation.length}, ` +
        `Pores: ${pores.length}, Redness: ${redness.length}`
    )

    // Generate heatmap
    console.log('\n🎨 Generating heatmap...')
    const allConcerns = [...wrinkles, ...pigmentation, ...pores, ...redness]
    const startHeatmap = performance.now()
    const heatmap = generateRealHeatmap(allConcerns as any, {
      width,
      height,
      concernType: 'all',
      opacity: 0.7,
      blurRadius: 30,
    })
    const heatmapTime = performance.now() - startHeatmap
    console.log(`✅ Heatmap generated in ${heatmapTime.toFixed(2)}ms`)

    // Summary
    const totalTime = detectionTime + heatmapTime
    console.log('\n' + '='.repeat(60))
    console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}ms`)
    console.log(`🎯 Target: <2000ms - ${totalTime <= 2000 ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`📦 Detections: ${totalDetections}`)

    if (typeof (performance as any).memory !== 'undefined') {
      const memUsed = (performance as any).memory.usedJSHeapSize / 1024 / 1024
      console.log(`💾 Memory: ${memUsed.toFixed(2)} MB`)
    }
  } catch (error) {
    console.error('❌ Quick test failed:', error)
  }
}

// Export for use in test page
if (typeof window !== 'undefined') {
  ;(window as any).runPerformanceTests = runPerformanceTests
  ;(window as any).quickPerformanceTest = quickPerformanceTest
}
