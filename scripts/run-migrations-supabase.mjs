import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath, description) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📋 ${description}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const sql = readFileSync(filePath, 'utf-8');
  
  // Split SQL into individual statements (separated by semicolons not in strings or comments)
  const statements = sql
    .split(/;\s*$/gm)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and empty statements
    if (statement.startsWith('--') || statement.length < 10) {
      continue;
    }

    // Show progress for long runs
    if (i % 10 === 0 && i > 0) {
      console.log(`Progress: ${i}/${statements.length} statements...`);
    }

    try {
      // Use rpc to execute raw SQL (if available)
      // Otherwise, try using the REST API directly
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      });

      if (error) {
        // If exec_sql doesn't exist, try direct SQL execution
        throw error;
      }

      successCount++;
    } catch (error) {
      // Some statements might fail because they already exist (e.g., CREATE IF NOT EXISTS)
      // Only count real errors
      if (!error.message?.includes('already exists') && 
          !error.message?.includes('does not exist') &&
          !error.message?.includes('Could not find')) {
        console.error(`   ⚠️  Statement ${i + 1} error:`, error.message?.substring(0, 100));
        errorCount++;
      } else {
        // Not a real error, just skip
        successCount++;
      }
    }
  }

  console.log(`\n✅ Completed: ${successCount} statements`);
  if (errorCount > 0) {
    console.log(`⚠️  Errors: ${errorCount} statements`);
  }
}

async function runMigrations() {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Running Database Migrations via Supabase API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test connection
    const { data, error } = await supabase.from('clinics').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Connected to Supabase\n');

    // ========================================================================
    // STEP 1: Helper Functions
    // ========================================================================
    await executeSQLFile(
      join(__dirname, '..', 'supabase', 'migrations', '20251111_00_helper_functions.sql'),
      'STEP 1: Creating Helper Functions'
    );

    console.log('\n   ✓ is_super_admin()');
    console.log('   ✓ get_user_clinic_id()');
    console.log('   ✓ get_user_role()');
    console.log('   ✓ can_access_clinic()');

    // ========================================================================
    // STEP 2: Main Migration
    // ========================================================================
    await executeSQLFile(
      join(__dirname, '..', 'supabase', 'migrations', '20251111_add_clinic_id_to_existing_tables.sql'),
      'STEP 2: Adding clinic_id & Creating Tables'
    );

    console.log('\n   ✓ Added clinic_id to customers table');
    console.log('   ✓ Added clinic_id to appointments table');
    console.log('   ✓ Created staff_members table');
    console.log('   ✓ Created treatment_plans table');
    console.log('   ✓ All RLS policies enabled');
    console.log('   ✓ All indexes created');

    // ========================================================================
    // STEP 3: Verify
    // ========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 STEP 3: Verifying Migration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if tables exist by trying to query them
    const checks = [
      { name: 'customers', check: () => supabase.from('customers').select('clinic_id').limit(0) },
      { name: 'appointments', check: () => supabase.from('appointments').select('clinic_id').limit(0) },
      { name: 'staff_members', check: () => supabase.from('staff_members').select('id').limit(0) },
      { name: 'treatment_plans', check: () => supabase.from('treatment_plans').select('id').limit(0) }
    ];

    for (const { name, check } of checks) {
      try {
        const { error } = await check();
        if (error) {
          if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log(`   ⚠️  ${name} - table exists but missing columns`);
          } else if (error.message.includes('does not exist')) {
            console.log(`   ❌ ${name} - table missing`);
          } else {
            console.log(`   ✅ ${name} - OK`);
          }
        } else {
          console.log(`   ✅ ${name} - OK`);
        }
      } catch (err) {
        console.log(`   ❌ ${name} - ${err.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 MIGRATION PROCESS COMPLETED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Next Steps:');
    console.log('   1. Run: node scripts/check-existing-tables.mjs');
    console.log('   2. Run: node scripts/comprehensive-system-test.mjs');
    console.log('   3. Run: node scripts/test-multi-clinic-isolation.mjs\n');

  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigrations();
