/**
 * Google Cloud Vision API Service
 * ใช้สำหรับ face detection, validation, และ preprocessing
 */

import vision from '@google-cloud/vision';

// Initialize Google Cloud Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export interface FaceDetectionResult {
  hasFace: boolean;
  faceCount: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality: {
    isBlurry: boolean;
    isDark: boolean;
    confidence: number;
  };
  landmarks?: Array<{
    type: string;
    position: { x: number; y: number; z: number };
  }>;
}

/**
 * ตรวจจับใบหน้าในรูปภาพ
 */
export async function detectFace(imageBuffer: Buffer | string): Promise<FaceDetectionResult> {
  try {
    const [result] = await client.faceDetection(imageBuffer);
    const faces = result.faceAnnotations || [];

    if (faces.length === 0) {
      return {
        hasFace: false,
        faceCount: 0,
        quality: {
          isBlurry: false,
          isDark: false,
          confidence: 0,
        },
      };
    }

    const face = faces[0]; // ใช้ใบหน้าแรกที่เจอ
    const bounds = face.boundingPoly?.vertices;

    // คำนวณ bounding box
    let boundingBox;
    if (bounds && bounds.length >= 2) {
      const x = bounds[0].x || 0;
      const y = bounds[0].y || 0;
      const width = (bounds[1].x || 0) - x;
      const height = (bounds[2].y || 0) - y;
      boundingBox = { x, y, width, height };
    }

    // ตรวจสอบคุณภาพรูป
    const isBlurry = face.blurredLikelihood === 'LIKELY' || 
                     face.blurredLikelihood === 'VERY_LIKELY';
    const isDark = face.underExposedLikelihood === 'LIKELY' || 
                   face.underExposedLikelihood === 'VERY_LIKELY';

    // แปลง landmarks
    const landmarks = face.landmarks?.map(landmark => ({
      type: String(landmark.type || 'UNKNOWN'),
      position: {
        x: landmark.position?.x || 0,
        y: landmark.position?.y || 0,
        z: landmark.position?.z || 0,
      },
    }));

    return {
      hasFace: true,
      faceCount: faces.length,
      boundingBox,
      quality: {
        isBlurry,
        isDark,
        confidence: face.detectionConfidence || 0,
      },
      landmarks,
    };
  } catch (error) {
    console.error('Google Vision face detection error:', error);
    throw new Error('Failed to detect face with Google Vision');
  }
}

/**
 * ตรวจสอบความเหมาะสมของรูปภาพ
 */
export async function validateImage(imageBuffer: Buffer | string): Promise<{
  isValid: boolean;
  reason?: string;
}> {
  const faceResult = await detectFace(imageBuffer);

  if (!faceResult.hasFace) {
    return {
      isValid: false,
      reason: 'ไม่พบใบหน้าในรูป กรุณาถ่ายรูปใหม่',
    };
  }

  if (faceResult.faceCount > 1) {
    return {
      isValid: false,
      reason: 'พบใบหน้ามากกว่า 1 คน กรุณาถ่ายเฉพาะหน้าของคุณ',
    };
  }

  if (faceResult.quality.isBlurry) {
    return {
      isValid: false,
      reason: 'รูปภาพเบลอเกินไป กรุณาถ่ายใหม่',
    };
  }

  if (faceResult.quality.isDark) {
    return {
      isValid: false,
      reason: 'รูปภาพมืดเกินไป กรุณาถ่ายในที่มีแสงสว่างเพียงพอ',
    };
  }

  if (faceResult.quality.confidence < 0.7) {
    return {
      isValid: false,
      reason: 'คุณภาพรูปภาพไม่เพียงพอ กรุณาถ่ายใหม่',
    };
  }

  return { isValid: true };
}

/**
 * Crop รูปภาพให้เหลือแค่บริเวณใบหน้า
 */
export function getFaceCropCoordinates(faceResult: FaceDetectionResult): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  if (!faceResult.hasFace || !faceResult.boundingBox) {
    return null;
  }

  const { x, y, width, height } = faceResult.boundingBox;

  // เพิ่ม padding 20%
  const padding = 0.2;
  const paddedX = Math.max(0, x - width * padding);
  const paddedY = Math.max(0, y - height * padding);
  const paddedWidth = width * (1 + padding * 2);
  const paddedHeight = height * (1 + padding * 2);

  return {
    x: Math.round(paddedX),
    y: Math.round(paddedY),
    width: Math.round(paddedWidth),
    height: Math.round(paddedHeight),
  };
}
