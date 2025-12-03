#!/usr/bin/env node

/**
 * Create Test Users via Supabase Admin API
 * 
 * Uses SUPABASE_SERVICE_ROLE_KEY to create users in auth.users
 * and corresponding profiles for E2E testing
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgejeqqngzvuokdffadu.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '<REDACTED_SUPABASE_SERVICE_ROLE_KEY>'

console.log('🔄 Initializing Supabase Admin Client...\n')

// Create admin client
if (SUPABASE_SERVICE_ROLE_KEY === '<REDACTED_SUPABASE_SERVICE_ROLE_KEY>') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set. Set the environment variable to run this script. Aborting to avoid using a hard-coded key.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  try {
    console.log('📝 Creating test users...\n')

    const testUsers = [
      {
        email: 'clinic-owner@example.com',
        password: 'password123',
        user_metadata: {
          role: 'clinic_owner',
          full_name: 'Test Clinic Owner',
          phone: '0812345678',
        }
      },
      {
        email: 'staff@example.com',
        password: 'password123',
        user_metadata: {
          role: 'clinic_staff',
          full_name: 'Test Staff Member',
          phone: '0823456789',
        }
      },
      {
        email: 'customer@example.com',
        password: 'password123',
        user_metadata: {
          role: 'customer_premium',
          full_name: 'Test Customer',
          phone: '0834567890',
        }
      },
    ]

    for (const userData of testUsers) {
      console.log(`📧 Creating user: ${userData.email}`)

      // Check if user already exists
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.error(`   ❌ Error checking existing users:`, listError.message)
        continue
      }

      const userExists = existingUsers.users.find(u => u.email === userData.email)
      
      if (userExists) {
        console.log(`   ℹ️  User already exists: ${userData.email}`)
        console.log(`   👤 User ID: ${userExists.id}`)
        
        // Update profile if exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userExists.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error(`   ❌ Error checking profile:`, profileError.message)
        } else if (!profile) {
          console.log(`   📝 Creating profile for existing user...`)
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userExists.id,
              email: userData.email,
              role: userData.user_metadata.role,
              full_name: userData.user_metadata.full_name,
              phone: userData.user_metadata.phone,
            })

          if (insertError) {
            console.error(`   ❌ Error creating profile:`, insertError.message)
          } else {
            console.log(`   ✅ Profile created successfully`)
          }
        } else {
          console.log(`   ✅ Profile already exists`)
        }
        
        console.log('')
        continue
      }

      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: userData.user_metadata,
      })

      if (createError) {
        console.error(`   ❌ Error creating user:`, createError.message)
        console.log('')
        continue
      }

      console.log(`   ✅ User created successfully`)
      console.log(`   👤 User ID: ${newUser.user.id}`)

      // Create profile (should be auto-created by trigger, but create manually if needed)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', newUser.user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        console.log(`   📝 Creating profile...`)
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.user.id,
            email: userData.email,
            role: userData.user_metadata.role,
            full_name: userData.user_metadata.full_name,
            phone: userData.user_metadata.phone,
          })

        if (insertError) {
          console.error(`   ❌ Error creating profile:`, insertError.message)
        } else {
          console.log(`   ✅ Profile created`)
        }
      } else if (profile) {
        console.log(`   ✅ Profile auto-created by trigger`)
      } else {
        console.error(`   ❌ Error checking profile:`, profileError?.message)
      }

      console.log('')
    }

    // Verify all users
    console.log('\n📊 Verifying test users...\n')

    const { data: allUsers, error: verifyError } = await supabase.auth.admin.listUsers()

    if (verifyError) {
      console.error('❌ Error listing users:', verifyError.message)
    } else {
      const testEmails = testUsers.map(u => u.email)
      const createdTestUsers = allUsers.users.filter(u => testEmails.includes(u.email))

      console.log(`✅ Test users in database: ${createdTestUsers.length}/${testUsers.length}\n`)

      for (const user of createdTestUsers) {
        console.log(`📧 ${user.email}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Role: ${user.user_metadata?.role || 'N/A'}`)
        console.log(`   Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`)
        
        // Check profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          console.log(`   Profile: ✅ ${profile.full_name} (${profile.role})`)
        } else {
          console.log(`   Profile: ❌ Missing`)
        }
        
        console.log('')
      }
    }

    console.log('\n✅ Test user setup completed!\n')
    console.log('📌 You can now run E2E tests:')
    console.log('   pnpm test:e2e\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the script
createTestUsers()
