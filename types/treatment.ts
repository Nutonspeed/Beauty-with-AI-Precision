/**
 * Treatment Recommendation Types
 * Phase 3: Treatment database and recommendation engine
 */

export interface Treatment {
  id: string
  name: string
  name_th: string
  category: 'injectable' | 'laser' | 'skincare' | 'surgery' | 'device'
  subcategory?: string

  // Pricing
  price_min: number
  price_max: number
  price_unit: 'THB' | 'unit' | 'area' | 'session'
  price_per?: 'unit' | 'area' | 'session' | 'syringe'

  // Treatment details
  duration_minutes?: number
  sessions_min: number
  sessions_max: number
  interval_days?: number

  // Recovery
  downtime_days: number
  pain_level?: number // 0-10

  // Effectiveness (0-100%)
  effectiveness_spots?: number
  effectiveness_pores?: number
  effectiveness_wrinkles?: number
  effectiveness_texture?: number
  effectiveness_redness?: number
  effectiveness_overall: number

  // Eligibility
  min_age: number
  max_age?: number
  contraindications?: string[]
  suitable_skin_types?: string[]

  // Results
  results_visible_days?: number
  results_duration_months?: number
  improvement_percentage_min?: number
  improvement_percentage_max?: number

  // Media
  before_after_images?: string[]
  video_url?: string

  // Content
  description?: string
  description_th?: string
  benefits?: string[]
  risks?: string[]
  aftercare?: string[]

  // Metadata
  popularity_score: number
  is_active: boolean
  requires_doctor: boolean
  requires_consultation: boolean

  created_at: string
  updated_at: string
}

export interface TreatmentRecommendation {
  id: string
  analysis_id: string
  treatment_id: string
  treatment?: Treatment // Joined data

  // Recommendation details
  priority: number // 1 = highest
  confidence_score: number // 0-1

  // Personalized pricing
  estimated_cost_min: number
  estimated_cost_max: number
  estimated_sessions: number

  // Predicted results
  predicted_improvement: number // 0-100%
  timeline_weeks: number

  // Reasoning
  recommendation_reason?: string
  target_concerns: string[]

  // Status
  status: 'suggested' | 'viewed' | 'interested' | 'booked' | 'completed'
  viewed_at?: string

  created_at: string
  updated_at: string
}

export interface TreatmentPackage {
  id: string
  name: string
  name_th: string
  description?: string

  // Package details
  treatment_ids: string[]
  treatments?: Treatment[] // Joined data
  package_price: number
  discount_percentage?: number

  // Timeline
  total_duration_weeks?: number
  total_sessions?: number

  // Effectiveness
  effectiveness_overall: number

  is_active: boolean
  created_at: string
}

export interface RecommendationCriteria {
  // Analysis results
  spots_severity?: number
  pores_severity?: number
  wrinkles_severity?: number
  texture_score?: number
  redness_level?: number

  // User profile
  age: number
  budget_min?: number
  budget_max?: number
  medical_history?: string[]
  skin_type?: string

  // Preferences
  max_downtime_days?: number
  max_pain_level?: number
  preferred_categories?: string[]
}

export interface RecommendationResult {
  recommended_treatments: TreatmentRecommendation[]
  recommended_packages: TreatmentPackage[]
  total_estimated_cost_min: number
  total_estimated_cost_max: number
  total_timeline_weeks: number
  overall_predicted_improvement: number
}
