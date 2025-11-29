'use client'

/**
 * Auth Context Provider
 * ปรับให้ทำงานกับโครงสร้าง DB ที่มีอยู่จริง
 */

import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRole, AnalysisTier, parseUserRole, getRoleTier } from '@/types/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  role: UserRole
  tier: AnalysisTier
  clinic_id: string | null
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  is_active: boolean
  permissions: Record<string, boolean> | null
}

interface AuthContextType {
  user: AuthUser | null
  supabaseUser: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (data: Partial<AuthUser>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const _router = useRouter()

  // 🔧 Prevent duplicate loads with ref
  const loadingUserIdRef = useRef<string | null>(null)
  const loadedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        // ⚡ Use getUser() instead of getSession() (faster + more secure)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Get session for token
          const { data: { session } } = await supabase.auth.getSession()
          await loadUserData(authUser, session)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] 🔔 Auth state changed:', event, 'hasSession:', !!session)
        
        if (session?.user) {
          await loadUserData(session.user, session) // Pass session directly
        } else {
          setUser(null)
          setSupabaseUser(null)
          loadingUserIdRef.current = null
          loadedUserIdRef.current = null
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserData = async (supabaseUser: User, sessionFromEvent?: any) => {
    // 🔧 PREVENT DUPLICATE LOADS
    // If already loading this user, skip
    if (loadingUserIdRef.current === supabaseUser.id) {
      console.log(`[AuthContext] ⏭️ Already loading user ${supabaseUser.id}, skipping...`)
      return
    }
    
    // If user already loaded and data is fresh, skip
    if (loadedUserIdRef.current === supabaseUser.id && user?.id === supabaseUser.id) {
      console.log(`[AuthContext] ✅ User ${supabaseUser.id} already loaded, skipping...`)
      return
    }

    console.log('[AuthContext] 📥 Loading user data for:', supabaseUser.id)
    
    // Mark as loading
    loadingUserIdRef.current = supabaseUser.id
    
    setSupabaseUser(supabaseUser)
    setLoading(true)

    // Get session - prefer from event, fallback to getSession if needed
    let session = sessionFromEvent
    
    if (!session) {
      console.log('[AuthContext] 🔑 No session from event, getting session...')
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      session = data?.session
    } else {
      console.log('[AuthContext] ✅ Using session from auth event')
    }

    if (!session) {
      console.error('[AuthContext] ❌ No session found')
      setLoading(false)
      loadingUserIdRef.current = null
      return
    }

    console.log('[AuthContext] 🌐 Calling /api/user-profile...')
    
    // Call API route with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    let profile: any = null
    
    try {
      const response = await fetch(`/api/user-profile?userId=${supabaseUser.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        cache: 'no-store',
        signal: controller.signal
      })

        clearTimeout(timeoutId)
        console.log('[AuthContext] 📡 API Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('[AuthContext] ❌ Error loading user profile:', errorData)
          
          // If user doesn't exist (404), create default customer profile
          if (response.status === 404) {
            console.log('[AuthContext] ⚠️ User not found, creating default profile...')
            
            // Create default profile via API
            const createResponse = await fetch('/api/user-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                userId: supabaseUser.id,
                updates: {
                  id: supabaseUser.id,
                  email: supabaseUser.email,
                  full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
                  role: 'customer',
                  tier: 'free',
                  is_active: true
                }
              })
            })

            if (createResponse.ok) {
              const { data: newProfile } = await createResponse.json()
              console.log('[AuthContext] ✅ Created default profile:', newProfile)
              
              setUser({
                id: newProfile.id,
                email: newProfile.email,
                role: 'customer',
                tier: 'free',
                clinic_id: null,
                full_name: newProfile.full_name,
                avatar_url: null,
                phone: null,
                is_active: true,
                permissions: null,
              })
              
              // ✅ Mark as successfully loaded
              loadedUserIdRef.current = supabaseUser.id
              loadingUserIdRef.current = null
              setLoading(false)
              return
            }
          }
          loadingUserIdRef.current = null
          setLoading(false)
          return
        }

        const responseData = await response.json()
        profile = responseData.data
        console.log('[AuthContext] 📦 Profile data received:', profile)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          console.error('[AuthContext] ⏰ API request timeout after 10 seconds')
        } else {
          console.error('[AuthContext] ❌ Fetch error:', fetchError)
        }
        loadingUserIdRef.current = null
        setLoading(false)
        return
      }

      // Debug log
      console.log('[AuthContext] ✅ User profile loaded:', { 
        hasProfile: !!profile,
        userId: supabaseUser.id,
        role: profile?.role
      })

      if (profile) {
        const userRole = parseUserRole(profile.role)
        setUser({
          id: profile.id,
          email: profile.email,
          role: userRole,
          tier: getRoleTier(userRole),
          clinic_id: profile.clinic_id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          is_active: profile.is_active,
          permissions: profile.permissions as Record<string, boolean> | null,
        })
        
        // ✅ Mark as successfully loaded
        loadedUserIdRef.current = supabaseUser.id
        console.log('[AuthContext] ✅ User loaded successfully')
      }
      
      setLoading(false)
      loadingUserIdRef.current = null // Reset loading flag
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] 🔐 Starting signIn...')
      
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log('[AuthContext] ✅ Login successful!')
      
      // Fetch user profile immediately to get role for redirect
      if (data.session?.access_token) {
        try {
          const profileRes = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
            },
          })
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            console.log('[AuthContext] 📦 Profile for redirect:', profileData.data?.role)
            return { error: null, role: profileData.data?.role || 'customer' }
          }
        } catch (e) {
          console.warn('[AuthContext] Could not fetch profile for redirect:', e)
        }
      }
      
      return { error: null, role: 'customer' }
    } catch (error) {
      console.error('[AuthContext] ❌ SignIn error:', error)
      return { error: error as Error, role: null }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'customer',  // string ไม่ใช่ enum
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      console.log('[AuthContext] 🚪 Starting sign out...')
      const supabase = createClient()
      
      // Clear local state immediately for better UX
      setUser(null)
      setSupabaseUser(null)
      loadingUserIdRef.current = null
      loadedUserIdRef.current = null
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      console.log('[AuthContext] ✅ Signed out, redirecting to login...')
      
      // Use window.location.href for hard redirect (more reliable)
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('[AuthContext] ❌ SignOut error:', error)
      // Still redirect even if there's an error
      window.location.href = '/auth/login'
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${globalThis.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setUser({ ...user, ...data })

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = useMemo(
    () => ({
      user,
      supabaseUser,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, supabaseUser, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
