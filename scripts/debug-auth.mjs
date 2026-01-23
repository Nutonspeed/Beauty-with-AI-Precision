
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  { email: 'admin@ai367bar.com', password: 'Admin123!', role: 'super_admin' },
  { email: 'clinic-owner@example.com', password: 'password123', role: 'clinic_owner' },
  { email: 'sales@example.com', password: 'password123', role: 'sales_staff' },
  { email: 'customer@example.com', password: 'password123', role: 'customer' },
  { email: 'clinic-owner@example.com', password: 'Admin123!', role: 'clinic_owner' },
  { email: 'sales@example.com', password: 'Admin123!', role: 'sales_staff' },
  { email: 'customer@example.com', password: 'Admin123!', role: 'customer' },
];

async function testAuth() {
  console.log('--- Testing Auth Logins ---');
  for (const user of testUsers) {
    console.log(`Testing ${user.email} with password: ${user.password}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) {
      console.log(`❌ Failed: ${error.message}`);
    } else {
      console.log(`✅ Success! User ID: ${data.user.id}`);
      
      // Check user role from public.users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.log(`⚠️ Profile error: ${profileError.message}`);
      } else {
        console.log(`   Role in DB: ${profile.role}`);
      }
      
      await supabase.auth.signOut();
    }
    console.log('---------------------------');
  }
}

testAuth();
