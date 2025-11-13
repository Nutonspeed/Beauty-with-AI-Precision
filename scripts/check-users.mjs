#!/usr/bin/env node
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Client } = pg;

async function checkUsersTable() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ POSTGRES_URL/DATABASE_URL not found in environment');
    process.exit(1);
  }

  const cleanUrl = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
  const client = new Client({ 
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Get users table columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Users table columns:');
    console.log('─'.repeat(80));
    for (const row of columnsResult.rows) {
      console.log(`  ${row.column_name.padEnd(30)} ${row.data_type.padEnd(25)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    }
    console.log('─'.repeat(80));
    console.log(`Total: ${columnsResult.rows.length} columns\n`);

    // Check for role and clinic_id
    const hasRole = columnsResult.rows.some(r => r.column_name === 'role');
    const hasClinicId = columnsResult.rows.some(r => r.column_name === 'clinic_id');

    console.log('🔍 Key columns for RLS:');
    console.log(`  role:       ${hasRole ? '✓ EXISTS' : '✗ NOT FOUND'}`);
    console.log(`  clinic_id:  ${hasClinicId ? '✓ EXISTS' : '✗ NOT FOUND'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

await checkUsersTable();
