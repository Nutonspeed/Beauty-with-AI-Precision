import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function queryTableSchema() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Querying Actual Table Schemas from Database');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Query information_schema for customers
  console.log('📋 CUSTOMERS table columns:');
  const { data: customersColumns, error: customersError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customers'
        ORDER BY ordinal_position;
      `
    });

  if (customersError) {
    // Try direct query instead
    console.log('   Trying direct query...\n');
    
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'customers'
      ORDER BY ordinal_position
    `;
    
    console.log('   SQL:', query);
    console.log('   ❌ Cannot query schema via Supabase client');
    console.log('   💡 Please run this in Supabase Dashboard SQL Editor:\n');
    console.log('   ' + query + '\n');
  } else {
    customersColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
  }

  // Query for appointments
  console.log('\n📋 APPOINTMENTS table columns:');
  const { data: appointmentsColumns, error: appointmentsError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'appointments'
        ORDER BY ordinal_position;
      `
    });

  if (appointmentsError) {
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'appointments'
      ORDER BY ordinal_position
    `;
    
    console.log('   ❌ Cannot query schema via Supabase client');
    console.log('   💡 Please run this in Supabase Dashboard SQL Editor:\n');
    console.log('   ' + query + '\n');
  } else {
    appointmentsColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Alternative: Check in Supabase Dashboard');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/editor');
  console.log('2. Click on "customers" table');
  console.log('3. Check if "clinic_id" column exists');
  console.log('4. Do the same for "appointments" table\n');
}

queryTableSchema();
