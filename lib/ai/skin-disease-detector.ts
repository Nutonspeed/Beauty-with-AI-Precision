// Skin Disease Detection System
// Now uses REAL AI APIs instead of mock data

import { RealSkinDiseaseDetector } from './real-skin-detector';

// For backward compatibility, keep the same interface
export class SkinDiseaseDetector extends RealSkinDiseaseDetector {
  constructor() {
    super();
  }
}

export interface SkinCondition {
  id: string;
  name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  recommendedProducts?: string[];
  whenToSeeDermatologist: string;
}

export interface AnalysisResult {
  detectedConditions: SkinCondition[];
  primaryCondition: SkinCondition | null;
  skinType: SkinType;
  skinConcerns: string[];
  overallSkinHealth: number; // 0-100
  recommendations: string[];
  imageQuality: ImageQuality;
  timestamp: number;
}

export interface ImageQuality {
  score: number; // 0-100
  issues: string[];
  lighting: 'poor' | 'fair' | 'good' | 'excellent';
  resolution: 'low' | 'medium' | 'high';
  clarity: 'blurry' | 'acceptable' | 'clear';
}

export type SkinType =
  | 'normal'
  | 'dry'
  | 'oily'
  | 'combination'
  | 'sensitive';
