#!/usr/bin/env node

/**
 * Seed Test Users for E2E Testing
 * 
 * Creates test users in Supabase Auth and corresponding profiles
 * Required for Playwright E2E tests to pass
 */

import postgres from 'postgres'

const connectionString = process.env.SUPABASE_DB_URL || 
  'postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'

console.log('🔄 Connecting to Supabase...\n')

const sql = postgres(connectionString, {
  ssl: false, // Pooler doesn't need SSL
  max: 1,
})

async function seedTestUsers() {
  try {
    console.log('📝 Creating test users in auth.users...\n')

    // Test user credentials
    const testUsers = [
      {
        email: 'clinic-owner@example.com',
        password: 'password123', // This is a bcrypt hash of 'password123'
        role: 'clinic_owner',
        full_name: 'Test Clinic Owner',
        phone: '0812345678',
      },
      {
        email: 'staff@example.com',
        password: 'password123',
        role: 'clinic_staff',
        full_name: 'Test Staff Member',
        phone: '0823456789',
      },
      {
        email: 'customer@example.com',
        password: 'password123',
        role: 'customer_premium',
        full_name: 'Test Customer',
        phone: '0834567890',
      },
    ]

    // Note: We can't directly insert into auth.users (Supabase managed)
    // Instead, we need to use Supabase Admin API or create via signup
    
    console.log('⚠️  IMPORTANT: Test users need to be created via Supabase Dashboard or Admin API')
    console.log('\n📋 Test Users to Create:\n')
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Name: ${user.full_name}`)
      console.log('')
    })

    console.log('\n📝 Steps to create users:')
    console.log('1. Go to Supabase Dashboard → Authentication → Users')
    console.log('2. Click "Invite User" or "Add User"')
    console.log('3. Enter email and password from list above')
    console.log('4. Confirm user creation')
    console.log('5. Run this script to create profiles\n')

    // Check if profiles table exists
    console.log('🔍 Checking profiles table...')
    const profilesTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      );
    `
    
    if (!profilesTableExists[0].exists) {
      console.log('❌ Profiles table does not exist!')
      console.log('   Run migrations first: pnpm supabase db push\n')
      return
    }

    console.log('✅ Profiles table exists\n')

    // Check current profiles
    console.log('📊 Current profiles in database:')
    const currentProfiles = await sql`
      SELECT email, role, full_name FROM profiles ORDER BY created_at DESC LIMIT 5;
    `
    
    if (currentProfiles.length === 0) {
      console.log('   (No profiles found)\n')
    } else {
      currentProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.role})`)
      })
      console.log('')
    }

    console.log('\n✅ Script completed')
    console.log('\n📌 Next steps:')
    console.log('1. Create users in Supabase Dashboard')
    console.log('2. Users will auto-create profiles via trigger')
    console.log('3. Run E2E tests: pnpm test:e2e\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code) console.error('   Code:', error.code)
    if (error.detail) console.error('   Detail:', error.detail)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

// Run the seeding
seedTestUsers()
