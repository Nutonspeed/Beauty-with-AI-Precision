/**
 * Optimized Tenant Management System v2
 * Addresses scalability issues with caching and optimized queries
 */

import type { Tenant, CreateTenantInput, TenantFeatures } from "../types/tenant"
import { PLAN_FEATURES } from "../types/tenant"
import { createClient } from "../supabase/server"
import { logger } from "@/lib/logger"

// Cache configuration
const CACHE_TTL = {
  TENANT: 300, // 5 minutes
  TENANT_LIST: 600, // 10 minutes
  FEATURES: 1800, // 30 minutes
}

// Simple in-memory cache for development
// In production, replace with Redis
const memoryCache = new Map<string, { data: any; expires: number }>()

function getCached<T>(key: string): T | null {
  const cached = memoryCache.get(key)
  if (!cached) return null
  
  if (Date.now() > cached.expires) {
    memoryCache.delete(key)
    return null
  }
  
  return cached.data as T
}

function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  memoryCache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000
  })
  
  // Clean up expired entries periodically
  if (memoryCache.size > 1000) {
    for (const [k, v] of memoryCache.entries()) {
      if (Date.now() > v.expires) {
        memoryCache.delete(k)
      }
    }
  }
}

// Helper functions (unchanged)
function getDefaultBusinessHours() {
  return {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "10:00", close: "16:00", closed: false },
    sunday: { open: "", close: "", closed: true },
  }
}

function getSubscriptionAmount(plan: string): number {
  const p = normalizeClinicPlan(plan)
  if (p === "starter") return 2900
  if (p === "professional") return 9900
  return 29900
}

function normalizeClinicPlan(plan: string): "starter" | "professional" | "enterprise" {
  const p = String(plan || "").trim().toLowerCase()
  if (p === "professional") return "professional"
  if (p === "enterprise") return "enterprise"
  if (p === "premium") return "professional"
  if (p === "free") return "starter"
  return "starter"
}

function normalizeSubscriptionStatus(
  status: string | null | undefined
): "trial" | "active" | "past_due" | "suspended" | "cancelled" {
  const s = String(status || "").trim().toLowerCase()
  if (s === "active") return "active"
  if (s === "trial") return "trial"
  if (s === "past_due") return "past_due"
  if (s === "suspended") return "suspended"
  if (s === "cancelled" || s === "canceled") return "cancelled"
  return "trial"
}

// Optimized tenant mapping function
function mapClinicToTenant(clinic: any): Tenant {
  const rawPlan =
    (clinic.subscription_plan as string | undefined) ??
    (clinic.subscription_tier as string | undefined) ??
    "starter"
  const plan = normalizeClinicPlan(rawPlan)

  const features = PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter
  const subscriptionAmount = getSubscriptionAmount(plan)

  const rawStatus =
    (clinic.subscription_status as string | undefined) ??
    (clinic.subscription_tier ? (clinic.subscription_tier === "starter" ? "trial" : "active") : undefined)
  const status = normalizeSubscriptionStatus(rawStatus)

  const isTrial = Boolean(clinic.is_trial) || status === "trial"
  const startDate = clinic.subscription_started_at ? new Date(clinic.subscription_started_at) : new Date()
  const endDate = clinic.subscription_ends_at
    ? new Date(clinic.subscription_ends_at)
    : (clinic.trial_ends_at ? new Date(clinic.trial_ends_at) : undefined)

  return {
    id: clinic.id,
    slug: clinic.slug,
    settings: {
      clinicName: clinic.name || clinic.clinic_name,
      clinicType: "aesthetic_clinic",
      email: clinic.email,
      phone: clinic.phone,
      address: { street: "", city: "", state: "", postalCode: "", country: "Thailand" },
      timezone: "Asia/Bangkok",
      businessHours: getDefaultBusinessHours(),
      defaultLanguage: "th",
      supportedLanguages: ["th", "en"],
      currency: "THB",
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
    branding: { primaryColor: "#8B5CF6", secondaryColor: "#EC4899" },
    features: features as TenantFeatures,
    subscription: {
      plan,
      status: status as any,
      startDate,
      endDate,
      billingCycle: "monthly",
      amount: subscriptionAmount,
      currency: "THB",
    },
    createdAt: clinic.created_at || new Date().toISOString(),
    updatedAt: clinic.updated_at || new Date().toISOString(),
    createdBy: "",
    isActive: clinic.is_active ?? true,
    isTrial,
    isolationStrategy: "shared_schema",
    usage: { currentUsers: 1, currentCustomers: 0, storageUsedGB: 0, apiCallsThisMonth: 0 },
  }
}

/**
 * Get tenant by ID with caching
 */
export async function getTenantByIdV2(tenantId: string): Promise<Tenant | null> {
  try {
    // Check cache first
    const cacheKey = `tenant:${tenantId}`
    const cached = getCached<Tenant>(cacheKey)
    if (cached) return cached

    // Query database with optimized query
    const supabase = await createClient()
    const { data: clinic, error } = await supabase
      .from("clinics")
      .select(`
        id,
        slug,
        name,
        clinic_name,
        email,
        phone,
        subscription_plan,
        subscription_tier,
        subscription_status,
        subscription_started_at,
        subscription_ends_at,
        trial_ends_at,
        is_trial,
        is_active,
        created_at,
        updated_at
      `)
      .eq("id", tenantId)
      .eq("is_active", true) // Only active tenants
      .single()

    if (error || !clinic) return null

    const tenant = mapClinicToTenant(clinic)
    
    // Cache the result
    setCached(cacheKey, tenant, CACHE_TTL.TENANT)
    
    return tenant
  } catch (error) {
    logger.error("Error fetching tenant by ID", error as Error)
    return null
  }
}

/**
 * Get tenant by slug with caching
 */
export async function getTenantBySlugV2(slug: string): Promise<Tenant | null> {
  try {
    // Check cache first
    const cacheKey = `tenant:slug:${slug}`
    const cached = getCached<Tenant>(cacheKey)
    if (cached) return cached

    const supabase = await createClient()
    const { data: clinic, error } = await supabase
      .from("clinics")
      .select(`
        id,
        slug,
        name,
        clinic_name,
        email,
        phone,
        subscription_plan,
        subscription_tier,
        subscription_status,
        subscription_started_at,
        subscription_ends_at,
        trial_ends_at,
        is_trial,
        is_active,
        created_at,
        updated_at
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (error || !clinic) return null

    const tenant = mapClinicToTenant(clinic)
    
    // Cache the result
    setCached(cacheKey, tenant, CACHE_TTL.TENANT)
    
    return tenant
  } catch (error) {
    logger.error("Error fetching tenant by slug", error as Error)
    return null
  }
}

/**
 * Get all tenants with pagination and caching
 */
export async function getAllTenantsV2(options: {
  page?: number
  limit?: number
  status?: 'all' | 'active' | 'trial' | 'expired'
} = {}): Promise<{ tenants: Tenant[]; total: number; page: number; totalPages: number }> {
  try {
    const { page = 1, limit = 50, status = 'all' } = options
    const cacheKey = `tenants:all:${page}:${limit}:${status}`
    
    // Check cache
    const cached = getCached<{ tenants: Tenant[]; total: number }>(cacheKey)
    if (cached) {
      return {
        ...cached,
        page,
        totalPages: Math.ceil(cached.total / limit)
      }
    }

    const supabase = await createClient()
    
    // Build query
    let query = supabase
      .from("clinics")
      .select(`
        id,
        slug,
        name,
        clinic_name,
        email,
        phone,
        subscription_plan,
        subscription_tier,
        subscription_status,
        subscription_started_at,
        subscription_ends_at,
        trial_ends_at,
        is_trial,
        is_active,
        created_at,
        updated_at
      `, { count: 'exact' })

    // Apply filters
    if (status === 'active') {
      query = query.eq('is_active', true).not('subscription_status', 'in', '("cancelled","suspended")')
    } else if (status === 'trial') {
      query = query.eq('is_trial', true)
    } else if (status === 'expired') {
      query = query.lt('subscription_ends_at', new Date().toISOString())
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

    const { data: clinics, error, count } = await query

    if (error || !clinics) {
      return { tenants: [], total: 0, page, totalPages: 0 }
    }

    const tenants = clinics.map(mapClinicToTenant)
    const total = count || 0

    // Cache the result
    setCached(cacheKey, { tenants, total }, CACHE_TTL.TENANT_LIST)

    return {
      tenants,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    logger.error("Error fetching all tenants", error as Error)
    return { tenants: [], total: 0, page: 1, totalPages: 0 }
  }
}

/**
 * Get active tenants count (cached)
 */
export async function getActiveTenantsCount(): Promise<number> {
  try {
    const cacheKey = 'tenants:active:count'
    const cached = getCached<number>(cacheKey)
    if (cached !== null) return cached

    const supabase = await createClient()
    const { count, error } = await supabase
      .from("clinics")
      .select("id", { count: 'exact', head: true })
      .eq("is_active", true)

    if (error) return 0

    setCached(cacheKey, count || 0, CACHE_TTL.TENANT_LIST)
    return count || 0
  } catch (error) {
    logger.error("Error counting active tenants", error as Error)
    return 0
  }
}

/**
 * Check if tenant has feature enabled (with caching)
 */
export async function hasFeatureV2(tenantId: string, feature: keyof TenantFeatures): Promise<boolean> {
  try {
    const cacheKey = `tenant:${tenantId}:features`
    let features = getCached<TenantFeatures>(cacheKey)
    
    if (!features) {
      const tenant = await getTenantByIdV2(tenantId)
      if (!tenant) return false
      features = tenant.features
      setCached(cacheKey, features, CACHE_TTL.FEATURES)
    }
    
    return !!features[feature]
  } catch (error) {
    logger.error("Error checking tenant feature", error as Error)
    return false
  }
}

/**
 * Get tenant usage statistics (optimized)
 */
export async function getTenantUsageStats(tenantId: string): Promise<{
  users: number
  customers: number
  appointments: number
  analyses: number
  storageGB: number
}> {
  try {
    const cacheKey = `tenant:${tenantId}:usage`
    const cached = getCached(cacheKey)
    if (cached) return cached

    const supabase = await createClient()
    
    // Use parallel queries for better performance
    const [usersResult, appointmentsResult, analysesResult] = await Promise.all([
      supabase.from("users").select("role", { count: 'exact' }).eq("clinic_id", tenantId),
      supabase.from("appointments").select("id", { count: 'exact' }).eq("clinic_id", tenantId),
      supabase.from("skin_analyses").select("id", { count: 'exact' }).eq("clinic_id", tenantId)
    ])

    const stats = {
      users: usersResult.count || 0,
      customers: 0, // Would need filtered query
      appointments: appointmentsResult.count || 0,
      analyses: analysesResult.count || 0,
      storageGB: 0 // Would need storage calculation
    }

    // Cache for 5 minutes
    setCached(cacheKey, stats, 300)
    
    return stats
  } catch (error) {
    logger.error("Error fetching tenant usage", error as Error)
    return {
      users: 0,
      customers: 0,
      appointments: 0,
      analyses: 0,
      storageGB: 0
    }
  }
}

/**
 * Clear tenant cache
 */
export function clearTenantCache(tenantId?: string): void {
  if (tenantId) {
    // Clear specific tenant cache
    const keysToDelete = Array.from(memoryCache.keys()).filter(key => 
      key.includes(`tenant:${tenantId}`) || 
      key.includes(`tenant:${tenantId}:`)
    )
    keysToDelete.forEach(key => memoryCache.delete(key))
  } else {
    // Clear all tenant cache
    const keysToDelete = Array.from(memoryCache.keys()).filter(key => 
      key.startsWith('tenant:')
    )
    keysToDelete.forEach(key => memoryCache.delete(key))
  }
}

/**
 * Cache statistics for monitoring
 */
export function getCacheStats(): {
  size: number
  hitRate: number
  memoryUsage: number
} {
  // This is a simplified version
  // In production, implement proper hit rate tracking
  return {
    size: memoryCache.size,
    hitRate: 0, // Would need to track hits/misses
    memoryUsage: 0 // Would need to calculate actual memory usage
  }
}

// Export all functions
export {
  createTenant as createTenantV2,
  updateTenant as updateTenantV2,
  deleteTenant as deleteTenantV2,
  hasFeature,
  checkUsageLimit,
  updateTenantUsage
} from './tenant-manager'
