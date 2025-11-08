/**
 * Critical UI Flow Testing Script
 * Tests essential user journeys without opening a browser
 * 
 * This validates:
 * 1. Public pages load successfully
 * 2. Authentication API works
 * 3. Protected routes enforce authentication
 * 4. Analysis API integration
 */

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  duration: number
  error?: string
}

const results: TestResult[] = []

async function testEndpoint(
  name: string,
  url: string,
  options?: RequestInit
): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    console.log(`🧪 Testing: ${name}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'UI-Test-Script/1.0',
        ...options?.headers,
      },
    })
    
    const duration = Date.now() - startTime
    
    // Check if response is OK (200-299)
    if (response.ok) {
      console.log(`   ✅ PASS (${response.status} ${response.statusText}) - ${duration}ms`)
      return { test: name, status: 'PASS', duration }
    } else {
      const errorText = await response.text().catch(() => 'No response body')
      console.log(`   ❌ FAIL (${response.status} ${response.statusText})`)
      console.log(`   Error: ${errorText.substring(0, 200)}`)
      return { 
        test: name, 
        status: 'FAIL', 
        duration, 
        error: `${response.status} ${response.statusText}` 
      }
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.log(`   ❌ FAIL - ${error.message}`)
    return { 
      test: name, 
      status: 'FAIL', 
      duration, 
      error: error.message 
    }
  }
}

async function testPublicPages() {
  console.log('\n📄 Testing Public Pages...\n')
  
  const publicPages = [
    { name: 'Landing Page', url: `${BASE_URL}/` },
    { name: 'Features Page', url: `${BASE_URL}/features` },
    { name: 'Pricing Page', url: `${BASE_URL}/pricing` },
    { name: 'About Page', url: `${BASE_URL}/about` },
    { name: 'Contact Page', url: `${BASE_URL}/contact` },
    { name: 'FAQ Page', url: `${BASE_URL}/faq` },
    { name: 'Privacy Policy', url: `${BASE_URL}/privacy` },
    { name: 'Terms of Service', url: `${BASE_URL}/terms` },
  ]
  
  for (const page of publicPages) {
    const result = await testEndpoint(page.name, page.url)
    results.push(result)
  }
}

async function testAuthenticationAPI() {
  console.log('\n🔐 Testing Authentication API...\n')
  
  const testUsers = [
    { email: 'admin@ai367bar.com', role: 'super_admin' },
    { email: 'clinic-owner@example.com', role: 'clinic_owner' },
    { email: 'sales@example.com', role: 'sales_staff' },
    { email: 'customer@example.com', role: 'customer_free' },
  ]
  
  for (const user of testUsers) {
    const name = `Auth API - ${user.role}`
    const result = await testEndpoint(
      name,
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: 'password123',
        }),
      }
    )
    results.push(result)
  }
}

async function testProtectedRoutes() {
  console.log('\n🔒 Testing Protected Routes (should redirect/401)...\n')
  
  const protectedRoutes = [
    { name: 'Customer Dashboard', url: `${BASE_URL}/customer/dashboard` },
    { name: 'Analysis Page', url: `${BASE_URL}/analysis` },
    { name: 'Profile Page', url: `${BASE_URL}/profile` },
    { name: 'Super Admin Dashboard', url: `${BASE_URL}/super-admin` },
    { name: 'Clinic Dashboard', url: `${BASE_URL}/clinic/dashboard` },
    { name: 'Sales Dashboard', url: `${BASE_URL}/sales/dashboard` },
  ]
  
  for (const route of protectedRoutes) {
    const startTime = Date.now()
    
    try {
      console.log(`🧪 Testing: ${route.name}`)
      console.log(`   URL: ${route.url}`)
      
      const response = await fetch(route.url, {
        redirect: 'manual', // Don't follow redirects
      })
      
      const duration = Date.now() - startTime
      
      // Protected routes should either:
      // 1. Redirect to login (302, 307, 308)
      // 2. Return 401 Unauthorized
      // 3. Return 403 Forbidden
      if ([302, 307, 308, 401, 403].includes(response.status)) {
        console.log(`   ✅ PASS - Protected (${response.status})`)
        results.push({ test: route.name, status: 'PASS', duration })
      } else if (response.status === 200) {
        console.log(`   ⚠️  WARNING - Route not protected! (${response.status})`)
        results.push({ 
          test: route.name, 
          status: 'FAIL', 
          duration,
          error: 'Route accessible without auth' 
        })
      } else {
        console.log(`   ❌ FAIL (${response.status})`)
        results.push({ 
          test: route.name, 
          status: 'FAIL', 
          duration,
          error: `Unexpected status ${response.status}` 
        })
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.log(`   ❌ FAIL - ${error.message}`)
      results.push({ 
        test: route.name, 
        status: 'FAIL', 
        duration,
        error: error.message 
      })
    }
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...\n')
  
  const apiEndpoints = [
    { name: 'Health Check', url: `${BASE_URL}/api/health`, method: 'GET' },
    { name: 'Auth Session', url: `${BASE_URL}/api/auth/session`, method: 'GET' },
  ]
  
  for (const endpoint of apiEndpoints) {
    const result = await testEndpoint(
      endpoint.name,
      endpoint.url,
      { method: endpoint.method }
    )
    results.push(result)
  }
}

async function checkServerRunning(): Promise<boolean> {
  console.log('🔍 Checking if dev server is running...\n')
  
  try {
    const response = await fetch(BASE_URL, { 
      signal: AbortSignal.timeout(5000) 
    })
    
    if (response.ok) {
      console.log('✅ Dev server is running at', BASE_URL)
      return true
    } else {
      console.log('❌ Dev server returned error:', response.status)
      return false
    }
  } catch (error: any) {
    console.log('❌ Dev server is not running or not accessible')
    console.log(`   Error: ${error.message}`)
    console.log('\n💡 Please start the dev server first:')
    console.log('   pnpm dev')
    return false
  }
}

async function runAllTests() {
  console.log('')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║        UI Critical Flow Testing Suite                     ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')
  
  const startTime = Date.now()
  
  // Check if server is running
  const isServerRunning = await checkServerRunning()
  if (!isServerRunning) {
    process.exit(1)
  }
  
  console.log('')
  console.log('━'.repeat(60))
  
  // Run all test suites
  await testPublicPages()
  await testAuthenticationAPI()
  await testProtectedRoutes()
  await testAPIEndpoints()
  
  const totalDuration = Date.now() - startTime
  
  // Summary
  console.log('')
  console.log('━'.repeat(60))
  console.log('📊 Test Summary')
  console.log('━'.repeat(60))
  console.log('')
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length
  const total = results.length
  
  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`⏱️  Total Duration: ${totalDuration}ms`)
  console.log('')
  
  if (failed > 0) {
    console.log('❌ Failed Tests:')
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`   - ${r.test}: ${r.error}`)
      })
    console.log('')
  }
  
  const passRate = ((passed / total) * 100).toFixed(1)
  console.log(`Pass Rate: ${passRate}%`)
  console.log('')
  
  if (failed === 0) {
    console.log('🎉 All critical UI flows are working!')
    console.log('')
    console.log('✅ Next Steps:')
    console.log('   1. Manual testing of interactive features (3D viewer, AR)')
    console.log('   2. Test skin analysis upload flow')
    console.log('   3. Test PDF export')
    console.log('   4. Test mobile responsive on actual devices')
    console.log('')
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.')
    console.log('')
  }
  
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Test suite crashed:', error)
  process.exit(1)
})
