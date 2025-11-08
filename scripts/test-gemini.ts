/**
 * Test Google Gemini 2.0 Flash API
 * Verify multimodal vision capabilities for skin analysis
 * 
 * Free tier: 1,500 requests/day (Gemini 2.0 Flash)
 * Rate limit: 15 RPM (requests per minute)
 */

import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

async function testGeminiAPI() {
  console.log('\n🧪 Testing Google Gemini 2.0 Flash API Integration...\n')

  try {
    // Step 1: Check API key
    console.log('1️⃣  Checking Gemini API key...')
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables')
      console.error('   Please add GEMINI_API_KEY to .env.local')
      process.exit(1)
    }
    
    console.log(`✅ API key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
    console.log('')

    // Step 2: Initialize Gemini client
    console.log('2️⃣  Initializing Gemini API client...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    })
    console.log('✅ Client initialized with gemini-2.0-flash-exp model\n')

    // Step 3: Test text-only generation (simple capability test)
    console.log('3️⃣  Testing text generation capability...')
    const textStartTime = Date.now()
    
    const textPrompt = "Explain what skin analysis is in one sentence."
    const textResult = await model.generateContent(textPrompt)
    const textResponse = textResult.response
    
    const textEndTime = Date.now()
    const textProcessingTime = textEndTime - textStartTime

    console.log(`✅ Text generation successful!`)
    console.log(`   Processing time: ${textProcessingTime}ms`)
    console.log(`   Response: "${textResponse.text()}"`)
    console.log('')

    // Step 4: Test vision capability with base64 image
    console.log('4️⃣  Testing vision analysis with test image...')
    
    // Try to find a real test image first
    const testImagePaths = [
      resolve(process.cwd(), 'public/placeholder-user.jpg'),
      resolve(process.cwd(), 'public/test-face.jpg'),
      resolve(process.cwd(), 'public/images/test-face.jpg')
    ]

    let testImageBuffer: Buffer | null = null
    let testImagePath: string | null = null
    
    for (const imagePath of testImagePaths) {
      if (existsSync(imagePath)) {
        testImageBuffer = readFileSync(imagePath)
        testImagePath = imagePath
        console.log(`   Found test image: ${imagePath}`)
        console.log(`   Image size: ${(testImageBuffer.length / 1024).toFixed(2)} KB`)
        break
      }
    }

    if (!testImageBuffer) {
      // Use a simple test image (1x1 pixel PNG)
      console.log('   Using minimal test image (1x1 pixel PNG)')
      testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    }

    const visionStartTime = Date.now()
    
    const visionPrompt = `Analyze this image and describe what you see. If it's a face, describe the skin condition, any visible concerns like wrinkles, spots, or texture issues.`
    
    const imagePart = {
      inlineData: {
        data: testImageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    }

    const visionResult = await model.generateContent([visionPrompt, imagePart])
    const visionResponse = visionResult.response
    
    const visionEndTime = Date.now()
    const visionProcessingTime = visionEndTime - visionStartTime

    console.log(`✅ Vision analysis successful!`)
    console.log(`   Processing time: ${visionProcessingTime}ms`)
    console.log(`   Response length: ${visionResponse.text().length} characters`)
    console.log(`   Analysis preview:`)
    console.log(`   "${visionResponse.text().substring(0, 200)}..."`)
    console.log('')

    // Step 5: Test skin analysis specific prompt
    console.log('5️⃣  Testing skin analysis structured output...')
    
    const skinAnalysisPrompt = `Analyze this facial image for skin concerns. Provide a structured assessment:

1. Skin Type (oily/dry/combination/normal)
2. Visible Concerns (list any: wrinkles, spots, pores, redness, texture issues)
3. Severity Level for each concern (low/medium/high)
4. Overall Skin Score (0-100, where 100 is perfect skin)
5. Confidence in your analysis (0-100%)

Format your response as JSON.`

    const skinStartTime = Date.now()
    
    const skinResult = await model.generateContent([skinAnalysisPrompt, imagePart])
    const skinResponse = skinResult.response
    
    const skinEndTime = Date.now()
    const skinProcessingTime = skinEndTime - skinStartTime

    console.log(`✅ Skin analysis successful!`)
    console.log(`   Processing time: ${skinProcessingTime}ms`)
    console.log(`   Structured output:`)
    console.log(`   ${skinResponse.text()}`)
    console.log('')

    // Step 6: Calculate average metrics
    const avgProcessingTime = Math.round((textProcessingTime + visionProcessingTime + skinProcessingTime) / 3)

    // Summary
    console.log('━'.repeat(60))
    console.log('🎉 All Gemini API tests passed!')
    console.log('━'.repeat(60))
    console.log('')
    console.log('✅ Text Generation: Working')
    console.log('✅ Vision Analysis: Working')
    console.log('✅ Skin Analysis: Working')
    console.log('')
    console.log('📊 Performance Metrics:')
    console.log(`   - Text generation: ${textProcessingTime}ms`)
    console.log(`   - Vision analysis: ${visionProcessingTime}ms`)
    console.log(`   - Skin analysis: ${skinProcessingTime}ms`)
    console.log(`   - Average: ${avgProcessingTime}ms`)
    console.log('')
    console.log('💰 Pricing & Limits:')
    console.log('   - Free tier: 1,500 requests/day')
    console.log('   - Rate limit: 15 RPM (requests per minute)')
    console.log('   - Model: gemini-2.0-flash-exp')
    console.log('')
    console.log('📝 Comparison with other services:')
    console.log('   - Hugging Face: ~8,100ms (27% slower than claimed)')
    console.log('   - Google Vision: ~683ms (face detection only)')
    console.log(`   - Gemini 2.0 Flash: ~${avgProcessingTime}ms (this test)`)
    console.log('')
    console.log('🎯 Next steps:')
    console.log('   - Integrate Gemini into hybrid analyzer fallback chain')
    console.log('   - Test with real face images for accuracy validation')
    console.log('   - Implement rate limiting (15 RPM max)')
    console.log('   - Add error handling for quota exceeded scenarios')
    console.log('')

    // Return metrics for potential JSON output
    return {
      success: true,
      metrics: {
        textGenerationMs: textProcessingTime,
        visionAnalysisMs: visionProcessingTime,
        skinAnalysisMs: skinProcessingTime,
        averageMs: avgProcessingTime
      },
      model: 'gemini-2.0-flash-exp',
      freeLimit: '1,500 requests/day',
      rateLimit: '15 RPM'
    }

  } catch (error: any) {
    console.error('\n❌ Gemini API test failed!')
    console.error('')
    
    if (error.message?.includes('API_KEY_INVALID')) {
      console.error('Error: Invalid API key')
      console.error('Get a new key at: https://aistudio.google.com/app/apikey')
    } else if (error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.error('Error: Quota exceeded')
      console.error('Free tier limit: 1,500 requests/day')
      console.error('Rate limit: 15 requests/minute')
    } else if (error.message?.includes('MODEL_NOT_FOUND')) {
      console.error('Error: Model not found')
      console.error('Check if gemini-2.0-flash-exp is still available')
    } else {
      console.error('Error details:', error.message)
      if (error.stack) {
        console.error('Stack:', error.stack)
      }
    }
    
    console.error('')
    process.exit(1)
  }
}

// Run test
console.log('')
console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║     Google Gemini 2.0 Flash API Integration Test          ║')
console.log('╚════════════════════════════════════════════════════════════╝')

testGeminiAPI()
  .then((result) => {
    console.log('✨ Test completed successfully\n')
    if (result) {
      console.log('📄 Test results available for processing')
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
