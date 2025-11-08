/**
 * Supabase Database Inspector
 * ตรวจสอบ tables, columns, และข้อมูลในฐานข้อมูล Supabase
 * 
 * วิธีใช้:
 * npx tsx scripts/check-supabase-db.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// โหลด .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// ดึง config จาก environment variables (remove quotes if present)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/^["']|["']$/g, "")
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/^["']|["']$/g, "") // ต้องใช้ Service Role Key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('\n🔍 Supabase Database Inspector')
  console.log('================================\n')

  try {
    // 1. ตรวจสอบ Connection
    console.log('1️⃣  Testing connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(0)
    
    if (healthError && healthError.code !== 'PGRST116') {
      console.log('⚠️  Connection issue:', healthError.message)
    } else {
      console.log('✅ Connected to Supabase\n')
    }

    // 2. ลิสต์ตารางทั้งหมด (ต้องใช้ RPC หรือ raw SQL)
    console.log('2️⃣  Checking available tables...')
    const { data: tables, error: tablesError } = await supabase.rpc('get_public_tables')
    
    if (tablesError) {
      console.log('⚠️  Cannot list tables directly (need custom RPC function)')
      console.log('   Trying to query known tables instead...\n')
      
      // ลองเช็คตารางที่รู้จัก
      await checkKnownTables()
    } else {
      console.log('📋 Tables found:')
      console.table(tables)
    }

    // 3. เช็คตาราง users
    console.log('\n3️⃣  Checking "users" table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (usersError) {
      if (usersError.code === 'PGRST116') {
        console.log('❌ Table "users" does NOT exist')
      } else {
        console.log('❌ Error:', usersError.message)
      }
    } else {
      console.log(`✅ Table "users" exists with ${users.length} rows (showing first 5)`)
      if (users.length > 0) {
        console.log('\n📊 Sample data:')
        console.table(users)
        
        // แสดงโครงสร้าง columns
        console.log('\n📐 Columns in users table:')
        const columns = Object.keys(users[0])
        columns.forEach(col => console.log(`   - ${col}`))
      } else {
        console.log('   (Empty table)')
      }
    }

    // 4. เช็คตาราง analysis_history
    console.log('\n4️⃣  Checking "analysis_history" table...')
    const { data: history, error: historyError } = await supabase
      .from('analysis_history')
      .select('*')
      .limit(5)

    if (historyError) {
      if (historyError.code === 'PGRST116') {
        console.log('❌ Table "analysis_history" does NOT exist')
      } else {
        console.log('❌ Error:', historyError.message)
      }
    } else {
      console.log(`✅ Table "analysis_history" exists with ${history.length} rows`)
      if (history.length > 0) {
        console.log('\n📊 Sample data:')
        console.table(history)
      }
    }

    // 5. เช็ค Auth Users
    console.log('\n5️⃣  Checking auth.users (Supabase Auth)...')
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.log('❌ Error:', authError.message)
    } else {
      console.log(`✅ Found ${authUsers.length} auth users`)
      if (authUsers.length > 0) {
        console.log('\n📊 Auth users:')
        console.table(authUsers.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          email_confirmed: u.email_confirmed_at ? '✅' : '❌'
        })))
      }
    }

    // 6. สรุป
    console.log('\n' + '='.repeat(50))
    console.log('📝 SUMMARY')
    console.log('='.repeat(50))
    
    const usersExists = !usersError || usersError.code !== 'PGRST116'
    const historyExists = !historyError || historyError.code !== 'PGRST116'
    
    console.log(`
✅ Connection: OK
${usersExists ? '✅' : '❌'} Table "users": ${usersExists ? 'EXISTS' : 'NOT EXISTS'}
${historyExists ? '✅' : '❌'} Table "analysis_history": ${historyExists ? 'EXISTS' : 'NOT EXISTS'}
✅ Auth Users: ${authUsers?.length || 0} users

${!usersExists || !historyExists ? '\n⚠️  RECOMMENDATION: Run migration script (001_create_users_and_rbac.sql)\n' : ''}
    `)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

async function checkKnownTables() {
  const knownTables = [
    'users',
    'analysis_history',
    'profiles',
    'skin_analyses',
    'bookings',
    'treatments',
    'clinics',
    'products'
  ]

  console.log('Checking known tables:')
  
  for (const table of knownTables) {
    const { error } = await supabase
      .from(table)
      .select('count')
      .limit(0)
    
    if (!error || error.code !== 'PGRST116') {
      console.log(`  ✅ ${table}`)
    }
  }
  console.log('')
}

// Run
main().catch(console.error)
