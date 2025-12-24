// Test Sales Journey Flow
// 1. Login as sales staff
// 2. Create lead
// 3. Create proposal
// 4. Check clinic revenue includes sales data

const testSalesJourney = async () => {
  console.log('🧪 Testing Sales Journey Flow...')
  
  const baseUrl = 'http://localhost:3005'
  
  try {
    // Step 1: Login as sales staff
    console.log('\n1️⃣ Logging in as sales staff...')
    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sales_demo@clinic.com',
        password: 'demo123'
      })
    })
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }
    
    const { session } = await loginResponse.json()
    const authHeaders = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
    console.log('✅ Login successful')
    
    // Step 2: Create lead
    console.log('\n2️⃣ Creating sales lead...')
    const leadResponse = await fetch(`${baseUrl}/api/sales/leads`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        customer_name: 'Test Customer',
        customer_email: 'customer@test.com',
        customer_phone: '0812345678',
        concern_type: 'acne',
        notes: 'Test lead from journey test',
        source: 'walk_in'
      })
    })
    
    if (!leadResponse.ok) {
      throw new Error(`Create lead failed: ${leadResponse.status}`)
    }
    
    const lead = await leadResponse.json()
    console.log('✅ Lead created:', lead.id)
    
    // Step 3: Create proposal
    console.log('\n3️⃣ Creating proposal...')
    const proposalResponse = await fetch(`${baseUrl}/api/sales/proposals`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        lead_id: lead.id,
        treatments: [
          {
            name: 'Acne Treatment',
            sessions: 5,
            price_per_session: 2000
          }
        ],
        total_price: 10000,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    })
    
    if (!proposalResponse.ok) {
      throw new Error(`Create proposal failed: ${proposalResponse.status}`)
    }
    
    const proposal = await proposalResponse.json()
    console.log('✅ Proposal created:', proposal.id)
    
    // Step 4: Check if sales data flows to clinic (would need clinic login)
    console.log('\n4️⃣ Sales journey completed!')
    console.log('   Lead ID:', lead.id)
    console.log('   Proposal ID:', proposal.id)
    console.log('   Status: Ready for clinic admin to view')
    
    return { success: true, lead, proposal }
    
  } catch (error) {
    console.error('❌ Sales journey test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testSalesJourney = testSalesJourney
  console.log('Run testSalesJourney() in browser console')
} else {
  testSalesJourney()
}
