/**
 * Workaround: Insert with valid enum then UPDATE
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixCustomer() {
  const userId = '1276645e-3c17-4438-af1d-627937bb3382'
  
  console.log('🔧 Workaround: Insert with clinic_staff, then UPDATE to customer\n')

  // Delete first
  await supabase.from('users').delete().eq('id', userId)

  // Insert with valid enum value
  console.log('Step 1: Inserting with clinic_owner (valid enum)...')
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: 'test-customer@beautyclinic.com',
      role: 'clinic_owner', // ใช้ค่าที่ valid ก่อน (clinic_owner หรือ sales_staff)
      full_name: 'Test Customer',
      is_active: true
    })

  if (insertError) {
    console.log('❌ Error:', insertError.message)
    return
  }

  console.log('✅ Inserted!\n')

  // Then UPDATE to customer
  console.log('Step 2: Updating role to customer...')
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'customer' })
    .eq('id', userId)

  if (updateError) {
    console.log('❌ Error:', updateError.message)
    return
  }

  console.log('✅ Updated!\n')

  // Verify
  const { data } = await supabase
    .from('users')
    .select('email, role')
    .eq('id', userId)
    .single()

  console.log('Final result:', data)
  console.log('\n✨ Done!')
}

fixCustomer()
