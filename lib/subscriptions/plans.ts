// =====================================================
// SALES-GATED QUOTA MODEL
// Quota is tied to each Sales User, not the Center
// Customers analyze via link from sales -> counts towards sales quota
// =====================================================

// Annual discount: 2 months free (pay 10, get 12)
export const ANNUAL_DISCOUNT = 0.167 // ~16.7% discount = 2 months free

// Add-on pricing for extra resources
export const ADDON_PRICING = {
  extraSalesUser: {
    price: 2900, // per user per month
  },
  extraBranch: {
    price: 1900, // per branch per month
  },
  extraAnalyses: {
    price: 990, // per 100 analyses (for Starter tier)
    appliesTo: 'starter', // Only for Starter tier
  },
  extraARSimulations: {
    price: 490, // per 50 simulations (for Starter tier)
    appliesTo: 'starter',
  },
} as const

// Features that are SALES-ONLY (customers cannot access directly)
export const SALES_ONLY_FEATURES = [
  'ai_analysis',        // AI Skin Analysis
  'ar_simulators',      // All AR Simulators  
  'quick_scan',         // Quick Scan Mobile
  'proposal_generator', // AI Proposal Generator
  'lead_scoring',       // Lead Scoring
  'video_call_host',    // Host video calls
] as const

// Features that CUSTOMERS can access
export const CUSTOMER_FEATURES = [
  'view_own_results',   // View their analysis results
  'track_progress',     // Track skin progress over time
  'loyalty_points',     // Loyalty & rewards (Professional+)
  'book_appointments',  // Book appointments
  'video_call_join',    // Join video calls (not host)
  'chat_support',       // Chat with clinic
] as const

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 6900,
    priceAnnual: 6900 * 10,
    annualSavings: 6900 * 2,
    // Sales User Limits
    maxSalesUsers: 1,
    quotaPerSales: 100,      // 100 analyses per sales user per month
    arQuotaPerSales: 20,     // 20 AR simulations per sales user per month
    // Center Limits
    maxBranches: 1,
    maxCustomersPerMonth: -1, // Unlimited customers
    maxStorageGB: 10,
    trialDays: 14,
    salesFeatures: ['Basic AI Analysis', 'Standard AR Simulator', 'Lead Management'],
    salesFeaturesTH: ['การวิเคราะห์ AI พื้นฐาน', 'ระบบ AR จำลองมาตรฐาน', 'การจัดการรายชื่อลูกค้า'],
    customerFeatures: ['View Results', 'Basic Progress Tracking'],
    customerFeaturesTH: ['ดูผลการวิเคราะห์', 'ติดตามความคืบหน้าพื้นฐาน'],
  },
  professional: {
    name: 'Professional',
    popular: true,
    price: 14900,
    priceAnnual: 14900 * 10,
    annualSavings: 14900 * 2,
    // Sales User Limits
    maxSalesUsers: 3,
    quotaPerSales: -1,       // Unlimited analyses per sales
    arQuotaPerSales: -1,     // Unlimited AR per sales
    // Center Limits
    maxBranches: 2,
    maxCustomersPerMonth: -1,
    maxStorageGB: 100,
    trialDays: 14,
    salesFeatures: ['Advanced AI Analysis', 'Full AR Suite', 'Sales CRM', 'AI Proposals'],
    salesFeaturesTH: ['การวิเคราะห์ AI ขั้นสูง', 'ระบบ AR เต็มรูปแบบ', 'ระบบ CRM การขาย', 'ข้อเสนอโครงการโดย AI'],
    customerFeatures: ['View Results', 'Advanced Progress Tracking', 'Loyalty Rewards'],
    customerFeaturesTH: ['ดูผลการวิเคราะห์', 'ติดตามความคืบหน้าขั้นสูง', 'ระบบคะแนนสะสม'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 29900,
    priceAnnual: 29900 * 10,
    annualSavings: 29900 * 2,
    // Sales User Limits
    maxSalesUsers: 10,
    quotaPerSales: -1,       // Unlimited
    arQuotaPerSales: -1,     // Unlimited
    // Center Limits
    maxBranches: -1,         // Unlimited
    maxCustomersPerMonth: -1,
    maxStorageGB: 500,
    trialDays: 30,
    salesFeatures: ['Custom AI Models', 'Multi-branch Sync', 'Enterprise Analytics', 'Voice AI Concierge'],
    salesFeaturesTH: ['โมเดล AI เฉพาะทาง', 'ระบบเชื่อมต่อหลายสาขา', 'ระบบวิเคราะห์ระดับองค์กร', 'ระบบสั่งงานด้วยเสียง AI'],
    customerFeatures: ['White-label Portal', 'Priority Booking', 'Exclusive Offers'],
    customerFeaturesTH: ['พอร์ทัลแบรนด์ตัวเอง', 'ระบบจองคิวพิเศษ', 'ข้อเสนอสุดพิเศษเฉพาะบุคคล'],
  },
  platinum: {
    name: 'Platinum',
    price: 49900,
    priceAnnual: 49900 * 10,
    annualSavings: 49900 * 2,
    // Sales User Limits
    maxSalesUsers: -1,       // Unlimited
    quotaPerSales: -1,       // Unlimited
    arQuotaPerSales: -1,     // Unlimited
    // Center Limits
    maxBranches: -1,         // Unlimited
    maxCustomersPerMonth: -1,
    maxStorageGB: -1,        // Unlimited
    trialDays: 30,
    salesFeatures: ['Unlimited Nodes', 'Global Deployment', 'Custom Integration', 'Executive Boardroom'],
    salesFeaturesTH: ['โหนดไม่จำกัด', 'ระบบติดตั้งทั่วโลก', 'ระบบเชื่อมต่อ API', 'รายงานสำหรับผู้บริหาร'],
    customerFeatures: ['VIP Concierge', 'Health Insurance Sync', 'Global Access'],
    customerFeaturesTH: ['ผู้ช่วย VIP ส่วนตัว', 'เชื่อมต่อประกันสุขภาพ', 'เข้าถึงได้จากทั่วโลก'],
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
  const allFeatures = [...(plan as any).salesFeatures, ...(plan as any).customerFeatures]
  return allFeatures.includes(feature)
}

/**
 * Check if usage is within limits
 */
export function isWithinLimits(
  planName: SubscriptionPlan,
  usage: { users?: number; customers?: number; storage?: number; analyses?: number }
): boolean {
  const plan = SUBSCRIPTION_PLANS[planName]
  const maxUsers = (plan as any).maxSalesUsers as number
  const maxCustomers = (plan as any).maxCustomersPerMonth as number
  const maxStorage = (plan as any).maxStorageGB as number
  const maxAnalyses = (plan as any).quotaPerSales as number
  
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

/**
 * Get annual price for a plan
 */
export function getAnnualPrice(planName: SubscriptionPlan): number {
  const plan = SUBSCRIPTION_PLANS[planName]
  return (plan as any).priceAnnual || plan.price * 10
}

/**
 * Get annual savings for a plan
 */
export function getAnnualSavings(planName: SubscriptionPlan): number {
  const plan = SUBSCRIPTION_PLANS[planName]
  return (plan as any).annualSavings || plan.price * 2
}

/**
 * Format annual price for display
 */
export function formatAnnualPrice(planName: SubscriptionPlan, locale: 'th' | 'en' = 'th'): string {
  const annualPrice = getAnnualPrice(planName)
  return locale === 'th' ? `฿${annualPrice.toLocaleString()}` : `$${(annualPrice / 100).toFixed(2)}`
}

/**
 * Calculate price with add-ons
 */
export function calculateTotalPrice(
  planName: SubscriptionPlan,
  addons: {
    extraSalesUsers?: number
    extraBranches?: number
    extraAnalysesPacks?: number
    extraARPacks?: number
  } = {},
  _billingCycle: 'monthly' | 'annual' = 'monthly'
): { 
  basePrice: number
  addonsPrice: number
  totalMonthly: number
  totalAnnual: number
  savings: number 
} {
  const plan = SUBSCRIPTION_PLANS[planName]
  const basePrice = plan.price
  
  let addonsPrice = 0
  if (addons.extraSalesUsers) {
    addonsPrice += addons.extraSalesUsers * ADDON_PRICING.extraSalesUser.price
  }
  if (addons.extraBranches) {
    addonsPrice += addons.extraBranches * ADDON_PRICING.extraBranch.price
  }
  if (addons.extraAnalysesPacks) {
    addonsPrice += addons.extraAnalysesPacks * ADDON_PRICING.extraAnalyses.price
  }
  if (addons.extraARPacks) {
    addonsPrice += addons.extraARPacks * ADDON_PRICING.extraARSimulations.price
  }
  
  const totalMonthly = basePrice + addonsPrice
  const totalAnnual = totalMonthly * 10 // Pay 10, get 12
  const savings = totalMonthly * 2 // Save 2 months
  
  return {
    basePrice,
    addonsPrice,
    totalMonthly,
    totalAnnual,
    savings
  }
}

/**
 * Get add-on pricing info
 */
export function getAddonPricing() {
  return ADDON_PRICING
}
