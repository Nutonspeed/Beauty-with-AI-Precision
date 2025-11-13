#!/usr/bin/env node
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Client } = pg;

async function checkRLSPolicies() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found in environment');
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

    // Check policies on key tables
    const tables = ['bookings', 'customers', 'treatments', 'services'];
    
    for (const tableName of tables) {
      const policiesResult = await client.query(`
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = $1
        ORDER BY policyname;
      `, [tableName]);

      console.log(`\n📋 RLS Policies for table: ${tableName}`);
      console.log('─'.repeat(100));
      
      if (policiesResult.rows.length === 0) {
        console.log('  ⚠️  No RLS policies found!');
      } else {
        for (const policy of policiesResult.rows) {
          console.log(`\n  Policy: ${policy.policyname}`);
          console.log(`  Command: ${policy.cmd}`);
          console.log(`  Roles: ${Array.isArray(policy.roles) ? policy.roles.join(', ') : policy.roles}`);
          if (policy.qual) {
            console.log(`  USING: ${policy.qual.substring(0, 150)}${policy.qual.length > 150 ? '...' : ''}`);
          }
          if (policy.with_check) {
            console.log(`  WITH CHECK: ${policy.with_check.substring(0, 150)}${policy.with_check.length > 150 ? '...' : ''}`);
          }
        }
      }
      console.log('─'.repeat(100));
    }

    // Check if tables have RLS enabled
    console.log('\n\n🔒 RLS Status:');
    console.log('─'.repeat(100));
    for (const tableName of tables) {
      const rlsResult = await client.query(`
        SELECT relname, relrowsecurity 
        FROM pg_class 
        WHERE relname = $1 AND relnamespace = 'public'::regnamespace;
      `, [tableName]);
      
      if (rlsResult.rows.length > 0) {
        const enabled = rlsResult.rows[0].relrowsecurity;
        console.log(`  ${tableName.padEnd(20)} ${enabled ? '✓ ENABLED' : '✗ DISABLED'}`);
      } else {
        console.log(`  ${tableName.padEnd(20)} ⚠️  Table not found`);
      }
    }
    console.log('─'.repeat(100));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

await checkRLSPolicies();
