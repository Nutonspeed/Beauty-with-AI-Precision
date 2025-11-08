import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating test user...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'customer_free',
      isActive: true,
    },
  })

  console.log('✅ Test user created successfully!')
  console.log('Email:', user.email)
  console.log('Password: password123')
  console.log('Role:', user.role)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
