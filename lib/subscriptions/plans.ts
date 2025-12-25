export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    nameTH: 'ใช้ฟรี',
    price: 0,
    maxUsers: 1,
    maxCustomersPerMonth: 10,
    maxStorageGB: 1,
    maxAnalysesPerMonth: 20,
    trialDays: 0,
    features: [
      'Basic AI Skin Analysis',
      '8 VISIA Metrics',
      'Instant Results',
    ],
    featuresTH: [
      'AI Skin Analysis พื้นฐาน',
      '8 ตัวชี้วัด VISIA',
      'ผลลัพธ์ทันที',
    ],
  },
  premium: {
    name: 'Premium',
    nameTH: 'พรีเมียม',
    price: 4900,
    maxUsers: 10,
    maxCustomersPerMonth: 500,
    maxStorageGB: 50,
    maxAnalysesPerMonth: -1, // Unlimited
    trialDays: 14,
    features: [
      'Advanced AI Analysis',
      'AR Treatment Simulator',
      'Unlimited History',
      'Before/After Comparison',
      'AI Recommendations',
      'Sales Dashboard',
      'Reports & Analytics',
      'Email Support',
    ],
    featuresTH: [
      'AI Analysis ขั้นสูง',
      'AR Treatment Simulator',
      'บันทึกประวัติไม่จำกัด',
      'เปรียบเทียบผลก่อน-หลัง',
      'คำแนะนำส่วนตัว AI',
      'Sales Dashboard',
      'รายงานและ Analytics',
      'Email Support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    nameTH: 'องค์กร',
    price: -1, // Custom pricing
    maxUsers: -1, // Unlimited
    maxCustomersPerMonth: -1, // Unlimited
    maxStorageGB: 500,
    maxAnalysesPerMonth: -1, // Unlimited
    trialDays: 30,
    features: [
      'All Premium Features',
      'Multi-Clinic Management',
      'Custom Branding',
      'API Integration',
      'Dedicated Support 24/7',
      'Custom Development',
      'Training & Onboarding',
      'SLA Guarantee',
    ],
    featuresTH: [
      'ฟีเจอร์ Premium ทั้งหมด',
      'Multi-Clinic Management',
      'Custom Branding',
      'API Integration',
      'Support 24/7',
      'Custom Development',
      'Training & Onboarding',
      'SLA Guarantee',
    ],
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// =============================
// B2B clinic subscription plans
// =============================

export const CLINIC_SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    nameTH: 'เริ่มต้น',
    price: 2900,
    maxUsers: 5,
    maxCustomersPerMonth: 100,
    maxStorageGB: 10,
    maxAnalysesPerMonth: 100,
    trialDays: 14,
    features: [
      'AI Skin Analysis',
      'Sales Dashboard',
      'Basic Reports',
    ],
    featuresTH: [
      'AI Skin Analysis',
      'Sales Dashboard',
      'รายงานพื้นฐาน',
    ],
  },
  professional: {
    name: 'Professional',
    nameTH: 'มืออาชีพ',
    price: 9900,
    maxUsers: 20,
    maxCustomersPerMonth: 500,
    maxStorageGB: 50,
    maxAnalysesPerMonth: 500,
    trialDays: 14,
    features: [
      'AI Skin Analysis',
      'Sales Dashboard',
      'Advanced Reports',
      'AR Treatment Simulator',
    ],
    featuresTH: [
      'AI Skin Analysis',
      'Sales Dashboard',
      'รายงานขั้นสูง',
      'AR Treatment Simulator',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    nameTH: 'องค์กร',
    price: 29900,
    maxUsers: -1,
    maxCustomersPerMonth: -1,
    maxStorageGB: 500,
    maxAnalysesPerMonth: -1,
    trialDays: 14,
    features: [
      'All Professional Features',
      'Multi-Clinic Management',
      'Priority Support',
    ],
    featuresTH: [
      'ฟีเจอร์ Professional ทั้งหมด',
      'Multi-Clinic Management',
      'Support แบบ Priority',
    ],
  },
} as const

export type ClinicSubscriptionPlan = keyof typeof CLINIC_SUBSCRIPTION_PLANS

/**
 * Get plan by name
 */
export function getPlan(planName: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[planName]
}

export function getClinicPlan(planName: ClinicSubscriptionPlan) {
  return CLINIC_SUBSCRIPTION_PLANS[planName]
}

/**
 * Check if plan allows feature
 */
export function canAccessFeature(planName: SubscriptionPlan, feature: string): boolean {
  const plan = SUBSCRIPTION_PLANS[planName]
  return (plan.features as readonly string[]).includes(feature)
}

export function canClinicAccessFeature(planName: ClinicSubscriptionPlan, feature: string): boolean {
  const plan = CLINIC_SUBSCRIPTION_PLANS[planName]
  return (plan.features as readonly string[]).includes(feature)
}

/**
 * Check if usage is within limits
 */
export function isWithinLimits(
  planName: SubscriptionPlan,
  usage: { users?: number; customers?: number; storage?: number; analyses?: number }
): boolean {
  const plan = SUBSCRIPTION_PLANS[planName]
  const maxUsers = plan.maxUsers as number
  const maxCustomers = plan.maxCustomersPerMonth as number
  const maxStorage = plan.maxStorageGB as number
  const maxAnalyses = plan.maxAnalysesPerMonth as number
  
  if (usage.users && maxUsers !== -1 && usage.users > maxUsers) return false
  if (usage.customers && maxCustomers !== -1 && usage.customers > maxCustomers) return false
  if (usage.storage && maxStorage !== -1 && usage.storage > maxStorage) return false
  if (usage.analyses && maxAnalyses !== -1 && usage.analyses > maxAnalyses) return false
  
  return true
}

export function isClinicWithinLimits(
  planName: ClinicSubscriptionPlan,
  usage: { users?: number; customers?: number; storage?: number; analyses?: number }
): boolean {
  const plan = CLINIC_SUBSCRIPTION_PLANS[planName]
  const maxUsers = plan.maxUsers as number
  const maxCustomers = plan.maxCustomersPerMonth as number
  const maxStorage = plan.maxStorageGB as number
  const maxAnalyses = plan.maxAnalysesPerMonth as number

  if (usage.users && maxUsers !== -1 && usage.users > maxUsers) return false
  if (usage.customers && maxCustomers !== -1 && usage.customers > maxCustomers) return false
  if (usage.storage && maxStorage !== -1 && usage.storage > maxStorage) return false
  if (usage.analyses && maxAnalyses !== -1 && usage.analyses > maxAnalyses) return false

  return true
}

/**
 * Format price for display
 */
export function formatPrice(planName: SubscriptionPlan, locale: 'th' | 'en' = 'th'): string {
  const plan = SUBSCRIPTION_PLANS[planName]
  
  if (plan.price === 0) return locale === 'th' ? 'ฟรี' : 'Free'
  if (plan.price === -1) return locale === 'th' ? 'ติดต่อเรา' : 'Contact Us'
  
  return `฿${plan.price.toLocaleString()}`
}
