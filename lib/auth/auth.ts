import NextAuth from 'next-auth'
import { authOptions } from './config'

// Create the NextAuth handler
const handler = NextAuth(authOptions)

// Export as both default and named for compatibility
export default handler
export { handler as auth }

// Helper functions
export async function getSession() {
  return await handler()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}
