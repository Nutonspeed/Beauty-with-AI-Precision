'use client'

/**
 * Application Providers
 * Wraps the app with all necessary context providers
 */

import { SupabaseAuthProvider } from './supabase-auth-provider'
import { SmoothScroll } from './smooth-scroll'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <SmoothScroll>
        {children}
      </SmoothScroll>
    </SupabaseAuthProvider>
  )
}
