/**
 * Mock Data and Helpers for Testing AI Pipeline
 */

export const mockLandmarks = Array.from({ length: 478 }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  z: Math.random() * 0.1,
}))

// Mock face detection result
export const mockFaceDetectionResult = {
  landmarks: mockLandmarks,
  boundingBox: {
    xMin: 0.2,
    yMin: 0.15,
    width: 0.6,
    height: 0.7,
  },
  confidence: 0.95,
  processingTime: 1656,
}

// Mock skin analysis result
export const mockSkinAnalysisResult = {
  overallScore: 55,
  visiaMetrics: {
    spots: 20,
    wrinkles: 15,
    texture: 25,
    pores: 20,
    uvSpots: 14,
    brownSpots: 20,
    redAreas: 10,
    porphyrins: 5,
  },
  concerns: [
    {
      type: "dark_spots",
      severity: 20,
      locations: [],
      confidence: 0.65,
    },
    {
      type: "wrinkles",
      severity: 15,
      locations: [],
      confidence: 0.75,
    },
  ],
  recommendations: [
    "Use sunscreen daily to prevent UV damage",
    "Apply retinol serum for anti-aging",
    "Moisturize twice daily for better hydration",
  ],
  processingTime: 362,
}

// Mock quality report
export const mockQualityReport = {
  score: 85,
  issues: [] as string[],
}

// Mock complete AI pipeline result
export const mockAIPipelineResult = {
  faceDetection: mockFaceDetectionResult,
  skinAnalysis: mockSkinAnalysisResult,
  qualityReport: mockQualityReport,
  totalProcessingTime: 2167,
  timestamp: new Date().toISOString(),
}

// Mock analysis results (API response format)
export const mockAnalysisResults = {
  overall_score: 55,
  image_url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/vAA=",
  metrics: {
    wrinkles: { score: 15, grade: "B", trend: "stable", description_en: "Minimal wrinkles detected", description_th: "พบร้อยรอยเล็กน้อย" },
    spots: { score: 20, grade: "C", trend: "increasing", description_en: "Moderate spots detected", description_th: "พบจุดด่างปานกลาง" },
    pores: { score: 20, grade: "C", trend: "stable", description_en: "Average pore size", description_th: "ขนาดรูขุมขนปานกลาง" },
    texture: { score: 25, grade: "C", trend: "stable", description_en: "Uneven skin texture", description_th: "ผิวไม่เรียบเนียน" },
    evenness: { score: 30, grade: "C", trend: "stable", description_en: "Moderate skin tone evenness", description_th: "ความเรียบเนียนของสีผิวปานกลาง" },
    firmness: { score: 35, grade: "B", trend: "stable", description_en: "Good skin firmness", description_th: "ความแน่นของผิวดี" },
    radiance: { score: 40, grade: "B", trend: "increasing", description_en: "Good skin radiance", description_th: "ผิวเปล่งปลั่งดี" },
    hydration: { score: 45, grade: "B", trend: "stable", description_en: "Well hydrated skin", description_th: "ผิวชุ่มชื้นดี" }
  },
  recommendations: ["Use sunscreen daily to prevent UV damage", "Apply retinol serum for anti-aging", "Moisturize twice daily for better hydration", "Consider professional facial treatments"],
  skin_type: "normal",
  age_estimate: 35,
  confidence: 95,
  aiData: mockAIPipelineResult,
}

// Helper: Wait for async operations
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper: Create mock file
export function createMockFile(name = "test-face.jpg", type = "image/jpeg"): File {
  const blob = new Blob(["mock file content"], { type })
  return new File([blob], name, { type })
}

// Helper: Create test image data URL
export function createTestImageDataUrl(): string {
  // Return a minimal valid base64 data URL for testing
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/vAA="
}
