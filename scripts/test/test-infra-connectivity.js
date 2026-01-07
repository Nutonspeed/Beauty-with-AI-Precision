require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testConnectivity() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('--- Database Connectivity Test ---')
  console.log('URL:', url)
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase Environment Variables')
    process.exit(1)
  }

  const supabase = createClient(url, anonKey)

  try {
    // Test public access (Health Check)
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection Failed:', error.message)
    } else {
      console.log('✅ Connection Successful! Public "users" table reachable.')
    }

    // Test specific important table (e.g. branches or settings)
    const { data: branchData, error: branchError } = await supabase.from('branches').select('id, branch_name').limit(1)
    if (branchError) {
      console.warn('⚠️ Could not read "branches" table (might be RLS or schema):', branchError.message)
    } else {
      console.log('✅ Read "branches" successful. Branch name:', branchData[0]?.branch_name || 'No data')
    }

    // Check RLS on skin_analyses table (Risk check)
    const { data: skinData, error: skinError } = await supabase.from('skin_analyses').select('id, user_id, overall_score').limit(5)
    console.log('--- RLS Test (skin_analyses table) ---')
    if (skinError) {
      console.error('❌ RLS Test Failed:', skinError.message)
    } else {
      console.log(`✅ RLS Test: Visible analyses count = ${skinData.length}`)
      if (skinData.length > 0) {
        console.warn('❗ SECURITY ALERT: "skin_analyses" table is publicly readable with anon key!')
        console.log('Sample data (showing user IDs):', skinData.map(d => d.user_id))
      } else {
        console.log('✅ RLS Success: No public analysis data visible.')
      }
    }

  } catch (err) {
    console.error('❌ Unexpected Error during test:', err)
  }
}

testConnectivity()
