/**
 * Concern Education System - Types and Utilities
 * Educational content for all skin concerns with multilingual support
 */

export type ConcernType =
  | 'acne'
  | 'wrinkles'
  | 'dark_spots'
  | 'large_pores'
  | 'redness'
  | 'texture'
  | 'dullness'
  | 'fine_lines'
  | 'blackheads'
  | 'hyperpigmentation'
  | 'spots'
  | 'pores';

export interface ConcernDefinition {
  en: string;
  th: string;
}

export interface TreatmentLevel {
  description: string;
  options: string[];
}

export interface ConcernMyth {
  myth: string;
  fact: string;
}

export interface DailyRoutine {
  morning: string[];
  evening: string[];
  weekly?: string[];
}

export interface ConcernEducation {
  type: ConcernType;
  icon: string;
  color: string;
  definition: ConcernDefinition;
  causes: string[];
  prevention: string[];
  treatment: {
    [key: string]: TreatmentLevel; // mild, moderate, severe, or custom levels
  };
  whenToSeeDermatologist: string[];
  relatedConcerns: string[];
  visualExamples: string[];
  statistics?: Record<string, string>;
  myths?: ConcernMyth[];
  dailyRoutine?: DailyRoutine;
  ingredients?: Record<string, string[]>;
  [key: string]: any; // Allow additional custom properties
}

export interface ConcernLocation {
  x: number; // 0-1 normalized coordinates
  y: number; // 0-1 normalized coordinates
  radius?: number; // Optional radius for circular markers
  confidence: number; // 0-1
  severity?: 'low' | 'medium' | 'high';
}

export interface InteractiveConcern {
  type: ConcernType;
  locations: ConcernLocation[];
  count: number;
  averageSeverity: number; // 1-10
  education: ConcernEducation;
}

export interface MarkerInteraction {
  concernType: ConcernType;
  location: ConcernLocation;
  timestamp: number;
}

// Helper function to get concern education data
export async function getConcernEducation(
  concernType: ConcernType
): Promise<ConcernEducation | null> {
  try {
    const response = await fetch(`/data/concerns/${concernType}.json`);
    if (!response.ok) {
      console.warn(`No education data found for concern: ${concernType}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load concern education for ${concernType}:`, error);
    return null;
  }
}

// Helper function to get multiple concerns
export async function getMultipleConcernEducation(
  concernTypes: ConcernType[]
): Promise<Map<ConcernType, ConcernEducation>> {
  const educationMap = new Map<ConcernType, ConcernEducation>();
  
  const results = await Promise.allSettled(
    concernTypes.map(type => getConcernEducation(type))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      educationMap.set(concernTypes[index], result.value);
    }
  });

  return educationMap;
}

// Get severity level name from score
export function getSeverityLevel(score: number): string {
  if (score <= 3) return 'mild';
  if (score <= 6) return 'moderate';
  return 'severe';
}

// Get severity level for wrinkles (different naming)
export function getWrinkleSeverityLevel(score: number): string {
  if (score <= 3) return 'fine_lines';
  if (score <= 6) return 'moderate';
  return 'severe';
}

// Get severity color
export function getSeverityColor(severity: 'low' | 'medium' | 'high' | number): string {
  if (typeof severity === 'number') {
    if (severity <= 3) return '#22c55e'; // green
    if (severity <= 6) return '#f59e0b'; // amber
    return '#ef4444'; // red
  }
  
  switch (severity) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    default:
      return '#6b7280'; // gray
  }
}

// Format concern type for display
export function formatConcernType(type: ConcernType): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Map analysis concern types to education concern types
export function mapAnalysisConcern(analysisType: string): ConcernType | null {
  const mapping: Record<string, ConcernType> = {
    'acne': 'acne',
    'wrinkle': 'wrinkles',
    'wrinkles': 'wrinkles',
    'fine_lines': 'fine_lines',
    'pigmentation': 'dark_spots',
    'dark_spots': 'dark_spots',
    'spots': 'dark_spots',
    'hyperpigmentation': 'hyperpigmentation',
    'pore': 'large_pores',
    'pores': 'large_pores',
    'large_pores': 'large_pores',
    'redness': 'redness',
    'texture': 'texture',
    'dullness': 'dullness',
    'blackheads': 'blackheads',
  };

  return mapping[analysisType.toLowerCase()] || null;
}

// Convert CV analysis results to interactive concerns
export function convertToInteractiveConcerns(
  cvAnalysis: any,
  aiConcerns?: string[]
): InteractiveConcern[] {
  const concerns: InteractiveConcern[] = [];

  // Process spots
  if (cvAnalysis.spots && cvAnalysis.spots.locations) {
    concerns.push({
      type: 'dark_spots',
      locations: cvAnalysis.spots.locations.map((loc: any) => ({
        x: loc.x,
        y: loc.y,
        radius: loc.radius,
        confidence: 0.85,
        severity: getSeverityFromScore(cvAnalysis.spots.severity),
      })),
      count: cvAnalysis.spots.count,
      averageSeverity: cvAnalysis.spots.severity,
      education: {} as ConcernEducation, // Will be populated by component
    });
  }

  // Process wrinkles
  if (cvAnalysis.wrinkles && cvAnalysis.wrinkles.locations) {
    concerns.push({
      type: 'wrinkles',
      locations: cvAnalysis.wrinkles.locations.map((loc: any) => ({
        x: (loc.x1 + loc.x2) / 2,
        y: (loc.y1 + loc.y2) / 2,
        confidence: 0.82,
        severity: getSeverityFromScore(cvAnalysis.wrinkles.severity),
      })),
      count: cvAnalysis.wrinkles.count,
      averageSeverity: cvAnalysis.wrinkles.severity,
      education: {} as ConcernEducation,
    });
  }

  // Process pores
  if (cvAnalysis.pores) {
    concerns.push({
      type: 'large_pores',
      locations: [], // Pores are more diffuse, no specific locations
      count: cvAnalysis.pores.enlargedCount || 0,
      averageSeverity: cvAnalysis.pores.severity,
      education: {} as ConcernEducation,
    });
  }

  // Process redness
  if (cvAnalysis.redness && cvAnalysis.redness.areas) {
    concerns.push({
      type: 'redness',
      locations: cvAnalysis.redness.areas.map((area: any) => ({
        x: area.x + area.width / 2,
        y: area.y + area.height / 2,
        confidence: 0.80,
        severity: getSeverityFromScore(cvAnalysis.redness.severity),
      })),
      count: cvAnalysis.redness.areas.length,
      averageSeverity: cvAnalysis.redness.severity,
      education: {} as ConcernEducation,
    });
  }

  // Process texture
  if (cvAnalysis.texture) {
    concerns.push({
      type: 'texture',
      locations: [],
      count: 0,
      averageSeverity: cvAnalysis.texture.score || cvAnalysis.texture.roughness,
      education: {} as ConcernEducation,
    });
  }

  // Add AI concerns without specific locations
  if (aiConcerns && aiConcerns.length > 0) {
    aiConcerns.forEach(concern => {
      const concernType = mapAnalysisConcern(concern);
      if (concernType && !concerns.find(c => c.type === concernType)) {
        concerns.push({
          type: concernType,
          locations: [],
          count: 0,
          averageSeverity: 5, // Default medium severity
          education: {} as ConcernEducation,
        });
      }
    });
  }

  return concerns;
}

function getSeverityFromScore(score: number): 'low' | 'medium' | 'high' {
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
}

// Get treatment recommendations based on severity
export function getTreatmentRecommendations(
  concernType: ConcernType,
  severity: number,
  education: ConcernEducation
): string[] {
  const severityKey = getSeverityLevel(severity);
  
  // Special case for wrinkles
  if (concernType === 'wrinkles') {
    const wrinkleKey = getWrinkleSeverityLevel(severity);
    return education.treatment[wrinkleKey]?.options || [];
  }
  
  return education.treatment[severityKey]?.options || [];
}

// Calculate overall skin health score
export function calculateSkinHealthScore(concerns: InteractiveConcern[]): number {
  if (concerns.length === 0) return 100;
  
  const totalSeverity = concerns.reduce((sum, c) => sum + c.averageSeverity, 0);
  const averageSeverity = totalSeverity / concerns.length;
  
  // Convert severity (1-10) to health score (100-0)
  // Severity 1 = 100, Severity 10 = 10
  return Math.max(10, Math.min(100, 110 - averageSeverity * 10));
}

// Get priority concerns (highest severity)
export function getPriorityConcerns(
  concerns: InteractiveConcern[],
  limit: number = 3
): InteractiveConcern[] {
  return [...concerns]
    .sort((a, b) => b.averageSeverity - a.averageSeverity)
    .slice(0, limit);
}
