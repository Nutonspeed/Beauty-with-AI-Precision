 
/**
 * MediaPipe Face Detection Web Worker
 * 
 * Runs MediaPipe Face Mesh in a separate thread to avoid blocking UI
 * Processes 478 facial landmarks detection
 */

// import { FaceMesh } from '@mediapipe/face_mesh' // Dynamic import below

let faceMesh: any = null // Use any for MediaPipe types
let isInitialized = false

// Initialize MediaPipe Face Mesh
async function initializeFaceMesh() {
  if (isInitialized && faceMesh) {
    return faceMesh
  }

  // Dynamic import to avoid build issues
  const { FaceMesh } = await import('@mediapipe/face_mesh')

  faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    },
  })

  // Use lite model for faster processing
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: false, // Disable refinement for speed (lite mode)
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })

  await faceMesh.initialize()
  isInitialized = true
  
  console.log('✅ MediaPipe Face Mesh initialized with lite settings')
  console.log('   - Model complexity: lite (faster)')
  console.log('   - Refine landmarks: disabled (speed optimization)')

  return faceMesh
}

// Process face detection
async function processFaceDetection(imageDataUrl: string) {
  const startTime = performance.now()

  try {
    // Initialize if not already done
    const mesh = await initializeFaceMesh()

    // Create image from data URL
    const image = await createImageFromDataUrl(imageDataUrl)

    // Process with MediaPipe
    const results = await new Promise<any>((resolve, reject) => {
      let resolved = false

      mesh.onResults((result: any) => {
        if (!resolved) {
          resolved = true
          resolve(result)
        }
      })

      setTimeout(() => {
        if (!resolved) {
          resolved = true
          reject(new Error('MediaPipe processing timeout'))
        }
      }, 10000)

      mesh.send({ image })
    })

    const processingTime = performance.now() - startTime

    // Extract landmarks and bounding box
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      throw new Error('No face detected')
    }

    const landmarks = results.multiFaceLandmarks[0]
    const boundingBox = calculateBoundingBox(landmarks)

    return {
      landmarks: landmarks.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      })),
      boundingBox,
      confidence: 0.95, // MediaPipe doesn't provide confidence, use default
      processingTime: Math.round(processingTime),
    }
  } catch (error) {
    throw new Error(`Face detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper: Create image from data URL
function createImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    
    img.src = dataUrl
  })
}

// Helper: Calculate bounding box from landmarks
function calculateBoundingBox(landmarks: any[]) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0

  landmarks.forEach((lm) => {
    minX = Math.min(minX, lm.x)
    minY = Math.min(minY, lm.y)
    maxX = Math.max(maxX, lm.x)
    maxY = Math.max(maxY, lm.y)
  })

  return {
    xMin: minX,
    yMin: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

// Worker message handler
self.onmessage = async (event: MessageEvent) => {
  const { type, imageDataUrl } = event.data

  try {
    if (type === 'DETECT_FACE') {
      const result = await processFaceDetection(imageDataUrl)
      
      self.postMessage({
        type: 'DETECT_FACE_SUCCESS',
        result,
      })
    } else if (type === 'INITIALIZE') {
      await initializeFaceMesh()
      
      self.postMessage({
        type: 'INITIALIZE_SUCCESS',
      })
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Export for TypeScript
export {}
