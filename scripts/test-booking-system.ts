/**
 * Test Booking System End-to-End
 * Tests calendar, availability, and email reminders
 */

import { createClient } from '@supabase/supabase-js'
import { ReminderService } from '../lib/booking/reminder-service'
import { testAllEmailTemplates } from '../lib/email/gmail-templates'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create service client for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TestResult {
  success: boolean
  message: string
  data?: any
}

class BookingSystemTester {
  private clinicId: string = ''
  private staffId: string = ''
  private customerId: string = ''
  private serviceId: string = ''
  private appointmentId: string = ''

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Booking System Tests...\n')

    try {
      // Step 1: Setup test data
      await this.setupTestData()

      // Step 2: Test staff availability
      await this.testStaffAvailability()

      // Step 3: Test appointment creation
      await this.testAppointmentCreation()

      // Step 4: Test email templates
      await this.testEmailTemplates()

      // Step 5: Test reminder service
      await this.testReminderService()

      // Step 6: Test conflict detection
      await this.testConflictDetection()

      console.log('\n✅ All tests passed!')
      
    } catch (error) {
      console.error('\n❌ Test failed:', error)
      process.exit(1)
    }
  }

  private async setupTestData(): Promise<void> {
    console.log('1️⃣ Setting up test data...')

    // Create test clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name: 'Test Clinic for Booking',
        email: 'test@booking.com',
        phone: '02-123-4567',
        address: '123 Test Street',
        is_active: true
      })
      .select()
      .single()

    if (clinicError || !clinic) throw new Error(`Failed to create clinic: ${clinicError?.message}`)
    this.clinicId = clinic.id
    console.log('   ✓ Created test clinic')

    // Create test staff
    const { data: staff, error: staffError } = await supabase
      .from('users')
      .insert({
        email: 'staff@test.com',
        full_name: 'Dr. Test Staff',
        role: 'sales_staff',
        clinic_id: this.clinicId,
        is_active: true
      })
      .select()
      .single()

    if (staffError || !staff) throw new Error(`Failed to create staff: ${staffError?.message}`)
    this.staffId = staff.id
    console.log('   ✓ Created test staff')

    // Create test customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: 'Test Customer',
        email: 'customer@test.com',
        phone: '081-234-5678',
        clinic_id: this.clinicId,
        is_active: true
      })
      .select()
      .single()

    if (customerError || !customer) throw new Error(`Failed to create customer: ${customerError?.message}`)
    this.customerId = customer.id
    console.log('   ✓ Created test customer')

    // Create test service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        name: 'Test Treatment',
        description: 'A test treatment',
        duration: 60,
        price: 1500,
        clinic_id: this.clinicId,
        is_active: true
      })
      .select()
      .single()

    if (serviceError || !service) throw new Error(`Failed to create service: ${serviceError?.message}`)
    this.serviceId = service.id
    console.log('   ✓ Created test service')
  }

  private async testStaffAvailability(): Promise<void> {
    console.log('\n2️⃣ Testing staff availability...')

    // Add availability for staff
    const { error } = await supabase
      .from('doctor_availability')
      .insert({
        clinic_id: this.clinicId,
        doctor_id: this.staffId,
        day_of_week: new Date().getDay(),
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        max_appointments_per_slot: 2,
        slot_duration_minutes: 30
      })

    if (error) throw new Error(`Failed to add availability: ${error.message}`)
    console.log('   ✓ Added staff availability')

    // Test fetching availability
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/booking/availability?clinic_id=${this.clinicId}&staff_id=${this.staffId}`)
    const data = await response.json()

    if (!data.success) throw new Error('Failed to fetch availability')
    console.log('   ✓ Fetched staff availability')
  }

  private async testAppointmentCreation(): Promise<void> {
    console.log('\n3️⃣ Testing appointment creation...')

    const startTime = new Date()
    startTime.setDate(startTime.getDate() + 1)
    startTime.setHours(14, 0, 0, 0)

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/booking/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinic_id: this.clinicId,
        customer_id: this.customerId,
        staff_id: this.staffId,
        service_id: this.serviceId,
        start_time: startTime.toISOString()
      })
    })

    const data = await response.json()

    if (!data.success) throw new Error(`Failed to create appointment: ${data.error}`)
    this.appointmentId = data.appointment.id
    console.log('   ✓ Created appointment')
  }

  private async testEmailTemplates(): Promise<void> {
    console.log('\n4️⃣ Testing email templates...')

    try {
      await testAllEmailTemplates('nuttapong161@gmail.com')
      console.log('   ✓ All email templates sent successfully')
    } catch (error) {
      console.log('   ⚠️ Email test failed (check SMTP settings):', error)
    }
  }

  private async testReminderService(): Promise<void> {
    console.log('\n5️⃣ Testing reminder service...')

    // Test confirmation email
    const result1 = await ReminderService.sendConfirmation(this.appointmentId)
    if (!result1.success) throw new Error('Failed to send confirmation')
    console.log('   ✓ Sent confirmation email')

    // Test daily reminder
    const result2 = await ReminderService.sendReminder(this.appointmentId)
    if (!result2.success) throw new Error('Failed to send reminder')
    console.log('   ✓ Sent reminder email')
  }

  private async testConflictDetection(): Promise<void> {
    console.log('\n6️⃣ Testing conflict detection...')

    const startTime = new Date()
    startTime.setDate(startTime.getDate() + 1)
    startTime.setHours(14, 0, 0, 0)

    // Try to create duplicate appointment
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/booking/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinic_id: this.clinicId,
        customer_id: this.customerId,
        staff_id: this.staffId,
        service_id: this.serviceId,
        start_time: startTime.toISOString()
      })
    })

    const data = await response.json()

    if (data.success) throw new Error('Should have detected conflict')
    if (data.error !== 'Time slot is already booked') throw new Error('Wrong error message')
    console.log('   ✓ Conflict detection working')
  }

  async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...')

    await supabase.from('appointments').delete().eq('id', this.appointmentId)
    await supabase.from('doctor_availability').delete().eq('doctor_id', this.staffId)
    await supabase.from('services').delete().eq('id', this.serviceId)
    await supabase.from('customers').delete().eq('id', this.customerId)
    await supabase.from('users').delete().eq('id', this.staffId)
    await supabase.from('clinics').delete().eq('id', this.clinicId)

    console.log('   ✓ Cleanup complete')
  }
}

// Run tests
async function main() {
  const tester = new BookingSystemTester()
  
  try {
    await tester.runAllTests()
  } finally {
    await tester.cleanup()
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { BookingSystemTester }
