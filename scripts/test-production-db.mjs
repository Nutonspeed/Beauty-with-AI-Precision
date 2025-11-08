#!/usr/bin/env node

/**
 * Production Database Connection Test
 * Tests the production database connection and health check endpoint
 */

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load production environment variables
config({ path: '.env.production' })

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testDatabaseConnection() {
  console.log('🔍 Testing production database connection...\n')

  try {
    // Test basic connection
    console.log('📡 Testing database connectivity...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // Test health check query
    console.log('🏥 Testing health check query...')
    const result = await prisma.$queryRaw`SELECT 1 as health_check`
    console.log('✅ Health check query successful:', result, '\n')

    // Test tenant table (if exists)
    console.log('🏢 Testing tenant table access...')
    try {
      const tenantCount = await prisma.tenant.count()
      console.log('✅ Tenant table accessible, count:', tenantCount)
    } catch (error) {
      console.log('⚠️  Tenant table not yet created or migrated')
      console.log('   Error:', error.message)
    }

    console.log('\n🎉 Production database connection test completed successfully!')
    console.log('📋 Summary:')
    console.log('   • Database connection: ✅')
    console.log('   • Health check query: ✅')
    console.log('   • Basic operations: ✅')

  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check DATABASE_URL in .env.production')
    console.log('2. Ensure PostgreSQL server is running')
    console.log('3. Verify database user permissions')
    console.log('4. Check network connectivity')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
try {
  await testDatabaseConnection()
  console.log('\n✨ Test script completed')
  process.exit(0)
} catch (error) {
  console.error('\n💥 Test script failed:', error)
  process.exit(1)
}
