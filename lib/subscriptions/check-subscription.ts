/**
 * Subscription Check Utilities
 * 
 * Check subscription status, trial period, and usage limits
 */

import { createClient } from '@/lib/supabase/server'
import { SUBSCRIPTION_PLANS, SubscriptionPlan, isWithinLimits } from './plans'

export interface SubscriptionStatus {
  isActive: boolean
  isTrial: boolean
  isTrialExpired: boolean
  plan: SubscriptionPlan
  planDetails: typeof SUBSCRIPTION_PLANS[SubscriptionPlan]
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
    return createDefaultStatus('starter', 'Clinic not found')
  }

  const plan = (clinic.subscription_plan || 'starter') as SubscriptionPlan
  const planDetails = SUBSCRIPTION_PLANS[plan]
  const now = new Date()

  // Check trial status
  const isTrial = clinic.is_trial || false
  const trialEndsAt = clinic.trial_ends_at ? new Date(clinic.trial_ends_at) : null
  const isTrialExpired = isTrial && trialEndsAt ? now > trialEndsAt : false
  const trialDaysRemaining = trialEndsAt && !isTrialExpired
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Check subscription end date
  const subscriptionEndsAt = clinic.subscription_ends_at ? new Date(clinic.subscription_ends_at) : null
  const daysRemaining = subscriptionEndsAt
    ? Math.ceil((subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Determine if subscription is active
  const isActive = 
    clinic.subscription_status === 'active' ||
    (isTrial && !isTrialExpired)

  // Get current usage (simplified - would need actual counting in production)
  const usage = await getClinicUsage(supabase, clinicId)

  // Check if within limits
  const withinLimits = isWithinLimits(plan, usage)

  // Generate status message
  let message = ''
  if (!isActive) {
    message = 'Subscription is not active'
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
    plan,
    planDetails,
    daysRemaining,
    trialDaysRemaining,
    usage,
    withinLimits,
    message
  }
}

/**
 * Check if clinic can access a feature
 */
export async function canAccessFeature(clinicId: string, feature: string): Promise<boolean> {
  const status = await getSubscriptionStatus(clinicId)
  
  if (!status.isActive) return false
  
  const features = status.planDetails.features as readonly string[]
  return features.includes(feature)
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
    return { allowed: false, reason: 'Subscription is not active' }
  }

  if (status.isTrialExpired) {
    return { allowed: false, reason: 'Trial period has expired' }
  }

  const plan = status.planDetails
  const usage = status.usage

  const maxAnalyses = plan.maxAnalysesPerMonth as number
  const maxUsers = plan.maxUsers as number
  const maxStorage = plan.maxStorageGB as number

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
function createDefaultStatus(plan: SubscriptionPlan, message: string): SubscriptionStatus {
  return {
    isActive: false,
    isTrial: false,
    isTrialExpired: false,
    plan,
    planDetails: SUBSCRIPTION_PLANS[plan],
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
export async function startTrial(clinicId: string, plan: SubscriptionPlan = 'starter'): Promise<boolean> {
  const supabase = await createClient()
  const planDetails = SUBSCRIPTION_PLANS[plan]
  
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + planDetails.trialDays)

  const { error } = await supabase
    .from('clinics')
    .update({
      subscription_plan: plan,
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
  plan: SubscriptionPlan
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Calculate subscription end date (1 month from now)
  const subscriptionEndsAt = new Date()
  subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1)

  const { error } = await supabase
    .from('clinics')
    .update({
      subscription_plan: plan,
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
