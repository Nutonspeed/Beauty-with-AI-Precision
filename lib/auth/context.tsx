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
  center_id: string | null
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

    // Get initial session with timeout
    const getInitialSession = async () => {
      console.log('[AuthContext] 🔑 Getting initial session...');
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );

      try {
        // ⚡ Use getUser() instead of getSession() (faster + more secure)
        const userPromise = supabase.auth.getUser();
        
        const { data: { user: authUser } } = await Promise.race([
          userPromise,
          timeoutPromise
        ]) as any;
        
        if (authUser) {
          console.log('[AuthContext] 👤 Found user:', authUser.id);
          const { data: { session } } = await supabase.auth.getSession();
          await loadUserData(authUser, session);
        } else {
          console.log('[AuthContext] 👤 No initial user found');
        }
      } catch (error) {
        console.error('[AuthContext] ❌ Error loading initial session:', error);
      } finally {
        console.log('[AuthContext] ✅ Initial session check complete');
        setLoading(false);
      }
    };

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] 🔔 Auth state changed:', event, 'hasSession:', !!session)
        
        if (session?.user) {
          // loadUserData manages its own loading state - don't set loading=false here
          await loadUserData(session.user, session)
        } else {
          setUser(null)
          setSupabaseUser(null)
          loadingUserIdRef.current = null
          loadedUserIdRef.current = null
          setLoading(false)
        }
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
      setLoading(false)
      return
    }
    
    // If user already loaded and data is fresh, skip
    if (loadedUserIdRef.current === supabaseUser.id && user?.id === supabaseUser.id) {
      console.log(`[AuthContext] ✅ User ${supabaseUser.id} already loaded, skipping...`)
      setLoading(false)
      return
    }

    console.log('[AuthContext] 📥 Loading user data for:', supabaseUser.id)
    
    // Mark as loading
    loadingUserIdRef.current = supabaseUser.id
    
    setSupabaseUser(supabaseUser)

    let profile: any | null = null
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
    
    // Call API route with short timeout for E2E stability
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
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
              center_id: null,
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
          } else {
            console.error('[AuthContext] ❌ Failed to create profile:', createResponse.status)
          }
        }
        setLoading(false)
        loadingUserIdRef.current = null
        return
      }

      const responseData = await response.json()
      profile = responseData.data
      console.log('[AuthContext] 📦 Profile data received:', profile)
      console.log('[AuthContext] 👤 User email:', profile?.email, 'Role:', profile?.role)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('[AuthContext] ⏰ API request timeout after 2 seconds')
      } else {
        console.error('[AuthContext] ❌ Fetch error:', fetchError)
      }
      
      // Fallback: try /api/auth/check-role for minimal role info (with 2s timeout)
      console.log('[AuthContext] 🔄 Attempting fallback via /api/auth/check-role...')
      try {
        const fallbackController = new AbortController()
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 2000)
        const roleResponse = await fetch('/api/auth/check-role', {
          credentials: 'include',
          cache: 'no-store',
          signal: fallbackController.signal
        })
        clearTimeout(fallbackTimeout)
        if (roleResponse.ok) {
          const roleData = await roleResponse.json()
          console.log('[AuthContext] ✅ Fallback role received:', roleData.role)
          const userRole = parseUserRole(roleData.role)
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || roleData.email || '',
            role: userRole,
            tier: getRoleTier(userRole),
            center_id: roleData.centerId || null,
            full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || null,
            avatar_url: null,
            phone: null,
            is_active: true,
            permissions: null,
          })
          loadedUserIdRef.current = supabaseUser.id
          setLoading(false)
          loadingUserIdRef.current = null
          return
        }
      } catch (fallbackError) {
        console.error('[AuthContext] ❌ Fallback role fetch failed:', fallbackError)
      }
      
      // Last resort: set minimal user from Supabase auth data + email detection
      console.log('[AuthContext] ⚠️ Using minimal user from auth metadata + email detection')
      const metaRole = (supabaseUser.user_metadata as any)?.role
      const emailLower = (supabaseUser.email || '').toLowerCase()
      const emailBasedRole = emailLower.includes('admin') ? 'super_admin'
        : emailLower.includes('owner') ? 'clinic_owner'
        : emailLower.includes('sales') ? 'sales_staff'
        : emailLower.includes('customer') ? 'customer'
        : null
      const fallbackRole = parseUserRole(metaRole || emailBasedRole || 'customer')
      console.log('[AuthContext] 📦 Fallback role resolved:', fallbackRole)
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: fallbackRole,
        tier: getRoleTier(fallbackRole),
        center_id: null,
        full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || null,
        avatar_url: null,
        phone: null,
        is_active: true,
        permissions: null,
      })
      loadedUserIdRef.current = supabaseUser.id
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
        center_id: profile.center_id,
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
    const startTime = Date.now()
    console.log(`[AuthContext] 🔑 Attempting sign in for: ${email}`)
    setLoading(true)

    try {
      const supabase = createClient()
      console.log(`[AuthContext] 📡 Calling Supabase signInWithPassword...`)
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error(`[AuthContext] ❌ Supabase auth error:`, error.message)
        setLoading(false)
        return { error, role: null }
      }
      
      const loginTime = Date.now()
      console.log(`[AuthContext] ✅ Supabase auth success in ${loginTime - startTime}ms. User ID: ${data.user?.id}`)
      
      // Auth state change will trigger loadUserData via onAuthStateChange
      // Just get role quickly from check-role API for immediate return
      const userId = data.user?.id
      if (!userId) {
        console.warn('[AuthContext] ⚠️ No user ID returned from Supabase')
        return { error: null, role: 'customer' }
      }
      
      // Quick role check (don't block on full profile) with timeout
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        const roleResponse = await fetch('/api/auth/check-role', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal
        })
        clearTimeout(timeout)
        if (roleResponse.ok) {
          const roleData = await roleResponse.json()
          console.log(`[AuthContext] 📦 Quick role check: ${roleData.role}`)
          return { error: null, role: roleData.role || 'customer' }
        }
      } catch {
        console.warn('[AuthContext] ⚠️ Quick role check failed, using fallback')
      }
      
      // Fallback to user metadata or default
      const metaRole = (data.user?.user_metadata as any)?.role
      const fallbackRole = metaRole || 'customer'
      const emailLower = email.toLowerCase()
      const detectedRole = emailLower.includes('admin') ? 'super_admin'
        : emailLower.includes('owner') ? 'clinic_owner'
        : emailLower.includes('sales') ? 'sales_staff'
        : emailLower.includes('customer') ? 'customer'
        : fallbackRole
      
      console.log(`[AuthContext] 📦 Using email-based fallback role: ${detectedRole}`)
      return { error: null, role: detectedRole }
    } catch (error: any) {
      console.error('[AuthContext] ❌ Sign in error:', error)
      setLoading(false)
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
          role: 'customer',
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

      // Clear browser storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()

        // Clear any cached auth data
        window.history.replaceState(null, '', '/auth/login')
      }

      // Sign out from Supabase
      await supabase.auth.signOut()

      console.log('[AuthContext] ✅ Signed out, redirecting to login...')

      // Small delay to ensure state is cleared
      setTimeout(() => {
        // Use window.location.href for hard redirect (more reliable than router.push)
        window.location.href = '/auth/login'
      }, 100)

    } catch (error) {
      console.error('[AuthContext] ❌ SignOut error:', error)

      // Clear state even on error
      setUser(null)
      setSupabaseUser(null)
      loadingUserIdRef.current = null
      loadedUserIdRef.current = null

      // Clear browser storage on error too
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      // Still redirect even if there's an error
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 100)
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
