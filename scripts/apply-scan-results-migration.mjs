#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^["']|["']$/g, '');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/^["']|["']$/g, '');

console.log('📋 Environment check:');
console.log('   URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('   Key:', supabaseServiceKey ? '✓ Found' : '✗ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableExists() {
  const { data, error } = await supabase
    .from('skin_scan_results')
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') {
    // Table doesn't exist
    return false;
  }
  
  return true;
}

async function applyMigration() {
  console.log('🔍 Checking if skin_scan_results table exists...');
  
  const tableExists = await checkTableExists();
  
  if (tableExists) {
    console.log('✅ Table already exists! No migration needed.');
    console.log('   You can view it in Supabase Dashboard > Table Editor');
    return;
  }

  console.log('📝 Table not found. Reading migration file...');
  
  // Read migration SQL
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20241122_create_scan_results_tables.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('🚀 Applying migration to remote database...');
  console.log('   This will create:');
  console.log('   - skin_scan_results table');
  console.log('   - RLS policies for data security');
  console.log('   - Indexes for performance');
  console.log('   - Statistics view');

  // Apply migration using rpc
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Manual steps:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy the SQL from: supabase/migrations/20241122_create_scan_results_tables.sql');
    console.log('3. Paste and run the SQL');
    process.exit(1);
  }

  console.log('✅ Migration applied successfully!');
  console.log('\n📊 Table structure:');
  console.log('   - Customer info (name, phone, email)');
  console.log('   - 3 photos (front, left, right)');
  console.log('   - AI analysis results');
  console.log('   - Heatmap data & problem areas');
  console.log('   - Email/Chat tracking');
  console.log('   - Lead integration');
  console.log('\n🔒 Security:');
  console.log('   - RLS enabled');
  console.log('   - Sales users see own scans');
  console.log('   - Admins/managers see all scans');
  console.log('\n🎉 Ready to use! Test at: /sales/quick-scan');
}

// Run migration
applyMigration().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
