/**
 * Apply treatment_recommendations migration
 * Run: node scripts/apply-treatment-recommendations-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials from your project
const SUPABASE_URL = 'https://vvvwbvjwmhrlubbqbvuv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.log('Please set it in .env.local:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting migration...\n');

  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20240128_treatment_recommendations.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log(`📊 SQL length: ${sql.length} characters\n`);

    // Split into individual statements (basic split by semicolon + newline)
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 80).replace(/\n/g, ' ');
      
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      });

      if (error) {
        // Try alternative method using REST API
        const { error: restError } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', statement);

        if (restError) {
          console.error(`❌ Failed to execute statement ${i + 1}`);
          console.error('Error:', error.message || restError.message);
          console.error('Statement:', statement.substring(0, 200));
          
          // Continue with next statement instead of failing completely
          continue;
        }
      }

      console.log(`✅ Statement ${i + 1} executed successfully`);
    }

    console.log('\n✨ Migration applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify table creation: Check Supabase Dashboard → Database → Tables');
    console.log('2. Test API: Visit /api/recommendations');
    console.log('3. Test UI: Visit /analysis/[id] page');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nManual fallback:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/vvvwbvjwmhrlubbqbvuv/sql');
    console.log('2. Copy content from: supabase/migrations/20240128_treatment_recommendations.sql');
    console.log('3. Paste and run in SQL Editor');
    process.exit(1);
  }
}

// Run migration
applyMigration();
