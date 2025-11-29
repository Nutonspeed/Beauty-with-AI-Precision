import NextAuth from 'next-auth'
// Fallback for missing NextAuth Supabase adapter
const _SupabaseAdapter = (_options: { url: string; secret: string }) => {
  // Fallback implementation - returns a mock adapter
  return {
    adapter: {
      createUser: async (user: any) => user,
      getUser: async (_id: string) => null,
      getUserByEmail: async (_email: string) => null,
      getUserByAccount: async (_providerAccountId: any) => null,
      updateUser: async (user: any) => user,
      deleteUser: async (_id: string) => {},
      linkAccount: async (account: any) => account,
      unlinkAccount: async (_providerAccountId: any) => {},
      createSession: async (session: any) => session,
      getSessionAndUser: async (_sessionToken: string) => null,
      updateSession: async (session: any) => session,
      deleteSession: async (_sessionToken: string) => {},
      createVerificationToken: async (token: any) => token,
      useVerificationToken: async (_token: any) => null,
      invalidateVerificationToken: async (_token: any) => {},
    }
  }
}
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  // adapter: SupabaseAdapter({
  //   url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),
  callbacks: {
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    jwt: async ({ user, token }: { user: any; token: any }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
}

export default NextAuth(authOptions)
