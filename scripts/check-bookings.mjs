#!/usr/bin/env node
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Client } = pg;

async function checkBookingsTable() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ POSTGRES_URL/DATABASE_URL not found in environment');
    process.exit(1);
  }

  // Remove sslmode from URL if present
  const cleanUrl = connectionString.replace(/[?&]sslmode=[^&]*/g, '');

  const client = new Client({ 
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Get bookings table columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bookings'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Bookings table columns:');
    console.log('─'.repeat(80));
    columnsResult.rows.forEach(row => {
      console.log(`  ${row.column_name.padEnd(30)} ${row.data_type.padEnd(25)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(80));
    console.log(`Total: ${columnsResult.rows.length} columns\n`);

    // Check if patient_id, user_id, or customer_id exist
    const hasPatientId = columnsResult.rows.some(r => r.column_name === 'patient_id');
    const hasUserId = columnsResult.rows.some(r => r.column_name === 'user_id');
    const hasCustomerId = columnsResult.rows.some(r => r.column_name === 'customer_id');

    console.log('🔍 Customer identifier columns:');
    console.log(`  patient_id:   ${hasPatientId ? '✓ EXISTS' : '✗ NOT FOUND'}`);
    console.log(`  user_id:      ${hasUserId ? '✓ EXISTS' : '✗ NOT FOUND'}`);
    console.log(`  customer_id:  ${hasCustomerId ? '✓ EXISTS' : '✗ NOT FOUND'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkBookingsTable();
