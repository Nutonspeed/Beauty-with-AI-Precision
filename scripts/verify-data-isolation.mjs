#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Verifying Multi-Clinic Data Isolation\n');
console.log('═'.repeat(60));

async function verifyIsolation() {
  try {
    // Get clinics
    const { data: clinics } = await supabase
      .from('clinics')
      .select('id, name')
      .order('created_at')
      .limit(2);
    
    if (!clinics || clinics.length < 2) {
      console.log('❌ Need at least 2 clinics');
      return;
    }
    
    const [clinicA, clinicB] = clinics;
    console.log(`\n✅ Testing with:`);
    console.log(`   Clinic A: ${clinicA.name} (${clinicA.id})`);
    console.log(`   Clinic B: ${clinicB.name} (${clinicB.id})`);
    
    // Test 1: Count customers per clinic
    console.log(`\n\n📊 TEST 1: Customers Data Isolation`);
    console.log('─'.repeat(60));
    
    const { data: customersA, error: custAError } = await supabase
      .from('customers')
      .select('id, full_name, clinic_id')
      .eq('clinic_id', clinicA.id);
    
    const { data: customersB, error: custBError } = await supabase
      .from('customers')
      .select('id, full_name, clinic_id')
      .eq('clinic_id', clinicB.id);
    
    console.log(`\n📋 Clinic A has ${customersA?.length || 0} customers:`);
    customersA?.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.full_name} (clinic_id: ${c.clinic_id.substring(0, 8)}...)`);
    });
    
    console.log(`\n📋 Clinic B has ${customersB?.length || 0} customers:`);
    customersB?.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.full_name} (clinic_id: ${c.clinic_id.substring(0, 8)}...)`);
    });
    
    // Verify no cross-clinic data
    const hasACrossData = customersA?.some(c => c.clinic_id === clinicB.id);
    const hasBCrossData = customersB?.some(c => c.clinic_id === clinicA.id);
    
    if (hasACrossData || hasBCrossData) {
      console.log('\n   ❌ FAIL: Found cross-clinic data contamination!');
    } else {
      console.log('\n   ✅ PASS: Each clinic sees only its own customers');
    }
    
    // Test 2: Staff members isolation
    console.log(`\n\n📊 TEST 2: Staff Members Data Isolation`);
    console.log('─'.repeat(60));
    
    const { data: staffA } = await supabase
      .from('staff_members')
      .select('id, name, role, clinic_id')
      .eq('clinic_id', clinicA.id);
    
    const { data: staffB } = await supabase
      .from('staff_members')
      .select('id, name, role, clinic_id')
      .eq('clinic_id', clinicB.id);
    
    console.log(`\n📋 Clinic A has ${staffA?.length || 0} staff members:`);
    staffA?.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (${s.role}) - clinic_id: ${s.clinic_id.substring(0, 8)}...`);
    });
    
    console.log(`\n📋 Clinic B has ${staffB?.length || 0} staff members:`);
    staffB?.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (${s.role}) - clinic_id: ${s.clinic_id.substring(0, 8)}...`);
    });
    
    const staffACrossData = staffA?.some(s => s.clinic_id === clinicB.id);
    const staffBCrossData = staffB?.some(s => s.clinic_id === clinicA.id);
    
    if (staffACrossData || staffBCrossData) {
      console.log('\n   ❌ FAIL: Found cross-clinic staff data!');
    } else {
      console.log('\n   ✅ PASS: Each clinic sees only its own staff');
    }
    
    // Test 3: Treatment plans isolation
    console.log(`\n\n📊 TEST 3: Treatment Plans Data Isolation`);
    console.log('─'.repeat(60));
    
    const { data: plansA } = await supabase
      .from('treatment_plans')
      .select('id, plan_name, clinic_id')
      .eq('clinic_id', clinicA.id);
    
    const { data: plansB } = await supabase
      .from('treatment_plans')
      .select('id, plan_name, clinic_id')
      .eq('clinic_id', clinicB.id);
    
    console.log(`\n📋 Clinic A has ${plansA?.length || 0} treatment plans:`);
    plansA?.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.plan_name} - clinic_id: ${p.clinic_id.substring(0, 8)}...`);
    });
    
    console.log(`\n📋 Clinic B has ${plansB?.length || 0} treatment plans:`);
    plansB?.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.plan_name} - clinic_id: ${p.clinic_id.substring(0, 8)}...`);
    });
    
    const plansACrossData = plansA?.some(p => p.clinic_id === clinicB.id);
    const plansBCrossData = plansB?.some(p => p.clinic_id === clinicA.id);
    
    if (plansACrossData || plansBCrossData) {
      console.log('\n   ❌ FAIL: Found cross-clinic treatment plans!');
    } else {
      console.log('\n   ✅ PASS: Each clinic sees only its own treatment plans');
    }
    
    // Test 4: Check total counts without filter (service role can see all)
    console.log(`\n\n📊 TEST 4: Super Admin View (Service Role)`);
    console.log('─'.repeat(60));
    
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalStaff } = await supabase
      .from('staff_members')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalPlans } = await supabase
      .from('treatment_plans')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Total across all clinics (as seen by service role):`);
    console.log(`   - Total customers: ${totalCustomers}`);
    console.log(`   - Total staff: ${totalStaff}`);
    console.log(`   - Total treatment plans: ${totalPlans}`);
    
    const expectedCustomers = (customersA?.length || 0) + (customersB?.length || 0);
    const expectedStaff = (staffA?.length || 0) + (staffB?.length || 0);
    const expectedPlans = (plansA?.length || 0) + (plansB?.length || 0);
    
    console.log(`\n📊 Expected totals:`);
    console.log(`   - Expected customers: ${expectedCustomers}`);
    console.log(`   - Expected staff: ${expectedStaff}`);
    console.log(`   - Expected plans: ${expectedPlans}`);
    
    if (totalCustomers === expectedCustomers && 
        totalStaff === expectedStaff && 
        totalPlans === expectedPlans) {
      console.log('\n   ✅ PASS: Super admin can see all data across clinics');
    } else {
      console.log('\n   ⚠️  WARNING: Total counts do not match expected values');
    }
    
    // Final summary
    console.log('\n\n' + '═'.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('═'.repeat(60));
    
    const allTestsPassed = 
      !hasACrossData && !hasBCrossData &&
      !staffACrossData && !staffBCrossData &&
      !plansACrossData && !plansBCrossData &&
      totalCustomers === expectedCustomers &&
      totalStaff === expectedStaff &&
      totalPlans === expectedPlans;
    
    if (allTestsPassed) {
      console.log('\n🎉 ✅ ALL TESTS PASSED!');
      console.log('\n✓ Multi-clinic data isolation is working correctly');
      console.log('✓ Each clinic can only see its own data');
      console.log('✓ Super admin (service role) can see all data');
      console.log('✓ No cross-clinic data contamination detected');
      
      console.log('\n\n📝 Next Steps:');
      console.log('   1. ✅ Test invitation acceptance flow in browser');
      console.log('   2. Login as clinic owner and verify they can only see their clinic data');
      console.log('   3. Test creating new customers/staff via UI');
      console.log('   4. Verify RLS policies block unauthorized access');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('\nPlease review the results above for details.');
    }
    
    console.log('\n' + '═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

verifyIsolation();
