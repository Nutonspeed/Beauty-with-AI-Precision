/**
 * Simple Database Check Script
 * ตรวจสอบตารางใน Supabase ผ่าน SQL query ตรงๆ
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 กำลังตรวจสอบตารางใน database...\n')
  
  // ใช้ SQL query ตรงๆ เพื่อตรวจสอบตาราง
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT table_name, table_type
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN (
            'clinics', 'customers', 'users', 'appointments',
            'invoices', 'invoice_line_items',
            'payments', 'payment_methods', 'refunds',
            'tax_receipts', 'tax_receipt_line_items'
          )
          ORDER BY table_name
        `
      })
    
    if (error) {
      console.log('❌ ไม่สามารถใช้ RPC ได้ ลองวิธีอื่น...\n')
      
      // ลองตรวจสอบทีละตาราง
      const tables = [
        'clinics', 'customers', 'users', 'appointments',
        'invoices', 'invoice_line_items',
        'payments', 'payment_methods', 'refunds',
        'tax_receipts', 'tax_receipt_line_items'
      ]
      
      for (const tableName of tables) {
        try {
          // ลอง SELECT จากตาราง (ถ้ามีจะไม่ error)
          const { error: tableError } = await supabase
            .from(tableName)
            .select('count')
            .limit(1)
          
          if (tableError) {
            if (tableError.code === 'PGRST116') {
              console.log(`❌ ${tableName}: Not found`)
            } else {
              console.log(`⚠️  ${tableName}: ${tableError.message}`)
            }
          } else {
            console.log(`✅ ${tableName}: Exists`)
          }
        } catch (err) {
          console.log(`❌ ${tableName}: Error - ${err.message}`)
        }
      }
    } else {
      // แสดงผลจาก RPC
      if (data && data.length > 0) {
        data.forEach(row => {
          console.log(`✅ ${row.table_name}: ${row.table_type}`)
        })
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
  
  console.log('\n✅ ตรวจสอบเสร็จสิ้น!')
}

checkTables().catch(console.error)
