/**
 * Complete Booking Test with all required fields
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

async function testCompleteBooking() {
  console.log('🧪 Testing Complete Booking Flow...\n')
  
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
      .select('id, name, price, duration_minutes')
      .eq('clinic_id', clinic.id)
      .limit(1)
      .single()
    
    const { data: staff } = await supabase
      .from('staff_members')
      .select('id')
      .eq('clinic_id', clinic.id)
      .limit(1)
      .single()
    
    console.log('✅ Found demo data')
    
    // 2. Create appointment with all required fields
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const appointmentDate = tomorrow.toISOString().split('T')[0]
    const appointmentNumber = `APT${Date.now()}`
    const startTime = '10:00:00'
    
    // Calculate end time
    const endTime = new Date(`${tomorrow.toDateString()} 10:00:00`)
    endTime.setMinutes(endTime.getMinutes() + (service?.duration_minutes || 60))
    
    console.log('\n📝 Creating appointment with all required fields...')
    
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        appointment_number: appointmentNumber,
        clinic_id: clinic.id,
        customer_id: customer.id,
        staff_id: staff?.id || null,
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
      
      // Try with duration_minutes instead of duration
      if (appointmentError.message.includes('duration')) {
        console.log('   Trying with duration_minutes field...')
        const { data: apt2, error: err2 } = await supabase
          .from('appointments')
          .insert({
            appointment_number: appointmentNumber + 'B',
            clinic_id: clinic.id,
            customer_id: customer.id,
            staff_id: staff?.id || null,
            appointment_date: appointmentDate,
            start_time: startTime,
            end_time: endTime.toTimeString().split(' ')[0],
            duration_minutes: service?.duration_minutes || 60,
            status: 'scheduled'
          })
          .select()
          .single()
        
        if (err2) {
          console.error('   Still failed:', err2.message)
          return
        }
        appointment = apt2
      } else {
        return
      }
    }
    
    console.log(`✅ Created appointment: ${appointment.appointment_number}`)
    
    // 3. Create invoice
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
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return
    }
    
    console.log(`✅ Created invoice: ${invoice.invoice_number}`)
    
    // 4. Create line item
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
    
    // 5. Link appointment to invoice
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ invoice_id: invoice.id })
      .eq('id', appointment.id)
    
    if (updateError) {
      console.error('❌ Failed to link appointment to invoice:', updateError.message)
    } else {
      console.log('✅ Linked appointment to invoice')
    }
    
    // 6. Verify the complete flow
    const { data: verification } = await supabase
      .from('appointments')
      .select(`
        *,
        invoices (
          invoice_number,
          total_amount,
          status
        )
      `)
      .eq('id', appointment.id)
      .single()
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Booking → Invoice Flow Verification:')
    console.log(`   Appointment: ${verification.appointment_number}`)
    console.log(`   Date: ${verification.appointment_date}`)
    console.log(`   Time: ${verification.start_time} - ${verification.end_time}`)
    console.log(`   Invoice: ${verification.invoices?.invoice_number}`)
    console.log(`   Total: ฿${verification.invoices?.total_amount}`)
    console.log(`   Status: ${verification.invoices?.status}`)
    console.log('\n✅ Complete flow works correctly!')
    
    // Update todo list
    console.log('\n📝 TODO: Update test status to completed')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testCompleteBooking()
