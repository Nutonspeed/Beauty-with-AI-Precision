/**
 * Retry Utilities for AI Models
 * Provides retry mechanism with exponential backoff for all AI operations
 * งาน 4: Error Handling + Retry Logic
 */

export interface RetryOptions {
  maxAttempts?: number
  delayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: Error) => void
  shouldRetry?: (error: Error) => boolean
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalTime: number
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration
 * @returns Result with success status and data/error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
    shouldRetry = () => true,
  } = options

  const startTime = Date.now()
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fn()
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime: Date.now() - startTime,
      }
    } catch (error) {
      lastError = error as Error
      
      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        break
      }

      // Don't wait after last attempt
      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1)
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt, lastError)
        }

        console.warn(
          `⚠️ Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. Retrying in ${delay}ms...`
        )

        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // All attempts failed
  return {
    success: false,
    error: lastError,
    attempts: maxAttempts,
    totalTime: Date.now() - startTime,
  }
}

/**
 * Default retry configuration for AI models
 */
export const DEFAULT_AI_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    // Retry on network errors, timeouts, and temporary failures
    const retryableErrors = [
      'network',
      'timeout',
      'failed to fetch',
      'load',
      'initialize',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ]

    const errorMessage = error.message.toLowerCase()
    return retryableErrors.some((keyword) => errorMessage.includes(keyword))
  },
}

/**
 * Retry configuration for MediaPipe models
 */
export const MEDIAPIPE_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 3,
  delayMs: 500,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    const errorMessage = error.message.toLowerCase()
    return (
      errorMessage.includes('mediapipe') ||
      errorMessage.includes('face mesh') ||
      errorMessage.includes('detection') ||
      errorMessage.includes('load')
    )
  },
}

/**
 * Retry configuration for TensorFlow models
 */
export const TENSORFLOW_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    const errorMessage = error.message.toLowerCase()
    return (
      errorMessage.includes('tensorflow') ||
      errorMessage.includes('mobilenet') ||
      errorMessage.includes('deeplab') ||
      errorMessage.includes('webgl') ||
      errorMessage.includes('backend')
    )
  },
}

/**
 * Retry configuration for Hugging Face API
 */
export const HUGGINGFACE_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 3,
  delayMs: 2000,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    const errorMessage = error.message.toLowerCase()
    // Don't retry on authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return false
    }
    // Retry on rate limits, server errors, and timeouts
    return (
      errorMessage.includes('429') ||
      errorMessage.includes('503') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network')
    )
  },
}

/**
 * Create a user-friendly error message for AI failures
 */
export function createUserErrorMessage(
  modelName: string,
  error: Error,
  attempts: number
): string {
  const baseMessage = `❌ ${modelName} ไม่สามารถวิเคราะห์ได้หลังจากพยายาม ${attempts} ครั้ง`
  
  const errorType = error.message.toLowerCase()
  
  if (errorType.includes('network') || errorType.includes('fetch')) {
    return `${baseMessage}\n🌐 กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต`
  }
  
  if (errorType.includes('timeout')) {
    return `${baseMessage}\n⏱️ การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง`
  }
  
  if (errorType.includes('load') || errorType.includes('initialize')) {
    return `${baseMessage}\n📦 ไม่สามารถโหลด AI model ได้ กรุณารีเฟรชหน้าเว็บ`
  }
  
  if (errorType.includes('webgl') || errorType.includes('backend')) {
    return `${baseMessage}\n🎮 เบราว์เซอร์ไม่รองรับ WebGL กรุณาอัปเดตเบราว์เซอร์หรือเปลี่ยนเบราว์เซอร์`
  }
  
  return `${baseMessage}\n⚠️ ${error.message}`
}

/**
 * Log retry statistics for monitoring
 */
export function logRetryStats(
  modelName: string,
  result: RetryResult<unknown>
): void {
  if (result.success) {
    if (result.attempts > 1) {
      console.log(
        `✅ ${modelName} สำเร็จหลังจากพยายาม ${result.attempts} ครั้ง (${result.totalTime}ms)`
      )
    }
  } else {
    console.error(
      `❌ ${modelName} ล้มเหลวหลังจากพยายาม ${result.attempts} ครั้ง (${result.totalTime}ms)`,
      result.error
    )
  }
}
