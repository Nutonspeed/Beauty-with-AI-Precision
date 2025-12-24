/**
 * Minimal Booking Test - Works with actual schema
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

async function testMinimalBooking() {
  console.log('🧪 Testing Minimal Booking Flow...\n')
  
  try {
    // 1. Get demo data
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', 'beauty-clinic-demo')
      .single()
    
    const { data: customer } = await supabase
      .from('customers')
      .select('id, full_name')
      .eq('email', 'customer@test.com')
      .single()
    
    const { data: service } = await supabase
      .from('services')
      .select('id, name, price')
      .eq('clinic_id', clinic.id)
      .limit(1)
      .single()
    
    console.log('✅ Found demo data')
    console.log(`   Clinic: ${clinic.id}`)
    console.log(`   Customer: ${customer.full_name}`)
    console.log(`   Service: ${service.name} (฿${service.price})`)
    
    // 2. Create appointment with absolute minimal fields
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const appointmentDate = tomorrow.toISOString().split('T')[0]
    
    console.log('\n📝 Creating appointment with minimal fields...')
    
    // Try different field combinations until we find what works
    const testFields = [
      { clinic_id: clinic.id },
      { clinic_id: clinic.id, customer_id: customer.id },
      { clinic_id: clinic.id, customer_id: customer.id, appointment_date: appointmentDate },
    ]
    
    let appointment = null
    let lastError = null
    
    for (const fields of testFields) {
      console.log(`   Trying fields: ${Object.keys(fields).join(', ')}`)
      
      const { data: testData, error: testError } = await supabase
        .from('appointments')
        .insert(fields)
        .select()
        .single()
      
      if (testError) {
        console.log(`   ❌ Failed: ${testError.message}`)
        lastError = testError
      } else {
        appointment = testData
        console.log(`   ✅ Success! Appointment ID: ${appointment.id}`)
        break
      }
    }
    
    if (!appointment) {
      console.error('\n❌ Could not create appointment with any field combination')
      console.error('Last error:', lastError?.message)
      return
    }
    
    // 3. Create invoice
    console.log('\n💳 Creating invoice...')
    const invoiceNumber = `INV${Date.now()}`
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        clinic_id: clinic.id,
        customer_id: customer.id,
        appointment_id: appointment.id,
        subtotal: service.price,
        discount_amount: 0,
        tax_rate: 7,
        tax_amount: Math.round(service.price * 0.07 * 100) / 100,
        total_amount: Math.round(service.price * 1.07 * 100) / 100,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft'
      })
      .select()
      .single()
    
    if (invoiceError) {
      console.error('❌ Failed to create invoice:', invoiceError.message)
      // Clean up
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return
    }
    
    console.log(`✅ Invoice created: ${invoice.invoice_number}`)
    
    // 4. Create invoice line item
    const { error: itemError } = await supabase
      .from('invoice_line_items')
      .insert({
        invoice_id: invoice.id,
        service_id: service.id,
        description: service.name,
        quantity: 1,
        unit_price: service.price,
        discount_percent: 0,
        total: service.price
      })
    
    if (itemError) {
      console.error('❌ Failed to create line item:', itemError.message)
    } else {
      console.log('✅ Invoice line item created')
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Results:')
    console.log(`   Appointment ID: ${appointment.id}`)
    console.log(`   Invoice ID: ${invoice.id}`)
    console.log(`   Invoice Number: ${invoice.invoice_number}`)
    console.log(`   Total Amount: ฿${invoice.total_amount}`)
    console.log('\n✅ Basic booking → invoice flow works!')
    
    // Test complete - keep records for verification
    console.log('\n💾 Records preserved for manual verification')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testMinimalBooking()
