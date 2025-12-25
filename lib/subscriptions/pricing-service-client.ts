// Client-safe pricing utilities
export interface PricingPlanView {
  id: string
  name: string
  slug: string
  plan_type: 'b2c' | 'b2b'
  price_amount: number
  currency: string
  max_users: number
  max_storage_gb: number
  features: string[]
  max_customers_per_month: number
  max_analyses_per_month: number
  trial_days: number
  name_th: string
  features_th: string[]
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
