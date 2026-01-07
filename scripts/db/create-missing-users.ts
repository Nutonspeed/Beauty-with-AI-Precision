import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Users to create
const usersToCreate = [
  {
    email: 'superadmin@test.com',
    password: 'Test123456!',
    user_metadata: { role: 'super_admin' },
    email_confirm: true
  },
  {
    email: 'clinicowner@test.com',
    password: 'Test123456!',
    user_metadata: { role: 'clinic_owner' },
    email_confirm: true
  },
  {
    email: 'sales@test.com',
    password: 'Test123456!',
    user_metadata: { role: 'sales_staff' },
    email_confirm: true
  },
  {
    email: 'clinicadmin@test.com',
    password: 'Test123456!',
    user_metadata: { role: 'clinic_admin' },
    email_confirm: true
  }
];

async function createMissingUsers() {
  console.log('🔧 Creating missing test users...');
  
  for (const userData of usersToCreate) {
    try {
      console.log(`📝 Creating user: ${userData.email}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: userData.email_confirm,
        user_metadata: userData.user_metadata
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`ℹ️  User ${userData.email} already exists`);
        } else {
          console.error(`❌ Error creating ${userData.email}:`, error.message);
        }
      } else {
        console.log(`✅ Successfully created: ${userData.email}`);
        console.log(`   User ID: ${data.user?.id}`);
      }
    } catch (err) {
      console.error(`❌ Failed to create ${userData.email}:`, err);
    }
  }
  
  console.log('\n🎉 User creation process completed!');
}

async function verifyUsers() {
  console.log('\n🔍 Verifying all test users...');
  
  const testEmails = [
    'superadmin@test.com',
    'clinicowner@test.com', 
    'sales@test.com',
    'customer@test.com',
    'clinicadmin@test.com'
  ];
  
  for (const email of testEmails) {
    const { data, error } = await supabase.auth.admin.listUsers();
    const user = data.users.find(u => u.email === email);
    
    if (user) {
      console.log(`✅ ${email} - ID: ${user.id} - Role: ${user.user_metadata?.role || 'N/A'}`);
    } else {
      console.log(`❌ ${email} - NOT FOUND`);
    }
  }
}

async function main() {
  console.log('🚀 Starting user creation process');
  console.log('=' .repeat(50));
  
  try {
    await createMissingUsers();
    await verifyUsers();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 Next Steps:');
    console.log('1. Test login at: http://localhost:3004/th/login');
    console.log('2. Run E2E tests: pnpm test:e2e:auth');
    console.log('3. Check dashboard access for each role');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as createMissingUsers };
