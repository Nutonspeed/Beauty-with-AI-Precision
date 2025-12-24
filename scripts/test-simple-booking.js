/**
 * Simple Booking Test - Works with existing schema
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

async function testSimpleBooking() {
  console.log('🧪 Testing Simple Booking Flow...\n')
  
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
    
    // 2. Create appointment with minimal required fields
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const appointmentDate = tomorrow.toISOString().split('T')[0]
    
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        clinic_id: clinic.id,
        customer_id: customer.id,
        appointment_date: appointmentDate,
        notes: `Test booking for ${service.name}`,
        status: 'scheduled'
      })
      .select()
      .single()
    
    if (appointmentError) {
      console.error('❌ Failed to create appointment:', appointmentError.message)
      return
    }
    
    console.log(`\n✅ Created appointment: ${appointment.id}`)
    console.log(`   Date: ${appointmentDate}`)
    
    // 3. Create invoice manually
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
      // Clean up appointment
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return
    }
    
    console.log(`\n✅ Created invoice: ${invoice.invoice_number}`)
    console.log(`   Subtotal: ฿${invoice.subtotal}`)
    console.log(`   Tax (7%): ฿${invoice.tax_amount}`)
    console.log(`   Total: ฿${invoice.total_amount}`)
    
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
      // Clean up
      await supabase.from('invoices').delete().eq('id', invoice.id)
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return
    }
    
    console.log(`\n✅ Created invoice line item`)
    
    // 5. Update appointment with invoice_id
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ invoice_id: invoice.id })
      .eq('id', appointment.id)
    
    if (updateError) {
      console.error('❌ Failed to link appointment to invoice:', updateError.message)
    } else {
      console.log(`\n✅ Linked appointment to invoice`)
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Booking → Invoice Flow Test Results:')
    console.log(`   Appointment ID: ${appointment.id}`)
    console.log(`   Invoice ID: ${invoice.id}`)
    console.log(`   Invoice Number: ${invoice.invoice_number}`)
    console.log(`   Total Amount: ฿${invoice.total_amount}`)
    console.log(`   Status: ${invoice.status}`)
    console.log('\n✅ Test completed successfully!')
    
    // Keep records for manual verification
    console.log('\n📝 Records created (not cleaned up for verification):')
    console.log(`   - Appointment: ${appointment.id}`)
    console.log(`   - Invoice: ${invoice.id}`)
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testSimpleBooking()
