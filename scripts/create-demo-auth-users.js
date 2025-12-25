/**
 * Create demo users that match the login page demo credentials
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const demoUsers = [
  {
    email: 'admin@ai367bar.com',
    password: 'password123',
    role: 'super_admin',
    full_name: 'Super Admin',
  },
  {
    email: 'clinic-owner@example.com',
    password: 'password123',
    role: 'clinic_admin',
    full_name: 'Clinic Owner Demo',
  },
  {
    email: 'sales@example.com',
    password: 'password123',
    role: 'sales_staff',
    full_name: 'Sales Staff Demo',
  },
  {
    email: 'customer@example.com',
    password: 'password123',
    role: 'premium_customer',
    full_name: 'Customer Demo',
  }
]

async function createDemoUsers() {
  console.log('🔧 Creating demo auth users...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  // Get the demo clinic ID
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('slug', 'beauty-clinic-demo')
    .single()
  
  if (!clinic) {
    console.error('❌ Demo clinic not found. Please run seed:dev first.')
    return
  }
  
  console.log(`📋 Using clinic: ${clinic.id}\n`)
  
  for (const user of demoUsers) {
    console.log(`👤 Creating: ${user.email} (${user.role})`)
    
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        }
      })
      
      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log('   ⚠️  User already exists in Auth')
          
          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingUser = existingUsers?.users.find(u => u.email === user.email)
          
          if (existingUser) {
            // Update password to ensure it's password123
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: user.password,
              user_metadata: {
                full_name: user.full_name,
                role: user.role
              }
            })
            console.log('   ✅ Updated password and metadata')
            
            // Update or create in users table
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: existingUser.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'id'
              })
            
            if (upsertError) {
              console.log('   ⚠️  Database error:', upsertError.message)
            } else {
              console.log('   ✅ Updated in users table')
            }
          }
        } else {
          throw authError
        }
      } else {
        console.log(`   ✅ Created in Auth: ${authData.user.id}`)
        
        // 2. Create in users table
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        
        if (dbError) {
          console.log(`   ⚠️  Database error:`, dbError.message)
        } else {
          console.log(`   ✅ Created in users table`)
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error:`, error)
    }
  }
  
  console.log('\n✅ Demo users ready!')
  console.log('\n🎯 You can now login with:')
  console.log('   Email: Any of the demo emails')
  console.log('   Password: password123')
}

createDemoUsers().catch(console.error)
