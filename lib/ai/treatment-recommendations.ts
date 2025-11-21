/**
 * AI-Powered Treatment Recommendation Engine
 * 
 * Generates personalized treatment, product, and procedure recommendations
 * based on VISIA analysis results, skin type, concerns, and historical data.
 */

import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TreatmentCategory = 
  | 'laser' 
  | 'chemical_peel' 
  | 'microneedling' 
  | 'hydrafacial' 
  | 'led_therapy' 
  | 'radiofrequency' 
  | 'microdermabrasion' 
  | 'ipl' 
  | 'botox' 
  | 'filler'
  | 'skincare'
  | 'lifestyle';

export type SkinConcernType = 
  | 'spots' 
  | 'pores' 
  | 'wrinkles' 
  | 'texture' 
  | 'redness' 
  | 'pigmentation'
  | 'acne'
  | 'dryness'
  | 'oiliness'
  | 'sensitivity';

export type SkinTypeCategory = 
  | 'dry' 
  | 'oily' 
  | 'combination' 
  | 'normal' 
  | 'sensitive'
  | 'all';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface TreatmentRecommendation {
  id: string;
  name: string;
  category: TreatmentCategory;
  targetConcerns: SkinConcernType[];
  priority: PriorityLevel;
  confidence: number; // 0-1
  description: string;
  expectedResults: string;
  duration: string; // e.g., "4-6 weeks"
  frequency: string; // e.g., "Once weekly"
  cost: {
    min: number;
    max: number;
    currency: string;
  };
  suitableFor: SkinTypeCategory[];
  contraindications: string[];
  effectiveness: number; // 0-100
  downtime: string;
  painLevel: number; // 1-5
  sessionDuration: string;
  numberOfSessions: number;
  beforeCare: string[];
  afterCare: string[];
  alternatives: string[];
  benefits: string[];
  risks: string[];
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  category: 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'mask';
  targetConcerns: SkinConcernType[];
  priority: PriorityLevel;
  confidence: number;
  description: string;
  keyIngredients: string[];
  usage: string;
  price: {
    amount: number;
    currency: string;
  };
  suitableFor: SkinTypeCategory[];
  rating: number; // 0-5
  reviewCount: number;
  imageUrl?: string;
  purchaseUrl?: string;
}

export interface ProcedureRecommendation {
  id: string;
  name: string;
  type: 'invasive' | 'minimally_invasive' | 'non_invasive';
  targetConcerns: SkinConcernType[];
  priority: PriorityLevel;
  confidence: number;
  description: string;
  expectedResults: string;
  recoveryTime: string;
  cost: {
    min: number;
    max: number;
    currency: string;
  };
  suitableFor: SkinTypeCategory[];
  contraindications: string[];
  risks: string[];
  benefits: string[];
}

export interface RecommendationResult {
  treatments: TreatmentRecommendation[];
  products: ProductRecommendation[];
  procedures: ProcedureRecommendation[];
  lifestyle: {
    diet: string[];
    hydration: string[];
    sleep: string[];
    stress: string[];
    sun_protection: string[];
  };
  timeline: {
    immediate: string[]; // 0-2 weeks
    short_term: string[]; // 2-8 weeks
    long_term: string[]; // 2-6 months
  };
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  expectedImprovement: Record<SkinConcernType, number>; // % improvement
  confidence: number;
}

export interface PatientHistory {
  previousTreatments?: string[];
  allergies?: string[];
  skinConditions?: string[];
  medications?: string[];
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

// ============================================================================
// Treatment Database (Mock - Replace with actual database)
// ============================================================================

const TREATMENT_DATABASE: TreatmentRecommendation[] = [
  {
    id: 'laser-pigmentation',
    name: 'Q-Switched Laser Treatment',
    category: 'laser',
    targetConcerns: ['spots', 'pigmentation'],
    priority: 'high',
    confidence: 0.9,
    description: 'Advanced laser technology targeting melanin to reduce dark spots and hyperpigmentation',
    expectedResults: '50-80% reduction in pigmentation after 3-6 sessions',
    duration: '8-12 weeks',
    frequency: 'Every 2-3 weeks',
    cost: { min: 3000, max: 8000, currency: 'THB' },
    suitableFor: ['normal', 'oily', 'combination'],
    contraindications: ['Active infection', 'Pregnancy', 'Recent sun exposure'],
    effectiveness: 85,
    downtime: '3-5 days mild redness',
    painLevel: 2,
    sessionDuration: '30-45 minutes',
    numberOfSessions: 4,
    beforeCare: ['Avoid sun exposure 2 weeks before', 'Stop retinoids 1 week before'],
    afterCare: ['Apply SPF 50+', 'Avoid sun for 2 weeks', 'Moisturize regularly'],
    alternatives: ['Chemical Peel', 'IPL Treatment'],
    benefits: ['Precise targeting', 'Minimal downtime', 'Long-lasting results'],
    risks: ['Temporary redness', 'Mild swelling', 'Rare: hyperpigmentation'],
  },
  {
    id: 'chemical-peel-spots',
    name: 'Glycolic Acid Chemical Peel',
    category: 'chemical_peel',
    targetConcerns: ['spots', 'texture', 'pigmentation'],
    priority: 'high',
    confidence: 0.85,
    description: 'Medical-grade exfoliation to remove damaged skin layers and reveal brighter, smoother skin',
    expectedResults: '40-60% improvement in skin texture and tone',
    duration: '6-8 weeks',
    frequency: 'Every 2-4 weeks',
    cost: { min: 2000, max: 5000, currency: 'THB' },
    suitableFor: ['normal', 'oily', 'combination'],
    contraindications: ['Active acne', 'Eczema', 'Recent laser treatment'],
    effectiveness: 75,
    downtime: '5-7 days peeling',
    painLevel: 3,
    sessionDuration: '30 minutes',
    numberOfSessions: 3,
    beforeCare: ['Discontinue retinoids 1 week before', 'Avoid sun exposure'],
    afterCare: ['Gentle cleansing', 'Heavy moisturizer', 'SPF 50+ essential', 'No makeup 24h'],
    alternatives: ['Microdermabrasion', 'Laser Resurfacing'],
    benefits: ['Improved texture', 'Reduced pigmentation', 'Brighter complexion'],
    risks: ['Peeling', 'Redness', 'Temporary sensitivity'],
  },
  {
    id: 'microneedling-texture',
    name: 'Microneedling with PRP',
    category: 'microneedling',
    targetConcerns: ['texture', 'pores', 'wrinkles'],
    priority: 'high',
    confidence: 0.88,
    description: 'Collagen induction therapy with platelet-rich plasma to improve skin texture and firmness',
    expectedResults: '60-70% improvement in skin texture and pore size',
    duration: '12-16 weeks',
    frequency: 'Every 4-6 weeks',
    cost: { min: 5000, max: 12000, currency: 'THB' },
    suitableFor: ['normal', 'dry', 'combination', 'oily'],
    contraindications: ['Active acne', 'Keloid scarring', 'Blood disorders'],
    effectiveness: 82,
    downtime: '2-3 days redness',
    painLevel: 4,
    sessionDuration: '60-90 minutes',
    numberOfSessions: 3,
    beforeCare: ['Avoid retinoids 3 days before', 'No blood thinners'],
    afterCare: ['Gentle skincare', 'Avoid sun 48h', 'No makeup 24h', 'Hydrate well'],
    alternatives: ['Fractional Laser', 'Radiofrequency'],
    benefits: ['Natural collagen production', 'Minimal downtime', 'Long-lasting'],
    risks: ['Temporary redness', 'Mild swelling', 'Rare: infection'],
  },
  {
    id: 'hydrafacial-pores',
    name: 'HydraFacial MD',
    category: 'hydrafacial',
    targetConcerns: ['pores', 'texture', 'oiliness'],
    priority: 'medium',
    confidence: 0.82,
    description: 'Advanced facial cleansing and extraction with hydration infusion',
    expectedResults: 'Immediate improvement in skin clarity and pore appearance',
    duration: '4-6 weeks',
    frequency: 'Every 2-4 weeks',
    cost: { min: 3500, max: 6000, currency: 'THB' },
    suitableFor: ['all'],
    contraindications: ['Active rash', 'Sunburn'],
    effectiveness: 70,
    downtime: 'None',
    painLevel: 1,
    sessionDuration: '45 minutes',
    numberOfSessions: 4,
    beforeCare: ['Clean face', 'No exfoliation 24h before'],
    afterCare: ['Apply SPF', 'Maintain hydration'],
    alternatives: ['Regular Facial', 'Microdermabrasion'],
    benefits: ['No downtime', 'Immediate glow', 'Deep cleansing'],
    risks: ['Minimal', 'Rare: mild redness'],
  },
  {
    id: 'led-therapy-redness',
    name: 'LED Light Therapy (Red/Blue)',
    category: 'led_therapy',
    targetConcerns: ['redness', 'acne', 'sensitivity'],
    priority: 'medium',
    confidence: 0.78,
    description: 'Non-invasive light therapy to reduce inflammation and promote healing',
    expectedResults: '30-50% reduction in redness and inflammation',
    duration: '6-8 weeks',
    frequency: 'Twice weekly',
    cost: { min: 800, max: 1500, currency: 'THB' },
    suitableFor: ['all'],
    contraindications: ['Photosensitivity', 'Epilepsy'],
    effectiveness: 65,
    downtime: 'None',
    painLevel: 1,
    sessionDuration: '20 minutes',
    numberOfSessions: 12,
    beforeCare: ['Clean face', 'Remove makeup'],
    afterCare: ['Normal skincare routine'],
    alternatives: ['IPL', 'Topical treatments'],
    benefits: ['Painless', 'No downtime', 'Safe for sensitive skin'],
    risks: ['None significant'],
  },
  {
    id: 'rf-wrinkles',
    name: 'Radiofrequency Skin Tightening',
    category: 'radiofrequency',
    targetConcerns: ['wrinkles', 'texture'],
    priority: 'high',
    confidence: 0.83,
    description: 'RF energy to stimulate collagen and tighten skin',
    expectedResults: '50-70% improvement in skin firmness',
    duration: '12-16 weeks',
    frequency: 'Every 3-4 weeks',
    cost: { min: 6000, max: 15000, currency: 'THB' },
    suitableFor: ['normal', 'dry', 'combination'],
    contraindications: ['Pregnancy', 'Metal implants', 'Pacemaker'],
    effectiveness: 78,
    downtime: '1-2 days mild redness',
    painLevel: 2,
    sessionDuration: '45-60 minutes',
    numberOfSessions: 4,
    beforeCare: ['Hydrate skin well', 'Avoid sun'],
    afterCare: ['Moisturize', 'SPF protection', 'Avoid heat 24h'],
    alternatives: ['HIFU', 'Ultherapy'],
    benefits: ['Non-surgical lifting', 'Collagen stimulation', 'Natural results'],
    risks: ['Mild redness', 'Temporary swelling'],
  },
];

const PRODUCT_DATABASE: ProductRecommendation[] = [
  {
    id: 'vitamin-c-serum',
    name: 'Vitamin C Brightening Serum 20%',
    brand: 'SkinCeuticals',
    category: 'serum',
    targetConcerns: ['spots', 'pigmentation'],
    priority: 'high',
    confidence: 0.92,
    description: 'Potent antioxidant serum to brighten and even skin tone',
    keyIngredients: ['L-Ascorbic Acid 20%', 'Vitamin E', 'Ferulic Acid'],
    usage: 'Apply 3-4 drops morning after cleansing',
    price: { amount: 5200, currency: 'THB' },
    suitableFor: ['normal', 'oily', 'combination'],
    rating: 4.7,
    reviewCount: 2845,
  },
  {
    id: 'retinol-serum',
    name: 'Retinol 0.5% Night Serum',
    brand: 'The Ordinary',
    category: 'serum',
    targetConcerns: ['wrinkles', 'texture', 'pores'],
    priority: 'high',
    confidence: 0.88,
    description: 'Pure retinol for anti-aging and texture improvement',
    keyIngredients: ['Retinol 0.5%', 'Squalane'],
    usage: 'Apply at night, start 2x weekly',
    price: { amount: 850, currency: 'THB' },
    suitableFor: ['normal', 'oily', 'combination'],
    rating: 4.5,
    reviewCount: 5621,
  },
  {
    id: 'niacinamide-serum',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'serum',
    targetConcerns: ['pores', 'texture', 'oiliness'],
    priority: 'high',
    confidence: 0.86,
    description: 'Reduces pore appearance and regulates oil production',
    keyIngredients: ['Niacinamide 10%', 'Zinc PCA 1%'],
    usage: 'Apply AM/PM before moisturizer',
    price: { amount: 550, currency: 'THB' },
    suitableFor: ['oily', 'combination', 'normal'],
    rating: 4.6,
    reviewCount: 8932,
  },
  {
    id: 'hyaluronic-acid',
    name: 'Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    category: 'serum',
    targetConcerns: ['dryness', 'texture'],
    priority: 'medium',
    confidence: 0.84,
    description: 'Deep hydration and plumping serum',
    keyIngredients: ['Hyaluronic Acid 2%', 'Vitamin B5'],
    usage: 'Apply on damp skin AM/PM',
    price: { amount: 420, currency: 'THB' },
    suitableFor: ['all'],
    rating: 4.8,
    reviewCount: 12453,
  },
  {
    id: 'spf-50-sunscreen',
    name: 'UV Daily Broad-Spectrum SPF 50',
    brand: 'EltaMD',
    category: 'sunscreen',
    targetConcerns: ['pigmentation', 'spots'],
    priority: 'high',
    confidence: 0.95,
    description: 'Essential daily sun protection to prevent pigmentation',
    keyIngredients: ['Zinc Oxide', 'Niacinamide', 'Hyaluronic Acid'],
    usage: 'Apply generously every morning, reapply every 2h',
    price: { amount: 1850, currency: 'THB' },
    suitableFor: ['all'],
    rating: 4.9,
    reviewCount: 6234,
  },
  {
    id: 'azelaic-acid',
    name: 'Azelaic Acid 10% Suspension',
    brand: 'The Ordinary',
    category: 'treatment',
    targetConcerns: ['redness', 'acne', 'pigmentation'],
    priority: 'medium',
    confidence: 0.81,
    description: 'Multi-functional treatment for redness and texture',
    keyIngredients: ['Azelaic Acid 10%'],
    usage: 'Apply PM after water-based serums',
    price: { amount: 650, currency: 'THB' },
    suitableFor: ['sensitive', 'normal', 'combination'],
    rating: 4.4,
    reviewCount: 3782,
  },
];

// ============================================================================
// AI Recommendation Engine
// ============================================================================

/**
 * Generate personalized treatment recommendations
 */
export function generateTreatmentRecommendations(
  analysis: HybridSkinAnalysis,
  skinType: SkinTypeCategory = 'normal',
  patientHistory?: PatientHistory
): RecommendationResult {
  // Extract concerns from analysis
  const concerns = extractConcerns(analysis);
  
  // Score and rank treatments
  const treatments = scoreTreatments(concerns, skinType, patientHistory);
  
  // Score and rank products
  const products = scoreProducts(concerns, skinType);
  
  // Generate procedures (if needed)
  const procedures = scoreProcedures(concerns, skinType, patientHistory);
  
  // Generate lifestyle recommendations
  const lifestyle = generateLifestyleRecommendations(concerns, skinType);
  
  // Create treatment timeline
  const timeline = generateTreatmentTimeline(treatments, products);
  
  // Calculate estimated costs
  const estimatedCost = calculateEstimatedCost(treatments, products);
  
  // Calculate expected improvement
  const expectedImprovement = calculateExpectedImprovement(
    concerns,
    treatments,
    products
  );
  
  // Overall confidence
  const confidence = calculateOverallConfidence(treatments, products);
  
  return {
    treatments,
    products,
    procedures,
    lifestyle,
    timeline,
    estimatedCost,
    expectedImprovement,
    confidence,
  };
}

/**
 * Extract concerns from analysis with severity
 */
function extractConcerns(analysis: HybridSkinAnalysis): Map<SkinConcernType, number> {
  const concerns = new Map<SkinConcernType, number>();
  const scores = analysis.overallScore;
  
  // Map scores to concerns (higher score = more severe)
  if (scores.spots > 5) concerns.set('spots', scores.spots);
  if (scores.pores > 5) concerns.set('pores', scores.pores);
  if (scores.wrinkles > 5) concerns.set('wrinkles', scores.wrinkles);
  if (scores.texture > 5) concerns.set('texture', scores.texture);
  if (scores.redness > 5) concerns.set('redness', scores.redness);
  if (scores.pigmentation > 5) concerns.set('pigmentation', scores.pigmentation);
  
  return concerns;
}

/**
 * Score and rank treatments based on concerns
 */
function scoreTreatments(
  concerns: Map<SkinConcernType, number>,
  skinType: SkinTypeCategory,
  patientHistory?: PatientHistory
): TreatmentRecommendation[] {
  const scored: Array<TreatmentRecommendation & { score: number }> = [];
  
  for (const treatment of TREATMENT_DATABASE) {
    let score = 0;
    
    // Check if suitable for skin type
    if (!treatment.suitableFor.includes(skinType) && !treatment.suitableFor.includes('all')) {
      continue;
    }
    
    // Check contraindications
    if (patientHistory?.allergies || patientHistory?.skinConditions) {
      const hasContraindication = treatment.contraindications.some((contra) =>
        patientHistory.allergies?.some((allergy) =>
          contra.toLowerCase().includes(allergy.toLowerCase())
        ) ||
        patientHistory.skinConditions?.some((condition) =>
          contra.toLowerCase().includes(condition.toLowerCase())
        )
      );
      
      if (hasContraindication) continue;
    }
    
    // Score based on target concerns match
    for (const targetConcern of treatment.targetConcerns) {
      const severity = concerns.get(targetConcern);
      if (severity) {
        score += severity * treatment.effectiveness / 10;
      }
    }
    
    // Boost score based on effectiveness
    score *= (treatment.effectiveness / 100);
    
    // Adjust for confidence
    score *= treatment.confidence;
    
    scored.push({ ...treatment, score });
  }
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Return top 5 treatments
  return scored.slice(0, 5).map(({ score, ...treatment }) => treatment);
}

/**
 * Score and rank products
 */
function scoreProducts(
  concerns: Map<SkinConcernType, number>,
  skinType: SkinTypeCategory
): ProductRecommendation[] {
  const scored: Array<ProductRecommendation & { score: number }> = [];
  
  for (const product of PRODUCT_DATABASE) {
    let score = 0;
    
    // Check if suitable for skin type
    if (!product.suitableFor.includes(skinType) && !product.suitableFor.includes('all')) {
      continue;
    }
    
    // Score based on target concerns
    for (const targetConcern of product.targetConcerns) {
      const severity = concerns.get(targetConcern);
      if (severity) {
        score += severity * product.rating;
      }
    }
    
    // Boost by rating
    score *= (product.rating / 5);
    
    // Boost by confidence
    score *= product.confidence;
    
    scored.push({ ...product, score });
  }
  
  // Sort by score
  scored.sort((a, b) => b.score - a.score);
  
  // Return top 6 products (1 from each category ideally)
  const selected: Array<ProductRecommendation & { score: number }> = [];
  const categoriesUsed = new Set<string>();
  
  for (const item of scored) {
    if (!categoriesUsed.has(item.category) || selected.length < 6) {
      selected.push(item);
      categoriesUsed.add(item.category);
      
      if (selected.length >= 6) break;
    }
  }
  
  return selected.map(({ score, ...product }) => product);
}

/**
 * Score procedures (simplified - only for severe cases)
 */
function scoreProcedures(
  concerns: Map<SkinConcernType, number>,
  _skinType: SkinTypeCategory,
  _patientHistory?: PatientHistory
): ProcedureRecommendation[] {
  // Only recommend procedures if concerns are severe (score > 7)
  const hasSevereConcerns = Array.from(concerns.values()).some(
    (severity) => severity > 7
  );
  
  if (!hasSevereConcerns) return [];
  
  // Mock procedures for now
  return [];
}

/**
 * Generate lifestyle recommendations
 */
function generateLifestyleRecommendations(
  concerns: Map<SkinConcernType, number>,
  _skinType: SkinTypeCategory
): RecommendationResult['lifestyle'] {
  const lifestyle: RecommendationResult['lifestyle'] = {
    diet: [
      'Increase antioxidant-rich foods (berries, green tea)',
      'Consume omega-3 fatty acids (salmon, walnuts)',
      'Reduce sugar and processed foods',
      'Eat vitamin C rich foods for collagen production',
    ],
    hydration: [
      'Drink 2-3 liters of water daily',
      'Limit caffeine and alcohol',
      'Use a humidifier if in dry environment',
    ],
    sleep: [
      'Get 7-9 hours of quality sleep',
      'Use silk pillowcase to reduce friction',
      'Keep bedroom cool and dark',
    ],
    stress: [
      'Practice meditation or yoga',
      'Regular exercise (30 min, 5x week)',
      'Limit screen time before bed',
    ],
    sun_protection: [
      'Wear SPF 50+ daily, even indoors',
      'Reapply sunscreen every 2 hours',
      'Wear wide-brimmed hat outdoors',
      'Seek shade between 10am-4pm',
    ],
  };
  
  // Adjust based on concerns
  if (concerns.has('pigmentation') || concerns.has('spots')) {
    lifestyle.sun_protection.push('Avoid sun exposure during treatment period');
  }
  
  if (concerns.has('redness') || concerns.has('sensitivity')) {
    lifestyle.diet.push('Avoid spicy foods and alcohol');
    lifestyle.stress.push('Identify and avoid trigger factors');
  }
  
  return lifestyle;
}

/**
 * Generate treatment timeline
 */
function generateTreatmentTimeline(
  treatments: TreatmentRecommendation[],
  products: ProductRecommendation[]
): RecommendationResult['timeline'] {
  return {
    immediate: [
      'Start with gentle cleanser and moisturizer',
      'Begin SPF 50+ daily application',
      ...products.slice(0, 2).map((p) => `Start using ${p.name}`),
    ],
    short_term: [
      'Continue skincare routine consistently',
      ...treatments.slice(0, 2).map((t) => `Begin ${t.name} treatment`),
    ],
    long_term: [
      'Maintain results with regular follow-ups',
      'Adjust treatment plan based on progress',
      'Consider maintenance treatments',
    ],
  };
}

/**
 * Calculate estimated cost
 */
function calculateEstimatedCost(
  treatments: TreatmentRecommendation[],
  products: ProductRecommendation[]
): RecommendationResult['estimatedCost'] {
  let min = 0;
  let max = 0;
  
  // Add treatment costs (top 2)
  for (const treatment of treatments.slice(0, 2)) {
    min += treatment.cost.min * treatment.numberOfSessions;
    max += treatment.cost.max * treatment.numberOfSessions;
  }
  
  // Add product costs (assuming 3-month supply)
  for (const product of products) {
    min += product.price.amount;
    max += product.price.amount * 1.5; // Account for usage
  }
  
  return {
    min: Math.round(min),
    max: Math.round(max),
    currency: 'THB',
  };
}

/**
 * Calculate expected improvement per concern
 */
function calculateExpectedImprovement(
  concerns: Map<SkinConcernType, number>,
  treatments: TreatmentRecommendation[],
  products: ProductRecommendation[]
): Record<string, number> {
  const improvement: Record<string, number> = {};
  
  for (const [concern] of concerns) {
    let totalImprovement = 0;
    let count = 0;
    
    // From treatments
    for (const treatment of treatments) {
      if (treatment.targetConcerns.includes(concern)) {
        totalImprovement += treatment.effectiveness;
        count++;
      }
    }
    
    // From products (lower impact)
    for (const product of products) {
      if (product.targetConcerns.includes(concern)) {
        totalImprovement += product.rating * 10; // Convert to percentage
        count++;
      }
    }
    
    improvement[concern] = count > 0 ? Math.min(90, totalImprovement / count) : 0;
  }
  
  return improvement;
}

/**
 * Calculate overall confidence
 */
function calculateOverallConfidence(
  treatments: TreatmentRecommendation[],
  products: ProductRecommendation[]
): number {
  let totalConfidence = 0;
  let count = 0;
  
  for (const treatment of treatments.slice(0, 3)) {
    totalConfidence += treatment.confidence;
    count++;
  }
  
  for (const product of products.slice(0, 3)) {
    totalConfidence += product.confidence;
    count++;
  }
  
  return count > 0 ? totalConfidence / count : 0.7;
}
