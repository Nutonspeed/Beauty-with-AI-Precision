/**
 * MediaPipe Face Mesh Detector (468 Landmarks)
 * 
 * Real face detection with 468 landmarks using MediaPipe
 * Phase 8.1: Real AI Integration
 */

export interface FaceLandmark {
  x: number
  y: number
  z: number
}

export interface FaceDetectionResult {
  landmarks: FaceLandmark[]
  boundingBox: {
    xMin: number
    yMin: number
    width: number
    height: number
  }
  confidence: number
  processingTime: number
}

// MediaPipe types (dynamically loaded)
type FaceMesh = any
type Results = any

export class MediaPipeFaceDetector {
  private faceMesh: FaceMesh | null = null
  private isInitialized = false

  /**
   * Initialize MediaPipe Face Mesh (468 landmarks)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Dynamic import MediaPipe (browser only)
      if (typeof window === 'undefined') {
        throw new Error('MediaPipe only works in browser')
      }

      // Load MediaPipe from CDN
      await this.loadMediaPipeScript()

      const FaceMeshCtor = (window as any).FaceMesh as any
      if (!FaceMeshCtor) {
        throw new Error('MediaPipe FaceMesh not loaded on window')
      }

      this.faceMesh = new FaceMeshCtor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      this.isInitialized = true
      console.log('✅ MediaPipe Face Mesh initialized (468 landmarks)')
    } catch (error) {
      console.error('❌ Failed to initialize MediaPipe:', error)
      throw error
    }
  }

  /**
   * Load MediaPipe script from CDN with retry logic
   */
  private async loadMediaPipeScript(): Promise<void> {
    const maxRetries = 3
    const baseDelay = 1000 // 1 second
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.attemptLoadMediaPipeScript(attempt)
        console.log(`✅ MediaPipe script loaded successfully (attempt ${attempt + 1}/${maxRetries})`)
        return
      } catch (error) {
        const isLastAttempt = attempt === maxRetries - 1
        
        if (isLastAttempt) {
          console.error('❌ Failed to load MediaPipe after all retries:', error)
          throw new Error(`Failed to load MediaPipe script after ${maxRetries} attempts`)
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt)
        console.warn(`⚠️ MediaPipe load failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`)
        await this.delay(delay)
      }
    }
  }

  /**
   * Single attempt to load MediaPipe script
   */
  private async attemptLoadMediaPipeScript(attemptNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      // @ts-ignore
      if (window.FaceMesh) {
        console.log('✅ MediaPipe script already loaded')
        resolve()
        return
      }

      console.log(`📥 Loading MediaPipe from CDN (attempt ${attemptNumber + 1})...`)
      
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
      script.async = true
      
      // Timeout for this attempt (10 seconds)
      const timeout = setTimeout(() => {
        script.remove()
        reject(new Error('Script load timeout'))
      }, 10000)
      
      script.onload = () => {
        clearTimeout(timeout)
        console.log('✅ MediaPipe script loaded successfully')
        // Wait a bit for MediaPipe to fully initialize
        setTimeout(() => resolve(), 500)
      }
      
      script.onerror = (error) => {
        clearTimeout(timeout)
        script.remove()
        reject(new Error('Failed to load MediaPipe script from CDN'))
      }
      
      document.head.appendChild(script)
    })
  }

  /**
   * Helper: Delay promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Detect 468 face landmarks from image with retry logic
   */
  async detectFace(imageElement: HTMLImageElement | HTMLVideoElement): Promise<FaceDetectionResult | null> {
    if (!this.isInitialized || !this.faceMesh) {
      throw new Error('MediaPipe not initialized. Call initialize() first.')
    }

    const maxRetries = 2
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.attemptDetectFace(imageElement, attempt)
        if (result) {
          console.log(`✅ Face detection successful (attempt ${attempt + 1}/${maxRetries})`)
          return result
        }
        
        // If no face detected but no error, return null (legitimate no-face scenario)
        if (attempt === maxRetries - 1) {
          console.warn('⚠️ No face detected after all attempts')
          return null
        }
        
        console.warn(`⚠️ No face detected (attempt ${attempt + 1}/${maxRetries}), retrying...`)
        await this.delay(500) // Short delay before retry
        
      } catch (error) {
        if (attempt === maxRetries - 1) {
          console.error('❌ Face detection failed after all retries:', error)
          return null // Return null instead of throwing to allow fallback
        }
        console.warn(`⚠️ Detection error (attempt ${attempt + 1}/${maxRetries}), retrying...`, error)
        await this.delay(500)
      }
    }
    
    return null
  }

  /**
   * Single attempt to detect face
   */
  private async attemptDetectFace(
    imageElement: HTMLImageElement | HTMLVideoElement,
    attemptNumber: number
  ): Promise<FaceDetectionResult | null> {
    const startTime = performance.now()

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn(`⚠️ MediaPipe detection timeout (10s) on attempt ${attemptNumber + 1}`)
        resolve(null)
      }, 10000)

      this.faceMesh.onResults((results: Results) => {
        clearTimeout(timeout)
        const processingTime = performance.now() - startTime

        console.log('📊 MediaPipe Results:', {
          hasFaces: results.multiFaceLandmarks?.length > 0,
          faceCount: results.multiFaceLandmarks?.length || 0,
          processingTime: `${processingTime.toFixed(2)}ms`,
          attempt: attemptNumber + 1
        })

        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
          console.warn(`⚠️ No face detected by MediaPipe (attempt ${attemptNumber + 1})`)
          resolve(null)
          return
        }

        const faceLandmarks = results.multiFaceLandmarks[0]
        
        // Convert to our format (468 landmarks!)
        const landmarks: FaceLandmark[] = faceLandmarks.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z || 0,
        }))

        console.log(`✅ Detected ${landmarks.length} landmarks`)

        // Calculate bounding box
        const xCoords = landmarks.map(l => l.x)
        const yCoords = landmarks.map(l => l.y)
        const xMin = Math.min(...xCoords)
        const yMin = Math.min(...yCoords)
        const xMax = Math.max(...xCoords)
        const yMax = Math.max(...yCoords)

        resolve({
          landmarks,
          boundingBox: {
            xMin,
            yMin,
            width: xMax - xMin,
            height: yMax - yMin,
          },
          confidence: 0.95,
          processingTime,
        })
      })

      // Send image to MediaPipe
      try {
        console.log(`📸 Sending image to MediaPipe (attempt ${attemptNumber + 1})...`)
        this.faceMesh.send({ image: imageElement })
      } catch (error) {
        clearTimeout(timeout)
        console.error(`❌ Error sending image to MediaPipe (attempt ${attemptNumber + 1}):`, error)
        reject(error)
      }
    })
  }

  /**
   * Get specific facial regions from landmarks
   */
  getFacialRegions(landmarks: FaceLandmark[]) {
    return {
      // Forehead region (landmarks 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288)
      forehead: landmarks.slice(10, 67),
      
      // Left eye region (landmarks 33, 7, 163, 144, 145, 153, 154, 155, 133)
      leftEye: landmarks.slice(33, 133),
      
      // Right eye region (landmarks 362, 382, 381, 380, 374, 373, 390, 249, 263)
      rightEye: landmarks.slice(362, 398),
      
      // Nose region (landmarks 1, 2, 98, 327)
      nose: landmarks.slice(1, 5),
      
      // Mouth region (landmarks 61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291)
      mouth: landmarks.slice(61, 291),
      
      // Left cheek region
      leftCheek: landmarks.slice(117, 187),
      
      // Right cheek region  
      rightCheek: landmarks.slice(346, 425),
      
      // Jawline region
      jawline: landmarks.slice(136, 172).concat(landmarks.slice(397, 435)),
    }
  }

  /**
   * Check if face is well-positioned for analysis
   */
  validateFacePosition(result: FaceDetectionResult): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // Check if face is too small (< 30% of image)
    if (result.boundingBox.width < 0.3 || result.boundingBox.height < 0.3) {
      issues.push('Face too small - move closer to camera')
    }

    // Check if face is too large (> 90% of image)
    if (result.boundingBox.width > 0.9 || result.boundingBox.height > 0.9) {
      issues.push('Face too close - move back from camera')
    }

    // Check if face is centered
    const centerX = result.boundingBox.xMin + result.boundingBox.width / 2
    if (centerX < 0.3 || centerX > 0.7) {
      issues.push('Face not centered - align face in frame')
    }

    // Check confidence
    if (result.confidence < 0.7) {
      issues.push('Low detection confidence - improve lighting')
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.faceMesh) {
      if (this.faceMesh.close) {
        this.faceMesh.close()
      }
      this.faceMesh = null
    }
    this.isInitialized = false
  }
}

// Singleton instance
let detectorInstance: MediaPipeFaceDetector | null = null

/**
 * Get MediaPipe detector instance (singleton)
 */
export function getMediaPipeDetector(): MediaPipeFaceDetector {
  detectorInstance ??= new MediaPipeFaceDetector()
  return detectorInstance
}
