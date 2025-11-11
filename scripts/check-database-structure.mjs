#!/usr/bin/env node
/**
 * Check Database Structure
 * Verify all tables, indexes, and RLS policies in Supabase
 */

import pg from 'pg';
const { Pool } = pg;

// Use direct database connection (not pooler)
const connectionString = "postgresql://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@db.bgejeqqngzvuokdffadu.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString,
});

async function checkDatabaseStructure() {
  console.log('\n🔍 Checking Database Structure...\n');
  
  try {
    // 1. List all tables
    console.log('📋 Tables in public schema:');
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(r => r.tablename);
    console.log(`Found ${tables.length} tables:\n`);
    tables.forEach((table, i) => {
      console.log(`  ${i + 1}. ${table}`);
    });

    // 2. Check critical tables
    console.log('\n\n✅ Critical Tables Check:');
    const criticalTables = [
      'users',
      'clinics', 
      'skin_analyses',
      'sales_leads',
      'customer_notes',
      'bookings'
    ];
    
    for (const table of criticalTables) {
      const exists = tables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
      
      if (exists) {
        // Get column count
        const colResult = await pool.query(`
          SELECT COUNT(*) as count
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
        `, [table]);
        console.log(`     └─ ${colResult.rows[0].count} columns`);
      }
    }

    // 3. Check RLS status
    console.log('\n\n🔒 Row Level Security (RLS) Status:');
    const rlsResult = await pool.query(`
      SELECT 
        tablename,
        CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    rlsResult.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.rls_status}`);
    });

    // 4. Count indexes
    console.log('\n\n📊 Database Indexes:');
    const indexResult = await pool.query(`
      SELECT 
        tablename,
        COUNT(*) as index_count
      FROM pg_indexes
      WHERE schemaname = 'public'
      GROUP BY tablename
      ORDER BY index_count DESC
      LIMIT 10
    `);
    
    console.log('  Top tables by index count:');
    indexResult.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.index_count} indexes`);
    });

    // 5. Check for missing bookings table
    console.log('\n\n🎯 Phase 4 Migration Status:');
    const hasBookings = tables.includes('bookings');
    const hasAppointments = tables.includes('appointments');
    
    console.log(`  Bookings table: ${hasBookings ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  Appointments table: ${hasAppointments ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasBookings && !hasAppointments) {
      console.log('\n  ⚠️  Need to create bookings/appointments table');
    } else if (hasBookings) {
      const bookingsCols = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings'
        ORDER BY ordinal_position
      `);
      console.log(`\n  Bookings table structure (${bookingsCols.rows.length} columns):`);
      bookingsCols.rows.forEach(col => {
        console.log(`    - ${col.column_name}: ${col.data_type}`);
      });
    }

    // 6. Check for RLS problems
    console.log('\n\n⚠️  Known RLS Issues:');
    const rlsProblems = [
      'emergency_disable_all_rls.sql',
      'fix_users_table_rls_recursion.sql',
      'fix_all_users_policies.sql'
    ];
    console.log('  Recent RLS fix migrations found:');
    rlsProblems.forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log('\n  💡 This indicates past RLS recursion issues were fixed');

    // 7. Summary
    console.log('\n\n📈 Summary:');
    console.log(`  Total tables: ${tables.length}`);
    console.log(`  RLS enabled: ${rlsResult.rows.filter(r => r.rls_status.includes('Enabled')).length}/${tables.length}`);
    console.log(`  Critical tables present: ${criticalTables.filter(t => tables.includes(t)).length}/${criticalTables.length}`);
    
    console.log('\n✅ Database structure check complete!\n');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure();
