const { config } = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedTestUsers() {
  try {
    console.log('Seeding test users...')

    // Create demo user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@clinic.com',
      password: 'demo123',
      email_confirm: true,
      user_metadata: {
        role: 'clinic_owner'
      }
    })

    if (authError) {
      console.error('Error creating demo user:', authError)
    } else {
      console.log('Demo user created:', authData.user.email)

      // Insert into public.users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'demo@clinic.com',
          role: 'clinic_owner',
          clinic_id: 'demo-clinic'
        })

      if (userError) {
        console.error('Error inserting demo user into users table:', userError)
      } else {
        console.log('Demo user inserted into users table')
      }
    }

    // Create sales demo user
    const { data: salesAuthData, error: salesAuthError } = await supabase.auth.admin.createUser({
      email: 'demo@sales.com',
      password: 'demo123',
      email_confirm: true,
      user_metadata: {
        role: 'sales_staff'
      }
    })

    if (salesAuthError) {
      console.error('Error creating sales demo user:', salesAuthError)
    } else {
      console.log('Sales demo user created:', salesAuthData.user.email)

      // Insert into public.users
      const { error: salesUserError } = await supabase
        .from('users')
        .insert({
          id: salesAuthData.user.id,
          email: 'demo@sales.com',
          role: 'sales_staff'
        })

      if (salesUserError) {
        console.error('Error inserting sales demo user into users table:', salesUserError)
      } else {
        console.log('Sales demo user inserted into users table')
      }
    }

    // Create admin user
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'admin@ai367bar.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        role: 'super_admin'
      }
    })

    if (adminAuthError) {
      console.error('Error creating admin user:', adminAuthError)
    } else {
      console.log('Admin user created:', adminAuthData.user.email)

      // Insert into public.users
      const { error: adminUserError } = await supabase
        .from('users')
        .insert({
          id: adminAuthData.user.id,
          email: 'admin@ai367bar.com',
          role: 'super_admin'
        })

      if (adminUserError) {
        console.error('Error inserting admin user into users table:', adminUserError)
      } else {
        console.log('Admin user inserted into users table')
      }
    }

    console.log('Test users seeded successfully!')
  } catch (error) {
    console.error('Error seeding test users:', error)
    process.exit(1)
  }
}

seedTestUsers()
