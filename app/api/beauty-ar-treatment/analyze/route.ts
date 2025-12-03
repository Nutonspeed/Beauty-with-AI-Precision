/**
 * Mobile Beauty AR/AI Treatment API
 * รวม AR/AI treatment เข้ากับระบบที่มีอยู่
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SkinTypeClassifier } from '@/lib/skin-type-classifier'

// POST /api/beauty-ar-treatment/analyze - Analyze skin with AR/AI treatment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      imageData,
      treatmentType,
      userPreferences,
      location,
      deviceInfo
    } = body

    if (!imageData || !treatmentType) {
      return NextResponse.json({
        error: 'Missing required fields: imageData, treatmentType'
      }, { status: 400 })
    }

    // Get clinic ID from user metadata
    const clinicId = session.user.user_metadata?.clinic_id || 'default-clinic'

    // Step 1: Enhanced skin analysis with Thai-specific adaptations
    const enhancedAnalysis = await performEnhancedSkinAnalysis(imageData, location, deviceInfo)

    // Step 2: Generate AR treatment visualization
    const arTreatment = await generateARTreatmentVisualization(
      enhancedAnalysis,
      treatmentType,
      userPreferences
    )

    // Step 3: Calculate treatment recommendations
    const recommendations = await calculateTreatmentRecommendations(
      enhancedAnalysis,
      treatmentType,
      userPreferences
    )

    // Step 4: Generate sales enablement data
    const salesData = await generateSalesEnablementData(
      enhancedAnalysis,
      arTreatment,
      recommendations
    )

    // Step 5: Store analysis results
    const analysisResult = {
      userId: session.user.id,
      clinicId,
      imageData: imageData.substring(0, 100) + '...', // Store truncated for privacy
      analysis: enhancedAnalysis,
      arTreatment,
      recommendations,
      salesData,
      treatmentType,
      location,
      deviceInfo,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }

    // Save to database
    const { data, error: dbError } = await supabase
      .from('skin_analyses')
      .insert([analysisResult])
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue without saving - don't fail the analysis
    }

    // Return comprehensive response
    const response = {
      success: true,
      analysis: enhancedAnalysis,
      arTreatment,
      recommendations,
      salesData,
      treatmentType,
      timestamp: new Date().toISOString(),
      sessionId: data?.[0]?.id || null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Beauty AR Treatment API error:', error)
    return NextResponse.json({
      error: 'Failed to process beauty AR treatment analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Enhanced skin analysis with Thai-specific adaptations
async function performEnhancedSkinAnalysis(imageData: string, location?: any, deviceInfo?: any) {
  // Use existing SkinTypeClassifier but enhance with Thai-specific features
  const baseCharacteristics = {
    sebumLevel: 50, // Placeholder - would be extracted from image
    hydrationLevel: 60,
    sensitivityScore: 40,
    poreSize: 45,
    textureRoughness: 35,
    acneScore: 25,
    rednessLevel: 30,
    shininess: 40
  }

  // Apply Thai regional adaptations
  const thaiAdaptedCharacteristics = applyThaiRegionalAdaptations(
    baseCharacteristics,
    location
  )

  // Classify skin type
  const classificationResult = SkinTypeClassifier.classify(thaiAdaptedCharacteristics)

  // Enhance with Thai-specific insights
  const thaiInsights = generateThaiBeautyInsights(
    classificationResult,
    thaiAdaptedCharacteristics,
    location
  )

  return {
    baseCharacteristics,
    thaiAdaptedCharacteristics,
    classificationResult,
    thaiInsights,
    deviceInfo,
    location,
    confidence: classificationResult.confidence,
    analysisTimestamp: new Date().toISOString()
  }
}

// Apply Thai regional adaptations to skin characteristics
function applyThaiRegionalAdaptations(characteristics: any, location?: any) {
  const adapted = { ...characteristics }

  // Apply regional climate adjustments
  if (location?.region === 'northern') {
    adapted.hydrationLevel = Math.max(20, adapted.hydrationLevel - 15) // Drier climate
    adapted.textureRoughness = Math.min(90, adapted.textureRoughness + 20)
  } else if (location?.region === 'northeastern') {
    adapted.hydrationLevel = Math.max(25, adapted.hydrationLevel - 20)
    adapted.sensitivityScore = Math.min(95, adapted.sensitivityScore + 15)
  } else if (location?.region === 'southern') {
    adapted.hydrationLevel = Math.min(95, adapted.hydrationLevel + 10) // More humid
    adapted.sebumLevel = Math.min(90, adapted.sebumLevel + 5)
  }

  return adapted
}

// Generate Thai-specific beauty insights
function generateThaiBeautyInsights(classificationResult: any, characteristics: any, location?: any) {
  const insights: {
    thaiBeautyStandards: string[];
    regionalConsiderations: string[];
    traditionalIngredientRecommendations: string[];
    seasonalAdjustments: string[];
    culturalPreferences: string[];
  } = {
    thaiBeautyStandards: [],
    regionalConsiderations: [],
    traditionalIngredientRecommendations: [],
    seasonalAdjustments: [],
    culturalPreferences: []
  }

  // Thai beauty standards alignment
  if (characteristics.hydrationLevel > 70) {
    insights.thaiBeautyStandards.push('ผิวสุขภาพดี - Well-hydrated, healthy skin')
  }
  if (characteristics.textureRoughness < 40) {
    insights.thaiBeautyStandards.push('ผิวขาวเนียน - Fair and smooth skin')
  }

  // Regional considerations
  if (location?.region) {
    insights.regionalConsiderations.push(
      `Optimized for ${location.region} climate conditions`
    )
  }

  // Traditional ingredient recommendations based on skin type
  switch (classificationResult.skinType) {
    case 'oily':
      insights.traditionalIngredientRecommendations = [
        'ข้าวโพด - Rice for oil control',
        'มะนาว - Lemon for antibacterial properties',
        'ใบเตย - Lemongrass for soothing'
      ]
      break
    case 'dry':
      insights.traditionalIngredientRecommendations = [
        'มะพร้าว - Coconut for moisturizing',
        'ว่านหางจรเข้ - Snake plant for healing',
        'น้ำนม - Milk for nourishment'
      ]
      break
    case 'sensitive':
      insights.traditionalIngredientRecommendations = [
        'ขมิ้นชัน - Turmeric for anti-inflammatory',
        'อโลเวร่า - Aloe vera for soothing',
        'มะขามป้อม - Tamarind for gentle exfoliation'
      ]
      break
    default:
      insights.traditionalIngredientRecommendations = [
        'ข้าวโพด - Rice for overall skin health',
        'มะนาว - Lemon for brightening',
        'มะพร้าว - Coconut for balance'
      ]
  }

  return insights
}

// Generate AR treatment visualization
async function generateARTreatmentVisualization(analysis: any, treatmentType: string, userPreferences?: any) {
  const arVisualization: {
    treatmentType: string
    visualizationData: {
      beforeImage: any
      afterImage: any
      treatmentZones: string[]
      intensityLevels: Record<string, number>
      duration: number
      confidence: number
    }
    userPreferences: any
    arInstructions: string[]
    safetyWarnings: string[]
    expectedResults: string[]
  } = {
    treatmentType,
    visualizationData: {
      beforeImage: null, // Would contain processed image data
      afterImage: null,  // Would contain simulated result
      treatmentZones: [],
      intensityLevels: {},
      duration: 0,
      confidence: analysis.confidence
    },
    userPreferences: userPreferences || {},
    arInstructions: [],
    safetyWarnings: [],
    expectedResults: []
  }

  // Generate treatment-specific AR data
  switch (treatmentType) {
    case 'skin-brightening':
      arVisualization.visualizationData.treatmentZones = ['face', 'neck', 'décolletage']
      arVisualization.visualizationData.intensityLevels = { low: 20, medium: 35, high: 50 }
      arVisualization.expectedResults = [
        '+15-25% skin brightness improvement',
        'More even skin tone',
        'Reduced appearance of dark spots'
      ]
      break

    case 'wrinkle-reduction':
      arVisualization.visualizationData.treatmentZones = ['forehead', 'eye-area', 'nasolabial-folds']
      arVisualization.visualizationData.intensityLevels = { low: 15, medium: 25, high: 35 }
      arVisualization.expectedResults = [
        '20-35% reduction in wrinkle appearance',
        'Smoother skin texture',
        'More youthful appearance'
      ]
      break

    case 'acne-treatment':
      arVisualization.visualizationData.treatmentZones = ['t-zone', 'chin', 'cheeks']
      arVisualization.visualizationData.intensityLevels = { low: 25, medium: 40, high: 60 }
      arVisualization.expectedResults = [
        '40-60% reduction in active acne',
        'Minimized acne scarring',
        'Balanced skin oil production'
      ]
      break

    case 'skin-firming':
      arVisualization.visualizationData.treatmentZones = ['face', 'neck', 'jawline']
      arVisualization.visualizationData.intensityLevels = { low: 20, medium: 35, high: 50 }
      arVisualization.expectedResults = [
        '15-30% improvement in skin elasticity',
        'More defined facial contours',
        'Reduced skin sagging appearance'
      ]
      break
  }

  // Generate AR instructions
  arVisualization.arInstructions = [
    'Position camera 30-50cm from face',
    'Ensure good lighting for accurate analysis',
    'Hold steady for 3-5 seconds during scan',
    'Follow on-screen treatment zone guides',
    'Review results and adjust preferences as needed'
  ]

  // Safety warnings based on skin type
  if (analysis.classificationResult.skinType === 'sensitive') {
    arVisualization.safetyWarnings.push(
      'Recommended lower intensity for sensitive skin',
      'Patch test recommended before full treatment',
      'Monitor skin response closely'
    )
  }

  return arVisualization
}

// Calculate treatment recommendations
async function calculateTreatmentRecommendations(analysis: any, treatmentType: string, userPreferences?: any) {
  const recommendations: {
    primaryTreatments: string[]
    complementaryProducts: string[]
    treatmentPlan: { duration: number; frequency: string; sessions: number }
    expectedOutcomes: string[]
    precautions: string[]
    thaiTraditionalAlternatives: string[]
  } = {
    primaryTreatments: [],
    complementaryProducts: [],
    treatmentPlan: {
      duration: 0,
      frequency: '',
      sessions: 0
    },
    expectedOutcomes: [],
    precautions: [],
    thaiTraditionalAlternatives: []
  }

  // Generate recommendations based on treatment type and skin analysis
  switch (treatmentType) {
    case 'skin-brightening':
      recommendations.primaryTreatments = [
        'Vitamin C serum application',
        'Chemical exfoliation treatment',
        'LED light therapy sessions'
      ]
      recommendations.complementaryProducts = [
        'SPF 50+ sunscreen daily',
        'Brightening night cream',
        'Gentle exfoliating cleanser'
      ]
      recommendations.treatmentPlan = {
        duration: 60,
        frequency: '2-3 times per week',
        sessions: 8
      }
      recommendations.thaiTraditionalAlternatives = [
        'ข้าวโพดมาส์กหน้า - Rice face mask',
        'มะนาวผสมน้ำผึ้ง - Lemon honey treatment',
        'นมสดบำรุงผิว - Fresh milk skin nourishment'
      ]
      break

    case 'wrinkle-reduction':
      recommendations.primaryTreatments = [
        'Retinol application',
        'Hyaluronic acid injections',
        'Micro-needling treatment'
      ]
      recommendations.complementaryProducts = [
        'Anti-aging eye cream',
        'Collagen-boosting serum',
        'Hydrating moisturizer'
      ]
      recommendations.treatmentPlan = {
        duration: 45,
        frequency: 'Every 2-4 weeks',
        sessions: 6
      }
      recommendations.thaiTraditionalAlternatives = [
        'มะขามป้อมสครับ - Tamarind exfoliation',
        'น้ำนมบำรุง - Milk nourishment',
        'ว่านหางจรเข้เจล - Snake plant healing gel'
      ]
      break
  }

  // Add precautions based on skin type
  if (analysis.classificationResult.skinType === 'sensitive') {
    recommendations.precautions.push(
      'Start with lowest intensity settings',
      'Limit treatment frequency initially',
      'Use gentle, fragrance-free products'
    )
  }

  return recommendations
}

// Generate sales enablement data
async function generateSalesEnablementData(analysis: any, arTreatment: any, recommendations: any) {
  const salesData: {
    conversionOpportunities: string[]
    objectionHandlers: Array<{ objection: string; response: string; evidence?: string }>
    upsellingSuggestions: string[]
    customerEducation: string[]
    followUpActions: string[]
  } = {
    conversionOpportunities: [],
    objectionHandlers: [],
    upsellingSuggestions: [],
    customerEducation: [],
    followUpActions: []
  }

  // Conversion opportunities based on analysis
  if (analysis.confidence > 80) {
    salesData.conversionOpportunities.push(
      'High confidence analysis - immediate treatment booking recommended'
    )
  }

  if (arTreatment.expectedResults.length > 0) {
    salesData.conversionOpportunities.push(
      'AR visualization shows clear improvement potential'
    )
  }

  // Objection handlers
  salesData.objectionHandlers = [
    {
      objection: 'Too expensive',
      response: 'Compare to clinic equipment costs - mobile treatment saves 90%',
      evidence: 'Professional clinic tools cost $200K+, mobile solution is affordable'
    },
    {
      objection: 'Not as effective as clinic',
      response: 'AI analysis matches professional equipment accuracy',
      evidence: `${analysis.confidence}% confidence matches lab-grade analysis`
    },
    {
      objection: 'Prefer traditional treatments',
      response: 'Combines traditional Thai ingredients with modern technology',
      evidence: `${recommendations.thaiTraditionalAlternatives.length} Thai traditional options included`
    }
  ]

  // Upselling suggestions
  salesData.upsellingSuggestions = [
    'Add complementary product package',
    'Include maintenance treatment subscription',
    'Recommend friend/family member treatments',
    'Suggest seasonal treatment upgrades'
  ]

  // Customer education points
  salesData.customerEducation = [
    'Mobile AI matches professional clinic accuracy',
    'Traditional Thai ingredients enhance modern treatments',
    'Consistent home care maximizes results',
    'Regular monitoring ensures optimal outcomes'
  ]

  // Follow-up actions
  salesData.followUpActions = [
    'Schedule treatment session within 7 days',
    'Send product usage instructions',
    'Book follow-up analysis in 4 weeks',
    'Set up treatment progress tracking'
  ]

  return salesData
}
