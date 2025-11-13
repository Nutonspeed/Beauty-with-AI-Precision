#!/usr/bin/env node
/**
 * ตรวจสอบตารางสำคัญสำหรับ Super Admin Dashboard
 * - ตรวจสอบว่าตารางถูกสร้างครบจาก migrations ล่าสุด
 * - แสดงจำนวนแถวคร่าวๆของแต่ละตาราง
 * - คืนค่า exit code = 0 เมื่อครบ และ >0 เมื่อขาด
 */

import pg from 'pg'

const { Client } = pg

// ใช้การตั้งค่าเดียวกับสคริปต์ migrations (pooler + SSL)
const connectionString = 'postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

// ตารางที่คาดหวังจากงาน Revenue & Security Monitoring
const expectedTables = [
  // Revenue & Billing
  'subscription_plans',
  'clinic_subscriptions',
  'billing_invoices',
  'payment_transactions',
  // Security Monitoring
  'security_events',
  'failed_login_attempts',
  'active_sessions',
  'suspicious_activities',
]

async function getExistingPublicTables() {
  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `)
  return res.rows.map((r) => r.table_name)
}

async function getCount(table) {
  try {
    const res = await client.query(`SELECT COUNT(*)::int AS c FROM public."${table}"`)
    return res.rows[0]?.c ?? 0
  } catch {
    return null
  }
}

async function main() {
  console.log('🔎 กำลังตรวจสอบตารางที่จำเป็นสำหรับ Super Admin Dashboard\n')

  try {
    await client.connect()
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ')

    const existing = await getExistingPublicTables()

    const missing = expectedTables.filter((t) => !existing.includes(t))
    const present = expectedTables.filter((t) => existing.includes(t))

    console.log('\n📋 ตารางที่พบในสคีม่า public:')
    present.forEach((t) => console.log(`  • ${t}`))
    if (missing.length) {
      console.log('\n❌ ตารางที่ยังไม่พบ:')
      missing.forEach((t) => console.log(`  • ${t}`))
    }

    // นับจำนวนแถวแบบคร่าวๆสำหรับตารางที่พบ
    console.log('\n📊 จำนวนแถว (ประมาณ):')
    for (const t of present) {
      const c = await getCount(t)
      const display = c === null ? 'อ่านไม่ได้' : `${c} แถว`
      console.log(`  • ${t.padEnd(26)} ${display}`)
    }

    console.log('\nสรุป:')
    console.log(`  ✅ พบตารางแล้ว ${present.length}/${expectedTables.length}`)
    if (missing.length === 0) {
      console.log('  🟢 โครงสร้างตารางครบถ้วนตามที่คาดไว้')
      process.exit(0)
    } else {
      console.log('  🔴 โครงสร้างตารางยังไม่ครบ โปรดตรวจสอบ migrations')
      process.exit(2)
    }
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
