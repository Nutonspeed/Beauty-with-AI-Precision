// Progress Photo Types
export interface ProgressPhoto {
  id: string;
  user_id: string;
  treatment_id?: string;
  
  // Photo details
  image_url: string;
  thumbnail_url?: string;
  
  // Timeline
  photo_type: 'baseline' | 'progress' | 'final';
  session_number?: number;
  days_since_treatment?: number;
  taken_at: string;
  
  // Analysis results (snapshot at time of photo)
  analysis_results?: {
    spots?: number;
    pores?: number;
    wrinkles?: number;
    texture_score?: number;
    redness?: number;
    overall_score?: number;
  };
  
  quality_metrics?: {
    lighting: number;
    blur: number;
    face_size: number;
    overall: number;
  };
  
  // Face alignment data
  face_landmarks?: number[][]; // 478 MediaPipe landmarks [x, y, z]
  alignment_matrix?: number[][]; // 4x4 transformation matrix
  
  // Metadata
  notes?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  
  created_at: string;
  updated_at: string;
}

// Progress Comparison
export interface ProgressComparison {
  id: string;
  user_id: string;
  
  // Photos being compared
  before_photo_id: string;
  after_photo_id: string;
  before_photo?: ProgressPhoto;
  after_photo?: ProgressPhoto;
  
  // Calculated improvements (%)
  improvement_spots?: number;
  improvement_pores?: number;
  improvement_wrinkles?: number;
  improvement_texture?: number;
  improvement_redness?: number;
  improvement_overall?: number;
  
  // Delta metrics (absolute change)
  spots_delta?: number;
  pores_delta?: number;
  wrinkles_delta?: number;
  
  // Comparison metadata
  comparison_type: 'manual' | 'auto_weekly' | 'auto_monthly';
  alignment_score?: number; // 0-1
  
  // Report generation
  report_generated: boolean;
  report_url?: string;
  report_generated_at?: string;
  
  created_at: string;
}

// Treatment Session
export interface TreatmentSession {
  id: string;
  user_id: string;
  treatment_id: string;
  clinic_id?: string;
  
  // Session details
  session_number: number;
  session_date: string;
  
  // Treatment specifics
  areas_treated?: string[];
  units_used?: number; // For Botox
  syringes_used?: number; // For fillers
  
  // Cost
  actual_cost?: number;
  
  // Provider
  provider_name?: string;
  provider_notes?: string;
  
  // Next appointment
  next_session_date?: string;
  
  // Photos
  before_photo_id?: string;
  after_photo_id?: string;
  before_photo?: ProgressPhoto;
  after_photo?: ProgressPhoto;
  
  // Status
  status: 'scheduled' | 'completed' | 'cancelled';
  
  created_at: string;
  updated_at: string;
}

// Progress Milestone
export interface ProgressMilestone {
  id: string;
  user_id: string;
  
  // Milestone details
  milestone_type: 'first_session' | 'halfway' | 'completed' | 'custom';
  title: string;
  description?: string;
  
  // Achievement
  achieved_at?: string;
  photo_id?: string;
  photo?: ProgressPhoto;
  
  // Metrics at milestone
  metrics_snapshot?: {
    spots?: number;
    pores?: number;
    wrinkles?: number;
    texture_score?: number;
    redness?: number;
    overall_score?: number;
  };
  
  created_at: string;
}

// Photo Upload Request
export interface PhotoUploadRequest {
  photo_type: 'baseline' | 'progress' | 'final';
  treatment_id?: string;
  session_number?: number;
  days_since_treatment?: number;
  notes?: string;
}

// Comparison Request
export interface ComparisonRequest {
  before_photo_id: string;
  after_photo_id: string;
  comparison_type?: 'manual' | 'auto_weekly' | 'auto_monthly';
}

// Comparison Result
export interface ComparisonResult extends ProgressComparison {
  time_elapsed_days: number;
  improvement_summary: string; // Human-readable summary
  recommendations?: string[];
}

// Timeline Entry
export interface TimelineEntry {
  date: string;
  type: 'photo' | 'session' | 'milestone';
  photo?: ProgressPhoto;
  session?: TreatmentSession;
  milestone?: ProgressMilestone;
}

// Progress Report
export interface ProgressReport {
  user_id: string;
  generated_at: string;
  
  // Summary
  total_sessions: number;
  treatment_duration_days: number;
  overall_improvement: number; // %
  
  // Photos
  baseline_photo?: ProgressPhoto;
  latest_photo?: ProgressPhoto;
  all_photos: ProgressPhoto[];
  
  // Comparisons
  comparisons: ProgressComparison[];
  
  // Timeline
  timeline: TimelineEntry[];
  
  // Milestones
  milestones: ProgressMilestone[];
  
  // Metrics trend
  metrics_history: {
    date: string;
    spots: number;
    pores: number;
    wrinkles: number;
    texture_score: number;
    redness: number;
    overall_score: number;
  }[];
}
