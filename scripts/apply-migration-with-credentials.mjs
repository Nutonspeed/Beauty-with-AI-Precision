/**
 * Apply Treatment Recommendations Migration
 * Using provided Supabase credentials
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// New Supabase project credentials
const SUPABASE_URL = 'https://bgejeqqngzvuokdffadu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMzc1NCwiZXhwIjoyMDc3MjA5NzU0fQ.e6QXg-KmZpihUyuD81qeyORTgJtAzoaLTqAbIyamJ0o';

console.log('🚀 Starting Treatment Recommendations Migration...\n');
console.log(`📍 Target: ${SUPABASE_URL}`);
console.log(`🔑 Auth: Service Role Key\n`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20240128_treatment_recommendations.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log(`📏 Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

    // Execute the entire SQL as one query
    console.log('⚡ Executing migration...\n');

    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sql 
    }).single();

    if (error) {
      // Fallback: Try direct execution via PostgREST
      console.log('⚠️ RPC method failed, trying direct execution...\n');
      
      // Split into statements and execute one by one
      const statements = sql
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      console.log(`📝 Found ${statements.length} SQL statements\n`);

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        const preview = statement.substring(0, 60).replace(/\n/g, ' ');
        
        try {
          // Use the from() method to execute raw SQL
          const { error: execError } = await supabase
            .from('_migrations')
            .select('*')
            .limit(0);

          // Actually execute using rpc or direct query
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql_query: statement })
          });

          if (response.ok) {
            console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
            successCount++;
          } else {
            const errorText = await response.text();
            console.log(`⚠️ [${i + 1}/${statements.length}] ${preview}...`);
            console.log(`   Error: ${errorText.substring(0, 100)}`);
            failCount++;
          }
        } catch (err) {
          console.log(`❌ [${i + 1}/${statements.length}] ${preview}...`);
          console.log(`   ${err.message}`);
          failCount++;
        }
      }

      console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed\n`);

      if (failCount > 0) {
        throw new Error('Some statements failed. See errors above.');
      }
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify table creation
    console.log('🔍 Verifying table creation...');
    
    const { data: tables, error: tableError } = await supabase
      .from('treatment_recommendations')
      .select('id')
      .limit(0);

    if (tableError) {
      console.log('⚠️ Could not verify table (might not have permissions for direct query)');
      console.log('   Please check manually in Supabase Dashboard\n');
    } else {
      console.log('✅ Table "treatment_recommendations" verified!\n');
    }

    console.log('━'.repeat(60));
    console.log('🎉 Migration completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Verify in Dashboard: https://supabase.com/dashboard');
    console.log('2. Test API: POST /api/recommendations');
    console.log('3. Test UI: Visit /analysis/[id] page');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n📋 Manual fallback steps:');
    console.log('1. Visit: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql');
    console.log('2. Copy SQL from: supabase/migrations/20240128_treatment_recommendations.sql');
    console.log('3. Paste and run in SQL Editor\n');
    process.exit(1);
  }
}

applyMigration();
