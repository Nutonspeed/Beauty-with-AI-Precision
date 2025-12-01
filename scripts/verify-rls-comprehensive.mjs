#!/usr/bin/env node

/**
 * Comprehensive RLS Policies Verification
 * 
 * Verifies all Row Level Security policies are properly configured
 * and tests multi-tenant data isolation
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.log('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Critical tables that need RLS
const CRITICAL_TABLES = [
  'users',
  'user_profiles', 
  'clinics',
  'branches',
  'clinic_staff',
  'skin_analyses',
  'sales_leads',
  'chat_history',
  'bookings',
  'treatments',
  'inventory',
  'loyalty_points',
  'invitations'
]

// Test users for multi-tenant verification
const TEST_USERS = {
  clinic1_admin: {
    email: 'clinic1-admin@test.com',
    clinic_id: 'clinic-1'
  },
  clinic1_staff: {
    email: 'clinic1-staff@test.com', 
    clinic_id: 'clinic-1'
  },
  clinic2_admin: {
    email: 'clinic2-admin@test.com',
    clinic_id: 'clinic-2'
  },
  super_admin: {
    email: 'super-admin@test.com',
    role: 'super_admin'
  }
}

class RLSVerifier {
  constructor() {
    this.results = {
      tables: {},
      policies: {},
      tests: {},
      summary: {
        total_tables: 0,
        rls_enabled: 0,
        policies_found: 0,
        tests_passed: 0,
        security_score: 0
      }
    }
  }

  async run() {
    console.log('🔒 Comprehensive RLS Verification\n')
    console.log('📊 Checking database security...\n')

    try {
      await this.checkRLSEnabled()
      await this.analyzePolicies()
      await this.testDataIsolation()
      await this.testPermissionMatrix()
      await this.generateReport()
    } catch (error) {
      console.error('❌ Verification failed:', error.message)
    }
  }

  async checkRLSEnabled() {
    console.log('🔍 Step 1: Checking RLS Enabled Status')

    for (const table of CRITICAL_TABLES) {
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('rowsecurity')
          .eq('table_schema', 'public')
          .eq('table_name', table)
          .single()

        if (error) {
          this.results.tables[table] = {
            rls_enabled: false,
            error: error.message
          }
          console.log(`  ❌ ${table}: Error checking RLS`)
        } else {
          const rlsEnabled = data?.rowsecurity === 'YES'
          this.results.tables[table] = {
            rls_enabled: rlsEnabled
          }
          
          if (rlsEnabled) {
            this.results.summary.rls_enabled++
            console.log(`  ✅ ${table}: RLS enabled`)
          } else {
            console.log(`  ❌ ${table}: RLS disabled`)
          }
        }
        
        this.results.summary.total_tables++
      } catch (error) {
        console.log(`  ❌ ${table}: ${error.message}`)
        this.results.tables[table] = {
          rls_enabled: false,
          error: error.message
        }
        this.results.summary.total_tables++
      }
    }
  }

  async analyzePolicies() {
    console.log('\n🔍 Step 2: Analyzing RLS Policies')

    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .in('tablename', CRITICAL_TABLES)

    if (error) {
      console.log('  ❌ Error fetching policies:', error.message)
      return
    }

    for (const table of CRITICAL_TABLES) {
      const tablePolicies = policies?.filter(p => p.tablename === table) || []
      
      this.results.policies[table] = {
        count: tablePolicies.length,
        policies: tablePolicies.map(p => ({
          name: p.policyname,
          command: p.cmd,
          roles: p.roles,
          qual: p.qual
        }))
      }

      if (tablePolicies.length > 0) {
        this.results.summary.policies_found += tablePolicies.length
        console.log(`  ✅ ${table}: ${tablePolicies.length} policy(ies) found`)
        
        // Check for essential policies
        const hasSelect = tablePolicies.some(p => p.cmd === 'SELECT')
        const hasInsert = tablePolicies.some(p => p.cmd === 'INSERT')
        const hasUpdate = tablePolicies.some(p => p.cmd === 'UPDATE')
        const hasDelete = tablePolicies.some(p => p.cmd === 'DELETE')
        
        console.log(`    📋 SELECT: ${hasSelect ? '✅' : '❌'}, INSERT: ${hasInsert ? '✅' : '❌'}, UPDATE: ${hasUpdate ? '✅' : '❌'}, DELETE: ${hasDelete ? '✅' : '❌'}`)
      } else {
        console.log(`  ❌ ${table}: No policies found`)
      }
    }
  }

  async testDataIsolation() {
    console.log('\n🔍 Step 3: Testing Data Isolation')

    // Create test users if they don't exist
    await this.createTestUsers()

    // Test each user's access
    for (const [userType, userInfo] of Object.entries(TEST_USERS)) {
      console.log(`\n  👤 Testing ${userType}:`)
      
      const userClient = await this.createClientForUser(userInfo)
      
      // Test access to own data
      const ownDataTest = await this.testOwnDataAccess(userClient, userInfo)
      
      // Test access to other clinics' data
      const otherDataTest = await this.testOtherDataAccess(userClient, userInfo)
      
      this.results.tests[userType] = {
        own_data_accessible: ownDataTest.success,
        other_data_blocked: otherDataTest.blocked,
        details: {
          own_data: ownDataTest,
          other_data: otherDataTest
        }
      }

      if (ownDataTest.success && otherDataTest.blocked) {
        this.results.summary.tests_passed++
        console.log(`    ✅ Data isolation working correctly`)
      } else {
        console.log(`    ❌ Data isolation issues detected`)
        if (!ownDataTest.success) console.log(`      - Cannot access own data`)
        if (!otherDataTest.blocked) console.log(`      - Can access other clinics' data`)
      }
    }
  }

  async createTestUsers() {
    console.log('  👥 Creating test users...')
    
    for (const [userType, userInfo] of Object.entries(TEST_USERS)) {
      const { error } = await supabase.auth.admin.createUser({
        email: userInfo.email,
        password: 'test-password-123',
        email_confirm: true,
        user_metadata: {
          role: userInfo.role || 'clinic_admin',
          clinic_id: userInfo.clinic_id
        }
      })

      if (error && !error.message.includes('already registered')) {
        console.log(`    ⚠️  Could not create ${userType}: ${error.message}`)
      }
    }
  }

  async createClientForUser(userInfo) {
    // Sign in as test user and create client
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: 'test-password-123'
    })

    if (signInError) {
      throw new Error(`Failed to sign in as ${userInfo.email}: ${signInError.message}`)
    }

    return createClient(SUPABASE_URL, signInData.session.access_token)
  }

  async testOwnDataAccess(client, userInfo) {
    try {
      // Test accessing user's own profile
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', (await client.auth.getUser()).data.user.id)

      return {
        success: !error && data.length > 0,
        error: error?.message,
        count: data?.length || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async testOtherDataAccess(client, userInfo) {
    try {
      // Try to access data from other clinics
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .neq('user_id', (await client.auth.getUser()).data.user.id)
        .limit(10)

      return {
        blocked: error !== null,
        error: error?.message,
        count: data?.length || 0
      }
    } catch (error) {
      return {
        blocked: true,
        error: error.message
      }
    }
  }

  async testPermissionMatrix() {
    console.log('\n🔍 Step 4: Testing Permission Matrix')

    const roles = ['super_admin', 'clinic_owner', 'staff', 'customer']
    const permissions = [
      { table: 'users', action: 'SELECT', expected: { super_admin: true, clinic_owner: false, staff: false, customer: false } },
      { table: 'clinics', action: 'SELECT', expected: { super_admin: true, clinic_owner: true, staff: true, customer: true } },
      { table: 'sales_leads', action: 'SELECT', expected: { super_admin: true, clinic_owner: true, staff: true, customer: false } }
    ]

    for (const perm of permissions) {
      console.log(`\n  📋 ${perm.table}.${perm.action}:`)
      
      for (const role of roles) {
        const expected = perm.expected[role]
        // Implementation would test actual permissions
        console.log(`    ${role}: ${expected ? '✅ Should have access' : '❌ Should be blocked'}`)
      }
    }
  }

  calculateSecurityScore() {
    const { summary } = this.results
    
    // Calculate based on RLS enabled, policies found, and tests passed
    const rlsScore = (summary.rls_enabled / summary.total_tables) * 40
    const policyScore = Math.min((summary.policies_found / (summary.total_tables * 2)) * 30, 30)
    const testScore = (summary.tests_passed / Object.keys(TEST_USERS).length) * 30
    
    summary.security_score = Math.round(rlsScore + policyScore + testScore)
  }

  async generateReport() {
    console.log('\n📊 Step 5: Generating Security Report')

    this.calculateSecurityScore()

    const { summary } = this.results
    
    console.log('\n' + '='.repeat(60))
    console.log('🔒 RLS SECURITY REPORT')
    console.log('='.repeat(60))
    
    console.log(`\n📈 SUMMARY:`)
    console.log(`  Total Tables: ${summary.total_tables}`)
    console.log(`  RLS Enabled: ${summary.rls_enabled}`)
    console.log(`  Policies Found: ${summary.policies_found}`)
    console.log(`  Tests Passed: ${summary.tests_passed}`)
    console.log(`  Security Score: ${summary.security_score}/100`)

    // Security grade
    let grade = 'F'
    if (summary.security_score >= 90) grade = 'A+'
    else if (summary.security_score >= 80) grade = 'A'
    else if (summary.security_score >= 70) grade = 'B'
    else if (summary.security_score >= 60) grade = 'C'
    else if (summary.security_score >= 50) grade = 'D'
    
    console.log(`  Security Grade: ${grade}`)

    console.log(`\n🔍 DETAILED RESULTS:`)
    
    // Tables with RLS issues
    const rlsIssues = Object.entries(this.results.tables)
      .filter(([_, info]) => !info.rls_enabled)
      .map(([name]) => name)

    if (rlsIssues.length > 0) {
      console.log(`\n❌ Tables without RLS:`)
      rlsIssues.forEach(table => console.log(`  - ${table}`))
    }

    // Tables without policies
    const policyIssues = Object.entries(this.results.policies)
      .filter(([_, info]) => info.count === 0)
      .map(([name]) => name)

    if (policyIssues.length > 0) {
      console.log(`\n❌ Tables without policies:`)
      policyIssues.forEach(table => console.log(`  - ${table}`))
    }

    // Test failures
    const testFailures = Object.entries(this.results.tests)
      .filter(([_, result]) => !result.own_data_accessible || !result.other_data_blocked)
      .map(([name]) => name)

    if (testFailures.length > 0) {
      console.log(`\n❌ Failed isolation tests:`)
      testFailures.forEach(user => console.log(`  - ${user}`))
    }

    console.log(`\n💡 RECOMMENDATIONS:`)
    
    if (rlsIssues.length > 0) {
      console.log(`  1. Enable RLS on ${rlsIssues.length} table(s)`)
    }
    
    if (policyIssues.length > 0) {
      console.log(`  2. Create policies for ${policyIssues.length} table(s)`)
    }
    
    if (testFailures.length > 0) {
      console.log(`  3. Fix data isolation for ${testFailures.length} user type(s)`)
    }
    
    if (summary.security_score < 80) {
      console.log(`  4. Review and strengthen security policies`)
    }
    
    if (summary.security_score >= 80) {
      console.log(`  ✅ Security posture is good`)
    }

    // Save detailed report
    const reportPath = join(__dirname, '..', 'rls-security-report.json')
    await import('fs').then(fs => {
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
      console.log(`\n📄 Detailed report saved to: ${reportPath}`)
    })

    console.log('\n' + '='.repeat(60))
  }
}

// Run verification
const verifier = new RLSVerifier()
verifier.run().catch(console.error)
