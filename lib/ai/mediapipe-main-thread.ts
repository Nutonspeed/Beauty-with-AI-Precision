/**
 * MediaPipe Face Detection (Main Thread)
 * 
 * Falls back to main thread for MediaPipe processing
 * since MediaPipe requires DOM APIs not available in Web Workers
 */

import type { FaceDetectionResult } from './worker-manager'

let faceMesh: any = null
let isInitialized = false
let faceMeshConstructorPromise: Promise<FaceMeshConstructor> | null = null

type FaceMeshConstructor = new (config?: {
  locateFile?: (file: string) => string
}) => {
  initialize(): Promise<void>
  setOptions(options: Record<string, unknown>): void
  onResults(listener: (result: any) => void): void
  send(inputs: { image: HTMLImageElement }): Promise<void>
}

declare global {
  interface Window {
    FaceMesh?: FaceMeshConstructor
  }
}

async function loadFaceMeshConstructor(): Promise<FaceMeshConstructor> {
  if (faceMeshConstructorPromise) {
    return faceMeshConstructorPromise
  }

  faceMeshConstructorPromise = new Promise<FaceMeshConstructor>((resolve, reject) => {
    if (typeof window === 'undefined') {
      faceMeshConstructorPromise = null
      reject(new Error('MediaPipe requires a browser environment'))
      return
    }

    const existing = window.FaceMesh
    if (typeof existing === 'function') {
      resolve(existing)
      return
    }

    const scriptId = 'mediapipe-face-mesh-script'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null

    const scriptReadyState = (existingScript as (HTMLScriptElement & { readyState?: string }) | null)?.readyState
    const isAlreadyLoaded =
      !!existingScript &&
      (existingScript.dataset.loaded === 'true' || scriptReadyState === 'complete')

    if (isAlreadyLoaded) {
      if (typeof window.FaceMesh === 'function') {
        resolve(window.FaceMesh)
        return
      }

      faceMeshConstructorPromise = null
      reject(new Error('MediaPipe FaceMesh script loaded but constructor missing'))
      return
    }

    const script = existingScript ?? document.createElement('script')

    const handleLoad = () => {
      script.dataset.loaded = 'true'
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)

      if (typeof window.FaceMesh === 'function') {
        resolve(window.FaceMesh)
      } else {
        faceMeshConstructorPromise = null
        reject(new Error('MediaPipe FaceMesh constructor not found after script load'))
      }
    }

    const handleError = () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
      faceMeshConstructorPromise = null
      reject(new Error('Failed to load MediaPipe FaceMesh script'))
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    if (!existingScript) {
      script.id = scriptId
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.dataset.loaded = 'loading'
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js'
      document.head.appendChild(script)
    }
  })

  return faceMeshConstructorPromise
}

export async function initializeMediaPipe(): Promise<void> {
  if (isInitialized && faceMesh) {
    return
  }

  try {
    const FaceMeshClass = await loadFaceMeshConstructor()

    faceMesh = new FaceMeshClass({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    await faceMesh.initialize()
    isInitialized = true

    console.log('✅ MediaPipe Face Mesh initialized')
  } catch (error) {
    console.error('❌ Failed to initialize MediaPipe:', error)
    throw new Error('MediaPipe initialization failed')
  }
}

export async function detectFaceMainThread(
  imageDataUrl: string
): Promise<FaceDetectionResult> {
  const startTime = performance.now()

  try {
    // Ensure initialized
    await initializeMediaPipe()

    // Create image from data URL
    const image = await createImageFromDataUrl(imageDataUrl)

    // Process with MediaPipe
    const results = await new Promise<any>((resolve, reject) => {
      let resolved = false

      faceMesh.onResults((result: any) => {
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

      faceMesh.send({ image })
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
      confidence: 0.95,
      processingTime: Math.round(processingTime),
    }
  } catch (error) {
    throw new Error(
      `Face detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

function createImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))

    img.src = dataUrl
  })
}

function calculateBoundingBox(landmarks: any[]) {
  let minX = 1,
    minY = 1,
    maxX = 0,
    maxY = 0

  for (const lm of landmarks) {
    minX = Math.min(minX, lm.x)
    minY = Math.min(minY, lm.y)
    maxX = Math.max(maxX, lm.x)
    maxY = Math.max(maxY, lm.y)
  }

  return {
    xMin: minX,
    yMin: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
