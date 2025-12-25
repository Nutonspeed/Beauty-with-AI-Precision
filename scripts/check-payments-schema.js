/**
 * Check actual payments table schema
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

async function checkPaymentsSchema() {
  try {
    console.log('Checking payments table schema...\n')
    
    // Try to find existing payments table structure
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .limit(0)
    
    if (error) {
      console.error('Error accessing payments table:', error.message)
      
      // Check if table exists at all
      if (error.message.includes('does not exist')) {
        console.log('❌ Payments table does not exist')
        console.log('   Need to create payments table first')
      }
      return
    }
    
    console.log('✅ Payments table is accessible')
    
    // Try minimal insert to find required columns
    const testRecord = {
      invoice_id: '00000000-0000-0000-0000-000000000000',
      amount: 1000,
      payment_method: 'cash'
    }
    
    console.log('\nTesting minimal insert...')
    const { data: testData, error: testError } = await supabase
      .from('payments')
      .insert(testRecord)
      .select()
      .single()
    
    if (testError) {
      console.log('❌ Minimal insert failed:', testError.message)
      
      // Try with additional fields
      const testRecord2 = {
        ...testRecord,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'completed'
      }
      
      const { data: testData2, error: testError2 } = await supabase
        .from('payments')
        .insert(testRecord2)
        .select()
        .single()
      
      if (testError2) {
        console.log('❌ Still failed:', testError2.message)
        
        // Try with payment_number
        const testRecord3 = {
          ...testRecord2,
          payment_number: `PAY${Date.now()}`
        }
        
        const { data: testData3, error: testError3 } = await supabase
          .from('payments')
          .insert(testRecord3)
          .select()
          .single()
        
        if (testError3) {
          console.log('❌ All attempts failed. Last error:', testError3.message)
        } else {
          console.log('✅ Success with payment_number field!')
          // Clean up
          await supabase.from('payments').delete().eq('id', testData3.id)
        }
      } else {
        console.log('✅ Success with date and status!')
        // Clean up
        await supabase.from('payments').delete().eq('id', testData2.id)
      }
    } else {
      console.log('✅ Minimal insert works!')
      // Clean up
      await supabase.from('payments').delete().eq('id', testData.id)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkPaymentsSchema()
