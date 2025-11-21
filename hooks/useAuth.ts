/**
 * Client-Side Auth Hook
 * 
 * Purpose: React hook for client-side authentication state
 * Features:
 * - Real-time auth state updates
 * - Clinic context management
 * - Permission checking
 * - Sign in/out functions
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { type User } from '@supabase/supabase-js';
import { type MultiTenantUser, type PermissionContext } from '@/types/multi-tenant';

// ============================================================================
// Auth Context Type
// ============================================================================

interface AuthContextType {
  user: MultiTenantUser | null;
  authUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissionContext: PermissionContext | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// Auth Context
// ============================================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  isLoading: true,
  isAuthenticated: false,
  permissionContext: null,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

// ============================================================================
// Auth Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MultiTenantUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user profile with clinic context via API to avoid RLS issues
  const fetchUserProfile = useCallback(async (userId: string): Promise<MultiTenantUser | null> => {
    try {
      // Get auth token for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session available for API call');
        return null;
      }

      const response = await fetch(`/api/user-profile?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch user profile: HTTP', response.status);
        return null;
      }

      const result = await response.json();
      
      // API returns { data: profile } format
      if (!result.data || result.error) {
        console.error('Failed to fetch user profile:', result?.error);
        return null;
      }

      const data = result.data;

      return {
        id: data.id,
        email: data.email,
        role: data.role,
        tier: data.tier,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        created_at: data.created_at,
        updated_at: data.updated_at,
        last_login_at: data.last_login_at,
        email_verified: data.email_verified,
        metadata: data.metadata || {},
        clinic_id: data.clinic_id,
        branch_id: data.branch_id,
        clinic: data.clinic || undefined,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setAuthUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          setAuthUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        } else {
          setAuthUser(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  // Sign in function
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      setAuthUser(data.user);
      const profile = await fetchUserProfile(data.user.id);
      setUser(profile);
    }
  }

  // Sign out function
  async function signOut() {
    await supabase.auth.signOut();
    setAuthUser(null);
    setUser(null);
  }

  // Refresh user profile
  async function refreshUser() {
    if (authUser) {
      const profile = await fetchUserProfile(authUser.id);
      setUser(profile);
    }
  }

  // Build permission context
  const permissionContext: PermissionContext | null = user
    ? {
        userId: user.id,
        role: user.role,
        clinicId: user.clinic_id,
        branchId: user.branch_id,
      }
    : null;

  const value: AuthContextType = {
    user,
    authUser,
    isLoading,
    isAuthenticated: !!user,
    permissionContext,
    signIn,
    signOut,
    refreshUser,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// ============================================================================
// useAuth Hook
// ============================================================================

/**
 * Client-side authentication hook
 * Usage: const { user, isAuthenticated, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Get current user's role
 */
export function useUserRole(): string {
  const { user } = useAuth();
  return user?.role || 'public';
}

/**
 * Get current user's clinic ID
 */
export function useClinicId(): string | null | undefined {
  const { user } = useAuth();
  return user?.clinic_id;
}

/**
 * Get current user's clinic data
 */
export function useClinic() {
  const { user } = useAuth();
  return user?.clinic;
}

/**
 * Check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  return user?.role === role;
}

/**
 * Check if user is super admin
 */
export function useIsSuperAdmin(): boolean {
  return useHasRole('super_admin');
}

/**
 * Check if user is clinic owner
 */
export function useIsClinicOwner(): boolean {
  return useHasRole('clinic_owner');
}

/**
 * Check if user is sales staff
 */
export function useIsSalesStaff(): boolean {
  return useHasRole('sales_staff');
}

/**
 * Check if user is clinic staff (any clinic role)
 */
export function useIsClinicStaff(): boolean {
  const role = useUserRole();
  return ['clinic_staff', 'clinic_admin', 'clinic_owner', 'sales_staff'].includes(role);
}

/**
 * Require authentication (redirect if not authenticated)
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isLoading, isAuthenticated]);

  return { shouldRedirect, isLoading };
}

/**
 * Require specific role (return true if user has role)
 */
export function useRequireRole(allowedRoles: string[]): boolean {
  const role = useUserRole();
  
  // Super admin bypasses all role checks
  if (role === 'super_admin') {
    return true;
  }
  
  return allowedRoles.includes(role);
}
