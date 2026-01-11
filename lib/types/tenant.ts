/**
 * Multi-Tenant Architecture Types
 * Defines core types for B2B2C SaaS multi-center support
 */

export interface TenantBranding {
  logo?: string
  primaryColor: string
  secondaryColor: string
  fontFamily?: string
  customCSS?: string
}

export interface TenantFeatures {
  // AI Analysis Features
  aiAnalysis: boolean
  premiumAIModels: boolean
  batchAnalysis: boolean
  
  // AR & Visualization
  arSimulator: boolean
  advancedVisualization: boolean
  multiProgramComparison: boolean
  
  // Sales & CRM
  leadManagement: boolean
  aiProposalGenerator: boolean
  leadScoring: boolean
  liveChat: boolean
  
  // Analytics & Reporting
  advancedAnalytics: boolean
  customReports: boolean
  exportData: boolean
  
  // Integrations
  apiAccess: boolean
  webhooks: boolean
  thirdPartyIntegrations: boolean
  
  // Capacity Limits
  maxUsers: number
  maxCustomersPerMonth: number
  maxStorageGB: number
}

export interface TenantSettings {
  // Business Information
  centerName: string
  centerType: 'medical_spa' | 'dermatology' | 'aesthetic_center' | 'wellness_center'
  businessRegistration?: string
  taxId?: string
  
  // Contact Information
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  
  // Operating Hours
  timezone: string
  businessHours: {
    [key: string]: { // day of week
      open: string // HH:mm format
      close: string
      closed: boolean
    }
  }
  
  // Localization
  defaultLanguage: 'en' | 'th'
  supportedLanguages: Array<'en' | 'th'>
  currency: string
  
  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
}

export interface TenantSubscription {
  plan: 'starter' | 'professional' | 'enterprise' | 'custom'
  status: 'active' | 'trial' | 'suspended' | 'cancelled'
  startDate: Date
  endDate?: Date
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  amount: number
  currency: string
  paymentMethod?: string
}

export interface Tenant {
  id: string
  slug: string // URL-friendly identifier (e.g., 'beauty-center-bkk')
  
  // Tenant Information
  settings: TenantSettings
  branding: TenantBranding
  features: TenantFeatures
  subscription: TenantSubscription
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string // User ID of creator (super admin)
  
  // Status
  isActive: boolean
  isTrial: boolean
  
  // Custom Domain (optional)
  customDomain?: string
  
  // Database Isolation Strategy
  isolationStrategy: 'shared_schema' | 'separate_schema' | 'separate_database'
  
  // Usage Tracking
  usage: {
    currentUsers: number
    currentCustomers: number
    storageUsedGB: number
    apiCallsThisMonth: number
    lastActivityAt?: Date
  }
}

export interface TenantContext {
  tenant: Tenant
  user: {
    id: string
    email: string
    role: string
    centerId: string
  }
  permissions: string[]
}

// Default feature sets for different plans
export const PLAN_FEATURES: Record<string, Partial<TenantFeatures>> = {
  starter: {
    aiAnalysis: true,
    premiumAIModels: false,
    batchAnalysis: false,
    arSimulator: true,
    advancedVisualization: false,
    multiProgramComparison: false,
    leadManagement: true,
    aiProposalGenerator: false,
    leadScoring: false,
    liveChat: true,
    advancedAnalytics: false,
    customReports: false,
    exportData: false,
    apiAccess: false,
    webhooks: false,
    thirdPartyIntegrations: false,
    maxUsers: 5,
    maxCustomersPerMonth: 100,
    maxStorageGB: 10,
  },
  professional: {
    aiAnalysis: true,
    premiumAIModels: true,
    batchAnalysis: false,
    arSimulator: true,
    advancedVisualization: true,
    multiProgramComparison: true,
    leadManagement: true,
    aiProposalGenerator: true,
    leadScoring: false,
    liveChat: true,
    advancedAnalytics: true,
    customReports: false,
    exportData: true,
    apiAccess: false,
    webhooks: false,
    thirdPartyIntegrations: false,
    maxUsers: 10,
    maxCustomersPerMonth: 500,
    maxStorageGB: 50,
  },
  enterprise: {
    aiAnalysis: true,
    premiumAIModels: true,
    batchAnalysis: true,
    arSimulator: true,
    advancedVisualization: true,
    multiProgramComparison: true,
    leadManagement: true,
    aiProposalGenerator: true,
    leadScoring: true,
    liveChat: true,
    advancedAnalytics: true,
    customReports: true,
    exportData: true,
    apiAccess: true,
    webhooks: true,
    thirdPartyIntegrations: true,
    maxUsers: 50,
    maxCustomersPerMonth: 5000,
    maxStorageGB: 500,
  },
}

// Tenant creation helper type
export interface CreateTenantInput {
  centerName: string
  slug: string
  email: string
  phone: string
  plan: TenantSubscription['plan']
  ownerId: string
  branding?: Partial<TenantBranding>
  customFeatures?: Partial<TenantFeatures>
}
