import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      tenantId: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    tenantId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    tenantId?: string | null
  }
}
