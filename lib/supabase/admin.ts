/**
 * Temporary Supabase Admin Client
 * Uses SERVICE_ROLE_KEY to bypass RLS during development
 * 
 * ⚠️ WARNING: ใช้เฉพาะตอน development เท่านั้น!
 * ⚠️ ห้ามใช้ใน production เด็ดขาด!
 */

import 'server-only'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

// Admin client ที่ bypass RLS
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// ⚠️ ใช้เฉพาะสำหรับ development
if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: Using supabaseAdmin in production!')
}
