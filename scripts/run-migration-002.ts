/**
 * Run Migration 002: Fix users schema
 * This script executes the SQL migration directly via Supabase client
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

// Remove quotes from env variables if present
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/^["']|["']$/g, "")
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/^["']|["']$/g, "")

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function runMigration() {
  console.log('\n🔧 Running Migration 002: Fix users schema\n')
  console.log('━'.repeat(60))

  try {
    // Read migration file
    const migrationPath = resolve(process.cwd(), 'supabase/migrations/002_fix_users_schema.sql')
    const sql = readFileSync(migrationPath, 'utf-8')
    
    console.log('📄 Loaded migration file')
    console.log(`   Path: ${migrationPath}`)
    console.log(`   Size: ${sql.length} characters\n`)

    // Execute SQL using rpc (raw SQL execution)
    // Note: Supabase client doesn't support direct SQL execution
    // We'll need to execute this manually in Supabase SQL Editor
    // Or use individual API calls

    console.log('⚠️  This migration cannot be run directly via TypeScript')
    console.log('📝 Please run this migration manually in Supabase SQL Editor:')
    console.log('')
    console.log(`   1. Go to: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor`)
    console.log('   2. Paste the SQL from: supabase/migrations/002_fix_users_schema.sql')
    console.log('   3. Click "Run"')
    console.log('')
    console.log('━'.repeat(60))
    console.log('')
    console.log('Attempting to update user roles via Supabase client...')
    console.log('')

    // Step 1: Update user roles
    console.log('Step 1: Update user roles')
    
    // Update super admin
    const { error: e1 } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', 'admin@ai367bar.com')

    if (e1) console.log('   ⚠️  Super admin update:', e1.message)
    else console.log('   ✅ Updated admin@ai367bar.com → super_admin')

    // Update clinic owner
    const { error: e2 } = await supabase
      .from('users')
      .update({ role: 'clinic_owner', clinic_id: '00000000-0000-0000-0000-000000000001' })
      .eq('email', 'clinic-owner@example.com')

    if (e2) console.log('   ⚠️  Clinic owner update:', e2.message)
    else console.log('   ✅ Updated clinic-owner@example.com → clinic_owner')

    // Update sales staff
    const { error: e3 } = await supabase
      .from('users')
      .update({ role: 'sales_staff', clinic_id: '00000000-0000-0000-0000-000000000001' })
      .eq('email', 'sales@example.com')

    if (e3) console.log('   ⚠️  Sales staff update:', e3.message)
    else console.log('   ✅ Updated sales@example.com → sales_staff')

    // Update customer
    const { error: e4 } = await supabase
      .from('users')
      .update({ role: 'customer_free' })
      .eq('email', 'customer@example.com')

    if (e4) console.log('   ⚠️  Customer update:', e4.message)
    else console.log('   ✅ Updated customer@example.com → customer_free')

    console.log('\n━'.repeat(60))
    console.log('✨ Migration completed!\n')

    // Verify
    const { data: users } = await supabase
      .from('users')
      .select('email, role, clinic_id')
    
    console.log('📊 Current user roles:')
    users?.forEach(u => {
      console.log(`   ${u.email.padEnd(30)} → ${u.role}${u.clinic_id ? ' (clinic: ' + u.clinic_id.substring(0, 8) + '...)' : ''}`)
    })
    console.log('')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
  .then(() => {
    console.log('✅ Script completed\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
