async function testTenantAPI() {
  console.log('🧪 Testing Tenant API Endpoints...\n')

  // Helper function to make requests with retry
  async function makeRequest(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options)
        return response
      } catch (error) {
        if (i === retries - 1) throw error
        console.log(`   Retry ${i + 1}/${retries}...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  try {
    // Test GET /api/tenant
    console.log('1. Testing GET /api/tenant...')
    const getResponse = await makeRequest('http://localhost:3000/api/tenant')
    const getData = await getResponse.json()

    console.log(`   Status: ${getResponse.status}`)
    console.log(`   Tenants found: ${getData.tenants?.length || 0}`)

    if (getData.tenants && getData.tenants.length > 0) {
      getData.tenants.forEach((tenant, i) => {
        console.log(`   ${i + 1}. ${tenant.slug}: ${tenant.clinicName}`)
      })
      console.log('   ✅ GET tenant API working\n')
    } else if (getData.error) {
      console.log(`   ❌ Error: ${getData.error}\n`)
    }

    // Test POST /api/tenant (create new tenant)
    console.log('2. Testing POST /api/tenant (create tenant)...')
    const testTenant = {
      clinicName: 'Test Clinic API',
      slug: 'test-clinic-api',
      email: 'test@clinic.com',
      phone: '+66812345678',
      plan: 'premium',
      ownerId: 'test-owner-id'
    }

    const postResponse = await makeRequest('http://localhost:3000/api/tenant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTenant)
    })

    const postData = await postResponse.json()
    console.log(`   Status: ${postResponse.status}`)

    if (postData.tenant) {
      console.log(`   ✅ Created tenant: ${postData.tenant.slug}`)
      console.log('   ✅ POST tenant API working\n')
    } else if (postData.error) {
      console.log(`   ❌ Error: ${postData.error}\n`)
    }

    console.log('🎉 Tenant API testing complete!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testTenantAPI()
