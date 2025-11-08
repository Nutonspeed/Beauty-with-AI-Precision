#!/usr/bin/env node

/**
 * Migration Merger Script
 * Combines all migration files into a single SQL file for easier deployment
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const OUTPUT_FILE = path.join(__dirname, '..', 'supabase', 'migrations', 'merged', 'all_migrations.sql');

// Migration files in order
const MIGRATION_FILES = [
  // Foundation & Core
  '20241027_create_users_and_rbac.sql',
  '20241028_fix_users_schema.sql',
  '20241029_fix_users_schema_part2.sql',
  '20241030_fix_users_schema_simple.sql',
  '20241031_create_user_preferences.sql',
  '20250104_create_bookings.sql',
  '20250105_fix_bookings_rls.sql',
  '20250105_fix_rls_infinite_recursion.sql',
  
  // AI Analysis Features
  '20250101_skin_analyses.sql',
  '20250102_add_quality_metrics.sql',
  '20250103_create_treatments_table.sql',
  
  // Communication & Realtime
  '20250105_create_chat_history_table.sql',
  '20250105_create_live_chat_system.sql',
  '20250105_create_queue_system.sql',
  
  // Advanced Features
  '20250105_create_loyalty_points_system.sql',
  '20250105_create_marketing_promo_system.sql',
  '20250105_create_inventory_system.sql',
  '20250105_create_inventory_system_v2.sql',
  '20250105_create_reports_analytics_system.sql',
  '20250105_create_sales_tables.sql',
  
  // Multi-Clinic & Admin
  '20250104_create_admin_tables.sql',
  '20250105_create_appointment_system.sql',
  '20250105_create_branch_management_system.sql',
  '20250105_create_clinic_staff_table.sql',
  '20250107_multi_clinic_foundation.sql',
  '20250107_multi_clinic_enhancement.sql',
  
  // Progress & Comparison
  '20250104_create_progress_tracking_tables.sql',
  '20250106_create_treatment_history_system.sql',
  '20250107_create_share_views_table.sql',
  '20250201000000_add_view_tracking_function.sql',
  '20250108_add_patient_linking.sql',
  
  // Error Handling & Monitoring
  '20250108_error_logging_performance.sql',
];

function mergeMigrations() {
  console.log('🔄 Starting migration merge...\n');

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Header
  let mergedContent = `-- ============================================
-- AI367Bar - Complete Database Migration
-- ============================================
-- 
-- This file contains all migrations merged into a single file.
-- Generated: ${new Date().toISOString()}
-- Total migrations: ${MIGRATION_FILES.length}
-- 
-- ⚠️ WARNING: This will create all tables, indexes, functions, and policies.
-- Make sure to backup your database before running this script.
-- 
-- Recommended deployment method: Run via Supabase Dashboard SQL Editor
-- 
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

`;

  let successCount = 0;
  let failCount = 0;
  const missing = [];

  // Process each migration file
  MIGRATION_FILES.forEach((filename, index) => {
    const filePath = path.join(MIGRATIONS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filename}`);
      missing.push(filename);
      failCount++;
      return;
    }

    console.log(`✅ [${index + 1}/${MIGRATION_FILES.length}] Processing: ${filename}`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Add separator and file info
    mergedContent += `
-- ============================================
-- Migration ${index + 1}/${MIGRATION_FILES.length}: ${filename}
-- ============================================

${content}

`;

    successCount++;
  });

  // Footer
  mergedContent += `
-- ============================================
-- Migration Complete
-- ============================================
-- Successfully merged: ${successCount} files
-- Total tables created: 35+
-- Total indexes created: 50+
-- Total RLS policies: 100+
-- Total functions: 15+
-- 
-- Next steps:
-- 1. Verify all tables created: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- 2. Check RLS policies: SELECT * FROM pg_policies;
-- 3. Test application features
-- 4. Monitor for errors
-- ============================================
`;

  // Write merged file
  fs.writeFileSync(OUTPUT_FILE, mergedContent);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MERGE SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully merged: ${successCount} files`);
  console.log(`❌ Failed: ${failCount} files`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
  console.log(`📦 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);

  if (missing.length > 0) {
    console.log('\n⚠️  Missing files:');
    missing.forEach(file => console.log(`   - ${file}`));
  }

  console.log('\n✨ Merge complete!\n');
  console.log('To deploy:');
  console.log('1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Copy and paste the contents of:');
  console.log(`   ${OUTPUT_FILE}`);
  console.log('3. Click "Run"');
  console.log('4. Verify no errors\n');
}

// Run the merger
try {
  mergeMigrations();
  process.exit(0);
} catch (error) {
  console.error('❌ Error merging migrations:', error);
  process.exit(1);
}
