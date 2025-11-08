/**
 * Demo: Retry Mechanism for AI Models
 * งาน 4: ตัวอย่างการใช้งาน retry logic
 */

import { retryWithBackoff, createUserErrorMessage } from '../retry-utils'

/**
 * ตัวอย่าง 1: Retry สำหรับ API call ที่ล้มเหลว
 */
async function demoAPIRetry() {
  console.log('=== ตัวอย่าง 1: API Retry ===')
  
  let attemptCount = 0
  
  const result = await retryWithBackoff(
    async () => {
      attemptCount++
      
      // จำลอง API ที่ล้มเหลว 2 ครั้งแรก
      if (attemptCount < 3) {
        throw new Error('Network error: Failed to fetch')
      }
      
      return { data: 'Success!', timestamp: Date.now() }
    },
    {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        console.log(`  🔄 Retry ${attempt}: ${error.message}`)
      },
    }
  )
  
  if (result.success) {
    console.log(`  ✅ Success after ${result.attempts} attempts (${result.totalTime}ms)`)
    console.log(`  📊 Data:`, result.data)
  } else {
    console.log(`  ❌ Failed after ${result.attempts} attempts`)
    console.log(`  ⚠️  Error:`, result.error?.message)
  }
}

/**
 * ตัวอย่าง 2: User-friendly error message
 */
async function demoUserErrorMessage() {
  console.log('\n=== ตัวอย่าง 2: User Error Message ===')
  
  const scenarios = [
    { error: new Error('Network error: Failed to fetch'), model: 'Face Detection' },
    { error: new Error('Request timeout after 30s'), model: 'MediaPipe' },
    { error: new Error('Failed to load model weights'), model: 'TensorFlow' },
    { error: new Error('WebGL backend not available'), model: 'DeepLab' },
  ]
  
  for (const { error, model } of scenarios) {
    const message = createUserErrorMessage(model, error, 3)
    console.log(`\n  ${message}`)
  }
}

/**
 * ตัวอย่าง 3: Conditional retry (skip certain errors)
 */
async function demoConditionalRetry() {
  console.log('\n=== ตัวอย่าง 3: Conditional Retry ===')
  
  // ไม่ retry สำหรับ authentication error
  const result = await retryWithBackoff(
    async () => {
      throw new Error('401 Unauthorized: Invalid API token')
    },
    {
      maxAttempts: 3,
      delayMs: 500,
      shouldRetry: (error) => {
        // ไม่ retry ถ้าเป็น auth error
        return !error.message.includes('401') && !error.message.includes('Unauthorized')
      },
      onRetry: (attempt, error) => {
        console.log(`  🔄 Retry ${attempt}: ${error.message}`)
      },
    }
  )
  
  console.log(`  ⏭️  Skipped retry for auth error (${result.attempts} attempt)`)
}

/**
 * ตัวอย่าง 4: Face Detection with retry
 */
async function demoFaceDetectionRetry() {
  console.log('\n=== ตัวอย่าง 4: Face Detection Retry ===')
  
  let attemptCount = 0
  
  const result = await retryWithBackoff(
    async () => {
      attemptCount++
      console.log(`  📸 Attempt ${attemptCount}: Detecting face...`)
      
      // จำลอง MediaPipe ที่ล้มเหลวครั้งแรก
      if (attemptCount === 1) {
        throw new Error('MediaPipe: Face mesh not loaded')
      }
      
      // สำเร็จครั้งที่ 2
      return {
        landmarks: 468,
        confidence: 0.95,
        boundingBox: { x: 100, y: 50, width: 200, height: 250 },
      }
    },
    {
      maxAttempts: 3,
      delayMs: 500,
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        console.log(`  ⚠️  Retry ${attempt}: ${error.message}`)
      },
    }
  )
  
  if (result.success) {
    console.log(`  ✅ Face detected! (${result.attempts} attempts, ${result.totalTime}ms)`)
    console.log(`  📊 Confidence: ${result.data?.confidence}`)
  }
}

/**
 * รัน demo ทั้งหมด
 */
export async function runRetryDemo() {
  console.log('🎯 Retry Mechanism Demo\n')
  
  await demoAPIRetry()
  await demoUserErrorMessage()
  await demoConditionalRetry()
  await demoFaceDetectionRetry()
  
  console.log('\n✅ Demo completed!')
}

// เรียกใช้ demo (uncomment เพื่อทดสอบ)
// runRetryDemo().catch(console.error)
