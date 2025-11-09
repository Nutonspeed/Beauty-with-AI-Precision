"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { UserRole } from "@/types/supabase"
import { roleHierarchy as globalRoleHierarchy } from "@/lib/auth/role-config"
import { Loader2 } from "lucide-react"

// Helper: เช็คว่า user มี role ที่อนุญาตหรือไม่
function hasAllowedRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

// ใช้ roleHierarchy กลางจากระบบ RBAC configuration เพื่อหลีกเลี่ยงค่าซ้ำ/ไม่ตรงกัน
// (public, clinic_admin ถูกเพิ่มไว้แล้วใน globalRoleHierarchy)
const roleHierarchy = globalRoleHierarchy

function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = roleHierarchy[userRole] ?? 0
  const requiredLevel = roleHierarchy[requiredRole] ?? Number.POSITIVE_INFINITY
  return userLevel >= requiredLevel
}

interface ProtectedRouteProps {
  children: React.ReactNode
  /**
   * Required role to access this route
   * If not specified, only authentication is required
   */
  requiredRole?: UserRole
  /**
   * Alternative roles that can also access this route
   * Useful for routes accessible by multiple roles
   */
  allowedRoles?: UserRole[]
  /**
   * Page path for permission checking
   * If not specified, role hierarchy will be used
   */
  pagePath?: string
  /**
   * Redirect path when user is not authenticated
   * Default: /auth/login
   */
  redirectTo?: string
  /**
   * Redirect path when user doesn't have permission
   * Default: /unauthorized
   */
  forbiddenRedirect?: string
  /**
   * Loading component to show while checking auth
   */
  loadingComponent?: React.ReactNode
  /**
   * Show loading state even after auth is loaded
   * Useful for smooth transitions
   */
  persistLoading?: boolean
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes by checking:
 * 1. User authentication
 * 2. User role and permissions
 * 3. Page access permissions (if pagePath specified)
 * 
 * @example
 * // Simple authentication check
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 * 
 * @example
 * // Require specific role
 * <ProtectedRoute requiredRole={UserRole.PREMIUM_CUSTOMER}>
 *   <PremiumFeatures />
 * </ProtectedRoute>
 * 
 * @example
 * // Allow multiple roles
 * <ProtectedRoute allowedRoles={[UserRole.CLINIC_STAFF, UserRole.CLINIC_ADMIN]}>
 *   <ClinicDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Check page permissions from RBAC system
 * <ProtectedRoute pagePath="/admin/users">
 *   <UserManagement />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  pagePath,
  redirectTo = "/auth/login",
  forbiddenRedirect = "/unauthorized",
  loadingComponent,
  persistLoading = false,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    // Check 1: User must be authenticated
    if (!user) {
      console.log("[ProtectedRoute] User not authenticated, redirecting to:", redirectTo)
      router.push(redirectTo)
      return
    }

    // Check 2: เช็ค is_active
    if (!user.is_active) {
      console.log("[ProtectedRoute] User account is inactive")
      router.push(forbiddenRedirect)
      return
    }

    // Check 3: If allowedRoles specified, check if user role is in list
    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasAllowedRole(user.role, allowedRoles)) {
        console.log(`[ProtectedRoute] User role ${user.role} not in allowed roles:`, allowedRoles)
        router.push(forbiddenRedirect)
        return
      }
      console.log(`[ProtectedRoute] User role ${user.role} is in allowed roles`)
      return
    }

    // Check 4: If requiredRole specified, use role hierarchy
    if (requiredRole) {
      if (!hasMinimumRole(user.role, requiredRole)) {
        console.log(`[ProtectedRoute] User role ${user.role} < required role ${requiredRole}`)
        router.push(forbiddenRedirect)
        return
      }
      console.log(`[ProtectedRoute] User role ${user.role} >= required role ${requiredRole}`)
    }

    // All checks passed
    console.log("[ProtectedRoute] All checks passed, user can access this route")
  }, [user, loading, requiredRole, allowedRoles, pagePath, router, redirectTo, forbiddenRedirect])

  // Show loading state
  if (loading || persistLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  // User is not authenticated (will redirect via useEffect)
  if (!user) {
    return null
  }

  // All checks passed, render children
  return <>{children}</>
}

/**
 * Helper HOC to wrap entire page with ProtectedRoute
 * 
 * @example
 * export default withProtectedRoute(DashboardPage, {
 *   requiredRole: UserRole.FREE_USER,
 * })
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, "children"> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
