import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const { data, error } = await supabase
  .from('invitations')
  .select('token, email, invited_role, status, expires_at, created_at')
  .order('created_at', { ascending: false })
  .limit(5)

if (error) {
  console.error('Error:', error)
} else {
  console.log('\n✅ Recent Invitations (Latest 5):')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  data.forEach((inv, i) => {
    console.log(`${i + 1}. Email: ${inv.email}`)
    console.log(`   Role: ${inv.invited_role}`)
    console.log(`   Status: ${inv.status}`)
    console.log(`   Created: ${inv.created_at}`)
    console.log(`   Expires: ${inv.expires_at}`)
    console.log(`   🔗 Link: http://localhost:3000/invite/${inv.token}`)
    console.log('')
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}
