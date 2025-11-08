/**
 * Real-time AR Live Preview Manager
 * จัดการ WebRTC stream และ real-time face tracking สำหรับ AR live preview
 */

export interface LivePreviewConfig {
  // Video constraints
  video: {
    width: { ideal: number; max: number }
    height: { ideal: number; max: number }
    facingMode: 'user' | 'environment'
    frameRate: { ideal: number; max: number }
  }
  
  // Processing options
  enableFaceTracking: boolean
  enableAREffects: boolean
  targetFPS: number
  
  // Quality settings
  quality: 'low' | 'medium' | 'high'
}

export interface FaceTrackingResult {
  landmarks: Array<{ x: number; y: number; z?: number }>
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  timestamp: number
}

export interface AREffectConfig {
  type: 'botox' | 'filler' | 'laser' | 'peel' | 'smoothing' | 'whitening'
  intensity: number // 0-1
  targetAreas?: Array<'forehead' | 'eyes' | 'cheeks' | 'jawline' | 'full'>
}

export class LiveARPreviewManager {
  private mediaStream: MediaStream | null = null
  private videoElement: HTMLVideoElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  
  private isRunning = false
  private animationFrameId: number | null = null
  
  // Face tracking
  private faceLandmarker: any = null // MediaPipe FaceLandmarker
  private lastFaceResult: FaceTrackingResult | null = null
  
  // AR effects
  private activeEffects: AREffectConfig[] = []
  
  // Performance tracking
  private frameCount = 0
  private lastFPSUpdate = 0
  private currentFPS = 0
  
  // Event callbacks
  private onFaceDetected?: (result: FaceTrackingResult) => void
  private onFPSUpdate?: (fps: number) => void
  private onError?: (error: Error) => void

  /**
   * เริ่มต้น live preview
   */
  async start(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    config: Partial<LivePreviewConfig> = {}
  ): Promise<void> {
    if (this.isRunning) {
      console.warn('[Live AR] Already running')
      return
    }

    console.log('[Live AR] Starting live preview...')

    try {
      // Set elements
      this.videoElement = videoElement
      this.canvasElement = canvasElement
      this.ctx = canvasElement.getContext('2d', { willReadFrequently: true })

      if (!this.ctx) {
        throw new Error('ไม่สามารถสร้าง canvas context ได้')
      }

      // Default config
      const fullConfig: LivePreviewConfig = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        },
        enableFaceTracking: true,
        enableAREffects: true,
        targetFPS: 30,
        quality: 'medium',
        ...config
      }

      // Request camera access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: fullConfig.video,
        audio: false
      })

      // Set video source
      videoElement.srcObject = this.mediaStream
      await videoElement.play()

      // Set canvas size
      canvasElement.width = videoElement.videoWidth
      canvasElement.height = videoElement.videoHeight

      console.log(`[Live AR] Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`)

      // Initialize face tracking if enabled
      if (fullConfig.enableFaceTracking) {
        await this.initializeFaceTracking()
      }

      // Start rendering loop
      this.isRunning = true
      this.renderLoop()

      console.log('[Live AR] ✅ Live preview started successfully')

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      console.error('[Live AR] Failed to start:', err)
      
      if (this.onError) {
        this.onError(err)
      }
      
      throw err
    }
  }

  /**
   * หยุด live preview
   */
  stop(): void {
    console.log('[Live AR] Stopping live preview...')

    this.isRunning = false

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    // Clear video
    if (this.videoElement) {
      this.videoElement.srcObject = null
    }

    // Clear canvas
    if (this.ctx && this.canvasElement) {
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)
    }

    console.log('[Live AR] ✅ Live preview stopped')
  }

  /**
   * เพิ่ม AR effect
   */
  addEffect(effect: AREffectConfig): void {
    console.log(`[Live AR] Adding effect: ${effect.type} at ${effect.intensity}`)
    this.activeEffects.push(effect)
  }

  /**
   * ลบ AR effect
   */
  removeEffect(type: AREffectConfig['type']): void {
    this.activeEffects = this.activeEffects.filter(e => e.type !== type)
    console.log(`[Live AR] Removed effect: ${type}`)
  }

  /**
   * ลบทุก effects
   */
  clearEffects(): void {
    this.activeEffects = []
    console.log('[Live AR] Cleared all effects')
  }

  /**
   * อัพเดทความเข้ม effect
   */
  updateEffectIntensity(type: AREffectConfig['type'], intensity: number): void {
    const effect = this.activeEffects.find(e => e.type === type)
    if (effect) {
      effect.intensity = Math.max(0, Math.min(1, intensity))
      console.log(`[Live AR] Updated ${type} intensity to ${effect.intensity}`)
    }
  }

  /**
   * ถ่ายภาพจาก live preview
   */
  captureFrame(): string | null {
    if (!this.canvasElement) return null
    
    try {
      return this.canvasElement.toDataURL('image/jpeg', 0.95)
    } catch (error) {
      console.error('[Live AR] Failed to capture frame:', error)
      return null
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.currentFPS
  }

  /**
   * Get face tracking result
   */
  getLastFaceResult(): FaceTrackingResult | null {
    return this.lastFaceResult
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onFaceDetected?: (result: FaceTrackingResult) => void
    onFPSUpdate?: (fps: number) => void
    onError?: (error: Error) => void
  }): void {
    this.onFaceDetected = callbacks.onFaceDetected
    this.onFPSUpdate = callbacks.onFPSUpdate
    this.onError = callbacks.onError
  }

  // Private methods

  private async initializeFaceTracking(): Promise<void> {
    console.log('[Live AR] Initializing face tracking...')

    try {
      // Dynamic import MediaPipe
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      console.log('[Live AR] ✅ Face tracking initialized')

    } catch (error) {
      console.error('[Live AR] Failed to initialize face tracking:', error)
      throw error
    }
  }

  private renderLoop = (): void => {
    if (!this.isRunning || !this.videoElement || !this.canvasElement || !this.ctx) {
      return
    }

    const startTime = performance.now()

    try {
      // Draw video frame to canvas
      this.ctx.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      )

      // Face tracking
      if (this.faceLandmarker && this.videoElement.readyState >= 2) {
        this.trackFace()
      }

      // Apply AR effects
      if (this.activeEffects.length > 0) {
        this.applyAREffects()
      }

      // Update FPS
      this.updateFPS()

    } catch (error) {
      console.error('[Live AR] Error in render loop:', error)
      if (this.onError && error instanceof Error) {
        this.onError(error)
      }
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.renderLoop)
  }

  private trackFace(): void {
    if (!this.faceLandmarker || !this.videoElement) return

    try {
      const nowMs = performance.now()
      const results = this.faceLandmarker.detectForVideo(this.videoElement, nowMs)

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0]
        type NormalizedLandmark = { x: number; y: number; z: number }

        // Convert to our format
        const landmarksArray: Array<{ x: number; y: number; z: number }> = landmarks.map(
          (lm: NormalizedLandmark) => ({
            x: lm.x * this.canvasElement!.width,
            y: lm.y * this.canvasElement!.height,
            z: lm.z,
          })
        )

        // Calculate bounding box
        const xs = landmarksArray.map((landmark) => landmark.x)
        const ys = landmarksArray.map((landmark) => landmark.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        this.lastFaceResult = {
          landmarks: landmarksArray,
          boundingBox: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          },
          confidence: 0.9, // MediaPipe doesn't provide per-face confidence in video mode
          timestamp: nowMs
        }

        // Callback
        if (this.onFaceDetected) {
          this.onFaceDetected(this.lastFaceResult)
        }

        // Draw landmarks (optional - for debugging)
        // this.drawLandmarks(landmarksArray)
      }

    } catch (error) {
      // Silently fail - face might not be in frame
    }
  }

  private applyAREffects(): void {
    if (!this.ctx || !this.canvasElement || !this.lastFaceResult) return

    const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height)
    const data = imageData.data

    for (const effect of this.activeEffects) {
      switch (effect.type) {
        case 'smoothing':
          this.applySmoothingEffect(data, effect.intensity)
          break
        case 'whitening':
          this.applyWhiteningEffect(data, effect.intensity)
          break
        case 'botox':
          this.applyBotoxEffect(effect.intensity)
          break
        case 'filler':
          this.applyFillerEffect(effect.intensity)
          break
        // Add more effects as needed
      }
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private applySmoothingEffect(data: Uint8ClampedArray, intensity: number): void {
    // Simple bilateral filter approximation
    const strength = intensity * 0.3
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Smooth by averaging with neighbors (simplified)
      data[i] = r + (128 - r) * strength
      data[i + 1] = g + (128 - g) * strength
      data[i + 2] = b + (128 - b) * strength
    }
  }

  private applyWhiteningEffect(data: Uint8ClampedArray, intensity: number): void {
    const brightenAmount = intensity * 20
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + brightenAmount) // R
      data[i + 1] = Math.min(255, data[i + 1] + brightenAmount) // G
      data[i + 2] = Math.min(255, data[i + 2] + brightenAmount) // B
    }
  }

  private applyBotoxEffect(intensity: number): void {
    if (!this.ctx || !this.lastFaceResult) return

    // Blur forehead area to simulate botox effect
    const { landmarks, boundingBox } = this.lastFaceResult
    
    // Get forehead region (top 1/3 of face)
    const foreheadY = boundingBox.y
    const foreheadHeight = boundingBox.height * 0.33
    
    this.ctx.filter = `blur(${intensity * 2}px)`
    this.ctx.drawImage(
      this.canvasElement!,
      boundingBox.x,
      foreheadY,
      boundingBox.width,
      foreheadHeight,
      boundingBox.x,
      foreheadY,
      boundingBox.width,
      foreheadHeight
    )
    this.ctx.filter = 'none'
  }

  private applyFillerEffect(intensity: number): void {
    if (!this.ctx || !this.lastFaceResult) return

    // Subtle volumization effect on cheeks
    const { boundingBox } = this.lastFaceResult
    
    const cheeksY = boundingBox.y + boundingBox.height * 0.4
    const cheeksHeight = boundingBox.height * 0.3
    
    // Slight expansion effect
    this.ctx.globalAlpha = intensity * 0.3
    this.ctx.filter = `blur(${intensity * 1.5}px)`
    this.ctx.drawImage(
      this.canvasElement!,
      boundingBox.x,
      cheeksY,
      boundingBox.width,
      cheeksHeight,
      boundingBox.x - intensity * 2,
      cheeksY,
      boundingBox.width + intensity * 4,
      cheeksHeight
    )
    this.ctx.globalAlpha = 1
    this.ctx.filter = 'none'
  }

  private drawLandmarks(landmarks: Array<{ x: number; y: number }>): void {
    if (!this.ctx) return

    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
    landmarks.forEach(lm => {
      this.ctx!.beginPath()
      this.ctx!.arc(lm.x, lm.y, 1, 0, 2 * Math.PI)
      this.ctx!.fill()
    })
  }

  private updateFPS(): void {
    this.frameCount++
    const now = performance.now()

    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate))
      this.frameCount = 0
      this.lastFPSUpdate = now

      if (this.onFPSUpdate) {
        this.onFPSUpdate(this.currentFPS)
      }
    }
  }
}

// Singleton instance
let liveARInstance: LiveARPreviewManager | null = null

export function getLiveARPreviewManager(): LiveARPreviewManager {
  if (!liveARInstance) {
    liveARInstance = new LiveARPreviewManager()
  }
  return liveARInstance
}
