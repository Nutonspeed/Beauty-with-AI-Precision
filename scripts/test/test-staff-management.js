require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testStaffManagement() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as Clinic Admin
  console.log('Step 1: Logging in as Clinic Admin (clinicadmin@test.com)...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'clinicadmin@test.com',
    password: 'password123'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  // Get clinic_id for this admin
  const { data: adminProfile } = await supabase.from('users').select('clinic_id').eq('id', authData.user.id).single()
  const clinicId = adminProfile?.clinic_id

  if (!clinicId) {
    console.warn('⚠️ Clinic Admin has no clinic_id. Testing RLS might be restricted.')
  } else {
    console.log(`🏥 Admin Clinic ID: ${clinicId}`)
  }

  // 2. Test Reading Staff
  console.log('\nStep 2: Fetching Staff List...')
  const { data: staffList, error: readError } = await supabase
    .from('users')
    .select('id, email, role, full_name')
    .eq('clinic_id', clinicId || '00000000-0000-0000-0000-000000000000')

  if (readError) {
    console.error('❌ Failed to fetch staff list:', readError.message)
  } else {
    console.log(`✅ Found ${staffList.length} staff members in this clinic.`)
  }

  // 3. Test Staff Data Isolation
  console.log('\nStep 3: Verifying Multi-tenancy Isolation (Staff from other clinics)...')
  const { data: otherStaff, error: otherError } = await supabase
    .from('users')
    .select('id, email, clinic_id')
    .neq('clinic_id', clinicId || '00000000-0000-0000-0000-000000000000')
    .not('clinic_id', 'is', null)
    .limit(5)

  if (otherError) {
     console.log('✅ RLS Blocked reading other clinic staff:', otherError.message)
  } else if (otherStaff && otherStaff.length > 0) {
    console.warn('⚠️ SECURITY ALERT: Clinic Admin can see staff from other clinics!')
    console.log('Sample leaked data:', otherStaff.map(s => ({ email: s.email, cid: s.clinic_id })))
  } else {
    console.log('✅ Data isolation confirmed (No other clinic staff visible)')
  }

  await supabase.auth.signOut()
}

testStaffManagement().catch(console.error)
