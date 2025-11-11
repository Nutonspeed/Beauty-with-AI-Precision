import { createClient } from '@supabase/supabase-js'
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('\n🚀 Quick Migration Applier\n')

const migrationPath = 'supabase/migrations/20251111_add_critical_tables.sql'

try {
  const sql = readFileSync(resolve(migrationPath), 'utf-8')
  console.log(`📖 Read migration: ${migrationPath}`)
  console.log(`📏 Size: ${(sql.length / 1024).toFixed(2)} KB\n`)
  
  // Split into statements and execute one by one
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`📋 Found ${statements.length} statements\n`)
  console.log('⚡ Executing...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    
    // Skip comments and empty statements
    if (stmt.trim().length < 3) continue
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt })
      
      if (error) {
        // Check if it's "already exists" error - that's OK
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate')) {
          console.log(`   [${i + 1}] ⚠️  Already exists (skipping)`)
        } else {
          console.log(`   [${i + 1}] ❌ ${error.message}`)
          errorCount++
        }
      } else {
        successCount++
        if ((i + 1) % 10 === 0) {
          console.log(`   [${i + 1}/${statements.length}] ✅`)
        }
      }
    } catch (err) {
      console.log(`   [${i + 1}] ❌ ${err.message}`)
      errorCount++
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Completed: ${successCount} statements`)
  if (errorCount > 0) {
    console.log(`⚠️  Errors: ${errorCount} statements`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
} catch (err) {
  console.error('❌ Fatal error:', err.message)
  console.log('\n📋 FALLBACK: Manual Application Required')
  console.log('1. Open: https://supabase.com/dashboard')
  console.log('2. Go to SQL Editor')
  console.log('3. Copy from:', resolve(migrationPath))
  console.log('4. Paste and Run\n')
  process.exit(1)
}
