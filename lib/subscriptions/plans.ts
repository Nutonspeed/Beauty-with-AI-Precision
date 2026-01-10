export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    nameTH: 'Starter (AI-First CRM)',
    price: 9900,
    maxUsers: 2,
    maxSalesUsers: 1,
    maxBranches: 1,
    maxCustomersPerMonth: 100,
    maxStorageGB: 10,
    maxAnalysesPerMonth: 100,
    trialDays: 14,
    features: [
      'Hybrid AI Skin Analysis (100/month)',
      'AI Conversion Pipeline tracking',
      'Intelligent CRM & Lead Management',
      'Automated Appointment System',
      'Secure Customer Database',
      'Basic Performance Reports',
    ],
    featuresTH: [
      'Hybrid AI Skin Analysis (100 ครั้ง/เดือน)',
      'ระบบติดตาม AI Conversion Pipeline',
      'CRM & จัดการ Lead อัจฉริยะ',
      'ระบบนัดหมายอัตโนมัติ',
      'ฐานข้อมูลลูกค้าปลอดภัยสูง',
      'รายงานประสิทธิภาพพื้นฐาน',
    ],
    limitations: [
      '1 branch only',
      'No Predictive Insights',
      'No AR Simulator',
      'No Marketing Automation',
    ],
    limitationsTH: [
      'ใช้งานได้ 1 สาขาเท่านั้น',
      'ไม่มีระบบทำนายสภาพผิวล่วงหน้า',
      'ไม่มี AR Simulator',
      'ไม่มีระบบการตลาดอัตโนมัติ',
    ],
  },
  professional: {
    name: 'Professional',
    nameTH: 'Professional (Precision Growth)',
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
      'Everything in Starter',
      'Unlimited Hybrid AI Analysis',
      'AR Before/After Simulator (3D)',
      'Predictive Sales Velocity AI',
      'Smart Regimen Tracker',
      'Aesthetic Loyalty & Gamification',
      'AI Virtual Concierge (Standard)',
      'ROI Analytics Dashboard',
      'Automated Inventory Management',
      'Smart SMS & Email Marketing',
      'Multi-branch Synchronization (3)',
    ],
    featuresTH: [
      'ทุกอย่างในแพ็กเกจ Starter',
      'วิเคราะห์ผิวด้วย AI ไม่จำกัดจำนวน',
      'AR Before/After Simulator (3D)',
      'AI ทำนายความเร็วการปิดยอด (Sales Velocity)',
      'ระบบติดตามการใช้ผลิตภัณฑ์ (Regimen Tracker)',
      'ระบบ Loyalty & แต้มสะสมอัจฉริยะ',
      'AI Virtual Concierge (ระดับมาตรฐาน)',
      'แดชบอร์ดคำนวณกำไรจาก AI (ROI)',
      'ระบบจัดการสต็อกสินค้าอัตโนมัติ',
      'การตลาด SMS & Email อัจฉริยะ',
      'รองรับสูงสุด 3 สาขา (ซิงค์ข้อมูล)',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    nameTH: 'Enterprise (Intelligence Hub)',
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
      'Medical Decision Support (MDSS)',
      'Clinical Compliance Audit AI',
      'Predictive Inventory Forecasting',
      'AI Revenue Forecaster (90-day)',
      'AI Autonomous Marketing Engine',
      'Generative Marketing Visuals',
      'Global Industry Benchmarking',
      'Vision-to-Order Pipeline',
      'Shared 3D Clinical Canvas',
      'Enterprise Data Isolation',
    ],
    featuresTH: [
      'ทุกอย่างในแพ็กเกจ Professional',
      'ระบบสนับสนุนการตัดสินใจแพทย์ (MDSS)',
      'AI ตรวจสอบมาตรฐานการรักษา (Compliance)',
      'ระบบทำนายสต็อกเวชภัณฑ์ล่วงหน้า',
      'AI คาดการณ์รายได้แม่นยำ (90 วัน)',
      'เครื่องมือสร้างแคมเปญการตลาดอัตโนมัติ',
      'AI สร้างภาพโฆษณาพรีเมียม (Generative)',
      'ระบบเปรียบเทียบมาตรฐานโลก (Benchmarking)',
      'ระบบร่างแผนการรักษาทันที (Vision-to-Order)',
      'พื้นที่วางแผน 3 มิตร่วมกับลูกค้า (Shared Canvas)',
      'ระบบแยกข้อมูลความปลอดภัยระดับสูง',
    ],
  },
  platinum: {
    name: 'Platinum',
    nameTH: 'Platinum (Elite Custom)',
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
      'Generative 4D Aging Simulator',
      'Bio-Metric IoT Telemetry Sync',
      'Full White-label (Custom Domain)',
      'Custom AI Model Fine-tuning',
      'On-premise / Private Cloud Option',
      'Bespoke Feature Development',
      'Strategic AI Consulting',
    ],
    featuresTH: [
      'ทุกอย่างในแพ็กเกจ Enterprise',
      'เครื่องมือจำลองอายุผิว 4 มิติ (Moonshot)',
      'ระบบซิงค์ข้อมูล IoT & Smart Mirror',
      'White-label (ใช้โดเมนและโลโก้ตัวเอง)',
      'ปรับแต่งโมเดล AI เฉพาะคลินิกคุณ',
      'ทางเลือก Private Cloud ส่วนตัว',
      'พัฒนาฟีเจอร์ใหม่ตามความต้องการ',
      'ที่ปรึกษาเชิงกลยุทธ์ด้าน AI ส่วนตัว',
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
