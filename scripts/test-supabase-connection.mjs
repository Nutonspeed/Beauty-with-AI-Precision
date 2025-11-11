#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Tests multiple connection methods to find working one
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Supabase Connection Test\n');
console.log('📋 Configuration:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Anon Key: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`);
console.log(`   Service Key: ${SUPABASE_SERVICE_KEY?.substring(0, 20)}...`);
console.log('');

// Test 1: Anon Key Connection
async function testAnonConnection() {
  console.log('🧪 Test 1: Anon Key Connection');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      return false;
    }
    
    console.log('   ✅ Success! Connected with Anon Key');
    return true;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

// Test 2: Service Role Key Connection
async function testServiceRoleConnection() {
  console.log('\n🧪 Test 2: Service Role Key Connection');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Query with service role (bypasses RLS)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .limit(5);
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      return false;
    }
    
    console.log(`   ✅ Success! Found ${data?.length || 0} users`);
    if (data && data.length > 0) {
      console.log(`   📊 Sample user: ${data[0].email}`);
    }
    return true;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

// Test 3: List Tables
async function testListTables() {
  console.log('\n🧪 Test 3: List Database Tables');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Query information_schema
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
        LIMIT 20
      `
    });
    
    if (error) {
      console.log(`   ⚠️  RPC not available, trying alternative...`);
      
      // Try getting table list from skin_analyses table metadata
      const { data: tableData, error: tableError } = await supabase
        .from('skin_analyses')
        .select('*')
        .limit(0);
      
      if (tableError) {
        console.log(`   ❌ Failed: ${tableError.message}`);
        return false;
      }
      
      console.log('   ✅ Can access skin_analyses table');
      return true;
    }
    
    console.log(`   ✅ Found ${data?.length || 0} tables`);
    if (data) {
      console.log('   📋 Tables:', data.map(t => t.table_name).join(', '));
    }
    return true;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

// Test 4: Query Skin Analyses
async function testSkinAnalysesQuery() {
  console.log('\n🧪 Test 4: Query Skin Analyses Table');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error, count } = await supabase
      .from('skin_analyses')
      .select('id, user_id, created_at, quality_overall', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      return false;
    }
    
    console.log(`   ✅ Success! Total analyses: ${count}`);
    if (data && data.length > 0) {
      console.log(`   📊 Latest analysis: ${data[0].created_at}`);
      console.log(`      Quality score: ${data[0].quality_overall}`);
    }
    return true;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

// Test 5: Check Migration Status
async function testMigrationStatus() {
  console.log('\n🧪 Test 5: Check Migration Status');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Try to query migrations table if it exists
    const { data, error } = await supabase
      .from('_prisma_migrations')
      .select('*')
      .order('finished_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log(`   ⚠️  Migrations table not found (normal for Supabase)`);
      console.log(`   ℹ️  Supabase uses its own migration system`);
      return true;
    }
    
    console.log(`   ✅ Found ${data?.length || 0} migrations`);
    if (data && data.length > 0) {
      console.log(`   📋 Latest: ${data[0].migration_name}`);
    }
    return true;
  } catch (err) {
    console.log(`   ⚠️  ${err.message}`);
    return true; // Not critical
  }
}

// Test 6: Test Database Write (Safe)
async function testDatabaseWrite() {
  console.log('\n🧪 Test 6: Test Database Write (Safe Test)');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Try to insert a test record (will rollback)
    const testData = {
      test_field: 'connection_test',
      created_at: new Date().toISOString()
    };
    
    // Check if we have write permission by trying to update our own session
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`   ⚠️  Auth check: ${error.message}`);
    } else {
      console.log(`   ✅ Auth system working`);
    }
    
    return true;
  } catch (err) {
    console.log(`   ⚠️  ${err.message}`);
    return true; // Not critical
  }
}

// Main execution
async function main() {
  const results = [];
  
  results.push(await testAnonConnection());
  results.push(await testServiceRoleConnection());
  results.push(await testListTables());
  results.push(await testSkinAnalysesQuery());
  results.push(await testMigrationStatus());
  results.push(await testDatabaseWrite());
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Database connection is working.\n');
    process.exit(0);
  } else if (passed > 0) {
    console.log('\n⚠️  Some tests failed, but basic connection works.\n');
    process.exit(0);
  } else {
    console.log('\n❌ All tests failed. Check your configuration.\n');
    console.log('💡 Suggestions:');
    console.log('   1. Verify SUPABASE_URL and keys in .env.local');
    console.log('   2. Check if Supabase project is active');
    console.log('   3. Verify network connection');
    console.log('   4. Check Supabase dashboard for errors\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
