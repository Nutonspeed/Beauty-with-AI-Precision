/**
 * Role-Based Access Control Configuration
 * Defines which roles can access which routes
 */

export type UserRole = 
  | 'public'
  | 'guest'
  | 'customer'
  | 'customer_free'
  | 'customer_premium'
  | 'customer_clinical'
  | 'free_user'
  | 'premium_customer'
  | 'clinic_staff'
  | 'clinic_owner'
  | 'sales_staff'
  | 'clinic_admin'
  | 'super_admin';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Route permissions configuration
 * Routes are checked in order - first match wins
 */
export const routePermissions: RoutePermission[] = [
  // Public routes (accessible to everyone)
  {
    path: '/',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/about',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/pricing',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/contact',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/privacy',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/terms',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/faq',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },

  // Auth routes (public access)
  {
    path: '/auth/login',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/auth/register',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },
  {
    path: '/auth/forgot-password',
    allowedRoles: ['public', 'customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
  },

  // Customer routes (require login)
  {
    path: '/analysis',
    allowedRoles: ['customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/auth/login',
  },
  {
    path: '/ar-simulator',
    allowedRoles: ['customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/auth/login',
  },
  {
    path: '/booking',
    allowedRoles: ['customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/auth/login',
  },
  {
    path: '/profile',
    allowedRoles: ['customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/auth/login',
  },
  {
    path: '/treatment-plans',
    allowedRoles: ['customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/auth/login',
  },
  {
    path: '/dashboard',
    allowedRoles: ['customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/auth/login',
  },

  // Chat routes (customers + sales + admin)
  {
    path: '/chat',
    allowedRoles: ['customer', 'customer_free', 'customer_premium', 'customer_clinical', 'free_user', 'premium_customer', 'clinic_staff', 'clinic_owner', 'sales_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/auth/login',
  },

  // Clinic routes (clinic owner + staff + admin)
  {
    path: '/clinic',
    allowedRoles: ['clinic_owner', 'clinic_staff', 'clinic_admin', 'super_admin'],
    redirectTo: '/unauthorized',
  },

  // Sales routes (sales staff only + admin)
  {
    path: '/sales',
    allowedRoles: ['sales_staff', 'clinic_owner', 'clinic_admin', 'super_admin'],
    redirectTo: '/unauthorized',
  },

  // Customer management (sales + admin only)
  {
    path: '/customer',
    allowedRoles: ['sales_staff', 'clinic_owner', 'clinic_admin', 'super_admin'],
    redirectTo: '/unauthorized',
  },

  // Admin routes (clinic_admin + super_admin only)
  {
    path: '/admin-dashboard',
    allowedRoles: ['clinic_admin', 'super_admin'],
    redirectTo: '/unauthorized',
  },
  {
    path: '/admin',
    allowedRoles: ['clinic_owner', 'clinic_admin', 'super_admin'],
    redirectTo: '/unauthorized',
  },

  // Super admin routes (super_admin only)
  {
    path: '/super-admin',
    allowedRoles: ['super_admin'],
    redirectTo: '/unauthorized',
  },

  // Reports (sales + admin)
  {
    path: '/reports',
    allowedRoles: ['sales_staff', 'clinic_owner', 'clinic_admin', 'super_admin'],
    redirectTo: '/unauthorized',
  },
];

/**
 * Role hierarchy for permission checking
 * Higher number = more permissions
 */
export const roleHierarchy: Record<UserRole, number> = {
  public: 0,
  guest: 0,
  customer: 1,
  customer_free: 1,
  free_user: 1,
  customer_premium: 2,
  customer_clinical: 2,
  premium_customer: 2,
  clinic_staff: 3,
  sales_staff: 3,
  clinic_owner: 4,
  clinic_admin: 4,
  super_admin: 5,
};

/**
 * Check if user has permission to access a route
 */
export function hasPermission(userRole: UserRole | null, path: string): boolean {
  // Remove locale prefix if present
  const cleanPath = path.replace(/^\/(th|en|zh)/, '');
  
  // If no user role, treat as public
  const role = userRole || 'public';
  const effectiveRole = role === 'guest' ? 'public' : role;

  // Find matching route permission (check most specific first)
  const routePermission = routePermissions.find((rp) => {
    // Exact match
    if (cleanPath === rp.path) return true;
    
    // Prefix match (e.g., /admin matches /admin/patients)
    if (cleanPath.startsWith(rp.path + '/')) return true;
    
    return false;
  });

  // If no specific permission found, allow by default (permissive)
  if (!routePermission) return true;

  // Check if user's role is in allowed roles
  return routePermission.allowedRoles.includes(effectiveRole);
}

/**
 * Get redirect URL for unauthorized access
 */
export function getRedirectUrl(userRole: UserRole | null, path: string): string | null {
  const cleanPath = path.replace(/^\/(th|en|zh)/, '');
  const role = userRole || 'public';
  const effectiveRole = role === 'guest' ? 'public' : role;

  const routePermission = routePermissions.find((rp) => {
    if (cleanPath === rp.path) return true;
    if (cleanPath.startsWith(rp.path + '/')) return true;
    return false;
  });

  // If no permission found or user has access, no redirect needed
  if (!routePermission || routePermission.allowedRoles.includes(effectiveRole)) {
    return null;
  }

  // Return configured redirect or default
  return routePermission.redirectTo || '/unauthorized';
}

/**
 * Get user's default landing page based on role
 */
export function getDefaultLandingPage(userRole: UserRole): string {
  switch (userRole) {
    case 'super_admin':
      return '/super-admin';
    case 'clinic_admin':
      return '/admin-dashboard';
    case 'clinic_owner':
      return '/clinic/dashboard';
    case 'sales_staff':
      return '/sales/dashboard';
    case 'clinic_staff':
      return '/dashboard';
    case 'customer':
    case 'customer_free':
    case 'customer_premium':
    case 'customer_clinical':
    case 'premium_customer':
    case 'free_user':
      return '/dashboard';
    default:
      return '/';
  }
}
