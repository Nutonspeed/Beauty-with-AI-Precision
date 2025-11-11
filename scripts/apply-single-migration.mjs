import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ Usage: node apply-single-migration.mjs <migration-file>')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log(`\n🚀 Applying Migration: ${migrationFile}\n`)

try {
  const sql = readFileSync(resolve(migrationFile), 'utf-8')
  console.log(`📖 Read ${sql.length} characters\n`)
  
  console.log('⚡ Executing migration...\n')
  
  // Try to execute via RPC
  const { data, error } = await supabase.rpc('exec_sql', { sql })
  
  if (error) {
    console.log('❌ Cannot execute via RPC:', error.message)
    console.log('\n📋 MANUAL STEPS:')
    console.log('1. Open Supabase Dashboard SQL Editor')
    console.log('2. Copy content from:', migrationFile)
    console.log('3. Paste and run in SQL Editor')
    console.log('\n💡 File ready at:', resolve(migrationFile))
    process.exit(1)
  }
  
  console.log('✅ Migration applied successfully!')
  if (data) {
    console.log('\nResult:', data)
  }
  
} catch (err) {
  console.error('❌ Error:', err.message)
  process.exit(1)
}
