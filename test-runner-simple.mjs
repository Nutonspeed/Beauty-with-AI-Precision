/**
 * Simple Test Runner (No Vite/Bundler Dependencies)
 * 
 * Manually runs tests for Tasks 5-7 to verify implementations
 */

import { analyzeRBXColors } from './lib/ai/color-separation.ts'
import { predictUVDamage } from './lib/ai/uv-predictor.ts'
import { analyzePorphyrins } from './lib/ai/porphyrin-detector.ts'

console.log('🧪 Starting Simple Test Runner...\n')

let passedTests = 0
let failedTests = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`)
    passedTests++
  } else {
    console.error(`❌ FAIL: ${message}`)
    failedTests++
  }
}

function createColoredImageData(width, height, color) {
  const data = new Uint8ClampedArray(width * height * 4)
  
  for (let i = 0; i < data.length; i += 4) {
    switch (color) {
      case 'red':
        data[i] = 200
        data[i + 1] = 80
        data[i + 2] = 80
        break
      case 'brown':
        data[i] = 140
        data[i + 1] = 100
        data[i + 2] = 70
        break
      default:
        data[i] = 150
        data[i + 1] = 120
        data[i + 2] = 100
    }
    data[i + 3] = 255
  }
  
  return { data, width, height }
}

async function testTask5_RBX() {
  console.log('\n📦 Testing Task 5: RBX Color Separation\n')
  
  try {
    const redImage = createColoredImageData(100, 100, 'red')
    const result = await analyzeRBXColors(redImage)
    
    assert(result.redAreas !== undefined, 'Should have redAreas')
    assert(result.brownSpots !== undefined, 'Should have brownSpots')
    assert(result.uvSpots !== undefined, 'Should have uvSpots')
    assert(result.redAreas.score >= 0 && result.redAreas.score <= 100, 'Red score in range 0-100')
    assert(result.redAreas.confidence > 0, 'Red confidence > 0')
    
    console.log(`   Red score: ${result.redAreas.score.toFixed(2)}`)
    console.log(`   Brown score: ${result.brownSpots.score.toFixed(2)}`)
    console.log(`   UV score: ${result.uvSpots.score.toFixed(2)}`)
  } catch (error) {
    console.error(`❌ Task 5 Error: ${error.message}`)
    failedTests++
  }
}

async function testTask6_UV() {
  console.log('\n📦 Testing Task 6: UV Spots Predictor\n')
  
  try {
    const youngResult = await predictUVDamage({
      age: 20,
      skinTone: 'light',
      sunExposureLevel: 'moderate'
    })
    
    const oldResult = await predictUVDamage({
      age: 60,
      skinTone: 'light',
      sunExposureLevel: 'moderate'
    })
    
    assert(youngResult.uvDamageScore !== undefined, 'Should have uvDamageScore')
    assert(youngResult.uvSpotsScore !== undefined, 'Should have uvSpotsScore')
    assert(oldResult.uvDamageScore > youngResult.uvDamageScore, 'Older age = higher UV damage')
    assert(youngResult.confidence >= 0 && youngResult.confidence <= 1, 'Confidence in range 0-1')
    assert(youngResult.futureRisk !== undefined, 'Should have future risk predictions')
    
    console.log(`   Young (age 20): ${youngResult.uvDamageScore.toFixed(2)}`)
    console.log(`   Old (age 60): ${oldResult.uvDamageScore.toFixed(2)}`)
    console.log(`   Risk level: ${youngResult.riskLevel}`)
  } catch (error) {
    console.error(`❌ Task 6 Error: ${error.message}`)
    failedTests++
  }
}

function testTask7_Porphyrins() {
  console.log('\n📦 Testing Task 7: Porphyrins Detector\n')
  
  try {
    const clearSkin = analyzePorphyrins({
      features: {
        acneCount: 2,
        acneClusterDensity: 0.1,
        poreDensity: 0.3,
        averagePoreSize: 0.2,
        congestedPoresPercent: 10,
        redAreasScore: 20,
        inflammationSpots: 1
      }
    })
    
    const acneSkin = analyzePorphyrins({
      features: {
        acneCount: 25,
        acneClusterDensity: 0.8,
        poreDensity: 0.7,
        averagePoreSize: 0.6,
        congestedPoresPercent: 60,
        redAreasScore: 70,
        inflammationSpots: 15
      }
    })
    
    assert(clearSkin.porphyrinScore !== undefined, 'Should have porphyrinScore')
    assert(clearSkin.acneSeverity !== undefined, 'Should have acneSeverity')
    assert(acneSkin.porphyrinScore > clearSkin.porphyrinScore, 'Acne skin = higher porphyrin score')
    assert(clearSkin.confidence >= 0 && clearSkin.confidence <= 1, 'Confidence in range 0-1')
    assert(clearSkin.recommendations.length > 0, 'Should have recommendations')
    
    console.log(`   Clear skin: ${clearSkin.porphyrinScore.toFixed(2)} (${clearSkin.acneSeverity})`)
    console.log(`   Acne skin: ${acneSkin.porphyrinScore.toFixed(2)} (${acneSkin.acneSeverity})`)
    console.log(`   Recommendations: ${clearSkin.recommendations.length} items`)
  } catch (error) {
    console.error(`❌ Task 7 Error: ${error.message}`)
    failedTests++
  }
}

async function runAllTests() {
  await testTask5_RBX()
  await testTask6_UV()
  testTask7_Porphyrins()
  
  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 Test Results:`)
  console.log(`   ✅ Passed: ${passedTests}`)
  console.log(`   ❌ Failed: ${failedTests}`)
  console.log(`   📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`)
  
  process.exit(failedTests > 0 ? 1 : 0)
}

runAllTests()
