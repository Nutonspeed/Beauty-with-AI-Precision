/**
 * สร้าง Test Users สำหรับทดสอบระบบ Login
 * 
 * จะสร้าง users ใน Supabase Auth + users table
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bgejeqqngzvuokdffadu.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '<REDACTED_SUPABASE_SERVICE_KEY>'

const testUsers = [
  {
    email: 'owner@beautyclinic.com',
    password: 'Test1234!',
    role: 'clinic_owner',
    full_name: 'Clinic Owner',
  },
  {
    email: 'sales1@beautyclinic.com',
    password: 'Test1234!',
    role: 'sales_staff',
    full_name: 'Sales Staff',
  },
  {
    email: 'test-customer@beautyclinic.com',
    password: 'Test1234!',
    role: 'customer',
    full_name: 'Test Customer',
  },
]

async function createTestUsers() {
  console.log('🧪 Creating Test Users for Login Testing\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const clinic_id = '8671588e-15f3-4d4b-a75e-77da50644f01' // existing clinic
  
  for (const user of testUsers) {
    console.log(`\n📝 Creating: ${user.email}`)
    
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.full_name,
        }
      })
      
      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`   ⚠️  User already exists in Auth`)
          
          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingUser = existingUsers?.users.find(u => u.email === user.email)
          
          if (existingUser) {
            // Update password
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: user.password,
            })
            console.log(`   ✅ Updated password`)
            
            // Check if user exists in users table
            const { data: dbUser } = await supabase
              .from('users')
              .select('id')
              .eq('id', existingUser.id)
              .single()
            
            if (!dbUser) {
              // Create in users table
              await supabase.from('users').insert({
                id: existingUser.id,
                clinic_id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              console.log(`   ✅ Created in users table`)
            } else {
              console.log(`   ℹ️  Already exists in users table`)
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
          clinic_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        
        if (dbError) {
          console.log(`   ⚠️  Database error:`, dbError.message)
        } else {
          console.log(`   ✅ Created in users table`)
        }
      }
      
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔑 Password: ${user.password}`)
      console.log(`   👤 Role: ${user.role}`)
      
    } catch (error) {
      console.error(`   ❌ Error:`, error)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Test Users Created!')
  console.log('='.repeat(60))
  console.log('\n🎯 ใช้ credentials เหล่านี้เพื่อทดสอบ Login:\n')
  
  for (const user of testUsers) {
    console.log(`📧 ${user.email}`)
    console.log(`🔑 ${user.password}`)
    console.log(`👤 ${user.role}\n`)
  }
}

createTestUsers().catch(console.error)
