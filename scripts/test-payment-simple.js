/**
 * Simple Payment Test - Works with updated schema
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

async function testPaymentSimple() {
  console.log('🧪 Testing Payment Flow (Simple)...\n')
  
  try {
    // 1. Get existing invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (invoiceError || !invoice) {
      console.error('❌ No draft invoice found. Please run booking test first.')
      return
    }
    
    console.log('✅ Found draft invoice:', invoice.invoice_number)
    console.log(`   Amount: ฿${invoice.total_amount}`)
    
    // 2. Create payment
    const paymentNumber = `PAY${Date.now()}`
    
    console.log('\n💳 Creating payment...')
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        payment_number: paymentNumber,
        invoice_id: invoice.id,
        amount: invoice.total_amount,
        payment_type: 'full', // Required: 'full', 'partial', or 'refund'
        payment_method: 'cash', // Optional: actual payment method
        payment_date: new Date().toISOString().split('T')[0],
        payment_time: new Date().toTimeString().split(' ')[0],
        status: 'completed'
      })
      .select()
      .single()
    
    if (paymentError) {
      console.error('❌ Failed to create payment:', paymentError.message)
      console.log('\n💡 Did you run fix-payments-schema.sql in Supabase?')
      return
    }
    
    console.log(`✅ Created payment: ${payment.payment_number}`)
    
    // 3. Update invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        notes: `Paid via ${payment.payment_number}`
      })
      .eq('id', invoice.id)
    
    if (updateError) {
      console.error('❌ Failed to update invoice:', updateError.message)
      return
    }
    
    console.log('✅ Updated invoice to: paid')
    
    // 4. Create tax receipt
    const receiptNumber = `TAX${Date.now()}`
    
    console.log('\n🧾 Creating tax receipt...')
    
    const { data: taxReceipt, error: receiptError } = await supabase
      .from('tax_receipts')
      .insert({
        receipt_number: receiptNumber,
        invoice_id: invoice.id,
        payment_id: payment.id,
        clinic_id: invoice.clinic_id,
        customer_id: invoice.customer_id,
        receipt_date: new Date().toISOString().split('T')[0],
        subtotal: invoice.subtotal,
        discount_amount: invoice.discount_amount,
        vat_rate: invoice.tax_rate, // Use vat_rate instead of tax_rate
        vat_amount: invoice.tax_amount, // Use vat_amount instead of tax_amount
        total_amount: invoice.total_amount
      })
      .select()
      .single()
    
    if (receiptError) {
      console.error('❌ Failed to create tax receipt:', receiptError.message)
      return
    }
    
    console.log(`✅ Created tax receipt: ${taxReceipt.receipt_number}`)
    
    // 5. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Payment → Tax Receipt Flow Complete!')
    console.log(`   Invoice: ${invoice.invoice_number}`)
    console.log(`   Payment: ${payment.payment_number}`)
    console.log(`   Method: Cash`)
    console.log(`   Amount: ฿${payment.amount}`)
    console.log(`   Tax Receipt: ${taxReceipt.receipt_number}`)
    console.log(`   Tax Amount: ฿${taxReceipt.tax_amount}`)
    console.log('\n✅ Full flow works correctly!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testPaymentSimple()
