// Personalized Skincare Routine Generator
// Creates customized skincare routines based on skin analysis

export interface RoutineStep {
  id: string;
  order: number;
  name: string;
  description: string;
  product?: string;
  productId?: string;
  duration?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: 'morning' | 'evening' | 'both';
  instructions: string[];
  benefits: string[];
  category: ProductCategory;
}

export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'essence'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'eye-cream'
  | 'mask'
  | 'exfoliant'
  | 'treatment';

export interface SkincareRoutine {
  id: string;
  name: string;
  description: string;
  skinType: string;
  concerns: string[];
  morningSteps: RoutineStep[];
  eveningSteps: RoutineStep[];
  weeklyTreatments: RoutineStep[];
  estimatedCost: number;
  durationWeeks: number;
  expectedResults: string[];
  warnings: string[];
  timestamp: number;
}

export interface RoutineRecommendation {
  routine: SkincareRoutine;
  alternatives: SkincareRoutine[];
  tips: string[];
  timeline: TimelinePhase[];
}

export interface TimelinePhase {
  week: number;
  focus: string;
  expectedChanges: string[];
  adjustments: string[];
}

export interface IngredientInfo {
  id: string;
  name: string;
  benefits: string[];
  concerns: string[];
  incompatibleWith: string[];
  bestFor: string[];
}

export class SkincareRoutineGenerator {
  private ingredients: Map<string, IngredientInfo>;

  constructor() {
    this.ingredients = this.initializeIngredients();
  }

  /**
   * Generate personalized skincare routine
   */
  generateRoutine(
    skinType: string,
    concerns: string[],
    budget: 'low' | 'medium' | 'high' = 'medium'
  ): RoutineRecommendation {
    // Generate main routine
    const routine = this.createRoutine(skinType, concerns, budget);

    // Generate alternative routines
    const alternatives = this.generateAlternatives(skinType, concerns, budget);

    // Generate tips
    const tips = this.generateTips(skinType, concerns);

    // Generate timeline
    const timeline = this.generateTimeline(concerns);

    return {
      routine,
      alternatives,
      tips,
      timeline,
    };
  }

  /**
   * Create complete skincare routine
   */
  private createRoutine(
    skinType: string,
    concerns: string[],
    budget: 'low' | 'medium' | 'high'
  ): SkincareRoutine {
    const morningSteps: RoutineStep[] = [];
    const eveningSteps: RoutineStep[] = [];
    const weeklyTreatments: RoutineStep[] = [];

    // Morning routine
    morningSteps.push(this.getCleanser(skinType, 'morning', budget));
    morningSteps.push(this.getToner(skinType, 'morning', budget));

    // Add serums based on concerns
    const morningSerums = this.getSerums(concerns, 'morning', budget);
    morningSteps.push(...morningSerums);

    morningSteps.push(this.getEyeCream(concerns, 'morning', budget));
    morningSteps.push(this.getMoisturizer(skinType, 'morning', budget));
    morningSteps.push(this.getSunscreen(budget));

    // Evening routine
    eveningSteps.push(this.getCleanser(skinType, 'evening', budget));
    eveningSteps.push(this.getToner(skinType, 'evening', budget));

    // Add serums based on concerns
    const eveningSerums = this.getSerums(concerns, 'evening', budget);
    eveningSteps.push(...eveningSerums);

    eveningSteps.push(this.getEyeCream(concerns, 'evening', budget));
    eveningSteps.push(this.getMoisturizer(skinType, 'evening', budget));

    // Weekly treatments
    weeklyTreatments.push(this.getExfoliant(skinType, budget));
    weeklyTreatments.push(this.getMask(skinType, concerns, budget));

    // Calculate estimated cost
    const estimatedCost = this.calculateCost(
      [...morningSteps, ...eveningSteps, ...weeklyTreatments],
      budget
    );

    // Generate expected results
    const expectedResults = this.generateExpectedResults(concerns);

    // Generate warnings
    const warnings = this.generateWarnings(concerns, [...morningSteps, ...eveningSteps]);

    return {
      id: `routine-${Date.now()}`,
      name: `${skinType} Skin Routine`,
      description: `Customized routine for ${skinType.toLowerCase()} skin targeting ${concerns.join(', ')}`,
      skinType,
      concerns,
      morningSteps,
      eveningSteps,
      weeklyTreatments,
      estimatedCost,
      durationWeeks: 12,
      expectedResults,
      warnings,
      timestamp: Date.now(),
    };
  }

  /**
   * Get cleanser step
   */
  private getCleanser(
    skinType: string,
    timeOfDay: 'morning' | 'evening',
    budget: string
  ): RoutineStep {
    const _budget = budget
    const cleansers = {
      dry: {
        name: 'Hydrating Cream Cleanser',
        description: 'Gentle, moisturizing cleanser that won\'t strip natural oils',
        productId: 'prod-001',
        instructions: [
          'Wet face with lukewarm water',
          'Apply small amount to fingertips',
          'Gently massage in circular motions for 30-60 seconds',
          'Rinse thoroughly with lukewarm water',
          'Pat dry with soft towel',
        ],
        benefits: [
          'Removes impurities without over-drying',
          'Maintains skin moisture barrier',
          'Leaves skin soft and supple',
        ],
      },
      oily: {
        name: 'Foaming Gel Cleanser',
        description: 'Deep-cleansing formula that controls excess oil',
        productId: 'prod-004',
        instructions: [
          'Wet face with warm water',
          'Apply small amount and work into lather',
          'Massage onto face for 30-60 seconds',
          'Focus on T-zone area',
          'Rinse thoroughly and pat dry',
        ],
        benefits: [
          'Controls excess sebum production',
          'Prevents clogged pores',
          'Leaves skin feeling fresh',
        ],
      },
      combination: {
        name: 'Balancing Gel Cleanser',
        description: 'Gentle formula that balances both dry and oily areas',
        productId: 'prod-005',
        instructions: [
          'Wet face with lukewarm water',
          'Apply cleanser to entire face',
          'Gently massage in circular motions',
          'Pay attention to both oily and dry zones',
          'Rinse well and pat dry',
        ],
        benefits: [
          'Balances skin pH',
          'Addresses both dryness and oiliness',
          'Gentle enough for daily use',
        ],
      },
      sensitive: {
        name: 'Ultra-Gentle Cleanser',
        description: 'Fragrance-free, hypoallergenic formula',
        productId: 'prod-001',
        instructions: [
          'Use lukewarm water only',
          'Apply minimal amount of cleanser',
          'Gently press and massage (no rubbing)',
          'Rinse quickly and thoroughly',
          'Pat dry very gently',
        ],
        benefits: [
          'Minimizes irritation',
          'Preserves skin barrier',
          'Soothes sensitive skin',
        ],
      },
      normal: {
        name: 'Daily Gentle Cleanser',
        description: 'Mild formula for balanced skin',
        productId: 'prod-005',
        instructions: [
          'Wet face with lukewarm water',
          'Apply cleanser and massage gently',
          'Cleanse for 30-60 seconds',
          'Rinse thoroughly',
          'Pat dry',
        ],
        benefits: [
          'Maintains skin balance',
          'Gentle daily cleansing',
          'Prepares skin for next steps',
        ],
      },
    };

    const cleanser = cleansers[skinType.toLowerCase() as keyof typeof cleansers] || cleansers.normal;

    return {
      id: `cleanser-${timeOfDay}`,
      order: 1,
      name: cleanser.name,
      description: cleanser.description,
      productId: cleanser.productId,
      frequency: 'daily',
      timeOfDay,
      instructions: cleanser.instructions,
      benefits: cleanser.benefits,
      category: 'cleanser',
    };
  }

  /**
   * Get toner step
   */
  private getToner(
    skinType: string,
    timeOfDay: 'morning' | 'evening',
    budget: string
  ): RoutineStep {
    const _budget = budget
    return {
      id: `toner-${timeOfDay}`,
      order: 2,
      name: 'Balancing Toner',
      description: 'Restores pH balance and prepares skin for serums',
      productId: 'prod-003',
      frequency: 'daily',
      timeOfDay,
      instructions: [
        'Apply toner to cotton pad or palm',
        'Gently pat onto clean, damp skin',
        'Cover entire face and neck',
        'Allow to absorb for 30 seconds',
        'Do not rinse',
      ],
      benefits: [
        'Balances skin pH',
        'Enhances absorption of next products',
        'Provides light hydration',
        'Minimizes appearance of pores',
      ],
      category: 'toner',
    };
  }

  /**
   * Get serums based on concerns
   */
  private getSerums(
    concerns: string[],
    timeOfDay: 'morning' | 'evening',
    budget: string
  ): RoutineStep[] {
    const _budget = budget
    const serums: RoutineStep[] = [];
    let order = 3;

    // Morning serums
    if (timeOfDay === 'morning') {
      if (concerns.includes('dark spots') || concerns.includes('uneven skin tone')) {
        serums.push({
          id: 'serum-brightening-morning',
          order: order++,
          name: 'Vitamin C Brightening Serum',
          description: 'Brightens skin and evens tone',
          productId: 'prod-002',
          frequency: 'daily',
          timeOfDay: 'morning',
          instructions: [
            'Apply 3-4 drops to fingertips',
            'Gently press onto face and neck',
            'Avoid eye area',
            'Wait 1-2 minutes before next step',
          ],
          benefits: [
            'Brightens complexion',
            'Reduces dark spots',
            'Protects against environmental damage',
            'Boosts collagen production',
          ],
          category: 'serum',
        });
      }

      if (concerns.includes('dehydration')) {
        serums.push({
          id: 'serum-hydrating-morning',
          order: order++,
          name: 'Hyaluronic Acid Serum',
          description: 'Intense hydration booster',
          productId: 'prod-001',
          frequency: 'daily',
          timeOfDay: 'morning',
          instructions: [
            'Apply 2-3 drops to damp skin',
            'Pat gently onto face and neck',
            'Layer under moisturizer',
          ],
          benefits: [
            'Provides deep hydration',
            'Plumps skin',
            'Reduces appearance of fine lines',
          ],
          category: 'serum',
        });
      }
    }

    // Evening serums
    if (timeOfDay === 'evening') {
      if (concerns.includes('fine lines') || concerns.includes('wrinkles')) {
        serums.push({
          id: 'serum-antiaging-evening',
          order: order++,
          name: 'Retinol Night Serum',
          description: 'Anti-aging powerhouse',
          productId: 'prod-003',
          frequency: 'daily',
          timeOfDay: 'evening',
          instructions: [
            'Start with pea-sized amount',
            'Apply to dry skin only',
            'Avoid eye and mouth area',
            'Wait 20 minutes before moisturizer',
            'Start 2-3 times per week, increase gradually',
          ],
          benefits: [
            'Reduces fine lines and wrinkles',
            'Improves skin texture',
            'Boosts cell turnover',
            'Fades dark spots',
          ],
          category: 'serum',
        });
      }

      if (concerns.includes('acne') || concerns.includes('large pores')) {
        serums.push({
          id: 'serum-clarifying-evening',
          order: order++,
          name: 'Niacinamide Treatment Serum',
          description: 'Pore-refining and clarifying',
          productId: 'prod-004',
          frequency: 'daily',
          timeOfDay: 'evening',
          instructions: [
            'Apply 3-4 drops to clean skin',
            'Gently massage into face',
            'Focus on problem areas',
            'Allow to fully absorb',
          ],
          benefits: [
            'Minimizes pore appearance',
            'Reduces blemishes',
            'Regulates oil production',
            'Strengthens skin barrier',
          ],
          category: 'serum',
        });
      }
    }

    return serums;
  }

  /**
   * Get eye cream step
   */
  private getEyeCream(
    concerns: string[],
    timeOfDay: 'morning' | 'evening',
    budget: string
  ): RoutineStep {
    const _concerns = concerns
    const _budget = budget
    const order = timeOfDay === 'morning' ? 5 : 5;

    return {
      id: `eye-cream-${timeOfDay}`,
      order,
      name: 'Eye Renewal Cream',
      description: 'Targets dark circles and fine lines',
      productId: 'prod-006',
      frequency: 'daily',
      timeOfDay,
      instructions: [
        'Dab small amount (rice grain size) onto ring finger',
        'Gently tap around orbital bone',
        'Never pull or rub delicate eye area',
        'Use morning and evening',
      ],
      benefits: [
        'Reduces dark circles',
        'Minimizes fine lines',
        'Hydrates delicate eye area',
        'Reduces puffiness',
      ],
      category: 'eye-cream',
    };
  }

  /**
   * Get moisturizer step
   */
  private getMoisturizer(
    skinType: string,
    timeOfDay: 'morning' | 'evening',
    budget: string
  ): RoutineStep {
    const _budget = budget
    const order = timeOfDay === 'morning' ? 6 : 6;

    const moisturizers = {
      dry: 'Rich Hydrating Cream',
      oily: 'Oil-Free Gel Moisturizer',
      combination: 'Lightweight Lotion',
      sensitive: 'Calming Moisturizer',
      normal: 'Daily Moisturizing Cream',
    };

    return {
      id: `moisturizer-${timeOfDay}`,
      order,
      name: moisturizers[skinType.toLowerCase() as keyof typeof moisturizers] || 'Daily Moisturizer',
      description: 'Locks in hydration and protects skin barrier',
      productId: 'prod-001',
      frequency: 'daily',
      timeOfDay,
      instructions: [
        'Apply dime-sized amount to face and neck',
        'Massage in upward motions',
        'Don\'t forget neck and décolletage',
        'Wait before applying makeup or sunscreen',
      ],
      benefits: [
        'Provides essential hydration',
        'Strengthens skin barrier',
        'Seals in previous products',
        'Keeps skin soft and supple',
      ],
      category: 'moisturizer',
    };
  }

  /**
   * Get sunscreen step
   */
  private getSunscreen(budget: string): RoutineStep {
    const _budget = budget
    return {
      id: 'sunscreen-morning',
      order: 7,
      name: 'Broad Spectrum SPF 50+',
      description: 'Essential UV protection',
      productId: 'prod-007',
      frequency: 'daily',
      timeOfDay: 'morning',
      instructions: [
        'Apply as last step in morning routine',
        'Use 1/4 teaspoon for face',
        'Don\'t forget ears, neck, and hands',
        'Reapply every 2 hours if outdoors',
        'Wait 15 minutes before sun exposure',
      ],
      benefits: [
        'Prevents sun damage and aging',
        'Protects against UVA and UVB rays',
        'Prevents dark spots and hyperpigmentation',
        'Reduces skin cancer risk',
      ],
      category: 'sunscreen',
    };
  }

  /**
   * Get exfoliant for weekly treatment
   */
  private getExfoliant(skinType: string, budget: string): RoutineStep {
    const _budget = budget
    const frequency = skinType.toLowerCase() === 'sensitive' ? 'weekly' : 'weekly';

    return {
      id: 'exfoliant-weekly',
      order: 1,
      name: 'Gentle AHA/BHA Exfoliant',
      description: 'Removes dead skin cells and unclogs pores',
      productId: 'prod-008',
      frequency,
      timeOfDay: 'evening',
      duration: '10 minutes',
      instructions: [
        'Use 2-3 times per week in evening',
        'Apply to clean, dry skin',
        'Avoid eye area',
        'Leave on for 5-10 minutes',
        'Rinse thoroughly',
        'Follow with moisturizer',
        'Always use sunscreen the next day',
      ],
      benefits: [
        'Improves skin texture',
        'Unclogs pores',
        'Fades dark spots',
        'Enhances product absorption',
      ],
      category: 'exfoliant',
    };
  }

  /**
   * Get mask for weekly treatment
   */
  private getMask(skinType: string, concerns: string[], budget: string): RoutineStep {
    const _budget = budget
    let maskType = 'Hydrating Sheet Mask';
    let description = 'Intensive hydration boost';

    if (concerns.includes('acne')) {
      maskType = 'Clay Purifying Mask';
      description = 'Deep cleanses and detoxifies';
    } else if (concerns.includes('fine lines')) {
      maskType = 'Anti-Aging Treatment Mask';
      description = 'Firms and rejuvenates';
    }

    return {
      id: 'mask-weekly',
      order: 2,
      name: maskType,
      description,
      productId: 'prod-009',
      frequency: 'weekly',
      timeOfDay: 'evening',
      duration: '15-20 minutes',
      instructions: [
        'Apply 1-2 times per week',
        'Use on clean, dry skin',
        'Leave on for 15-20 minutes',
        'Relax and let ingredients work',
        'Remove and massage in remaining essence',
        'Follow with regular routine',
      ],
      benefits: [
        'Provides intensive treatment',
        'Addresses specific concerns',
        'Boosts skin radiance',
        'Self-care moment',
      ],
      category: 'mask',
    };
  }

  /**
   * Calculate routine cost
   */
  private calculateCost(steps: RoutineStep[], budget: 'low' | 'medium' | 'high'): number {
    const budgetMultipliers = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
    };

    const baseProductCost: Record<ProductCategory, number> = {
      cleanser: 20,
      toner: 25,
      essence: 40,
      serum: 45,
      moisturizer: 35,
      sunscreen: 30,
      'eye-cream': 40,
      exfoliant: 35,
      mask: 15,
      treatment: 50,
    };

    let totalCost = 0;
    const uniqueCategories = new Set(steps.map(s => s.category));

    for (const category of uniqueCategories) {
      const baseCost = baseProductCost[category] || 30;
      totalCost += baseCost * budgetMultipliers[budget];
    }

    return Math.round(totalCost);
  }

  /**
   * Generate expected results
   */
  private generateExpectedResults(concerns: string[]): string[] {
    const results = [
      'Improved overall skin health and radiance',
      'Stronger, more resilient skin barrier',
      'Better product absorption',
    ];

    if (concerns.includes('acne')) {
      results.push(
        'Reduced breakouts and clearer skin',
        'Minimized pore appearance'
      );
    }

    if (concerns.includes('fine lines') || concerns.includes('wrinkles')) {
      results.push(
        'Smoother skin texture',
        'Reduced appearance of fine lines'
      );
    }

    if (concerns.includes('dark spots') || concerns.includes('uneven skin tone')) {
      results.push(
        'More even skin tone',
        'Faded dark spots and hyperpigmentation'
      );
    }

    if (concerns.includes('dehydration')) {
      results.push(
        'Deeply hydrated, plump skin',
        'Reduced dryness and flaking'
      );
    }

    results.push('Visible results typically seen within 4-12 weeks');

    return results;
  }

  /**
   * Generate warnings
   */
  private generateWarnings(concerns: string[], steps: RoutineStep[]): string[] {
    const warnings: string[] = [];

    // Check for retinol
    const hasRetinol = steps.some(s => s.name.toLowerCase().includes('retinol'));
    if (hasRetinol) {
      warnings.push(
        'Start retinol slowly (2-3 times per week) to avoid irritation',
        'Always use sunscreen when using retinol products',
        'Avoid retinol if pregnant or breastfeeding'
      );
    }

    // Check for acids
    const hasAcids = steps.some(s => 
      s.name.toLowerCase().includes('aha') || 
      s.name.toLowerCase().includes('bha') ||
      s.name.toLowerCase().includes('vitamin c')
    );
    if (hasAcids) {
      warnings.push(
        'Introduce acids gradually to avoid over-exfoliation',
        'Avoid mixing multiple acids in one routine'
      );
    }

    // General warnings
    warnings.push(
      'Patch test new products before full application',
      'Discontinue use if irritation occurs',
      'Consult dermatologist if you have severe skin conditions'
    );

    return warnings;
  }

  /**
   * Generate alternative routines
   */
  private generateAlternatives(
    skinType: string,
    concerns: string[],
    budget: 'low' | 'medium' | 'high'
  ): SkincareRoutine[] {
    const alternatives: SkincareRoutine[] = [];

    // Budget-friendly alternative
    if (budget !== 'low') {
      alternatives.push(this.createRoutine(skinType, concerns, 'low'));
    }

    // Premium alternative
    if (budget !== 'high') {
      alternatives.push(this.createRoutine(skinType, concerns, 'high'));
    }

    return alternatives.slice(0, 2);
  }

  /**
   * Generate tips
   */
  private generateTips(skinType: string, concerns: string[]): string[] {
    const _concerns = concerns
    return [
      'Consistency is key - stick to your routine for at least 4-6 weeks',
      'Always apply products from thinnest to thickest consistency',
      'Don\'t skip sunscreen - it\'s the most important anti-aging step',
      'Listen to your skin and adjust products as needed',
      'Stay hydrated and maintain a healthy diet for best results',
      'Get adequate sleep - skin repairs itself at night',
      'Change pillowcases regularly to prevent breakouts',
      'Avoid touching your face throughout the day',
    ];
  }

  /**
   * Generate timeline phases
   */
  private generateTimeline(concerns: string[]): TimelinePhase[] {
    const _concerns = concerns
    return [
      {
        week: 1,
        focus: 'Adjustment Period',
        expectedChanges: [
          'Skin may purge initially',
          'Getting used to new products',
          'Establishing routine habit',
        ],
        adjustments: [
          'Monitor for any irritation',
          'Reduce frequency if needed',
        ],
      },
      {
        week: 4,
        focus: 'Early Improvements',
        expectedChanges: [
          'Improved skin texture',
          'Better hydration',
          'Reduced inflammation',
        ],
        adjustments: [
          'Can increase active ingredients if tolerated',
          'Fine-tune product amounts',
        ],
      },
      {
        week: 8,
        focus: 'Visible Results',
        expectedChanges: [
          'Clearer complexion',
          'More even skin tone',
          'Reduced appearance of concerns',
        ],
        adjustments: [
          'Continue consistent routine',
          'Consider adding targeted treatments',
        ],
      },
      {
        week: 12,
        focus: 'Maintenance',
        expectedChanges: [
          'Significant improvement in skin health',
          'Established healthy habits',
          'Glowing, balanced skin',
        ],
        adjustments: [
          'Maintain routine',
          'Adjust seasonally as needed',
          'Reassess concerns and goals',
        ],
      },
    ];
  }

  /**
   * Initialize ingredient database
   */
  private initializeIngredients(): Map<string, IngredientInfo> {
    const ingredients = new Map();

    ingredients.set('retinol', {
      id: 'retinol',
      name: 'Retinol',
      benefits: [
        'Reduces fine lines and wrinkles',
        'Improves skin texture',
        'Fades dark spots',
        'Boosts collagen production',
      ],
      concerns: ['aging', 'acne', 'dark spots'],
      incompatibleWith: ['vitamin-c', 'aha', 'bha'],
      bestFor: ['evening use', 'anti-aging'],
    });

    ingredients.set('vitamin-c', {
      id: 'vitamin-c',
      name: 'Vitamin C',
      benefits: [
        'Brightens skin',
        'Evens skin tone',
        'Protects against free radicals',
        'Boosts collagen',
      ],
      concerns: ['dark spots', 'dullness', 'aging'],
      incompatibleWith: ['retinol', 'niacinamide'],
      bestFor: ['morning use', 'brightening'],
    });

    ingredients.set('hyaluronic-acid', {
      id: 'hyaluronic-acid',
      name: 'Hyaluronic Acid',
      benefits: [
        'Deep hydration',
        'Plumps skin',
        'Reduces fine lines',
        'Improves skin texture',
      ],
      concerns: ['dehydration', 'fine lines'],
      incompatibleWith: [],
      bestFor: ['all skin types', 'hydration'],
    });

    ingredients.set('niacinamide', {
      id: 'niacinamide',
      name: 'Niacinamide',
      benefits: [
        'Minimizes pores',
        'Regulates oil',
        'Reduces blemishes',
        'Strengthens barrier',
      ],
      concerns: ['acne', 'large pores', 'oily skin'],
      incompatibleWith: ['vitamin-c'],
      bestFor: ['oily skin', 'acne-prone'],
    });

    return ingredients;
  }
}
