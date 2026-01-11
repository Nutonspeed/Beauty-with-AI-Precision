/**
 * Protected Route Component
 * 
 * Purpose: Wrapper for pages that require authentication
 * Features:
 * - Auth state checking
 * - Role-based access control
 * - Automatic redirects
 * - Loading states
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth, useRequireRole } from '@/hooks/useAuth';

// ============================================================================
// Protected Route Props
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: string[];
  requireCenter?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// ============================================================================
// Protected Route Component
// ============================================================================

/**
 * Protect page with authentication and authorization
 * 
 * Usage:
 * <ProtectedRoute requireAuth>
 *   <YourPage />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requireRoles={['sales_staff', 'center_admin']}>
 *   <SalesPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRoles,
  requireCenter = false,
  fallback,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { shouldRedirect: _shouldRedirect } = useRequireAuth();
  const hasRequiredRole = useRequireRole(requireRoles || []);

  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role requirement
    if (requireRoles && requireRoles.length > 0 && !hasRequiredRole) {
      router.push('/unauthorized');
      return;
    }

    // Check center requirement
    if (requireCenter && !user?.center_id) {
      router.push('/center/join');
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    requireAuth,
    requireRoles,
    hasRequiredRole,
    requireCenter,
    user,
    router,
    redirectTo,
  ]);

  // Show loading state
  if (isLoading) {
    return fallback || <LoadingState />;
  }

  // Show nothing while redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Show nothing if role not satisfied
  if (requireRoles && requireRoles.length > 0 && !hasRequiredRole) {
    return null;
  }

  // Show nothing if center required but not present
  if (requireCenter && !user?.center_id) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// ============================================================================
// Loading State Component
// ============================================================================

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// ============================================================================
// Convenience Wrappers
// ============================================================================

/**
 * Require authentication only
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth>{children}</ProtectedRoute>;
}

/**
 * Require specific role
 */
export function RequireRole({ 
  children, 
  roles 
}: { 
  children: React.ReactNode; 
  roles: string[] 
}) {
  return (
    <ProtectedRoute requireAuth requireRoles={roles}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Require center membership
 */
export function RequireCenter({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth requireCenter>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Sales staff only
 */
export function RequireSalesStaff({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['sales_staff', 'center_admin', 'center_owner', 'super_admin']}>
      {children}
    </RequireRole>
  );
}

/**
 * Clinic admin only
 */
export function RequireClinicAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['clinic_admin', 'clinic_owner', 'super_admin']}>
      {children}
    </RequireRole>
  );
}

/**
 * Super admin only
 */
export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['super_admin']}>
      {children}
    </RequireRole>
  );
}
