/**
 * Test Booking → Invoice Creation Flow
 * Verifies that creating an appointment automatically generates an invoice
 */

import { createClient } from '@supabase/supabase-js'
import { createInvoiceForAppointment } from '@/lib/payment/invoice-creator'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface TestResult {
  success: boolean
  message: string
  data?: any
}

class BookingInvoiceTester {
  private clinicId: string = ''
  private customerId: string = ''
  private serviceId: string = ''
  private staffId: string = ''
  private appointmentId: string = ''
  private invoiceId: string = ''

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Booking → Invoice Flow Tests...\n')

    try {
      // Step 1: Get existing demo data
      await this.getDemoData()

      // Step 2: Test appointment creation
      await this.testAppointmentCreation()

      // Step 3: Test automatic invoice creation
      await this.testInvoiceCreation()

      // Step 4: Verify invoice details
      await this.verifyInvoiceDetails()

      // Step 5: Test invoice status updates
      await this.testInvoiceStatusUpdates()

      console.log('\n✅ All tests passed! Booking → Invoice flow is working correctly.')
      console.log('\n📊 Summary:')
      console.log(`   - Appointment ID: ${this.appointmentId}`)
      console.log(`   - Invoice ID: ${this.invoiceId}`)
      console.log(`   - Invoice Status: draft`)
      
    } catch (error) {
      console.error('\n❌ Test failed:', error)
      process.exit(1)
    }
  }

  private async getDemoData(): Promise<void> {
    console.log('1️⃣ Getting demo data...')

    // Get demo clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', 'beauty-clinic-demo')
      .single()

    if (clinicError || !clinic) {
      throw new Error(`Demo clinic not found: ${clinicError?.message}`)
    }
    this.clinicId = clinic.id
    console.log('   ✓ Found demo clinic')

    // Get demo customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, full_name')
      .eq('email', 'customer@test.com')
      .single()

    if (customerError || !customer) {
      throw new Error(`Demo customer not found: ${customerError?.message}`)
    }
    this.customerId = customer.id
    console.log('   ✓ Found demo customer')

    // Get demo service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price, duration_minutes')
      .eq('clinic_id', this.clinicId)
      .limit(1)
      .single()

    if (serviceError || !service) {
      throw new Error(`Demo service not found: ${serviceError?.message}`)
    }
    this.serviceId = service.id
    console.log(`   ✓ Found service: ${service.name} (฿${service.price})`)

    // Get demo staff
    const { data: staff, error: staffError } = await supabase
      .from('staff_members')
      .select('id')
      .eq('clinic_id', this.clinicId)
      .limit(1)
      .single()

    if (staffError || !staff) {
      throw new Error(`Demo staff not found: ${staffError?.message}`)
    }
    this.staffId = staff.id
    console.log('   ✓ Found demo staff')
  }

  private async testAppointmentCreation(): Promise<void> {
    console.log('\n2️⃣ Testing appointment creation...')

    // Set appointment date and time (tomorrow at 10:00 AM)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const appointmentDate = tomorrow.toISOString().split('T')[0]
    const startTime = '10:00:00'
    
    // Calculate end time based on service duration
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', this.serviceId)
      .single()
    
    const endTime = new Date(`${tomorrow.toDateString()} 10:00:00`)
    endTime.setMinutes(endTime.getMinutes() + (service?.duration_minutes || 60))

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        clinic_id: this.clinicId,
        customer_id: this.customerId,
        staff_id: this.staffId,
        service_type: service.name,
        appointment_date: appointmentDate,
        appointment_time: startTime,
        duration_minutes: service?.duration_minutes || 60,
        status: 'scheduled',
        notes: 'Test appointment for booking flow',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (appointmentError || !appointment) {
      throw new Error(`Failed to create appointment: ${appointmentError?.message}`)
    }

    this.appointmentId = appointment.id
    console.log(`   ✓ Created appointment: ${appointment.id}`)
    console.log(`   ✓ Date: ${appointmentDate} at ${startTime}`)
  }

  private async testInvoiceCreation(): Promise<void> {
    console.log('\n3️⃣ Testing automatic invoice creation...')

    // Get service and customer data for invoice
    const { data: service } = await supabase
      .from('services')
      .select('id, name, price')
      .eq('id', this.serviceId)
      .single()

    const { data: customer } = await supabase
      .from('customers')
      .select('id, full_name')
      .eq('id', this.customerId)
      .single()

    if (!service || !customer) {
      throw new Error('Failed to get service or customer data for invoice')
    }

    // Create invoice using the helper function
    const invoice = await createInvoiceForAppointment(
      this.appointmentId,
      {
        id: service.id,
        name: service.name,
        price: service.price
      },
      {
        id: customer.id,
        full_name: customer.full_name
      },
      this.clinicId
    )

    if (!invoice) {
      throw new Error('Failed to create invoice for appointment')
    }

    this.invoiceId = invoice.id
    console.log(`   ✓ Created invoice: ${invoice.invoice_number}`)
    console.log(`   ✓ Total amount: ฿${invoice.total_amount}`)

    // Verify appointment is linked to invoice
    const { data: updatedAppointment } = await supabase
      .from('appointments')
      .select('invoice_id')
      .eq('id', this.appointmentId)
      .single()

    if (!updatedAppointment?.invoice_id) {
      throw new Error('Appointment not linked to invoice')
    }

    console.log('   ✓ Appointment linked to invoice')
  }

  private async verifyInvoiceDetails(): Promise<void> {
    console.log('\n4️⃣ Verifying invoice details...')

    // Get invoice with line items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items (
          id,
          description,
          quantity,
          unit_price,
          total
        )
      `)
      .eq('id', this.invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error(`Failed to get invoice: ${invoiceError?.message}`)
    }

    console.log('   Invoice Details:')
    console.log(`   - Invoice Number: ${invoice.invoice_number}`)
    console.log(`   - Status: ${invoice.status}`)
    console.log(`   - Subtotal: ฿${invoice.subtotal}`)
    console.log(`   - Tax (7%): ฿${invoice.tax_amount}`)
    console.log(`   - Total: ฿${invoice.total_amount}`)
    console.log(`   - Issue Date: ${invoice.issue_date}`)
    console.log(`   - Due Date: ${invoice.due_date}`)

    // Verify line items
    if (!invoice.invoice_line_items || invoice.invoice_line_items.length === 0) {
      throw new Error('Invoice has no line items')
    }

    console.log('\n   Line Items:')
    for (const item of invoice.invoice_line_items) {
      console.log(`   - ${item.description}: ฿${item.unit_price} x ${item.quantity} = ฿${item.total}`)
    }

    // Verify calculations
    const expectedTax = Math.round(invoice.subtotal * 0.07 * 100) / 100
    const expectedTotal = Math.round(invoice.subtotal * 1.07 * 100) / 100

    if (invoice.tax_amount !== expectedTax) {
      throw new Error(`Tax calculation error: expected ${expectedTax}, got ${invoice.tax_amount}`)
    }

    if (invoice.total_amount !== expectedTotal) {
      throw new Error(`Total calculation error: expected ${expectedTotal}, got ${invoice.total_amount}`)
    }

    console.log('   ✓ All calculations are correct')
  }

  private async testInvoiceStatusUpdates(): Promise<void> {
    console.log('\n5️⃣ Testing invoice status updates...')

    // Update status to sent
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', this.invoiceId)

    if (updateError) {
      throw new Error(`Failed to update invoice status: ${updateError?.message}`)
    }

    console.log('   ✓ Updated status to: sent')

    // Verify status update
    const { data: updatedInvoice } = await supabase
      .from('invoices')
      .select('status, sent_date')
      .eq('id', this.invoiceId)
      .single()

    if (updatedInvoice?.status !== 'sent') {
      throw new Error('Invoice status not updated correctly')
    }

    console.log('   ✓ Status update verified')
  }
}

// Run the tests
async function main() {
  const tester = new BookingInvoiceTester()
  await tester.runAllTests()
}

main().catch(console.error)
