/**
 * Auth Error Handler
 * Handles Supabase authentication errors and provides user-friendly messages
 */

import { AuthError } from '@supabase/supabase-js'

export interface AuthErrorDetails {
  message: string
  code: string
  userMessage: string
  shouldLogout: boolean
}

export function handleAuthError(error: AuthError | Error): AuthErrorDetails {
  // Handle Supabase AuthError
  if ('status' in error && 'code' in error) {
    const authError = error as AuthError

    switch (authError.message) {
      case 'Invalid Refresh Token: Refresh Token Not Found':
      case 'refresh_token_not_found':
        return {
          message: authError.message,
          code: 'refresh_token_not_found',
          userMessage: 'Your session has expired. Please sign in again.',
          shouldLogout: true,
        }

      case 'Invalid login credentials':
      case 'invalid_credentials':
        return {
          message: authError.message,
          code: 'invalid_credentials',
          userMessage: 'Invalid email or password. Please try again.',
          shouldLogout: false,
        }

      case 'Email not confirmed':
      case 'email_not_confirmed':
        return {
          message: authError.message,
          code: 'email_not_confirmed',
          userMessage: 'Please verify your email address before signing in.',
          shouldLogout: false,
        }

      case 'User not found':
      case 'user_not_found':
        return {
          message: authError.message,
          code: 'user_not_found',
          userMessage: 'No account found with this email address.',
          shouldLogout: false,
        }

      case 'Session expired':
      case 'session_expired':
        return {
          message: authError.message,
          code: 'session_expired',
          userMessage: 'Your session has expired. Please sign in again.',
          shouldLogout: true,
        }

      default:
        return {
          message: authError.message,
          code: authError.code || 'unknown_error',
          userMessage: 'An authentication error occurred. Please try again.',
          shouldLogout: false,
        }
    }
  }

  // Handle generic errors
  return {
    message: error.message,
    code: 'generic_error',
    userMessage: 'An unexpected error occurred. Please try again.',
    shouldLogout: false,
  }
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies() {
  if (typeof document !== 'undefined') {
    // Clear all Supabase auth cookies
    const cookies = ['sb-access-token', 'sb-refresh-token', 'sb-auth-token']
    for (const cookie of cookies) {
      document.cookie = `${cookie}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    }
  }
}

/**
 * Check if error requires logout
 */
export function shouldLogoutOnError(error: AuthError | Error): boolean {
  const details = handleAuthError(error)
  return details.shouldLogout
}
