require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testAIChat() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as customer
  console.log('Step 1: Logging in as customer (customer@example.com)...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'customer@example.com',
    password: 'password123'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  const session = authData.session
  const apiUrl = 'http://localhost:3004/api/chat'

  // 2. Test AI Chat POST
  console.log('\nStep 2: Testing AI Chat API...')
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        message: 'สวัสดีครับ ช่วยแนะนำวิธีดูแลผิวหน้าเบื้องต้นหน่อยครับ',
        skinAnalysisId: null // Optional
      })
    })

    const result = await response.json()
    console.log('✅ AI Chat API Response status:', response.status)
    if (response.ok) {
        console.log('🤖 AI Message:', result.message)
        console.log('📝 Follow-up Suggestions:', result.followUpSuggestions)
    } else {
        console.error('❌ Error details:', result.error)
    }
  } catch (error) {
    console.error('❌ AI Chat API failed:', error.message)
    console.log('💡 Note: Ensure the dev server is running at http://localhost:3004')
  }

  await supabase.auth.signOut()
}

testAIChat().catch(console.error)
