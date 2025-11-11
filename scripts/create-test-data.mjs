#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🏗️  Creating Test Data for Multi-Clinic Isolation\n');
console.log('═'.repeat(60));

async function createTestData() {
  try {
    // Get clinics
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name, owner_id')
      .order('created_at')
      .limit(2);
    
    if (clinicsError) throw clinicsError;
    
    if (!clinics || clinics.length < 2) {
      console.log('❌ Need at least 2 clinics for testing');
      return;
    }
    
    const [clinicA, clinicB] = clinics;
    console.log(`\n✅ Found 2 clinics:`);
    console.log(`   Clinic A: ${clinicA.name} (${clinicA.id})`);
    console.log(`   Clinic B: ${clinicB.name} (${clinicB.id})`);
    
    // Create customers for Clinic A
    console.log(`\n📝 Creating customers for Clinic A...`);
    const { data: customersA, error: customersAError } = await supabase
      .from('customers')
      .insert([
        {
          clinic_id: clinicA.id,
          full_name: 'Alice Anderson',
          email: 'alice@clinic-a.test',
          phone: '081-111-1111',
          lead_status: 'active',
          notes: 'Test customer for Clinic A'
        },
        {
          clinic_id: clinicA.id,
          full_name: 'Bob Brown',
          email: 'bob@clinic-a.test',
          phone: '081-111-2222',
          lead_status: 'active',
          notes: 'Test customer for Clinic A'
        }
      ])
      .select();
    
    if (customersAError) {
      console.log(`   ❌ Error creating customers for Clinic A: ${customersAError.message}`);
    } else {
      console.log(`   ✅ Created ${customersA.length} customers for Clinic A`);
    }
    
    // Create customers for Clinic B
    console.log(`\n📝 Creating customers for Clinic B...`);
    const { data: customersB, error: customersBError } = await supabase
      .from('customers')
      .insert([
        {
          clinic_id: clinicB.id,
          full_name: 'Charlie Chen',
          email: 'charlie@clinic-b.test',
          phone: '082-222-1111',
          lead_status: 'active',
          notes: 'Test customer for Clinic B'
        },
        {
          clinic_id: clinicB.id,
          full_name: 'Diana Davis',
          email: 'diana@clinic-b.test',
          phone: '082-222-2222',
          lead_status: 'active',
          notes: 'Test customer for Clinic B'
        }
      ])
      .select();
    
    if (customersBError) {
      console.log(`   ❌ Error creating customers for Clinic B: ${customersBError.message}`);
    } else {
      console.log(`   ✅ Created ${customersB.length} customers for Clinic B`);
    }
    
    // Create staff members for Clinic A
    console.log(`\n📝 Creating staff members for Clinic A...`);
    const { data: staffA, error: staffAError } = await supabase
      .from('staff_members')
      .insert([
        {
          clinic_id: clinicA.id,
          name: 'Dr. Emily Expert',
          role: 'doctor',
          email: 'emily@clinic-a.test',
          phone: '081-333-1111',
          status: 'active'
        },
        {
          clinic_id: clinicA.id,
          name: 'Nurse Nancy',
          role: 'nurse',
          email: 'nancy@clinic-a.test',
          phone: '081-333-2222',
          status: 'active'
        }
      ])
      .select();
    
    if (staffAError) {
      console.log(`   ❌ Error creating staff for Clinic A: ${staffAError.message}`);
    } else {
      console.log(`   ✅ Created ${staffA.length} staff members for Clinic A`);
    }
    
    // Create staff members for Clinic B
    console.log(`\n📝 Creating staff members for Clinic B...`);
    const { data: staffB, error: staffBError } = await supabase
      .from('staff_members')
      .insert([
        {
          clinic_id: clinicB.id,
          name: 'Dr. Frank Fisher',
          role: 'doctor',
          email: 'frank@clinic-b.test',
          phone: '082-444-1111',
          status: 'active'
        },
        {
          clinic_id: clinicB.id,
          name: 'Therapist Tina',
          role: 'therapist',
          email: 'tina@clinic-b.test',
          phone: '082-444-2222',
          status: 'active'
        }
      ])
      .select();
    
    if (staffBError) {
      console.log(`   ❌ Error creating staff for Clinic B: ${staffBError.message}`);
    } else {
      console.log(`   ✅ Created ${staffB.length} staff members for Clinic B`);
    }
    
    // Create treatment plans if we have customers
    if (customersA && customersA.length > 0) {
      console.log(`\n📝 Creating treatment plans for Clinic A...`);
      const { data: plansA, error: plansAError } = await supabase
        .from('treatment_plans')
        .insert([
          {
            clinic_id: clinicA.id,
            customer_id: customersA[0].id,
            plan_name: 'Anti-Aging Treatment',
            description: 'Comprehensive anti-aging plan for Alice',
            target_concerns: ['wrinkles', 'fine_lines'],
            status: 'active',
            duration_weeks: 12,
            estimated_cost: 50000
          }
        ])
        .select();
      
      if (plansAError) {
        console.log(`   ❌ Error creating plans for Clinic A: ${plansAError.message}`);
      } else {
        console.log(`   ✅ Created ${plansA.length} treatment plans for Clinic A`);
      }
    }
    
    if (customersB && customersB.length > 0) {
      console.log(`\n📝 Creating treatment plans for Clinic B...`);
      const { data: plansB, error: plansBError } = await supabase
        .from('treatment_plans')
        .insert([
          {
            clinic_id: clinicB.id,
            customer_id: customersB[0].id,
            plan_name: 'Acne Treatment Plan',
            description: 'Acne treatment plan for Charlie',
            target_concerns: ['acne', 'spots'],
            status: 'active',
            duration_weeks: 8,
            estimated_cost: 30000
          }
        ])
        .select();
      
      if (plansBError) {
        console.log(`   ❌ Error creating plans for Clinic B: ${plansBError.message}`);
      } else {
        console.log(`   ✅ Created ${plansB.length} treatment plans for Clinic B`);
      }
    }
    
    // Create appointments if we have customers and staff
    if (customersA && customersA.length > 0 && staffA && staffA.length > 0) {
      console.log(`\n📝 Creating appointments for Clinic A...`);
      const { data: apptA, error: apptAError } = await supabase
        .from('appointments')
        .insert([
          {
            clinic_id: clinicA.id,
            appointment_number: 'A-001',
            customer_id: customersA[0].id,
            staff_id: staffA[0].user_id || null,
            appointment_date: '2025-11-15',
            start_time: '10:00:00',
            end_time: '11:00:00',
            duration: 60,
            status: 'scheduled'
          }
        ])
        .select();
      
      if (apptAError) {
        console.log(`   ❌ Error creating appointments for Clinic A: ${apptAError.message}`);
      } else {
        console.log(`   ✅ Created ${apptA.length} appointments for Clinic A`);
      }
    }
    
    if (customersB && customersB.length > 0 && staffB && staffB.length > 0) {
      console.log(`\n📝 Creating appointments for Clinic B...`);
      const { data: apptB, error: apptBError } = await supabase
        .from('appointments')
        .insert([
          {
            clinic_id: clinicB.id,
            appointment_number: 'B-001',
            customer_id: customersB[0].id,
            staff_id: staffB[0].user_id || null,
            appointment_date: '2025-11-16',
            start_time: '14:00:00',
            end_time: '15:00:00',
            duration: 60,
            status: 'scheduled'
          }
        ])
        .select();
      
      if (apptBError) {
        console.log(`   ❌ Error creating appointments for Clinic B: ${apptBError.message}`);
      } else {
        console.log(`   ✅ Created ${apptB.length} appointments for Clinic B`);
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Test data creation complete!');
    console.log('\n📊 Summary:');
    console.log('   - 2 customers per clinic');
    console.log('   - 2 staff members per clinic');
    console.log('   - 1 treatment plan per clinic');
    console.log('   - 1 appointment per clinic');
    console.log('\n📝 Next: Run verification script');
    console.log('   node scripts/verify-data-isolation.mjs');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

createTestData();
