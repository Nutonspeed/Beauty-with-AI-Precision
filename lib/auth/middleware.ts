/**
 * Auth Middleware for API Routes
 * Centralized authentication and authorization
 */

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { canAccessSales } from '@/lib/auth/role-config';
import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest, logError } from '@/lib/utils/logger';
import { rateLimitMiddleware } from '@/lib/rate-limit/middleware/rate-limit';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  center_id?: string;
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  requireCenterId?: boolean;
  rateLimitCategory?: 'general' | 'auth' | 'api' | 'upload' | 'ai' | 'database';
}

/**
 * Auth middleware wrapper for API routes
 * @example
 * export const GET = withAuth(async (req, user) => {
 *   return Response.json({ data: 'protected' });
 * }, { allowedRoles: ['admin', 'center_admin'] });
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  options: AuthMiddlewareOptions = {}
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    requireCenterId = false,
    rateLimitCategory,
  } = options;

  function attachRequestIdHeader(res: Response, requestId: string) {
    const headers = new Headers(res.headers);
    headers.set('X-Request-Id', requestId);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }

  function getHeaderValue(req: unknown, headerName: string) {
    const headers: any = (req as any)?.headers;
    if (!headers) return undefined;
    if (typeof headers.get === 'function') {
      return headers.get(headerName) || headers.get(headerName.toLowerCase());
    }
    if (typeof headers === 'object') {
      return headers[headerName] || headers[headerName.toLowerCase()] || headers[headerName.toUpperCase()];
    }
    return undefined;
  }

  return async (req: NextRequest) => {
    const startedAt = Date.now();
    const requestId = getHeaderValue(req, 'x-request-id') || crypto.randomUUID();
    const url = new URL((req as any)?.url || 'http://localhost');

    try {
      if (rateLimitCategory) {
        const rateLimited = await rateLimitMiddleware.rateLimit(req, rateLimitCategory);
        if (rateLimited) {
          rateLimited.headers.set('X-Request-Id', requestId);
          logApiRequest(req.method, url.pathname, rateLimited.status, Date.now() - startedAt);
          return rateLimited;
        }
      }

      // Bypass auth for testing if enabled
      if (process.env.NEXT_PUBLIC_TEST_MODE === 'true' && process.env.NODE_ENV !== 'production') {
        const testUser: AuthenticatedUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'sales_staff', // Default role for tests
          center_id: 'test-center-id',
        };
        const response = await handler(req, testUser);
        const resWithId = attachRequestIdHeader(response, requestId);
        logApiRequest(req.method, url.pathname, resWithId.status, Date.now() - startedAt, testUser.id);
        return resWithId;
      }

      // Skip auth check if not required (public endpoints)
      if (!requireAuth) {
        const response = await handler(req, null as any);
        const resWithId = attachRequestIdHeader(response, requestId);
        logApiRequest(req.method, url.pathname, resWithId.status, Date.now() - startedAt);
        return resWithId;
      }

      // Get authenticated user
      const supabase = await createClient();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        const nextRes = NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
        nextRes.headers.set('X-Request-Id', requestId);
        logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt);
        return nextRes;
      }

      // Fetch user details including role and center_id
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, center_id')
        .eq('id', authUser.id)
        .single();

      if (userError || !userData) {
        try {
          const service = createServiceClient()

          const rawRole =
            (authUser.user_metadata as any)?.role ||
            (authUser.app_metadata as any)?.role

          const allowedRolesList = new Set([
            'public',
            'customer',
            'customer_free',
            'customer_premium',
            'customer_aesthetic',
            'free_user',
            'premium_customer',
            'center_staff',
            'center_admin',
            'center_owner',
            'sales_staff',
            'super_admin',
          ])

          const safeRole = allowedRolesList.has(rawRole) ? rawRole : 'customer'
          const safeEmail = authUser.email || (authUser.user_metadata as any)?.email || null
          if (!safeEmail) {
            throw new Error('Authenticated user is missing email')
          }

          const { data: createdUser, error: createError } = await service
            .from('users')
            .upsert(
              {
                id: authUser.id,
                email: safeEmail,
                role: safeRole,
                tier: 'free',
                email_verified: !!(authUser.email_confirmed_at as any),
              },
              { onConflict: 'id' }
            )
            .select('id, email, role, center_id')
            .single()

          if (createError || !createdUser) {
            console.error('[withAuth] Failed to auto-create user profile:', {
              requestId,
              userId: authUser.id,
              createError,
            })
            throw createError || new Error('Failed to create user profile')
          }

          userData = createdUser
          userError = null
        } catch (_e: any) {
          console.error('[withAuth] Auto-create user profile failed:', {
            requestId,
            userId: authUser.id,
            error: _e,
          })
          const message = _e?.message || 'Failed to provision user profile'
          const nextRes = NextResponse.json(
            { error: 'Failed to provision user profile', message },
            { status: 500 }
          );
          nextRes.headers.set('X-Request-Id', requestId);
          logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt, authUser.id);
          return nextRes;
        }
      }

      const user: AuthenticatedUser = {
        id: userData.id,
        email: userData.email,
        role: authUser.user_metadata?.role || userData.role || 'customer',
      };

      // Check role-based access
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const nextRes = NextResponse.json(
          {
            error: 'Forbidden',
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          },
          { status: 403 }
        );
        nextRes.headers.set('X-Request-Id', requestId);
        logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt, user.id);
        return nextRes;
      }

      // Check center_id requirement
      if (requireCenterId && !userData.center_id) {
        const nextRes = NextResponse.json(
          {
            error: 'Forbidden',
            message: 'User must be associated with a center',
          },
          { status: 403 }
        );
        nextRes.headers.set('X-Request-Id', requestId);
        logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt, user.id);
        return nextRes;
      }

      // Call the handler with authenticated user
      const response = await handler(req, user);
      const resWithId = attachRequestIdHeader(response, requestId);
      logApiRequest(req.method, url.pathname, resWithId.status, Date.now() - startedAt, user.id);
      return resWithId;
    } catch (error) {
      logError(error as Error, 'Auth middleware error');
      const nextRes = NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication failed' },
        { status: 500 }
      );
      nextRes.headers.set('X-Request-Id', requestId);
      logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt);
      return nextRes;
    }
  };
}

export function withAuthContext<TContext>(
  handler: (req: NextRequest, user: AuthenticatedUser, context: TContext) => Promise<Response>,
  options: AuthMiddlewareOptions = {}
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    requireCenterId = false,
    rateLimitCategory,
  } = options;

  function attachRequestIdHeader(res: Response, requestId: string) {
    const headers = new Headers(res.headers);
    headers.set('X-Request-Id', requestId);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }

  return async (req: NextRequest, context: TContext) => {
    const startedAt = Date.now();
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const url = new URL(req.url);

    try {
      if (rateLimitCategory) {
        const rateLimited = await rateLimitMiddleware.rateLimit(req, rateLimitCategory);
        if (rateLimited) {
          rateLimited.headers.set('X-Request-Id', requestId);
          logApiRequest(req.method, url.pathname, rateLimited.status, Date.now() - startedAt);
          return rateLimited;
        }
      }

      if (process.env.NEXT_PUBLIC_TEST_MODE === 'true' && process.env.NODE_ENV !== 'production') {
        const testUser: AuthenticatedUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'sales_staff',
        };
        const response = await handler(req, testUser, context);
        const resWithId = attachRequestIdHeader(response, requestId);
        logApiRequest(req.method, url.pathname, resWithId.status, Date.now() - startedAt, testUser.id);
        return resWithId;
      }

      if (!requireAuth) {
        const response = await handler(req, null as any, context);
        const resWithId = attachRequestIdHeader(response, requestId);
        logApiRequest(req.method, url.pathname, resWithId.status, Date.now() - startedAt);
        return resWithId;
      }

      const supabase = await createClient();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        const nextRes = NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
        nextRes.headers.set('X-Request-Id', requestId);
        logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt);
        return nextRes;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, center_id')
        .eq('id', authUser.id)
        .single();

      if (userError || !userData) {
        const nextRes = NextResponse.json(
          { error: 'User not found', message: 'User profile not found in database' },
          { status: 404 }
        );
        nextRes.headers.set('X-Request-Id', requestId);
        logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt, authUser.id);
        return nextRes;
      }

      const user: AuthenticatedUser = {
        id: userData.id,
        email: userData.email,
        role: authUser.user_metadata?.role || userData.role || 'customer',
      };

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const nextRes = NextResponse.json(
          {
            error: 'Forbidden',
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          },
          { status: 403 }
        );
        nextRes.headers.set('X-Request-Id', requestId);
        logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt, user.id);
        return nextRes;
      }

      if (requireCenterId && !user.center_id) {
        const nextRes = NextResponse.json(
          {
            error: 'Forbidden',
            message: 'User must be associated with a center',
          },
          { status: 403 }
        );
        nextRes.headers.set('X-Request-Id', requestId);
        logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt, user.id);
        return nextRes;
      }

      const response = await handler(req, user, context);
      const resWithId = attachRequestIdHeader(response, requestId);
      logApiRequest(req.method, url.pathname, resWithId.status, Date.now() - startedAt, user.id);
      return resWithId;
    } catch (error) {
      logError(error as Error, 'Auth middleware error');
      const nextRes = NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication failed' },
        { status: 500 }
      );
      nextRes.headers.set('X-Request-Id', requestId);
      logApiRequest(req.method, url.pathname, nextRes.status, Date.now() - startedAt);
      return nextRes;
    }
  };
}

/**
 * Shorthand for public endpoints (no auth required)
 */
export function withPublicAccess(
  handler: (req: NextRequest) => Promise<Response>,
  options: Omit<AuthMiddlewareOptions, 'requireAuth' | 'allowedRoles' | 'requireCenterId'> = {}
) {
  return withAuth(handler as any, { requireAuth: false, ...options });
}

/**
 * Shorthand for admin-only endpoints
 */
export function withAdminAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  options: Omit<AuthMiddlewareOptions, 'allowedRoles' | 'requireCenterId' | 'requireAuth'> = {}
) {
  return withAuth(handler, {
    allowedRoles: ['super_admin', 'admin'],
    ...options,
  });
}

/**
 * Shorthand for center staff endpoints
 */
export function withCenterAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  options: Omit<AuthMiddlewareOptions, 'allowedRoles' | 'requireCenterId' | 'requireAuth'> = {}
) {
  return withAuth(handler, {
    allowedRoles: ['super_admin', 'center_admin', 'center_staff'],
    requireCenterId: true,
    ...options,
  });
}

/**
 * Shorthand for sales staff endpoints
 */
export function withSalesAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  options: Omit<AuthMiddlewareOptions, 'allowedRoles' | 'requireCenterId' | 'requireAuth'> = {}
) {
  return withAuth(async (req, user) => {
    if (!canAccessSales(user.role)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Access denied. Sales role required',
        },
        { status: 403 }
      );
    }

    return handler(req, user);
  }, {
    requireCenterId: true,
    ...options,
  });
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['*'], // All permissions
    admin: ['view_all', 'manage_centers', 'view_analytics'],
    center_admin: ['view_center', 'manage_center', 'manage_staff', 'view_reports'],
    center_staff: ['view_center', 'create_analysis', 'view_customers'],
    sales_staff: ['view_center', 'create_leads', 'manage_proposals'],
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
