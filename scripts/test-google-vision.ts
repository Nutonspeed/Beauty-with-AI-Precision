/**
 * Test Google Cloud Vision API
 * Verify face detection and image analysis capabilities
 * 
 * Current credits: ฿9,665.50 (as of Nov 2025)
 * Free tier: 1,000 requests/month for Face Detection
 */

import { ImageAnnotatorClient } from '@google-cloud/vision'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

async function testGoogleVisionAPI() {
  console.log('\n🧪 Testing Google Cloud Vision API Integration...\n')

  try {
    // Step 1: Check credentials file
    console.log('1️⃣  Checking credentials...')
    const credentialsPathRaw = (process.env.GOOGLE_APPLICATION_CREDENTIALS || '').replace(/^["']|["']$/g, '')
    const credentialsPath = credentialsPathRaw || resolve(process.cwd(), 'google-credentials.json')
    
    console.log(`   Looking for credentials at: ${credentialsPath}`)
    
    if (!existsSync(credentialsPath)) {
      console.error(`❌ Credentials file not found: ${credentialsPath}`)
      console.error(`   Current directory: ${process.cwd()}`)
      console.error(`   GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`)
      process.exit(1)
    }
    
    const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'))
    console.log(`✅ Credentials loaded`)
    console.log(`   Project: ${credentials.project_id}`)
    console.log(`   Client Email: ${credentials.client_email}\n`)

    // Step 2: Initialize client
    console.log('2️⃣  Initializing Vision API client...')
    const client = new ImageAnnotatorClient({
      keyFilename: credentialsPath
    })
    console.log('✅ Client initialized\n')

    // Step 3: Create test image (simple base64 encoded test)
    console.log('3️⃣  Preparing test image...')
    // Using a small test image data (1x1 pixel PNG for minimal API usage)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    console.log('✅ Test image prepared (1x1 pixel PNG)\n')

    // Step 4: Test Face Detection
    console.log('4️⃣  Testing Face Detection API...')
    const startTime = Date.now()
    
    const [result] = await client.faceDetection({
      image: { content: testImageBase64 }
    })
    
    const endTime = Date.now()
    const processingTime = endTime - startTime

    console.log(`✅ Face Detection API call successful!`)
    console.log(`   Processing time: ${processingTime}ms`)
    console.log(`   Faces detected: ${result.faceAnnotations?.length || 0}`)
    
    if (result.faceAnnotations && result.faceAnnotations.length > 0) {
      const face = result.faceAnnotations[0]
      console.log(`   - Joy likelihood: ${face.joyLikelihood}`)
      console.log(`   - Sorrow likelihood: ${face.sorrowLikelihood}`)
      console.log(`   - Anger likelihood: ${face.angerLikelihood}`)
      console.log(`   - Detection confidence: ${face.detectionConfidence}`)
    } else {
      console.log('   ℹ️  No faces detected in test image (expected for 1x1 pixel)')
    }
    console.log('')

    // Step 5: Test Label Detection (for general image analysis)
    console.log('5️⃣  Testing Label Detection API...')
    const [labelResult] = await client.labelDetection({
      image: { content: testImageBase64 }
    })

    console.log(`✅ Label Detection API call successful!`)
    console.log(`   Labels detected: ${labelResult.labelAnnotations?.length || 0}`)
    
    if (labelResult.labelAnnotations && labelResult.labelAnnotations.length > 0) {
      labelResult.labelAnnotations.slice(0, 3).forEach(label => {
        console.log(`   - ${label.description}: ${(label.score! * 100).toFixed(1)}%`)
      })
    }
    console.log('')

    // Step 6: Test with real face image if available
    console.log('6️⃣  Checking for real test images...')
    const testImagePaths = [
      resolve(process.cwd(), 'public/test-face.jpg'),
      resolve(process.cwd(), 'public/images/test-face.jpg'),
      resolve(process.cwd(), 'test-face.jpg')
    ]

    let realImageTested = false
    for (const imagePath of testImagePaths) {
      if (existsSync(imagePath)) {
        console.log(`   Found test image: ${imagePath}`)
        console.log('   Testing with real image...')
        
        const imageBuffer = readFileSync(imagePath)
        const [faceResult] = await client.faceDetection({
          image: { content: imageBuffer }
        })

        console.log(`   ✅ Faces detected: ${faceResult.faceAnnotations?.length || 0}`)
        
        if (faceResult.faceAnnotations && faceResult.faceAnnotations.length > 0) {
          const face = faceResult.faceAnnotations[0]
          console.log(`   Face Analysis:`)
          console.log(`     - Joy: ${face.joyLikelihood}`)
          console.log(`     - Sorrow: ${face.sorrowLikelihood}`)
          console.log(`     - Anger: ${face.angerLikelihood}`)
          console.log(`     - Surprise: ${face.surpriseLikelihood}`)
          console.log(`     - Confidence: ${face.detectionConfidence}`)
          console.log(`     - Bounding box: ${JSON.stringify(face.boundingPoly)}`)
        }
        
        realImageTested = true
        break
      }
    }

    if (!realImageTested) {
      console.log('   ℹ️  No real test images found')
      console.log('   💡 To test with real image, place a face photo at: public/test-face.jpg')
    }
    console.log('')

    // Summary
    console.log('━'.repeat(60))
    console.log('🎉 All Google Cloud Vision API tests passed!')
    console.log('━'.repeat(60))
    console.log('')
    console.log('✅ Face Detection API: Working')
    console.log('✅ Label Detection API: Working')
    console.log(`⏱️  Average processing time: ${processingTime}ms`)
    console.log('💰 Current credits: ฿9,665.50')
    console.log('📊 Free tier: 1,000 Face Detection requests/month')
    console.log('')
    console.log('📝 Next steps:')
    console.log('   - Add a real face image to public/test-face.jpg for full testing')
    console.log('   - Integrate with hybrid analyzer fallback system')
    console.log('   - Monitor API usage in Google Cloud Console')
    console.log('')

  } catch (error: any) {
    console.error('\n❌ Google Vision API test failed!')
    console.error('')
    
    if (error.code === 'ENOENT') {
      console.error('Error: Credentials file not found')
      console.error('Expected at: google-credentials.json')
    } else if (error.code === 7) {
      console.error('Error: Permission denied')
      console.error('Check if the service account has Vision API permissions')
    } else if (error.code === 'UNAUTHENTICATED') {
      console.error('Error: Authentication failed')
      console.error('Verify credentials file is valid')
    } else {
      console.error('Error details:', error.message)
      if (error.details) {
        console.error('Details:', error.details)
      }
    }
    
    console.error('')
    process.exit(1)
  }
}

// Run test
console.log('')
console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║     Google Cloud Vision API Integration Test              ║')
console.log('╚════════════════════════════════════════════════════════════╝')

testGoogleVisionAPI()
  .then(() => {
    console.log('✨ Test completed successfully\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
