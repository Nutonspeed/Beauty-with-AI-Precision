/**
 * Supabase Authentication Utilities
 * Provides role-based access control and authentication helpers
 */

import { redirect } from 'next/navigation';
import { createClient } from './server';

/**
 * Valid user roles in the system
 */
export type UserRole = 
  | 'customer'
  | 'staff'
  | 'sales_staff'
  | 'clinic_admin'
  | 'clinic_owner'
  | 'admin'
  | 'super_admin';

/**
 * Require user to be authenticated and have specific role
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns User object if authenticated and authorized
 * @throws Redirects to /auth/login if not authenticated or /unauthorized if insufficient permissions
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * Check if user has specific role
 * @param role - Role to check
 * @returns boolean indicating if user has the role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return profile?.role === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Get current user's role
 * @returns UserRole or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return (profile?.role as UserRole) || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns User object or null
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
