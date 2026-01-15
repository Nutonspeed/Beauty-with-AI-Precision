import type { AnalysisMode } from '../../types/analysis-mode';

/**
 * TypeScript Types for Skin Analysis System
 */

// Skin types
export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';

export type AIProvider = 'local' | 'huggingface' | 'google-vision' | 'gemini';

// Skin concerns
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

// Computer Vision analysis results
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

// AI analysis results
export interface AIAnalysisResult {
  skinType: SkinType;
  concerns: SkinConcern[];
  severity: Record<SkinConcern, number>; // 1-10
  recommendations: Array<{
    category: 'cleanser' | 'serum' | 'moisturizer' | 'program' | 'sunscreen';
    product: string;
    reason: string;
  }>;
  programPlan?: string;
  confidence: number;
}

// Combined (Hybrid) Analysis results
export interface HybridSkinAnalysis {
  // Basic Information
  id: string;
  userId: string;
  createdAt: Date;
  timestamp: Date; // Add timestamp property
  imageUrl: string;
  
  // AI Results
  ai: AIAnalysisResult;
  aiProvider: AIProvider;
  
  // Computer Vision Results
  cv: CVAnalysisResult;
  
  // Composite Score
  overallScore: {
    spots: number; // 1-10
    pores: number; // 1-10
    wrinkles: number; // 1-10
    texture: number; // 1-10
    redness: number; // 1-10
    pigmentation: number; // 1-10
  };
  
  // Percentiles (Compared to others)
  percentiles: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
    overall: number; // Add overall percentile
  };
  
  // Analysis Confidence
  confidence: number; // Add confidence property
  
  // Skin Care Recommendations
  recommendations: string[]; // Add recommendations property
  
  // Annotated Images
  annotatedImages: {
    spots?: string;
    pores?: string;
    wrinkles?: string;
    redness?: string;
    combined?: string;
  };
  
  // 3D Face Mesh data
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

// Analysis settings
export interface AnalysisOptions {
  // Level of detail
  detailLevel: 'basic' | 'standard' | 'detailed';
  
  // Language
  language: 'th' | 'en';
  
  // Enable features
  features: {
    aiAnalysis: boolean;
    cvAnalysis: boolean;
    faceMesh: boolean;
    arSimulation: boolean;
  };
  
  // Additional options
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

  // Enable cache
  useCache?: boolean;
}

// Analysis history
export interface AnalysisHistory {
  analyses: HybridSkinAnalysis[];
  improvements: {
    parameter: string;
    change: number;
    period: string;
  }[];
  recommendations: string[];
}

// AR Program Simulation
export interface ProgramSimulation {
  programType: 'acne' | 'anti-aging' | 'brightening' | 'hydration';
  intensity: number; // 0-1
  beforeImage: string;
  afterImage: string;
  estimatedResults: {
    weeks: number;
    improvements: Record<SkinConcern, number>;
  };
}

// Export types for API Response
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
