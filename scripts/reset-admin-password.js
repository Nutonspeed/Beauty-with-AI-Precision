require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceRoleKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🔄 Resetting password for admin@ai367bar.com...')
  
  const { data, error } = await supabase.auth.admin.updateUserById(
    'bc715d59-bced-4b7e-9527-b68937cc1864',
    { password: 'Admin123!' }
  )

  if (error) {
    console.error('❌ Failed to update password:', error.message)
    process.exit(1)
  }

  console.log('✅ Password updated successfully for user:', data.user.email)
}

main()
