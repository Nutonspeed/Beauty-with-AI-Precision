/**
 * Center Context Hook
 * 
 * Purpose: Manage center-specific context and permissions
 * Features:
 * - Center data access
 * - Permission checking with center scope
 * - Center statistics
 * - Staff management helpers
 */

'use client';

import { useAuth } from './useAuth';
import { type Center, type UserRole } from '@/types/multi-tenant';

// ============================================================================
// useCenterContext Hook
// ============================================================================

/**
 * Get center context with permission helpers
 */
export function useCenterContext() {
  const { user, permissionContext } = useAuth();
  
  const center = user?.center;
  const centerId = user?.center_id;
  const branchId = user?.branch_id;
  const role = user?.role as UserRole | undefined;
  
  /**
   * Check if user can access specific center
   */
  function canAccessCenter(targetCenterId: string): boolean {
    if (!user || !role) return false;
    
    // Super admin can access all centers
    if (role === 'super_admin') {
      return true;
    }
    
    // Must be in same center
    return centerId === targetCenterId;
  }
  
  /**
   * Check if user can manage center
   */
  function canManageCenter(targetCenterId?: string): boolean {
    if (!user || !role) return false;
    
    // Super admin can manage all
    if (role === 'super_admin') {
      return true;
    }
    
    // Owner/Admin can manage own center
    if (role === 'center_owner' || role === 'center_admin') {
      if (!targetCenterId) return true;
      return centerId === targetCenterId;
    }
    
    return false;
  }
  
  /**
   * Check if user can manage staff in center
   */
  function canManageStaff(targetCenterId?: string): boolean {
    if (!user || !role) return false;
    
    // Super admin can manage all
    if (role === 'super_admin') {
      return true;
    }
    
    // Owner/Admin can manage staff in own center
    if (role === 'center_owner' || role === 'center_admin') {
      if (!targetCenterId) return true;
      return centerId === targetCenterId;
    }
    
    return false;
  }
  
  /**
   * Check if user can view analytics
   */
  function canViewAnalytics(scope: 'own' | 'center' | 'all' = 'own'): boolean {
    if (!user || !role) return false;
    
    // Super admin can view all
    if (role === 'super_admin') {
      return true;
    }
    
    // Owner/Admin can view center analytics
    if (scope === 'center') {
      return ['center_owner', 'center_admin'].includes(role);
    }
    
    // Sales staff can only view own
    if (scope === 'own') {
      return ['sales_staff', 'center_staff', 'center_admin', 'center_owner'].includes(role);
    }
    
    // Only super admin can view all
    if (scope === 'all') {
      return false;
    }
    
    return false;
  }
  
  /**
   * Check if user can assign leads
   */
  function canAssignLeads(): boolean {
  if (!user || !role) return false;
    
  return ['super_admin', 'center_owner', 'center_admin'].includes(role);
  }
  
  /**
   * Check if current center has feature enabled
   */
  function hasFeature(feature: string): boolean {
    if (!center) return false;
    
    const features = center.features_enabled as Record<string, boolean> | undefined;
    if (!features) return false;
    
    return features[feature] === true;
  }
  
  /**
   * Get subscription tier info
   */
  function getSubscriptionInfo() {
    if (!center) return null;
    
    return {
      tier: center.subscription_tier,
      maxSalesStaff: center.max_sales_staff,
      maxAnalysesPerMonth: center.max_analyses_per_month,
      isActive: center.is_active,
    };
  }
  
  /**
   * Check if user is in center
   */
  function isInCenter(): boolean {
    return !!centerId;
  }
  
  /**
   * Check if user is center staff member
   */
  function isCenterStaff(): boolean {
    if (!user) return false;
    return ['center_staff', 'center_admin', 'center_owner', 'sales_staff'].includes(user.role);
  }
  
  return {
    // Data
    center,
    centerId,
    branchId,
    user,
    permissionContext,
    
    // Permission checks
    canAccessCenter,
    canManageCenter,
    canManageStaff,
    canViewAnalytics,
    canAssignLeads,
    
    // Features
    hasFeature,
    getSubscriptionInfo,
    
    // Status checks
    isInCenter,
    isCenterStaff,
  };
}

// ============================================================================
// useCenterPermissions Hook
// ============================================================================

/**
 * Simplified permission checker for center context
 */
export function useCenterPermissions() {
  const {
    canAccessCenter,
    canManageCenter,
    canManageStaff,
    canViewAnalytics,
    canAssignLeads,
  } = useCenterContext();
  
  return {
    canAccess: canAccessCenter,
    canManage: canManageCenter,
    canManageStaff,
    canViewAnalytics,
    canAssignLeads,
  };
}

// ============================================================================
// useCenterFeatures Hook
// ============================================================================

/**
 * Get center features availability
 */
export function useCenterFeatures() {
  const { center, hasFeature } = useCenterContext();
  
  if (!center) {
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
// useCenterStats Hook
// ============================================================================

/**
 * Get center statistics (requires API call)
 */
export function useCenterStats() {
  const { centerId, canViewAnalytics } = useCenterContext();
  
  // This would typically fetch from API
  // For now, return helper function
  
  async function fetchStats() {
    if (!centerId || !canViewAnalytics('center')) {
      throw new Error('Unauthorized to view center statistics');
    }
    
    const response = await fetch(`/api/centers/${centerId}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch center statistics');
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
  type Center,
};
