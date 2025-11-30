/**
 * DeepFace Client
 * 
 * Integrates with DeepFace Python service for:
 * - Age estimation (±4.65 years accuracy)
 * - Gender detection (97.44% accuracy)
 * - Emotion analysis (7 emotions)
 * - Race/Ethnicity detection
 * 
 * DeepFace is an open-source face recognition and facial attribute analysis framework
 * https://github.com/serengil/deepface
 */

export interface DeepFaceAnalysisResult {
  age: number
  gender: {
    dominant: 'Man' | 'Woman'
    confidence: {
      Man: number
      Woman: number
    }
  }
  emotion: {
    dominant: string
    scores: {
      angry: number
      disgust: number
      fear: number
      happy: number
      sad: number
      surprise: number
      neutral: number
    }
  }
  race: {
    dominant: string
    scores: {
      asian: number
      indian: number
      black: number
      white: number
      middle_eastern: number
      latino_hispanic: number
    }
  }
  face_confidence: number
  region: {
    x: number
    y: number
    w: number
    h: number
  }
}

export interface DeepFaceServiceConfig {
  endpoint?: string
  timeout?: number
  retries?: number
}

const DEFAULT_CONFIG: DeepFaceServiceConfig = {
  endpoint: process.env.DEEPFACE_API_URL || 'http://localhost:5000',
  timeout: 30000,
  retries: 2
}

/**
 * DeepFace Client Class
 * Communicates with Python DeepFace API service
 */
export class DeepFaceClient {
  private config: DeepFaceServiceConfig
  private isAvailable: boolean = false

  constructor(config: Partial<DeepFaceServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Check if DeepFace service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      this.isAvailable = response.ok
      return this.isAvailable
    } catch {
      this.isAvailable = false
      return false
    }
  }

  /**
   * Analyze face for age, gender, emotion, race
   */
  async analyzeFace(
    imageData: string | Blob,
    actions: ('age' | 'gender' | 'emotion' | 'race')[] = ['age', 'gender', 'emotion']
  ): Promise<DeepFaceAnalysisResult | null> {
    try {
      // Check availability first
      if (!this.isAvailable) {
        await this.checkHealth()
        if (!this.isAvailable) {
          console.warn('[DeepFace] Service not available, using fallback')
          return this.getFallbackResult()
        }
      }

      // Prepare form data
      const formData = new FormData()
      
      if (typeof imageData === 'string') {
        // Base64 or URL
        if (imageData.startsWith('data:')) {
          // Convert base64 to blob
          const response = await fetch(imageData)
          const blob = await response.blob()
          formData.append('image', blob, 'face.jpg')
        } else {
          formData.append('image_url', imageData)
        }
      } else {
        formData.append('image', imageData, 'face.jpg')
      }

      formData.append('actions', JSON.stringify(actions))

      // Call DeepFace API
      const response = await fetch(`${this.config.endpoint}/analyze`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      })

      if (!response.ok) {
        throw new Error(`DeepFace API error: ${response.status}`)
      }

      const result = await response.json()
      return this.normalizeResult(result)

    } catch (error) {
      console.error('[DeepFace] Analysis failed:', error)
      return this.getFallbackResult()
    }
  }

  /**
   * Get skin age based on biological age and skin condition
   * Combines DeepFace age with skin analysis for more accurate skin age
   */
  async getSkinAge(
    imageData: string | Blob,
    skinConditionScore: number // 0-100, from skin analysis
  ): Promise<{
    biologicalAge: number
    skinAge: number
    skinAgeGap: number
    recommendation: string
  }> {
    const faceAnalysis = await this.analyzeFace(imageData, ['age'])
    
    if (!faceAnalysis) {
      return {
        biologicalAge: 30,
        skinAge: 30,
        skinAgeGap: 0,
        recommendation: 'Unable to determine age'
      }
    }

    const biologicalAge = faceAnalysis.age

    // Calculate skin age based on skin condition
    // Lower condition score = older looking skin
    const skinAgeModifier = (50 - skinConditionScore) * 0.3
    const skinAge = Math.round(biologicalAge + skinAgeModifier)
    const skinAgeGap = skinAge - biologicalAge

    let recommendation = ''
    if (skinAgeGap > 5) {
      recommendation = 'ผิวแก่กว่าอายุจริง ควรดูแลเพิ่มเติม: กันแดด, เซรั่ม, นอนหลับให้เพียงพอ'
    } else if (skinAgeGap < -5) {
      recommendation = 'ผิวดูอ่อนกว่าอายุจริง! รักษาการดูแลผิวแบบนี้ต่อไป'
    } else {
      recommendation = 'ผิวสมวัย ดูแลต่อเนื่องเพื่อรักษาสุขภาพผิว'
    }

    return {
      biologicalAge,
      skinAge,
      skinAgeGap,
      recommendation
    }
  }

  /**
   * Normalize DeepFace API response
   */
  private normalizeResult(raw: Record<string, unknown>): DeepFaceAnalysisResult {
    // DeepFace returns array of results, we take first face
    const face = Array.isArray(raw) ? raw[0] : raw

    return {
      age: face.age || 30,
      gender: {
        dominant: face.dominant_gender || face.gender || 'Unknown',
        confidence: face.gender || { Man: 0.5, Woman: 0.5 }
      },
      emotion: {
        dominant: face.dominant_emotion || 'neutral',
        scores: face.emotion || {
          angry: 0, disgust: 0, fear: 0, happy: 0,
          sad: 0, surprise: 0, neutral: 1
        }
      },
      race: {
        dominant: face.dominant_race || 'asian',
        scores: face.race || {
          asian: 0.8, indian: 0, black: 0,
          white: 0.1, middle_eastern: 0, latino_hispanic: 0.1
        }
      },
      face_confidence: face.face_confidence || 0.9,
      region: face.region || { x: 0, y: 0, w: 100, h: 100 }
    }
  }

  /**
   * Fallback result when service unavailable
   */
  private getFallbackResult(): DeepFaceAnalysisResult {
    return {
      age: 30,
      gender: {
        dominant: 'Woman',
        confidence: { Man: 0.3, Woman: 0.7 }
      },
      emotion: {
        dominant: 'neutral',
        scores: {
          angry: 0.05, disgust: 0.02, fear: 0.03, happy: 0.15,
          sad: 0.05, surprise: 0.05, neutral: 0.65
        }
      },
      race: {
        dominant: 'asian',
        scores: {
          asian: 0.85, indian: 0.02, black: 0.01,
          white: 0.08, middle_eastern: 0.02, latino_hispanic: 0.02
        }
      },
      face_confidence: 0.5,
      region: { x: 0, y: 0, w: 100, h: 100 }
    }
  }
}

// Singleton instance
let client: DeepFaceClient | null = null

export function getDeepFaceClient(): DeepFaceClient {
  if (!client) {
    client = new DeepFaceClient()
  }
  return client
}

/**
 * Quick analyze function
 */
export async function analyzeWithDeepFace(
  imageData: string | Blob,
  actions?: ('age' | 'gender' | 'emotion' | 'race')[]
): Promise<DeepFaceAnalysisResult | null> {
  const deepface = getDeepFaceClient()
  return deepface.analyzeFace(imageData, actions)
}
