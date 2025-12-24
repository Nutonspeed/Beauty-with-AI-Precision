const { createClient } = require('@supabase/supabase-js')

// Test registration flow
async function testRegistration() {
  console.log('🧪 Testing Registration Flow...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Test registration
    const testEmail = `test${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        data: {
          name: 'Test User',
          phone: null
        }
      }
    })
    
    if (error) {
      console.error('❌ Auth signup failed:', error.message)
      return
    }
    
    console.log('✅ Auth signup successful')
    console.log('   User ID:', data.user?.id)
    
    // Check if user record was created in public.users
    if (data.user?.id) {
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (userError) {
        console.error('❌ User record not found:', userError.message)
      } else {
        console.log('✅ User record created in public.users')
        console.log('   Role:', userRecord.role)
        console.log('   Clinic ID:', userRecord.clinic_id)
        console.log('   Full Name:', userRecord.full_name)
      }
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

testRegistration()
