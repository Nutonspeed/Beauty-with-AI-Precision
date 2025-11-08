'use client'

/**
 * Application Providers
 * Wraps the app with all necessary context providers
 */

import { SupabaseAuthProvider } from './supabase-auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
}
