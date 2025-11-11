import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

console.log('\n📋 Checking Table Schemas\n')

const tables = ['customers', 'appointments', 'skin_analyses']

for (const table of tables) {
  console.log(`\n${table}:`)
  console.log('─'.repeat(50))
  
  try {
    // Try to get schema by querying with limit 0
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .limit(0)
    
    if (error) {
      console.log(`❌ Error: ${error.message}`)
      continue
    }
    
    // Get column info from empty query
    console.log('✅ Table exists')
    
    // Try to insert test data to see what columns are required/available
    const { error: insertError } = await supabaseAdmin
      .from(table)
      .insert({ _test: true })
      .select()
    
    if (insertError) {
      // Parse error to understand schema
      console.log(`Schema info from error: ${insertError.message}`)
      
      // Check if clinic_id is mentioned
      if (insertError.message.includes('clinic_id')) {
        console.log('✅ Has clinic_id column (required)')
      }
    }
    
  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
  }
}

// Check table structure directly
console.log('\n\n📊 Attempting to get column information...\n')

for (const table of tables) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .limit(1)
  
  if (data && data.length > 0) {
    console.log(`${table}:`)
    console.log('  Columns:', Object.keys(data[0]).join(', '))
    console.log('  Has clinic_id:', 'clinic_id' in data[0] ? '✅' : '❌')
  } else if (!error) {
    console.log(`${table}: Empty table - checking via insert...`)
  }
}

console.log('\n')
