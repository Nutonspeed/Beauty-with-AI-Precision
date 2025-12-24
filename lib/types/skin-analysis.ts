import type { AnalysisMode } from '../../types/analysis-mode';

/**
 * TypeScript Types for Skin Analysis System
 */

// ประเภทผิว
export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';

export type AIProvider = 'local' | 'huggingface' | 'google-vision' | 'gemini';

// ปัญหาผิว
export type SkinConcern = 
  | 'acne' 
  | 'wrinkles' 
  | 'dark_spots' 
  | 'large_pores' 
  | 'redness' 
  | 'dullness'
  | 'fine_lines'
  | 'blackheads'
  | 'hyperpigmentation'
  | 'spots'
  | 'pores'
  | 'texture';

// ผลการวิเคราะห์จาก Computer Vision
export interface CVAnalysisResult {
  spots: {
    count: number;
    locations: Array<{ x: number; y: number; radius: number }>;
    severity: number; // 1-10
  };
  pores: {
    averageSize: number;
    enlargedCount: number;
    severity: number; // 1-10
  };
  wrinkles: {
    count: number;
    locations: Array<{ x1: number; y1: number; x2: number; y2: number }>;
    severity: number; // 1-10
  };
  texture: {
    smoothness: number;
    roughness: number;
    score: number; // 1-10
  };
  redness: {
    percentage: number;
    areas: Array<{ x: number; y: number; width: number; height: number }>;
    severity: number; // 1-10
  };
}

// ผลการวิเคราะห์จาก AI
export interface AIAnalysisResult {
  skinType: SkinType;
  concerns: SkinConcern[];
  severity: Record<SkinConcern, number>; // 1-10
  recommendations: Array<{
    category: 'cleanser' | 'serum' | 'moisturizer' | 'treatment' | 'sunscreen';
    product: string;
    reason: string;
  }>;
  treatmentPlan?: string;
  confidence: number;
}

// ผลการวิเคราะห์แบบรวม (Hybrid)
export interface HybridSkinAnalysis {
  // ข้อมูลพื้นฐาน
  id: string;
  userId: string;
  createdAt: Date;
  timestamp: Date; // เพิ่ม timestamp property
  imageUrl: string;
  
  // ผลจาก AI
  ai: AIAnalysisResult;
  aiProvider: AIProvider;
  
  // ผลจาก Computer Vision
  cv: CVAnalysisResult;
  
  // คะแนนรวม (Composite Score)
  overallScore: {
    spots: number; // 1-10
    pores: number; // 1-10
    wrinkles: number; // 1-10
    texture: number; // 1-10
    redness: number; // 1-10
    pigmentation: number; // 1-10
  };
  
  // เปอร์เซ็นไทล์ (เทียบกับคนอื่น)
  percentiles: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
    overall: number; // เพิ่ม overall percentile
  };
  
  // ความมั่นใจของผลการวิเคราะห์
  confidence: number; // เพิ่ม confidence property
  
  // คำแนะนำสำหรับการดูแลผิว
  recommendations: string[]; // เพิ่ม recommendations property
  
  // รูปภาพที่มี annotation
  annotatedImages: {
    spots?: string;
    pores?: string;
    wrinkles?: string;
    redness?: string;
    combined?: string;
  };
  
  // ข้อมูล 3D Face Mesh
  faceMesh?: {
    landmarks: Array<{ x: number; y: number; z: number }>;
    topology: number[][];
  };

  // Phase 1: Image quality metrics for tracking
  qualityMetrics?: {
    lighting: number;
    blur: number;
    faceSize: number;
    overallQuality: number;
  };
}

// การตั้งค่าการวิเคราะห์
export interface AnalysisOptions {
  // ระดับความละเอียด
  detailLevel: 'basic' | 'standard' | 'detailed';
  
  // ภาษา
  language: 'th' | 'en';
  
  // เปิดใช้งาน features
  features: {
    aiAnalysis: boolean;
    cvAnalysis: boolean;
    faceMesh: boolean;
    arSimulation: boolean;
  };
  
  // ตัวเลือกเพิ่มเติม
  options?: {
    compareWithPrevious?: boolean;
    generateReport?: boolean;
    sendNotification?: boolean;
  };

  // Phase 1: Image quality metrics
  qualityMetrics?: {
    lighting: number; // 0-100
    blur: number; // 0-100
    faceSize: number; // 0-1
    overallQuality: number; // 0-100
  };

  mode?: AnalysisMode;

  // เปิดใช้งาน cache
  useCache?: boolean;

  // Clinic ID for rate limiting
  clinicId?: string;
}

// ประวัติการวิเคราะห์
export interface AnalysisHistory {
  analyses: HybridSkinAnalysis[];
  improvements: {
    parameter: string;
    change: number;
    period: string;
  }[];
  recommendations: string[];
}

// AR Treatment Simulation
export interface TreatmentSimulation {
  treatmentType: 'acne' | 'anti-aging' | 'brightening' | 'hydration';
  intensity: number; // 0-1
  beforeImage: string;
  afterImage: string;
  estimatedResults: {
    weeks: number;
    improvements: Record<SkinConcern, number>;
  };
}

// Export types สำหรับ API Response
export interface AnalyzeResponse {
  success: boolean;
  data?: HybridSkinAnalysis;
  error?: {
    code: string;
    message: string;
  };
}

export interface HistoryResponse {
  success: boolean;
  data?: AnalysisHistory;
  error?: {
    code: string;
    message: string;
  };
}
