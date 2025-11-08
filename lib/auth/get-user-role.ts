import { createClient } from '@/lib/supabase/server';
import type { UserRole } from './role-config';

/**
 * Get current user's role from Supabase
 * Server-side only
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient();
    
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return null;
    }

    // Get user data from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user role:', userError);
      return 'free_user'; // Default to free_user if not found
    }

    return userData.role as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

/**
 * Get user role from client-side session
 * Client-side only
 */
export async function getUserRoleClient(): Promise<UserRole | null> {
  try {
    const response = await fetch('/api/auth/role', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.role as UserRole;
  } catch (error) {
    console.error('Error fetching user role client-side:', error);
    return null;
  }
}
