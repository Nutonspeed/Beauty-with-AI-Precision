/**
 * Seasonal Skincare Recommendations Engine
 * Analyzes seasonal and climate conditions to provide customized skincare routines
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Climate = 'tropical' | 'temperate' | 'arid' | 'cold' | 'humid';
export type SkinType = 'normal' | 'oily' | 'dry' | 'combination' | 'sensitive';

export interface SeasonalEnvironment {
  season: Season;
  climate: Climate;
  temperature: number; // Celsius
  humidity: number; // 0-100
  uvIndex: number; // 0-11+
  airQuality: number; // 0-500 (AQI)
  location?: string;
}

export interface SkincareProduct {
  id: string;
  name: string;
  type: 'cleanser' | 'toner' | 'moisturizer' | 'serum' | 'sunscreen' | 'mask' | 'oil';
  skinTypeCompatible: SkinType[];
  seasonalRecommendation: Partial<Record<Season, number>>; // Priority 0-10
  climateRecommendation: Partial<Record<Climate, number>>; // Priority 0-10
  benefits: string[];
  ingredients: string[];
  useFrequency: 'daily' | 'twice-daily' | '2-3-times' | 'weekly' | 'as-needed';
}

export interface SkincareRoutine {
  id: string;
  name: string;
  season: Season;
  climate: Climate;
  skinType: SkinType;
  morning: SkincareProduct[];
  evening: SkincareProduct[];
  weekly: SkincareProduct[];
  tips: string[];
  weatherAlerts: string[];
  estimatedDuration: {
    morning: number; // minutes
    evening: number; // minutes
  };
  effectiveness: number; // 0-100
}

export interface SeasonalRecommendation {
  id: string;
  season: Season;
  climate: Climate;
  skinType: SkinType;
  environment: SeasonalEnvironment;
  routineChanges: {
    category: string;
    change: string;
    reason: string;
  }[];
  products: SkincareProduct[];
  precautions: string[];
  hydrationLevel: number; // 0-100 recommendation
  sunProtection: number; // SPF equivalent recommendation
  priorityAreas: string[];
  monthlyFocus: string;
  generatedAt: Date;
}

export class SeasonalSkincareEngine {
  static readonly CLIMATE_CONDITIONS: Record<Climate, { tempRange: [number, number]; humidityRange: [number, number] }> = {
    tropical: { tempRange: [25, 35], humidityRange: [70, 90] },
    temperate: { tempRange: [5, 25], humidityRange: [40, 70] },
    arid: { tempRange: [15, 40], humidityRange: [10, 30] },
    cold: { tempRange: [-20, 5], humidityRange: [20, 50] },
    humid: { tempRange: [15, 30], humidityRange: [60, 90] },
  };

  static readonly SEASONAL_RECOMMENDATIONS: Record<
    Season,
    {
      avgTemp: number;
      humidity: number;
      uvIndex: number;
      skinChallenges: string[];
      priorityNeeds: string[];
    }
  > = {
    spring: {
      avgTemp: 15,
      humidity: 55,
      uvIndex: 6,
      skinChallenges: ['pollen sensitivity', 'transitional dryness', 'sensitivity increase'],
      priorityNeeds: ['gentle cleansing', 'light hydration', 'allergen protection'],
    },
    summer: {
      avgTemp: 28,
      humidity: 65,
      uvIndex: 9,
      skinChallenges: ['sun damage', 'excessive sebum', 'sweat buildup', 'photodamage'],
      priorityNeeds: ['UV protection', 'oil control', 'lightweight moisturizer', 'sweat management'],
    },
    autumn: {
      avgTemp: 12,
      humidity: 50,
      uvIndex: 4,
      skinChallenges: ['cooling temperature shock', 'humidity drop', 'barrier damage'],
      priorityNeeds: ['richer moisturizer', 'barrier repair', 'hydration boost'],
    },
    winter: {
      avgTemp: 0,
      humidity: 35,
      uvIndex: 2,
      skinChallenges: ['extreme dryness', 'wind damage', 'heating system stress', 'reduced barrier'],
      priorityNeeds: ['intensive hydration', 'barrier protection', 'oil-based products', 'gentle routine'],
    },
  };

  static readonly PRODUCT_DATABASE: SkincareProduct[] = [
    {
      id: 'product_gentle_cleanser',
      name: 'Gentle Hydrating Cleanser',
      type: 'cleanser',
      skinTypeCompatible: ['normal', 'dry', 'sensitive', 'combination'],
      seasonalRecommendation: { spring: 8, summer: 6, autumn: 8, winter: 9 },
      climateRecommendation: { tropical: 7, temperate: 8, arid: 9, cold: 9, humid: 8 },
      benefits: ['removes impurities', 'maintains hydration', 'gentle on barrier'],
      ingredients: ['ceramides', 'hyaluronic acid', 'glycerin'],
      useFrequency: 'twice-daily',
    },
    {
      id: 'product_moisturizer_light',
      name: 'Lightweight Daily Moisturizer',
      type: 'moisturizer',
      skinTypeCompatible: ['normal', 'oily', 'combination'],
      seasonalRecommendation: { spring: 7, summer: 8, autumn: 5, winter: 2 },
      climateRecommendation: { tropical: 9, temperate: 6, arid: 3, cold: 1, humid: 8 },
      benefits: ['fast absorption', 'non-greasy', 'balances hydration'],
      ingredients: ['niacinamide', 'water-resistant polymers'],
      useFrequency: 'daily',
    },
    {
      id: 'product_moisturizer_rich',
      name: 'Rich Nourishing Cream',
      type: 'moisturizer',
      skinTypeCompatible: ['dry', 'sensitive', 'normal'],
      seasonalRecommendation: { spring: 3, summer: 1, autumn: 7, winter: 10 },
      climateRecommendation: { tropical: 1, temperate: 4, arid: 9, cold: 10, humid: 2 },
      benefits: ['deep hydration', 'barrier repair', 'long-lasting protection'],
      ingredients: ['ceramides', 'squalane', 'hyaluronic acid'],
      useFrequency: 'daily',
    },
    {
      id: 'product_sunscreen_daily',
      name: 'Daily SPF 30 Sunscreen',
      type: 'sunscreen',
      skinTypeCompatible: ['normal', 'oily', 'combination'],
      seasonalRecommendation: { spring: 9, summer: 10, autumn: 7, winter: 4 },
      climateRecommendation: { tropical: 10, temperate: 9, arid: 10, cold: 3, humid: 9 },
      benefits: ['UVA/UVB protection', 'lightweight', 'non-comedogenic'],
      ingredients: ['zinc oxide', 'titanium dioxide', 'niacinamide'],
      useFrequency: 'daily',
    },
    {
      id: 'product_serum_hydrating',
      name: 'Hydrating Hyaluronic Serum',
      type: 'serum',
      skinTypeCompatible: ['normal', 'dry', 'sensitive', 'combination'],
      seasonalRecommendation: { spring: 7, summer: 5, autumn: 8, winter: 9 },
      climateRecommendation: { tropical: 6, temperate: 8, arid: 10, cold: 9, humid: 7 },
      benefits: ['boosts hydration', 'plumps skin', 'lightweight'],
      ingredients: ['hyaluronic acid', 'glycerin'],
      useFrequency: 'daily',
    },
    {
      id: 'product_oilcontrol',
      name: 'Oil Control Mattifying Toner',
      type: 'toner',
      skinTypeCompatible: ['oily', 'combination'],
      seasonalRecommendation: { spring: 5, summer: 9, autumn: 3, winter: 1 },
      climateRecommendation: { tropical: 9, temperate: 6, arid: 1, cold: 0, humid: 8 },
      benefits: ['regulates sebum', 'mattifies', 'preps skin'],
      ingredients: ['salicylic acid', 'niacinamide', 'witch hazel'],
      useFrequency: 'twice-daily',
    },
    {
      id: 'product_face_mask_hydrating',
      name: 'Hydrating Sheet Mask',
      type: 'mask',
      skinTypeCompatible: ['normal', 'dry', 'sensitive'],
      seasonalRecommendation: { spring: 6, summer: 3, autumn: 7, winter: 8 },
      climateRecommendation: { tropical: 4, temperate: 6, arid: 9, cold: 8, humid: 3 },
      benefits: ['intensive hydration', 'soothing', 'quick treatment'],
      ingredients: ['hyaluronic acid', 'centella asiatica'],
      useFrequency: 'weekly',
    },
    {
      id: 'product_facial_oil',
      name: 'Nourishing Facial Oil',
      type: 'oil',
      skinTypeCompatible: ['dry', 'sensitive', 'normal'],
      seasonalRecommendation: { spring: 4, summer: 0, autumn: 6, winter: 9 },
      climateRecommendation: { tropical: 1, temperate: 3, arid: 8, cold: 9, humid: 1 },
      benefits: ['deep nourishment', 'barrier support', 'luxurious feel'],
      ingredients: ['jojoba oil', 'rosehip oil', 'squalane'],
      useFrequency: 'as-needed',
    },
  ];

  /**
   * Get current climate classification based on environmental data
   */
  static classifyClimate(environment: SeasonalEnvironment): Climate {
    const { temperature, humidity } = environment;

    // Direct classification based on typical patterns
    if (temperature > 25 && humidity > 70) return 'tropical';
    if (temperature < 0 && humidity < 50) return 'cold';
    if (temperature > 25 && humidity < 40) return 'arid';
    if (humidity > 70 && temperature > 15) return 'humid';

    return 'temperate';
  }

  /**
   * Determine current season
   */
  static determineSeason(month?: number): Season {
    const currentMonth = month ?? new Date().getMonth() + 1;

    if (currentMonth >= 3 && currentMonth <= 5) return 'spring';
    if (currentMonth >= 6 && currentMonth <= 8) return 'summer';
    if (currentMonth >= 9 && currentMonth <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * Assess skin condition changes based on season
   */
  private static getSkinTypeSeasonalGuidance(
    skinType: SkinType,
    season: Season
  ): { recommendations: string[]; risks: string[] } {
    const recommendations: string[] = [];
    const risks: string[] = [];

    switch (skinType) {
      case 'dry':
        if (season === 'winter') {
          recommendations.push('Increase moisturizer strength');
          risks.push('Extreme dehydration risk');
        } else if (season === 'summer') {
          recommendations.push('Switch to lighter hydrating formulas');
        }
        break;
      case 'oily':
        if (season === 'summer') {
          recommendations.push('Use oil-control products daily');
          risks.push('Increased sebum production');
        } else if (season === 'winter') {
          recommendations.push('Can reduce oil-control products');
        }
        break;
      case 'sensitive':
        if (season === 'spring') {
          risks.push('Pollen sensitivity increase');
          recommendations.push('Add barrier-supporting products');
        } else if (season === 'winter') {
          risks.push('Wind and heating damage risk');
        }
        break;
      case 'combination':
        if (season === 'summer') {
          recommendations.push('Balance oil control and hydration');
        }
        break;
    }
    return { recommendations, risks };
  }

  static assessSeasonalImpact(
    currentSeason: Season,
    previousSeason: Season,
    skinType: SkinType
  ): {
    adjustmentNeeded: boolean;
    recommendations: string[];
    riskFactors: string[];
  } {
    const adjustmentNeeded = currentSeason !== previousSeason;
    const recommendations: string[] = [];
    const riskFactors: string[] = [];

    const seasonalData = this.SEASONAL_RECOMMENDATIONS[currentSeason];

    // Add generic seasonal recommendations
    for (const need of seasonalData.priorityNeeds) {
      recommendations.push(`Focus on: ${need}`);
    }

    // Get skin-type specific guidance
    const { recommendations: typeRecs, risks: typeRisks } = this.getSkinTypeSeasonalGuidance(
      skinType,
      currentSeason
    );
    recommendations.push(...typeRecs);
    riskFactors.push(...typeRisks);

    return { adjustmentNeeded, recommendations, riskFactors };
  }

  /**
   * Generate personalized seasonal routine
   */
  static generateSeasonalRoutine(
    skinType: SkinType,
    season: Season,
    climate: Climate,
    environment: SeasonalEnvironment
  ): SkincareRoutine {
    const seasonalRecs = this.SEASONAL_RECOMMENDATIONS[season];

    // Select products based on season, climate, and skin type
    const compatibleProducts = this.PRODUCT_DATABASE.filter(
      (p) =>
        p.skinTypeCompatible.includes(skinType) &&
        (p.seasonalRecommendation[season] ?? 0) > 4 &&
        (p.climateRecommendation[climate] ?? 0) > 4
    );

    // Organize by time of day
    const morningProducts = compatibleProducts
      .filter((p) => p.type !== 'oil' && p.type !== 'mask')
      .slice(0, 3);

    const eveningProducts = compatibleProducts
      .filter(
        (p) => p.type !== 'mask' && !morningProducts.some((mp) => mp.id === p.id)
      )
      .slice(0, 3);

    const weeklyProducts = compatibleProducts.filter((p) => p.type === 'mask');

    const tips: string[] = [];
    for (const challenge of seasonalRecs.skinChallenges) {
      tips.push(`Manage: ${challenge}`);
    }

    // Add weather-specific tips
    const weatherAlerts: string[] = [];
    if (environment.uvIndex > 7) weatherAlerts.push('High UV: Reapply sunscreen frequently');
    if (environment.humidity > 80) weatherAlerts.push('High humidity: Use lightweight formulas');
    if (environment.humidity < 30) weatherAlerts.push('Low humidity: Increase hydration layers');
    if (environment.temperature < 0) weatherAlerts.push('Cold: Protect with richer moisturizers');
    if (environment.airQuality > 200) weatherAlerts.push('Poor air quality: Extra cleansing needed');

    const effectiveness = Math.min(100, 70 + (compatibleProducts.length * 5));

    return {
      id: `routine_${season}_${climate}_${skinType}_${Date.now()}`,
      name: `${season.charAt(0).toUpperCase() + season.slice(1)} Routine for ${skinType} skin`,
      season,
      climate,
      skinType,
      morning: morningProducts,
      evening: eveningProducts,
      weekly: weeklyProducts,
      tips,
      weatherAlerts,
      estimatedDuration: {
        morning: morningProducts.length * 2 + 3,
        evening: eveningProducts.length * 2 + 3,
      },
      effectiveness,
    };
  }

  /**
   * Generate comprehensive seasonal recommendation
   */
  static generateSeasonalRecommendation(
    skinType: SkinType,
    environment: SeasonalEnvironment
  ): SeasonalRecommendation {
    const climate = this.classifyClimate(environment);
    const season = this.determineSeason();

    // Generate routine
    const routine = this.generateSeasonalRoutine(skinType, season, climate, environment);

    // Assess impact
    const impact = this.assessSeasonalImpact(season, 'spring', skinType);

    // Determine hydration and sun protection needs
    const seasonalData = this.SEASONAL_RECOMMENDATIONS[season];
    const hydrationLevel = Math.min(100, environment.humidity < 40 ? 100 : 100 - (environment.humidity - 40) * 0.5);
    const sunProtectionNeeded = Math.ceil(Math.max(30, seasonalData.uvIndex * 5));

    // Priority areas based on season and climate
    const priorityAreas: string[] = [];
    if (seasonalData.uvIndex > 6) priorityAreas.push('face & exposed areas');
    if (environment.humidity > 70) priorityAreas.push('acne-prone zones');
    if (environment.humidity < 30) priorityAreas.push('dry patches & sensitive areas');
    if (environment.temperature < 5) priorityAreas.push('extremities & lips');

    const monthlyFocus = this.getMonthlyFocus(season);

    return {
      id: `recommendation_${season}_${Date.now()}`,
      season,
      climate,
      skinType,
      environment,
      routineChanges: impact.recommendations.map((rec) => ({
        category: 'seasonal_adjustment',
        change: rec,
        reason: 'Seasonal climate change',
      })),
      products: routine.morning.concat(routine.evening, routine.weekly),
      precautions: impact.riskFactors,
      hydrationLevel: Math.round(hydrationLevel),
      sunProtection: sunProtectionNeeded,
      priorityAreas,
      monthlyFocus,
      generatedAt: new Date(),
    };
  }

  /**
   * Get specific focus area for the current month
   */
  static getMonthlyFocus(season: Season): string {
    const focusMap: Record<Season, string> = {
      spring: 'Barrier recovery & allergen protection',
      summer: 'UV defense & oil management',
      autumn: 'Transition & hydration boost',
      winter: 'Intensive moisture & protection',
    };
    return focusMap[season];
  }

  /**
   * Compare routines across seasons for the same skin type
   */
  static compareSeasonalRoutines(skinType: SkinType, climate: Climate, environment: SeasonalEnvironment): {
    currentRoutine: SkincareRoutine;
    adjustments: {
      season: Season;
      addProducts: SkincareProduct[];
      removeProducts: SkincareProduct[];
      frequency: Record<string, string>;
    }[];
  } {
    const season = this.determineSeason();
    const currentRoutine = this.generateSeasonalRoutine(skinType, season, climate, environment);

    const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    const adjustments = seasons.map((s) => {
      const otherRoutine = this.generateSeasonalRoutine(skinType, s, climate, environment);
      const currentIds = new Set(currentRoutine.morning.concat(currentRoutine.evening).map((p) => p.id));
      const otherIds = new Set(otherRoutine.morning.concat(otherRoutine.evening).map((p) => p.id));

      const addProducts = otherRoutine.morning
        .concat(otherRoutine.evening)
        .filter((p) => !currentIds.has(p.id));
      const removeProducts = currentRoutine.morning
        .concat(currentRoutine.evening)
        .filter((p) => !otherIds.has(p.id));

      return {
        season: s,
        addProducts,
        removeProducts,
        frequency: {
          morning: `${otherRoutine.estimatedDuration.morning} min`,
          evening: `${otherRoutine.estimatedDuration.evening} min`,
        },
      };
    });

    return { currentRoutine, adjustments };
  }

  /**
   * Get recommendations for managing specific climate challenges
   */
  static getClimateSpecificTips(climate: Climate, skinType: SkinType): string[] {
    const tipsByClimate: Record<Climate, string[]> = {
      tropical: [
        'Use lightweight, water-based formulas',
        'Double cleanse to remove sweat & pollution',
        ...(skinType === 'oily' ? ['Use clay masks 2x weekly for oil control'] : []),
        ...(skinType === 'dry' ? ['Apply essence layers for hydration'] : []),
      ],
      arid: [
        'Limit exfoliation to 1x weekly',
        'Use humidifier during skincare',
        'Apply moisturizer to damp skin',
        ...(skinType === 'dry' ? ['Use facial oils as final step'] : []),
      ],
      cold: [
        'Minimize water temperature to prevent stripping',
        'Protect face from wind with scarf/moisturizer',
        'Use richer formulas than in other seasons',
        ...(skinType === 'oily' ? [] : ['Skip toners in favor of serums']),
      ],
      humid: [
        'Focus on antioxidants for pollution protection',
        'Use gel or lightweight moisturizers',
        'Check humidity levels & adjust products accordingly',
        ...(skinType === 'oily' ? ['Invest in oil-absorbing sheets'] : []),
      ],
      temperate: ['Adapt routine based on month-to-month changes', 'Transition between seasons gradually'],
    };

    return tipsByClimate[climate] || [];
  }
}
