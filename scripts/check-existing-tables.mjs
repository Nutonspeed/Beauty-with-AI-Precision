import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('\n🔍 Checking Schema of Existing Tables\n')

// Check customers schema
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 CUSTOMERS Table Schema')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: sampleCustomer } = await supabase
  .from('customers')
  .select('*')
  .limit(1)

if (sampleCustomer && sampleCustomer.length > 0) {
  const columns = Object.keys(sampleCustomer[0])
  console.log(`✅ Found ${columns.length} columns:`)
  columns.forEach(col => {
    const hasValue = sampleCustomer[0][col] !== null
    console.log(`   ${hasValue ? '✓' : ' '} ${col}`)
  })
  console.log(`\n✅ Has clinic_id: ${columns.includes('clinic_id') ? 'YES' : 'NO'}`)
} else {
  console.log('ℹ️  Table is empty - trying with insert test...\n')
  
  // Try to get schema by attempting insert
  const { error } = await supabase
    .from('customers')
    .insert({ _test: true })
  
  if (error) {
    console.log('Schema hints from error:')
    console.log(`   ${error.message}`)
    
    if (error.message.includes('clinic_id')) {
      console.log('\n✅ Has clinic_id column!')
    } else {
      console.log('\n❌ No clinic_id column found')
    }
  }
}

// Check appointments schema
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 APPOINTMENTS Table Schema')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: sampleAppointment } = await supabase
  .from('appointments')
  .select('*')
  .limit(1)

if (sampleAppointment && sampleAppointment.length > 0) {
  const columns = Object.keys(sampleAppointment[0])
  console.log(`✅ Found ${columns.length} columns:`)
  columns.forEach(col => {
    const hasValue = sampleAppointment[0][col] !== null
    console.log(`   ${hasValue ? '✓' : ' '} ${col}`)
  })
  console.log(`\n✅ Has clinic_id: ${columns.includes('clinic_id') ? 'YES' : 'NO'}`)
} else {
  console.log('ℹ️  Table is empty - trying with insert test...\n')
  
  const { error } = await supabase
    .from('appointments')
    .insert({ _test: true })
  
  if (error) {
    console.log('Schema hints from error:')
    console.log(`   ${error.message}`)
    
    if (error.message.includes('clinic_id')) {
      console.log('\n✅ Has clinic_id column!')
    } else {
      console.log('\n❌ No clinic_id column found')
    }
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
