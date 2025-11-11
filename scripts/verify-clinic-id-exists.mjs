#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Verifying clinic_id columns exist and work...\n');

async function verifyTable(tableName, testColumns) {
  console.log(`\n📋 Testing ${tableName} table:`);
  
  try {
    // Get first clinic ID
    const { data: clinics } = await supabase
      .from('clinics')
      .select('id, name')
      .limit(1)
      .single();
    
    if (!clinics) {
      console.log('   ❌ No clinics found to test with');
      return false;
    }
    
    console.log(`   ✓ Using clinic: ${clinics.name} (${clinics.id})`);
    
    // Try to select with clinic_id filter
    const { data, error } = await supabase
      .from(tableName)
      .select(testColumns)
      .eq('clinic_id', clinics.id)
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.message.includes('clinic_id')) {
        console.log('   ⚠️  clinic_id column does NOT exist!');
        return false;
      }
      return false;
    }
    
    console.log(`   ✅ clinic_id column EXISTS and works!`);
    console.log(`   ℹ️  Found ${data?.length || 0} rows for this clinic`);
    return true;
    
  } catch (err) {
    console.log(`   ❌ Unexpected error: ${err.message}`);
    return false;
  }
}

async function main() {
  const results = {
    customers: await verifyTable('customers', 'id, clinic_id, full_name, email'),
    appointments: await verifyTable('appointments', 'id, clinic_id, appointment_number, appointment_date'),
    staff_members: await verifyTable('staff_members', 'id, clinic_id, name, role'),
    treatment_plans: await verifyTable('treatment_plans', 'id, clinic_id, plan_name, status'),
  };
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 FINAL VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  
  const allPass = Object.values(results).every(r => r === true);
  
  Object.entries(results).forEach(([table, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${table.padEnd(20)} - ${passed ? 'HAS clinic_id' : 'MISSING clinic_id'}`);
  });
  
  console.log('='.repeat(60));
  
  if (allPass) {
    console.log('\n🎉 SUCCESS! All tables have clinic_id column!');
    console.log('\n✅ Migration is COMPLETE!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test multi-clinic isolation: node scripts/test-multi-clinic-isolation.mjs');
    console.log('   2. Test invitation acceptance flow in browser');
    console.log('   3. Create test data and verify RLS policies work');
  } else {
    console.log('\n⚠️  Some tables are missing clinic_id');
    console.log('   Need to investigate further');
  }
}

main().catch(console.error);
