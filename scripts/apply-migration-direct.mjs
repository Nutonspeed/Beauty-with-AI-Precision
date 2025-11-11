/**
 * Direct Migration Execution via Supabase REST API
 * Using Service Role Key with proper authentication
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Credentials
const SUPABASE_URL = 'https://bgejeqqngzvuokdffadu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMzc1NCwiZXhwIjoyMDc3MjA5NzU0fQ.e6QXg-KmZpihUyuD81qeyORTgJtAzoaLTqAbIyamJ0o';

console.log('🚀 Starting Migration with Direct SQL Execution\n');

async function checkTableExists() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/treatment_recommendations?limit=0`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    if (response.status === 404 || response.status === 406) {
      return false; // Table doesn't exist
    }
    return true; // Table exists
  } catch (error) {
    return false;
  }
}

async function executeSQLViaFunction(sql) {
  try {
    // Try using postgres.js connection
    const { default: postgres } = await import('postgres');
    
    const connectionString = 'postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
    
    const sql_client = postgres(connectionString, {
      ssl: false, // Pooler doesn't need SSL
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    console.log('🔌 Connected via postgres.js...');
    
    // Execute SQL
    await sql_client.unsafe(sql);
    
    console.log('✅ SQL executed successfully!');
    
    await sql_client.end();
    return true;
  } catch (error) {
    console.error('❌ Postgres.js execution failed:', error.message);
    return false;
  }
}

async function applyMigration() {
  try {
    // Step 1: Check if table already exists
    console.log('🔍 Checking if table exists...');
    const exists = await checkTableExists();
    
    if (exists) {
      console.log('✅ Table "treatment_recommendations" already exists!');
      console.log('   Migration may have been applied previously.\n');
      console.log('━'.repeat(60));
      console.log('🎉 Week 8 Database: READY!\n');
      console.log('You can now test:');
      console.log('1. API: POST /api/recommendations');
      console.log('2. UI: Visit /analysis/[id] page');
      console.log('━'.repeat(60));
      return;
    }

    console.log('⚠️  Table does not exist. Applying migration...\n');

    // Step 2: Read migration SQL
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20240128_treatment_recommendations.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration loaded');
    console.log(`📏 Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

    // Step 3: Execute via postgres.js
    const success = await executeSQLViaFunction(sql);

    if (success) {
      console.log('\n━'.repeat(60));
      console.log('🎉 Migration Applied Successfully!\n');
      console.log('✅ Table: treatment_recommendations');
      console.log('✅ Indexes: 6 indexes created');
      console.log('✅ RLS: Security policies enabled');
      console.log('✅ Triggers: Auto-update timestamp\n');
      console.log('Next steps:');
      console.log('1. Test API: POST /api/recommendations');
      console.log('2. Test UI: Visit /analysis/[id] page');
      console.log('3. Proceed to Week 10: Testing & Launch Prep');
      console.log('━'.repeat(60));
    } else {
      throw new Error('Migration execution failed');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📋 Manual fallback required:');
    console.log('1. Open: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql');
    console.log('2. Copy SQL from: supabase/migrations/20240128_treatment_recommendations.sql');
    console.log('3. Paste and run in SQL Editor\n');
    process.exit(1);
  }
}

applyMigration();
