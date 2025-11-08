/**
 * Hugging Face API Client
 * Client-side wrapper for calling Hugging Face API via server proxy
 * Security: Token is hidden on server-side
 */

export type HuggingFaceTask = 'featureExtraction' | 'segmentation' | 'classification'

export interface HuggingFaceClientRequest {
  task: HuggingFaceTask
  imageData: string // base64 encoded image
}

export interface HuggingFaceClientResponse {
  success: boolean
  task: HuggingFaceTask
  model: string
  result: any
  timestamp: string
}

export interface HuggingFaceError {
  error: string
  message: string
  status?: number
  retryAfter?: number
}

/**
 * Call Hugging Face API via server-side proxy
 */
export async function callHuggingFaceAPI(
  request: HuggingFaceClientRequest
): Promise<HuggingFaceClientResponse> {
  const response = await fetch('/api/ai/huggingface', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json() as HuggingFaceError
    throw new Error(error.message || 'Hugging Face API request failed')
  }

  return response.json()
}

/**
 * Extract features from image using DINOv2
 */
export async function extractFeatures(imageData: string) {
  return callHuggingFaceAPI({
    task: 'featureExtraction',
    imageData,
  })
}

/**
 * Segment image using DETR
 */
export async function segmentImage(imageData: string) {
  return callHuggingFaceAPI({
    task: 'segmentation',
    imageData,
  })
}

/**
 * Classify image using ViT
 */
export async function classifyImage(imageData: string) {
  return callHuggingFaceAPI({
    task: 'classification',
    imageData,
  })
}

/**
 * Check if Hugging Face API is configured
 */
export async function checkHuggingFaceHealth(): Promise<{
  ok: boolean
  configured: boolean
  supportedTasks: string[]
}> {
  const response = await fetch('/api/ai/huggingface')
  return response.json()
}
