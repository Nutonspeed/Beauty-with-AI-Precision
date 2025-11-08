/**
 * Auth Utilities
 * Helper functions for authentication
 */

import { createBrowserClient } from './client'
import { handleAuthError, clearAuthCookies } from './auth-error-handler'

/**
 * Sign out and clear all auth data
 */
export async function signOut() {
  try {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    clearAuthCookies()
    
    // Redirect to login page
    if (globalThis.window !== undefined) {
      globalThis.window.location.href = '/auth/login'
    }
  } catch (error) {
    console.error('Sign out error:', error)
    // Force clear cookies even if API call fails
    clearAuthCookies()
    if (globalThis.window !== undefined) {
      globalThis.window.location.href = '/auth/login'
    }
  }
}

/**
 * Get current user with error handling
 */
export async function getCurrentUser() {
  try {
    const supabase = createBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      const errorDetails = handleAuthError(error)
      if (errorDetails.shouldLogout) {
        await signOut()
      }
      throw error
    }
    
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Get current session with error handling
 */
export async function getCurrentSession() {
  try {
    const supabase = createBrowserClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      const errorDetails = handleAuthError(error)
      if (errorDetails.shouldLogout) {
        await signOut()
      }
      throw error
    }
    
    return session
  } catch (error) {
    console.error('Get current session error:', error)
    return null
  }
}

/**
 * Refresh session manually
 */
export async function refreshSession() {
  try {
    const supabase = createBrowserClient()
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error) {
      const errorDetails = handleAuthError(error)
      if (errorDetails.shouldLogout) {
        await signOut()
      }
      throw error
    }
    
    return session
  } catch (error) {
    console.error('Refresh session error:', error)
    return null
  }
}
