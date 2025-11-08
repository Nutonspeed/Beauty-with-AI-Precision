import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAuthentication() {
  console.log('🔐 Testing Authentication System...\n')

  try {
    // Test 1: Check if users exist in database
    console.log('1. Checking database users...')
    const users = await prisma.user.findMany({
      include: {
        tenant: true
      }
    })

    console.log(`   Found ${users.length} users in database:`)
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.role}) - ${user.tenant?.slug || 'No tenant'}`)
    })
    console.log('   ✅ Database users verified\n')

    // Test 2: Test password verification
    console.log('2. Testing password verification...')
    const testUser = users.find(u => u.email === 'clinic-owner@example.com')
    if (testUser) {
      console.log(`   Stored hash: ${testUser.password}`)
      const isValid = await bcrypt.compare('password123', testUser.password)
      console.log(`   Password verification for ${testUser.email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)

      if (!isValid) {
        // Try to generate hash for debugging
        const newHash = await bcrypt.hash('password123', 12)
        console.log(`   Generated hash for 'password123': ${newHash}`)
        console.log('   ❌ Password verification failed - hash mismatch')
      } else {
        console.log('   ✅ Password verification working\n')
      }
    } else {
      console.log('   ❌ Test user not found\n')
    }

    // Test 3: Test NextAuth API endpoint (basic connectivity)
    console.log('3. Testing NextAuth API connectivity...')
    try {
      const response = await fetch('http://localhost:3000/api/auth/providers', {
        method: 'GET'
      })

      if (response.ok) {
        const providers = await response.json()
        console.log('   NextAuth providers:', Object.keys(providers))
        console.log('   ✅ NextAuth API accessible\n')
      } else {
        console.log(`   ❌ NextAuth API error: ${response.status}\n`)
      }
    } catch (error) {
      console.log(`   ❌ NextAuth API connection failed: ${error.message}\n`)
    }

    // Test 4: Test login simulation (mock)
    console.log('4. Testing login simulation...')
    if (testUser) {
      // Simulate what NextAuth authorize function does
      const credentials = {
        email: 'clinic-owner@example.com',
        password: 'password123'
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        include: { tenant: true }
      })

      if (user) {
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (isPasswordValid && user.isActive) {
          console.log('   ✅ Login simulation successful')
          console.log(`   User: ${user.name} (${user.role})`)
          console.log(`   Tenant: ${user.tenant?.slug || 'None'}`)
        } else {
          console.log('   ❌ Login simulation failed')
        }
      } else {
        console.log('   ❌ User not found')
      }
    }
    console.log('   ✅ Login simulation complete\n')

    // Test 5: Test invalid credentials
    console.log('5. Testing invalid credentials...')
    const invalidUser = await prisma.user.findUnique({
      where: { email: 'nonexistent@example.com' }
    })

    if (!invalidUser) {
      console.log('   ✅ Invalid email correctly rejected')
    } else {
      console.log('   ❌ Invalid email should not exist')
    }

    // Test wrong password
    if (testUser) {
      const wrongPassword = await bcrypt.compare('wrongpassword', testUser.password)
      if (!wrongPassword) {
        console.log('   ✅ Wrong password correctly rejected')
      } else {
        console.log('   ❌ Wrong password should be rejected')
      }
    }
    console.log('   ✅ Invalid credentials test complete\n')

    console.log('🎉 Authentication testing complete!')

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthentication()
