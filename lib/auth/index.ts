// Mock auth function for build compatibility
export async function auth(options?: { token?: string }) {
  // If token provided, return mock session
  if (options?.token) {
    return {
      user: {
        id: 'mock-user-id',
        email: 'mock@example.com',
        clinicId: 'mock-clinic-id',
        role: 'customer'
      }
    }
  }
  return null
}

// Export core auth functions with aliases to avoid conflicts
export { getSession as getSupabaseSession } from './supabase-auth'
export { getSession as getClientSession } from './session'
export type { Session } from './session'
export { normalizeRole } from './role-normalize'
export type { UserRole } from './role-config'
export { hasPermission } from './role-config'
export * from './check-role'
export * from './middleware'
export * from './config'
export * from './use-supabase-auth'
