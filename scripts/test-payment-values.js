/**
 * Test different payment_type values
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

async function testPaymentTypes() {
  console.log('🧪 Testing different payment_type values...\n')
  
  // Common payment types to try
  const paymentTypes = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'promptpay', 'cash_payment']
  
  for (const type of paymentTypes) {
    console.log(`Trying payment_type: '${type}'`)
    
    const { error } = await supabase
      .from('payments')
      .insert({
        invoice_id: '00000000-0000-0000-0000-000000000000', // dummy ID
        amount: 100,
        payment_type: type,
        status: 'test'
      })
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`)
    } else {
      console.log(`   ✅ Success! '${type}' works`)
      // Clean up
      await supabase
        .from('payments')
        .delete()
        .eq('payment_type', type)
        .eq('status', 'test')
      break
    }
  }
}

testPaymentTypes()
