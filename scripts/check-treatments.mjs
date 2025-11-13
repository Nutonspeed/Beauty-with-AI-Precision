#!/usr/bin/env node
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Client } = pg;

async function checkTreatmentsTable() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found');
    process.exit(1);
  }

  const cleanUrl = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
  const client = new Client({ 
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected\n');

    // Check if treatments table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'treatments'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Table "treatments" does not exist');
      return;
    }

    // Get treatments table structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'treatments'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Treatments table columns:');
    console.log('─'.repeat(80));
    for (const col of columns.rows) {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(25)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    }
    console.log('─'.repeat(80));
    
    const hasClinicId = columns.rows.some(r => r.column_name === 'clinic_id');
    console.log(`\n🔍 clinic_id column: ${hasClinicId ? '✓ EXISTS' : '✗ NOT FOUND'}`);

    // Check row count
    const countResult = await client.query('SELECT COUNT(*) FROM treatments');
    console.log(`📊 Total rows: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

await checkTreatmentsTable();
