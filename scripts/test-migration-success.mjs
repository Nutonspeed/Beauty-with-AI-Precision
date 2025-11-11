import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testInsert() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Testing Insert with clinic_id');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get first clinic ID
  const { data: clinics } = await supabase
    .from('clinics')
    .select('id, clinic_name')
    .limit(1);

  if (!clinics || clinics.length === 0) {
    console.error('❌ No clinics found');
    return;
  }

  const clinicId = clinics[0].id;
  console.log(`Using clinic: ${clinics[0].clinic_name} (${clinicId})\n`);

  // Test 1: Try to insert customer with clinic_id
  console.log('1️⃣  Testing customers table...');
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      clinic_id: clinicId,
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '0812345678'
    })
    .select()
    .single();

  if (customerError) {
    console.log(`   ❌ Error: ${customerError.message}`);
    if (customerError.message.includes('clinic_id')) {
      console.log('   ✅ clinic_id column EXISTS (error mentions it)');
    } else if (customerError.message.includes('does not exist')) {
      console.log('   ❌ clinic_id column MISSING');
    }
  } else {
    console.log('   ✅ Insert successful! clinic_id column EXISTS');
    console.log(`   Customer ID: ${customer.id}`);
    
    // Clean up
    await supabase.from('customers').delete().eq('id', customer.id);
  }

  // Test 2: Try to insert appointment with clinic_id
  console.log('\n2️⃣  Testing appointments table...');
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      clinic_id: clinicId,
      customer_id: '00000000-0000-0000-0000-000000000000', // dummy ID
      appointment_date: '2025-11-15',
      appointment_time: '10:00:00',
      service_type: 'consultation',
      status: 'scheduled'
    })
    .select()
    .single();

  if (appointmentError) {
    console.log(`   ❌ Error: ${appointmentError.message}`);
    if (appointmentError.message.includes('clinic_id')) {
      console.log('   ✅ clinic_id column EXISTS (error mentions it)');
    } else if (appointmentError.message.includes('does not exist')) {
      console.log('   ❌ clinic_id column MISSING');
    }
  } else {
    console.log('   ✅ Insert successful! clinic_id column EXISTS');
    console.log(`   Appointment ID: ${appointment.id}`);
    
    // Clean up
    await supabase.from('appointments').delete().eq('id', appointment.id);
  }

  // Test 3: Check staff_members table
  console.log('\n3️⃣  Testing staff_members table...');
  const { data: staff, error: staffError } = await supabase
    .from('staff_members')
    .insert({
      clinic_id: clinicId,
      name: 'Test Staff',
      role: 'doctor',
      email: 'staff@example.com'
    })
    .select()
    .single();

  if (staffError) {
    if (staffError.message.includes('does not exist')) {
      console.log('   ❌ staff_members table MISSING');
    } else {
      console.log(`   ⚠️  Error: ${staffError.message}`);
    }
  } else {
    console.log('   ✅ Insert successful! staff_members table EXISTS');
    console.log(`   Staff ID: ${staff.id}`);
    
    // Clean up
    await supabase.from('staff_members').delete().eq('id', staff.id);
  }

  // Test 4: Check treatment_plans table
  console.log('\n4️⃣  Testing treatment_plans table...');
  const { data: plan, error: planError } = await supabase
    .from('treatment_plans')
    .insert({
      clinic_id: clinicId,
      customer_id: '00000000-0000-0000-0000-000000000000', // dummy ID
      plan_name: 'Test Plan'
    })
    .select()
    .single();

  if (planError) {
    if (planError.message.includes('does not exist')) {
      console.log('   ❌ treatment_plans table MISSING');
    } else {
      console.log(`   ⚠️  Error: ${planError.message}`);
    }
  } else {
    console.log('   ✅ Insert successful! treatment_plans table EXISTS');
    console.log(`   Plan ID: ${plan.id}`);
    
    // Clean up
    await supabase.from('treatment_plans').delete().eq('id', plan.id);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('If you see ✅ for all tables, migration was successful!');
  console.log('If you see ❌, the migration did not apply correctly.\n');
}

testInsert();
