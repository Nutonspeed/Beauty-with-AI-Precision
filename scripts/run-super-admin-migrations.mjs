#!/usr/bin/env node
/**
 * รัน SQL Migrations สำหรับ Super Admin Dashboard
 * - Subscription & Billing Tables
 * - Security Monitoring Tables
 * - Sample Data
 */

import pg from 'pg';
const { Client } = pg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL configuration
// PostgreSQL configuration - ใช้ pooler connection
const connectionString = 'postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const migrations = [
  {
    file: '20250113_create_subscription_billing_tables.sql',
    name: 'Subscription & Billing Tables'
  },
  {
    file: '20250113_sample_revenue_data.sql',
    name: 'Sample Revenue Data'
  },
  {
    file: '20250113_create_security_logs.sql',
    name: 'Security Monitoring Tables'
  },
  {
    file: '20250113_sample_security_data.sql',
    name: 'Sample Security Data'
  }
];

async function runMigration(filename, name) {
  try {
    console.log(`\n🔄 กำลังรัน: ${name}...`);
    
    const filePath = join(__dirname, '..', 'supabase', 'migrations', filename);
    const sql = readFileSync(filePath, 'utf8');
    
    await client.query(sql);
    
    console.log(`   ✅ สำเร็จ: ${name}`);
    return true;
  } catch (error) {
    console.error(`   ❌ ข้อผิดพลาด: ${error.message}`);
    
    // Show more details for debugging
    if (error.detail) {
      console.error(`      รายละเอียด: ${error.detail}`);
    }
    if (error.hint) {
      console.error(`      คำแนะนำ: ${error.hint}`);
    }
    
    return false;
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 รัน Database Migrations สำหรับ Super Admin Dashboard ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    console.log('\n🔌 เชื่อมต่อกับ Supabase PostgreSQL...');
    await client.connect();
    console.log('   ✅ เชื่อมต่อสำเร็จ!');
    
    let successCount = 0;
    
    for (const migration of migrations) {
      const success = await runMigration(migration.file, migration.name);
      if (success) successCount++;
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log(`║   📊 สรุปผล: ${successCount}/${migrations.length} migrations สำเร็จ                     ║`);
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    if (successCount === migrations.length) {
      console.log('\n✨ รัน migrations ทั้งหมดเสร็จสมบูรณ์!\n');
      console.log('📌 ขั้นตอนต่อไป:');
      console.log('   1. รันคำสั่ง: pnpm run dev');
      console.log('   2. เปิดเบราว์เซอร์: http://localhost:3000/super-admin');
      console.log('   3. ดูแดชบอร์ดใหม่:');
      console.log('      • แท็บ "Revenue & Billing" - วิเคราะห์รายได้ MRR/ARR');
      console.log('      • แท็บ "Security" - ตรวจสอบความปลอดภัย');
      console.log('      • แท็บ "Clinic Management" - จัดการคลินิก');
      console.log('      • แท็บ "System Health" - สุขภาพระบบ\n');
    } else {
      console.log('\n⚠️  มีบาง migrations ที่ไม่สำเร็จ');
      console.log('   💡 ลองเปิด Supabase SQL Editor และรัน SQL ด้วยตัวเอง');
      console.log('   📂 ไฟล์อยู่ที่: supabase/migrations/\n');
    }
    
  } catch (error) {
    console.error('\n❌ ข้อผิดพลาดในการเชื่อมต่อ:', error.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
