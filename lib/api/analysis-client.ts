/**
 * Client-side API functions for Analysis endpoints
 */

import type { SaveAnalysisRequest, SaveAnalysisResponse, AnalysisHistoryItem, GetAnalysisResponse } from '@/types/api'

/**
 * Save analysis results to database
 */
export async function saveAnalysis(data: SaveAnalysisRequest): Promise<SaveAnalysisResponse> {
  const response = await fetch('/api/analysis/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save analysis')
  }

  return response.json()
}

/**
 * Get analysis history for current user
 */
export async function getAnalysisHistory(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: AnalysisHistoryItem[]; pagination: { total: number; limit: number; offset: number } }> {
  const params = new URLSearchParams()
  if (options?.limit) params.set('limit', options.limit.toString())
  if (options?.offset) params.set('offset', options.offset.toString())

  const url = `/api/analysis/history/${userId}?${params.toString()}`
  console.log('[API] Fetching analysis history:', url)

  const response = await fetch(url)

  if (!response.ok) {
    let errorMessage = 'Failed to fetch analysis history'
    try {
      const error = await response.json()
      errorMessage = error.error || error.details || errorMessage
      console.error('[API] Analysis history error:', error)
    } catch (e) {
      console.error('[API] Failed to parse error response:', e)
    }
    throw new Error(errorMessage)
  }

  const result = await response.json()
  console.log('[API] Analysis history result:', result)
  
  // Ensure we return the expected format
  return {
    data: result.data || [],
    pagination: result.pagination || { total: 0, limit: options?.limit || 10, offset: options?.offset || 0 }
  }
}

/**
 * Get specific analysis by ID
 */
export async function getAnalysisById(id: string): Promise<GetAnalysisResponse> {
  const response = await fetch(`/api/analysis/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch analysis')
  }

  const result = await response.json()
  return result.data
}

/**
 * Upload image to temporary storage and return URL
 * (In production, this would upload to S3/CloudFlare R2/etc)
 */
export async function uploadAnalysisImage(file: File): Promise<{ url: string; thumbnailUrl: string }> {
  // For now, convert to base64 data URL
  // In production, replace this with actual file upload to cloud storage
  const reader = new FileReader()
  
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const dataUrl = reader.result as string
      
      // Create thumbnail (resize to 200x200)
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 200
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to create thumbnail'))
          return
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7)
        
        resolve({
          url: dataUrl,
          thumbnailUrl,
        })
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
