require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testReportGeneration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as Super Admin (needed for global reports usually)
  console.log('Step 1: Logging in as Super Admin...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@ai367bar.com',
    password: 'Admin123!'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  const session = authData.session
  const apiUrl = 'http://localhost:3004/api/reports/generate' // Port updated to 3004

  // 2. Test Report Generation (Analytics)
  console.log('\nStep 2: Testing Analytics Report Generation...')
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'analytics',
        config: {
          title: 'Launch Readiness Analytics Report',
          dateRange: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          },
          metrics: ['users', 'sessions', 'features'],
          filters: {}
        }
      })
    })

    const result = await response.json()
    console.log('✅ Analytics Report API Response:', result.success ? 'Success' : 'Failed')
    if (result.success) {
        console.log('📊 Report Summary:', JSON.stringify(result.data.summary || {}, null, 2))
    } else {
        console.error('❌ Error details:', result.error)
    }
  } catch (error) {
    console.error('❌ Analytics Report Generation failed:', error.message)
    console.log('💡 Note: Ensure the dev server is running at http://localhost:3004')
  }

  // 3. Test Report Generation (Financial)
  console.log('\nStep 3: Testing Financial Report Generation...')
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type: 'financial',
        config: {
          title: 'Weekly Revenue Report',
          dateRange: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          },
          metrics: ['revenue', 'profit'],
          filters: {}
        }
      })
    })

    const result = await response.json()
    console.log('✅ Financial Report API Response:', result.success ? 'Success' : 'Failed')
    if (result.success) {
        console.log('💰 Revenue Total:', result.data.summary?.total_revenue || 0)
    } else {
        console.error('❌ Error details:', result.error)
    }
  } catch (error) {
    console.error('❌ Financial Report Generation failed:', error.message)
  }

  await supabase.auth.signOut()
}

testReportGeneration().catch(console.error)
