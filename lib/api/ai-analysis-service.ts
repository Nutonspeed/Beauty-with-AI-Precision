/**
 * AI Analysis Service Client
 * Client-side interface to Python FastAPI AI service
 */

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'

export interface DetectionBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export interface SpotsAnalysisResult {
  detections: Array<DetectionBox & {
    size_mm: number
    melanin_density: number
  }>
  statistics: {
    total_count: number
    average_confidence: number
    severity: 'low' | 'medium' | 'high'
    total_area: number
  }
  processing_time_ms: number
}

export interface WrinklesAnalysisResult {
  detections: Array<DetectionBox & {
    length_px: number
    depth_score: number
  }>
  statistics: {
    total_count: number
    average_confidence: number
    severity: 'low' | 'medium' | 'high'
    avg_depth: number
  }
  processing_time_ms: number
}

export interface TextureAnalysisResult {
  metrics: {
    smoothness_score: number
    roughness_score: number
    overall_score: number
  }
  processing_time_ms: number
}

export interface PoresAnalysisResult {
  detections: Array<DetectionBox & {
    size_mm: number
    pore_type: 'normal' | 'enlarged' | 'very_enlarged'
  }>
  statistics: {
    total_count: number
    average_confidence: number
    severity: 'low' | 'medium' | 'high'
    avg_size: number
    pore_density: number
  }
  processing_time_ms: number
}

export interface MultiModeAnalysisResult {
  spots: SpotsAnalysisResult
  wrinkles: WrinklesAnalysisResult
  texture: TextureAnalysisResult
  pores: PoresAnalysisResult
  overall_score: number
  processing_time_ms: number
}

export class AIAnalysisError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'AIAnalysisError'
  }
}

/**
 * Upload image and analyze for spots
 */
export async function analyzeSpots(
  imageFile: File | Blob
): Promise<SpotsAnalysisResult> {
  const formData = new FormData()
  formData.append('file', imageFile)

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze/spots`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new AIAnalysisError(
        error.detail || 'Failed to analyze spots',
        response.status,
        error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AIAnalysisError) throw error
    throw new AIAnalysisError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    )
  }
}

/**
 * Upload image and analyze for wrinkles
 */
export async function analyzeWrinkles(
  imageFile: File | Blob
): Promise<WrinklesAnalysisResult> {
  const formData = new FormData()
  formData.append('file', imageFile)

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze/wrinkles`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new AIAnalysisError(
        error.detail || 'Failed to analyze wrinkles',
        response.status,
        error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AIAnalysisError) throw error
    throw new AIAnalysisError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    )
  }
}

/**
 * Upload image and analyze texture
 */
export async function analyzeTexture(
  imageFile: File | Blob
): Promise<TextureAnalysisResult> {
  const formData = new FormData()
  formData.append('file', imageFile)

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze/texture`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new AIAnalysisError(
        error.detail || 'Failed to analyze texture',
        response.status,
        error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AIAnalysisError) throw error
    throw new AIAnalysisError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    )
  }
}

/**
 * Upload image and analyze pores
 */
export async function analyzePores(
  imageFile: File | Blob
): Promise<PoresAnalysisResult> {
  const formData = new FormData()
  formData.append('file', imageFile)

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze/pores`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new AIAnalysisError(
        error.detail || 'Failed to analyze pores',
        response.status,
        error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AIAnalysisError) throw error
    throw new AIAnalysisError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    )
  }
}

/**
 * Upload image and run all analyses in parallel (multi-mode)
 * This is the recommended method for comprehensive skin analysis
 */
export async function analyzeMultiMode(
  imageFile: File | Blob
): Promise<MultiModeAnalysisResult> {
  const formData = new FormData()
  formData.append('file', imageFile)

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze/multi-mode`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new AIAnalysisError(
        error.detail || 'Failed to analyze (multi-mode)',
        response.status,
        error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AIAnalysisError) throw error
    throw new AIAnalysisError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    )
  }
}

/**
 * Check if AI service is available
 */
export async function checkServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get service info
 */
export async function getServiceInfo(): Promise<{
  name: string
  version: string
  status: string
  gpu_available: boolean
}> {
  const response = await fetch(`${AI_SERVICE_URL}/health`)
  if (!response.ok) {
    throw new AIAnalysisError('Failed to get service info', response.status)
  }
  return await response.json()
}
