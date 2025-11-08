/**
 * ทดสอบระบบ Authentication หลังปรับโครงสร้าง
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { parseUserRole, getRoleTier, hasFeatureAccess } from '../types/supabase'

// Load .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testAuthSystem() {
  console.log('🧪 Testing Authentication System\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // 1. ทดสอบดึงข้อมูล users
  console.log('1️⃣  Testing User Data Retrieval...')
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .limit(5)
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`✅ Found ${users?.length} users\n`)
  
  // 2. ทดสอบแปลง role และคำนวณ tier
  console.log('2️⃣  Testing Role Parsing & Tier Calculation...')
  users?.forEach((user, i) => {
    const role = parseUserRole(user.role)
    const tier = getRoleTier(role)
    
    console.log(`User ${i + 1}:`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Role (DB): ${user.role}`)
    console.log(`  Role (Parsed): ${role}`)
    console.log(`  Tier (Calculated): ${tier}`)
    console.log(`  Active: ${user.is_active}`)
    console.log(`  Clinic ID: ${user.clinic_id || 'none'}`)
    console.log('')
  })
  
  // 3. ทดสอบ Feature Access
  console.log('3️⃣  Testing Feature Access...')
  
  const testCases = [
    { role: 'customer', feature: 'basic_analysis' },
    { role: 'customer', feature: 'advanced_analysis' },
    { role: 'sales_staff', feature: 'advanced_analysis' },
    { role: 'clinic_owner', feature: 'clinic_management' },
  ]
  
  testCases.forEach(({ role, feature }) => {
    const parsedRole = parseUserRole(role)
    const canAccess = hasFeatureAccess(parsedRole, feature)
    const status = canAccess ? '✅' : '❌'
    
    console.log(`${status} ${role} -> ${feature}: ${canAccess ? 'ALLOWED' : 'DENIED'}`)
  })
  
  console.log('\n4️⃣  Testing Database Structure...')
  
  // เช็คว่า columns ที่ต้องใช้มีครบหรือไม่
  const requiredColumns = [
    'id', 'email', 'role', 'clinic_id', 'permissions',
    'is_active', 'created_at', 'updated_at'
  ]
  
  const sampleUser = users?.[0]
  if (sampleUser) {
    const availableColumns = Object.keys(sampleUser)
    const missing = requiredColumns.filter(col => !availableColumns.includes(col))
    
    if (missing.length === 0) {
      console.log('✅ All required columns exist')
    } else {
      console.log('❌ Missing columns:', missing)
    }
    
    console.log('\n📋 Available columns:', availableColumns.join(', '))
  }
  
  console.log('\n✅ Auth System Test Complete!')
}

testAuthSystem().catch(console.error)
