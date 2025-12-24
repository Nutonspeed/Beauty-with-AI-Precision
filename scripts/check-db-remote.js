/**
 * Check Database Tables via Terminal
 * ตรวจสอบตารางใน Supabase ผ่าน command line
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Debug: แสดงค่าที่อ่านได้
console.log('🔍 Debug:')
console.log('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Not found')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Found' : 'Not found')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 กำลังตรวจสอบตารางใน database...\n')
  
  // ตารางที่ต้องตรวจสอบ
  const requiredTables = [
    // Core tables
    'clinics', 'customers', 'users', 'appointments',
    // Invoice system
    'invoices', 'invoice_line_items',
    // Payment system
    'payments', 'payment_methods', 'refunds',
    // Tax receipt system
    'tax_receipts', 'tax_receipt_line_items'
  ]
  
  // ตรวจสอบแต่ละตาราง
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.log(`❌ ${tableName}: Error - ${error.message}`)
      } else if (data) {
        console.log(`✅ ${tableName}: ${data.table_type}`)
      } else {
        console.log(`❌ ${tableName}: Not found`)
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Error - ${err.message}`)
    }
  }
  
  console.log('\n🔍 ตรวจสอบ Functions...\n')
  
  // ตรวจสอบ functions
  const functions = [
    'generate_tax_receipt_number',
    'create_tax_receipt_from_payment'
  ]
  
  for (const funcName of functions) {
    try {
      const { data, error } = await supabase
        .rpc('get_function_info', { function_name: funcName })
        .catch(() => ({ data: null, error: { message: 'Function not found' } }))
      
      if (error) {
        console.log(`❌ ${funcName}: Not found`)
      } else {
        console.log(`✅ ${funcName}: Exists`)
      }
    } catch (err) {
      console.log(`❌ ${funcName}: Error - ${err.message}`)
    }
  }
  
  console.log('\n🔍 ตรวจสอบ RLS Policies...\n')
  
  // ตรวจสอบ RLS policies
  const tablesWithRLS = ['payments', 'tax_receipts', 'invoices', 'customers']
  
  for (const tableName of tablesWithRLS) {
    try {
      const { data, error } = await supabase
        .from('pg_policies')
        .select('policyname')
        .eq('tablename', tableName)
      
      if (error) {
        console.log(`❌ RLS for ${tableName}: Error checking policies`)
      } else if (data && data.length > 0) {
        console.log(`✅ RLS for ${tableName}: ${data.length} policy(ies) found`)
      } else {
        console.log(`⚠️  RLS for ${tableName}: No policies found`)
      }
    } catch (err) {
      console.log(`❌ RLS for ${tableName}: Error - ${err.message}`)
    }
  }
  
  console.log('\n✅ ตรวจสอบเสร็จสิ้น!')
}

checkTables().catch(console.error)
