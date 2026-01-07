require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testBookingFlow() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as customer
  console.log('Step 1: Logging in as customer (customer@example.com)...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'customer@example.com',
    password: 'password123'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  // 2. Fetch an available service and clinic
  console.log('\nStep 2: Fetching available clinic and service...')
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('id, clinic_id, name')
    .eq('is_active', true)
    .limit(1)
    .single()

  if (serviceError) {
    console.error('❌ Failed to fetch service:', serviceError.message)
    return
  }
  console.log(`✅ Selected service: ${serviceData.name} (Clinic ID: ${serviceData.clinic_id})`)

  // 3. Create a booking
  console.log('\nStep 3: Creating a booking (Testing RLS)...')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const bookingDate = tomorrow.toISOString().split('T')[0]

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: authData.user.id,
      clinic_id: serviceData.clinic_id,
      service_id: serviceData.id,
      treatment_type: 'Skin Treatment',
      booking_date: bookingDate,
      booking_time: '14:00:00',
      duration_minutes: 60,
      price: 1500,
      status: 'pending',
      customer_notes: 'Test booking via automated script'
    })
    .select()
    .single()

  if (bookingError) {
    console.error('❌ Booking failed:', bookingError.message)
    if (bookingError.message.includes('row-level security')) {
        console.log('💡 Note: This might be because customers are not allowed to INSERT directly into bookings.')
    }
  } else {
    console.log('✅ Booking created successfully. ID:', booking.id)

    // 4. Verify read access
    console.log('\nStep 4: Verifying read access for the booking...')
    const { data: readBooking, error: readError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking.id)
      .single()

    if (readError) {
      console.error('❌ Failed to read back booking:', readError.message)
    } else {
      console.log('✅ Successfully read back booking data')
    }
  }

  await supabase.auth.signOut()
}

testBookingFlow().catch(console.error)
