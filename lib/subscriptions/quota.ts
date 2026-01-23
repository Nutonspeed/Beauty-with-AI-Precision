import { createClient } from '@/lib/supabase/server'
import { SubscriptionPlan } from './plans'

export interface QuotaStatus {
  allowed: boolean
  remaining: number
  limit: number
  usage: number
  resetDate: string
  plan: string
}

/**
 * Get the current monthly quota for a user
 */
export async function getUserQuotaStatus(userId: string): Promise<QuotaStatus> {
  const supabase = await createClient()
  
  // 1. Get user plan/tier
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, tier')
    .eq('id', userId)
    .single()
    
  if (userError || !userData) {
    throw new Error('User not found')
  }
  
  const role = userData.role as string
  const isPremium = role === 'customer_premium' || role === 'premium_customer' || role === 'super_admin'
  const _plan: SubscriptionPlan = isPremium ? 'professional' : 'starter'
  
  // 2. Get quota limits from config
  // Roadmap says: Free 3/mo, Premium 30/mo
  // We'll use these specific values for MVP, or fallback to SUBSCRIPTION_PLANS
  const limit = isPremium ? 30 : 3
  
  // 3. Count analyses in current month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const { count, error: countError } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstDayOfMonth)
    
  if (countError) {
    console.error('Error fetching usage count:', countError)
  }
  
  const usage = count || 0
  const remaining = Math.max(0, limit - usage)
  
  // 4. Calculate reset date (1st of next month)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  return {
    allowed: remaining > 0 || limit === -1,
    remaining,
    limit,
    usage,
    resetDate: nextMonth.toISOString(),
    plan: isPremium ? 'Premium' : 'Free'
  }
}

/**
 * Check if user can perform another analysis
 */
export async function checkQuota(userId: string): Promise<boolean> {
  const status = await getUserQuotaStatus(userId)
  return status.allowed
}
