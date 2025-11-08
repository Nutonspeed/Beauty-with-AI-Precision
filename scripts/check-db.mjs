import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking database data...')

  const tenants = await prisma.tenant.findMany()
  console.log(`Found ${tenants.length} tenants:`)
  tenants.forEach(tenant => {
    console.log(`- ${tenant.slug}:`, tenant.settings)
  })

  const users = await prisma.user.findMany()
  console.log(`Found ${users.length} users:`)
  users.forEach(user => {
    console.log(`- ${user.email}: ${user.role}`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
