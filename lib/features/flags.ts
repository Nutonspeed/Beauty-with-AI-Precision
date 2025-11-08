/**
 * Feature Flags System
 * Controls which features are available to which tiers/roles
 */

import { AnalysisTier, UserRole } from "../auth/roles"

export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabledForTiers: AnalysisTier[]
  enabledForRoles?: UserRole[]
  requiresPremium?: boolean
}

// All feature flags
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Analysis Features
  BROWSER_AI: {
    id: "browser_ai",
    name: "Browser AI Analysis",
    description: "AI analysis running in browser (TensorFlow.js)",
    enabledForTiers: [AnalysisTier.FREE, AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
  },

  CLOUD_AI: {
    id: "cloud_ai",
    name: "Cloud AI Analysis",
    description: "Advanced AI analysis in cloud with GPUs",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  BASIC_8_POINT: {
    id: "basic_8_point",
    name: "8-Point Skin Metrics",
    description: "Basic 8-point skin analysis",
    enabledForTiers: [AnalysisTier.FREE, AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
  },

  TOP_3_CONCERNS: {
    id: "top_3_concerns",
    name: "Top 3 Concerns Only",
    description: "Show only top 3 skin concerns",
    enabledForTiers: [AnalysisTier.FREE],
  },

  ALL_CONCERNS: {
    id: "all_concerns",
    name: "All Skin Concerns",
    description: "Show all detected skin concerns",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  // Visualization Features
  BASIC_HEATMAP: {
    id: "basic_heatmap",
    name: "Basic Heatmap",
    description: "Simple heatmap visualization",
    enabledForTiers: [AnalysisTier.FREE, AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
  },

  ADVANCED_HEATMAP: {
    id: "advanced_heatmap",
    name: "Advanced Heatmap",
    description: "Multi-layer interactive heatmap with confidence scores",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  AR_SIMULATOR: {
    id: "ar_simulator",
    name: "AR Treatment Simulator",
    description: "Before/After AR simulation of treatments",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.PREMIUM_CUSTOMER, UserRole.CLINIC_STAFF, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
    requiresPremium: true,
  },

  UV_IMAGING: {
    id: "uv_imaging",
    name: "UV Imaging Simulation",
    description: "Simulated UV light analysis",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_STAFF, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  POLARIZED_LIGHT: {
    id: "polarized_light",
    name: "Polarized Light Analysis",
    description: "Depth analysis with polarized light simulation",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_STAFF, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  DEPTH_3D: {
    id: "3d_estimation",
    name: "3D Depth Estimation",
    description: "3D depth mapping for wrinkles and texture",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_STAFF, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  // Recommendations
  BASIC_RECOMMENDATIONS: {
    id: "basic_recommendations",
    name: "Basic Recommendations",
    description: "Generic skincare recommendations",
    enabledForTiers: [AnalysisTier.FREE, AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
  },

  PERSONALIZED_RECOMMENDATIONS: {
    id: "personalized_recommendations",
    name: "Personalized Recommendations",
    description: "AI-generated personalized treatment plans",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  EXPERT_VALIDATION: {
    id: "expert_validation",
    name: "Expert Validation",
    description: "Dermatologist review and validation",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  // History & Tracking
  HISTORY_7_DAYS: {
    id: "history_7_days",
    name: "7-Day History",
    description: "Analysis history for last 7 days",
    enabledForTiers: [AnalysisTier.FREE],
  },

  UNLIMITED_HISTORY: {
    id: "unlimited_history",
    name: "Unlimited History",
    description: "Full analysis history with no time limit",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  PROGRESS_TRACKING: {
    id: "progress_tracking",
    name: "Progress Tracking",
    description: "Timeline view with before/after comparisons",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  // Export & Sharing
  EXPORT_PDF: {
    id: "export_pdf",
    name: "Export to PDF",
    description: "Download professional PDF report",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  EXPORT_DATA: {
    id: "export_data",
    name: "Export Raw Data",
    description: "Export analysis data as JSON/CSV",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  // Communication
  LIVE_CHAT: {
    id: "live_chat",
    name: "Live Chat with Sales",
    description: "Real-time chat with sales team",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },

  BOOKING: {
    id: "booking",
    name: "Appointment Booking",
    description: "Book appointments with clinics",
    enabledForTiers: [AnalysisTier.FREE, AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
  },

  // Clinic Features
  BATCH_ANALYSIS: {
    id: "batch_analysis",
    name: "Batch Analysis",
    description: "Analyze multiple patients at once",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_STAFF, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  CRM_INTEGRATION: {
    id: "crm_integration",
    name: "CRM Integration",
    description: "Auto-save to patient CRM records",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_STAFF, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  API_ACCESS: {
    id: "api_access",
    name: "API Access",
    description: "REST API for integration with clinic systems",
    enabledForTiers: [AnalysisTier.CLINICAL],
    enabledForRoles: [UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN],
  },

  // Processing
  STANDARD_SPEED: {
    id: "standard_speed",
    name: "Standard Processing",
    description: "Normal processing speed",
    enabledForTiers: [AnalysisTier.FREE],
  },

  PRIORITY_PROCESSING: {
    id: "priority_processing",
    name: "Priority Processing",
    description: "Faster analysis with priority queue",
    enabledForTiers: [AnalysisTier.PREMIUM, AnalysisTier.CLINICAL],
    requiresPremium: true,
  },
}

/**
 * Check if a feature is enabled for a specific tier
 */
export function isFeatureEnabledForTier(featureId: string, tier: AnalysisTier): boolean {
  const feature = FEATURE_FLAGS[featureId]
  if (!feature) return false

  return feature.enabledForTiers.includes(tier)
}

/**
 * Check if a feature is enabled for a specific role
 */
export function isFeatureEnabledForRole(featureId: string, role: UserRole): boolean {
  const feature = FEATURE_FLAGS[featureId]
  if (!feature) return false

  // If no role restriction, allow all
  if (!feature.enabledForRoles) return true

  // Super admin has access to everything
  if (role === UserRole.SUPER_ADMIN) return true

  return feature.enabledForRoles.includes(role)
}

/**
 * Check if a feature is enabled for both tier and role
 */
export function isFeatureEnabled(featureId: string, tier: AnalysisTier, role: UserRole): boolean {
  return isFeatureEnabledForTier(featureId, tier) && isFeatureEnabledForRole(featureId, role)
}

/**
 * Get all enabled features for a tier
 */
export function getEnabledFeaturesForTier(tier: AnalysisTier): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter((feature) => feature.enabledForTiers.includes(tier))
}

/**
 * Get all enabled features for a role
 */
export function getEnabledFeaturesForRole(role: UserRole): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter((feature) => {
    if (!feature.enabledForRoles) return true
    if (role === UserRole.SUPER_ADMIN) return true
    return feature.enabledForRoles.includes(role)
  })
}

/**
 * Get features that require premium (for upsell)
 */
export function getPremiumFeatures(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter((feature) => feature.requiresPremium)
}
