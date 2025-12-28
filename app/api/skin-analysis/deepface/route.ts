import { NextRequest, NextResponse } from 'next/server'
import { getDeepFaceClient, type FaceAnalysisResult } from '@/lib/ai/deepface-client'
import { createClient } from '@/lib/supabase/server'
import { withPublicAccess } from '@/lib/auth/middleware'

export const POST = withPublicAccess(async (request: NextRequest) => {
  try {
    const deepFaceClient = getDeepFaceClient()
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
      }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Check DeepFace service health
    const isHealthy = await deepFaceClient.healthCheck()
    if (!isHealthy) {
      return NextResponse.json({ 
        error: 'DeepFace service is unavailable. Please try again later.' 
      }, { status: 503 })
    }

    // Analyze face with DeepFace
    const analysisResult = await deepFaceClient.analyzeFace(imageFile)

    // Save analysis result to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('skin_analyses')
      .insert({
        user_id: session.user.id,
        clinic_id: session.user.user_metadata?.clinic_id || 'default-clinic',
        analysis_type: 'deepface',
        raw_results: analysisResult,
        confidence_score: analysisResult.confidence,
        face_detected: analysisResult.face_detected,
        age_detected: analysisResult.age,
        gender_detected: analysisResult.gender,
        emotion_detected: analysisResult.emotion,
        skin_texture_score: analysisResult.skin_analysis?.texture_score,
        skin_smoothness: analysisResult.skin_analysis?.smoothness,
        skin_brightness: analysisResult.skin_analysis?.brightness,
        beauty_score: analysisResult.beauty_metrics?.overall_score,
        processing_time_ms: Math.round(analysisResult.processing_time * 1000),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save analysis:', saveError)
      // Continue even if save fails
    }

    // Generate treatment recommendations based on analysis
    const recommendations = generateTreatmentRecommendations(analysisResult)

    // Return comprehensive analysis
    return NextResponse.json({
      success: true,
      analysis: {
        id: savedAnalysis?.id,
        face_detected: analysisResult.face_detected,
        confidence: analysisResult.confidence,
        demographics: {
          age: analysisResult.age,
          gender: analysisResult.gender,
          race: analysisResult.race,
          emotion: analysisResult.emotion
        },
        skin_analysis: {
          texture_score: analysisResult.skin_analysis?.texture_score,
          skin_tone: analysisResult.skin_analysis?.skin_tone,
          smoothness: analysisResult.skin_analysis?.smoothness,
          brightness: analysisResult.skin_analysis?.brightness
        },
        beauty_metrics: analysisResult.beauty_metrics,
        face_coordinates: analysisResult.face_coordinates,
        processing_time: analysisResult.processing_time
      },
      recommendations,
      saved_to_database: !!savedAnalysis
    })

  } catch (error) {
    console.error('DeepFace analysis error:', error)
    return NextResponse.json({ 
      error: 'Analysis failed. Please try again.' 
    }, { status: 500 })
  }
}, { rateLimitCategory: 'ai' })

export const GET = withPublicAccess(async (request: NextRequest) => {
  try {
    const deepFaceClient = getDeepFaceClient()
    // Verify authentication
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check DeepFace service health
    const isHealthy = await deepFaceClient.healthCheck()
    
    return NextResponse.json({
      service: 'DeepFace AI',
      status: isHealthy ? 'healthy' : 'unhealthy',
      version: '1.0.0',
      capabilities: [
        'Face Detection',
        'Age/Gender/Race Detection',
        'Emotion Recognition',
        'Skin Quality Analysis',
        'Beauty Metrics',
        'Face Comparison'
      ]
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ 
      error: 'Health check failed' 
    }, { status: 500 })
  }
}, { rateLimitCategory: 'api' })

function generateTreatmentRecommendations(analysis: FaceAnalysisResult) {
  const recommendations = []

  if (!analysis.face_detected) {
    return [{
      priority: 'high',
      category: 'detection',
      title: 'Face Not Detected',
      description: 'Please ensure your face is clearly visible in the image.',
      treatments: []
    }]
  }

  // Age-based recommendations
  if (analysis.age) {
    if (analysis.age >= 30) {
      recommendations.push({
        priority: 'medium',
        category: 'anti-aging',
        title: 'Anti-Aging Treatment',
        description: 'Based on your age, consider anti-aging treatments.',
        treatments: ['Botox', 'Dermal Fillers', 'Chemical Peel', 'Laser Resurfacing']
      })
    }
  }

  // Skin quality recommendations
  const skinAnalysis = analysis.skin_analysis
  if (skinAnalysis) {
    if (skinAnalysis.texture_score && skinAnalysis.texture_score > 50) {
      recommendations.push({
        priority: 'high',
        category: 'texture',
        title: 'Skin Texture Improvement',
        description: 'Your skin texture shows room for improvement.',
        treatments: ['Microdermabrasion', 'Chemical Peel', 'Laser Treatment']
      })
    }

    if (skinAnalysis.smoothness && skinAnalysis.smoothness < 0.7) {
      recommendations.push({
        priority: 'medium',
        category: 'smoothness',
        title: 'Skin Smoothing',
        description: 'Consider treatments to improve skin smoothness.',
        treatments: ['Hydrafacial', 'Chemical Peel', 'LED Therapy']
      })
    }

    if (skinAnalysis.brightness && skinAnalysis.brightness < 0.6) {
      recommendations.push({
        priority: 'medium',
        category: 'brightness',
        title: 'Skin Brightening',
        description: 'Your skin could benefit from brightening treatments.',
        treatments: ['Vitamin C Treatment', 'Chemical Peel', 'Laser Brightening']
      })
    }
  }

  // Beauty score recommendations
  const beautyMetrics = analysis.beauty_metrics
  if (beautyMetrics) {
    if (beautyMetrics.overall_score && beautyMetrics.overall_score < 0.7) {
      recommendations.push({
        priority: 'low',
        category: 'overall',
        title: 'Overall Beauty Enhancement',
        description: 'Comprehensive treatment plan for beauty enhancement.',
        treatments: ['Custom Treatment Plan', 'Combination Therapy']
      })
    }
  }

  return recommendations
}
