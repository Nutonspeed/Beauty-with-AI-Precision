/**
 * Check actual database schema using raw SQL
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

async function checkActualSchema() {
  try {
    console.log('Checking actual appointments table schema...\n')
    
    // Use raw SQL to query information_schema
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'appointments' 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `
      })
    
    if (error) {
      // Try alternative approach
      console.log('Trying direct SQL approach...')
      const { data: altData, error: altError } = await supabase
        .from('appointments')
        .select('*')
        .limit(0)
      
      if (altError) {
        console.error('Error:', altError)
        return
      }
      
      console.log('Cannot get column details directly, but table exists')
      return
    }
    
    console.log('Actual columns in appointments table:')
    data?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`)
    })
    
    // Now let's check what we actually need
    console.log('\n' + '='.repeat(60))
    console.log('Testing minimal insert...')
    
    // Try with just required columns
    const minimalRecord = {
      clinic_id: '5dc2607e-1c15-4e5a-b1a4-72fee5a91903',
      customer_id: '3c5d32c9-8996-4675-8192-2a6170ad0adc',
      appointment_date: '2025-01-27',
    }
    
    const { data: testData, error: testError } = await supabase
      .from('appointments')
      .insert(minimalRecord)
      .select()
      .single()
    
    if (testError) {
      console.error('Minimal insert failed:', testError.message)
    } else {
      console.log('✅ Minimal insert works! ID:', testData.id)
      
      // Clean up
      await supabase
        .from('appointments')
        .delete()
        .eq('id', testData.id)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkActualSchema()
