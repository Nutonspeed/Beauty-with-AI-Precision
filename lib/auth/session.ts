/**
 * Session Management for Multi-Center System
 * 
 * Purpose: Manage user sessions with center context for 120+ concurrent users
 * Features:
 * - Server-side session validation
 * - Center context extraction
 * - Permission checking with center isolation
 * - Rate limiting integration
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type MultiTenantUser, type PermissionContext } from '@/types/multi-tenant';

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  user: MultiTenantUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SessionContext {
  user: MultiTenantUser | null;
  isAuthenticated: boolean;
  permissionContext: PermissionContext | null;
}

// ============================================================================
// Supabase Server Client (for Server-Side Auth)
// ============================================================================

/**
 * Create Supabase client for server-side operations
 * Uses cookies for auth state management
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Handle error when called from Server Component
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Handle error when called from Server Component
          }
        },
      },
    }
  );
}

// ============================================================================
// Session Retrieval
// ============================================================================

/**
 * Get current session (server-side)
 * Returns user with center context
 */
export async function getSession(): Promise<SessionContext> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get auth user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return {
        user: null,
        isAuthenticated: false,
        permissionContext: null,
      };
    }
    
    // Get full user profile with center context
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        center:centers(*)
      `)
      .eq('id', authUser.id)
      .single();
    
    if (userError || !userData) {
      console.error('Failed to fetch user profile:', userError);
      return {
        user: null,
        isAuthenticated: false,
        permissionContext: null,
      };
    }
    
    // Build MultiTenantUser
    const user: MultiTenantUser = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      tier: userData.tier,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url,
      phone: userData.phone,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_login_at: userData.last_login_at,
      email_verified: userData.email_verified,
      metadata: userData.metadata || {},
      center_id: userData.center_id,
      branch_id: userData.branch_id,
      center: userData.center || undefined,
    };
    
    // Build permission context
    const permissionContext: PermissionContext = {
      userId: user.id,
      role: user.role,
      centerId: user.center_id,
      branchId: user.branch_id,
    };
    
    return {
      user,
      isAuthenticated: true,
      permissionContext,
    };
  } catch (error) {
    console.error('Session error:', error);
    return {
      user: null,
      isAuthenticated: false,
      permissionContext: null,
    };
  }
}

/**
 * Get session or throw error (for protected routes)
 */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return session;
}

/**
 * Get session with center requirement
 */
export async function requireCenterSession(): Promise<SessionContext> {
  const session = await requireSession();
  
  if (!session.user?.center_id) {
    throw new Error('Unauthorized: Center membership required');
  }
  
  return session;
}

/**
 * Get session with role requirement
 */
export async function requireRole(
  allowedRoles: string[]
): Promise<SessionContext> {
  const session = await requireSession();
  
  if (!allowedRoles.includes(session.user!.role)) {
    throw new Error(`Unauthorized: Required role ${allowedRoles.join(' or ')}`);
  }
  
  return session;
}

// ============================================================================
// Permission Helpers (Server-Side)
// ============================================================================

/**
 * Check if current user can access center
 */
export async function canAccessCenter(centerId: string): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    return false;
  }
  
  const { user } = session;
  
  // Super admin can access all centers
  if (user.role === 'super_admin') {
    return true;
  }
  
  // User must be in the same center
  return user.center_id === centerId;
}

/**
 * Check if current user can manage center
 */
export async function canManageCenter(centerId: string): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    return false;
  }
  
  const { user } = session;
  
  // Super admin can manage all centers
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Center owner/admin can manage own center
  if (
    (user.role === 'center_owner' || user.role === 'center_admin') &&
    user.center_id === centerId
  ) {
    return true;
  }
  
  return false;
}

/**
 * Check if current user can view analysis
 */
export async function canViewAnalysis(
  analysisUserId: string,
  analysisCenterId?: string | null
): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    return false;
  }
  
  const { user } = session;
  
  // Super admin can view all analyses
  if (user.role === 'super_admin') {
    return true;
  }
  
  // User can view own analyses
  if (analysisUserId === user.id) {
    return true;
  }
  
  // Center staff can view center analyses
  if (
    analysisCenterId &&
    ['center_owner', 'center_admin', 'center_staff', 'sales_staff'].includes(user.role) &&
    user.center_id === analysisCenterId
  ) {
    return true;
  }
  
  return false;
}

/**
 * Check if current user can create analysis in center
 */
export async function canCreateAnalysis(centerId?: string | null): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    return false;
  }
  
  const { user } = session;
  
  // Super admin can create anywhere
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Users can create without center context
  if (!centerId) {
    return true;
  }
  
  // Staff can only create in own center
  if (
    ['center_owner', 'center_admin', 'center_staff', 'sales_staff'].includes(user.role) &&
    user.center_id === centerId
  ) {
    return true;
  }
  
  return false;
}

// ============================================================================
// Session Utilities
// ============================================================================

/**
 * Sign out user (server-side)
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}

/**
 * Refresh session
 */
export async function refreshSession(): Promise<SessionContext> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error || !data.session) {
    return {
      user: null,
      isAuthenticated: false,
      permissionContext: null,
    };
  }
  
  return getSession();
}

/**
 * Get user's center ID (helper)
 */
export async function getUserCenterId(): Promise<string | null> {
  const session = await getSession();
  return session.user?.center_id || null;
}

/**
 * Get user's role (helper)
 */
export async function getUserRole(): Promise<string> {
  const session = await getSession();
  return session.user?.role || 'public';
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.user?.role === 'super_admin';
}

/**
 * Check if user is center owner
 */
export async function isCenterOwner(): Promise<boolean> {
  const session = await getSession();
  return session.user?.role === 'center_owner';
}

/**
 * Check if user is sales staff
 */
export async function isSalesStaff(): Promise<boolean> {
  const session = await getSession();
  return session.user?.role === 'sales_staff';
}

// ============================================================================
// Export Everything
// ============================================================================

export {
  type MultiTenantUser,
  type PermissionContext,
};
