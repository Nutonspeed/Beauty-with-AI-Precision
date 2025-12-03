#!/usr/bin/env node

/**
 * Database Schema Audit Script (Using Supabase Client)
 * Purpose: Check all tables for clinic_id column and RLS policies
 * Date: 2025-11-11
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bgejeqqngzvuokdffadu.supabase.co";
// Prefer reading the service role key from environment. If not set, use a redacted placeholder.
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '<REDACTED_SUPABASE_SERVICE_KEY>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Starting Database Schema Audit via Supabase...\n');

async function main() {
  try {
    // ============================================================================
    // STEP 1: Query information_schema for all tables
    // ============================================================================
    console.log('📋 STEP 1: Listing all tables in public schema...\n');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name');

    if (tablesError) {
      console.log('⚠️  Cannot query information_schema directly.');
      console.log('Using known tables list instead...\n');
      
      // Fallback: Try to query known tables
      const knownTables = [
        'clinics',
        'branches',
        'users',
        'clinic_staff',
        'skin_analyses',
        'analyses',
        'analysis_comparisons',
        'analysis_milestones',
        'leads',
        'sales_leads',
        'sales_proposals',
        'sales_activities',
        'bookings',
        'treatments',
        'treatment_records',
        'treatment_photos',
        'treatment_progress_notes',
        'treatment_outcomes',
        'products',
        'inventory_items',
        'inventory_categories',
        'inventory_suppliers',
        'inventory_stock_movements',
        'invoices',
        'chat_rooms',
        'chat_messages',
        'chat_participants',
        'marketing_campaigns',
        'promo_codes',
        'customer_segments',
        'loyalty_tiers',
        'queue_entries',
        'notifications',
        'invitations',
        'user_activity_log',
        'error_logs',
        'performance_metrics',
        'presentation_sessions'
      ];
      
      console.log(`📋 Checking ${knownTables.length} known tables...\n`);
      
      const existingTables = [];
      const missingTables = [];
      
      for (const tableName of knownTables) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
              missingTables.push(tableName);
            } else {
              console.log(`⚠️  ${tableName}: ${error.message}`);
            }
          } else {
            existingTables.push({ name: tableName, count });
          }
        } catch (err) {
          missingTables.push(tableName);
        }
      }
      
      console.log(`✅ Found ${existingTables.length} existing tables:\n`);
      existingTables.forEach(t => {
        console.log(`   ✅ ${t.name.padEnd(40)} (${t.count || 0} rows)`);
      });
      
      if (missingTables.length > 0) {
        console.log(`\n⚠️  ${missingTables.length} tables not found:\n`);
        missingTables.forEach(t => {
          console.log(`   ❌ ${t}`);
        });
      }

      // ============================================================================
      // STEP 2: Check critical tables for clinic_id
      // ============================================================================
      console.log('\n\n📊 STEP 2: Checking critical tables structure...\n');
      
      const criticalTables = existingTables.filter(t => 
        ['clinics', 'users', 'skin_analyses', 'leads', 'bookings', 'chat_messages', 'treatments'].includes(t.name)
      );
      
      for (const table of criticalTables) {
        try {
          const { data, error } = await supabase
            .from(table.name)
            .select('*')
            .limit(1);
          
          if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            const hasClinicId = columns.includes('clinic_id');
            const hasBranchId = columns.includes('branch_id');
            const hasUserId = columns.includes('user_id');
            
            console.log(`\n📋 ${table.name} (${columns.length} columns, ${table.count} rows):`);
            console.log(`   ${hasClinicId ? '✅' : '❌'} clinic_id`);
            console.log(`   ${hasBranchId ? '✅' : '❌'} branch_id`);
            console.log(`   ${hasUserId ? '✅' : '❌'} user_id`);
            
            // Show first 10 columns
            console.log(`   Columns: ${columns.slice(0, 10).join(', ')}`);
            if (columns.length > 10) {
              console.log(`   ... and ${columns.length - 10} more`);
            }
          } else if (error) {
            console.log(`\n❌ ${table.name}: ${error.message}`);
          } else {
            console.log(`\n⚠️  ${table.name}: Empty table, cannot determine structure`);
          }
        } catch (err) {
          console.log(`\n❌ ${table.name}: ${err.message}`);
        }
      }

      // ============================================================================
      // STEP 3: Check clinics table
      // ============================================================================
      console.log('\n\n🏥 STEP 3: Checking clinics data...\n');
      
      const { data: clinics, error: clinicsError } = await supabase
        .from('clinics')
        .select('id, clinic_name, clinic_code, subscription_tier, is_active, created_at')
        .order('created_at')
        .limit(10);
      
      if (clinicsError) {
        console.log(`❌ Error: ${clinicsError.message}`);
      } else if (clinics && clinics.length > 0) {
        console.log(`✅ Found ${clinics.length} clinics:\n`);
        clinics.forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.clinic_name || 'Unnamed'}`);
          console.log(`      Code: ${c.clinic_code || 'N/A'}`);
          console.log(`      Tier: ${c.subscription_tier || 'N/A'}`);
          console.log(`      Active: ${c.is_active ? '✅' : '❌'}`);
          console.log('');
        });
      } else {
        console.log('⚠️  No clinics found in database');
      }

      // ============================================================================
      // STEP 4: Check users distribution
      // ============================================================================
      console.log('\n👥 STEP 4: Checking users...\n');
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role, clinic_id')
        .limit(10);
      
      if (usersError) {
        console.log(`❌ Error: ${usersError.message}`);
      } else if (users && users.length > 0) {
        console.log(`Found ${users.length} users (showing first 10):\n`);
        users.forEach((u, i) => {
          const clinicStatus = u.clinic_id ? '✅' : '❌ NO CLINIC';
          console.log(`   ${i + 1}. ${u.full_name || 'Unnamed'} - ${u.role} ${clinicStatus}`);
        });
        
        // Count users without clinic
        const usersWithoutClinic = users.filter(u => !u.clinic_id);
        if (usersWithoutClinic.length > 0) {
          console.log(`\n⚠️  ${usersWithoutClinic.length} users without clinic_id!`);
        }
      } else {
        console.log('⚠️  No users found');
      }

      // ============================================================================
      // STEP 5: Check skin_analyses
      // ============================================================================
      console.log('\n\n🔬 STEP 5: Checking skin_analyses...\n');
      
      const { data: analyses, error: analysesError } = await supabase
        .from('skin_analyses')
        .select('id, clinic_id, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (analysesError) {
        console.log(`❌ Error: ${analysesError.message}`);
      } else if (analyses && analyses.length > 0) {
        console.log(`Found ${analyses.length} analyses (showing recent 10):\n`);
        analyses.forEach((a, i) => {
          const clinicStatus = a.clinic_id ? '✅ Has clinic' : '❌ No clinic';
          console.log(`   ${i + 1}. Analysis ${a.id.slice(0, 8)}... - ${clinicStatus}`);
        });
        
        const analysesWithoutClinic = analyses.filter(a => !a.clinic_id);
        if (analysesWithoutClinic.length > 0) {
          console.log(`\n⚠️  ${analysesWithoutClinic.length} analyses without clinic_id!`);
        }
      } else {
        console.log('ℹ️  No analyses found');
      }

      // ============================================================================
      // Summary
      // ============================================================================
      console.log('\n\n📊 AUDIT SUMMARY:\n');
      console.log('━'.repeat(80));
      console.log(`Total tables checked:      ${knownTables.length}`);
      console.log(`Tables found:              ${existingTables.length} ✅`);
      console.log(`Tables missing:            ${missingTables.length} ${missingTables.length > 0 ? '⚠️' : '✅'}`);
      console.log(`Clinics in database:       ${clinics ? clinics.length : 0}`);
      console.log(`Users checked:             ${users ? users.length : 0}`);
      console.log(`Analyses checked:          ${analyses ? analyses.length : 0}`);
      console.log('━'.repeat(80));

      console.log('\n\n📝 NEXT STEPS:\n');
      console.log('1. ✅ Database connection successful');
      console.log('2. 🔍 Review which tables need clinic_id added');
      console.log('3. 🛡️  Check RLS policies (requires direct DB access)');
      console.log('4. 🧪 Create test clinics and verify isolation');
      console.log('5. 📋 Generate migration script for missing clinic_id columns\n');

    } else {
      console.log('✅ Direct schema access available!\n');
      console.log(`Found ${tables.length} tables.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
