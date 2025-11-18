/**
 * Supabase Admin Client (server-only, lazy)
 * Uses SERVICE_ROLE_KEY to bypass RLS for server-side maintenance tasks.
 *
 * Do not use from Edge runtime or any client component.
 */

import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | undefined

/**
 * Returns a singleton Supabase admin client.
 * - Throws if called on the client or Edge runtime
 * - Validates required environment variables
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin is server-only')
  }

  // Prevent use in Edge runtime where secrets exposure risk is higher
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('supabaseAdmin is not allowed in Edge runtime')
  }

  if (!adminClient) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url) {
      throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!serviceKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    }

    adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    if (process.env.NODE_ENV === 'production') {
      // Log once on creation to aid audits; ensure server-only usage
      console.warn('⚠️ supabaseAdmin created in production (server-only). Ensure proper access controls.')
    }
  }

  return adminClient
}
