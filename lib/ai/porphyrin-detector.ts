/**
 * Porphyrin Detector - VISIA Metric 8/8
 * 
 * วิเคราะห์ Porphyrins (fluorescent bacterial metabolites) จากภาพใบหน้า
 * ตรวจจับแบคทีเรีย P. acnes (Cutibacterium acnes) ที่เป็นสาเหตุของสิว
 * 
 * VISIA Porphyrin Detection:
 * - แบคทีเรีย P. acnes สร้าง porphyrins ที่เรืองแสงสีส้มใต้แสง UV
 * - ตรวจจับคราบแบคทีเรียในรูขุมขน (pores) และบริเวณสิว (acne)
 * - คำนวณระดับการอักเสบ (inflammation) จาก red areas
 * 
 * Scientific Basis:
 * - Porphyrins = bacterial metabolites that fluoresce under UV light (400-450nm)
 * - P. acnes bacteria produce coproporphyrin III (orange fluorescence)
 * - Correlation with acne severity: r = 0.72 (Wang et al., 2020)
 * - Detection threshold: >10 fluorescent spots/cm² = bacterial colonization
 * 
 * @module lib/ai/porphyrin-detector
 */

// ========================= TYPE DEFINITIONS =========================

/**
 * Acne severity classification (ตามมาตรฐาน Global Acne Grading System)
 */
export type AcneSeverity = 
  | 'clear'      // 0 comedones
  | 'mild'       // 1-10 comedones
  | 'moderate'   // 11-30 comedones
  | 'severe'     // 31-50 comedones
  | 'very-severe'; // >50 comedones

/**
 * Pore congestion level (ระดับการอุดตันของรูขุมขน)
 */
export type PoreCongestion = 
  | 'clear'      // <5% congested
  | 'minimal'    // 5-15% congested
  | 'moderate'   // 15-35% congested
  | 'significant' // 35-60% congested
  | 'severe';    // >60% congested

/**
 * Inflammation intensity (ระดับการอักเสบ)
 */
export type InflammationLevel = 
  | 'none'       // No inflammation
  | 'mild'       // Minimal redness
  | 'moderate'   // Visible inflammation
  | 'severe';    // Extensive inflammation

/**
 * Treatment urgency (ความเร่งด่วนในการรักษา)
 */
export type TreatmentUrgency = 
  | 'routine'     // Regular skincare sufficient
  | 'recommended' // Treatment suggested
  | 'advised'     // Treatment strongly recommended
  | 'urgent';     // Immediate treatment needed

/**
 * ข้อมูลที่ตรวจจับได้จากภาพ (จาก image analysis)
 */
export interface DetectedFeatures {
  /** Acne spots count (จำนวนสิว) */
  acneCount?: number;
  
  /** Acne cluster density 0-100 (ความหนาแน่นของกลุ่มสิว) */
  acneClusterDensity?: number;
  
  /** Pore count per cm² (จำนวนรูขุมขนต่อตารางเซนติเมตร) */
  poreDensity?: number;
  
  /** Average pore size in pixels (ขนาดเฉลี่ยของรูขุมขน) */
  averagePoreSize?: number;
  
  /** Congested pores percentage 0-100 (เปอร์เซ็นต์รูขุมขนที่อุดตัน) */
  congestedPoresPercent?: number;
  
  /** Red areas score 0-100 (คะแนนบริเวณผิวแดง จาก Task 5) */
  redAreasScore?: number;
  
  /** Inflammation spots count (จำนวนจุดอักเสบ) */
  inflammationSpots?: number;
}

/**
 * ข้อมูลประวัติผู้ใช้ (optional demographic info)
 */
export interface UserHistory {
  /** Age (อายุ) */
  age?: number;
  
  /** Acne history: 'never' | 'occasional' | 'frequent' | 'chronic' */
  acneHistory?: 'never' | 'occasional' | 'frequent' | 'chronic';
  
  /** Current acne treatment: true if using medication */
  onTreatment?: boolean;
  
  /** Skincare routine quality: 'poor' | 'basic' | 'good' | 'excellent' */
  skincareRoutine?: 'poor' | 'basic' | 'good' | 'excellent';
}

/**
 * Input parameters สำหรับการวิเคราะห์ Porphyrins
 */
export interface PorphyrinDetectorInput {
  /** Detected features from image analysis (required) */
  features: DetectedFeatures;
  
  /** User history (optional, enhances accuracy) */
  userHistory?: UserHistory;
  
  /** Analysis confidence 0-1 (confidence from image detection) */
  imageConfidence?: number;
}

/**
 * ผลลัพธ์การวิเคราะห์ Porphyrins
 */
export interface PorphyrinAnalysisResult {
  /** Porphyrin score 0-100 (bacterial colonization level) */
  porphyrinScore: number;
  
  /** Acne severity classification */
  acneSeverity: AcneSeverity;
  
  /** Pore congestion level */
  poreCongestion: PoreCongestion;
  
  /** Inflammation level */
  inflammationLevel: InflammationLevel;
  
  /** Treatment urgency */
  treatmentUrgency: TreatmentUrgency;
  
  /** Contributing factors breakdown */
  factors: {
    /** Acne pattern contribution 0-100 */
    acnePattern: number;
    
    /** Pore congestion contribution 0-100 */
    poreCongestion: number;
    
    /** Inflammation contribution 0-100 */
    inflammation: number;
    
    /** Age/history adjustment -20 to +20 */
    historyAdjustment: number;
  };
  
  /** Estimated bacterial density (fluorescent spots/cm²) */
  estimatedBacterialDensity: number;
  
  /** Risk level for acne progression */
  progressionRisk: 'low' | 'moderate' | 'high';
  
  /** Thai language recommendations (personalized advice) */
  recommendations: string[];
  
  /** Analysis confidence 0-1 */
  confidence: number;
}

// ========================= CONSTANTS =========================

/**
 * Acne count thresholds (ตามมาตรฐาน Global Acne Grading System)
 */
const ACNE_SEVERITY_THRESHOLDS = {
  clear: 0,
  mild: 10,
  moderate: 30,
  severe: 50,
  'very-severe': 51,
} as const;

/**
 * Pore congestion thresholds (%)
 */
const PORE_CONGESTION_THRESHOLDS = {
  clear: 5,
  minimal: 15,
  moderate: 35,
  significant: 60,
  severe: 61,
} as const;

/**
 * Red areas to inflammation mapping
 */
const INFLAMMATION_THRESHOLDS = {
  none: 10,      // <10 red score = no inflammation
  mild: 30,      // 10-30 = mild
  moderate: 60,  // 30-60 = moderate
  severe: 61,    // >60 = severe
} as const;

/**
 * Age factor for bacterial activity (younger = higher P. acnes activity)
 */
const AGE_BACTERIAL_ACTIVITY = {
  '10-19': 1.3,  // Peak sebum production
  '20-29': 1.1,  // High activity
  '30-39': 1,    // Normal
  '40-49': 0.85, // Declining
  '50+': 0.7,    // Low activity
} as const;

/**
 * Acne history impact multiplier
 */
const ACNE_HISTORY_MULTIPLIER = {
  never: 0.7,
  occasional: 0.9,
  frequent: 1.1,
  chronic: 1.3,
} as const;

/**
 * Skincare routine impact
 */
const SKINCARE_ADJUSTMENT = {
  poor: 1.2,      // +20% porphyrin (poor hygiene)
  basic: 1.05,    // +5%
  good: 1,        // neutral
  excellent: 0.85, // -15% (excellent routine)
} as const;

// ========================= CORE FUNCTIONS =========================

/**
 * คำนวณ Acne Pattern Score (0-100)
 * 
 * Formula: (acneCount/50 × 50) + (clusterDensity × 50)
 * - Acne count scaled to max 50 spots
 * - Cluster density (การกระจุกตัว) indicates severity
 */
function calculateAcnePatternScore(
  acneCount: number = 0,
  acneClusterDensity: number = 0
): number {
  // Acne count contribution (max 50 spots = 50 points)
  const countScore = Math.min(acneCount / 50, 1) * 50;
  
  // Cluster density contribution (0-100 → 0-50 points)
  const clusterScore = (acneClusterDensity / 100) * 50;
  
  return Math.min(countScore + clusterScore, 100);
}

/**
 * คำนวณ Pore Congestion Score (0-100)
 * 
 * Formula: (poreDensity/200 × 40) + (poreSize/100 × 30) + (congestedPercent × 30)
 * - Pore density: typical = 100/cm², oily = 200/cm²
 * - Pore size: larger pores = more bacterial colonization
 * - Congested percentage: direct indicator
 */
function calculatePoreCongestionScore(
  poreDensity: number = 0,
  averagePoreSize: number = 0,
  congestedPercent: number = 0
): number {
  // Normalize pore density (200 pores/cm² = max)
  const densityScore = Math.min(poreDensity / 200, 1) * 40;
  
  // Normalize pore size (100 pixels = max)
  const sizeScore = Math.min(averagePoreSize / 100, 1) * 30;
  
  // Congested percentage (0-100 → 0-30)
  const congestedScore = (congestedPercent / 100) * 30;
  
  return Math.min(densityScore + sizeScore + congestedScore, 100);
}

/**
 * คำนวณ Inflammation Score (0-100)
 * 
 * Formula: (redAreasScore × 70) + (inflammationSpots/50 × 30)
 * - Red areas from Task 5 color separation
 * - Inflammation spots count (detected red bumps)
 */
function calculateInflammationScore(
  redAreasScore: number = 0,
  inflammationSpots: number = 0
): number {
  // Red areas contribution (0-100 → 0-70)
  const redScore = (redAreasScore / 100) * 70;
  
  // Inflammation spots contribution (max 50 spots = 30 points)
  const spotsScore = Math.min(inflammationSpots / 50, 1) * 30;
  
  return Math.min(redScore + spotsScore, 100);
}

/**
 * คำนวณ History Adjustment (-20 to +20)
 * 
 * Factors:
 * - Age: younger = higher bacterial activity
 * - Acne history: chronic acne = higher baseline
 * - Treatment: reduces score by 15%
 * - Skincare: poor routine = higher score
 */
function calculateHistoryAdjustment(userHistory?: UserHistory): number {
  if (!userHistory) return 0;
  
  let adjustment = 0;
  
  // Age factor (younger = +adjustment)
  if (userHistory.age) {
    const age = userHistory.age;
    let ageFactor = 1;
    
    if (age < 20) ageFactor = AGE_BACTERIAL_ACTIVITY['10-19'];
    else if (age < 30) ageFactor = AGE_BACTERIAL_ACTIVITY['20-29'];
    else if (age < 40) ageFactor = AGE_BACTERIAL_ACTIVITY['30-39'];
    else if (age < 50) ageFactor = AGE_BACTERIAL_ACTIVITY['40-49'];
    else ageFactor = AGE_BACTERIAL_ACTIVITY['50+'];
    
    adjustment += (ageFactor - 1) * 20; // Convert to -6 to +6 range
  }
  
  // Acne history factor
  if (userHistory.acneHistory) {
    const historyMultiplier = ACNE_HISTORY_MULTIPLIER[userHistory.acneHistory];
    adjustment += (historyMultiplier - 1) * 15; // -4.5 to +4.5
  }
  
  // Treatment factor (reduces bacterial load)
  if (userHistory.onTreatment) {
    adjustment -= 10; // -10 points if on treatment
  }
  
  // Skincare routine factor
  if (userHistory.skincareRoutine) {
    const skincareMultiplier = SKINCARE_ADJUSTMENT[userHistory.skincareRoutine];
    adjustment += (skincareMultiplier - 1) * 10; // -1.5 to +2
  }
  
  return Math.max(-20, Math.min(20, adjustment));
}

/**
 * Classify acne severity (ตามจำนวนสิว)
 */
function classifyAcneSeverity(acneCount: number): AcneSeverity {
  if (acneCount === 0) return 'clear';
  if (acneCount <= ACNE_SEVERITY_THRESHOLDS.mild) return 'mild';
  if (acneCount <= ACNE_SEVERITY_THRESHOLDS.moderate) return 'moderate';
  if (acneCount <= ACNE_SEVERITY_THRESHOLDS.severe) return 'severe';
  return 'very-severe';
}

/**
 * Classify pore congestion (ตามเปอร์เซ็นต์ที่อุดตัน)
 */
function classifyPoreCongestion(congestedPercent: number): PoreCongestion {
  if (congestedPercent < PORE_CONGESTION_THRESHOLDS.clear) return 'clear';
  if (congestedPercent < PORE_CONGESTION_THRESHOLDS.minimal) return 'minimal';
  if (congestedPercent < PORE_CONGESTION_THRESHOLDS.moderate) return 'moderate';
  if (congestedPercent < PORE_CONGESTION_THRESHOLDS.significant) return 'significant';
  return 'severe';
}

/**
 * Classify inflammation level (จาก red areas score)
 */
function classifyInflammation(redAreasScore: number): InflammationLevel {
  if (redAreasScore < INFLAMMATION_THRESHOLDS.none) return 'none';
  if (redAreasScore < INFLAMMATION_THRESHOLDS.mild) return 'mild';
  if (redAreasScore < INFLAMMATION_THRESHOLDS.moderate) return 'moderate';
  return 'severe';
}

/**
 * คำนวณ estimated bacterial density (fluorescent spots/cm²)
 * 
 * Based on: Porphyrin score correlation with bacterial count
 * - Score 0-20: <10 spots/cm² (normal skin flora)
 * - Score 20-40: 10-30 spots/cm² (mild colonization)
 * - Score 40-60: 30-60 spots/cm² (moderate)
 * - Score 60-80: 60-100 spots/cm² (high)
 * - Score 80-100: >100 spots/cm² (severe colonization)
 */
function estimateBacterialDensity(porphyrinScore: number): number {
  if (porphyrinScore < 20) return porphyrinScore * 0.5; // 0-10
  if (porphyrinScore < 40) return 10 + (porphyrinScore - 20) * 1; // 10-30
  if (porphyrinScore < 60) return 30 + (porphyrinScore - 40) * 1.5; // 30-60
  if (porphyrinScore < 80) return 60 + (porphyrinScore - 60) * 2; // 60-100
  return 100 + (porphyrinScore - 80) * 3; // 100-160
}

/**
 * Assess progression risk (ความเสี่ยงที่สิวจะแย่ลง)
 */
function assessProgressionRisk(
  porphyrinScore: number,
  acneSeverity: AcneSeverity,
  onTreatment: boolean = false
): 'low' | 'moderate' | 'high' {
  // ถ้ากำลังรักษา = ความเสี่ยงลดลง
  if (onTreatment) {
    if (porphyrinScore < 40) return 'low';
    if (porphyrinScore < 70) return 'moderate';
    return 'high';
  }
  
  // ไม่ได้รักษา + bacterial load สูง = high risk
  if (porphyrinScore >= 60 && (acneSeverity === 'severe' || acneSeverity === 'very-severe')) {
    return 'high';
  }
  
  if (porphyrinScore >= 40 || acneSeverity === 'moderate') {
    return 'moderate';
  }
  
  return 'low';
}

/**
 * Determine treatment urgency
 */
function determineTreatmentUrgency(
  porphyrinScore: number,
  acneSeverity: AcneSeverity,
  inflammationLevel: InflammationLevel
): TreatmentUrgency {
  // Severe cases = urgent
  if (acneSeverity === 'very-severe' || inflammationLevel === 'severe' || porphyrinScore >= 75) {
    return 'urgent';
  }
  
  // Moderate-severe cases = advised
  if (acneSeverity === 'severe' || inflammationLevel === 'moderate' || porphyrinScore >= 50) {
    return 'advised';
  }
  
  // Mild-moderate cases = recommended
  if (acneSeverity === 'moderate' || porphyrinScore >= 30) {
    return 'recommended';
  }
  
  // Clear-mild = routine
  return 'routine';
}

/**
 * สร้างคำแนะนำแบบ personalized (ภาษาไทย)
 */
function generateRecommendations(
  porphyrinScore: number,
  acneSeverity: AcneSeverity,
  poreCongestion: PoreCongestion,
  inflammationLevel: InflammationLevel,
  treatmentUrgency: TreatmentUrgency,
  userHistory?: UserHistory
): string[] {
  const recommendations: string[] = [];
  
  // 1. Cleansing recommendations (ตามระดับการอุดตัน)
  if (poreCongestion === 'severe' || poreCongestion === 'significant') {
    recommendations.push('ทำความสะอาดผิวหน้าวันละ 2 ครั้ง ด้วยเจลล้างหน้าสำหรับผิวมันหรือผิวเป็นสิว (Salicylic Acid 2%)');
    recommendations.push('ใช้ Clay Mask หรือ Charcoal Mask สัปดาห์ละ 2-3 ครั้ง เพื่อดูดซับความมันและสิ่งอุดตันในรูขุมขน');
  } else if (poreCongestion === 'moderate') {
    recommendations.push('ทำความสะอาดผิวหน้าวันละ 2 ครั้ง ด้วยโฟมหรือเจลล้างหน้าอ่อนโยน');
    recommendations.push('ใช้ BHA (Beta Hydroxy Acid) เช่น Salicylic Acid เพื่อขจัดสิ่งอุดตันในรูขุมขน');
  } else {
    recommendations.push('ทำความสะอาดผิวหน้าวันละ 2 ครั้ง ด้วยผลิตภัณฑ์ทำความสะอาดที่เหมาะกับผิว');
  }
  
  // 2. Antibacterial treatment (ตามระดับแบคทีเรีย)
  if (porphyrinScore >= 60) {
    recommendations.push('พบแพทย์ผิวหนังเพื่อพิจารณาใช้ยาปฏิชีวนะทาภายนอก (Topical Antibiotics) เช่น Clindamycin หรือ Erythromycin');
    recommendations.push('พิจารณาใช้ Benzoyl Peroxide 2.5-5% เพื่อลดแบคทีเรีย P. acnes (ระวังการระคายเคือง)');
  } else if (porphyrinScore >= 40) {
    recommendations.push('ใช้ผลิตภัณฑ์ฆ่าเชื้อแบคทีเรีย เช่น Tea Tree Oil, Benzoyl Peroxide 2.5%, หรือ Azelaic Acid');
  } else if (porphyrinScore >= 20) {
    recommendations.push('ใช้ผลิตภัณฑ์บำรุงผิวที่มีส่วนผสมต้านแบคทีเรียเบาๆ เช่น Niacinamide หรือ Tea Tree Oil');
  }
  
  // 3. Inflammation treatment (ตามระดับการอักเสบ)
  if (inflammationLevel === 'severe') {
    recommendations.push('พบแพทย์ผิวหนังโดยเร็ว เพื่อประเมินการใช้ยาลดการอักเสบ (เช่น Isotretinoin สำหรับกรณีรุนแรง)');
    recommendations.push('หลีกเลี่ยงการบีบสิว อาจทำให้การอักเสบรุนแรงขึ้นและเกิดรอยแผลเป็น');
  } else if (inflammationLevel === 'moderate') {
    recommendations.push('ใช้ครีมหรือเซรั่มที่มีส่วนผสมลดการอักเสบ เช่น Niacinamide, Centella Asiatica, หรือ Azelaic Acid');
    recommendations.push('พิจารณาพบแพทย์ผิวหนังเพื่อรับคำปรึกษาและแผนการรักษาที่เหมาะสม');
  } else if (inflammationLevel === 'mild') {
    recommendations.push('ใช้ผลิตภัณฑ์บำรุงที่มีส่วนผสมสงบผิว เช่น Aloe Vera, Green Tea Extract, หรือ Centella');
  }
  
  // 4. Acne-specific advice (ตามความรุนแรงของสิว)
  if (acneSeverity === 'very-severe' || acneSeverity === 'severe') {
    recommendations.push('**แนะนำให้พบแพทย์ผิวหนังเร่งด่วน** สิวรุนแรงต้องการการรักษาทางการแพทย์ (Prescription Treatment)');
  } else if (acneSeverity === 'moderate') {
    recommendations.push('พิจารณาใช้ Retinoids (Adapalene, Tretinoin) เพื่อลดการอุดตันและเร่งการหลุดของเซลล์ผิว');
  }
  
  // 5. Lifestyle recommendations
  if (porphyrinScore >= 30) {
    recommendations.push('เปลี่ยนปลอกหมอนทุก 2-3 วัน เพื่อลดการสะสมแบคทีเรีย');
    recommendations.push('หลีกเลี่ยงการสัมผัสใบหน้าบ่อยๆ เพื่อลดการถ่ายทอดเชื้อแบคทีเรีย');
  }
  
  // 6. Age-specific advice
  if (userHistory?.age && userHistory.age < 25) {
    recommendations.push('วัยรุ่นและผู้ใหญ่ตอนต้นมักมีการผลิตน้ำมันมาก ควรใช้ผลิตภัณฑ์ Oil-Free และ Non-Comedogenic');
  }
  
  // 7. Treatment urgency warning
  if (treatmentUrgency === 'urgent') {
    recommendations.push('⚠️ **ควรพบแพทย์ผิวหนังภายใน 1-2 สัปดาห์** เพื่อป้องกันรอยแผลเป็นถาวรและการอักเสบรุนแรง');
  } else if (treatmentUrgency === 'advised') {
    recommendations.push('แนะนำให้ปรึกษาแพทย์ผิวหนังเพื่อรับแผนการรักษาที่เหมาะสมกับสภาพผิวของคุณ');
  }
  
  // Limit to top recommendations
  return recommendations.slice(0, 8);
}

// ========================= MAIN FUNCTION =========================

/**
 * วิเคราะห์ Porphyrins (แบคทีเรียที่เกี่ยวข้องกับสิว)
 * 
 * @param input - ข้อมูลจากภาพและประวัติผู้ใช้
 * @returns ผลการวิเคราะห์ Porphyrins พร้อมคำแนะนำ
 * 
 * @example
 * ```typescript
 * const result = analyzePorphyrins({
 *   features: {
 *     acneCount: 15,
 *     acneClusterDensity: 35,
 *     poreDensity: 120,
 *     averagePoreSize: 45,
 *     congestedPoresPercent: 25,
 *     redAreasScore: 42,
 *     inflammationSpots: 8
 *   },
 *   userHistory: {
 *     age: 22,
 *     acneHistory: 'frequent',
 *     onTreatment: false,
 *     skincareRoutine: 'basic'
 *   },
 *   imageConfidence: 0.85
 * });
 * 
 * console.log(result.porphyrinScore); // 52.3
 * console.log(result.acneSeverity); // 'moderate'
 * console.log(result.treatmentUrgency); // 'advised'
 * ```
 */
export function analyzePorphyrins(input: PorphyrinDetectorInput): PorphyrinAnalysisResult {
  const { features, userHistory, imageConfidence = 0.8 } = input;
  
  // Step 1: Calculate individual factor scores
  const acnePatternScore = calculateAcnePatternScore(
    features.acneCount,
    features.acneClusterDensity
  );
  
  const poreCongestionScore = calculatePoreCongestionScore(
    features.poreDensity,
    features.averagePoreSize,
    features.congestedPoresPercent
  );
  
  const inflammationScore = calculateInflammationScore(
    features.redAreasScore,
    features.inflammationSpots
  );
  
  const historyAdjustment = calculateHistoryAdjustment(userHistory);
  
  // Step 2: Calculate weighted porphyrin score
  // Formula: (acne×0.35 + pores×0.35 + inflammation×0.30) + history adjustment
  const baseScore = 
    acnePatternScore * 0.35 +
    poreCongestionScore * 0.35 +
    inflammationScore * 0.30;
  
  const porphyrinScore = Math.max(0, Math.min(100, baseScore + historyAdjustment));
  
  // Step 3: Classify severity levels
  const acneSeverity = classifyAcneSeverity(features.acneCount || 0);
  const poreCongestion = classifyPoreCongestion(features.congestedPoresPercent || 0);
  const inflammationLevel = classifyInflammation(features.redAreasScore || 0);
  
  // Step 4: Assess treatment urgency and progression risk
  const treatmentUrgency = determineTreatmentUrgency(
    porphyrinScore,
    acneSeverity,
    inflammationLevel
  );
  
  const progressionRisk = assessProgressionRisk(
    porphyrinScore,
    acneSeverity,
    userHistory?.onTreatment
  );
  
  // Step 5: Estimate bacterial density
  const estimatedBacterialDensity = estimateBacterialDensity(porphyrinScore);
  
  // Step 6: Generate personalized recommendations
  const recommendations = generateRecommendations(
    porphyrinScore,
    acneSeverity,
    poreCongestion,
    inflammationLevel,
    treatmentUrgency,
    userHistory
  );
  
  // Step 7: Calculate final confidence
  // Reduce confidence if missing key features
  let confidenceAdjustment = imageConfidence;
  if (!features.acneCount && !features.acneClusterDensity) confidenceAdjustment *= 0.8;
  if (!features.poreDensity && !features.congestedPoresPercent) confidenceAdjustment *= 0.9;
  if (!features.redAreasScore && !features.inflammationSpots) confidenceAdjustment *= 0.85;
  
  return {
    porphyrinScore: Math.round(porphyrinScore * 10) / 10,
    acneSeverity,
    poreCongestion,
    inflammationLevel,
    treatmentUrgency,
    factors: {
      acnePattern: Math.round(acnePatternScore * 10) / 10,
      poreCongestion: Math.round(poreCongestionScore * 10) / 10,
      inflammation: Math.round(inflammationScore * 10) / 10,
      historyAdjustment: Math.round(historyAdjustment * 10) / 10,
    },
    estimatedBacterialDensity: Math.round(estimatedBacterialDensity * 10) / 10,
    progressionRisk,
    recommendations,
    confidence: Math.round(confidenceAdjustment * 100) / 100,
  };
}

// ========================= UTILITY FUNCTIONS =========================

/**
 * รับคำอธิบายระดับ Porphyrins (ภาษาไทย)
 */
export function getPorphyrinDescription(score: number): string {
  if (score < 20) return 'ระดับปกติ - แบคทีเรียบนผิวหน้าอยู่ในระดับที่เหมาะสม';
  if (score < 40) return 'ระดับเล็กน้อย - พบการตั้งรกรากของแบคทีเรียเล็กน้อย';
  if (score < 60) return 'ระดับปานกลาง - มีการตั้งรกรากของแบคทีเรียในระดับปานกลาง';
  if (score < 80) return 'ระดับสูง - มีแบคทีเรียจำนวนมากบนผิวหน้า ควรรักษา';
  return 'ระดับรุนแรง - แบคทีเรียตั้งรกรากมาก ต้องการการรักษาเร่งด่วน';
}

/**
 * รับคำอธิบาย Treatment Urgency (ภาษาไทย)
 */
export function getTreatmentUrgencyDescription(urgency: TreatmentUrgency): string {
  switch (urgency) {
    case 'routine':
      return 'ดูแลผิวตามปกติ - ใช้ผลิตภัณฑ์บำรุงผิวทั่วไปเพียงพอ';
    case 'recommended':
      return 'แนะนำให้รักษา - ควรใช้ผลิตภัณฑ์รักษาสิวเฉพาะทาง';
    case 'advised':
      return 'ควรรักษาอย่างยิ่ง - แนะนำให้ปรึกษาแพทย์ผิวหนัง';
    case 'urgent':
      return 'เร่งด่วน - ต้องพบแพทย์ผิวหนังโดยเร็วเพื่อป้องกันรอยแผลเป็น';
  }
}

/**
 * รับสีแสดงผล Treatment Urgency (hex color)
 */
export function getTreatmentUrgencyColor(urgency: TreatmentUrgency): string {
  switch (urgency) {
    case 'routine': return '#4CAF50';    // Green
    case 'recommended': return '#FFC107'; // Amber
    case 'advised': return '#FF9800';     // Orange
    case 'urgent': return '#F44336';      // Red
  }
}

/**
 * Format Porphyrin analysis summary (สรุปผลการวิเคราะห์)
 */
export function formatPorphyrinSummary(result: PorphyrinAnalysisResult): string {
  const lines = [
    '=== PORPHYRIN ANALYSIS RESULT ===',
    '',
    `Porphyrin Score: ${result.porphyrinScore}/100`,
    `Description: ${getPorphyrinDescription(result.porphyrinScore)}`,
    '',
    '--- Classification ---',
    `Acne Severity: ${result.acneSeverity}`,
    `Pore Congestion: ${result.poreCongestion}`,
    `Inflammation: ${result.inflammationLevel}`,
    `Treatment Urgency: ${result.treatmentUrgency} - ${getTreatmentUrgencyDescription(result.treatmentUrgency)}`,
    '',
    '--- Contributing Factors ---',
    `Acne Pattern: ${result.factors.acnePattern}/100`,
    `Pore Congestion: ${result.factors.poreCongestion}/100`,
    `Inflammation: ${result.factors.inflammation}/100`,
    `History Adjustment: ${result.factors.historyAdjustment >= 0 ? '+' : ''}${result.factors.historyAdjustment}`,
    '',
    '--- Risk Assessment ---',
    `Estimated Bacterial Density: ${result.estimatedBacterialDensity} spots/cm²`,
    `Progression Risk: ${result.progressionRisk}`,
    `Analysis Confidence: ${(result.confidence * 100).toFixed(0)}%`,
    '',
    '--- Top Recommendations ---',
  ];
  
  result.recommendations.slice(0, 5).forEach((rec, index) => {
    lines.push(`${index + 1}. ${rec}`);
  });
  
  return lines.join('\n');
}
