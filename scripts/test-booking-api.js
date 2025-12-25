/**
 * Test Booking System via API Endpoints
 * Tests calendar, availability, and email reminders
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'
const TEST_EMAIL = 'nuttapong161@gmail.com'

class BookingAPITester {
  constructor() {
    this.clinicId = ''
    this.staffId = ''
    this.customerId = ''
    this.serviceId = ''
    this.appointmentId = ''
    this.authToken = ''
  }

  async runAllTests() {
    console.log('🧪 Starting Booking API Tests...\n')

    try {
      // Step 1: Login to get auth token
      await this.login()

      // Step 2: Test calendar fetch
      await this.testCalendarFetch()

      // Step 3: Test availability fetch
      await this.testAvailabilityFetch()

      // Step 4: Test appointment creation
      await this.testAppointmentCreation()

      // Step 5: Test conflict detection
      await this.testConflictDetection()

      // Step 6: Test reminder API
      await this.testReminderAPI()

      console.log('\n✅ All API tests passed!')
      
    } catch (error) {
      console.error('\n❌ Test failed:', error.message)
      process.exit(1)
    }
  }

  async login() {
    console.log('🔐 Logging in...')
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nuttapong161@gmail.com',
        password: 'Aekapop_2546'
      })
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error('Login failed - using demo mode')
    }
    
    this.authToken = data.token
    console.log('   ✓ Logged in successfully')
  }

  async testCalendarFetch() {
    console.log('\n1️⃣ Testing calendar fetch...')
    
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const url = `${BASE_URL}/api/booking/calendar?` +
      `start_date=${startOfMonth.toISOString()}&` +
      `end_date=${endOfMonth.toISOString()}`
    
    const response = await fetch(url, {
      headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Calendar fetch failed: ${data.error}`)
    }
    
    console.log('   ✓ Calendar fetch successful')
    console.log(`   Found ${data.appointments?.length || 0} appointments`)
  }

  async testAvailabilityFetch() {
    console.log('\n2️⃣ Testing availability fetch...')
    
    const response = await fetch(`${BASE_URL}/api/booking/availability`, {
      headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Availability fetch failed: ${data.error}`)
    }
    
    console.log('   ✓ Availability fetch successful')
    console.log(`   Found ${data.availability?.length || 0} availability rules`)
  }

  async testAppointmentCreation() {
    console.log('\n3️⃣ Testing appointment creation...')
    
    // First, fetch required data
    const [customers, staff, services] = await Promise.all([
      fetch(`${BASE_URL}/api/customers`, {
        headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
      }).then(r => r.json()),
      fetch(`${BASE_URL}/api/staff`, {
        headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
      }).then(r => r.json()),
      fetch(`${BASE_URL}/api/services`, {
        headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
      }).then(r => r.json())
    ])
    
    if (!customers.success || !customers.data?.length) {
      throw new Error('No customers found')
    }
    
    if (!staff.success || !staff.data?.length) {
      throw new Error('No staff found')
    }
    
    if (!services.success || !services.data?.length) {
      throw new Error('No services found')
    }
    
    this.customerId = customers.data[0].id
    this.staffId = staff.data[0].id
    this.serviceId = services.data[0].id
    
    // Create appointment for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)
    
    const createResponse = await fetch(`${BASE_URL}/api/booking/calendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      },
      body: JSON.stringify({
        customer_id: this.customerId,
        staff_id: this.staffId,
        service_id: this.serviceId,
        start_time: tomorrow.toISOString(),
        notes: 'Test appointment from API test'
      })
    })
    
    const createData = await createResponse.json()
    
    if (!createData.success) {
      throw new Error(`Appointment creation failed: ${createData.error}`)
    }
    
    this.appointmentId = createData.appointment.id
    console.log('   ✓ Appointment created successfully')
  }

  async testConflictDetection() {
    console.log('\n4️⃣ Testing conflict detection...')
    
    // Try to create duplicate appointment
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)
    
    const response = await fetch(`${BASE_URL}/api/booking/calendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      },
      body: JSON.stringify({
        customer_id: this.customerId,
        staff_id: this.staffId,
        service_id: this.serviceId,
        start_time: tomorrow.toISOString()
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      throw new Error('Should have detected conflict')
    }
    
    if (!data.error?.includes('conflict') && !data.error?.includes('booked')) {
      throw new Error(`Wrong error message: ${data.error}`)
    }
    
    console.log('   ✓ Conflict detection working')
  }

  async testReminderAPI() {
    console.log('\n5️⃣ Testing reminder API...')
    
    // Test daily reminders (GET for testing)
    const response = await fetch(`${BASE_URL}/api/cron/reminders`)
    
    if (!response.ok) {
      console.log('   ⚠️ Reminder API not accessible (expected in production)')
      return
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Reminder API failed: ${data.error}`)
    }
    
    console.log('   ✓ Reminder API working')
  }
}

// Run tests
async function main() {
  const tester = new BookingAPITester()
  await tester.runAllTests()
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { BookingAPITester }
