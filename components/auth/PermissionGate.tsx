/**
 * Permission Gate Component
 * 
 * Purpose: Conditionally render content based on permissions
 * Features:
 * - Role-based rendering
 * - Clinic-scoped permissions
 * - Fallback content
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useClinicContext } from '@/hooks/useClinicContext';

// ============================================================================
// Permission Gate Props
// ============================================================================

interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireClinic?: boolean;
  requireFeature?: string;
  fallback?: React.ReactNode;
  clinicId?: string;
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
  requireClinic = false,
  requireFeature,
  fallback = null,
  clinicId,
}: PermissionGateProps) {
  const { user } = useAuth();
  const { hasFeature, canAccessClinic } = useClinicContext();

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

  // Check clinic requirement
  if (requireClinic && !user.clinic_id) {
    return <>{fallback}</>;
  }

  // Check clinic access
  if (clinicId && !canAccessClinic(clinicId)) {
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
      allowedRoles={['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Show content only to clinic admins
 */
export function ClinicAdminOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      allowedRoles={['clinic_admin', 'clinic_owner', 'super_admin']} 
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
 * Show content only if clinic has feature enabled
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
 * Show content only to users in specific clinic
 */
export function ClinicOnly({ 
  children, 
  clinicId, 
  fallback 
}: { 
  children: React.ReactNode; 
  clinicId: string; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      clinicId={clinicId} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}
