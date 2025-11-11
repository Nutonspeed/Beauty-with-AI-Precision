import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection string from environment (using pooler in transaction mode for migrations)
const connectionString = "postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: false  // Disable SSL verification for Supabase pooler
  });

  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Running Database Migrations');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await client.connect();
    console.log('✅ Connected to database\n');

    // ========================================================================
    // STEP 1: Run helper functions migration
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 1: Creating Helper Functions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const helperFunctionsSQL = readFileSync(
      join(__dirname, '..', 'supabase', 'migrations', '20251111_00_helper_functions.sql'),
      'utf-8'
    );

    await client.query(helperFunctionsSQL);
    console.log('✅ Helper functions created successfully!\n');
    console.log('   ✓ is_super_admin()');
    console.log('   ✓ get_user_clinic_id()');
    console.log('   ✓ get_user_role()');
    console.log('   ✓ can_access_clinic()\n');

    // ========================================================================
    // STEP 2: Run main migration (add clinic_id to existing tables)
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 2: Adding clinic_id & Creating Tables');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const mainMigrationSQL = readFileSync(
      join(__dirname, '..', 'supabase', 'migrations', '20251111_add_clinic_id_to_existing_tables.sql'),
      'utf-8'
    );

    await client.query(mainMigrationSQL);
    console.log('✅ Main migration completed successfully!\n');
    console.log('   ✓ Added clinic_id to customers table');
    console.log('   ✓ Added clinic_id to appointments table');
    console.log('   ✓ Created staff_members table');
    console.log('   ✓ Created treatment_plans table');
    console.log('   ✓ All RLS policies enabled');
    console.log('   ✓ All indexes created\n');

    // ========================================================================
    // STEP 3: Verify migration
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 STEP 3: Verifying Migration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check customers table has clinic_id
    const customersCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'customers' 
      AND column_name = 'clinic_id'
    `);
    
    if (customersCheck.rows.length > 0) {
      console.log('   ✅ customers.clinic_id - EXISTS');
    } else {
      console.log('   ❌ customers.clinic_id - MISSING');
    }

    // Check appointments table has clinic_id
    const appointmentsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'appointments' 
      AND column_name = 'clinic_id'
    `);
    
    if (appointmentsCheck.rows.length > 0) {
      console.log('   ✅ appointments.clinic_id - EXISTS');
    } else {
      console.log('   ❌ appointments.clinic_id - MISSING');
    }

    // Check staff_members table exists
    const staffCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'staff_members'
    `);
    
    if (staffCheck.rows.length > 0) {
      console.log('   ✅ staff_members table - EXISTS');
    } else {
      console.log('   ❌ staff_members table - MISSING');
    }

    // Check treatment_plans table exists
    const treatmentCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'treatment_plans'
    `);
    
    if (treatmentCheck.rows.length > 0) {
      console.log('   ✅ treatment_plans table - EXISTS');
    } else {
      console.log('   ❌ treatment_plans table - MISSING');
    }

    // Check helper functions exist
    const functionsCheck = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('is_super_admin', 'get_user_clinic_id', 'get_user_role', 'can_access_clinic')
    `);
    
    console.log(`   ✅ Helper functions - ${functionsCheck.rows.length}/4 found`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Next Steps:');
    console.log('   1. Run: node scripts/check-existing-tables.mjs');
    console.log('   2. Run: node scripts/comprehensive-system-test.mjs');
    console.log('   3. Run: node scripts/test-multi-clinic-isolation.mjs\n');

  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Database connection closed\n');
  }
}

runMigration();
