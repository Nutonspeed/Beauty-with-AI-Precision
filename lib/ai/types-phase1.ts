// Shared AI types for skin analysis and API routes

export type SkinConcernType =
  | 'wrinkle'
  | 'pigmentation'
  | 'pore'
  | 'redness'
  | 'acne'
  | 'dark_circle'
  | 'texture'
  | 'wrinkles'
  | 'dark_spots'

export interface SkinConcern {
  type: SkinConcernType
  severity: number // 0-100
  confidence: number // 0-1
  locations?: Array<{ x: number; y: number; radius: number }>
}

export interface SkinAnalysisResult {
  overallScore: number // 0-100
  concerns: SkinConcern[]
  visiaMetrics: Record<string, number>
  recommendations: string[]
  processingTime: number // ms
}
