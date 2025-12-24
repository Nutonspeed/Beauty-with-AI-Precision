import { createClient } from '@/lib/supabase/server'

export interface FeatureFlagResult {
  isEnabled: boolean
  metadata?: any
}

/**
 * Check if a feature is enabled for a specific clinic
 * @param clinicId The clinic ID to check
 * @param featureKey The feature key to check
 * @returns Promise<FeatureFlagResult>
 */
export async function isFeatureEnabled(
  clinicId: string,
  featureKey: string
): Promise<FeatureFlagResult> {
  try {
    const supabase = await createClient()
    
    // Call the database function
    const { data, error } = await supabase
      .rpc('is_feature_enabled', {
        p_clinic_id: clinicId,
        p_feature_key: featureKey
      })

    if (error) throw error

    // Get detailed feature info if enabled
    if (data) {
      const { data: featureData } = await supabase
        .from('feature_flags')
        .select('metadata')
        .eq('clinic_id', clinicId)
        .eq('feature_key', featureKey)
        .single()

      return {
        isEnabled: data,
        metadata: featureData?.metadata
      }
    }

    return { isEnabled: false }
  } catch (error) {
    console.error(`Error checking feature flag ${featureKey} for clinic ${clinicId}:`, error)
    return { isEnabled: false }
  }
}

/**
 * Get all enabled features for a clinic
 * @param clinicId The clinic ID
 * @returns Promise<Array<{ featureKey: string; metadata: any }>>
 */
export async function getClinicFeatures(clinicId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .rpc('get_clinic_features', {
        p_clinic_id: clinicId
      })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error(`Error getting features for clinic ${clinicId}:`, error)
    return []
  }
}

/**
 * Server-side feature flag checker for middleware
 * Uses cached results when possible
 */
const featureCache = new Map<string, { value: boolean; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function checkFeatureFlagCached(
  clinicId: string,
  featureKey: string
): Promise<boolean> {
  const cacheKey = `${clinicId}:${featureKey}`
  const cached = featureCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  const result = await isFeatureEnabled(clinicId, featureKey)
  featureCache.set(cacheKey, {
    value: result.isEnabled,
    timestamp: Date.now()
  })

  return result.isEnabled
}

/**
 * Feature flag definitions with default values
 */
export const FEATURE_DEFINITIONS = {
  AI_SKIN_ANALYSIS: {
    key: 'ai_skin_analysis',
    defaultValue: false,
    description: 'AI-powered skin analysis feature'
  },
  AR_VISUALIZATION: {
    key: 'ar_visualization',
    defaultValue: false,
    description: 'AR visualization for treatments'
  },
  ONLINE_BOOKING: {
    key: 'online_booking',
    defaultValue: true,
    description: 'Online appointment booking'
  },
  PAYMENT_GATEWAY: {
    key: 'payment_gateway',
    defaultValue: true,
    description: 'Payment processing'
  },
  LOYALTY_PROGRAM: {
    key: 'loyalty_program',
    defaultValue: false,
    description: 'Customer loyalty points system'
  },
  EMAIL_NOTIFICATIONS: {
    key: 'email_notifications',
    defaultValue: true,
    description: 'Email notifications'
  },
  SMS_NOTIFICATIONS: {
    key: 'sms_notifications',
    defaultValue: false,
    description: 'SMS notifications'
  },
  ADVANCED_ANALYTICS: {
    key: 'advanced_analytics',
    defaultValue: false,
    description: 'Advanced analytics dashboard'
  },
  API_ACCESS: {
    key: 'api_access',
    defaultValue: false,
    description: 'API access for integrations'
  },
  MULTI_LANGUAGE: {
    key: 'multi_language',
    defaultValue: true,
    description: 'Multi-language support'
  },
  CUSTOM_BRANDING: {
    key: 'custom_branding',
    defaultValue: false,
    description: 'Custom branding options'
  },
  EXPORT_REPORTS: {
    key: 'export_reports',
    defaultValue: true,
    description: 'Export reports functionality'
  }
} as const

export type FeatureKey = keyof typeof FEATURE_DEFINITIONS
