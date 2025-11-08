/**
 * Tenant Management System
 * Core utilities for multi-tenant operations
 */

import type {
  Tenant,
  CreateTenantInput,
  TenantFeatures,
  TenantSettings,
  TenantBranding,
  TenantSubscription,
} from "../types/tenant"
import { PLAN_FEATURES } from "../types/tenant"
import { createClient } from "../supabase/server"

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    const { data: tenant, error } = await supabase.from("tenants").select("*").eq("id", tenantId).single()

    if (error || !tenant) return null

    // Convert snake_case to camelCase and proper types
    return {
      id: tenant.id,
      slug: tenant.slug,
      settings: tenant.settings as unknown as TenantSettings,
      branding: tenant.branding as unknown as TenantBranding,
      features: tenant.features as unknown as TenantFeatures,
      subscription: tenant.subscription as unknown as TenantSubscription,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      createdBy: tenant.created_by,
      isActive: tenant.is_active,
      isTrial: tenant.is_trial,
      isolationStrategy: tenant.isolation_strategy as "shared_schema" | "separate_schema" | "separate_database",
      usage: tenant.usage as unknown as Tenant["usage"],
    }
  } catch (error) {
    console.error("Error fetching tenant by ID:", error)
    return null
  }
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    const { data: tenant, error } = await supabase.from("tenants").select("*").eq("slug", slug).single()

    if (error || !tenant) return null

    // Convert snake_case to camelCase and proper types
    return {
      id: tenant.id,
      slug: tenant.slug,
      settings: tenant.settings as unknown as TenantSettings,
      branding: tenant.branding as unknown as TenantBranding,
      features: tenant.features as unknown as TenantFeatures,
      subscription: tenant.subscription as unknown as TenantSubscription,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      createdBy: tenant.created_by,
      isActive: tenant.is_active,
      isTrial: tenant.is_trial,
      isolationStrategy: tenant.isolation_strategy as "shared_schema" | "separate_schema" | "separate_database",
      usage: tenant.usage as unknown as Tenant["usage"],
    }
  } catch (error) {
    console.error("Error fetching tenant by slug:", error)
    return null
  }
}

/**
 * Get all tenants (for super admin)
 */
export async function getAllTenants(): Promise<Tenant[]> {
  try {
    const supabase = await createClient()
    const { data: tenants, error } = await supabase.from("tenants").select("*")

    if (error || !tenants) return []

    // Convert snake_case to camelCase and proper types
    return tenants.map((tenant: any) => ({
      id: tenant.id,
      slug: tenant.slug,
      settings: tenant.settings as unknown as TenantSettings,
      branding: tenant.branding as unknown as TenantBranding,
      features: tenant.features as unknown as TenantFeatures,
      subscription: tenant.subscription as unknown as TenantSubscription,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      createdBy: tenant.created_by,
      isActive: tenant.is_active,
      isTrial: tenant.is_trial,
      isolationStrategy: tenant.isolation_strategy as "shared_schema" | "separate_schema" | "separate_database",
      usage: tenant.usage as unknown as Tenant["usage"],
    }))
  } catch (error) {
    console.error("Error fetching all tenants:", error)
    return []
  }
}

/**
 * Get active tenants only
 */
export async function getActiveTenants(): Promise<Tenant[]> {
  try {
    const supabase = await createClient()
    const { data: tenants, error } = await supabase.from("tenants").select("*").eq("is_active", true)

    if (error || !tenants) return []

    // Convert snake_case to camelCase and proper types
    return tenants.map((tenant: any) => ({
      id: tenant.id,
      slug: tenant.slug,
      settings: tenant.settings as unknown as TenantSettings,
      branding: tenant.branding as unknown as TenantBranding,
      features: tenant.features as unknown as TenantFeatures,
      subscription: tenant.subscription as unknown as TenantSubscription,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      createdBy: tenant.created_by,
      isActive: tenant.is_active,
      isTrial: tenant.is_trial,
      isolationStrategy: tenant.isolation_strategy as "shared_schema" | "separate_schema" | "separate_database",
      usage: tenant.usage as unknown as Tenant["usage"],
    }))
  } catch (error) {
    console.error("Error fetching active tenants:", error)
    return []
  }
}

/**
 * Create new tenant
 */
export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  try {
    // Check if slug already exists
    const existing = await getTenantBySlug(input.slug)
    if (existing) {
      throw new Error(`Tenant with slug '${input.slug}' already exists`)
    }

    const tenantId = `tenant_${Date.now()}`
    const features = {
      ...(PLAN_FEATURES[input.plan] as TenantFeatures),
      ...input.customFeatures,
    }

    // Determine subscription amount based on plan
    let subscriptionAmount = 29900 // enterprise default
    if (input.plan === "starter") {
      subscriptionAmount = 2900
    } else if (input.plan === "professional") {
      subscriptionAmount = 9900
    }

    const supabase = await createClient()

    const { data: tenant, error } = await supabase
      .from("tenants")
      .insert({
        id: tenantId,
        slug: input.slug,
        settings: {
          clinicName: input.clinicName,
          clinicType: "aesthetic_clinic",
          email: input.email,
          phone: input.phone,
          address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Thailand",
          },
          timezone: "Asia/Bangkok",
          businessHours: {
            monday: { open: "09:00", close: "18:00", closed: false },
            tuesday: { open: "09:00", close: "18:00", closed: false },
            wednesday: { open: "09:00", close: "18:00", closed: false },
            thursday: { open: "09:00", close: "18:00", closed: false },
            friday: { open: "09:00", close: "18:00", closed: false },
            saturday: { open: "10:00", close: "16:00", closed: false },
            sunday: { open: "00:00", close: "00:00", closed: true },
          },
          defaultLanguage: "th",
          supportedLanguages: ["th", "en"],
          currency: "THB",
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
        },
        branding: {
          primaryColor: "#8B5CF6",
          secondaryColor: "#EC4899",
          ...input.branding,
        },
        features,
        subscription: {
          plan: input.plan,
          status: input.plan === "starter" ? "trial" : "active",
          startDate: new Date(),
          endDate: input.plan === "starter" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
          billingCycle: "monthly",
          amount: subscriptionAmount,
          currency: "THB",
        },
        created_by: input.ownerId,
        is_active: true,
        is_trial: input.plan === "starter",
        isolation_strategy: "shared_schema",
        usage: {
          currentUsers: 1,
          currentCustomers: 0,
          storageUsedGB: 0,
          apiCallsThisMonth: 0,
        },
      })
      .select()
      .single()

    if (error || !tenant) {
      throw new Error(error?.message || "Failed to create tenant")
    }

    // Convert snake_case to camelCase and proper types
    return {
      id: tenant.id,
      slug: tenant.slug,
      settings: tenant.settings as unknown as TenantSettings,
      branding: tenant.branding as unknown as TenantBranding,
      features: tenant.features as unknown as TenantFeatures,
      subscription: tenant.subscription as unknown as TenantSubscription,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      createdBy: tenant.created_by,
      isActive: tenant.is_active,
      isTrial: tenant.is_trial,
      isolationStrategy: tenant.isolation_strategy as "shared_schema" | "separate_schema" | "separate_database",
      usage: tenant.usage as unknown as Tenant["usage"],
    }
  } catch (error) {
    console.error("Error creating tenant:", error)
    throw error
  }
}

/**
 * Update tenant
 */
export async function updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  try {
    const supabase = await createClient()

    // Prepare update data - convert camelCase to snake_case
    const updateData: any = {}

    if (updates.slug) updateData.slug = updates.slug
    if (updates.settings) updateData.settings = updates.settings
    if (updates.branding) updateData.branding = updates.branding
    if (updates.features) updateData.features = updates.features
    if (updates.subscription) updateData.subscription = updates.subscription
    if (updates.usage) updateData.usage = updates.usage
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.isTrial !== undefined) updateData.is_trial = updates.isTrial
    if (updates.isolationStrategy) updateData.isolation_strategy = updates.isolationStrategy

    const { data: updatedTenant, error } = await supabase
      .from("tenants")
      .update(updateData)
      .eq("id", tenantId)
      .select()
      .single()

    if (error || !updatedTenant) return null

    // Convert snake_case to camelCase and proper types
    return {
      id: updatedTenant.id,
      slug: updatedTenant.slug,
      settings: updatedTenant.settings as unknown as TenantSettings,
      branding: updatedTenant.branding as unknown as TenantBranding,
      features: updatedTenant.features as unknown as TenantFeatures,
      subscription: updatedTenant.subscription as unknown as TenantSubscription,
      createdAt: updatedTenant.created_at,
      updatedAt: updatedTenant.updated_at,
      createdBy: updatedTenant.created_by,
      isActive: updatedTenant.is_active,
      isTrial: updatedTenant.is_trial,
      isolationStrategy: updatedTenant.isolation_strategy as "shared_schema" | "separate_schema" | "separate_database",
      usage: updatedTenant.usage as unknown as Tenant["usage"],
    }
  } catch (error) {
    console.error("Error updating tenant:", error)
    return null
  }
}

/**
 * Delete tenant (soft delete - set isActive to false)
 */
export async function deleteTenant(tenantId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("tenants").update({ is_active: false }).eq("id", tenantId)

    return !error
  } catch (error) {
    console.error("Error deleting tenant:", error)
    return false
  }
}

/**
 * Check if tenant has feature enabled
 */
export function hasFeature(tenant: Tenant, feature: keyof TenantFeatures): boolean {
  return !!tenant.features[feature]
}

/**
 * Check if tenant has reached usage limit
 */
export function checkUsageLimit(
  tenant: Tenant,
  limitType: "users" | "customers" | "storage",
): { withinLimit: boolean; current: number; max: number; percentage: number } {
  let current = 0
  let max = 0

  switch (limitType) {
    case "users":
      current = tenant.usage.currentUsers
      max = tenant.features.maxUsers
      break
    case "customers":
      current = tenant.usage.currentCustomers
      max = tenant.features.maxCustomersPerMonth
      break
    case "storage":
      current = tenant.usage.storageUsedGB
      max = tenant.features.maxStorageGB
      break
  }

  // -1 means unlimited
  if (max === -1) {
    return { withinLimit: true, current, max: -1, percentage: 0 }
  }

  const percentage = (current / max) * 100
  const withinLimit = current < max

  return { withinLimit, current, max, percentage }
}

/**
 * Update tenant usage
 */
export async function updateTenantUsage(
  tenantId: string,
  usageType: "users" | "customers" | "storage" | "apiCalls",
  value: number,
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // First get current tenant to read existing usage
    const { data: tenant, error: fetchError } = await supabase
      .from("tenants")
      .select("usage")
      .eq("id", tenantId)
      .single()

    if (fetchError || !tenant) {
      console.error("Tenant not found for usage update:", tenantId)
      return false
    }

    const currentUsage = tenant.usage as unknown as Tenant["usage"]
    const updatedUsage = { ...currentUsage }

    switch (usageType) {
      case "users":
        updatedUsage.currentUsers = value
        break
      case "customers":
        updatedUsage.currentCustomers = value
        break
      case "storage":
        updatedUsage.storageUsedGB = value
        break
      case "apiCalls":
        updatedUsage.apiCallsThisMonth = value
        break
    }

    const { error: updateError } = await supabase.from("tenants").update({ usage: updatedUsage }).eq("id", tenantId)

    return !updateError
  } catch (error) {
    console.error("Error updating tenant usage:", error)
    return false
  }
}
