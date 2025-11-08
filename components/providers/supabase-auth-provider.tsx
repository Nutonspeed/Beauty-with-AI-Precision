// @ts-nocheck
'use client'

/**
 * Supabase Auth Provider
 * Manages authentication session and handles refresh token errors
 */

import { createBrowserClient } from '@/lib/supabase/client'
import { handleAuthError, clearAuthCookies } from '@/lib/supabase/auth-error-handler'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Session, User, AuthError } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthContextValue>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Only run in browser - prevent SSR errors
    if (typeof window === 'undefined') {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return
    }

    const supabase = createBrowserClient()

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        })
      } catch (err) {
        const error = err as AuthError
        const errorDetails = handleAuthError(error)

        console.error('Auth initialization error:', errorDetails)

        if (errorDetails.shouldLogout) {
          clearAuthCookies()
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            error: errorDetails.userMessage,
          })
          router.push('/auth/login')
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorDetails.userMessage,
          }))
        }
      }
    }

    void initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        clearAuthCookies()
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: null,
        })
        router.push('/auth/login')
      } else if (event === 'TOKEN_REFRESHED') {
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        })
      } else if (event === 'SIGNED_IN') {
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        })
      } else if (event === 'USER_UPDATED') {
        setAuthState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
        }))
      }

      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return <>{children}</>
}
