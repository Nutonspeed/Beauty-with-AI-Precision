/**
 * Tenant Context Provider
 * React Context for managing current tenant in the application
 */

'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import type { Tenant } from '../types/tenant'

interface TenantContextValue {
  tenant: Tenant | null
  setTenant: (tenant: Tenant | null) => void
  isLoading: boolean
  error: string | null
  switchTenant: (tenantId: string) => Promise<void>
  hasFeature: (feature: string) => boolean
  canAccessFeature: (feature: string) => { allowed: boolean; reason?: string }
}

const TenantContextInstance = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tenant on mount (from session or subdomain)
  useEffect(() => {
    async function loadTenant() {
      try {
        setIsLoading(true)
        setError(null)

        // Try to get tenant from session storage first
        const storedTenantId = globalThis.sessionStorage?.getItem('currentTenantId')
        if (storedTenantId) {
          const response = await fetch(`/api/tenant/${storedTenantId}`)
          if (response.ok) {
            const data = await response.json()
            setTenant(data.tenant)
          }
        }

        // Subdomain-based tenant resolution will be implemented when custom domains are configured
        // Extract subdomain from window.location.hostname
        // e.g., beauty-clinic.ai367bar.com -> beauty-clinic

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenant')
        console.error('Failed to load tenant:', err)
      } finally {
        setIsLoading(false)
      }
    }

    void loadTenant()
  }, [])

  const switchTenant = useCallback(async (tenantId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/tenant/${tenantId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tenant')
      }

      const data = await response.json()
      setTenant(data.tenant)

      // Store in session
      globalThis.sessionStorage?.setItem('currentTenantId', tenantId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch tenant')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const hasFeature = useCallback(
    (feature: string) => {
      if (!tenant) return false
      const features = tenant.features as unknown as Record<string, unknown>
      return !!features[feature]
    },
    [tenant]
  )

  const canAccessFeature = useCallback(
    (feature: string): { allowed: boolean; reason?: string } => {
      if (!tenant) {
        return { allowed: false, reason: 'No tenant context' }
      }

      if (!tenant.isActive) {
        return { allowed: false, reason: 'Tenant is not active' }
      }

      if (tenant.subscription.status === 'suspended') {
        return { allowed: false, reason: 'Subscription is suspended' }
      }

      if (tenant.subscription.status === 'cancelled') {
        return { allowed: false, reason: 'Subscription is cancelled' }
      }

      if (!hasFeature(feature)) {
        return {
          allowed: false,
          reason: `Feature '${feature}' is not available in ${tenant.subscription.plan} plan`,
        }
      }

      // Check if trial expired
      if (tenant.isTrial && tenant.subscription.endDate) {
        if (new Date() > new Date(tenant.subscription.endDate)) {
          return { allowed: false, reason: 'Trial period has expired' }
        }
      }

      return { allowed: true }
    },
    [tenant, hasFeature]
  )

  const contextValue = useMemo(
    () => ({
      tenant,
      setTenant,
      isLoading,
      error,
      switchTenant,
      hasFeature,
      canAccessFeature,
    }),
    [tenant, isLoading, error, switchTenant, hasFeature, canAccessFeature]
  )

  return (
    <TenantContextInstance.Provider value={contextValue}>
      {children}
    </TenantContextInstance.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContextInstance)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

// Helper hook for feature access
export function useFeature(feature: string) {
  const { hasFeature, canAccessFeature } = useTenant()
  
  return {
    enabled: hasFeature(feature),
    canAccess: canAccessFeature(feature),
  }
}
