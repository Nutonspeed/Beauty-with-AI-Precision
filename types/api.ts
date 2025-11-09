/**
 * API Types for Phase 13 - Database Integration
 */

import type { SkinConcern } from '@/lib/ai/tensorflow-analyzer'

// ============================================================================
// Common Types
// ============================================================================

export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'
export type Gender = 'male' | 'female' | 'other'

// ============================================================================
// Analysis API Types
// ============================================================================

export interface SaveAnalysisRequest {
  imageUrl: string
  thumbnailUrl?: string
  concerns: SkinConcern[]
  heatmapData?: Record<string, unknown>
  metrics: {
    totalTime: number
    inferenceTime: number
    detectionCount: number
  }
  aiVersion: string
  patientInfo?: {
    name: string
    age?: number
    gender?: Gender
    skinType?: SkinType
    medicalHistory?: string[]
    allergies?: string[]
    currentMedications?: string[]
    notes?: string
  }
  appointmentId?: string
  treatmentPlanId?: string
}

export interface SaveAnalysisResponse {
  success: boolean
  analysisId: string
  message?: string
}

export interface AnalysisHistoryItem {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  concerns: SkinConcern[]
  createdAt: string
  concernCount: {
    wrinkle: number
    pigmentation: number
    pore: number
    redness: number
    acne: number
    dark_circle: number
  }
}

export interface GetAnalysisResponse {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  concerns: SkinConcern[]
  heatmapData?: Record<string, unknown>
  metrics: {
    totalTime: number
    inferenceTime: number
    detectionCount: number
  }
  aiVersion: string
  createdAt: string
}

// ============================================================================
// User Profile API Types
// ============================================================================

export interface UserProfileData {
  id: string
  skinType?: SkinType
  primaryConcerns: string[]
  allergies?: string
  preferences: {
    language?: string
    notifications?: boolean
    theme?: 'light' | 'dark' | 'system'
  }
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  skinType?: SkinType
  primaryConcerns?: string[]
  allergies?: string
  preferences?: {
    language?: string
    notifications?: boolean
    theme?: 'light' | 'dark' | 'system'
  }
}

export interface GetProfileResponse {
  success: boolean
  profile: UserProfileData
  analysisCount?: number
  lastAnalysis?: string
}

// ============================================================================
// Treatment Plan API Types
// ============================================================================

export interface TreatmentRecommendation {
  name: string
  description: string
  benefits: string[]
  suitableFor: string[]
  duration?: string
  frequency?: string
  estimatedCost?: number
}

export interface CreateTreatmentPlanRequest {
  analysisId?: string
  concernType: string
  treatments: TreatmentRecommendation[]
  schedule?: {
    startDate?: string
    frequency?: string
    duration?: string
  }
  notes?: string
}

export interface TreatmentPlanResponse {
  id: string
  concernType: string
  treatments: TreatmentRecommendation[]
  schedule: {
    startDate?: string
    frequency?: string
    duration?: string
  }
  estimatedCost?: number
  estimatedDuration?: string
  notes?: string
  isActive: boolean
  createdAt: string
}

// ============================================================================
// Booking API Types
// ============================================================================

export interface CreateBookingRequest {
  tenantId: string
  treatmentType: string
  appointmentDate: string
  duration?: number
  notes?: string
}

export interface BookingResponse {
  id: string
  tenantId: string
  treatmentType: string
  appointmentDate: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export interface UpdateBookingRequest {
  appointmentDate?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

// ============================================================================
// Common API Types
// ============================================================================

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: unknown
}

export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message?: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError
