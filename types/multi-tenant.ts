/**
 * Multi-Tenant Types for Multi-Clinic System
 * Supports: 4 clinics × 30 sales = 120+ concurrent users
 */

// ============================================================================
// Clinic Types
// ============================================================================

export type SubscriptionTier = 'free' | 'standard' | 'premium' | 'enterprise';

export interface Clinic {
  id: string;
  clinic_code: string;
  clinic_name: string;
  clinic_name_en?: string;
  
  // Branding
  logo_url?: string;
  brand_color?: string;
  
  // Contact
  phone?: string;
  email?: string;
  line_official?: string;
  website?: string;
  
  // Address
  address?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  
  // Business Settings
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  max_sales_staff: number;
  max_analyses_per_month: number;
  
  // Features
  features_enabled: {
    offline_mode: boolean;
    crm_integration: boolean;
    analytics: boolean;
    [key: string]: boolean;
  };
  
  // Status
  is_active: boolean;
  trial_ends_at?: string;
  owner_user_id?: string;
  
  // Metadata
  settings?: Record<string, any>;
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Enhanced User Types (with Clinic)
// ============================================================================

export type UserRole = 
  | 'public'
  | 'free_user'
  | 'premium_customer'
  | 'clinic_staff'
  | 'clinic_admin'
  | 'sales_staff'
  | 'clinic_owner'
  | 'super_admin';

export interface MultiTenantUser {
  id: string;
  email: string;
  role: UserRole;
  tier: string;
  metadata?: Record<string, unknown>;
  
  // Multi-Clinic fields
  clinic_id?: string;
  branch_id?: string;
  clinic?: Clinic; // Populated via join
  
  // Profile
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  
  // Status
  email_verified: boolean;
  last_login_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Lead Management Types
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'hot' | 'warm' | 'cold' | 'converted' | 'lost';
export type LeadSource = 'walk_in' | 'online' | 'referral' | 'event' | 'social_media' | 'other';

export interface Lead {
  id: string;
  
  // Clinic & Branch
  clinic_id: string;
  branch_id?: string;
  sales_staff_id: string;
  
  // Lead Information
  full_name: string;
  phone?: string;
  email?: string;
  line_id?: string;
  
  // Status
  status: LeadStatus;
  source?: LeadSource;
  
  // Analysis Reference
  analysis_id?: string;
  
  // Follow-up
  follow_up_date?: string;
  last_contact_date?: string;
  next_action?: string;
  
  // Interests
  interested_treatments?: string[];
  budget_range?: string;
  
  // Conversion
  converted_to_customer: boolean;
  converted_user_id?: string;
  converted_at?: string;
  
  // Notes & History
  notes?: string;
  interaction_history: LeadInteraction[];

  // Relations (loaded on demand)
  clinic?: {
    id: string;
    name: string;
    logo_url?: string;
    contact_phone?: string;
    contact_email?: string;
  };
  branch?: {
    id: string;
    name: string;
    address?: string;
  };
  sales_staff?: {
    id: string;
    full_name?: string;
    email?: string;
  };
  analysis?: {
    id: string;
    overall_score?: number;
    image_url?: string;
    ai_skin_type?: string;
    ai_concerns?: string[];
    created_at?: string;
  };
  
  // Score
  lead_score: number;

  // Offline Sync Fields
  offline_created?: boolean;
  offline_timestamp?: number;
  synced?: boolean;
  sync_attempts?: number;
  last_sync_error?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface LeadInteraction {
  date: string;
  type: 'call' | 'email' | 'message' | 'meeting' | 'demo' | 'follow_up' | 'other';
  notes: string;
  sales_staff_id?: string;
}

export interface LeadCreateInput {
  full_name: string;
  phone?: string;
  email?: string;
  line_id?: string;
  status?: LeadStatus;
  source?: LeadSource;
  analysis_id?: string;
  interested_treatments?: string[];
  budget_range?: string;
  notes?: string;
}

export interface LeadUpdateInput {
  full_name?: string;
  phone?: string;
  email?: string;
  line_id?: string;
  status?: LeadStatus;
  follow_up_date?: string;
  next_action?: string;
  interested_treatments?: string[];
  budget_range?: string;
  notes?: string;
  lead_score?: number;
}

// ============================================================================
// Enhanced Analysis Types (with Clinic)
// ============================================================================

export interface MultiTenantSkinAnalysis {
  id: string;
  user_id: string;
  
  // Multi-Clinic fields
  clinic_id?: string;
  branch_id?: string;
  sales_staff_id?: string;
  
  // Image
  image_url: string;
  
  // Scores
  overall_score: number;
  confidence: number;
  
  // CV Analysis
  spots_severity: number;
  spots_count: number;
  pores_severity: number;
  pores_count: number;
  wrinkles_severity: number;
  wrinkles_count: number;
  texture_severity: number;
  redness_severity: number;
  redness_count: number;
  
  // AI Analysis
  ai_skin_type?: string;
  ai_concerns?: string[];
  ai_severity?: Record<string, number>;
  ai_treatment_plan?: string;
  
  // Recommendations
  recommendations?: string[];
  
  // Patient Info
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_skin_type?: string;
  
  // Notes
  notes?: string;
  
  // Performance
  analysis_time_ms?: number;
  
  // Share & Export (Task 5: Save & Share Multi-Clinic)
  is_shared?: boolean;
  share_token?: string;
  share_expires_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Permission & Access Control Types
// ============================================================================

export interface PermissionContext {
  userId: string;
  role: UserRole;
  clinicId?: string;
  branchId?: string;
}

export type Permission = 
  | 'view_analyses'
  | 'create_analyses'
  | 'edit_analyses'
  | 'delete_analyses'
  | 'view_leads'
  | 'create_leads'
  | 'edit_leads'
  | 'delete_leads'
  | 'view_analytics'
  | 'manage_staff'
  | 'manage_clinic_settings'
  | 'view_all_clinics';

export interface RolePermissions {
  [role: string]: Permission[];
}

// ============================================================================
// Statistics & Analytics Types
// ============================================================================

export interface ClinicStatistics {
  clinic_id: string;
  total_analyses: number;
  total_leads: number;
  total_conversions: number;
  conversion_rate: number;
  total_sales_staff: number;
  active_sales_staff: number;
  analyses_this_month: number;
  analyses_last_month: number;
  growth_percentage: number;
}

export interface SalesStaffPerformance {
  sales_staff_id: string;
  full_name: string;
  total_analyses: number;
  total_leads: number;
  hot_leads: number;
  conversions: number;
  conversion_rate: number;
  avg_lead_score: number;
  last_activity: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface LeadFilterParams extends PaginationParams {
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource;
  sales_staff_id?: string;
  min_lead_score?: number;
  has_follow_up?: boolean;
}

export interface AnalysisFilterParams extends PaginationParams {
  clinic_id?: string;
  branch_id?: string;
  sales_staff_id?: string;
  date_from?: string;
  date_to?: string;
  min_score?: number;
  max_score?: number;
}
