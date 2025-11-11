#!/usr/bin/env node

/**
 * Apply Migration Directly via Supabase Client
 * This bypasses the migration history sync issue
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://bgejeqqngzvuokdffadu.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMzc1NCwiZXhwIjoyMDc3MjA5NzU0fQ.e6QXg-KmZpihUyuD81qeyORTgJtAzoaLTqAbIyamJ0o";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Applying Multi-Tenant Enhancement Migration...\n');

async function main() {
  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251111_multi_tenant_enhancement.sql');
    console.log(`📖 Reading migration file: ${migrationPath}\n`);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log(`📊 Migration size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);
    console.log('━'.repeat(80));
    console.log('⚡ Executing migration SQL...\n');

    // Execute via RPC to postgres
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.log('❌ Migration failed via RPC. Trying alternative method...\n');
      console.log('Error:', error.message, '\n');
      
      // Try splitting into smaller chunks
      console.log('🔄 Splitting migration into statements...\n');
      
      const statements = migrationSQL
        .split(/;\s*$/gm)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      console.log(`Found ${statements.length} SQL statements\n`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        
        // Show first 80 chars
        const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
        console.log(`   ${preview}...`);
        
        try {
          // For Supabase, we need to use REST API to execute raw SQL
          // Since .rpc() might not work, we'll provide manual instructions
          throw new Error('Cannot execute raw SQL via Supabase JS client');
        } catch (err) {
          // Expected - Supabase JS doesn't support raw SQL execution
          break;
        }
      }
      
      console.log('\n━'.repeat(80));
      console.log('❌ Direct SQL execution not possible via Supabase JS Client\n');
      console.log('📋 MANUAL STEPS REQUIRED:\n');
      console.log('1. Open Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/editor\n');
      console.log('2. Go to SQL Editor\n');
      console.log('3. Copy the content from this file:');
      console.log(`   ${migrationPath}\n`);
      console.log('4. Paste into SQL Editor\n');
      console.log('5. Click "Run" button\n');
      console.log('6. Verify the output shows success messages\n');
      console.log('━'.repeat(80));
      
      // Copy migration to clipboard if possible
      console.log('\n💡 TIP: Migration file is ready at:');
      console.log(`   ${migrationPath}\n`);
      
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!\n');
    console.log(data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 SOLUTION:\n');
    console.error('Since direct SQL execution via Node.js is limited, please:');
    console.error('1. Open Supabase Dashboard SQL Editor');
    console.error('2. Copy migration file content');
    console.error('3. Run it manually\n');
    
    // Show the dashboard link
    console.log('🔗 Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql/new\n');
    
    process.exit(1);
  }
}

main();
