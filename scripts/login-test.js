require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  const supabase = createClient(url, anonKey)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nuttapong161@gmail.com',
    password: 'password123',
  })
  console.log('data:', data)
  console.log('error:', error)
}

main().catch((err) => {
  console.error('unexpected error', err)
  process.exit(1)
})
