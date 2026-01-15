/**
 * Sales Quota Management Library
 * Handles quota checking and usage tracking for sales users
 */

export interface QuotaInfo {
  has_quota: boolean
  remaining: number
  used: number
  limit: number
  addon_quota: number
  total_limit: number
}

export interface QuotaSummary {
  sales_user_id: string
  sales_name: string
  center_id: string
  center_name: string
  subscription_tier: string
  analysis_quota: number
  ar_quota: number
  analysis_used: number
  ar_used: number
  analysis_remaining: number
  ar_remaining: number
  current_month: string
}

/**
 * Check if current sales user has quota remaining
 */
export async function checkQuota(type: 'analysis' | 'ar' | 'proposal' = 'analysis'): Promise<QuotaInfo | null> {
  try {
    const response = await fetch(`/api/quota/check?type=${type}`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Quota check failed:', data.error)
      return null
    }
    
    return data.quota
  } catch (error) {
    console.error('Error checking quota:', error)
    return null
  }
}

/**
 * Record usage and decrement quota
 * Returns updated quota info or null if failed/exceeded
 */
export async function recordQuotaUsage(type: 'analysis' | 'ar' | 'proposal' = 'analysis'): Promise<{
  success: boolean
  quota?: QuotaInfo
  error?: string
}> {
  try {
    const response = await fetch('/api/quota/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Failed to use quota'
      }
    }
    
    return {
      success: true,
      quota: data.quota
    }
  } catch (error) {
    console.error('Error using quota:', error)
    return {
      success: false,
      error: 'Network error'
    }
  }
}

/**
 * Get quota summary for dashboard
 */
export async function getQuotaSummary(): Promise<{
  view: 'center' | 'personal'
  center_id?: string
  sales_users?: QuotaSummary[]
  quota?: QuotaSummary | null
} | null> {
  try {
    const response = await fetch('/api/quota/summary')
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Quota summary failed:', data.error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error getting quota summary:', error)
    return null
  }
}

/**
 * Check if quota is unlimited (-1)
 */
export function isUnlimited(value: number): boolean {
  return value === -1
}

/**
 * Format quota display string
 */
export function formatQuota(used: number, limit: number): string {
  if (limit === -1) {
    return `${used} used (unlimited)`
  }
  return `${used} / ${limit}`
}

/**
 * Get quota percentage used
 */
export function getQuotaPercentage(used: number, limit: number): number {
  if (limit === -1) return 0 // Unlimited
  if (limit === 0) return 100
  return Math.min(100, Math.round((used / limit) * 100))
}

/**
 * Check if quota is running low (>80% used)
 */
export function isQuotaLow(used: number, limit: number): boolean {
  if (limit === -1) return false // Unlimited
  return getQuotaPercentage(used, limit) >= 80
}

/**
 * Check if quota is critical (>95% used)
 */
export function isQuotaCritical(used: number, limit: number): boolean {
  if (limit === -1) return false // Unlimited
  return getQuotaPercentage(used, limit) >= 95
}
