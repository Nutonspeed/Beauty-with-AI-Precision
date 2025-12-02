/**
 * Sales Enablement API
 * เครื่องมือช่วยเซลล์ขาย AR/AI treatments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/beauty-ar-treatment/sales - Generate sales enablement data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerProfile,
      treatmentInterest,
      objections,
      budget,
      urgency
    } = body

    if (!customerProfile || !treatmentInterest) {
      return NextResponse.json({
        error: 'Missing required fields: customerProfile, treatmentInterest'
      }, { status: 400 })
    }

    // Generate personalized sales strategy
    const salesStrategy = await generatePersonalizedSalesStrategy(
      customerProfile,
      treatmentInterest,
      objections,
      budget,
      urgency
    )

    // Generate objection handlers
    const objectionHandlers = await generateObjectionHandlers(
      objections,
      customerProfile,
      treatmentInterest
    )

    // Generate upselling opportunities
    const upsellingOpportunities = await generateUpsellingOpportunities(
      customerProfile,
      treatmentInterest,
      budget
    )

    // Generate closing scripts
    const closingScripts = await generateClosingScripts(
      customerProfile,
      treatmentInterest,
      urgency
    )

    const response = {
      success: true,
      salesStrategy,
      objectionHandlers,
      upsellingOpportunities,
      closingScripts,
      customerProfile,
      treatmentInterest,
      timestamp: new Date().toISOString(),
      generatedBy: session.user.id
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Sales Enablement API error:', error)
    return NextResponse.json({
      error: 'Failed to generate sales enablement data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Generate personalized sales strategy
async function generatePersonalizedSalesStrategy(
  customerProfile: any,
  treatmentInterest: string,
  objections?: string[],
  budget?: any,
  urgency?: string
) {
  const strategy = {
    approach: '',
    keyMessages: [],
    demonstrationPlan: [],
    timeline: '',
    riskMitigation: [],
    successMetrics: []
  }

  // Determine sales approach based on customer profile
  if (customerProfile.age < 25) {
    strategy.approach = 'Modern Tech-Focused Approach'
    strategy.keyMessages = [
      'เทคโนโลยี AI ล่าสุดสำหรับผลลัพธ์ที่รวดเร็ว',
      'AR visualization แสดงผลลัพธ์ก่อนรักษา',
      'เหมาะสำหรับไลฟ์สไตล์คนรุ่นใหม่'
    ]
  } else if (customerProfile.age < 40) {
    strategy.approach = 'Results-Oriented Approach'
    strategy.keyMessages = [
      'ผลลัพธ์ที่เห็นได้ชัดใน 2-4 สัปดาห์',
      'เทคโนโลยีที่ได้รับการพิสูจน์แล้ว',
      'สมดุลระหว่างประสิทธิภาพและความปลอดภัย'
    ]
  } else {
    strategy.approach = 'Trust & Experience Approach'
    strategy.keyMessages = [
      'ประสบการณ์การรักษามากกว่า 10 ปี',
      'เทคโนโลยีที่คลินิกชั้นนำใช้',
      'การดูแลที่เป็นส่วนตัวและใส่ใจ'
    ]
  }

  // Demonstration plan
  strategy.demonstrationPlan = [
    'เริ่มด้วยการสแกนผิวด้วย AI',
    'แสดง AR visualization ของผลลัพธ์',
    'อธิบายกระบวนการรักษา',
    'ตอบคำถามและจัดการข้อกังวล',
    'เสนอแพ็คเกจและราคา'
  ]

  // Timeline based on urgency
  switch (urgency) {
    case 'high':
      strategy.timeline = 'ปิดการขายวันนี้ - นัดรักษาภายใน 3 วัน'
      break
    case 'medium':
      strategy.timeline = 'ตัดสินใจภายใน 1 สัปดาห์ - นัดรักษาภายใน 2 สัปดาห์'
      break
    default:
      strategy.timeline = 'ใช้เวลาในการตัดสินใจ - นัดรักษาภายใน 1 เดือน'
  }

  // Risk mitigation
  strategy.riskMitigation = [
    'แสดงผลการศึกษาวิจัยและรีวิวจากลูกค้า',
    'อธิบายการรับประกันผลลัพธ์',
    'เสนอการทดลองใช้บริการขนาดเล็กก่อน',
    'ให้ข้อมูลติดต่อสำหรับคำปรึกษาหลังการขาย'
  ]

  // Success metrics
  strategy.successMetrics = [
    'ลูกค้าสนใจ AR demonstration',
    'ลดข้อกังวลลงได้ 80%',
    'ตกลงนัดหมายรักษา',
    'แนะนำบริการให้เพื่อน/ครอบครัว'
  ]

  return strategy
}

// Generate objection handlers
async function generateObjectionHandlers(
  objections: string[],
  customerProfile: any,
  treatmentInterest: string
) {
  const handlers = []

  const commonObjections = {
    'expensive': {
      objection: 'แพงเกินไป',
      responses: [
        'เปรียบเทียบกับราคาคลินิก - ประหยัดกว่า 70%',
        'แบ่งจ่ายได้ 0% นาน 6 เดือน',
        'ลงทุนครั้งเดียว ได้ผลยั่งยืน'
      ],
      evidence: 'ราคาเฉลี่ยตลาด vs ราคาเรา: 25,000฿ vs 15,000฿'
    },
    'not_effective': {
      objection: 'ไม่มั่นใจในผลลัพธ์',
      responses: [
        'AI วิเคราะห์แม่นยำ 94.7% เท่ากับเครื่องมือแพทย์',
        'AR แสดงผลลัพธ์ก่อนรักษา',
        'รับประกันผลลัพธ์ภายใน 30 วัน'
      ],
      evidence: 'ลูกค้า 95% พอใจกับผลลัพธ์'
    },
    'prefer_clinic': {
      objection: 'อยากไปคลินิก',
      responses: [
        'เราใช้เทคโนโลยีเดียวกับคลินิกชั้นนำ',
        'สะดวกกว่า - มาหาได้ที่บ้าน/ออฟฟิศ',
        'ประหยัดเวลาและค่าเดินทาง'
      ],
      evidence: 'บริการถึงบ้านมากกว่า 500 ครั้ง/เดือน'
    },
    'painful': {
      objection: 'กลัวเจ็บ',
      responses: [
        'การรักษาไม่เจ็บ - ใช้เทคโนโลยีทันสมัย',
        'มีครีมลดความรู้สึกก่อนรักษา',
        'ปรับระดับความแรงได้ตามความต้องการ'
      ],
      evidence: 'ลูกค้า 98% รู้สึกสบายใจในการรักษา'
    }
  }

  // Generate handlers for provided objections
  if (objections && objections.length > 0) {
    objections.forEach(objection => {
      const key = objection.toLowerCase()
      if (commonObjections[key]) {
        handlers.push({
          objection: commonObjections[key].objection,
          responses: commonObjections[key].responses,
          evidence: commonObjections[key].evidence,
          priority: 'high'
        })
      }
    })
  } else {
    // Generate default handlers
    handlers.push(...Object.values(commonObjections).map(obj => ({
      objection: obj.objection,
      responses: obj.responses,
      evidence: obj.evidence,
      priority: 'medium'
    })))
  }

  return handlers
}

// Generate upselling opportunities
async function generateUpsellingOpportunities(
  customerProfile: any,
  treatmentInterest: string,
  budget?: any
) {
  const opportunities = []

  // Base treatment upselling
  opportunities.push({
    type: 'package_upgrade',
    title: 'อัปเกรดเป็นแพ็คเกจพรีเมี่ยม',
    description: 'เพิ่มเซสชั่นรักษาและผลิตภัณฑ์บำรุง',
    priceIncrease: '+3,000฿',
    valueProposition: 'ประหยัดกว่า 15% และได้ผลลัพธ์ดีกว่า',
    conversionProbability: '65%'
  })

  // Complementary treatments
  if (treatmentInterest === 'skin-brightening') {
    opportunities.push({
      type: 'complementary_treatment',
      title: 'เพิ่มการรักษาริ้วรอย',
      description: 'รวมรักษาริ้วรอยเพื่อผิวที่สมบูรณ์แบบ',
      priceIncrease: '+5,000฿',
      valueProposition: 'ผิวขาวเนียนไร้ริ้วรอย',
      conversionProbability: '45%'
    })
  }

  // Product add-ons
  opportunities.push({
    type: 'product_bundle',
    title: 'เพิ่มชุดผลิตภัณฑ์บำรุง',
    description: 'ครีมบำรุงและมาส์กสำหรับใช้ที่บ้าน',
    priceIncrease: '+2,500฿',
    valueProposition: 'ยืดอายุผลลัพธ์รักษา',
    conversionProbability: '55%'
  })

  // Maintenance subscription
  opportunities.push({
    type: 'subscription',
    title: 'สมัครแพ็คเกจดูแลประจำเดือน',
    description: 'รักษาผลลัพธ์ด้วยการดูแลประจำทุกเดือน',
    priceIncrease: '+1,500฿/เดือน',
    valueProposition: 'ผิวสวยยั่งยืน ไม่ต้องรักษาซ้ำ',
    conversionProbability: '35%'
  })

  // Filter by budget if provided
  if (budget && budget.maxPrice) {
    return opportunities.filter(opp =>
      parseInt(opp.priceIncrease.replace(/[^\d]/g, '')) <= budget.maxPrice
    )
  }

  return opportunities
}

// Generate closing scripts
async function generateClosingScripts(
  customerProfile: any,
  treatmentInterest: string,
  urgency?: string
) {
  const scripts = []

  // Trial close
  scripts.push({
    type: 'trial_close',
    script: 'คุณคิดอย่างไรกับผลลัพธ์ที่เห็นครับ? มั่นใจไหมว่าต้องการผิวแบบนี้?',
    purpose: 'ทดสอบความสนใจเบื้องต้น',
    expectedResponse: 'ใช่สนใจ / ยังลังเล',
    followUp: 'ถ้าสนใจ → นัดหมาย | ถ้าลังเล → จัดการข้อกังวล'
  })

  // Assumptive close
  scripts.push({
    type: 'assumptive_close',
    script: 'เรามาเลือกแพ็คเกจที่เหมาะสมกับคุณกันเถอะครับ คุณต้องการเริ่มด้วยเซสชั่นเดี่ยวก่อนใช่ไหม?',
    purpose: 'สมมติว่าลูกค้าตัดสินใจซื้อแล้ว',
    expectedResponse: 'ตกลง / ปรับเปลี่ยน',
    followUp: 'บันทึกข้อมูลและปิดการขาย'
  })

  // Urgency close (if high urgency)
  if (urgency === 'high') {
    scripts.push({
      type: 'urgency_close',
      script: 'โปรโมชั่นพิเศษวันนี้เท่านั้นครับ! จองตอนนี้ได้ส่วนลดเพิ่ม 1,000฿ คุณสนใจไหม?',
      purpose: 'สร้างความเร่งด่วน',
      expectedResponse: 'ตกลง / ถามรายละเอียด',
      followUp: 'ปิดการขายทันที'
    })
  }

  // Benefit-focused close
  scripts.push({
    type: 'benefit_close',
    script: 'นึกภาพสิครับว่าผิวคุณจะสวยขึ้นขนาดไหนหลังรักษา คุณพร้อมที่จะมีผิวแบบนั้นแล้วใช่ไหม?',
    purpose: 'โฟกัสที่ผลประโยชน์',
    expectedResponse: 'ใช่ / อธิบายเพิ่ม',
    followUp: 'ย้ำผลประโยชน์และปิดการขาย'
  })

  // Alternative choice close
  scripts.push({
    type: 'alternative_close',
    script: 'คุณต้องการแพ็คเกจมาตรฐาน 12,000฿ หรือจะอัปเกรดเป็นพรีเมี่ยม 15,000฿ ที่ได้ผลลัพธ์ดีกว่าครับ?',
    purpose: 'ให้ทางเลือกในการตัดสินใจ',
    expectedResponse: 'เลือกแพ็คเกจ',
    followUp: 'บันทึกการเลือกและปิดการขาย'
  })

  return scripts
}
