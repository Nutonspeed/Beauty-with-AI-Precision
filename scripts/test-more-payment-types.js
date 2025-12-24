/**
 * Test more payment_type values
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

async function testMorePaymentTypes() {
  console.log('🧪 Testing more payment_type values...\n')
  
  // Try different formats that might be used
  const paymentTypes = [
    'CASH', 'CREDIT', 'DEBIT', 'TRANSFER', 
    'full_payment', 'partial_payment', 'deposit',
    '0', '1', '2',
    'income', 'expense'
  ]
  
  for (const type of paymentTypes) {
    console.log(`Trying payment_type: '${type}'`)
    
    const { error } = await supabase
      .from('payments')
      .insert({
        invoice_id: '00000000-0000-0000-0000-000000000000',
        amount: 100,
        payment_type: type,
        status: 'test'
      })
    
    if (error) {
      console.log(`   ❌ Failed`)
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
  
  console.log('\n💡 If none work, we need to check the constraint definition')
  console.log('   Run: SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = \'payments_payment_type_check\';')
}

testMorePaymentTypes()
