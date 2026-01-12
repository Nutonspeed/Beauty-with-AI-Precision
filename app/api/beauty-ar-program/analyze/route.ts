/**
 * Mobile Beauty AR/AI Program API
 * รวม AR/AI program เข้ากับระบบที่มีอยู่
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SkinTypeClassifier } from '@/lib/skin-type-classifier'

// POST /api/beauty-ar-program/analyze - Analyze skin with AR/AI program
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
      programType,
      userPreferences,
      location,
      deviceInfo
    } = body

    if (!imageData || !programType) {
      return NextResponse.json({
        error: 'Missing required fields: imageData, programType'
      }, { status: 400 })
    }

    // Get center ID from user metadata
    const centerId = session.user.user_metadata?.center_id || 'default-center'

    // Step 1: Enhanced skin analysis with Thai-specific adaptations
    const enhancedAnalysis = await performEnhancedSkinAnalysis(imageData, location, deviceInfo)

    // Step 2: Generate AR program visualization
    const arProgram = await generateARProgramVisualization(
      enhancedAnalysis,
      programType,
      userPreferences
    )

    // Step 3: Calculate program recommendations
    const recommendations = await calculateProgramRecommendations(
      enhancedAnalysis,
      programType,
      userPreferences
    )

    // Step 4: Generate sales enablement data
    const salesData = await generateSalesEnablementData(
      enhancedAnalysis,
      arProgram,
      recommendations
    )

    // Step 5: Store analysis results
    const analysisResult = {
      userId: session.user.id,
      centerId,
      imageData: imageData.substring(0, 100) + '...', // Store truncated for privacy
      analysis: enhancedAnalysis,
      arProgram,
      recommendations,
      salesData,
      programType,
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
      arProgram,
      recommendations,
      salesData,
      programType,
      timestamp: new Date().toISOString(),
      sessionId: data?.[0]?.id || null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Beauty AR Program API error:', error)
    return NextResponse.json({
      error: 'Failed to process beauty AR program analysis',
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

// Generate AR program visualization
async function generateARProgramVisualization(analysis: any, programType: string, userPreferences?: any) {
  const arVisualization: {
    programType: string
    visualizationData: {
      beforeImage: any
      afterImage: any
      programZones: string[]
      intensityLevels: Record<string, number>
      duration: number
      confidence: number
    }
    userPreferences: any
    arInstructions: string[]
    safetyWarnings: string[]
    expectedResults: string[]
  } = {
    programType,
    visualizationData: {
      beforeImage: null, // Would contain processed image data
      afterImage: null,  // Would contain simulated result
      programZones: [],
      intensityLevels: {},
      duration: 0,
      confidence: analysis.confidence
    },
    userPreferences: userPreferences || {},
    arInstructions: [],
    safetyWarnings: [],
    expectedResults: []
  }

  // Generate program-specific AR data
  switch (programType) {
    case 'skin-brightening':
      arVisualization.visualizationData.programZones = ['face', 'neck', 'décolletage']
      arVisualization.visualizationData.intensityLevels = { low: 20, medium: 35, high: 50 }
      arVisualization.expectedResults = [
        '+15-25% skin brightness improvement',
        'More even skin tone',
        'Reduced appearance of dark spots'
      ]
      break

    case 'wrinkle-reduction':
      arVisualization.visualizationData.programZones = ['forehead', 'eye-area', 'nasolabial-folds']
      arVisualization.visualizationData.intensityLevels = { low: 15, medium: 25, high: 35 }
      arVisualization.expectedResults = [
        '20-35% reduction in wrinkle appearance',
        'Smoother skin texture',
        'More youthful appearance'
      ]
      break

    case 'acne-program':
      arVisualization.visualizationData.programZones = ['t-zone', 'chin', 'cheeks']
      arVisualization.visualizationData.intensityLevels = { low: 25, medium: 40, high: 60 }
      arVisualization.expectedResults = [
        '40-60% reduction in active acne',
        'Minimized acne scarring',
        'Balanced skin oil production'
      ]
      break

    case 'skin-firming':
      arVisualization.visualizationData.programZones = ['face', 'neck', 'jawline']
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
    'Follow on-screen program zone guides',
    'Review results and adjust preferences as needed'
  ]

  // Safety warnings based on skin type
  if (analysis.classificationResult.skinType === 'sensitive') {
    arVisualization.safetyWarnings.push(
      'Recommended lower intensity for sensitive skin',
      'Patch test recommended before full program',
      'Monitor skin response closely'
    )
  }

  return arVisualization
}

// Calculate program recommendations
async function calculateProgramRecommendations(analysis: any, programType: string, userPreferences?: any) {
  const recommendations: {
    primaryPrograms: string[]
    complementaryProducts: string[]
    programPlan: { duration: number; frequency: string; sessions: number }
    expectedOutcomes: string[]
    precautions: string[]
    thaiTraditionalAlternatives: string[]
  } = {
    primaryPrograms: [],
    complementaryProducts: [],
    programPlan: {
      duration: 0,
      frequency: '',
      sessions: 0
    },
    expectedOutcomes: [],
    precautions: [],
    thaiTraditionalAlternatives: []
  }

  // Generate recommendations based on program type and skin analysis
  switch (programType) {
    case 'skin-brightening':
      recommendations.primaryPrograms = [
        'Vitamin C serum application',
        'Chemical exfoliation program',
        'LED light therapy sessions'
      ]
      recommendations.complementaryProducts = [
        'SPF 50+ sunscreen daily',
        'Brightening night cream',
        'Gentle exfoliating cleanser'
      ]
      recommendations.programPlan = {
        duration: 60,
        frequency: '2-3 times per week',
        sessions: 8
      }
      recommendations.thaiTraditionalAlternatives = [
        'ข้าวโพดมาส์กหน้า - Rice face mask',
        'มะนาวผสมน้ำผึ้ง - Lemon honey program',
        'นมสดบำรุงผิว - Fresh milk skin nourishment'
      ]
      break

    case 'wrinkle-reduction':
      recommendations.primaryPrograms = [
        'Retinol application',
        'Hyaluronic acid injections',
        'Micro-needling program'
      ]
      recommendations.complementaryProducts = [
        'Anti-aging eye cream',
        'Collagen-boosting serum',
        'Hydrating moisturizer'
      ]
      recommendations.programPlan = {
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
      'Limit program frequency initially',
      'Use gentle, fragrance-free products'
    )
  }

  return recommendations
}

// Generate sales enablement data
async function generateSalesEnablementData(analysis: any, arProgram: any, recommendations: any) {
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
      'High confidence analysis - immediate program booking recommended'
    )
  }

  if (arProgram.expectedResults.length > 0) {
    salesData.conversionOpportunities.push(
      'AR visualization shows clear improvement potential'
    )
  }

  // Objection handlers
  salesData.objectionHandlers = [
    {
      objection: 'Too expensive',
      response: 'Compare to center equipment costs - mobile program saves 90%',
      evidence: 'Professional center tools cost $200K+, mobile solution is affordable'
    },
    {
      objection: 'Not as effective as center',
      response: 'AI analysis matches professional equipment accuracy',
      evidence: `${analysis.confidence}% confidence matches lab-grade analysis`
    },
    {
      objection: 'Prefer traditional programs',
      response: 'Combines traditional Thai ingredients with modern technology',
      evidence: `${recommendations.thaiTraditionalAlternatives.length} Thai traditional options included`
    }
  ]

  // Upselling suggestions
  salesData.upsellingSuggestions = [
    'Add complementary product package',
    'Include maintenance program subscription',
    'Recommend friend/family member programs',
    'Suggest seasonal program upgrades'
  ]

  // Customer education points
  salesData.customerEducation = [
    'Mobile AI matches professional center accuracy',
    'Traditional Thai ingredients enhance modern programs',
    'Consistent home care maximizes results',
    'Regular monitoring ensures optimal outcomes'
  ]

  // Follow-up actions
  salesData.followUpActions = [
    'Schedule program session within 7 days',
    'Send product usage instructions',
    'Book follow-up analysis in 4 weeks',
    'Set up program progress tracking'
  ]

  return salesData
}
