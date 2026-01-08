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
  error: Error | null;
  isAuthenticated: boolean;
  permissionContext: PermissionContext | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Auth Context
// ============================================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  permissionContext: null,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
  clearError: () => {},
});

// ============================================================================
// Auth Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MultiTenantUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const clearError = useCallback(() => setError(null), []);

  // Fetch user profile with clinic context via API to avoid RLS issues
  const fetchUserProfile = useCallback(async (userId: string): Promise<MultiTenantUser | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        console.warn('No active session for profile fetch');
        return null;
      }

      const response = await fetch(`/api/user-profile?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'X-Client-Info': 'beauty-with-ai-precision-v1'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Auto-provision profile for first-time login
          const createResponse = await fetch('/api/user-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              userId,
              updates: {
                id: userId,
                email: session.user?.email || '',
                full_name: session.user?.user_metadata?.full_name || 'New Professional',
                role: 'customer',
                tier: 'free',
                is_active: true
              }
            })
          });

          if (createResponse.ok) {
            const { data } = await createResponse.json();
            return data;
          }
        }
        throw new Error(`Profile sync failed: ${response.statusText}`);
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      console.error('[Auth] Profile sync error:', err);
      setError(err instanceof Error ? err : new Error('Unknown authentication error'));
      return null;
    }
  }, [supabase]);

  // Unified Auth State Management
  useEffect(() => {
    let mounted = true;

    async function syncAuthState() {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          setAuthUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) setUser(profile);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Auth sync failed'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    syncAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          setAuthUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) setUser(profile);
        } else {
          setAuthUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      if (data.user) {
        setAuthUser(data.user);
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign in failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setAuthUser(null);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (authUser) {
      const profile = await fetchUserProfile(authUser.id);
      setUser(profile);
    }
  };

  const permissionContext: PermissionContext | null = user ? {
    userId: user.id,
    role: user.role,
    clinicId: user.clinic_id,
    branchId: user.branch_id,
  } : null;

  const value: AuthContextType = {
    user,
    authUser,
    isLoading,
    error,
    isAuthenticated: !!user,
    permissionContext,
    signIn,
    signOut,
    refreshUser,
    clearError,
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
