/**
 * Permission Helper Functions
 * Provides easy-to-use functions for checking permissions
 */

import { UserRole, Permission, AnalysisTier, hasPermission, hasTierFeature } from "./roles"

// Page access rules
export const PAGE_ACCESS: Record<string, { minRole?: UserRole; permissions?: Permission[] }> = {
  // Public pages (no login required)
  "/": {},
  "/about": {},
  "/contact": {},
  "/pricing": {},
  "/faq": {},
  "/features": {},
  "/privacy": {},
  "/terms": {},
  "/pdpa": {},
  "/demo": {},
  "/analysis": {}, // Free tier analysis
  "/auth/login": {},
  "/auth/register": {},

  // Authenticated pages (login required)
  "/profile": { minRole: UserRole.FREE_USER },
  "/analysis/results": { minRole: UserRole.FREE_USER },
  "/analysis/history": { minRole: UserRole.FREE_USER },
  "/booking": { minRole: UserRole.FREE_USER },

  // Premium pages
  "/ar-simulator": {
    minRole: UserRole.PREMIUM_CUSTOMER,
    permissions: [Permission.USE_AR_SIMULATOR],
  },
  "/treatment-plans": {
    minRole: UserRole.PREMIUM_CUSTOMER,
    permissions: [Permission.VIEW_FULL_RESULTS],
  },
  "/chat": {
    minRole: UserRole.PREMIUM_CUSTOMER,
    permissions: [Permission.CHAT_WITH_SALES],
  },

  // Clinic pages
  "/clinic": {
    minRole: UserRole.CLINIC_STAFF,
    permissions: [Permission.VIEW_CLINIC_DASHBOARD],
  },
  "/clinic/dashboard": {
    minRole: UserRole.CLINIC_STAFF,
    permissions: [Permission.VIEW_CLINIC_DASHBOARD],
  },
  "/clinic/customers": {
    minRole: UserRole.CLINIC_STAFF,
    permissions: [Permission.VIEW_CLINIC_CUSTOMERS],
  },
  "/clinic/bookings": {
    minRole: UserRole.CLINIC_STAFF,
    permissions: [Permission.MANAGE_BOOKINGS],
  },
  "/clinic/staff": {
    minRole: UserRole.CLINIC_ADMIN,
    permissions: [Permission.MANAGE_CLINIC_STAFF],
  },
  "/clinic/settings": {
    minRole: UserRole.CLINIC_ADMIN,
    permissions: [Permission.MANAGE_CLINIC_SETTINGS],
  },
  "/clinic/reports": {
    minRole: UserRole.CLINIC_STAFF,
    permissions: [Permission.VIEW_CLINIC_REPORTS],
  },

  // Sales pages
  "/sales": {
    minRole: UserRole.SALES_STAFF,
    permissions: [Permission.VIEW_SALES_DASHBOARD],
  },
  "/sales/dashboard": {
    minRole: UserRole.SALES_STAFF,
    permissions: [Permission.VIEW_SALES_DASHBOARD],
  },
  "/sales/leads": {
    minRole: UserRole.SALES_STAFF,
    permissions: [Permission.VIEW_ALL_LEADS],
  },
  "/sales/proposals": {
    minRole: UserRole.SALES_STAFF,
    permissions: [Permission.CREATE_PROPOSALS],
  },

  // Admin pages
  "/admin": {
    minRole: UserRole.SUPER_ADMIN,
    permissions: [Permission.VIEW_ADMIN_DASHBOARD],
  },
  "/admin/dashboard": {
    minRole: UserRole.SUPER_ADMIN,
    permissions: [Permission.VIEW_ADMIN_DASHBOARD],
  },
  "/admin/users": {
    minRole: UserRole.SUPER_ADMIN,
    permissions: [Permission.MANAGE_ALL_USERS],
  },
  "/admin/analytics": {
    minRole: UserRole.SUPER_ADMIN,
    permissions: [Permission.VIEW_SYSTEM_ANALYTICS],
  },
  "/admin/settings": {
    minRole: UserRole.SUPER_ADMIN,
    permissions: [Permission.MANAGE_SYSTEM_SETTINGS],
  },
  "/super-admin": {
    minRole: UserRole.SUPER_ADMIN,
    permissions: [Permission.VIEW_ADMIN_DASHBOARD],
  },
  "/super-admin/dashboard": {
    minRole: UserRole.SUPER_ADMIN,
    permissions: [Permission.VIEW_ADMIN_DASHBOARD],
  },
}

/**
 * Check if a user can access a specific page
 */
export function canAccessPage(pathname: string, userRole: UserRole = UserRole.PUBLIC): boolean {
  // Check exact match first
  if (PAGE_ACCESS[pathname]) {
    const rule = PAGE_ACCESS[pathname]

    // No restrictions = public page
    if (!rule.minRole && !rule.permissions) {
      return true
    }

    // Check role requirement
    if (rule.minRole && userRole === UserRole.PUBLIC) {
      return false
    }

    // Check permissions
    if (rule.permissions) {
      return rule.permissions.every((perm) => hasPermission(userRole, perm))
    }

    return true
  }

  // Check pattern matching (e.g., /clinic/*)
  for (const [path, rule] of Object.entries(PAGE_ACCESS)) {
    if (path.endsWith("/*") && pathname.startsWith(path.slice(0, -2))) {
      if (!rule.minRole && !rule.permissions) {
        return true
      }

      if (rule.minRole && userRole === UserRole.PUBLIC) {
        return false
      }

      if (rule.permissions) {
        return rule.permissions.every((perm) => hasPermission(userRole, perm))
      }

      return true
    }
  }

  // Default: allow public access for unknown pages
  return true
}

/**
 * Check if a user can use a specific feature
 */
export function canUseFeature(
  feature: string,
  userRole: UserRole,
  analysisTier?: AnalysisTier,
): boolean {
  // Normalize feature name (convert hyphens to underscores for consistency)
  const normalizedFeature = feature.replaceAll('-', '_')
  
  // Feature-based permissions
  const featurePermissions: Record<string, Permission> = {
    "ar_simulator": Permission.USE_AR_SIMULATOR,
    "ar-simulator": Permission.USE_AR_SIMULATOR,
    heatmap: Permission.VIEW_HEATMAP,
    "progress_tracking": Permission.PROGRESS_TRACKING,
    "progress-tracking": Permission.PROGRESS_TRACKING,
    "export_pdf": Permission.EXPORT_PDF,
    "export-pdf": Permission.EXPORT_PDF,
    "full_results": Permission.VIEW_FULL_RESULTS,
    "full-results": Permission.VIEW_FULL_RESULTS,
    "unlimited_history": Permission.VIEW_UNLIMITED_HISTORY,
    "unlimited-history": Permission.VIEW_UNLIMITED_HISTORY,
    "chat": Permission.CHAT_WITH_SALES,
    "booking": Permission.BOOKING_APPOINTMENTS,
    "batch_analysis": Permission.UPLOAD_ANALYSIS,
  }

  const requiredPermission = featurePermissions[feature] || featurePermissions[normalizedFeature]
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    return false
  }

  // Tier-based features (if tier is provided)
  if (analysisTier) {
    // Check both original and normalized feature names
    return hasTierFeature(analysisTier, normalizedFeature) || hasTierFeature(analysisTier, feature)
  }

  return true
}

/**
 * Check if a user has a specific role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  // Super admin has all roles
  if (userRole === UserRole.SUPER_ADMIN) {
    return true
  }

  // Exact match
  if (userRole === requiredRole) {
    return true
  }

  // Role inheritance
  const roleInheritance: Record<UserRole, UserRole[]> = {
    [UserRole.PUBLIC]: [],
    [UserRole.FREE_USER]: [UserRole.PUBLIC],
    [UserRole.PREMIUM_CUSTOMER]: [UserRole.FREE_USER, UserRole.PUBLIC],
    [UserRole.CLINIC_STAFF]: [UserRole.PREMIUM_CUSTOMER, UserRole.FREE_USER, UserRole.PUBLIC],
    [UserRole.CLINIC_ADMIN]: [
      UserRole.CLINIC_STAFF,
      UserRole.PREMIUM_CUSTOMER,
      UserRole.FREE_USER,
      UserRole.PUBLIC,
    ],
    [UserRole.SALES_STAFF]: [UserRole.PREMIUM_CUSTOMER, UserRole.FREE_USER, UserRole.PUBLIC],
    [UserRole.SUPER_ADMIN]: Object.values(UserRole),
  }

  return roleInheritance[userRole]?.includes(requiredRole) ?? false
}

/**
 * Get redirect path based on role (for after login)
 */
export function getDefaultRedirectPath(userRole: UserRole): string {
  const redirects: Record<UserRole, string> = {
    [UserRole.PUBLIC]: "/",
    [UserRole.FREE_USER]: "/analysis",
    [UserRole.PREMIUM_CUSTOMER]: "/analysis",
    [UserRole.CLINIC_STAFF]: "/clinic/dashboard",
    [UserRole.CLINIC_ADMIN]: "/clinic/dashboard",
    [UserRole.SALES_STAFF]: "/sales/dashboard",
    [UserRole.SUPER_ADMIN]: "/admin/dashboard",
  }

  return redirects[userRole] ?? "/"
}

/**
 * Get tier from user role (default tier based on role)
 */
export function getDefaultTierForRole(userRole: UserRole): AnalysisTier {
  const tierMap: Record<UserRole, AnalysisTier> = {
    [UserRole.PUBLIC]: AnalysisTier.FREE,
    [UserRole.FREE_USER]: AnalysisTier.FREE,
    [UserRole.PREMIUM_CUSTOMER]: AnalysisTier.PREMIUM,
    [UserRole.CLINIC_STAFF]: AnalysisTier.CLINICAL,
    [UserRole.CLINIC_ADMIN]: AnalysisTier.CLINICAL,
    [UserRole.SALES_STAFF]: AnalysisTier.PREMIUM, // For demos
    [UserRole.SUPER_ADMIN]: AnalysisTier.CLINICAL,
  }

  return tierMap[userRole] ?? AnalysisTier.FREE
}

/**
 * Check if user can use a specific tier
 */
export function canUseTier(userRole: UserRole, tier: AnalysisTier): boolean {
  if (userRole === UserRole.SUPER_ADMIN) {
    return true
  }

  if (tier === AnalysisTier.FREE) {
    return true // Everyone can use free tier
  }

  if (tier === AnalysisTier.PREMIUM) {
    return hasPermission(userRole, Permission.PREMIUM_ANALYSIS)
  }

  if (tier === AnalysisTier.CLINICAL) {
    return (
      userRole === UserRole.CLINIC_STAFF ||
      userRole === UserRole.CLINIC_ADMIN
    )
  }

  return false
}
