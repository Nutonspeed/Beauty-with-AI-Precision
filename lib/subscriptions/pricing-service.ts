import { createServiceClient } from '@/lib/supabase/server'

export interface PricingPlan {
  id: string
  name: string
  slug: string
  plan_type: 'b2c' | 'b2b'
  price_amount: number
  currency: string
  max_users: number
  max_storage_gb: number
  features: string[]
  metadata: {
    max_customers_per_month: number
    max_analyses_per_month: number
    trial_days: number
    name_th: string
    features_th: string[]
  }
}

export interface PricingPlanView extends PricingPlan {
  max_customers_per_month: number
  max_analyses_per_month: number
  trial_days: number
  name_th: string
  features_th: string[]
}

/**
 * Get all pricing plans by type (B2C or B2B)
 */
export async function getPricingPlansByType(planType: 'b2c' | 'b2b'): Promise<PricingPlanView[]> {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .rpc('get_plans_by_type', { plan_type_param: planType })
  
  if (error) {
    console.error('Error fetching pricing plans:', error)
    throw new Error(`Failed to fetch ${planType.toUpperCase()} pricing plans`)
  }
  
  return data || []
}

/**
 * Get single pricing plan by slug
 */
export async function getPricingPlan(slug: string): Promise<PricingPlanView | null> {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('subscription_plans_view')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching pricing plan:', error)
    throw new Error(`Failed to fetch pricing plan: ${slug}`)
  }
  
  return data
}

/**
 * Check if a plan includes a specific feature
 */
export async function canPlanAccessFeature(slug: string, feature: string): Promise<boolean> {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .rpc('can_access_plan_feature', { 
      plan_slug_param: slug, 
      feature_param: feature 
    })
  
  if (error) {
    console.error('Error checking feature access:', error)
    return false
  }
  
  return data || false
}

/**
 * Get all B2C plans (for individual customers)
 */
export async function getB2CPlans(): Promise<PricingPlanView[]> {
  return getPricingPlansByType('b2c')
}

/**
 * Get all B2B plans (for clinics)
 */
export async function getB2BPlans(): Promise<PricingPlanView[]> {
  return getPricingPlansByType('b2b')
}

/**
 * Check if usage is within plan limits
 */
export function isWithinPlanLimits(
  plan: PricingPlanView,
  usage: { 
    users?: number
    customers?: number
    storage?: number
    analyses?: number 
  }
): boolean {
  if (usage.users && plan.max_users !== -1 && usage.users > plan.max_users) return false
  if (usage.customers && plan.max_customers_per_month !== -1 && usage.customers > plan.max_customers_per_month) return false
  if (usage.storage && plan.max_storage_gb !== -1 && usage.storage > plan.max_storage_gb) return false
  if (usage.analyses && plan.max_analyses_per_month !== -1 && usage.analyses > plan.max_analyses_per_month) return false
  
  return true
}

/**
 * Format price for display
 */
export function formatPrice(
  plan: PricingPlanView,
  locale: 'th' | 'en' = 'th'
): string {
  if (plan.price_amount === 0) return locale === 'th' ? 'ฟรี' : 'Free'
  if (plan.price_amount === -1) return locale === 'th' ? 'ติดต่อเรา' : 'Contact Us'
  
  const currency = locale === 'th' ? '฿' : plan.currency
  return `${currency}${plan.price_amount.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}`
}

/**
 * Get plan features in the specified locale
 */
export function getPlanFeatures(
  plan: PricingPlanView,
  locale: 'th' | 'en' = 'en'
): string[] {
  return locale === 'th' ? plan.features_th : plan.features
}

/**
 * Get plan display name in the specified locale
 */
export function getPlanName(
  plan: PricingPlanView,
  locale: 'th' | 'en' = 'en'
): string {
  return locale === 'th' ? plan.name_th : plan.name
}

/**
 * Create or update a pricing plan (admin only)
 */
export async function upsertPricingPlan(
  plan: Partial<PricingPlan> & { slug: string }
): Promise<PricingPlanView> {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .upsert({
      name: plan.name,
      slug: plan.slug,
      plan_type: plan.plan_type,
      price_amount: plan.price_amount,
      currency: plan.currency || 'THB',
      max_users: plan.max_users,
      max_storage_gb: plan.max_storage_gb,
      features: plan.features,
      metadata: plan.metadata,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error upserting pricing plan:', error)
    throw new Error(`Failed to save pricing plan: ${error.message}`)
  }
  
  return data
}

/**
 * Delete/deactivate a pricing plan (admin only)
 */
export async function deactivatePricingPlan(slug: string): Promise<void> {
  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('subscription_plans')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('slug', slug)
  
  if (error) {
    console.error('Error deactivating pricing plan:', error)
    throw new Error(`Failed to deactivate pricing plan: ${error.message}`)
  }
}
