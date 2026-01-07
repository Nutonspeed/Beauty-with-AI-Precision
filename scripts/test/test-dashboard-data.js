require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testDashboardData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as customer
  console.log('Step 1: Logging in as customer (customer@example.com)...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'customer@example.com',
    password: 'password123'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  // 2. Fetch Dashboard Statistics (Simulating Customer Dashboard)
  console.log('\nStep 2: Fetching Customer Dashboard Stats...')
  
  // Analyses count
  const { count: analysisCount, error: analysisErr } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authData.user.id)

  if (analysisErr) {
    console.error('❌ Failed to fetch analysis count:', analysisErr.message)
  } else {
    console.log(`📊 Analysis History Count: ${analysisCount}`)
  }

  // Bookings count
  const { count: bookingCount, error: bookingErr } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', authData.user.id)

  if (bookingErr) {
    console.error('❌ Failed to fetch booking count:', bookingErr.message)
  } else {
    console.log(`📊 Total Bookings Count: ${bookingCount}`)
  }

  // 3. Login as Sales/Clinic Staff
  console.log('\nStep 3: Logging in as Sales Staff (sales@example.com)...')
  const { data: salesAuth, error: salesError } = await supabase.auth.signInWithPassword({
    email: 'sales@example.com',
    password: 'password123'
  })

  if (salesError) {
    console.error('❌ Sales login failed:', salesError.message)
  } else {
    console.log('✅ Sales Login successful')
    
    // Fetch Clinic-wide stats (Simulating Sales/Clinic Dashboard)
    const { data: userData } = await supabase.from('users').select('clinic_id').eq('id', salesAuth.user.id).single()
    const clinicId = userData?.clinic_id

    if (clinicId) {
      console.log(`🏥 Clinic ID: ${clinicId}`)
      
      const { count: clinicAnalyses } = await supabase
        .from('skin_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
      
      const { count: clinicBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)

      console.log(`📊 Clinic Total Analyses: ${clinicAnalyses || 0}`)
      console.log(`📊 Clinic Total Bookings: ${clinicBookings || 0}`)
    }
  }

  await supabase.auth.signOut()
}

testDashboardData().catch(console.error)
