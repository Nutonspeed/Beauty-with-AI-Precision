require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testSalesFlow() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as Sales Staff
  console.log('Step 1: Logging in as Sales Staff (sales@example.com)...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'sales@example.com',
    password: 'password123'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  // Get clinic_id for this sales person
  const { data: profile } = await supabase.from('users').select('clinic_id').eq('id', authData.user.id).single()
  const clinicId = profile?.clinic_id
  console.log(`🏥 Sales Clinic ID: ${clinicId}`)

  // 2. Test Reading Leads
  console.log('\nStep 2: Fetching Sales Leads...')
  const { data: leads, error: leadsError } = await supabase
    .from('sales_leads')
    .select('*')
    .eq('clinic_id', clinicId)

  if (leadsError) {
    console.error('❌ Failed to fetch leads:', leadsError.message)
  } else {
    console.log(`✅ Found ${leads.length} leads in this clinic.`)
  }

  // 3. Test Lead Activities (Audit Log)
  if (leads && leads.length > 0) {
    const leadId = leads[0].id
    console.log(`\nStep 3: Fetching activities for Lead ID: ${leadId}...`)
    const { data: activities, error: actError } = await supabase
      .from('sales_activities')
      .select('*')
      .eq('lead_id', leadId)

    if (actError) {
      console.error('❌ Failed to fetch activities:', actError.message)
    } else {
      console.log(`✅ Found ${activities.length} activities.`)
    }
  }

  await supabase.auth.signOut()
}

testSalesFlow().catch(console.error)
