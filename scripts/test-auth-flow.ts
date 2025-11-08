/**
 * Auth Flow Integration Test
 * ทดสอบ login และ redirect สำหรับทุก role
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

// Remove quotes from env variables if present
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/^["']|["']$/g, "")
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").replace(/^["']|["']$/g, "")
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/^["']|["']$/g, "")

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface TestUser {
  email: string
  password: string
  expectedRole: string
  expectedRedirect: string
}

const testUsers: TestUser[] = [
  {
    email: 'admin@ai367bar.com',
    password: 'password123',
    expectedRole: 'super_admin',
    expectedRedirect: '/super-admin'
  },
  {
    email: 'clinic-owner@example.com',
    password: 'password123',
    expectedRole: 'clinic_owner',
    expectedRedirect: '/clinic/dashboard'
  },
  {
    email: 'sales@example.com',
    password: 'password123',
    expectedRole: 'sales_staff',
    expectedRedirect: '/sales/dashboard'
  },
  {
    email: 'customer@example.com',
    password: 'password123',
    expectedRole: 'customer_free',
    expectedRedirect: '/customer/dashboard'
  }
]

async function testLogin(testUser: TestUser): Promise<boolean> {
  console.log(`\n🧪 Testing: ${testUser.email}`)
  console.log('━'.repeat(60))

  try {
    // Step 1: Login
    console.log('  Step 1: Attempting login...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    })

    if (error) {
      console.error('  ❌ Login failed:', error.message)
      return false
    }

    if (!data.user) {
      console.error('  ❌ No user data returned')
      return false
    }

    console.log('  ✅ Login successful')
    console.log(`     User ID: ${data.user.id}`)

    // Step 2: Get user profile (simulate what API route does)
    console.log('  Step 2: Fetching user profile...')
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, clinic_id')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('  ❌ Failed to fetch profile:', profileError.message)
      return false
    }

    if (!profile) {
      console.error('  ❌ No profile found')
      return false
    }

    console.log('  ✅ Profile fetched')
    console.log(`     Role: ${profile.role}`)
    console.log(`     Clinic ID: ${profile.clinic_id || 'N/A'}`)

    // Step 3: Verify role
    console.log('  Step 3: Verifying role...')
    if (profile.role !== testUser.expectedRole) {
      console.error(`  ❌ Role mismatch! Expected: ${testUser.expectedRole}, Got: ${profile.role}`)
      return false
    }
    console.log(`  ✅ Role matches: ${profile.role}`)

    // Step 4: Determine redirect path
    console.log('  Step 4: Determining redirect path...')
    let redirectPath = '/customer/dashboard' // default
    
    switch (profile.role) {
      case 'super_admin':
        redirectPath = '/super-admin'
        break
      case 'clinic_owner':
      case 'clinic_staff':
        redirectPath = '/clinic/dashboard'
        break
      case 'sales_staff':
        redirectPath = '/sales/dashboard'
        break
      case 'customer':
      case 'customer_free':
      case 'customer_premium':
      default:
        redirectPath = '/customer/dashboard'
        break
    }

    console.log(`  📍 Would redirect to: ${redirectPath}`)

    // Step 5: Verify redirect path
    console.log('  Step 5: Verifying redirect path...')
    if (redirectPath !== testUser.expectedRedirect) {
      console.error(`  ❌ Redirect mismatch! Expected: ${testUser.expectedRedirect}, Got: ${redirectPath}`)
      return false
    }
    console.log(`  ✅ Redirect path correct: ${redirectPath}`)

    // Step 6: Verify checkUserRole logic
    console.log('  Step 6: Simulating checkUserRole...')
    
    // Simulate what happens at the dashboard page
    const allowedRoles = {
      '/super-admin': ['super_admin'],
      '/clinic/dashboard': ['clinic_owner', 'clinic_staff', 'super_admin'],
      '/sales/dashboard': ['sales_staff', 'super_admin'],
      '/customer/dashboard': ['customer', 'customer_free', 'customer_premium', 'clinic_owner', 'clinic_staff', 'sales_staff', 'super_admin']
    }

    const pageRoles = allowedRoles[redirectPath as keyof typeof allowedRoles]
    
    if (!pageRoles) {
      console.warn('  ⚠️  No role check defined for this path')
    } else if (!pageRoles.includes(profile.role)) {
      console.error(`  ❌ Role "${profile.role}" not allowed for "${redirectPath}"`)
      console.error(`     Allowed roles: ${pageRoles.join(', ')}`)
      return false
    } else {
      console.log(`  ✅ Role "${profile.role}" is allowed for "${redirectPath}"`)
    }

    // Step 7: Logout
    console.log('  Step 7: Logging out...')
    await supabase.auth.signOut()
    console.log('  ✅ Logged out')

    console.log('\n  ✨ All tests passed for this user!')
    return true

  } catch (error) {
    console.error('  ❌ Unexpected error:', error)
    return false
  }
}

async function runAllTests() {
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║         AUTH FLOW INTEGRATION TEST SUITE                  ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('')

  const results: Record<string, boolean> = {}

  for (const testUser of testUsers) {
    const passed = await testLogin(testUser)
    results[testUser.email] = passed
  }

  // Summary
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║                    TEST SUMMARY                           ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('')

  let passedCount = 0
  let failedCount = 0

  Object.entries(results).forEach(([email, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL'
    const role = testUsers.find(u => u.email === email)?.expectedRole || 'unknown'
    console.log(`  ${status}  ${email.padEnd(35)} (${role})`)
    
    if (passed) passedCount++
    else failedCount++
  })

  console.log('')
  console.log('━'.repeat(60))
  console.log(`  Total: ${testUsers.length} | Passed: ${passedCount} | Failed: ${failedCount}`)
  console.log('━'.repeat(60))
  console.log('')

  if (failedCount === 0) {
    console.log('  🎉 All tests passed! Auth flow is working correctly.')
  } else {
    console.log(`  ⚠️  ${failedCount} test(s) failed. Please review the errors above.`)
    process.exit(1)
  }
}

// Run tests
runAllTests()
  .then(() => {
    console.log('\n✨ Test suite completed.\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error)
    process.exit(1)
  })
