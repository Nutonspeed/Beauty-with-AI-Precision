// DeepFace API Client for Beauty with AI Precision

class DeepFaceClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = process.env.DEEPFACE_API_URL || 'http://localhost:8001', timeout: number = 30000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  async analyzeFace(imageFile: File): Promise<FaceAnalysisResult> {
    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`DeepFace API error: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('DeepFace analysis failed:', error)
      throw error
    }
  }

  async analyzeBatch(imageFiles: File[]): Promise<BatchAnalysisResult[]> {
    const formData = new FormData()
    
    imageFiles.forEach((file, index) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch(`${this.baseUrl}/analyze-batch`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeout * 2) // Longer timeout for batch
      })

      if (!response.ok) {
        throw new Error(`DeepFace API error: ${response.status}`)
      }

      const result = await response.json()
      return result.results
    } catch (error) {
      console.error('DeepFace batch analysis failed:', error)
      throw error
    }
  }

  async compareFaces(file1: File, file2: File): Promise<FaceComparisonResult> {
    const formData = new FormData()
    formData.append('file1', file1)
    formData.append('file2', file2)

    try {
      const response = await fetch(`${this.baseUrl}/compare-faces`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`DeepFace API error: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('DeepFace face comparison failed:', error)
      throw error
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })

      return response.ok
    } catch (error) {
      return false
    }
  }
}

// Type definitions
interface FaceAnalysisResult {
  face_detected: boolean
  confidence: number
  age?: number
  gender?: string
  race?: string
  emotion?: string
  face_coordinates?: any
  skin_analysis: {
    texture_score?: number
    skin_tone?: {
      hue: number
      saturation: number
      value: number
    }
    smoothness?: number
    brightness?: number
  }
  beauty_metrics: {
    age_score?: number
    symmetry_score?: number
    skin_quality?: number
    overall_score?: number
  }
  processing_time: number
}

interface BatchAnalysisResult {
  filename: string
  success: boolean
  data?: FaceAnalysisResult
  error?: string
}

interface FaceComparisonResult {
  verified: boolean
  distance: number
  threshold: number
  model: string
  similarity_metric: string
}

export const deepFaceClient = new DeepFaceClient()
export type { FaceAnalysisResult, BatchAnalysisResult, FaceComparisonResult }
