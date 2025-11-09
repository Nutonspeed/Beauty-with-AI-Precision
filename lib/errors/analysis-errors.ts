/**
 * Analysis Error Types and Messages
 * Provides user-friendly error handling for skin analysis operations
 */

export class AnalysisError extends Error {
  constructor(
    public code: string,
    public userMessage: { th: string; en: string },
    public technicalMessage: string,
    public retryable: boolean = false,
    public statusCode: number = 500
  ) {
    super(technicalMessage)
    this.name = 'AnalysisError'
  }

  getUserMessage(locale: 'th' | 'en' = 'en'): string {
    return this.userMessage[locale]
  }
}

// Error codes and definitions
export const ANALYSIS_ERRORS = {
  // Image validation errors
  IMAGE_TOO_LARGE: new AnalysisError(
    'IMAGE_TOO_LARGE',
    {
      th: 'รูปภาพมีขนาดใหญ่เกินไป กรุณาเลือกรูปที่เล็กกว่า 10MB',
      en: 'Image size exceeds 10MB limit. Please choose a smaller image.',
    },
    'Image size exceeds maximum allowed size of 10MB',
    true,
    400
  ),

  IMAGE_INVALID_FORMAT: new AnalysisError(
    'IMAGE_INVALID_FORMAT',
    {
      th: 'รูปภาพไม่ถูกต้อง กรุณาเลือกไฟล์ JPG, PNG, หรือ WebP',
      en: 'Invalid image format. Please use JPG, PNG, or WebP.',
    },
    'Image format not supported',
    true,
    400
  ),

  IMAGE_CORRUPTED: new AnalysisError(
    'IMAGE_CORRUPTED',
    {
      th: 'รูปภาพเสียหาย กรุณาเลือกรูปภาพอื่น',
      en: 'Image file is corrupted. Please choose another image.',
    },
    'Unable to process corrupted image file',
    true,
    400
  ),

  // Face detection errors
  FACE_NOT_DETECTED: new AnalysisError(
    'FACE_NOT_DETECTED',
    {
      th: 'ไม่พบใบหน้าในรูปภาพ กรุณาถ่ายรูปใหม่ให้ชัดเจนและมีแสงสว่างเพียงพอ',
      en: 'No face detected in image. Please take a clear photo with good lighting.',
    },
    'Face detection failed - no faces found in image',
    true,
    400
  ),

  MULTIPLE_FACES_DETECTED: new AnalysisError(
    'MULTIPLE_FACES_DETECTED',
    {
      th: 'พบใบหน้ามากกว่า 1 คน กรุณาถ่ายรูปเฉพาะใบหน้าเดียว',
      en: 'Multiple faces detected. Please take a photo with only one face.',
    },
    'Multiple faces detected in image - expected single face',
    true,
    400
  ),

  FACE_TOO_SMALL: new AnalysisError(
    'FACE_TOO_SMALL',
    {
      th: 'ใบหน้าเล็กเกินไป กรุณาถ่ายรูปให้ใกล้ขึ้น',
      en: 'Face is too small. Please take a closer photo.',
    },
    'Face region too small for accurate analysis',
    true,
    400
  ),

  // Image quality errors
  IMAGE_TOO_DARK: new AnalysisError(
    'IMAGE_TOO_DARK',
    {
      th: 'รูปภาพมืดเกินไป กรุณาถ่ายในที่ที่มีแสงสว่างเพียงพอ',
      en: 'Image is too dark. Please take photo in better lighting.',
    },
    'Image brightness below minimum threshold',
    true,
    400
  ),

  IMAGE_TOO_BLURRY: new AnalysisError(
    'IMAGE_TOO_BLURRY',
    {
      th: 'รูปภาพเบลอเกินไป กรุณาถ่ายรูปใหม่ให้ชัดเจน',
      en: 'Image is too blurry. Please take a sharper photo.',
    },
    'Image quality insufficient - excessive blur detected',
    true,
    400
  ),

  // Analysis processing errors
  ANALYSIS_TIMEOUT: new AnalysisError(
    'ANALYSIS_TIMEOUT',
    {
      th: 'การวิเคราะห์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
      en: 'Analysis timed out. Please try again.',
    },
    'Analysis processing exceeded maximum timeout of 60 seconds',
    true,
    504
  ),

  AI_MODEL_ERROR: new AnalysisError(
    'AI_MODEL_ERROR',
    {
      th: 'เกิดข้อผิดพลาดในระบบ AI กรุณาลองใหม่อีกครั้ง',
      en: 'AI processing error. Please try again.',
    },
    'AI model execution failed',
    true,
    500
  ),

  INSUFFICIENT_CONFIDENCE: new AnalysisError(
    'INSUFFICIENT_CONFIDENCE',
    {
      th: 'ระบบไม่มั่นใจในผลการวิเคราะห์ กรุณาถ่ายรูปใหม่ในสภาพแสงที่ดีกว่า',
      en: 'Analysis confidence too low. Please take a clearer photo with better lighting.',
    },
    'Analysis confidence level below minimum threshold',
    true,
    400
  ),

  // Database errors
  DATABASE_ERROR: new AnalysisError(
    'DATABASE_ERROR',
    {
      th: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      en: 'Unable to save data. Please try again.',
    },
    'Database operation failed',
    true,
    500
  ),

  DUPLICATE_ANALYSIS: new AnalysisError(
    'DUPLICATE_ANALYSIS',
    {
      th: 'มีการวิเคราะห์รูปภาพนี้แล้ว',
      en: 'This image has already been analyzed.',
    },
    'Duplicate analysis detected for same image',
    false,
    409
  ),

  // Authentication errors
  UNAUTHORIZED: new AnalysisError(
    'UNAUTHORIZED',
    {
      th: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
      en: 'Please sign in to continue.',
    },
    'User authentication required',
    false,
    401
  ),

  PERMISSION_DENIED: new AnalysisError(
    'PERMISSION_DENIED',
    {
      th: 'คุณไม่มีสิทธิ์ในการใช้งานฟีเจอร์นี้',
      en: 'You do not have permission to use this feature.',
    },
    'Insufficient permissions for this operation',
    false,
    403
  ),

  QUOTA_EXCEEDED: new AnalysisError(
    'QUOTA_EXCEEDED',
    {
      th: 'คุณใช้งานครบจำนวนครั้งที่กำหนดแล้ว กรุณาอัพเกรดแพ็กเกจ',
      en: 'You have reached your usage limit. Please upgrade your plan.',
    },
    'User has exceeded analysis quota for current billing period',
    false,
    429
  ),

  // Network errors
  UPLOAD_FAILED: new AnalysisError(
    'UPLOAD_FAILED',
    {
      th: 'ไม่สามารถอัปโหลดรูปภาพได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      en: 'Upload failed. Please check your internet connection.',
    },
    'Image upload to storage failed',
    true,
    503
  ),

  NETWORK_ERROR: new AnalysisError(
    'NETWORK_ERROR',
    {
      th: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต',
      en: 'Network error. Please check your internet connection.',
    },
    'Network request failed',
    true,
    503
  ),

  // Generic errors
  UNKNOWN_ERROR: new AnalysisError(
    'UNKNOWN_ERROR',
    {
      th: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาติดต่อฝ่ายสนับสนุน',
      en: 'An unknown error occurred. Please contact support.',
    },
    'Unknown error',
    false,
    500
  ),
} as const

// Helper function to get error by code
export function getAnalysisError(code: string): AnalysisError {
  const error = ANALYSIS_ERRORS[code as keyof typeof ANALYSIS_ERRORS]
  if (!error) {
    return ANALYSIS_ERRORS.UNKNOWN_ERROR
  }
  return error
}

// Helper function to determine if error is retryable
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AnalysisError) {
    return error.retryable
  }
  return false
}

// Helper to convert generic errors to AnalysisError
export function toAnalysisError(error: unknown): AnalysisError {
  if (error instanceof AnalysisError) {
    return error
  }

  if (error instanceof Error) {
    // Try to match error message to known error types
    const message = error.message.toLowerCase()

    if (message.includes('timeout')) {
      return ANALYSIS_ERRORS.ANALYSIS_TIMEOUT
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ANALYSIS_ERRORS.NETWORK_ERROR
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return ANALYSIS_ERRORS.UNAUTHORIZED
    }
    if (message.includes('permission') || message.includes('403')) {
      return ANALYSIS_ERRORS.PERMISSION_DENIED
    }
    if (message.includes('database') || message.includes('db')) {
      return ANALYSIS_ERRORS.DATABASE_ERROR
    }
  }

  return ANALYSIS_ERRORS.UNKNOWN_ERROR
}
