/**
 * Fix customer user record
 * สร้าง record ใน users table สำหรับ test-customer
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const userId = '1276645e-3c17-4438-af1d-627937bb3382'

async function fixCustomerUser() {
  console.log('🔧 Fixing customer user record...\n')

  // First, delete any existing records to avoid conflicts
  console.log('Step 1: Cleaning up existing records...')
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (deleteError) {
    console.log('  ⚠️  Delete warning:', deleteError.message)
  } else {
    console.log('  ✅ Cleanup done')
  }

  // Now insert fresh
  console.log('\nStep 2: Inserting customer record...')
  
  // Try with direct SQL-like approach
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: 'test-customer@beautyclinic.com',
      role: 'customer',
      full_name: 'Test Customer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (insertError) {
    console.log('  ❌ Insert failed:', insertError.message)
    
    // Try upsert instead
    console.log('\nStep 3: Trying upsert...')
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'test-customer@beautyclinic.com',
        role: 'customer',
        full_name: 'Test Customer',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.log('  ❌ Upsert failed:', upsertError.message)
      console.log('\n⚠️  Please run the SQL script manually in Supabase Dashboard:')
      console.log('     scripts/fix-customer-user.sql')
      process.exit(1)
    } else {
      console.log('  ✅ Upsert successful!')
    }
  } else {
    console.log('  ✅ Insert successful!')
  }

  // Verify
  console.log('\nStep 4: Verifying...')
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, full_name, is_active')
    .eq('id', userId)
    .single()

  if (error) {
    console.log('  ❌ Verification failed:', error.message)
    process.exit(1)
  }

  if (!data) {
    console.log('  ❌ No record found!')
    process.exit(1)
  }

  console.log('  ✅ Record verified!')
  console.log('\n  User Details:')
  console.log('    ID:', data.id)
  console.log('    Email:', data.email)
  console.log('    Role:', data.role)
  console.log('    Name:', data.full_name)
  console.log('    Active:', data.is_active)

  console.log('\n✨ Customer user fixed successfully!\n')
}

fixCustomerUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
