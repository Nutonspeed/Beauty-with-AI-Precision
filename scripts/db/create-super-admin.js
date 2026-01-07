require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const email = 'nuttapong161@gmail.com'
const password = 'password123'
const fullName = 'Nuttapong Super Admin'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  const supabase = createClient(url, serviceRoleKey)

  console.log('🔄 Removing existing records (if any)...')
  await supabase.rpc('exec_sql', {
    sql_text: `
      DELETE FROM public.users WHERE email = '${email}';
      DELETE FROM auth.identities WHERE provider_id = '${email}';
      DELETE FROM auth.users WHERE email = '${email}';
    `,
  }).catch(() => {})

  console.log('👤 Creating auth user via admin API...')
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error) throw error

  const userId = data.user.id
  console.log('✅ Created auth user', userId)

  console.log('🗄️ Upserting row in public.users...')
  const { error: upsertError } = await supabase.from('users').upsert({
    id: userId,
    email,
    role: 'super_admin',
    full_name: fullName,
    email_verified: true,
  })
  if (upsertError) throw upsertError

  console.log('🎉 Super admin ready!')
}

main().catch((err) => {
  console.error('❌ Failed to create super admin', err)
  process.exit(1)
})
