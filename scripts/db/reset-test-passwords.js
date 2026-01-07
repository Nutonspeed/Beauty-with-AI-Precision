require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function resetUserPassword(email, newPassword) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceRoleKey) {
    console.error('❌ Missing Supabase service role variables')
    return false
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log(`Resetting password for: ${email}`)
  
  // Find user id by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('❌ Failed to list users:', listError.message)
    return false
  }
  
  console.log(`Found ${users.users.length} users in auth.users`)
  const user = users.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    console.error(`❌ User not found in auth.users: ${email}`)
    console.log('Available emails:', users.users.map(u => u.email).join(', '))
    return false
  }
  
  const { error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  )
  
  if (error) {
    console.error(`❌ Failed to update password for ${email}:`, error.message)
    return false
  }

  console.log(`✅ Password reset successfully for ${email}`)
  return true
}

async function main() {
  const usersToReset = [
    { email: 'customer@example.com', password: 'password123' },
    { email: 'clinicadmin@test.com', password: 'password123' }
  ]
  
  for (const user of usersToReset) {
    await resetUserPassword(user.email, user.password)
  }
}

main().catch(console.error)
