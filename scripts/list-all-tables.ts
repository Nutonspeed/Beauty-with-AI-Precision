/**
 * List ALL tables in Supabase Database
 * ลิสต์ตารางทั้งหมดในฐานข้อมูล
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('\n📋 Listing ALL Tables in Database\n')

  // ใช้ SQL Query เพื่อดึงตารางทั้งหมด
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
  })

  if (error) {
    console.log('⚠️  Cannot use RPC, trying direct table introspection...\n')
    
    // ลิสต์ตารางที่เห็นในภาพ
    const allTables = [
      'bookings',
      'chat_messages',
      'clinics',
      'conversations',
      'customers',
      'messages',
      'products',
      'profiles',
      'services',
      'skin_analyses',
      'tenants',
      'treatment_plans',
      'treatments',
      'usage_logs',
      'user_profiles',
      'users'
    ]

    console.log('📊 Tables found (from schema):')
    console.log('─'.repeat(80))
    
    let foundCount = 0
    for (const tableName of allTables) {
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (!tableError || tableError.code !== 'PGRST116') {
        foundCount++
        const count = tableData ? 'unknown' : 0
        console.log(`✅ ${foundCount.toString().padStart(2)}. ${tableName.padEnd(25)} - Exists`)
        
        // ดึง sample data
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (sample && sample.length > 0) {
          const columns = Object.keys(sample[0])
          console.log(`    Columns (${columns.length}): ${columns.join(', ')}`)
        }
        console.log('')
      }
    }

    console.log('─'.repeat(80))
    console.log(`\n📌 Total tables found: ${foundCount}\n`)
    
  } else {
    console.table(data)
  }
}

main().catch(console.error)
