/**
 * Subscription Check Utilities
 * 
 * Check subscription status, trial period, and usage limits
 */

import { createClient } from '@/lib/supabase/server'
import { 
  getPricingPlan, 
  isWithinPlanLimits,
  type PricingPlanView 
} from './pricing-service'

export type SubscriptionLifecycleStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled'

export interface SubscriptionStatus {
  isActive: boolean
  isTrial: boolean
  isTrialExpired: boolean
  subscriptionStatus: SubscriptionLifecycleStatus
  plan: string
  planDetails: PricingPlanView
  daysRemaining: number | null
  trialDaysRemaining: number | null
  usage: {
    users: number
    storage: number
    analyses: number
  }
  withinLimits: boolean
  message: string
}

/**
 * Get subscription status for a clinic
 */
export async function getSubscriptionStatus(clinicId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient()

  // Get clinic subscription data
  const { data: clinic, error } = await supabase
    .from('clinics')
    .select(`
      subscription_plan,
      subscription_status,
      is_trial,
      trial_ends_at,
      subscription_started_at,
      subscription_ends_at
    `)
    .eq('id', clinicId)
    .single()

  if (error || !clinic) {
    // Get default plan from database
    const defaultPlan = await getPricingPlan('starter')
    if (!defaultPlan) {
      throw new Error('Default starter plan not found in database')
    }
    return createDefaultStatus(defaultPlan, 'Clinic not found')
  }

  const rawPlan = (clinic.subscription_plan || 'starter') as string
  const planDetails = await getPricingPlan(rawPlan)
  
  if (!planDetails) {
    // Fallback to starter plan if plan not found
    const defaultPlan = await getPricingPlan('starter')
    if (!defaultPlan) {
      throw new Error('Default starter plan not found in database')
    }
    return createDefaultStatus(defaultPlan, `Plan ${rawPlan} not found`)
  }
  
  const now = new Date()

  // Check trial status
  const isTrial = clinic.is_trial || false
  const trialEndsAt = clinic.trial_ends_at ? new Date(clinic.trial_ends_at) : null
  const isTrialExpired = isTrial && trialEndsAt ? now > trialEndsAt : false
  const trialDaysRemaining = trialEndsAt && !isTrialExpired
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const subscriptionStatus = normalizeSubscriptionStatus(clinic.subscription_status)

  // Check subscription end date
  const subscriptionEndsAt = clinic.subscription_ends_at ? new Date(clinic.subscription_ends_at) : null
  const daysRemaining = subscriptionEndsAt
    ? Math.ceil((subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Determine if subscription is active
  const isActive =
    subscriptionStatus === 'active' ||
    (subscriptionStatus === 'trial' && isTrial && !isTrialExpired)

  // Get current usage (simplified - would need actual counting in production)
  const usage = await getClinicUsage(supabase, clinicId)

  // Check if within limits using new service
  const withinLimits = isWithinPlanLimits(planDetails, usage)

  // Generate status message
  let message = ''
  if (!isActive) {
    if (subscriptionStatus === 'past_due') {
      message = 'Payment is past due'
    } else if (subscriptionStatus === 'suspended') {
      message = 'Subscription is suspended'
    } else if (subscriptionStatus === 'cancelled') {
      message = 'Subscription is cancelled'
    } else {
      message = 'Subscription is not active'
    }
  } else if (isTrialExpired) {
    message = 'Trial period has expired'
  } else if (isTrial && trialDaysRemaining !== null) {
    message = `Trial ends in ${trialDaysRemaining} days`
  } else if (!withinLimits) {
    message = 'Usage limit exceeded'
  } else {
    message = 'Subscription is active'
  }

  return {
    isActive,
    isTrial,
    isTrialExpired,
    subscriptionStatus,
    plan: rawPlan,
    planDetails,
    daysRemaining,
    trialDaysRemaining,
    usage,
    withinLimits,
    message
  }
}

function normalizeClinicPlan(plan: string): string {
  const p = String(plan || '').trim().toLowerCase()
  if (p === 'professional') return 'professional'
  if (p === 'enterprise') return 'enterprise'
  if (p === 'premium') return 'professional'
  if (p === 'free') return 'starter'
  return 'starter'
}

function normalizeSubscriptionStatus(status: unknown): SubscriptionLifecycleStatus {
  const s = String(status || '').trim().toLowerCase()
  if (s === 'active') return 'active'
  if (s === 'trial') return 'trial'
  if (s === 'past_due') return 'past_due'
  if (s === 'suspended') return 'suspended'
  if (s === 'cancelled' || s === 'canceled') return 'cancelled'
  return 'trial'
}

/**
 * Check if clinic can access a feature
 */
export async function canAccessFeature(clinicId: string, feature: string): Promise<boolean> {
  const status = await getSubscriptionStatus(clinicId)
  
  if (!status.isActive) return false
  
  // Use pricing service to check feature access
  return status.planDetails.features.includes(feature)
}

/**
 * Check if clinic can perform an action (within limits)
 */
export async function canPerformAction(
  clinicId: string, 
  action: 'analysis' | 'addUser' | 'uploadFile'
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getSubscriptionStatus(clinicId)

  if (!status.isActive) {
    if (status.subscriptionStatus === 'past_due') {
      return { allowed: false, reason: 'Payment is past due' }
    }
    if (status.subscriptionStatus === 'suspended') {
      return { allowed: false, reason: 'Subscription is suspended' }
    }
    if (status.subscriptionStatus === 'cancelled') {
      return { allowed: false, reason: 'Subscription is cancelled' }
    }
    return { allowed: false, reason: 'Subscription is not active' }
  }

  if (status.isTrialExpired) {
    return { allowed: false, reason: 'Trial period has expired' }
  }

  const plan = status.planDetails
  const usage = status.usage

  const maxAnalyses = plan.max_analyses_per_month
  const maxUsers = plan.max_users
  const maxStorage = plan.max_storage_gb

  switch (action) {
    case 'analysis':
      if (maxAnalyses !== -1 && usage.analyses >= maxAnalyses) {
        return { allowed: false, reason: 'Monthly analysis limit reached' }
      }
      break
    case 'addUser':
      if (maxUsers !== -1 && usage.users >= maxUsers) {
        return { allowed: false, reason: 'User limit reached' }
      }
      break
    case 'uploadFile':
      if (maxStorage !== -1 && usage.storage >= maxStorage) {
        return { allowed: false, reason: 'Storage limit reached' }
      }
      break
  }

  return { allowed: true }
}

/**
 * Get clinic usage stats
 */
async function getClinicUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clinicId: string
): Promise<{ users: number; storage: number; analyses: number }> {
  // Count users
  const { count: userCount } = await supabase
    .from('clinic_staff')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)

  // Count analyses this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: analysisCount } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', startOfMonth.toISOString())

  // TODO: Calculate actual storage usage
  const storageUsage = 0

  return {
    users: userCount || 0,
    storage: storageUsage,
    analyses: analysisCount || 0
  }
}

/**
 * Create default status for error cases
 */
function createDefaultStatus(plan: PricingPlanView, message: string): SubscriptionStatus {
  return {
    isActive: false,
    isTrial: false,
    isTrialExpired: false,
    subscriptionStatus: 'suspended',
    plan: plan.slug,
    planDetails: plan,
    daysRemaining: null,
    trialDaysRemaining: null,
    usage: { users: 0, storage: 0, analyses: 0 },
    withinLimits: true,
    message
  }
}

/**
 * Start trial for a clinic
 */
export async function startTrial(
  clinicId: string,
  planSlug: string = 'starter'
): Promise<boolean> {
  const supabase = await createClient()
  
  // Get plan details from database
  const planDetails = await getPricingPlan(planSlug)
  if (!planDetails) {
    throw new Error(`Plan ${planSlug} not found`)
  }
  
  if (planDetails.trial_days <= 0) {
    return false // No trial for this plan
  }

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + planDetails.trial_days)

  const { error } = await supabase
    .from('clinics')
    .update({
      subscription_plan: planSlug,
      subscription_status: 'trial',
      is_trial: true,
      trial_ends_at: trialEndsAt.toISOString(),
      subscription_started_at: new Date().toISOString()
    })
    .eq('id', clinicId)

  return !error
}

/**
 * Upgrade subscription
 */
export async function upgradeSubscription(
  clinicId: string, 
  planSlug: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Validate plan exists
  const planDetails = await getPricingPlan(planSlug)
  if (!planDetails) {
    return { success: false, error: `Plan ${planSlug} not found` }
  }

  // Calculate subscription end date (1 month from now)
  const subscriptionEndsAt = new Date()
  subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1)

  const { error } = await supabase
    .from('clinics')
    .update({
      subscription_plan: planSlug,
      subscription_status: 'active',
      is_trial: false,
      trial_ends_at: null,
      subscription_started_at: new Date().toISOString(),
      subscription_ends_at: subscriptionEndsAt.toISOString()
    })
    .eq('id', clinicId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
