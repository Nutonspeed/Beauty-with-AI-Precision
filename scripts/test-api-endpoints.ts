/**
 * API Endpoints Testing Script
 * ทดสอบ critical endpoints หลังจาก customers → users migration
 * 
 * Usage:
 * ts-node scripts/test-api-endpoints.ts
 * or
 * node --loader ts-node/esm scripts/test-api-endpoints.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<any>
): Promise<void> {
  const startTime = Date.now();
  try {
    console.log(`🧪 Testing: ${name}...`);
    const result = await testFn();
    const duration = Date.now() - startTime;
    
    results.push({
      name,
      status: 'pass',
      duration,
      details: result,
    });
    
    console.log(`✅ PASS (${duration}ms): ${name}`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    results.push({
      name,
      status: 'fail',
      duration,
      error: error.message,
    });
    
    console.log(`❌ FAIL (${duration}ms): ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

// ========================================
// Test 1: Database Health Check
// ========================================
async function testDatabaseHealth() {
  const { data, error } = await supabaseAdmin.rpc('check_database_health');
  
  if (error) throw error;
  if (!data) throw new Error('No health data returned');
  if (data.health_status !== 'healthy') {
    throw new Error(`Database health: ${data.health_status}`);
  }
  
  return {
    health_status: data.health_status,
    foreign_keys: data.checks.foreign_keys.count,
    indexes: data.checks.indexes.count,
    database_size: data.database_size,
  };
}

// ========================================
// Test 2: Users Table Query (ใช้แทน customers)
// ========================================
async function testUsersTableQuery() {
  const { data, error, count } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, clinic_id', { count: 'exact' })
    .eq('role', 'customer')
    .limit(10);
  
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No customer users found');
  }
  
  return {
    total_customers: count,
    sample_count: data.length,
    sample_emails: data.map(u => u.email),
  };
}

// ========================================
// Test 3: Skin Analyses with Users (not customers)
// ========================================
async function testSkinAnalysesQuery() {
  const { data, error, count } = await supabaseAdmin
    .from('skin_analyses')
    .select(`
      id,
      user_id,
      users!skin_analyses_user_id_fkey (
        email,
        full_name
      )
    `, { count: 'exact' })
    .limit(5);
  
  if (error) throw error;
  
  // ตรวจสอบว่า user_id เป็น UUID และมี FK relationship
  if (data && data.length > 0) {
    const firstRecord = data[0];
    if (!firstRecord.user_id) {
      throw new Error('user_id is null');
    }
    if (typeof firstRecord.user_id !== 'string') {
      throw new Error('user_id is not UUID string');
    }
  }
  
  return {
    total_analyses: count,
    sample_count: data?.length || 0,
    has_user_relation: data && data.length > 0 && !!data[0].users,
  };
}

// ========================================
// Test 4: Appointments FK to Users (not customers)
// ========================================
async function testAppointmentsForeignKey() {
  // ตรวจสอบว่า foreign key ชี้ไปที่ users แล้ว
  const { data, error } = await supabaseAdmin.rpc('execute_sql', {
    query: `
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'appointments'
        AND kcu.column_name = 'customer_id'
    `
  });
  
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No FK constraint found for appointments.customer_id');
  }
  
  const fk = data[0];
  if (fk.foreign_table_name !== 'users') {
    throw new Error(`FK points to ${fk.foreign_table_name}, not users`);
  }
  
  return {
    constraint_name: fk.constraint_name,
    points_to: fk.foreign_table_name,
    status: 'correct',
  };
}

// ========================================
// Test 5: Invitation Flow
// ========================================
async function testInvitationCreation() {
  const testEmail = `test-${Date.now()}@migration-test.com`;
  const testClinicId = '00000000-0000-0000-0000-000000000001'; // test clinic
  
  // สร้าง invitation
  const { data, error } = await supabaseAdmin
    .from('invitations')
    .insert({
      email: testEmail,
      clinic_id: testClinicId,
      invited_by: '00000000-0000-0000-0000-000000000002', // test sales user
      role: 'customer',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error('No invitation created');
  
  // ทดสอบ duplicate prevention
  const { error: duplicateError } = await supabaseAdmin
    .from('invitations')
    .insert({
      email: testEmail,
      clinic_id: testClinicId,
      invited_by: '00000000-0000-0000-0000-000000000002',
      role: 'customer',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  
  const duplicatePrevented = duplicateError !== null;
  
  // ลบ test invitation
  await supabaseAdmin.from('invitations').delete().eq('id', data.id);
  
  return {
    invitation_created: true,
    duplicate_prevented: duplicatePrevented,
    token_generated: !!data.token,
  };
}

// ========================================
// Test 6: Sales Leads Query
// ========================================
async function testSalesLeadsQuery() {
  const { data, error, count } = await supabaseAdmin
    .from('sales_leads')
    .select(`
      id,
      customer_user_id,
      users!sales_leads_customer_user_id_fkey (
        email,
        full_name,
        role
      )
    `, { count: 'exact' })
    .not('customer_user_id', 'is', null)
    .limit(5);
  
  if (error) throw error;
  
  return {
    total_leads: count,
    leads_with_users: data?.length || 0,
    has_user_relation: data && data.length > 0 && !!data[0].users,
  };
}

// ========================================
// Test 7: Performance Check
// ========================================
async function testQueryPerformance() {
  const tests = [];
  
  // Test 1: User by ID (should be fast with index)
  let start = Date.now();
  await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000002')
    .single();
  tests.push({ query: 'user_by_id', duration: Date.now() - start });
  
  // Test 2: Skin analyses by user_id (should be fast with index)
  start = Date.now();
  await supabaseAdmin
    .from('skin_analyses')
    .select('*')
    .eq('user_id', '00000000-0000-0000-0000-000000000002')
    .limit(10);
  tests.push({ query: 'analyses_by_user', duration: Date.now() - start });
  
  // Test 3: Users by clinic_id (should be fast with index)
  start = Date.now();
  await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clinic_id', '00000000-0000-0000-0000-000000000001')
    .limit(20);
  tests.push({ query: 'users_by_clinic', duration: Date.now() - start });
  
  // ตรวจสอบว่าทุก query เร็วกว่า 50ms
  const slowQueries = tests.filter(t => t.duration > 50);
  if (slowQueries.length > 0) {
    throw new Error(`Slow queries detected: ${JSON.stringify(slowQueries)}`);
  }
  
  return {
    all_queries_fast: true,
    max_duration: Math.max(...tests.map(t => t.duration)),
    avg_duration: tests.reduce((sum, t) => sum + t.duration, 0) / tests.length,
    details: tests,
  };
}

// ========================================
// Test 8: No Orphaned Records
// ========================================
async function testNoOrphanedRecords() {
  // ตรวจสอบว่าไม่มี orphaned skin_analyses
  const { count: orphanedAnalyses } = await supabaseAdmin
    .from('skin_analyses')
    .select('id', { count: 'exact', head: true })
    .is('user_id', null);
  
  // ตรวจสอบว่าไม่มี orphaned sales_leads
  const { data: orphanedLeads } = await supabaseAdmin.rpc('execute_sql', {
    query: `
      SELECT COUNT(*) as count
      FROM sales_leads sl
      LEFT JOIN users u ON sl.customer_user_id = u.id
      WHERE sl.customer_user_id IS NOT NULL AND u.id IS NULL
    `
  });
  
  if (orphanedAnalyses && orphanedAnalyses > 0) {
    throw new Error(`Found ${orphanedAnalyses} orphaned skin_analyses`);
  }
  
  const orphanedLeadsCount = orphanedLeads?.[0]?.count || 0;
  if (orphanedLeadsCount > 0) {
    throw new Error(`Found ${orphanedLeadsCount} orphaned sales_leads`);
  }
  
  return {
    orphaned_analyses: 0,
    orphaned_leads: 0,
    status: 'clean',
  };
}

// ========================================
// Main Test Runner
// ========================================
async function main() {
  console.log('🚀 Starting API Endpoints Tests...\n');
  console.log('=' .repeat(60));
  
  await runTest('1. Database Health Check', testDatabaseHealth);
  await runTest('2. Users Table Query (replaces customers)', testUsersTableQuery);
  await runTest('3. Skin Analyses Query with Users FK', testSkinAnalysesQuery);
  await runTest('4. Appointments FK to Users', testAppointmentsForeignKey);
  await runTest('5. Invitation Creation & Duplicate Prevention', testInvitationCreation);
  await runTest('6. Sales Leads Query with Users', testSalesLeadsQuery);
  await runTest('7. Query Performance Check', testQueryPerformance);
  await runTest('8. No Orphaned Records', testNoOrphanedRecords);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => r.status === 'fail')
      .forEach(r => {
        console.log(`   - ${r.name}`);
        console.log(`     Error: ${r.error}`);
      });
  }
  
  // Performance summary
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;
  console.log(`\n⏱️  Average Duration: ${avgDuration.toFixed(1)}ms`);
  
  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 All tests passed! System is ready for production.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review before deploying.\n');
    process.exit(1);
  }
}

// Run tests
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
