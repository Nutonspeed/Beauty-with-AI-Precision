/**
 * Permission Gate Component
 * 
 * Purpose: Conditionally render content based on permissions
 * Features:
 * - Role-based rendering
 * - Center-scoped permissions
 * - Fallback content
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCenterContext } from '@/hooks/useCenterContext';

// ============================================================================
// Permission Gate Props
// ============================================================================

interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireCenter?: boolean;
  requireFeature?: string;
  fallback?: React.ReactNode;
  centerId?: string;
}

// ============================================================================
// Permission Gate Component
// ============================================================================

/**
 * Conditionally render content based on permissions
 * 
 * Usage:
 * <PermissionGate allowedRoles={['sales_staff']}>
 *   <SalesOnlyContent />
 * </PermissionGate>
 * 
 * <PermissionGate requireFeature="analytics">
 *   <AnalyticsChart />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  allowedRoles,
  requireCenter = false,
  requireFeature,
  fallback = null,
  centerId,
}: PermissionGateProps) {
  const { user } = useAuth();
  const { hasFeature, canAccessCenter } = useCenterContext();

  // Check if user exists
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (allowedRoles && allowedRoles.length > 0) {
    // Super admin bypasses role check
    if (user.role === 'super_admin') {
      // Continue to other checks
    } else if (!allowedRoles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  // Check center requirement
  if (requireCenter && !user.center_id) {
    return <>{fallback}</>;
  }

  // Check center access
  if (centerId && !canAccessCenter(centerId)) {
    return <>{fallback}</>;
  }

  // Check feature requirement
  if (requireFeature && !hasFeature(requireFeature)) {
    return <>{fallback}</>;
  }

  // All checks passed
  return <>{children}</>;
}

// ============================================================================
// Convenience Components
// ============================================================================

/**
 * Show content only to authenticated users
 */
export function AuthOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

/**
 * Show content only to sales staff
 */
export function SalesStaffOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      allowedRoles={['sales_staff', 'center_admin', 'center_owner', 'super_admin']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only to center admins
 */
export function CenterAdminOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      allowedRoles={['center_admin', 'center_owner', 'super_admin']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only to super admins
 */
export function SuperAdminOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      allowedRoles={['super_admin']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only if center has feature enabled
 */
export function FeatureGate({ 
  children, 
  feature, 
  fallback 
}: { 
  children: React.ReactNode; 
  feature: string; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      requireFeature={feature} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only to users in specific center
 */
export function CenterOnly({ 
  children, 
  centerId, 
  fallback 
}: { 
  children: React.ReactNode; 
  centerId: string; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      centerId={centerId} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}
