/**
 * Tenant Management System
 * Core utilities for multi-tenant operations
 */

import type { Tenant, CreateTenantInput, TenantFeatures } from "../types/tenant"
import { PLAN_FEATURES } from "../types/tenant"
import { createClient } from "../supabase/server"
import { logger } from "@/lib/logger"

// Helper function to create default business hours
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

// Helper function to calculate subscription amount
function getSubscriptionAmount(tier: string): number {
  if (tier === "starter") return 2900
  if (tier === "professional") return 9900
  return 29900
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    const { data: clinic, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", tenantId)
      .single()

    if (error || !clinic) return null

    // Map clinics table to Tenant type (same as createTenant)
    const features = PLAN_FEATURES[clinic.subscription_tier as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter
    const subscriptionAmount = getSubscriptionAmount(clinic.subscription_tier)

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
        plan: clinic.subscription_tier,
        status: clinic.subscription_tier === "starter" ? "trial" : "active",
        startDate: new Date(),
        endDate: clinic.subscription_tier === "starter" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        billingCycle: "monthly",
        amount: subscriptionAmount,
        currency: "THB",
      },
      createdAt: clinic.created_at || new Date().toISOString(),
      updatedAt: clinic.updated_at || new Date().toISOString(),
      createdBy: "",
      isActive: clinic.is_active ?? true,
      isTrial: clinic.subscription_tier === "starter",
      isolationStrategy: "shared_schema",
      usage: { currentUsers: 1, currentCustomers: 0, storageUsedGB: 0, apiCallsThisMonth: 0 },
    }
  } catch (error) {
    logger.error("Error fetching tenant by ID", error as Error)
    return null
  }
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    const { data: clinic, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !clinic) return null

    // Map clinics table to Tenant type
    const features = PLAN_FEATURES[clinic.subscription_tier as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter
    const subscriptionAmount = getSubscriptionAmount(clinic.subscription_tier)

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
        plan: clinic.subscription_tier,
        status: clinic.subscription_tier === "starter" ? "trial" : "active",
        startDate: new Date(),
        endDate: clinic.subscription_tier === "starter" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        billingCycle: "monthly",
        amount: subscriptionAmount,
        currency: "THB",
      },
      createdAt: clinic.created_at || new Date().toISOString(),
      updatedAt: clinic.updated_at || new Date().toISOString(),
      createdBy: "",
      isActive: clinic.is_active ?? true,
      isTrial: clinic.subscription_tier === "starter",
      isolationStrategy: "shared_schema",
      usage: { currentUsers: 1, currentCustomers: 0, storageUsedGB: 0, apiCallsThisMonth: 0 },
    }
  } catch (error) {
    logger.error("Error fetching tenant by slug", error as Error)
    return null
  }
}

/**
 * Get all tenants (for super admin)
 */
export async function getAllTenants(): Promise<Tenant[]> {
  try {
    const supabase = await createClient()
    const { data: clinics, error } = await supabase.from("clinics").select("*")

    if (error || !clinics) return []

    // Map clinics table to Tenant type
    return clinics.map((clinic: any) => {
      const features = PLAN_FEATURES[clinic.subscription_tier as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter
      const subscriptionAmount = getSubscriptionAmount(clinic.subscription_tier)

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
          plan: clinic.subscription_tier,
          status: clinic.subscription_tier === "starter" ? "trial" : "active",
          startDate: new Date(),
          endDate: clinic.subscription_tier === "starter" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
          billingCycle: "monthly",
          amount: subscriptionAmount,
          currency: "THB",
        },
        createdAt: clinic.created_at || new Date().toISOString(),
        updatedAt: clinic.updated_at || new Date().toISOString(),
        createdBy: "",
        isActive: clinic.is_active ?? true,
        isTrial: clinic.subscription_tier === "starter",
        isolationStrategy: "shared_schema",
        usage: { currentUsers: 1, currentCustomers: 0, storageUsedGB: 0, apiCallsThisMonth: 0 },
      }
    })
  } catch (error) {
    logger.error("Error fetching all tenants", error as Error)
    return []
  }
}

/**
 * Get active tenants only
 */
export async function getActiveTenants(): Promise<Tenant[]> {
  try {
    const supabase = await createClient()
    const { data: clinics, error } = await supabase.from("clinics").select("*").eq("is_active", true)

    if (error || !clinics) return []

    // Map clinics table to Tenant type
    return clinics.map((clinic: any) => {
      const features = PLAN_FEATURES[clinic.subscription_tier as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter
      const subscriptionAmount = getSubscriptionAmount(clinic.subscription_tier)

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
          plan: clinic.subscription_tier,
          status: clinic.subscription_tier === "starter" ? "trial" : "active",
          startDate: new Date(),
          endDate: clinic.subscription_tier === "starter" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
          billingCycle: "monthly",
          amount: subscriptionAmount,
          currency: "THB",
        },
        createdAt: clinic.created_at || new Date().toISOString(),
        updatedAt: clinic.updated_at || new Date().toISOString(),
        createdBy: "",
        isActive: clinic.is_active ?? true,
        isTrial: clinic.subscription_tier === "starter",
        isolationStrategy: "shared_schema",
        usage: { currentUsers: 1, currentCustomers: 0, storageUsedGB: 0, apiCallsThisMonth: 0 },
      }
    })
  } catch (error) {
    logger.error("Error fetching active tenants", error as Error)
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

    const tenantId = crypto.randomUUID()
    const features = {
      ...(PLAN_FEATURES[input.plan] as TenantFeatures),
      ...input.customFeatures,
    }

    // Determine subscription amount based on plan
    const subscriptionAmount = getSubscriptionAmount(input.plan)

    const supabase = await createClient()

    // Insert into clinics table (using actual schema)
    const maxStaff = input.plan === "starter" ? 5 : input.plan === "professional" ? 15 : 50
    const maxAnalyses = input.plan === "starter" ? 100 : input.plan === "professional" ? 500 : 10000

    const { data: tenant, error } = await supabase
      .from("clinics")
      .insert({
        id: tenantId,
        slug: input.slug,
        name: input.clinicName,
        clinic_name: input.clinicName,
        email: input.email,
        phone: input.phone,
        subscription_tier: input.plan,
        max_sales_staff: maxStaff,
        max_analyses_per_month: maxAnalyses,
        is_active: true,
      })
      .select()
      .single()

    if (error || !tenant) {
      throw new Error(error?.message || "Failed to create tenant")
    }

    // Convert clinics table data to Tenant type
    // Note: clinics table doesn't have all fields, so we create defaults
    return {
      id: tenant.id,
      slug: tenant.slug,
      settings: {
        clinicName: tenant.name || tenant.clinic_name,
        clinicType: "aesthetic_clinic",
        email: tenant.email,
        phone: tenant.phone,
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Thailand",
        },
        timezone: "Asia/Bangkok",
        businessHours: getDefaultBusinessHours(),
        defaultLanguage: "th",
        supportedLanguages: ["th", "en"],
        currency: "THB",
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
      },
      branding: {
        primaryColor: input.branding?.primaryColor || "#8B5CF6",
        secondaryColor: input.branding?.secondaryColor || "#EC4899",
      },
      features: features,
      subscription: {
        plan: input.plan,
        status: input.plan === "starter" ? "trial" : "active",
        startDate: new Date(),
        endDate: input.plan === "starter" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        billingCycle: "monthly",
        amount: subscriptionAmount,
        currency: "THB",
      },
      createdAt: tenant.created_at || new Date().toISOString(),
      updatedAt: tenant.updated_at || new Date().toISOString(),
      createdBy: input.ownerId,
      isActive: tenant.is_active ?? true,
      isTrial: input.plan === "starter",
      isolationStrategy: "shared_schema",
      usage: {
        currentUsers: 1,
        currentCustomers: 0,
        storageUsedGB: 0,
        apiCallsThisMonth: 0,
      },
    }
  } catch (error) {
    logger.error("Error creating tenant", error as Error)
    throw error
  }
}

/**
 * Update tenant
 */
export async function updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  try {
    const supabase = await createClient()

    // Map Tenant updates to clinics table columns
    const updateData: any = {}

    if (updates.slug) updateData.slug = updates.slug
    if (updates.settings?.clinicName) updateData.name = updates.settings.clinicName
    if (updates.settings?.email) updateData.email = updates.settings.email
    if (updates.settings?.phone) updateData.phone = updates.settings.phone
    if (updates.subscription?.plan) updateData.subscription_tier = updates.subscription.plan
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      return getTenantById(tenantId)
    }

    const { data: updatedClinic, error } = await supabase
      .from("clinics")
      .update(updateData)
      .eq("id", tenantId)
      .select()
      .single()

    if (error || !updatedClinic) return null

    // Map back to Tenant type
    const features = PLAN_FEATURES[updatedClinic.subscription_tier as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter
    const subscriptionAmount = getSubscriptionAmount(updatedClinic.subscription_tier)

    return {
      id: updatedClinic.id,
      slug: updatedClinic.slug,
      settings: {
        clinicName: updatedClinic.name || updatedClinic.clinic_name,
        clinicType: "aesthetic_clinic",
        email: updatedClinic.email,
        phone: updatedClinic.phone,
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
        plan: updatedClinic.subscription_tier,
        status: updatedClinic.subscription_tier === "starter" ? "trial" : "active",
        startDate: new Date(),
        endDate: updatedClinic.subscription_tier === "starter" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        billingCycle: "monthly",
        amount: subscriptionAmount,
        currency: "THB",
      },
      createdAt: updatedClinic.created_at || new Date().toISOString(),
      updatedAt: updatedClinic.updated_at || new Date().toISOString(),
      createdBy: "",
      isActive: updatedClinic.is_active ?? true,
      isTrial: updatedClinic.subscription_tier === "starter",
      isolationStrategy: "shared_schema",
      usage: { currentUsers: 1, currentCustomers: 0, storageUsedGB: 0, apiCallsThisMonth: 0 },
    }
  } catch (error) {
    logger.error("Error updating tenant", error as Error)
    return null
  }
}

/**
 * Delete tenant (soft delete - set isActive to false)
 */
export async function deleteTenant(tenantId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("clinics").update({ is_active: false }).eq("id", tenantId)

    return !error
  } catch (error) {
    logger.error("Error deleting tenant", error as Error)
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
 * Tracks actual usage metrics for billing and analytics
 */
export async function updateTenantUsage(
  tenantId: string,
  usageType: "users" | "customers" | "storage" | "apiCalls",
  value: number,
): Promise<boolean> {
  try {
    // Get current tenant
    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      logger.warn(`Tenant ${tenantId} not found for usage update`);
      return false;
    }

    // Update usage based on type
    const updatedUsage = { ...tenant.usage };

    switch (usageType) {
      case "users":
        updatedUsage.currentUsers = Math.max(0, value);
        break;
      case "customers":
        updatedUsage.currentCustomers = Math.max(0, value);
        break;
      case "storage":
        updatedUsage.storageUsedGB = Math.max(0, value);
        break;
      case "apiCalls":
        updatedUsage.apiCallsThisMonth = Math.max(0, value);
        break;
    }

    // For now, store in memory (TODO: persist to database)
    // In production, this would update a usage_tracking table
    tenant.usage = updatedUsage;

    // Log usage update for analytics
    logger.info(`Updated tenant ${tenantId} usage`, {
      type: usageType,
      oldValue: tenant.usage[usageType === "users" ? "currentUsers" :
                           usageType === "customers" ? "currentCustomers" :
                           usageType === "storage" ? "storageUsedGB" : "apiCallsThisMonth"],
      newValue: value,
      tenantId,
    });

    return true;
  } catch (error) {
    logger.error("Error updating tenant usage", error as Error);
    return false;
  }
}
