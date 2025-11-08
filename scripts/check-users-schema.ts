/**
 * เช็ค schema ของ users table รวมถึง constraints
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkUsersSchema() {
  console.log('🔍 Checking users table schema...\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Get table schema using RPC
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT 
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'users'
      ORDER BY ordinal_position;
    `
  })
  
  if (error) {
    console.log('Cannot use RPC, trying direct query...\n')
    
    // Try getting sample data instead
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (userError) {
      console.error('Error:', userError)
      return
    }
    
    if (users && users.length > 0) {
      console.log('📋 Sample user data:')
      console.log(JSON.stringify(users[0], null, 2))
      console.log('\n📊 Columns:', Object.keys(users[0]).join(', '))
    }
  } else {
    console.log('📊 Users table schema:')
    console.table(data)
  }
  
  // Check for ENUM types
  console.log('\n🔍 Checking for ENUM constraints on role column...')
  
  const { data: roleData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .limit(5)
  
  if (!roleError && roleData) {
    console.log('\n✅ Sample role values from existing users:')
    const roles = roleData.map(r => r.role).filter(Boolean)
    console.log(roles)
    console.log('\n💡 These are valid role values you can use')
  }
}

checkUsersSchema().catch(console.error)
