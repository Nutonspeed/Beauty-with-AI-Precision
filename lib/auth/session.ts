/**
 * Session Management for Multi-Clinic System
 * 
 * Purpose: Manage user sessions with clinic context for 120+ concurrent users
 * Features:
 * - Server-side session validation
 * - Clinic context extraction
 * - Permission checking with clinic isolation
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
          } catch (error) {
            // Handle error when called from Server Component
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
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
 * Returns user with clinic context
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
    
    // Get full user profile with clinic context
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        clinic:clinics(*)
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
      clinic_id: userData.clinic_id,
      branch_id: userData.branch_id,
      clinic: userData.clinic || undefined,
    };
    
    // Build permission context
    const permissionContext: PermissionContext = {
      userId: user.id,
      role: user.role,
      clinicId: user.clinic_id,
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
 * Get session with clinic requirement
 */
export async function requireClinicSession(): Promise<SessionContext> {
  const session = await requireSession();
  
  if (!session.user?.clinic_id) {
    throw new Error('Unauthorized: Clinic membership required');
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
 * Check if current user can access clinic
 */
export async function canAccessClinic(clinicId: string): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    return false;
  }
  
  const { user } = session;
  
  // Super admin can access all clinics
  if (user.role === 'super_admin') {
    return true;
  }
  
  // User must be in the same clinic
  return user.clinic_id === clinicId;
}

/**
 * Check if current user can manage clinic
 */
export async function canManageClinic(clinicId: string): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    return false;
  }
  
  const { user } = session;
  
  // Super admin can manage all clinics
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Clinic owner/admin can manage own clinic
  if (
    (user.role === 'clinic_owner' || user.role === 'clinic_admin') &&
    user.clinic_id === clinicId
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
  analysisClinicId?: string | null
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
  
  // Clinic staff can view clinic analyses
  if (
    analysisClinicId &&
    ['clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff'].includes(user.role) &&
    user.clinic_id === analysisClinicId
  ) {
    return true;
  }
  
  return false;
}

/**
 * Check if current user can create analysis in clinic
 */
export async function canCreateAnalysis(clinicId?: string | null): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    return false;
  }
  
  const { user } = session;
  
  // Super admin can create anywhere
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Users can create without clinic context
  if (!clinicId) {
    return true;
  }
  
  // Staff can only create in own clinic
  if (
    ['clinic_owner', 'clinic_admin', 'clinic_staff', 'sales_staff'].includes(user.role) &&
    user.clinic_id === clinicId
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
 * Get user's clinic ID (helper)
 */
export async function getUserClinicId(): Promise<string | null> {
  const session = await getSession();
  return session.user?.clinic_id || null;
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
 * Check if user is clinic owner
 */
export async function isClinicOwner(): Promise<boolean> {
  const session = await getSession();
  return session.user?.role === 'clinic_owner';
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
