/*
  Prisma client loader that gracefully degrades if @prisma/client hasn't been generated yet.
  This avoids TypeScript compile errors in environments without a schema.prisma.
*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientCtor: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@prisma/client')
  PrismaClientCtor = mod?.PrismaClient
} catch {
  PrismaClientCtor = class {
    async $connect() { /* noop */ }
    async $disconnect() { /* noop */ }
  }
}

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var prisma: undefined | { $connect: () => Promise<void>; $disconnect: () => Promise<void> }
}

// Use a singleton instance in dev to avoid too many connections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = globalThis.prisma || new PrismaClientCtor({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect()
    console.log('Database disconnected successfully')
  } catch (error) {
    console.error('Error disconnecting from database:', error)
    process.exit(1)
  }
}
