#!/usr/bin/env node

/**
 * Database Schema Audit Script
 * Purpose: Check all tables for clinic_id column and RLS policies
 * Date: 2025-11-11
 */

import postgres from 'postgres';

// Use NON_POOLING URL from environment
const DB_URL = process.env.POSTGRES_URL_NON_POOLING || "postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";

const sql = postgres(DB_URL);

console.log('🔍 Starting Database Schema Audit...\n');

async function main() {
  try {
    // ============================================================================
    // STEP 1: List all tables in public schema
    // ============================================================================
    console.log('📋 STEP 1: Listing all tables in public schema...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`\n✅ Found ${tables.length} tables:\n`);
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // ============================================================================
    // STEP 2: Check which tables have clinic_id column
    // ============================================================================
    console.log('\n\n📊 STEP 2: Checking for clinic_id column...\n');
    
    const tablesWithClinicId = [];
    const tablesWithoutClinicId = [];
    
    for (const table of tables) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${table.table_name}
        AND column_name = 'clinic_id'
      `;
      
      if (columns.length > 0) {
        tablesWithClinicId.push({
          table: table.table_name,
          type: columns[0].data_type,
          nullable: columns[0].is_nullable
        });
      } else {
        tablesWithoutClinicId.push(table.table_name);
      }
    }
    
    console.log(`✅ Tables WITH clinic_id (${tablesWithClinicId.length}):\n`);
    tablesWithClinicId.forEach(t => {
      console.log(`   ✅ ${t.table.padEnd(40)} (${t.type}, nullable: ${t.nullable})`);
    });
    
    console.log(`\n\n⚠️  Tables WITHOUT clinic_id (${tablesWithoutClinicId.length}):\n`);
    tablesWithoutClinicId.forEach(t => {
      console.log(`   ❌ ${t}`);
    });

    // ============================================================================
    // STEP 3: Check critical tables structure
    // ============================================================================
    console.log('\n\n📊 STEP 3: Critical tables structure...\n');
    
    const criticalTables = [
      'clinics',
      'users', 
      'skin_analyses',
      'bookings',
      'treatments',
      'products',
      'invoices',
      'chat_messages',
      'leads'
    ];
    
    for (const tableName of criticalTables) {
      try {
        const columns = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
          ORDER BY ordinal_position
        `;
        
        if (columns.length > 0) {
          console.log(`\n📋 ${tableName} (${columns.length} columns):`);
          
          // Check for key columns
          const hasClinicId = columns.some(c => c.column_name === 'clinic_id');
          const hasBranchId = columns.some(c => c.column_name === 'branch_id');
          const hasUserId = columns.some(c => c.column_name === 'user_id');
          
          console.log(`   ${hasClinicId ? '✅' : '❌'} clinic_id`);
          console.log(`   ${hasBranchId ? '✅' : '❌'} branch_id`);
          console.log(`   ${hasUserId ? '✅' : '❌'} user_id`);
          
          // Show all columns
          columns.slice(0, 10).forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            console.log(`   - ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}`);
          });
          
          if (columns.length > 10) {
            console.log(`   ... and ${columns.length - 10} more columns`);
          }
        } else {
          console.log(`\n❌ ${tableName} - TABLE NOT FOUND`);
        }
      } catch (err) {
        console.log(`\n❌ ${tableName} - ERROR: ${err.message}`);
      }
    }

    // ============================================================================
    // STEP 4: Check Row Level Security (RLS) status
    // ============================================================================
    console.log('\n\n🛡️  STEP 4: Checking Row Level Security (RLS)...\n');
    
    const rlsStatus = await sql`
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    const tablesWithRLS = rlsStatus.filter(t => t.rls_enabled);
    const tablesWithoutRLS = rlsStatus.filter(t => !t.rls_enabled);
    
    console.log(`✅ Tables WITH RLS enabled (${tablesWithRLS.length}):\n`);
    tablesWithRLS.forEach(t => {
      console.log(`   ✅ ${t.tablename}`);
    });
    
    console.log(`\n\n⚠️  Tables WITHOUT RLS (${tablesWithoutRLS.length}):\n`);
    tablesWithoutRLS.forEach(t => {
      console.log(`   ❌ ${t.tablename}`);
    });

    // ============================================================================
    // STEP 5: Check existing RLS policies
    // ============================================================================
    console.log('\n\n📜 STEP 5: Checking existing RLS policies...\n');
    
    const policies = await sql`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    
    console.log(`Found ${policies.length} RLS policies:\n`);
    
    let currentTable = '';
    policies.forEach(p => {
      if (p.tablename !== currentTable) {
        console.log(`\n📋 ${p.tablename}:`);
        currentTable = p.tablename;
      }
      console.log(`   - ${p.policyname}`);
      console.log(`     Command: ${p.cmd}, Roles: ${p.roles}`);
    });

    // ============================================================================
    // STEP 6: Check if clinics table exists and has data
    // ============================================================================
    console.log('\n\n🏥 STEP 6: Checking clinics table...\n');
    
    try {
      const clinics = await sql`
        SELECT 
          id,
          clinic_name,
          clinic_code,
          subscription_tier,
          is_active,
          created_at
        FROM clinics
        ORDER BY created_at
        LIMIT 10
      `;
      
      console.log(`✅ Found ${clinics.length} clinics:\n`);
      clinics.forEach(c => {
        console.log(`   - ${c.clinic_name || c.clinic_code || c.id}`);
        console.log(`     Code: ${c.clinic_code || 'N/A'}`);
        console.log(`     Tier: ${c.subscription_tier || 'N/A'}`);
        console.log(`     Active: ${c.is_active ? '✅' : '❌'}`);
        console.log('');
      });
    } catch (err) {
      console.log(`❌ Error querying clinics: ${err.message}`);
    }

    // ============================================================================
    // STEP 7: Check users and their clinic assignments
    // ============================================================================
    console.log('\n\n👥 STEP 7: Checking users and clinic assignments...\n');
    
    try {
      const userStats = await sql`
        SELECT 
          clinic_id,
          role,
          COUNT(*) as user_count
        FROM users
        GROUP BY clinic_id, role
        ORDER BY clinic_id, role
      `;
      
      console.log(`User distribution:\n`);
      userStats.forEach(s => {
        const clinic = s.clinic_id || 'NO CLINIC';
        console.log(`   ${clinic.toString().slice(0, 8)}... - ${s.role}: ${s.user_count} users`);
      });
      
      // Count users without clinic_id
      const usersWithoutClinic = await sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE clinic_id IS NULL
      `;
      
      console.log(`\n⚠️  Users WITHOUT clinic_id: ${usersWithoutClinic[0].count}`);
    } catch (err) {
      console.log(`❌ Error querying users: ${err.message}`);
    }

    // ============================================================================
    // STEP 8: Generate Migration TODO List
    // ============================================================================
    console.log('\n\n📝 STEP 8: Migration TODO List...\n');
    console.log('━'.repeat(80));
    console.log('🎯 REQUIRED ACTIONS:\n');
    
    if (tablesWithoutClinicId.length > 0) {
      console.log('1. ⚠️  ADD clinic_id to these tables:');
      tablesWithoutClinicId.forEach(t => {
        // Skip system/utility tables
        if (!['migrations', 'schema_migrations', '_prisma_migrations'].includes(t)) {
          console.log(`   - ${t}`);
        }
      });
    }
    
    if (tablesWithoutRLS.length > 0) {
      console.log('\n2. 🛡️  ENABLE RLS on these tables:');
      tablesWithoutRLS.forEach(t => {
        // Skip system tables
        if (!['migrations', 'schema_migrations', '_prisma_migrations'].includes(t.tablename)) {
          console.log(`   - ${t.tablename}`);
        }
      });
    }
    
    console.log('\n3. 📋 CREATE RLS policies for:');
    console.log('   - Tenant isolation (clinic_id filtering)');
    console.log('   - Super admin bypass');
    console.log('   - Role-based access control');
    
    console.log('\n4. 🧪 TEST multi-tenant isolation:');
    console.log('   - Create 2 test clinics');
    console.log('   - Verify data separation');
    console.log('   - Test cross-tenant access (should fail)');
    
    console.log('\n' + '━'.repeat(80));

    // ============================================================================
    // Summary
    // ============================================================================
    console.log('\n\n📊 AUDIT SUMMARY:\n');
    console.log('━'.repeat(80));
    console.log(`Total tables:              ${tables.length}`);
    console.log(`Tables with clinic_id:     ${tablesWithClinicId.length} ✅`);
    console.log(`Tables without clinic_id:  ${tablesWithoutClinicId.length} ${tablesWithoutClinicId.length > 0 ? '⚠️' : '✅'}`);
    console.log(`Tables with RLS enabled:   ${tablesWithRLS.length} ${tablesWithRLS.length > 10 ? '✅' : '⚠️'}`);
    console.log(`Tables without RLS:        ${tablesWithoutRLS.length} ${tablesWithoutRLS.length > 5 ? '⚠️' : '✅'}`);
    console.log(`RLS policies:              ${policies.length}`);
    console.log('━'.repeat(80));
    
    if (tablesWithoutClinicId.length > 5 || tablesWithoutRLS.length > 10) {
      console.log('\n⚠️  WARNING: Multi-tenant foundation incomplete!');
      console.log('Action required: Run migration to add clinic_id and RLS policies.\n');
    } else {
      console.log('\n✅ Multi-tenant foundation looks good!');
      console.log('Ready for next phase: Authentication & Invitation system.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('✅ Database connection closed.\n');
  }
}

main();
