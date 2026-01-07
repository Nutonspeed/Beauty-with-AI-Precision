import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test users data
const testUsers = [
  {
    email: 'superadmin@test.com',
    password: 'Test123456!',
    role: 'super_admin',
    user_profile: {
      first_name: 'Super',
      last_name: 'Admin',
      phone: '+6612345678',
      avatar_url: null
    }
  },
  {
    email: 'clinicowner@test.com',
    password: 'Test123456!',
    role: 'clinic_owner',
    user_profile: {
      first_name: 'Clinic',
      last_name: 'Owner',
      phone: '+6623456789',
      avatar_url: null
    },
    clinic: {
      name: 'Test Beauty Clinic',
      email: 'clinic@test.com',
      phone: '+6621234567',
      address: '123 Test Street, Bangkok',
      description: 'Test clinic for E2E testing'
    }
  },
  {
    email: 'sales@test.com',
    password: 'Test123456!',
    role: 'sales_staff',
    user_profile: {
      first_name: 'Sales',
      last_name: 'Staff',
      phone: '+6634567890',
      avatar_url: null
    }
  },
  {
    email: 'customer@test.com',
    password: 'Test123456!',
    role: 'customer',
    user_profile: {
      first_name: 'Test',
      last_name: 'Customer',
      phone: '+6645678901',
      avatar_url: null
    }
  },
  {
    email: 'clinicadmin@test.com',
    password: 'Test123456!',
    role: 'clinic_admin',
    user_profile: {
      first_name: 'Clinic',
      last_name: 'Admin',
      phone: '+6656789012',
      avatar_url: null
    }
  }
];

async function createTestUser(userData: any) {
  try {
    console.log(`📝 Creating user: ${userData.email}`);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        role: userData.role
      }
    });

    if (authError) {
      // User might already exist, try to get existing user
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === userData.email);
      
      if (existingUser) {
        console.log(`ℹ️  User ${userData.email} already exists`);
        return existingUser;
      }
      
      throw authError;
    }

    const user = authData.user;
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...userData.user_profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn(`⚠️  Profile creation warning for ${userData.email}:`, profileError.message);
    }

    // Create clinic if user is clinic owner
    if (userData.role === 'clinic_owner' && userData.clinic) {
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .upsert({
          ...userData.clinic,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (clinicError) {
        console.warn(`⚠️  Clinic creation warning:`, clinicError.message);
      } else if (clinicData) {
        // Add user as clinic owner
        await supabase
          .from('clinic_staff')
          .upsert({
            clinic_id: clinicData.id,
            user_id: user.id,
            role: 'owner',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        // Update user with clinic_id
        await supabase
          .from('users')
          .update({ clinic_id: clinicData.id })
          .eq('id', user.id);
      }
    }

    // Add sales staff to clinic
    if (userData.role === 'sales_staff') {
      const { data: clinicData } = await supabase
        .from('clinics')
        .select('id')
        .eq('name', 'Test Beauty Clinic')
        .single();

      if (clinicData) {
        await supabase
          .from('clinic_staff')
          .upsert({
            clinic_id: clinicData.id,
            user_id: user.id,
            role: 'sales_staff',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        await supabase
          .from('users')
          .update({ clinic_id: clinicData.id })
          .eq('id', user.id);
      }
    }

    // Add customer to clinic
    if (userData.role === 'customer') {
      const { data: clinicData } = await supabase
        .from('clinics')
        .select('id')
        .eq('name', 'Test Beauty Clinic')
        .single();

      if (clinicData) {
        await supabase
          .from('customers')
          .upsert({
            clinic_id: clinicData.id,
            user_id: user.id,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        await supabase
          .from('users')
          .update({ clinic_id: clinicData.id })
          .eq('id', user.id);
      }
    }

    console.log(`✅ Successfully created user: ${userData.email}`);
    return user;

  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error);
    throw error;
  }
}

async function createSampleData() {
  console.log('📊 Creating sample data...');

  try {
    // Get clinic ID
    const { data: clinicData } = await supabase
      .from('clinics')
      .select('id')
      .eq('name', 'Test Beauty Clinic')
      .single();

    if (!clinicData) {
      console.log('⚠️  No clinic found, skipping sample data creation');
      return;
    }

    const clinicId = clinicData.id;

    // Create sample services
    const services = [
      {
        clinic_id: clinicId,
        name: 'Skin Analysis',
        description: 'AI-powered skin analysis and consultation',
        price: 1500,
        duration: 60,
        category: 'analysis'
      },
      {
        clinic_id: clinicId,
        name: 'Botox Treatment',
        description: 'Anti-wrinkle botox injections',
        price: 8000,
        duration: 30,
        category: 'treatment'
      },
      {
        clinic_id: clinicId,
        name: 'Chemical Peel',
        description: 'Professional chemical peel treatment',
        price: 3500,
        duration: 45,
        category: 'treatment'
      }
    ];

    for (const service of services) {
      await supabase
        .from('clinic_services')
        .upsert({
          ...service,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    // Create sample leads
    const { data: salesStaff } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'sales@test.com')
      .single();

    if (salesStaff) {
      const leads = [
        {
          clinic_id: clinicId,
          sales_staff_id: salesStaff.id,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+6612345678',
          source: 'website',
          status: 'new',
          notes: 'Interested in skin analysis'
        },
        {
          clinic_id: clinicId,
          sales_staff_id: salesStaff.id,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+6623456789',
          source: 'referral',
          status: 'contacted',
          notes: 'Referred by existing customer'
        }
      ];

      for (const lead of leads) {
        await supabase
          .from('sales_leads')
          .upsert({
            ...lead,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    }

    // Create sample appointments
    const { data: customer } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'customer@test.com')
      .single();

    const { data: staff } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'clinicowner@test.com')
      .single();

    if (customer && staff) {
      const appointments = [
        {
          clinic_id: clinicId,
          customer_id: customer.id,
          staff_id: staff.id,
          service_id: (await supabase.from('clinic_services').select('id').eq('name', 'Skin Analysis').single()).data?.id,
          appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
          appointment_time: '10:00',
          status: 'scheduled',
          notes: 'First consultation'
        }
      ];

      for (const appointment of appointments) {
        await supabase
          .from('appointments')
          .upsert({
            ...appointment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    }

    console.log('✅ Sample data created successfully');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

async function main() {
  console.log('🚀 Starting test data seeding for Beauty-with-AI-Precision');
  console.log('=' .repeat(60));

  try {
    // Test database connection
    const { data, error } = await supabase.from('clinics').select('count');
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    console.log('✅ Database connection successful');

    // Create test users
    console.log('\n👥 Creating test users...');
    for (const userData of testUsers) {
      await createTestUser(userData);
    }

    // Create sample data
    await createSampleData();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Test data seeding completed successfully!');
    console.log('\n📋 Test Users Created:');
    testUsers.forEach(user => {
      console.log(`  📧 ${user.email} (${user.role})`);
    });
    console.log('\n🔑 Password for all users: Test123456!');
    console.log('\n🚀 Ready for E2E testing!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as seedTestUsers };
