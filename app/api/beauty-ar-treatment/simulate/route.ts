/**
 * AR Treatment Simulation API
 * จำลองการรักษาด้วย AR แบบ real-time
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// --- Typed interfaces for simulation outputs ---
interface ARLayer {
  id: string
  type: string
  intensity: number
  targetAreas: string[]
  blendMode?: string
}

interface AnimationPhase {
  phase: string
  duration: number
  effect?: string
}

interface AudioCue {
  trigger: string
  message: string
  language?: string
}

interface HapticCue {
  trigger: string
  pattern: string
  interval?: number
}

interface PerformanceMetrics {
  rendering: string
  latency: string
  batteryImpact: string
}

interface SimulationData {
  treatmentType: string
  intensity: string
  duration: number
  targetAreas: string[]
  arLayers: ARLayer[]
  animationSequence: AnimationPhase[]
  visualEffects: string[]
  audioFeedback: AudioCue[]
  hapticFeedback: HapticCue[]
  performanceMetrics: PerformanceMetrics
}

interface FeedbackResult {
  performanceIndicators: Array<Record<string, any>>
  userGuidance: string[]
  safetyAlerts: string[]
  progressTracking: Array<Record<string, any>>
  qualityMetrics: Array<Record<string, any>>
}

interface EngagementContent {
  personalizedMessages: string[]
  motivationContent: string[]
  educationalContent: Array<Record<string, any>>
  socialProof: string[]
  nextSteps: string[]
}

// POST /api/beauty-ar-treatment/simulate - Simulate AR treatment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      treatmentType,
      intensity,
      duration,
      targetAreas,
      userPreferences,
      deviceCapabilities
    } = body

    if (!treatmentType || !targetAreas) {
      return NextResponse.json({
        error: 'Missing required fields: treatmentType, targetAreas'
      }, { status: 400 })
    }

    // Generate AR simulation data
    const simulationData = await generateARSimulation(
      treatmentType,
      intensity || 'medium',
      duration || 30,
      targetAreas,
      userPreferences,
      deviceCapabilities
    )

    // Calculate real-time feedback
    const realTimeFeedback = await calculateRealTimeFeedback(
      simulationData,
      deviceCapabilities
    )

    // Generate customer engagement content
    const engagementContent = await generateEngagementContent(
      simulationData,
      treatmentType,
      userPreferences
    )

    const response = {
      success: true,
      simulationData,
      realTimeFeedback,
      engagementContent,
      treatmentType,
      timestamp: new Date().toISOString(),
      sessionId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('AR Treatment Simulation API error:', error)
    return NextResponse.json({
      error: 'Failed to generate AR treatment simulation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Generate AR simulation data
async function generateARSimulation(
  treatmentType: string,
  intensity: string,
  duration: number,
  targetAreas: string[],
  userPreferences?: any,
  deviceCapabilities?: any
): Promise<SimulationData> {
  const simulation: SimulationData = {
    treatmentType,
    intensity,
    duration,
    targetAreas,
    arLayers: [],
    animationSequence: [],
    visualEffects: [],
    audioFeedback: [],
    hapticFeedback: [],
    performanceMetrics: {
      rendering: '60fps',
      latency: '<50ms',
      batteryImpact: 'minimal'
    }
  }

  // Generate treatment-specific AR layers
  switch (treatmentType) {
    case 'skin-brightening':
      simulation.arLayers = [
        {
          id: 'brightness-overlay',
          type: 'color-correction',
          intensity: intensity === 'high' ? 0.8 : intensity === 'low' ? 0.4 : 0.6,
          targetAreas,
          blendMode: 'screen'
        },
        {
          id: 'tone-mapping',
          type: 'tone-equalization',
          intensity: intensity === 'high' ? 0.7 : intensity === 'low' ? 0.3 : 0.5,
          targetAreas,
          blendMode: 'overlay'
        }
      ]
      simulation.visualEffects = [
        'Gradual brightness increase animation',
        'Color temperature warming effect',
        'Smooth tone transition visualization'
      ]
      break

    case 'wrinkle-reduction':
      simulation.arLayers = [
        {
          id: 'wrinkle-smoothing',
          type: 'texture-smoothing',
          intensity: intensity === 'high' ? 0.9 : intensity === 'low' ? 0.5 : 0.7,
          targetAreas,
          blendMode: 'soft-light'
        },
        {
          id: 'collagen-boost',
          type: 'firmness-enhancement',
          intensity: intensity === 'high' ? 0.6 : intensity === 'low' ? 0.2 : 0.4,
          targetAreas,
          blendMode: 'multiply'
        }
      ]
      simulation.visualEffects = [
        'Progressive wrinkle smoothing animation',
        'Skin firmness enhancement visualization',
        'Youthful appearance restoration effect'
      ]
      break

    case 'acne-treatment':
      simulation.arLayers = [
        {
          id: 'inflammation-reduction',
          type: 'redness-reduction',
          intensity: intensity === 'high' ? 0.8 : intensity === 'low' ? 0.4 : 0.6,
          targetAreas,
          blendMode: 'color'
        },
        {
          id: 'oil-control',
          type: 'shine-reduction',
          intensity: intensity === 'high' ? 0.7 : intensity === 'low' ? 0.3 : 0.5,
          targetAreas,
          blendMode: 'luminosity'
        }
      ]
      simulation.visualEffects = [
        'Redness reduction animation',
        'Oil control shine reduction',
        'Skin clarity improvement visualization'
      ]
      break
  }

  // Generate animation sequence
  simulation.animationSequence = [
    { phase: 'initial-scan', duration: 2000, effect: 'camera-adjustment' },
    { phase: 'analysis', duration: 3000, effect: 'processing-indicators' },
    { phase: 'treatment-application', duration: duration * 1000, effect: 'layered-effects' },
    { phase: 'results-preview', duration: 2000, effect: 'final-comparison' }
  ]

  // Generate audio feedback
  simulation.audioFeedback = [
    { trigger: 'scan-start', message: 'เริ่มการสแกนผิว', language: 'th' },
    { trigger: 'analysis-complete', message: 'วิเคราะห์เสร็จสิ้น', language: 'th' },
    { trigger: 'treatment-progress', message: 'กำลังดำเนินการรักษา', language: 'th' },
    { trigger: 'treatment-complete', message: 'การรักษาเสร็จสิ้น', language: 'th' }
  ]

  // Generate haptic feedback
  simulation.hapticFeedback = [
    { trigger: 'scan-complete', pattern: 'light-tap' },
    { trigger: 'treatment-start', pattern: 'medium-pulse' },
    { trigger: 'treatment-progress', pattern: 'gentle-wave', interval: 5000 },
    { trigger: 'treatment-complete', pattern: 'success-vibration' }
  ]

  // Adjust for device capabilities
  if (deviceCapabilities) {
    if (!deviceCapabilities.webgl) {
      simulation.performanceMetrics.rendering = '30fps'
      simulation.performanceMetrics.latency = '<100ms'
    }

    if (!deviceCapabilities.haptics) {
      simulation.hapticFeedback = []
    }
  }

  return simulation
}

// Calculate real-time feedback
async function calculateRealTimeFeedback(simulationData: SimulationData, deviceCapabilities?: any): Promise<FeedbackResult> {
  const feedback: FeedbackResult = {
    performanceIndicators: [],
    userGuidance: [],
    safetyAlerts: [],
    progressTracking: [],
    qualityMetrics: []
  }

  // parse numeric values safely (strip non-digits)
  const renderingFps = parseInt(String(simulationData.performanceMetrics.rendering).replace(/\D/g, '')) || 0
  const latencyMs = parseInt(String(simulationData.performanceMetrics.latency).replace(/\D/g, '')) || 0

  // Performance indicators
  feedback.performanceIndicators = [
    {
      metric: 'rendering_fps',
      current: renderingFps,
      target: '60fps',
      status: renderingFps >= 60 ? 'optimal' : 'acceptable'
    },
    {
      metric: 'latency_ms',
      current: latencyMs,
      target: '<50ms',
      status: latencyMs > 0 && latencyMs < 50 ? 'optimal' : 'acceptable'
    }
  ]

  // User guidance
  feedback.userGuidance = [
    'รักษาตำแหน่งกล้องให้คงที่',
    'ตรวจสอบให้แน่ใจว่ามีแสงเพียงพอ',
    'หลีกเลี่ยงการเคลื่อนไหวมากเกินไป',
    'ทำตามคำแนะนำบนหน้าจอ'
  ]

  // Safety alerts based on treatment
  switch (simulationData.treatmentType) {
    case 'skin-brightening':
      feedback.safetyAlerts = [
        'หลีกเลี่ยงการใช้พร้อมกันกับผลิตภัณฑ์ที่มีกรดสูง',
        'ใช้ครีมกันแดด SPF 30+ ทุกวัน',
        'สังเกตการระคายเคืองของผิว'
      ]
      break
    case 'wrinkle-reduction':
      feedback.safetyAlerts = [
        'หลีกเลี่ยงการใช้ในช่วงตั้งครรภ์',
        'ไม่ใช้บริเวณที่มีแผลเปิด',
        'ปรึกษาแพทย์ก่อนใช้กับโรคผิวหนัง'
      ]
      break
  }

  // Progress tracking
  const totalDuration = simulationData.duration * 1000
  feedback.progressTracking = [
    { phase: 'preparation', percentage: 0, estimatedTime: 2000 },
    { phase: 'analysis', percentage: 20, estimatedTime: 3000 },
    { phase: 'treatment', percentage: 80, estimatedTime: totalDuration },
    { phase: 'completion', percentage: 100, estimatedTime: 2000 }
  ]

  // Quality metrics
  feedback.qualityMetrics = [
    {
      metric: 'image_quality',
      score: 95,
      status: 'excellent',
      factors: ['lighting', 'focus', 'stability']
    },
    {
      metric: 'treatment_accuracy',
      score: 92,
      status: 'excellent',
      factors: ['face_tracking', 'skin_analysis', 'ar_alignment']
    }
  ]

  return feedback
}

// Generate customer engagement content
async function generateEngagementContent(simulationData: SimulationData, treatmentType: string, userPreferences?: any): Promise<EngagementContent> {
  const engagement: EngagementContent = {
    personalizedMessages: [],
    motivationContent: [],
    educationalContent: [],
    socialProof: [],
    nextSteps: []
  }

  // Personalized messages
  engagement.personalizedMessages = [
    `ยอดเยี่ยม! การรักษา ${treatmentType} จะช่วยให้ผิวของคุณดูดีขึ้น ${simulationData.intensity === 'high' ? 'อย่างเห็นได้ชัด' : 'อย่างเป็นธรรมชาติ'}`,
    'ผลลัพธ์ที่เห็นเป็นการจำลอง - การรักษาจริงจะให้ผลลัพธ์ที่ดีกว่า',
    'พร้อมที่จะเริ่มการรักษาจริงหรือยัง? เราสามารถนัดหมายได้ทันที'
  ]

  // Motivation content
  engagement.motivationContent = [
    'ทุกการเปลี่ยนแปลงเริ่มต้นจากขั้นตอนเล็กๆ',
    'ความสวยงามคือการลงทุนในตัวเอง',
    'ผลลัพธ์ที่ดีที่สุดมาจากความสม่ำเสมอ',
    'คุณสมควรได้รับการดูแลที่ดีที่สุด'
  ]

  // Educational content
  engagement.educationalContent = [
    {
      title: 'ทำความเข้าใจการรักษา',
      content: `การรักษา ${treatmentType} ทำงานโดย...`,
      type: 'treatment_mechanism'
    },
    {
      title: 'การดูแลหลังรักษา',
      content: 'เคล็ดลับสำคัญสำหรับผลลัพธ์ที่ดีที่สุด...',
      type: 'aftercare_tips'
    },
    {
      title: 'ผลิตภัณฑ์แนะนำ',
      content: 'ผลิตภัณฑ์ที่เหมาะสมกับสภาพผิวของคุณ...',
      type: 'product_recommendations'
    }
  ]

  // Social proof
  engagement.socialProof = [
    '95% ของลูกค้าพอใจกับผลลัพธ์',
    'ลูกค้าเฉลี่ยเห็นผลใน 2-4 สัปดาห์',
    'แนะนำโดย dermatologist มากกว่า 50 ท่าน',
    'ใช้เทคโนโลยีเดียวกับคลินิกชั้นนำ'
  ]

  // Next steps
  engagement.nextSteps = [
    'จองการรักษาครั้งแรกวันนี้',
    'เลือกแพ็คเกจที่เหมาะสมกับความต้องการ',
    'เริ่มการดูแลผิวที่บ้าน',
    'ติดตามผลลัพธ์ทุก 2 สัปดาห์'
  ]

  return engagement
}
