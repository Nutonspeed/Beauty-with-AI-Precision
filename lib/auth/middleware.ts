/**
 * Auth Middleware for API Routes
 * Centralized authentication and authorization
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  clinic_id?: string;
  branch_id?: string;
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  requireClinicId?: boolean;
}

/**
 * Auth middleware wrapper for API routes
 * @example
 * export const GET = withAuth(async (req, user) => {
 *   return Response.json({ data: 'protected' });
 * }, { allowedRoles: ['admin', 'clinic_admin'] });
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  options: AuthMiddlewareOptions = {}
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    requireClinicId = false,
  } = options;

  return async (req: NextRequest) => {
    try {
      // Skip auth check if not required (public endpoints)
      if (!requireAuth) {
        return handler(req, null as any);
      }

      // Get authenticated user
      const supabase = await createClient();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }

      // Fetch user details including role and clinic_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, clinic_id, branch_id')
        .eq('id', authUser.id)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User not found', message: 'User profile not found in database' },
          { status: 404 }
        );
      }

      const user: AuthenticatedUser = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        clinic_id: userData.clinic_id,
        branch_id: userData.branch_id,
      };

      // Check role-based access
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          },
          { status: 403 }
        );
      }

      // Check clinic_id requirement
      if (requireClinicId && !user.clinic_id) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'User must be associated with a clinic',
          },
          { status: 403 }
        );
      }

      // Call the handler with authenticated user
      return handler(req, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Shorthand for public endpoints (no auth required)
 */
export function withPublicAccess(
  handler: (req: NextRequest) => Promise<Response>
) {
  return withAuth(handler as any, { requireAuth: false });
}

/**
 * Shorthand for admin-only endpoints
 */
export function withAdminAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return withAuth(handler, {
    allowedRoles: ['super_admin', 'admin'],
  });
}

/**
 * Shorthand for clinic staff endpoints
 */
export function withClinicAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return withAuth(handler, {
    allowedRoles: ['super_admin', 'clinic_admin', 'clinic_staff'],
    requireClinicId: true,
  });
}

/**
 * Shorthand for sales staff endpoints
 */
export function withSalesAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return withAuth(handler, {
    allowedRoles: ['super_admin', 'clinic_admin', 'sales_staff'],
    requireClinicId: true,
  });
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['*'], // All permissions
    admin: ['view_all', 'manage_clinics', 'view_analytics'],
    clinic_admin: ['view_clinic', 'manage_clinic', 'manage_staff', 'view_reports'],
    clinic_staff: ['view_clinic', 'create_analysis', 'view_customers'],
    sales_staff: ['view_clinic', 'create_leads', 'manage_proposals'],
    customer: ['view_own', 'create_booking'],
  };

  const permissions = rolePermissions[user.role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

/**
 * Extract user ID from request (for backward compatibility)
 */
export async function getUserId(_req: NextRequest): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}
