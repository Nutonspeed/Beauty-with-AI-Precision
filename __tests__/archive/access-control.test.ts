/**
 * Access Control System Tests
 * Tests for Role-Based Access Control (RBAC) and Feature Flags
 */

import { describe, it, expect } from 'vitest'
import { UserRole, Permission, AnalysisTier, hasPermission, hasTierFeature, getRoleLevel, isRoleHigherThan } from '@/lib/auth/roles'
import { canAccessPage, canUseFeature, hasRole, getDefaultRedirectPath, getDefaultTierForRole, canUseTier } from '@/lib/auth/permissions'
import { isFeatureEnabled, isFeatureEnabledForTier, isFeatureEnabledForRole, getEnabledFeaturesForTier, getPremiumFeatures } from '@/lib/features/flags'

describe('Role-Based Access Control (RBAC)', () => {
  describe('hasPermission', () => {
    it('should allow public to view public pages', () => {
      expect(hasPermission(UserRole.PUBLIC, Permission.VIEW_PUBLIC_PAGES)).toBe(true)
    })

    it('should allow free user to do basic analysis', () => {
      expect(hasPermission(UserRole.FREE_USER, Permission.BASIC_ANALYSIS)).toBe(true)
    })

    it('should allow premium customer to use AR simulator', () => {
      expect(hasPermission(UserRole.PREMIUM_CUSTOMER, Permission.USE_AR_SIMULATOR)).toBe(true)
    })

    it('should NOT allow free user to use AR simulator', () => {
      expect(hasPermission(UserRole.FREE_USER, Permission.USE_AR_SIMULATOR)).toBe(false)
    })

    it('should allow clinic staff to view clinic dashboard', () => {
      expect(hasPermission(UserRole.CLINIC_STAFF, Permission.VIEW_CLINIC_DASHBOARD)).toBe(true)
    })

    it('should NOT allow clinic staff to manage clinic settings', () => {
      expect(hasPermission(UserRole.CLINIC_STAFF, Permission.MANAGE_CLINIC_SETTINGS)).toBe(false)
    })

    it('should allow clinic admin to manage clinic settings', () => {
      expect(hasPermission(UserRole.CLINIC_ADMIN, Permission.MANAGE_CLINIC_SETTINGS)).toBe(true)
    })

    it('should allow sales staff to view sales dashboard', () => {
      expect(hasPermission(UserRole.SALES_STAFF, Permission.VIEW_SALES_DASHBOARD)).toBe(true)
    })

    it('should allow super admin to have all permissions', () => {
      expect(hasPermission(UserRole.SUPER_ADMIN, Permission.VIEW_ADMIN_DASHBOARD)).toBe(true)
      expect(hasPermission(UserRole.SUPER_ADMIN, Permission.MANAGE_ALL_USERS)).toBe(true)
      expect(hasPermission(UserRole.SUPER_ADMIN, Permission.IMPERSONATE_USERS)).toBe(true)
    })
  })

  describe('hasTierFeature', () => {
    it('should allow free tier to use browser AI', () => {
      expect(hasTierFeature(AnalysisTier.FREE, 'browser_ai')).toBe(true)
    })

    it('should NOT allow free tier to use AR simulator', () => {
      expect(hasTierFeature(AnalysisTier.FREE, 'ar_simulator')).toBe(false)
    })

    it('should allow premium tier to use AR simulator', () => {
      expect(hasTierFeature(AnalysisTier.PREMIUM, 'ar_simulator')).toBe(true)
    })

    it('should allow clinical tier to use VISIA equivalent', () => {
      expect(hasTierFeature(AnalysisTier.CLINICAL, 'visia_equivalent')).toBe(true)
    })
  })

  describe('getRoleLevel', () => {
    it('should return correct hierarchy levels', () => {
      expect(getRoleLevel(UserRole.PUBLIC)).toBe(0)
      expect(getRoleLevel(UserRole.FREE_USER)).toBe(1)
      expect(getRoleLevel(UserRole.PREMIUM_CUSTOMER)).toBe(2)
      expect(getRoleLevel(UserRole.CLINIC_STAFF)).toBe(3)
      expect(getRoleLevel(UserRole.CLINIC_ADMIN)).toBe(4)
      expect(getRoleLevel(UserRole.SUPER_ADMIN)).toBe(5)
    })

    it('should show super admin has highest level', () => {
      expect(isRoleHigherThan(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN)).toBe(true)
      expect(isRoleHigherThan(UserRole.CLINIC_ADMIN, UserRole.CLINIC_STAFF)).toBe(true)
      expect(isRoleHigherThan(UserRole.PREMIUM_CUSTOMER, UserRole.FREE_USER)).toBe(true)
    })
  })
})

describe('Permission Helper Functions', () => {
  describe('canAccessPage', () => {
    it('should allow public to access public pages', () => {
      expect(canAccessPage('/', UserRole.PUBLIC)).toBe(true)
      expect(canAccessPage('/about', UserRole.PUBLIC)).toBe(true)
      expect(canAccessPage('/pricing', UserRole.PUBLIC)).toBe(true)
      expect(canAccessPage('/analysis', UserRole.PUBLIC)).toBe(true)
    })

    it('should NOT allow public to access authenticated pages', () => {
      expect(canAccessPage('/profile', UserRole.PUBLIC)).toBe(false)
      expect(canAccessPage('/analysis/results', UserRole.PUBLIC)).toBe(false)
    })

    it('should allow free user to access authenticated pages', () => {
      expect(canAccessPage('/profile', UserRole.FREE_USER)).toBe(true)
      expect(canAccessPage('/analysis/results', UserRole.FREE_USER)).toBe(true)
    })

    it('should NOT allow free user to access premium pages', () => {
      expect(canAccessPage('/ar-simulator', UserRole.FREE_USER)).toBe(false)
      expect(canAccessPage('/treatment-plans', UserRole.FREE_USER)).toBe(false)
    })

    it('should allow premium customer to access premium pages', () => {
      expect(canAccessPage('/ar-simulator', UserRole.PREMIUM_CUSTOMER)).toBe(true)
      expect(canAccessPage('/treatment-plans', UserRole.PREMIUM_CUSTOMER)).toBe(true)
    })

    it('should NOT allow premium customer to access clinic pages', () => {
      expect(canAccessPage('/clinic/dashboard', UserRole.PREMIUM_CUSTOMER)).toBe(false)
    })

    it('should allow clinic staff to access clinic pages', () => {
      expect(canAccessPage('/clinic/dashboard', UserRole.CLINIC_STAFF)).toBe(true)
      expect(canAccessPage('/clinic/customers', UserRole.CLINIC_STAFF)).toBe(true)
    })

    it('should NOT allow clinic staff to access admin pages', () => {
      expect(canAccessPage('/admin/dashboard', UserRole.CLINIC_STAFF)).toBe(false)
    })

    it('should allow super admin to access all pages', () => {
      expect(canAccessPage('/admin/dashboard', UserRole.SUPER_ADMIN)).toBe(true)
      expect(canAccessPage('/clinic/dashboard', UserRole.SUPER_ADMIN)).toBe(true)
      expect(canAccessPage('/sales/dashboard', UserRole.SUPER_ADMIN)).toBe(true)
    })
  })

  describe('canUseFeature', () => {
    it('should allow premium customer to use AR simulator', () => {
      expect(canUseFeature('ar-simulator', UserRole.PREMIUM_CUSTOMER, AnalysisTier.PREMIUM)).toBe(true)
    })

    it('should NOT allow free user to use AR simulator', () => {
      expect(canUseFeature('ar-simulator', UserRole.FREE_USER, AnalysisTier.FREE)).toBe(false)
    })

    it('should allow premium customer to use heatmap', () => {
      expect(canUseFeature('heatmap', UserRole.PREMIUM_CUSTOMER, AnalysisTier.PREMIUM)).toBe(true)
    })

    it('should allow clinic staff to use batch analysis', () => {
      expect(canUseFeature('batch_analysis', UserRole.CLINIC_STAFF, AnalysisTier.CLINICAL)).toBe(true)
    })
  })

  describe('hasRole', () => {
    it('should match exact role', () => {
      expect(hasRole(UserRole.FREE_USER, UserRole.FREE_USER)).toBe(true)
      expect(hasRole(UserRole.CLINIC_STAFF, UserRole.CLINIC_STAFF)).toBe(true)
    })

    it('should recognize role inheritance', () => {
      expect(hasRole(UserRole.PREMIUM_CUSTOMER, UserRole.FREE_USER)).toBe(true)
      expect(hasRole(UserRole.CLINIC_ADMIN, UserRole.CLINIC_STAFF)).toBe(true)
    })

    it('should allow super admin to have all roles', () => {
      expect(hasRole(UserRole.SUPER_ADMIN, UserRole.FREE_USER)).toBe(true)
      expect(hasRole(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN)).toBe(true)
      expect(hasRole(UserRole.SUPER_ADMIN, UserRole.SALES_STAFF)).toBe(true)
    })
  })

  describe('getDefaultRedirectPath', () => {
    it('should redirect users to correct default pages', () => {
      expect(getDefaultRedirectPath(UserRole.PUBLIC)).toBe('/')
      expect(getDefaultRedirectPath(UserRole.FREE_USER)).toBe('/analysis')
      expect(getDefaultRedirectPath(UserRole.PREMIUM_CUSTOMER)).toBe('/analysis')
      expect(getDefaultRedirectPath(UserRole.CLINIC_STAFF)).toBe('/clinic/dashboard')
      expect(getDefaultRedirectPath(UserRole.CLINIC_ADMIN)).toBe('/clinic/dashboard')
      expect(getDefaultRedirectPath(UserRole.SALES_STAFF)).toBe('/sales/dashboard')
      expect(getDefaultRedirectPath(UserRole.SUPER_ADMIN)).toBe('/admin/dashboard')
    })
  })

  describe('getDefaultTierForRole', () => {
    it('should return correct default tiers', () => {
      expect(getDefaultTierForRole(UserRole.PUBLIC)).toBe(AnalysisTier.FREE)
      expect(getDefaultTierForRole(UserRole.FREE_USER)).toBe(AnalysisTier.FREE)
      expect(getDefaultTierForRole(UserRole.PREMIUM_CUSTOMER)).toBe(AnalysisTier.PREMIUM)
      expect(getDefaultTierForRole(UserRole.CLINIC_STAFF)).toBe(AnalysisTier.CLINICAL)
      expect(getDefaultTierForRole(UserRole.CLINIC_ADMIN)).toBe(AnalysisTier.CLINICAL)
    })
  })

  describe('canUseTier', () => {
    it('should allow everyone to use free tier', () => {
      expect(canUseTier(UserRole.PUBLIC, AnalysisTier.FREE)).toBe(true)
      expect(canUseTier(UserRole.FREE_USER, AnalysisTier.FREE)).toBe(true)
      expect(canUseTier(UserRole.PREMIUM_CUSTOMER, AnalysisTier.FREE)).toBe(true)
    })

    it('should allow premium customer to use premium tier', () => {
      expect(canUseTier(UserRole.PREMIUM_CUSTOMER, AnalysisTier.PREMIUM)).toBe(true)
    })

    it('should NOT allow free user to use premium tier', () => {
      expect(canUseTier(UserRole.FREE_USER, AnalysisTier.PREMIUM)).toBe(false)
    })

    it('should allow clinic staff to use clinical tier', () => {
      expect(canUseTier(UserRole.CLINIC_STAFF, AnalysisTier.CLINICAL)).toBe(true)
      expect(canUseTier(UserRole.CLINIC_ADMIN, AnalysisTier.CLINICAL)).toBe(true)
    })

    it('should NOT allow free user to use clinical tier', () => {
      expect(canUseTier(UserRole.FREE_USER, AnalysisTier.CLINICAL)).toBe(false)
    })
  })
})

describe('Feature Flags System', () => {
  describe('isFeatureEnabledForTier', () => {
    it('should enable browser AI for all tiers', () => {
      expect(isFeatureEnabledForTier('BROWSER_AI', AnalysisTier.FREE)).toBe(true)
      expect(isFeatureEnabledForTier('BROWSER_AI', AnalysisTier.PREMIUM)).toBe(true)
      expect(isFeatureEnabledForTier('BROWSER_AI', AnalysisTier.CLINICAL)).toBe(true)
    })

    it('should NOT enable cloud AI for free tier', () => {
      expect(isFeatureEnabledForTier('CLOUD_AI', AnalysisTier.FREE)).toBe(false)
    })

    it('should enable AR simulator for premium and clinical', () => {
      expect(isFeatureEnabledForTier('AR_SIMULATOR', AnalysisTier.PREMIUM)).toBe(true)
      expect(isFeatureEnabledForTier('AR_SIMULATOR', AnalysisTier.CLINICAL)).toBe(true)
    })

    it('should enable UV imaging only for clinical', () => {
      expect(isFeatureEnabledForTier('UV_IMAGING', AnalysisTier.CLINICAL)).toBe(true)
      expect(isFeatureEnabledForTier('UV_IMAGING', AnalysisTier.PREMIUM)).toBe(false)
    })
  })

  describe('isFeatureEnabledForRole', () => {
    it('should allow all roles to use basic features', () => {
      expect(isFeatureEnabledForRole('BROWSER_AI', UserRole.PUBLIC)).toBe(true)
      expect(isFeatureEnabledForRole('BROWSER_AI', UserRole.FREE_USER)).toBe(true)
    })

    it('should restrict UV imaging to clinic roles', () => {
      expect(isFeatureEnabledForRole('UV_IMAGING', UserRole.CLINIC_STAFF)).toBe(true)
      expect(isFeatureEnabledForRole('UV_IMAGING', UserRole.PREMIUM_CUSTOMER)).toBe(false)
    })

    it('should allow super admin to access all features', () => {
      expect(isFeatureEnabledForRole('UV_IMAGING', UserRole.SUPER_ADMIN)).toBe(true)
      expect(isFeatureEnabledForRole('API_ACCESS', UserRole.SUPER_ADMIN)).toBe(true)
    })
  })

  describe('isFeatureEnabled', () => {
    it('should combine tier and role checks correctly', () => {
      // Premium customer can use AR simulator with premium tier
      expect(isFeatureEnabled('AR_SIMULATOR', AnalysisTier.PREMIUM, UserRole.PREMIUM_CUSTOMER)).toBe(true)
      
      // Free user cannot use AR simulator even if somehow has premium tier
      expect(isFeatureEnabled('AR_SIMULATOR', AnalysisTier.PREMIUM, UserRole.FREE_USER)).toBe(false)
      
      // Clinic staff can use UV imaging with clinical tier
      expect(isFeatureEnabled('UV_IMAGING', AnalysisTier.CLINICAL, UserRole.CLINIC_STAFF)).toBe(true)
      
      // Premium customer cannot use UV imaging even with clinical tier (role restriction)
      expect(isFeatureEnabled('UV_IMAGING', AnalysisTier.CLINICAL, UserRole.PREMIUM_CUSTOMER)).toBe(false)
    })
  })

  describe('getEnabledFeaturesForTier', () => {
    it('should return correct number of features for each tier', () => {
      const freeFeatures = getEnabledFeaturesForTier(AnalysisTier.FREE)
      const premiumFeatures = getEnabledFeaturesForTier(AnalysisTier.PREMIUM)
      const clinicalFeatures = getEnabledFeaturesForTier(AnalysisTier.CLINICAL)

      // Free tier should have fewer features
      expect(freeFeatures.length).toBeGreaterThan(0)
      
      // Premium should have more features than free
      expect(premiumFeatures.length).toBeGreaterThan(freeFeatures.length)
      
      // Clinical should have most features
      expect(clinicalFeatures.length).toBeGreaterThan(premiumFeatures.length)
    })
  })

  describe('getPremiumFeatures', () => {
    it('should return only features that require premium', () => {
      const premiumFeatures = getPremiumFeatures()
      
      expect(premiumFeatures.length).toBeGreaterThan(0)
      expect(premiumFeatures.every(f => f.requiresPremium)).toBe(true)
    })
  })
})

describe('Security Tests', () => {
  it('should NOT allow privilege escalation', () => {
    // Free user should not inherit premium permissions
    expect(hasPermission(UserRole.FREE_USER, Permission.USE_AR_SIMULATOR)).toBe(false)
    
    // Clinic staff should not have admin permissions
    expect(hasPermission(UserRole.CLINIC_STAFF, Permission.MANAGE_CLINIC_SETTINGS)).toBe(false)
    
    // Sales staff should not access clinic pages
    expect(canAccessPage('/clinic/dashboard', UserRole.SALES_STAFF)).toBe(false)
  })

  it('should properly enforce role hierarchy', () => {
    // Lower roles should not be able to access higher role features
    expect(canAccessPage('/admin/dashboard', UserRole.CLINIC_ADMIN)).toBe(false)
    expect(canAccessPage('/clinic/dashboard', UserRole.SALES_STAFF)).toBe(false)
    expect(canAccessPage('/ar-simulator', UserRole.FREE_USER)).toBe(false)
  })

  it('should prevent tier bypassing', () => {
    // Even if a free user somehow has premium tier (shouldn't happen), 
    // role permissions should still prevent access
    expect(canUseFeature('ar-simulator', UserRole.FREE_USER, AnalysisTier.PREMIUM)).toBe(false)
  })
})
