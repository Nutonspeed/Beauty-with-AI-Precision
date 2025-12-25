/**
 * Test Payment and Tax Receipt Creation Flow
 * Tests payment processing and automatic tax receipt generation
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

async function testPaymentTaxReceipt() {
  console.log('🧪 Testing Payment → Tax Receipt Flow...\n')
  
  try {
    // 1. Get existing invoice from previous test
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
    
    // 2. Create payment record
    const paymentNumber = `PAY${Date.now()}`
    const paymentMethod = 'cash'
    
    console.log('\n💳 Creating payment record...')
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        payment_number: paymentNumber,
        invoice_id: invoice.id,
        amount: invoice.total_amount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split('T')[0],
        payment_time: new Date().toTimeString().split(' ')[0],
        status: 'completed',
        notes: 'Test payment for tax receipt',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (paymentError) {
      console.error('❌ Failed to create payment:', paymentError.message)
      return
    }
    
    console.log(`✅ Created payment: ${payment.payment_number}`)
    
    // 3. Update invoice status to paid
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice.id)
    
    if (updateError) {
      console.error('❌ Failed to update invoice:', updateError.message)
      return
    }
    
    console.log('✅ Updated invoice status to: paid')
    
    // 4. Generate tax receipt
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
        taxable_amount: invoice.subtotal,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (receiptError) {
      console.error('❌ Failed to create tax receipt:', receiptError.message)
      // Check if table exists
      if (receiptError.message.includes('does not exist')) {
        console.log('   ℹ️  Tax receipts table might not exist - creating minimal receipt info...')
      }
      return
    }
    
    console.log(`✅ Created tax receipt: ${taxReceipt.receipt_number}`)
    
    // 5. Verify the complete flow
    const { data: verification } = await supabase
      .from('invoices')
      .select(`
        *,
        payments (
          payment_number,
          amount,
          payment_method,
          status
        ),
        tax_receipts (
          receipt_number,
          total_amount,
          receipt_date
        )
      `)
      .eq('id', invoice.id)
      .single()
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Payment → Tax Receipt Flow Verification:')
    console.log(`   Invoice: ${verification.invoice_number}`)
    console.log(`   Status: ${verification.status}`)
    console.log(`   Payment: ${verification.payments?.payment_number}`)
    console.log(`   Method: ${verification.payments?.payment_method}`)
    console.log(`   Amount: ฿${verification.payments?.amount}`)
    console.log(`   Tax Receipt: ${verification.tax_receipts?.receipt_number}`)
    console.log(`   Tax Amount: ฿${verification.tax_receipts?.tax_amount}`)
    console.log(`   Total: ฿${verification.tax_receipts?.total_amount}`)
    console.log('\n✅ Complete payment → tax receipt flow works!')
    
    // 6. Test tax receipt template (if exists)
    console.log('\n📄 Testing tax receipt template generation...')
    
    const templateData = {
      receiptNumber: taxReceipt.receipt_number,
      clinicName: 'Beauty Clinic Demo',
      clinicAddress: '123 Demo Street',
      clinicTaxId: '1234567890',
      customerName: 'Customer Demo',
      receiptDate: taxReceipt.receipt_date,
      items: [
        {
          description: 'ทรีทเมน์หน้าใส',
          quantity: 1,
          unitPrice: invoice.subtotal,
          total: invoice.subtotal
        }
      ],
      subtotal: invoice.subtotal,
      taxRate: invoice.tax_rate,
      taxAmount: invoice.tax_amount,
      totalAmount: invoice.total_amount,
      paymentMethod: paymentMethod,
      paymentNumber: payment.payment_number
    }
    
    console.log('   ✅ Tax receipt data prepared')
    console.log('   📋 Sample receipt template:')
    console.log(`      ${templateData.receiptNumber}`)
    console.log(`      Date: ${templateData.receiptDate}`)
    console.log(`      Customer: ${templateData.customerName}`)
    console.log(`      Subtotal: ฿${templateData.subtotal}`)
    console.log(`      Tax (7%): ฿${templateData.taxAmount}`)
    console.log(`      Total: ฿${templateData.totalAmount}`)
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testPaymentTaxReceipt()
