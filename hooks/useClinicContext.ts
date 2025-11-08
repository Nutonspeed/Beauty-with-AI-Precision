/**
 * Clinic Context Hook
 * 
 * Purpose: Manage clinic-specific context and permissions
 * Features:
 * - Clinic data access
 * - Permission checking with clinic scope
 * - Clinic statistics
 * - Staff management helpers
 */

'use client';

import { useAuth } from './useAuth';
import { type Clinic } from '@/types/multi-tenant';

// ============================================================================
// useClinicContext Hook
// ============================================================================

/**
 * Get clinic context with permission helpers
 */
export function useClinicContext() {
  const { user, permissionContext } = useAuth();
  
  const clinic = user?.clinic;
  const clinicId = user?.clinic_id;
  const branchId = user?.branch_id;
  
  /**
   * Check if user can access specific clinic
   */
  function canAccessClinic(targetClinicId: string): boolean {
    if (!user) return false;
    
    // Super admin can access all clinics
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Must be in same clinic
    return clinicId === targetClinicId;
  }
  
  /**
   * Check if user can manage clinic
   */
  function canManageClinic(targetClinicId?: string): boolean {
    if (!user) return false;
    
    // Super admin can manage all
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Owner/Admin can manage own clinic
    if (user.role === 'clinic_owner' || user.role === 'clinic_admin') {
      if (!targetClinicId) return true;
      return clinicId === targetClinicId;
    }
    
    return false;
  }
  
  /**
   * Check if user can manage staff in clinic
   */
  function canManageStaff(targetClinicId?: string): boolean {
    if (!user) return false;
    
    // Super admin can manage all
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Owner/Admin can manage staff in own clinic
    if (user.role === 'clinic_owner' || user.role === 'clinic_admin') {
      if (!targetClinicId) return true;
      return clinicId === targetClinicId;
    }
    
    return false;
  }
  
  /**
   * Check if user can view analytics
   */
  function canViewAnalytics(scope: 'own' | 'clinic' | 'all' = 'own'): boolean {
    if (!user) return false;
    
    // Super admin can view all
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Owner/Admin can view clinic analytics
    if (scope === 'clinic') {
      return ['clinic_owner', 'clinic_admin'].includes(user.role);
    }
    
    // Sales staff can only view own
    if (scope === 'own') {
      return ['sales_staff', 'clinic_staff', 'clinic_admin', 'clinic_owner'].includes(user.role);
    }
    
    // Only super admin can view all
    if (scope === 'all') {
      return user.role === 'super_admin';
    }
    
    return false;
  }
  
  /**
   * Check if user can assign leads
   */
  function canAssignLeads(): boolean {
    if (!user) return false;
    
    return ['super_admin', 'clinic_owner', 'clinic_admin'].includes(user.role);
  }
  
  /**
   * Check if current clinic has feature enabled
   */
  function hasFeature(feature: string): boolean {
    if (!clinic) return false;
    
    const features = clinic.features_enabled as Record<string, boolean> | undefined;
    if (!features) return false;
    
    return features[feature] === true;
  }
  
  /**
   * Get subscription tier info
   */
  function getSubscriptionInfo() {
    if (!clinic) return null;
    
    return {
      tier: clinic.subscription_tier,
      maxSalesStaff: clinic.max_sales_staff,
      maxAnalysesPerMonth: clinic.max_analyses_per_month,
      isActive: clinic.is_active,
    };
  }
  
  /**
   * Check if user is in clinic
   */
  function isInClinic(): boolean {
    return !!clinicId;
  }
  
  /**
   * Check if user is clinic staff member
   */
  function isClinicStaff(): boolean {
    if (!user) return false;
    return ['clinic_staff', 'clinic_admin', 'clinic_owner', 'sales_staff'].includes(user.role);
  }
  
  return {
    // Data
    clinic,
    clinicId,
    branchId,
    user,
    permissionContext,
    
    // Permission checks
    canAccessClinic,
    canManageClinic,
    canManageStaff,
    canViewAnalytics,
    canAssignLeads,
    
    // Features
    hasFeature,
    getSubscriptionInfo,
    
    // Status checks
    isInClinic,
    isClinicStaff,
  };
}

// ============================================================================
// useClinicPermissions Hook
// ============================================================================

/**
 * Simplified permission checker for clinic context
 */
export function useClinicPermissions() {
  const {
    canAccessClinic,
    canManageClinic,
    canManageStaff,
    canViewAnalytics,
    canAssignLeads,
  } = useClinicContext();
  
  return {
    canAccess: canAccessClinic,
    canManage: canManageClinic,
    canManageStaff,
    canViewAnalytics,
    canAssignLeads,
  };
}

// ============================================================================
// useClinicFeatures Hook
// ============================================================================

/**
 * Get clinic features availability
 */
export function useClinicFeatures() {
  const { clinic, hasFeature } = useClinicContext();
  
  if (!clinic) {
    return {
      offlineMode: false,
      crmIntegration: false,
      analytics: false,
      hasFeature,
    };
  }
  
  return {
    offlineMode: hasFeature('offline_mode'),
    crmIntegration: hasFeature('crm_integration'),
    analytics: hasFeature('analytics'),
    hasFeature,
  };
}

// ============================================================================
// useClinicStats Hook
// ============================================================================

/**
 * Get clinic statistics (requires API call)
 */
export function useClinicStats() {
  const { clinicId, canViewAnalytics } = useClinicContext();
  
  // This would typically fetch from API
  // For now, return helper function
  
  async function fetchStats() {
    if (!clinicId || !canViewAnalytics('clinic')) {
      throw new Error('Unauthorized to view clinic statistics');
    }
    
    const response = await fetch(`/api/clinics/${clinicId}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch clinic statistics');
    }
    
    return response.json();
  }
  
  return {
    fetchStats,
  };
}

// ============================================================================
// Export Everything
// ============================================================================

export {
  type Clinic,
};
