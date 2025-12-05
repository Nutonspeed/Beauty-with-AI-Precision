#!/usr/bin/env node

// Simple Gemini Gateway Test
const BASE_URL = process.env.BASE_URL || 'http://localhost:3004'

async function testGeminiGateway() {
  console.log('🚀 ทดสอบ Gemini AI Gateway...\n')

  try {
    console.log('📡 เรียก API endpoint: /api/test-gemini')
    console.log('🌐 URL:', `${BASE_URL}/api/test-gemini`)
    console.log('⏳ รอสักครู่...\n')

    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/api/test-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    const duration = Date.now() - startTime

    console.log(`⚡ เวลาในการตอบสนอง: ${duration}ms`)
    console.log(`📊 สถานะ: ${response.status} ${response.statusText}\n`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success) {
      console.log('🎉 สำเร็จ! AI Gateway ทำงานได้ปกติ!\n')

      console.log('📋 ผลการวิเคราะห์ผิว:')
      console.log(`   • อายุผิว: ${data.data.skinAge} ปี`)
      console.log(`   • ปัญหาผิว: ${data.data.concerns.length} รายการ`)
      console.log(`   • คอร์สรักษา: ${data.data.recommendations.length} แนะนำ\n`)

      console.log('🔧 Gateway Metadata:')
      console.log(`   • Gateway: ${data.metadata.gateway}`)
      console.log(`   • Model: ${data.metadata.model}`)
      console.log(`   • Duration: ${data.metadata.duration}\n`)

      console.log('✅ Gemini AI ทำงานผ่าน Vercel AI Gateway สำเร็จ!')
      console.log('💡 ประโยชน์: Rate limiting, caching, monitoring, error handling\n')

      console.log('🎯 Quick Scan จะใช้ Gemini จริงๆ แล้ว ไม่ใช่ mock data!')

    } else {
      console.log('❌ ล้มเหลว: API ส่ง success=false')
      console.log('ข้อผิดพลาด:', data.error)
    }

  } catch (error) {
    console.log('❌ ข้อผิดพลาด: ไม่สามารถทดสอบ AI Gateway ได้')
    console.log('สาเหตุ:', error instanceof Error ? error.message : String(error))
    console.log('\n🔧 วิธีแก้ไข:')
    console.log('• Dev server ต้องรันอยู่: pnpm run dev')
    console.log('• AI_GATEWAY_API_KEY ต้องถูกต้อง')
    console.log('• เชื่อมต่ออินเทอร์เน็ตต้องปกติ')
  }
}

testGeminiGateway()
