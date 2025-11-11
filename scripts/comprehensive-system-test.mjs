import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('\n🎯 Comprehensive System Test\n')
console.log('Testing existing features that ARE working:\n')

// Test 1: Clinics
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 TEST 1: Clinics Table')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: clinics, error: clinicsError } = await supabase
  .from('clinics')
  .select('id, clinic_name, email, subscription_tier, is_active')
  .eq('is_active', true)

if (clinicsError) {
  console.log('❌ Error:', clinicsError.message)
} else {
  console.log(`✅ Found ${clinics.length} active clinics:`)
  clinics.forEach((clinic, i) => {
    console.log(`   ${i + 1}. ${clinic.clinic_name || 'Unnamed'} (${clinic.email || 'No email'})`)
    console.log(`      ID: ${clinic.id}`)
    console.log(`      Tier: ${clinic.subscription_tier || 'starter'}`)
  })
}
console.log('')

// Test 2: Invitations
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 TEST 2: Invitations System')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: invitations, error: invitationsError } = await supabase
  .from('invitations')
  .select('email, invited_role, status, clinic_id, created_at')
  .order('created_at', { ascending: false })
  .limit(5)

if (invitationsError) {
  console.log('❌ Error:', invitationsError.message)
} else {
  console.log(`✅ Found ${invitations.length} recent invitations:`)
  invitations.forEach((inv, i) => {
    console.log(`   ${i + 1}. ${inv.email} (${inv.invited_role})`)
    console.log(`      Status: ${inv.status}`)
    console.log(`      Clinic ID: ${inv.clinic_id || 'N/A'}`)
  })
}
console.log('')

// Test 3: Skin Analyses (with clinic_id)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 TEST 3: Skin Analyses (Multi-Tenant)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: analyses, error: analysesError } = await supabase
  .from('skin_analyses')
  .select('id, clinic_id, patient_name, created_at')
  .order('created_at', { ascending: false })
  .limit(10)

if (analysesError) {
  console.log('❌ Error:', analysesError.message)
} else {
  console.log(`✅ Found ${analyses.length} analyses:`)
  
  // Group by clinic
  const byClinic = {}
  analyses.forEach(a => {
    const cid = a.clinic_id || 'no_clinic'
    if (!byClinic[cid]) byClinic[cid] = []
    byClinic[cid].push(a)
  })
  
  Object.entries(byClinic).forEach(([clinicId, items]) => {
    const clinic = clinics?.find(c => c.id === clinicId)
    const clinicName = clinic?.clinic_name || (clinicId === 'no_clinic' ? 'No Clinic' : 'Unknown')
    console.log(`\n   🏥 ${clinicName}:`)
    items.forEach(a => {
      console.log(`      - ${a.patient_name || 'Anonymous'} (${new Date(a.created_at).toLocaleDateString()})`)
    })
  })
}
console.log('\n')

// Test 4: Users & Roles
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 TEST 4: Users & Roles')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: users, error: usersError } = await supabase
  .from('users')
  .select('id, email, role, clinic_id')
  .order('created_at', { ascending: false })
  .limit(10)

if (usersError) {
  console.log('❌ Error:', usersError.message)
} else {
  console.log(`✅ Found ${users.length} users:`)
  
  const roleGroups = {}
  users.forEach(u => {
    if (!roleGroups[u.role]) roleGroups[u.role] = []
    roleGroups[u.role].push(u)
  })
  
  Object.entries(roleGroups).forEach(([role, userList]) => {
    console.log(`\n   👤 ${role.toUpperCase()}:`)
    userList.forEach(u => {
      const clinic = clinics?.find(c => c.id === u.clinic_id)
      const clinicName = clinic?.clinic_name || 'No clinic'
      console.log(`      - ${u.email} → ${clinicName}`)
    })
  })
}
console.log('\n')

// Test 5: Check for missing tables
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 TEST 5: Check Required Tables')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const requiredTables = ['customers', 'appointments', 'staff_members', 'treatment_plans']
const missingTables = []
const existingTables = []

for (const table of requiredTables) {
  const { error } = await supabase.from(table).select('id').limit(0)
  
  if (error?.code === 'PGRST116') {
    console.log(`   ❌ ${table} - NOT FOUND (needs migration)`)
    missingTables.push(table)
  } else if (error) {
    console.log(`   ⚠️  ${table} - Error: ${error.message}`)
  } else {
    console.log(`   ✅ ${table} - exists`)
    existingTables.push(table)
  }
}
console.log('')

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 SUMMARY')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('✅ WORKING:')
console.log(`   - Clinics: ${clinics?.length || 0} active`)
console.log(`   - Invitations: ${invitations?.length || 0} recent`)
console.log(`   - Skin Analyses: ${analyses?.length || 0} with clinic_id`)
console.log(`   - Users: ${users?.length || 0} registered`)
console.log(`   - Existing tables: ${existingTables.join(', ') || 'none'}`)

if (missingTables.length > 0) {
  console.log('\n⚠️  NEEDS MIGRATION:')
  console.log(`   - Missing tables: ${missingTables.join(', ')}`)
  console.log('   - Action: Apply 20251111_add_critical_tables.sql')
}

console.log('\n📝 NEXT STEPS:')
if (missingTables.length > 0) {
  console.log('   1. Apply migration via Supabase Dashboard')
  console.log('   2. Re-run this test script')
  console.log('   3. Create test data in different clinics')
  console.log('   4. Verify RLS isolation')
} else {
  console.log('   1. ✅ All tables exist!')
  console.log('   2. Create test customers in clinic 1')
  console.log('   3. Create test customers in clinic 2')
  console.log('   4. Verify each clinic sees only their data')
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
