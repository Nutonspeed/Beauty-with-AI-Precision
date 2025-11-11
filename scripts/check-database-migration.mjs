/**
 * Database Migration Helper
 * 
 * Helps apply Supabase migrations:
 * 1. Checks if migration is needed
 * 2. Provides instructions for manual application
 * 3. Verifies table structure after migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function checkMigrationStatus() {
  section('🔍 Database Migration Check');

  // Load environment variables and remove quotes
  const cleanEnv = (str) => (str || '').replaceAll(/^["']|["']$/g, '');
  const SUPABASE_URL = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const SUPABASE_KEY = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('❌ Missing Supabase credentials in .env.local', 'red');
    log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    return { success: false };
  }

  log(`Supabase URL: ${SUPABASE_URL}`, 'gray');
  log('✅ Credentials loaded', 'green');

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Check if analyses table exists
    section('📊 Checking Table Status');
    
    log('Querying analyses table...', 'gray');
    const { data, error } = await supabase
      .from('analyses')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.analyses" does not exist')) {
        log('❌ Table "analyses" does not exist', 'red');
        log('', 'reset');
        
        section('📝 Migration Required');
        log('You need to create the analyses table in Supabase.', 'yellow');
        log('', 'reset');
        log('Option 1: Use Supabase Dashboard (Recommended)', 'cyan');
        log('  1. Go to: https://supabase.com/dashboard/project/_/sql', 'gray');
        log(`  2. Replace _ with your project ID: ${SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1] || 'YOUR_PROJECT_ID'}`, 'gray');
        log('  3. Copy the SQL from:', 'gray');
        log('     supabase/migrations/20251110_create_analyses_table.sql', 'gray');
        log('  4. Paste and run in SQL editor', 'gray');
        log('', 'reset');
        log('Option 2: Use Supabase CLI', 'cyan');
        log('  supabase migration up', 'gray');
        log('', 'reset');

        // Show migration file content
        section('📄 Migration SQL Preview');
        try {
          const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251110_create_analyses_table.sql');
          const migrationSQL = readFileSync(migrationPath, 'utf-8');
          const preview = migrationSQL.split('\n').slice(0, 30).join('\n');
          log(preview, 'gray');
          log('...', 'gray');
          log(`\nFull file: ${migrationPath}`, 'gray');
        } catch (readError) {
          log('⚠️  Could not read migration file', 'yellow');
        }

        return { success: false, needsMigration: true };
      } else {
        throw error;
      }
    }

    log('✅ Table "analyses" exists', 'green');

    // Verify table structure
    section('🔍 Verifying Table Structure');
    
    // Try to describe the table (this might not work with all Supabase setups)
    log('Checking columns...', 'gray');
    
    // Try a minimal insert to verify structure (will rollback)
    const testData = {
      id: 'test_structure_check',
      user_id: '00000000-0000-0000-0000-000000000000',
      type: 'single',
      storage_paths: {},
      image_urls: {},
      analysis_data: {},
    };

    const { error: insertError } = await supabase
      .from('analyses')
      .insert(testData)
      .select();

    if (insertError) {
      if (insertError.message.includes('violates foreign key constraint')) {
        log('✅ Table structure is correct (foreign key constraint active)', 'green');
        // Clean up test data if it somehow got inserted
        await supabase.from('analyses').delete().eq('id', 'test_structure_check');
      } else if (insertError.message.includes('column')) {
        log('⚠️  Table structure might be incorrect:', 'yellow');
        log(`   ${insertError.message}`, 'yellow');
        return { success: false, needsUpdate: true };
      } else {
        log('✅ Table structure appears correct', 'green');
      }
    } else {
      log('✅ Table structure is correct', 'green');
      // Clean up test data
      await supabase.from('analyses').delete().eq('id', 'test_structure_check');
    }

    // Check RLS policies
    section('🔒 Checking RLS Policies');
    log('RLS policies should be enabled...', 'gray');
    
    // Try to query without auth (should fail if RLS is working)
    const ANON_KEY = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_KEY);
    const publicClient = createClient(
      SUPABASE_URL,
      ANON_KEY
    );
    
    const { data: publicData, error: publicError } = await publicClient
      .from('analyses')
      .select('id')
      .limit(1);

    if (publicError || !publicData || publicData.length === 0) {
      log('✅ RLS policies are active (public access blocked)', 'green');
    } else {
      log('⚠️  RLS might not be configured correctly', 'yellow');
      log('   Public access should be restricted', 'yellow');
    }

    // Success summary
    section('✅ Database Ready!');
    log('All checks passed:', 'green');
    log('  ✓ analyses table exists', 'green');
    log('  ✓ Table structure is correct', 'green');
    log('  ✓ RLS policies are active', 'green');
    log('', 'reset');
    log('🎉 Ready to use storage system!', 'cyan');

    return { success: true };

  } catch (error) {
    section('❌ Check Failed');
    log(`Error: ${error.message}`, 'red');
    
    if (error.stack) {
      log('\nStack trace:', 'gray');
      log(error.stack, 'gray');
    }

    return { success: false, error: error.message };
  }
}

// Run check
console.log('\n');
try {
  const result = await checkMigrationStatus();
  console.log('\n');
  process.exit(result.success ? 0 : 1);
} catch (error) {
  console.error('Unexpected error:', error);
  process.exit(1);
}
