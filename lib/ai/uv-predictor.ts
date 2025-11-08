/**
 * UV Spots Predictor - Task 6
 * ทำนาย UV damage จาก age, skin tone, sun exposure patterns
 * ใช้ ML-based scoring model แบบ VISIA UV Photography
 */

// ===================== Types =====================

export type SkinTone = 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark';
export type SunExposureLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'extreme';
export type GeographicRegion = 'tropical' | 'subtropical' | 'temperate' | 'northern';
export type SunscreenUsage = 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface UVPredictorInput {
  // User demographics
  age: number; // years
  skinTone: SkinTone;
  
  // Sun exposure patterns
  sunExposureLevel: SunExposureLevel;
  outdoorHoursPerDay?: number; // average hours/day
  sunscreenUsage?: SunscreenUsage;
  geographicRegion?: GeographicRegion;
  
  // Optional: detected features from image
  existingBrownSpots?: number; // 0-100 score from RBX
  skinTextureScore?: number; // 0-100 roughness
  wrinkleScore?: number; // 0-100
}

export interface UVPredictionResult {
  // UV damage prediction
  uvDamageScore: number; // 0-100: overall UV damage likelihood
  uvSpotsScore: number; // 0-100: invisible UV spots (visible under UV light)
  
  // Risk assessment
  riskLevel: RiskLevel;
  confidence: number; // 0-1
  
  // Breakdown by factors
  factors: {
    ageFactor: number; // 0-100: age contribution
    skinToneFactor: number; // 0-100: skin tone vulnerability
    exposureFactor: number; // 0-100: cumulative sun exposure
    protectionFactor: number; // 0-100: protection habits (higher = better protection)
  };
  
  // Predictions
  futureRisk: {
    in5Years: number; // 0-100: predicted damage in 5 years
    in10Years: number; // 0-100: predicted damage in 10 years
  };
  
  // Recommendations
  recommendations: string[]; // Thai language advice
  processingTime: number; // milliseconds
}

// ===================== Skin Tone Classification =====================

/**
 * Fitzpatrick Skin Type mapping
 * Type I-II: very-light, light (high UV sensitivity)
 * Type III-IV: medium, tan (moderate UV sensitivity)
 * Type V-VI: brown, dark (lower UV sensitivity, but still at risk)
 */
export const SKIN_TONE_UV_SENSITIVITY: Record<SkinTone, number> = {
  'very-light': 1, // Fitzpatrick I: burns easily, never tans
  'light': 0.9,    // Fitzpatrick II: burns easily, tans minimally
  'medium': 0.7,     // Fitzpatrick III: burns moderately, tans gradually
  'tan': 0.6,        // Fitzpatrick IV: burns minimally, tans easily
  'brown': 0.4,      // Fitzpatrick V: rarely burns, tans darkly
  'dark': 0.3,       // Fitzpatrick VI: never burns, deeply pigmented
};

/**
 * แปลง skin tone string → RGB estimate (for Fitzpatrick scale)
 */
export function skinToneToRGB(tone: SkinTone): { r: number; g: number; b: number } {
  const mapping: Record<SkinTone, { r: number; g: number; b: number }> = {
    'very-light': { r: 255, g: 240, b: 230 },
    'light': { r: 240, g: 220, b: 200 },
    'medium': { r: 220, g: 180, b: 160 },
    'tan': { r: 190, g: 150, b: 120 },
    'brown': { r: 140, g: 100, b: 70 },
    'dark': { r: 90, g: 60, b: 40 },
  };
  return mapping[tone];
}

// ===================== Sun Exposure Modeling =====================

/**
 * Annual UV exposure estimation (UV Index × hours × days)
 */
export const SUN_EXPOSURE_ANNUAL_UV: Record<SunExposureLevel, number> = {
  'minimal': 100,    // indoor work, minimal outdoor time
  'low': 500,        // occasional outdoor activities
  'moderate': 1500,  // regular outdoor work/recreation
  'high': 3000,      // outdoor work, frequent sun exposure
  'extreme': 5000,   // outdoor labor, tropical regions
};

/**
 * Geographic UV intensity multipliers
 */
export const GEOGRAPHIC_UV_MULTIPLIER: Record<GeographicRegion, number> = {
  'tropical': 1.5,     // Near equator (Thailand, SEA)
  'subtropical': 1.3,  // 20-35° latitude
  'temperate': 1,      // 35-55° latitude
  'northern': 0.7,     // > 55° latitude
};

// ===================== ML-Based Scoring Model =====================

/**
 * คำนวณ age factor (cumulative damage over time)
 * ยิ่งอายุมาก ยิ่งมีโอกาสเกิด UV damage สะสม
 */
function calculateAgeFactor(age: number): number {
  // Exponential aging curve: damage accelerates with age
  // Peak sensitivity at 40-60 years
  const normalized = Math.min(age / 80, 1); // normalize to 0-1
  const curve = Math.pow(normalized, 1.3); // slight exponential curve
  return Math.min(curve * 100, 100);
}

/**
 * คำนวณ skin tone factor (genetic UV vulnerability)
 */
function calculateSkinToneFactor(skinTone: SkinTone): number {
  const sensitivity = SKIN_TONE_UV_SENSITIVITY[skinTone];
  return sensitivity * 100; // 0-100 scale
}

/**
 * คำนวณ sun exposure factor (cumulative environmental exposure)
 */
function calculateExposureFactor(
  exposureLevel: SunExposureLevel,
  outdoorHours: number = 3,
  region: GeographicRegion = 'tropical'
): number {
  const baseExposure = SUN_EXPOSURE_ANNUAL_UV[exposureLevel];
  const geoMultiplier = GEOGRAPHIC_UV_MULTIPLIER[region];
  const hoursMultiplier = Math.min(outdoorHours / 8, 1.5); // cap at 1.5x
  
  const totalExposure = baseExposure * geoMultiplier * hoursMultiplier;
  
  // Normalize to 0-100 scale (5000 UV units = 100 score)
  return Math.min((totalExposure / 5000) * 100, 100);
}

/**
 * คำนวณ protection factor (sunscreen & protective habits)
 */
function calculateProtectionFactor(
  sunscreenUsage: SunscreenUsage = 'sometimes'
): number {
  const protectionScores = {
    'never': 0,       // 0% protection
    'rarely': 20,     // 20% protection
    'sometimes': 50,  // 50% protection
    'often': 80,      // 80% protection
    'always': 95,     // 95% protection
  };
  return protectionScores[sunscreenUsage];
}

/**
 * คำนวณ UV damage score จาก detected features
 */
function calculateFeatureBasedScore(
  brownSpots: number = 0,
  textureScore: number = 0,
  wrinkleScore: number = 0
): number {
  // Weighted average: brown spots มีน้ำหนักมากสุด
  const weighted =
    brownSpots * 0.5 +
    textureScore * 0.3 +
    wrinkleScore * 0.2;
  
  return Math.min(weighted, 100);
}

// ===================== Main Prediction Function =====================

/**
 * ทำนาย UV damage และ UV spots
 */
export async function predictUVDamage(input: UVPredictorInput): Promise<UVPredictionResult> {
  const startTime = performance.now();

  // Calculate individual factors
  const ageFactor = calculateAgeFactor(input.age);
  const skinToneFactor = calculateSkinToneFactor(input.skinTone);
  const exposureFactor = calculateExposureFactor(
    input.sunExposureLevel,
    input.outdoorHoursPerDay,
    input.geographicRegion
  );
  const protectionFactor = calculateProtectionFactor(input.sunscreenUsage);

  // Feature-based score (if image analysis available)
  const featureScore = calculateFeatureBasedScore(
    input.existingBrownSpots,
    input.skinTextureScore,
    input.wrinkleScore
  );

  // ML-based scoring model (weighted combination)
  // Formula: UV Damage = (Age × 0.25 + SkinTone × 0.2 + Exposure × 0.35) × (1 - Protection/100) + Features × 0.2
  const unprotectedScore =
    ageFactor * 0.25 +
    skinToneFactor * 0.2 +
    exposureFactor * 0.35 +
    featureScore * 0.2;

  const protectionMultiplier = 1 - protectionFactor / 100;
  const uvDamageScore = Math.min(unprotectedScore * protectionMultiplier, 100);

  // UV Spots score (invisible damage, typically 10-30% higher than visible damage)
  // UV light reveals hidden melanin that hasn't surfaced yet
  const uvSpotsScore = Math.min(uvDamageScore * 1.2, 100);

  // Risk level classification
  let riskLevel: RiskLevel;
  if (uvDamageScore < 25) riskLevel = 'low';
  else if (uvDamageScore < 50) riskLevel = 'moderate';
  else if (uvDamageScore < 75) riskLevel = 'high';
  else riskLevel = 'severe';

  // Confidence calculation (based on available data)
  const hasFeatureData = input.existingBrownSpots !== undefined;
  const hasCompleteInput =
    input.outdoorHoursPerDay !== undefined &&
    input.sunscreenUsage !== undefined &&
    input.geographicRegion !== undefined;
  
  let confidence = 0.7; // base confidence
  if (hasFeatureData) confidence += 0.15;
  if (hasCompleteInput) confidence += 0.15;

  // Future risk predictions (linear progression model)
  const yearlyProgression = exposureFactor * 0.03 * (1 - protectionFactor / 100);
  const in5Years = Math.min(uvDamageScore + yearlyProgression * 5, 100);
  const in10Years = Math.min(uvDamageScore + yearlyProgression * 10, 100);

  // Generate recommendations
  const recommendations = generateRecommendations(
    uvDamageScore,
    riskLevel,
    input.sunscreenUsage || 'sometimes',
    exposureFactor
  );

  const processingTime = performance.now() - startTime;

  return {
    uvDamageScore: Math.round(uvDamageScore * 10) / 10,
    uvSpotsScore: Math.round(uvSpotsScore * 10) / 10,
    riskLevel,
    confidence: Math.round(confidence * 100) / 100,
    factors: {
      ageFactor: Math.round(ageFactor * 10) / 10,
      skinToneFactor: Math.round(skinToneFactor * 10) / 10,
      exposureFactor: Math.round(exposureFactor * 10) / 10,
      protectionFactor: Math.round(protectionFactor * 10) / 10,
    },
    futureRisk: {
      in5Years: Math.round(in5Years * 10) / 10,
      in10Years: Math.round(in10Years * 10) / 10,
    },
    recommendations,
    processingTime: Math.round(processingTime * 10) / 10,
  };
}

// ===================== Recommendations Engine =====================

/**
 * สร้างคำแนะนำตามระดับความเสี่ยง (ภาษาไทย)
 */
function generateRecommendations(
  uvScore: number,
  riskLevel: RiskLevel,
  sunscreenUsage: SunscreenUsage,
  exposureFactor: number
): string[] {
  const recommendations: string[] = [];

  // Sunscreen recommendations
  if (sunscreenUsage === 'never' || sunscreenUsage === 'rarely') {
    recommendations.push('ใช้ครีมกันแดด SPF 50+ ทุกวัน แม้อยู่ในร้ม');
    recommendations.push('ทาครีมกันแดดซ้ำทุก 2-3 ชั่วโมง หากอยู่กลางแดด');
  } else if (sunscreenUsage === 'sometimes') {
    recommendations.push('เพิ่มความสม่ำเสมอในการใช้ครีมกันแดด SPF 50+');
  }

  // Risk-specific recommendations
  if (riskLevel === 'severe') {
    recommendations.push('ควรพบแพทย์ผิวหนัง เพื่อตรวจสอบความเสียหายจาก UV');
    recommendations.push('หลีกเลี่ยงแสงแดดช่วง 10:00-16:00 อย่างเคร่งครัด');
    recommendations.push('พิจารณาทำ laser treatment เพื่อลดรอยดำจาก UV');
  } else if (riskLevel === 'high') {
    recommendations.push('ลดการอยู่กลางแดดในช่วง 10:00-16:00');
    recommendations.push('สวมหมวกกว้างและแว่นกันแดด UV400 เมื่อออกแดด');
    recommendations.push('ใช้ผลิตภัณฑ์บำรุงที่มี Vitamin C และ Niacinamide');
  } else if (riskLevel === 'moderate') {
    recommendations.push('รักษาระดับการป้องกันแสงแดดให้สม่ำเสมอ');
    recommendations.push('ใช้ครีมบำรุงที่มีสารต้านอนุมูลอิสระ (antioxidants)');
  }

  // High exposure recommendations
  if (exposureFactor > 60) {
    recommendations.push('พิจารณาใช้เสื้อผ้าป้องกัน UV (UPF 50+)');
    recommendations.push('หาร้มเงาเมื่อต้องอยู่กลางแดดนาน');
  }

  // General recommendations
  if (uvScore > 30) {
    recommendations.push('ตรวจสอบผิวด้วย VISIA ทุก 6 เดือน เพื่อติดตามการเปลี่ยนแปลง');
  }

  recommendations.push('ดื่มน้ำเพียงพอและรับประทานผักผลไม้สีสด (ช่วยซ่อมแซมผิว)');

  return recommendations;
}

// ===================== Utility Functions =====================

/**
 * แปลง UV damage score → คำอธิบายภาษาไทย
 */
export function getUVDamageDescription(score: number): string {
  if (score < 25) return 'ความเสียหายจาก UV อยู่ในระดับต่ำ ผิวยังมีสุขภาพดี';
  if (score < 50) return 'มีความเสียหายจาก UV ปานกลาง ควรเริ่มป้องกันอย่างจริงจัง';
  if (score < 75) return 'ความเสียหายจาก UV สูง พบรอยดำและจุดด่างที่มองไม่เห็น';
  return 'ความเสียหายจาก UV รุนแรง ควรปรึกษาแพทย์ผิวหนังโดยเร็ว';
}

/**
 * แปลง risk level → สีแสดงผล
 */
export function getRiskLevelColor(riskLevel: RiskLevel): string {
  const colors = {
    low: '#4CAF50',      // Green
    moderate: '#FF9800', // Orange
    high: '#FF5722',     // Deep Orange
    severe: '#D32F2F',   // Red
  };
  return colors[riskLevel];
}

/**
 * สร้างสรุปข้อมูล UV prediction
 */
export function formatUVPredictionSummary(result: UVPredictionResult): string {
  return `
UV Damage Assessment:
━━━━━━━━━━━━━━━━━━━━
Overall Score: ${result.uvDamageScore.toFixed(1)}/100
UV Spots Score: ${result.uvSpotsScore.toFixed(1)}/100
Risk Level: ${result.riskLevel.toUpperCase()}
Confidence: ${(result.confidence * 100).toFixed(0)}%

Contributing Factors:
━━━━━━━━━━━━━━━━━━━━
Age Factor: ${result.factors.ageFactor.toFixed(1)}/100
Skin Tone Vulnerability: ${result.factors.skinToneFactor.toFixed(1)}/100
Sun Exposure: ${result.factors.exposureFactor.toFixed(1)}/100
Protection Level: ${result.factors.protectionFactor.toFixed(1)}/100

Future Risk Projection:
━━━━━━━━━━━━━━━━━━━━
In 5 years: ${result.futureRisk.in5Years.toFixed(1)}/100
In 10 years: ${result.futureRisk.in10Years.toFixed(1)}/100

Top Recommendations:
━━━━━━━━━━━━━━━━━━━━
${result.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n')}
  `.trim();
}
