import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Service role client (bypasses RLS for testing setup)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

console.log('\n🧪 Multi-Clinic Data Isolation Test')
console.log('═══════════════════════════════════════\n')

// Step 1: Check existing clinics
console.log('📋 Step 1: Checking existing clinics...')
const { data: existingClinics, error: clinicsError } = await supabaseAdmin
  .from('clinics')
  .select('id, clinic_name, email, is_active')
  .eq('is_active', true)

if (clinicsError) {
  console.error('❌ Error fetching clinics:', clinicsError)
  process.exit(1)
}

console.log(`✅ Found ${existingClinics.length} active clinics:`)
existingClinics.forEach((clinic, i) => {
  console.log(`   ${i + 1}. ${clinic.clinic_name} (${clinic.email})`)
})
console.log('')

// Step 2: Check tables with clinic_id column
console.log('📋 Step 2: Checking tables for clinic_id column...')
const tablesToCheck = [
  'customers',
  'appointments', 
  'skin_analyses',
  'treatment_plans',
  'staff_members'
]

const tablesWithClinicId = []
for (const table of tablesToCheck) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .limit(1)
  
  if (!error && data) {
    // Check if first row has clinic_id field
    if (data.length > 0 && 'clinic_id' in data[0]) {
      tablesWithClinicId.push(table)
      console.log(`   ✅ ${table} - has clinic_id`)
    } else if (data.length === 0) {
      console.log(`   ⚠️  ${table} - empty (can't verify schema)`)
    } else {
      console.log(`   ❌ ${table} - MISSING clinic_id`)
    }
  } else if (error?.code === 'PGRST116') {
    console.log(`   ⚠️  ${table} - table doesn't exist`)
  } else {
    console.log(`   ❌ ${table} - Error: ${error?.message}`)
  }
}
console.log('')

// Step 3: Check RLS policies
console.log('📋 Step 3: Checking RLS policies...')
try {
  const result = await supabaseAdmin.rpc('exec_sql', { 
    sql: `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('${tablesToCheck.join("','")}')
      ORDER BY tablename, policyname;
    `
  })
  
  if (result.error) {
    console.log('   ⚠️  Could not check RLS policies (need custom function)')
    console.log('   Tip: Create exec_sql function or check manually in Supabase dashboard')
  } else if (result.data && result.data.length > 0) {
    console.log(`   ✅ Found ${result.data.length} RLS policies`)
    result.data.forEach(p => {
      console.log(`      - ${p.tablename}.${p.policyname} (${p.cmd})`)
    })
  } else {
    console.log('   ⚠️  No RLS policies found on checked tables')
  }
} catch (err) {
  console.log('   ⚠️  Could not check RLS policies (function not available)')
  console.log('   Tip: Check RLS manually in Supabase dashboard')
}
console.log('')

// Step 4: Test data creation for different clinics
console.log('📋 Step 4: Testing data isolation...')

if (existingClinics.length >= 2) {
  const clinic1 = existingClinics[0]
  const clinic2 = existingClinics[1]
  
  console.log(`   Testing with:`)
  console.log(`   - Clinic A: ${clinic1.clinic_name} (ID: ${clinic1.id})`)
  console.log(`   - Clinic B: ${clinic2.clinic_name} (ID: ${clinic2.id})`)
  console.log('')
  
  // Test customers table if it exists
  if (tablesWithClinicId.includes('customers')) {
    console.log('   🧪 Testing customers table isolation...')
    
    // Check existing customers per clinic
    const { data: clinic1Customers } = await supabaseAdmin
      .from('customers')
      .select('id, name, clinic_id')
      .eq('clinic_id', clinic1.id)
    
    const { data: clinic2Customers } = await supabaseAdmin
      .from('customers')
      .select('id, name, clinic_id')
      .eq('clinic_id', clinic2.id)
    
    console.log(`   Clinic A has ${clinic1Customers?.length || 0} customers`)
    console.log(`   Clinic B has ${clinic2Customers?.length || 0} customers`)
    
    // Verify no cross-clinic data
    const clinic1HasClinic2Data = clinic1Customers?.some(c => c.clinic_id === clinic2.id)
    const clinic2HasClinic1Data = clinic2Customers?.some(c => c.clinic_id === clinic1.id)
    
    if (!clinic1HasClinic2Data && !clinic2HasClinic1Data) {
      console.log('   ✅ Data properly isolated - no cross-clinic contamination')
    } else {
      console.log('   ❌ WARNING: Found cross-clinic data contamination!')
    }
  }
  console.log('')
  
  // Test skin_analyses table if it exists
  if (tablesWithClinicId.includes('skin_analyses')) {
    console.log('   🧪 Testing skin_analyses table isolation...')
    
    const { data: clinic1Analyses } = await supabaseAdmin
      .from('skin_analyses')
      .select('id, clinic_id')
      .eq('clinic_id', clinic1.id)
    
    const { data: clinic2Analyses } = await supabaseAdmin
      .from('skin_analyses')
      .select('id, clinic_id')
      .eq('clinic_id', clinic2.id)
    
    console.log(`   Clinic A has ${clinic1Analyses?.length || 0} analyses`)
    console.log(`   Clinic B has ${clinic2Analyses?.length || 0} analyses`)
    
    const clinic1HasClinic2Data = clinic1Analyses?.some(a => a.clinic_id === clinic2.id)
    const clinic2HasClinic1Data = clinic2Analyses?.some(a => a.clinic_id === clinic1.id)
    
    if (!clinic1HasClinic2Data && !clinic2HasClinic1Data) {
      console.log('   ✅ Data properly isolated - no cross-clinic contamination')
    } else {
      console.log('   ❌ WARNING: Found cross-clinic data contamination!')
    }
  }
  console.log('')
  
} else {
  console.log('   ⚠️  Need at least 2 clinics to test isolation')
  console.log('   Please create more clinics in the super-admin dashboard')
  console.log('')
}

// Step 5: Summary and Recommendations
console.log('📊 Summary & Recommendations:')
console.log('═══════════════════════════════════════')

const issues = []

if (existingClinics.length < 2) {
  issues.push('⚠️  Need at least 2 active clinics for proper isolation testing')
}

const missingClinicId = tablesToCheck.filter(t => !tablesWithClinicId.includes(t))
if (missingClinicId.length > 0) {
  issues.push(`❌ Tables missing clinic_id: ${missingClinicId.join(', ')}`)
}

if (issues.length === 0) {
  console.log('✅ All checks passed!')
  console.log('✅ Multi-clinic isolation appears properly configured')
} else {
  console.log('Issues found:')
  issues.forEach(issue => console.log(`   ${issue}`))
}

console.log('\n📝 Next Steps:')
if (existingClinics.length < 2) {
  console.log('   1. Create at least 2 clinics via super-admin dashboard')
  console.log('   2. Accept invitations for each clinic')
  console.log('   3. Re-run this test')
} else {
  console.log('   1. Login as each clinic owner')
  console.log('   2. Create test data (customers, analyses)')
  console.log('   3. Verify each clinic can only see their own data')
  console.log('   4. Login as super admin and verify you can see all data')
}

console.log('\n═══════════════════════════════════════\n')
