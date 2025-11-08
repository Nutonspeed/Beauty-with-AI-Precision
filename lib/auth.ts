import { NextAuthOptions, getServerSession } from 'next-auth';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { prisma } from '@/lib/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Disabled: Using Supabase instead
  session: {
    strategy: 'jwt',  // Use JWT for session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Replace with Supabase auth or Prisma as appropriate for your project
        const user = await (global as any).prisma?.user?.findUnique?.({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            image: true,
            tenantId: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        const resultUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          tenantId: user.tenantId ?? null,
        };
        return resultUser as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? undefined;
        ;(token as any).tenantId = (user as any).tenantId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token as any).role as string;
        ;(session.user as any).tenantId = (token as any).tenantId ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get the current user in API routes
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

// Re-export for convenience
export { getServerSession } from 'next-auth/next';
// Rely on type augmentation in types/next-auth.d.ts
