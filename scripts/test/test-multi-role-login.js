require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const TEST_USERS = [
  { email: 'admin@ai367bar.com', password: 'Admin123!', role: 'super_admin' },
  { email: 'sales@example.com', password: 'password123', role: 'sales_staff' },
  { email: 'clinicadmin@test.com', password: 'password123', role: 'clinic_admin' },
  { email: 'customer@example.com', password: 'password123', role: 'customer' },
]

async function testLogin(email, password, expectedRole) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return false
  }

  const supabase = createClient(url, anonKey)
  
  console.log(`\nTesting login for: ${email} (Expected: ${expectedRole})`)
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    console.error(`❌ Login failed for ${email}:`, error.message)
    return false
  }

  console.log(`✅ Login successful for ${email}`)
  
  // Check profile/role in public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, clinic_id')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.error(`❌ Failed to fetch profile for ${email}:`, profileError.message)
    return false
  }

  console.log(`📊 Profile data: Role=${profile.role}, ClinicID=${profile.clinic_id || 'None'}`)
  
  if (profile.role !== expectedRole) {
    console.warn(`⚠️ Role mismatch! Expected ${expectedRole}, got ${profile.role}`)
  }

  await supabase.auth.signOut()
  return true
}

async function runAllTests() {
  console.log('🚀 Starting Login & Auth Flow Tests...')
  let successCount = 0
  
  for (const user of TEST_USERS) {
    const success = await testLogin(user.email, user.password, user.role)
    if (success) successCount++
  }

  console.log(`\n✨ Tests completed: ${successCount}/${TEST_USERS.length} successful`)
}

runAllTests().catch(console.error)
