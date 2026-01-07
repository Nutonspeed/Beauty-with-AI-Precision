require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testAnalysisFlow() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  const supabase = createClient(url, anonKey)

  // 1. Login as customer
  console.log('Step 1: Logging in as customer...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'customer@example.com',
    password: 'password123'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Login successful')

  // 2. Prepare mock analysis data
  const mockAnalysis = {
    imageUrl: 'https://example.com/skin-test.jpg',
    concerns: ['wrinkles', 'spots'],
    metrics: {
      spots: 7.5,
      wrinkles: 4.2,
      texture: 6.8,
      pores: 5.5
    },
    analysisScores: {
      overall: 0.82,
      spots: 7.5,
      wrinkles: 4.2,
      texture: 6.8,
      pores: 5.5,
      redness: 3.2
    },
    qualityMetrics: {
      lighting: 0.9,
      blur: 0.1,
      faceSize: 0.85,
      overallQuality: 0.92
    },
    aiConcerns: [
      { type: 'spots', severity: 'medium', location: 'cheeks' }
    ],
    recommendations: [
      { text: 'Use SPF 50 daily', priority: 'high' },
      { text: 'Consider retinol treatment', priority: 'medium' }
    ],
    aiSkinType: 'Combination'
  }

  // 3. Test POST /api/analysis/save via Direct Supabase Insert (Simulating what the API does)
  // Since we want to test RLS and data flow
  console.log('\nStep 2: Simulating Save Analysis (Testing RLS)...')
  
  const { data: insertData, error: insertError } = await supabase
    .from('skin_analyses')
    .insert({
      user_id: authData.user.id,
      image_url: mockAnalysis.imageUrl,
      overall_score: 85,
      confidence: 95,
      spots_severity: 3,
      spots_count: 12,
      spots_percentile: 75,
      wrinkles_severity: 2,
      wrinkles_count: 5,
      wrinkles_percentile: 80,
      pores_severity: 4,
      pores_count: 20,
      pores_percentile: 60,
      texture_severity: 3,
      texture_percentile: 70,
      redness_severity: 2,
      redness_count: 3,
      redness_percentile: 85,
      overall_percentile: 78,
      ai_skin_type: mockAnalysis.aiSkinType,
      recommendations: mockAnalysis.recommendations,
      ai_treatment_plan: 'Test treatment plan content',
      quality_lighting: 0.9,
      quality_blur: 0.1,
      quality_face_size: 0.8,
      quality_overall: 0.85
    })
    .select()
    .single()

  if (insertError) {
    console.error('❌ Save analysis failed (RLS or Schema issue):', insertError.message)
  } else {
    console.log('✅ Analysis saved successfully. ID:', insertData.id)
    
    // 4. Test reading it back
    console.log('\nStep 3: Verifying Read Access...')
    const { data: readData, error: readError } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('id', insertData.id)
      .single()

    if (readError) {
      console.error('❌ Failed to read back analysis:', readError.message)
    } else {
      console.log('✅ Successfully read back analysis data')
      console.log(`📊 Verified Score: ${readData.overall_score}`)
    }

    // 5. Test data isolation (Try to read as another user - simulation)
    console.log('\nStep 4: Testing Data Isolation (Simulating unauthorized access)...')
    // We can't easily switch users in the same client for RLS without re-auth, 
    // but we can check if the current user can see other users' data.
    const { data: otherData, error: otherError } = await supabase
      .from('skin_analyses')
      .select('*')
      .neq('user_id', authData.user.id)
      .limit(1)

    if (otherError) {
      console.log('✅ RLS Blocked unauthorized read:', otherError.message)
    } else if (otherData && otherData.length > 0) {
      console.warn('⚠️ SECURITY ALERT: User can see other users analysis data!')
    } else {
      console.log('✅ Data isolation confirmed (No other users data visible)')
    }
  }

  await supabase.auth.signOut()
}

testAnalysisFlow().catch(console.error)
