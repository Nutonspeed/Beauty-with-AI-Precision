// Skin Disease Detection System
// Detects 15+ common skin conditions using AI analysis

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

export class SkinDiseaseDetector {
  private knownConditions: Map<string, Omit<SkinCondition, 'confidence' | 'severity'>>;

  constructor() {
    this.knownConditions = this.initializeConditions();
  }

  /**
   * Analyze skin image for conditions
   */
  async analyzeImage(imageData: string | File): Promise<AnalysisResult> {
    // Validate image quality
    const imageQuality = await this.assessImageQuality(imageData);
    
    if (imageQuality.score < 40) {
      throw new Error('Image quality too low for accurate analysis. Please provide a clearer image with better lighting.');
    }

    // Simulate AI analysis (in production, this would call TensorFlow.js or backend AI service)
    const detectedConditions = await this.detectConditions(imageData);
    const skinType = await this.detectSkinType(imageData);
    const skinConcerns = await this.detectSkinConcerns(imageData);
    const overallSkinHealth = this.calculateOverallHealth(detectedConditions, skinConcerns);
    const recommendations = this.generateRecommendations(detectedConditions, skinType, skinConcerns);

    return {
      detectedConditions,
      primaryCondition: detectedConditions[0] || null,
      skinType,
      skinConcerns,
      overallSkinHealth,
      recommendations,
      imageQuality,
      timestamp: Date.now(),
    };
  }

  /**
   * Assess image quality
   */
  private async assessImageQuality(_imageData: string | File): Promise<ImageQuality> {
    // Simulate image quality analysis
    const score = Math.random() * 30 + 70; // 70-100 for demo
    const issues: string[] = [];
    
    let lighting: ImageQuality['lighting'] = 'excellent';
    let resolution: ImageQuality['resolution'] = 'high';
    let clarity: ImageQuality['clarity'] = 'clear';

    if (score < 50) {
      issues.push('Image too dark or overexposed');
      lighting = 'poor';
    } else if (score < 70) {
      issues.push('Uneven lighting');
      lighting = 'fair';
    } else if (score < 85) {
      lighting = 'good';
    }

    if (score < 60) {
      issues.push('Resolution too low');
      resolution = 'low';
    } else if (score < 80) {
      resolution = 'medium';
    }

    if (score < 65) {
      issues.push('Image appears blurry');
      clarity = 'blurry';
    } else if (score < 85) {
      clarity = 'acceptable';
    }

    return {
      score,
      issues,
      lighting,
      resolution,
      clarity,
    };
  }

  /**
   * Detect skin conditions
   */
  private async detectConditions(_imageData: string | File): Promise<SkinCondition[]> {
    // imageData currently unused in demo heuristic; prefixed to silence lint
    // Simulate AI detection (random selection for demo)
    const possibleConditions = Array.from(this.knownConditions.entries());
    const numConditions = Math.floor(Math.random() * 3) + 1; // 1-3 conditions
    
    const detected: SkinCondition[] = [];
    const selectedIndices = new Set<number>();

    while (detected.length < numConditions && selectedIndices.size < possibleConditions.length) {
      const randomIndex = Math.floor(Math.random() * possibleConditions.length);
      
      if (!selectedIndices.has(randomIndex)) {
        selectedIndices.add(randomIndex);
        const [, condition] = possibleConditions[randomIndex];
        
        const confidence = Math.random() * 30 + 70; // 70-100%
        const severity = this.determineSeverity(confidence);

        detected.push({
          ...condition,
          confidence,
          severity,
        });
      }
    }

    // Sort by confidence
    detected.sort((a, b) => b.confidence - a.confidence);

    return detected;
  }

  /**
   * Detect skin type
   */
  private async detectSkinType(imageData: string | File): Promise<SkinType> {
    const _imageData = imageData
    const types: SkinType[] = ['normal', 'dry', 'oily', 'combination', 'sensitive'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Detect skin concerns
   */
  private async detectSkinConcerns(imageData: string | File): Promise<string[]> {
    const _imageData = imageData
    const allConcerns = [
      'Fine lines and wrinkles',
      'Dark spots and hyperpigmentation',
      'Uneven skin tone',
      'Large pores',
      'Dullness',
      'Dehydration',
      'Redness and irritation',
      'Loss of firmness',
      'Dark circles',
      'Texture irregularities',
    ];

    const numConcerns = Math.floor(Math.random() * 4) + 2; // 2-5 concerns
    const selected: string[] = [];
    const indices = new Set<number>();

    while (selected.length < numConcerns) {
      const index = Math.floor(Math.random() * allConcerns.length);
      if (!indices.has(index)) {
        indices.add(index);
        selected.push(allConcerns[index]);
      }
    }

    return selected;
  }

  /**
   * Determine severity based on confidence
   */
  private determineSeverity(confidence: number): 'mild' | 'moderate' | 'severe' {
    if (confidence >= 85) return 'severe';
    if (confidence >= 70) return 'moderate';
    return 'mild';
  }

  /**
   * Calculate overall skin health score
   */
  private calculateOverallHealth(conditions: SkinCondition[], concerns: string[]): number {
    let score = 100;

    // Deduct points for conditions
    for (const condition of conditions) {
      if (condition.severity === 'severe') score -= 15;
      else if (condition.severity === 'moderate') score -= 10;
      else score -= 5;
    }

    // Deduct points for concerns
    score -= concerns.length * 3;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    conditions: SkinCondition[],
    skinType: SkinType,
    _concerns: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Condition-specific recommendations
    for (const condition of conditions) {
      if (condition.severity === 'severe' || condition.severity === 'moderate') {
        recommendations.push(condition.whenToSeeDermatologist);
      }
      recommendations.push(...condition.treatments.slice(0, 2));
    }

    // Skin type recommendations
    const skinTypeRecs = {
      normal: ['Maintain with gentle cleanser and moisturizer', 'Use SPF 30+ daily'],
      dry: ['Use rich, hydrating moisturizer twice daily', 'Avoid harsh cleansers', 'Consider hyaluronic acid serum'],
      oily: ['Use oil-free, non-comedogenic products', 'Cleanse twice daily', 'Consider salicylic acid treatment'],
      combination: ['Use different products for T-zone and dry areas', 'Balance with gentle, pH-balanced cleanser'],
      sensitive: ['Use fragrance-free, hypoallergenic products', 'Patch test new products', 'Avoid harsh exfoliants'],
    };

    recommendations.push(...skinTypeRecs[skinType]);

    // General recommendations
    recommendations.push(
      'Drink at least 8 glasses of water daily',
      'Get 7-9 hours of sleep each night',
      'Protect skin from sun exposure',
      'Maintain a balanced diet rich in antioxidants'
    );

    // Remove duplicates
    return Array.from(new Set(recommendations));
  }

  /**
   * Initialize known skin conditions database
   */
  private initializeConditions(): Map<string, Omit<SkinCondition, 'confidence' | 'severity'>> {
    const conditions = new Map();

    // Acne
    conditions.set('acne', {
      id: 'acne',
      name: 'Acne Vulgaris',
      description: 'Common skin condition causing pimples, blackheads, and whiteheads due to clogged hair follicles.',
      symptoms: [
        'Blackheads and whiteheads',
        'Papules (small red bumps)',
        'Pustules (pimples with pus)',
        'Nodules (large, painful lumps)',
        'Cysts (painful, pus-filled lumps)',
      ],
      causes: [
        'Excess oil production',
        'Clogged hair follicles',
        'Bacteria',
        'Hormonal changes',
        'Certain medications',
        'Diet (high in refined sugars)',
      ],
      treatments: [
        'Use benzoyl peroxide or salicylic acid cleansers',
        'Apply topical retinoids at night',
        'Keep skin clean but avoid over-washing',
        'Avoid touching or picking at acne',
        'Use non-comedogenic moisturizers',
      ],
      recommendedProducts: ['prod-004', 'prod-005'],
      whenToSeeDermatologist: 'See a dermatologist if acne is severe, painful, or not responding to over-the-counter treatments',
    });

    // Eczema
    conditions.set('eczema', {
      id: 'eczema',
      name: 'Atopic Dermatitis (Eczema)',
      description: 'Chronic condition causing inflamed, itchy, and dry skin patches.',
      symptoms: [
        'Dry, sensitive skin',
        'Intense itching',
        'Red to brownish-gray patches',
        'Small, raised bumps',
        'Thickened, cracked skin',
        'Raw, swollen skin from scratching',
      ],
      causes: [
        'Genetic factors',
        'Dry skin',
        'Immune system dysfunction',
        'Environmental triggers',
        'Irritants (soaps, detergents)',
        'Stress',
      ],
      treatments: [
        'Apply thick moisturizers frequently',
        'Use gentle, fragrance-free cleansers',
        'Take lukewarm (not hot) showers',
        'Apply topical corticosteroids as prescribed',
        'Avoid scratching',
        'Identify and avoid triggers',
      ],
      recommendedProducts: ['prod-001'],
      whenToSeeDermatologist: 'Consult a dermatologist if symptoms worsen, spread, or interfere with daily activities',
    });

    // Rosacea
    conditions.set('rosacea', {
      id: 'rosacea',
      name: 'Rosacea',
      description: 'Chronic skin condition causing redness and visible blood vessels, primarily on the face.',
      symptoms: [
        'Facial redness',
        'Visible blood vessels',
        'Swollen, red bumps',
        'Eye irritation',
        'Burning or stinging sensation',
        'Thickened skin (in advanced cases)',
      ],
      causes: [
        'Genetic predisposition',
        'Abnormal blood vessels',
        'Demodex mites',
        'Triggers: alcohol, spicy foods, hot beverages',
        'Sun exposure',
        'Stress and temperature extremes',
      ],
      treatments: [
        'Avoid known triggers',
        'Use gentle skincare products',
        'Apply SPF 30+ daily',
        'Use green-tinted primers to reduce redness',
        'Apply prescribed topical medications',
        'Consider laser therapy for visible blood vessels',
      ],
      whenToSeeDermatologist: 'See a dermatologist for persistent redness or if symptoms affect your confidence',
    });

    // Psoriasis
    conditions.set('psoriasis', {
      id: 'psoriasis',
      name: 'Psoriasis',
      description: 'Autoimmune condition causing rapid skin cell buildup, resulting in scaling on the skin surface.',
      symptoms: [
        'Red patches covered with thick, silvery scales',
        'Dry, cracked skin that may bleed',
        'Itching, burning, or soreness',
        'Thickened or ridged nails',
        'Swollen and stiff joints',
      ],
      causes: [
        'Immune system dysfunction',
        'Genetic factors',
        'Environmental triggers',
        'Infections',
        'Stress',
        'Cold, dry weather',
      ],
      treatments: [
        'Apply moisturizers to keep skin hydrated',
        'Use topical corticosteroids',
        'Apply coal tar or salicylic acid products',
        'Get controlled sun exposure',
        'Manage stress levels',
        'Consider phototherapy for widespread psoriasis',
      ],
      whenToSeeDermatologist: 'Consult a dermatologist for proper diagnosis and treatment plan, especially for moderate to severe cases',
    });

    // Melasma
    conditions.set('melasma', {
      id: 'melasma',
      name: 'Melasma',
      description: 'Common skin condition causing brown or gray-brown patches, typically on the face.',
      symptoms: [
        'Symmetrical brown or gray-brown patches',
        'Patches on cheeks, forehead, bridge of nose, upper lip',
        'Darkening with sun exposure',
        'No other symptoms (not itchy or painful)',
      ],
      causes: [
        'Sun exposure',
        'Hormonal changes (pregnancy, birth control)',
        'Genetic predisposition',
        'Certain medications',
        'Thyroid disease',
      ],
      treatments: [
        'Use SPF 50+ broad-spectrum sunscreen daily',
        'Apply vitamin C serum in the morning',
        'Use hydroquinone cream as prescribed',
        'Try kojic acid or azelaic acid products',
        'Consider chemical peels',
        'Avoid sun exposure and wear wide-brimmed hats',
      ],
      recommendedProducts: ['prod-002'],
      whenToSeeDermatologist: 'See a dermatologist for prescription treatments if over-the-counter products are ineffective',
    });

    // Hyperpigmentation
    conditions.set('hyperpigmentation', {
      id: 'hyperpigmentation',
      name: 'Post-Inflammatory Hyperpigmentation',
      description: 'Dark spots left behind after skin inflammation or injury heals.',
      symptoms: [
        'Flat, darkened patches',
        'Color ranges from pink to red, brown, or black',
        'No change in skin texture',
        'May fade over time',
      ],
      causes: [
        'Acne scarring',
        'Injury to the skin',
        'Inflammation',
        'Eczema or psoriasis',
        'Cosmetic procedures',
      ],
      treatments: [
        'Use vitamin C and niacinamide serums',
        'Apply retinoids to promote cell turnover',
        'Use alpha hydroxy acids (AHAs)',
        'Always wear sunscreen to prevent darkening',
        'Consider laser treatments for stubborn spots',
        'Be patient - can take months to fade',
      ],
      recommendedProducts: ['prod-002', 'prod-004'],
      whenToSeeDermatologist: 'Consult a dermatologist if spots don\'t fade or for professional treatment options',
    });

    // Seborrheic Dermatitis
    conditions.set('seborrheic_dermatitis', {
      id: 'seborrheic_dermatitis',
      name: 'Seborrheic Dermatitis',
      description: 'Common skin condition mainly affecting the scalp, causing scaly patches and dandruff.',
      symptoms: [
        'Flaky, white or yellow scales',
        'Red skin',
        'Itching',
        'Dandruff (on scalp)',
        'Greasy, oily patches',
      ],
      causes: [
        'Malassezia yeast overgrowth',
        'Excess oil production',
        'Immune system response',
        'Stress',
        'Cold, dry weather',
      ],
      treatments: [
        'Use medicated shampoos with zinc pyrithione',
        'Apply antifungal creams',
        'Keep affected areas clean and dry',
        'Manage stress levels',
        'Avoid harsh soaps and detergents',
      ],
      whenToSeeDermatologist: 'See a dermatologist if condition is severe or doesn\'t improve with over-the-counter treatments',
    });

    // Contact Dermatitis
    conditions.set('contact_dermatitis', {
      id: 'contact_dermatitis',
      name: 'Contact Dermatitis',
      description: 'Red, itchy rash caused by direct contact with a substance or allergic reaction.',
      symptoms: [
        'Red rash',
        'Itching',
        'Dry, cracked skin',
        'Bumps and blisters',
        'Swelling and tenderness',
        'Burning or stinging',
      ],
      causes: [
        'Soaps and detergents',
        'Cosmetics and skincare products',
        'Jewelry (nickel)',
        'Plants (poison ivy)',
        'Fragrances and preservatives',
      ],
      treatments: [
        'Identify and avoid the allergen/irritant',
        'Wash affected area with mild soap',
        'Apply cool, wet compresses',
        'Use over-the-counter hydrocortisone cream',
        'Take antihistamines for itching',
      ],
      whenToSeeDermatologist: 'Consult a dermatologist for patch testing to identify allergens or if rash is severe',
    });

    // Keratosis Pilaris
    conditions.set('keratosis_pilaris', {
      id: 'keratosis_pilaris',
      name: 'Keratosis Pilaris',
      description: 'Common, harmless skin condition causing small, rough bumps.',
      symptoms: [
        'Small, hard bumps',
        'Usually on upper arms, thighs, or buttocks',
        'Dry, rough texture',
        'Bumps may be white, red, or skin-colored',
        'Worsens in dry weather',
      ],
      causes: [
        'Keratin buildup',
        'Genetic factors',
        'Dry skin',
        'Often improves with age',
      ],
      treatments: [
        'Use gentle exfoliating cleansers',
        'Apply moisturizers with urea or lactic acid',
        'Try chemical exfoliants (AHAs, BHAs)',
        'Avoid hot showers',
        'Don\'t pick or scratch bumps',
      ],
      whenToSeeDermatologist: 'Generally harmless, but see a dermatologist if you\'re concerned about appearance',
    });

    // Perioral Dermatitis
    conditions.set('perioral_dermatitis', {
      id: 'perioral_dermatitis',
      name: 'Perioral Dermatitis',
      description: 'Facial rash around the mouth, nose, and sometimes eyes.',
      symptoms: [
        'Red, bumpy rash around mouth',
        'May spread to nose and eyes',
        'Burning or stinging sensation',
        'Dry, flaky skin',
        'Small pustules',
      ],
      causes: [
        'Topical steroid use',
        'Heavy moisturizers',
        'Fluorinated toothpaste',
        'Hormonal factors',
        'Bacteria or fungi',
      ],
      treatments: [
        'Stop using topical steroids',
        'Switch to gentler skincare products',
        'Use non-fluorinated toothpaste',
        'Apply prescribed antibiotics',
        'Avoid heavy creams around mouth',
      ],
      whenToSeeDermatologist: 'Dermatologist consultation recommended for proper diagnosis and antibiotic prescription',
    });

    // Age Spots
    conditions.set('age_spots', {
      id: 'age_spots',
      name: 'Age Spots (Solar Lentigines)',
      description: 'Flat, brown spots on sun-exposed skin, common with aging.',
      symptoms: [
        'Flat, oval-shaped spots',
        'Brown, black, or gray color',
        'On sun-exposed areas (face, hands, shoulders)',
        'Larger than freckles',
        'No change in texture',
      ],
      causes: [
        'UV exposure over years',
        'Aging',
        'Genetics',
        'Frequent tanning bed use',
      ],
      treatments: [
        'Use SPF 50+ daily',
        'Apply skin-lightening creams',
        'Try vitamin C serum',
        'Consider laser therapy',
        'Chemical peels',
        'Cryotherapy for individual spots',
      ],
      recommendedProducts: ['prod-002'],
      whenToSeeDermatologist: 'See a dermatologist to rule out skin cancer or for professional removal options',
    });

    // Milia
    conditions.set('milia', {
      id: 'milia',
      name: 'Milia',
      description: 'Small, white bumps commonly found on the face, especially around eyes.',
      symptoms: [
        'Small, white or yellow bumps',
        'Usually around eyes, nose, cheeks',
        'Firm to touch',
        'Not painful or itchy',
        'Can persist for weeks to months',
      ],
      causes: [
        'Trapped keratin under skin',
        'Skin damage (burns, rashes)',
        'Heavy skincare products',
        'Sun damage',
      ],
      treatments: [
        'Use gentle exfoliants (AHAs, retinoids)',
        'Avoid heavy creams around eyes',
        'Don\'t try to squeeze or pop',
        'Professional extraction by dermatologist',
        'Chemical peels',
      ],
      whenToSeeDermatologist: 'See a dermatologist for safe extraction if milia don\'t resolve on their own',
    });

    // Sun Damage
    conditions.set('sun_damage', {
      id: 'sun_damage',
      name: 'Photoaging (Sun Damage)',
      description: 'Premature aging of skin caused by repeated UV exposure.',
      symptoms: [
        'Wrinkles and fine lines',
        'Uneven skin tone',
        'Age spots and freckles',
        'Rough, leathery texture',
        'Visible blood vessels',
        'Loss of elasticity',
      ],
      causes: [
        'Chronic UV exposure',
        'Lack of sun protection',
        'Tanning beds',
        'Outdoor activities without protection',
      ],
      treatments: [
        'Use SPF 50+ broad-spectrum sunscreen daily',
        'Apply retinoids to boost collagen',
        'Use antioxidant serums (vitamins C and E)',
        'Consider professional treatments (lasers, peels)',
        'Avoid further sun exposure',
      ],
      recommendedProducts: ['prod-002', 'prod-003'],
      whenToSeeDermatologist: 'Regular skin checks recommended to monitor for skin cancer',
    });

    // Vitiligo
    conditions.set('vitiligo', {
      id: 'vitiligo',
      name: 'Vitiligo',
      description: 'Condition causing loss of skin color in patches.',
      symptoms: [
        'Patchy loss of skin color',
        'Premature whitening of hair',
        'Loss of color in mouth and nose',
        'Usually symmetrical patterns',
      ],
      causes: [
        'Autoimmune disorder',
        'Genetic factors',
        'Trigger events (stress, sunburn)',
      ],
      treatments: [
        'Protect skin from sun',
        'Use camouflage makeup',
        'Topical corticosteroids',
        'Phototherapy (light therapy)',
        'Skin grafting for stable vitiligo',
      ],
      whenToSeeDermatologist: 'Dermatologist consultation essential for diagnosis and treatment plan',
    });

    // Warts
    conditions.set('warts', {
      id: 'warts',
      name: 'Common Warts',
      description: 'Small, grainy skin growths caused by HPV virus.',
      symptoms: [
        'Small, rough growths',
        'Usually on fingers or hands',
        'Grainy appearance',
        'May have black dots (blood vessels)',
        'Can be single or in clusters',
      ],
      causes: [
        'Human papillomavirus (HPV)',
        'Direct contact with warts',
        'Weakened immune system',
        'Skin breaks or damage',
      ],
      treatments: [
        'Over-the-counter salicylic acid treatments',
        'Cryotherapy (freezing)',
        'Duct tape occlusion therapy',
        'Don\'t pick or scratch',
        'Prescription treatments if needed',
      ],
      whenToSeeDermatologist: 'See a dermatologist if warts are painful, spreading, or on face/genitals',
    });

    return conditions;
  }

  /**
   * Get condition details by ID
   */
  getConditionInfo(conditionId: string): Omit<SkinCondition, 'confidence' | 'severity'> | null {
    return this.knownConditions.get(conditionId) || null;
  }

  /**
   * Get all known conditions
   */
  getAllConditions(): Array<Omit<SkinCondition, 'confidence' | 'severity'>> {
    return Array.from(this.knownConditions.values());
  }
}
