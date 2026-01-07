require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testSuperAdminMgmt() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as Super Admin
  console.log('Step 1: Logging in as Super Admin (admin@ai367bar.com)...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@ai367bar.com',
    password: 'Admin123!'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  // 2. Test Reading All Users (Super Admin privilege)
  console.log('\nStep 2: Fetching All Users (across clinics)...')
  const { data: allUsers, error: readError } = await supabase
    .from('users')
    .select('id, email, role, clinic_id')
    .limit(10)

  if (readError) {
    console.error('❌ Failed to fetch all users:', readError.message)
  } else {
    console.log(`✅ Successfully fetched ${allUsers.length} users.`)
    console.log('Sample roles found:', [...new Set(allUsers.map(u => u.role))])
  }

  // 3. Test Reading System Stats (Analyses from all clinics)
  console.log('\nStep 3: Fetching Global System Stats...')
  const { count: globalAnalyses, error: statsError } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact', head: true })

  if (statsError) {
    console.error('❌ Failed to fetch global stats:', statsError.message)
  } else {
    console.log(`✅ Global Analysis Count: ${globalAnalyses}`)
  }

  await supabase.auth.signOut()
}

testSuperAdminMgmt().catch(console.error)
