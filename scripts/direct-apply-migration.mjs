import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

console.log('\n🚀 Direct Migration via Supabase REST API\n')

const migrationPath = 'supabase/migrations/20251111_add_critical_tables.sql'

try {
  const sql = readFileSync(resolve(migrationPath), 'utf-8')
  console.log(`📖 Read migration: ${migrationPath}`)
  console.log(`📏 Size: ${(sql.length / 1024).toFixed(2)} KB\n`)
  
  console.log('⚡ Executing via REST API...\n')
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ sql })
  })
  
  const result = await response.text()
  
  if (!response.ok) {
    console.log('❌ API Error:', response.status, response.statusText)
    console.log('Response:', result)
    throw new Error('REST API failed')
  }
  
  console.log('✅ Migration applied successfully!\n')
  console.log('Response:', result)
  
} catch (err) {
  console.error('\n❌ Cannot apply via API:', err.message)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 MANUAL APPLICATION REQUIRED')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('Migration is ready at:')
  console.log('  📁', resolve(migrationPath), '\n')
  console.log('Steps to apply manually:')
  console.log('  1. Open Supabase Dashboard:')
  console.log('     https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n')
  console.log('  2. Click "New Query"\n')
  console.log('  3. Copy entire content from the migration file above\n')
  console.log('  4. Paste into SQL Editor\n')
  console.log('  5. Click "Run" (or press Ctrl+Enter)\n')
  console.log('  6. Verify success messages in output\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('💡 After applying, run:')
  console.log('   node scripts/test-multi-clinic-isolation.mjs\n')
}
