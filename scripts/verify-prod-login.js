require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(url, anonKey)

  console.log('🔄 Testing login for admin@ai367bar.com on production DB...')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@ai367bar.com',
    password: 'Admin123!',
  })

  if (error) {
    console.error('❌ Login failed:', error.message)
    process.exit(1)
  }

  console.log('✅ Login successful!')
  console.log('👤 User ID:', data.user.id)
  console.log('🔑 Session starts with:', data.session.access_token.substring(0, 20) + '...')
  
  // Verify role in public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()
    
  if (profileError) {
    console.error('❌ Failed to fetch profile:', profileError.message)
  } else {
    console.log('🎭 User Role:', profile.role)
  }
}

main()
