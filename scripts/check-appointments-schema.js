/**
 * Check actual appointments table schema
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkSchema() {
  try {
    // Try to select from appointments table to see actual columns
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(0)
    
    if (error) {
      console.error('Error accessing appointments table:', error)
      return
    }
    
    console.log('✅ Appointments table is accessible')
    console.log('\nTo check actual columns, let\'s try inserting a test record...')
    
    // Try a minimal insert to see what columns are required
    const testRecord = {
      clinic_id: '5dc2607e-1c15-4e5a-b1a4-72fee5a91903', // demo clinic
      customer_id: '3c5d32c9-8996-4675-8192-2a6170ad0adc', // demo customer
      service_type: 'Test Service',
      appointment_date: '2025-01-27',
      status: 'scheduled'
    }
    
    console.log('Test record:', testRecord)
    
    const { data: insertData, error: insertError } = await supabase
      .from('appointments')
      .insert(testRecord)
      .select()
      .single()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      
      // Check if it's a column error
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('\n❌ Column missing. Let\'s check what columns actually exist...')
        
        // Use raw SQL to check schema
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('get_table_columns', { table_name: 'appointments' })
        
        if (schemaError) {
          console.error('Schema check error:', schemaError)
        } else {
          console.log('\nActual columns in appointments table:')
          schemaData?.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`))
        }
      }
    } else {
      console.log('✅ Successfully inserted test record:', insertData.id)
      
      // Clean up
      await supabase
        .from('appointments')
        .delete()
        .eq('id', insertData.id)
      
      console.log('✅ Cleaned up test record')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkSchema()
