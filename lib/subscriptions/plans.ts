export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    nameTH: 'Starter',
    price: 9900,
    maxUsers: 1,
    maxSalesUsers: 1,
    maxBranches: 1,
    maxCustomersPerMonth: 100,
    maxStorageGB: 10,
    maxAnalysesPerMonth: 100,
    trialDays: 14,
    features: [
      'AI Skin Analysis (100/month)',
      'CRM & Lead Management',
      'Appointment System',
      'Customer Database',
      'Basic Reports',
      'PDPA Compliant',
    ],
    featuresTH: [
      'AI Skin Analysis (100 ครั้ง/เดือน)',
      'CRM & Lead Management',
      'ระบบนัดหมาย',
      'ฐานข้อมูลลูกค้า',
      'รายงานพื้นฐาน',
      'PDPA Compliant',
    ],
    limitations: [
      '1 branch only',
      'Limited 100 analyses/month',
      'No AR Simulator',
      'No Marketing Automation',
    ],
    limitationsTH: [
      '1 สาขา',
      'จำกัด 100 การวิเคราะห์/เดือน',
      'ไม่มี AR Simulator',
      'ไม่มี Marketing Automation',
    ],
  },
  professional: {
    name: 'Professional',
    nameTH: 'Professional',
    price: 19900,
    maxUsers: 10,
    maxSalesUsers: 3,
    maxBranches: 3,
    maxCustomersPerMonth: -1, // Unlimited
    maxStorageGB: 100,
    maxAnalysesPerMonth: -1, // Unlimited
    trialDays: 14,
    savings: 0.30, // 30% savings per user
    features: [
      'Unlimited AI Analysis',
      'AR Before/After Simulator',
      'CRM Advanced + Sales Pipeline',
      'Appointment + Queue System',
      'Treatment Plans & History',
      'Inventory Management',
      'Email & SMS Marketing',
      'Loyalty Points System',
      'Advanced Analytics',
      'Multi-branch (up to 3)',
      'Video Call Consultation',
      'Priority Support',
    ],
    featuresTH: [
      'AI Analysis ไม่จำกัด',
      'AR Before/After Simulator',
      'CRM Advanced + Sales Pipeline',
      'ระบบนัดหมาย + จัดคิว',
      'แผนการรักษา & ประวัติ',
      'Inventory Management',
      'Email & SMS Marketing',
      'ระบบสะสมแต้ม',
      'Advanced Analytics',
      'หลายสาขา (สูงสุด 3)',
      'Video Call Consultation',
      'Priority Support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    nameTH: 'Enterprise',
    price: 39900,
    maxUsers: -1, // Unlimited
    maxSalesUsers: 10,
    maxBranches: -1, // Unlimited
    maxCustomersPerMonth: -1, // Unlimited
    maxStorageGB: 500,
    maxAnalysesPerMonth: -1, // Unlimited
    trialDays: 30,
    savings: 0.60, // 60% savings per user
    features: [
      'Everything in Professional',
      'Unlimited Sales Users (10+)',
      'Unlimited Multi-branch',
      'Marketing Automation',
      'Custom Reports & Dashboards',
      'API Access',
      'Advanced Integrations',
      'Dedicated Account Manager',
      'Custom Training',
      '24/7 Priority Support',
    ],
    featuresTH: [
      'ทุกอย่างใน Professional',
      'Unlimited Sales Users (10+)',
      'หลายสาขาไม่จำกัด',
      'Marketing Automation',
      'Custom Reports & Dashboards',
      'API Access',
      'Advanced Integrations',
      'Dedicated Account Manager',
      'Custom Training',
      '24/7 Priority Support',
    ],
  },
  platinum: {
    name: 'Platinum',
    nameTH: 'Platinum',
    price: 69900,
    maxUsers: -1, // Unlimited
    maxSalesUsers: -1, // Unlimited
    maxBranches: -1, // Unlimited
    maxCustomersPerMonth: -1, // Unlimited
    maxStorageGB: -1, // Unlimited
    maxAnalysesPerMonth: -1, // Unlimited
    trialDays: 30,
    savings: 0.75, // 75% savings
    features: [
      'Everything in Enterprise',
      'White-label Solution',
      'Custom Domain & Branding',
      'Custom AI Model Training',
      'Dedicated Server Option',
      'Custom Feature Development',
      'SLA 99.9% Uptime',
      'On-site Training',
      'Consulting Services',
    ],
    featuresTH: [
      'ทุกอย่างใน Enterprise',
      'White-label Solution',
      'Custom Domain & Branding',
      'Custom AI Model Training',
      'Dedicated Server Option',
      'Custom Feature Development',
      'SLA 99.9% Uptime',
      'On-site Training',
      'Consulting Services',
    ],
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

/**
 * Get plan by name
 */
export function getPlan(planName: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[planName]
}

/**
 * Check if plan allows feature
 */
export function canAccessFeature(planName: SubscriptionPlan, feature: string): boolean {
  const plan = SUBSCRIPTION_PLANS[planName]
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

/**
 * Format price for display
 */
export function formatPrice(planName: SubscriptionPlan, locale: 'th' | 'en' = 'th'): string {
  const plan = SUBSCRIPTION_PLANS[planName]
  
  // All plans have prices > 0, so no need for free/contact checks
  return locale === 'th' ? `฿${plan.price.toLocaleString()}` : `$${(plan.price / 100).toFixed(2)}`
}
