/**
 * Test Booking using auth.users as customer
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

async function testBookingWithAuthUser() {
  console.log('🧪 Testing Booking with Auth User as Customer...\n')
  
  try {
    // 1. Get demo clinic
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', 'beauty-clinic-demo')
      .single()
    
    // 2. Get auth user (customer@example.com)
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const customerAuthUser = authUsers?.users.find(u => u.email === 'customer@example.com')
    
    if (!customerAuthUser) {
      console.error('❌ Customer auth user not found. Please run create-demo-auth-users.js first.')
      return
    }
    
    console.log('✅ Found auth user:', customerAuthUser.email)
    console.log('   User ID:', customerAuthUser.id)
    
    // 3. Get service
    const { data: service } = await supabase
      .from('services')
      .select('id, name, price, duration_minutes')
      .eq('clinic_id', clinic.id)
      .limit(1)
      .single()
    
    // 4. Get staff auth user (doctor@beautyclinic.com)
    const staffAuthUser = authUsers?.users.find(u => u.email === 'doctor@beautyclinic.com')
    const staffId = staffAuthUser?.id || null
    
    // 5. Create appointment
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const appointmentDate = tomorrow.toISOString().split('T')[0]
    const appointmentNumber = `APT${Date.now()}`
    const startTime = '10:00:00'
    
    const endTime = new Date(`${tomorrow.toDateString()} 10:00:00`)
    endTime.setMinutes(endTime.getMinutes() + (service?.duration_minutes || 60))
    
    console.log('\n📝 Creating appointment...')
    
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        appointment_number: appointmentNumber,
        clinic_id: clinic.id,
        customer_id: customerAuthUser.id, // Use auth user ID
        staff_id: staffId, // Use auth user ID
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime.toTimeString().split(' ')[0],
        duration: service?.duration_minutes || 60,
        status: 'scheduled'
      })
      .select()
      .single()
    
    if (appointmentError) {
      console.error('❌ Failed to create appointment:', appointmentError.message)
      return
    }
    
    console.log(`✅ Created appointment: ${appointment.appointment_number}`)
    
    // 6. Create invoice - need customer record, so create one if needed
    const { data: customerRecord } = await supabase
      .from('customers')
      .select('id')
      .eq('email', 'customer@example.com')
      .single()
    
    let customerId = customerRecord?.id
    
    if (!customerId) {
      console.log('📝 Creating customer record...')
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          email: 'customer@example.com',
          full_name: 'Customer Demo',
          clinic_id: clinic.id,
          phone: '',
          notes: 'Created for booking test'
        })
        .select()
        .single()
      
      customerId = newCustomer?.id
    }
    
    if (!customerId) {
      console.error('❌ Could not create or find customer record')
      return
    }
    
    // 7. Create invoice
    const invoiceNumber = `INV${Date.now()}`
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        clinic_id: clinic.id,
        customer_id: customerId, // Use customers table ID
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
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return
    }
    
    console.log(`✅ Created invoice: ${invoice.invoice_number}`)
    
    // 8. Create line item
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
      console.log('✅ Created line item')
    }
    
    // 9. Link appointment to invoice
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ invoice_id: invoice.id })
      .eq('id', appointment.id)
    
    if (updateError) {
      console.error('❌ Failed to link appointment to invoice:', updateError.message)
    } else {
      console.log('✅ Linked appointment to invoice')
    }
    
    // 10. Verification
    console.log('\n' + '='.repeat(60))
    console.log('📊 Booking → Invoice Flow Complete!')
    console.log(`   Appointment: ${appointment.appointment_number}`)
    console.log(`   Customer (auth): ${customerAuthUser.email}`)
    console.log(`   Customer (db): ${customerId}`)
    console.log(`   Invoice: ${invoice.invoice_number}`)
    console.log(`   Total: ฿${invoice.total_amount}`)
    console.log('\n✅ Flow works with auth.users as customer!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testBookingWithAuthUser()
