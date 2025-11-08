/**
 * Skin Type Classification Engine
 * Analyzes skin characteristics and classifies into predefined skin types
 * Provides confidence scoring and historical tracking
 */

export type SkinType = 'normal' | 'oily' | 'dry' | 'combination' | 'sensitive';

export interface SkinCharacteristics {
  sebumLevel: number; // 0-100 (0=dry, 100=oily)
  hydrationLevel: number; // 0-100 (0=dehydrated, 100=well-hydrated)
  sensitivityScore: number; // 0-100 (0=not sensitive, 100=very sensitive)
  poreSize: number; // 0-100 (0=very small, 100=very large)
  textureRoughness: number; // 0-100 (0=smooth, 100=rough)
  acneScore: number; // 0-100 (0=no acne, 100=severe acne)
  rednessLevel: number; // 0-100 (0=none, 100=very red)
  shininess: number; // 0-100 (0=matte, 100=very shiny)
}

export interface ClassificationResult {
  skinType: SkinType;
  confidence: number; // 0-100
  characteristics: SkinCharacteristics;
  indicators: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface ClassificationHistory {
  results: ClassificationResult[];
  averageType: SkinType;
  trend: 'stable' | 'improving' | 'worsening';
  trendDescription: string;
}

export class SkinTypeClassifier {
  /**
   * Classification thresholds and scoring rules
   */
  private static readonly CLASSIFICATION_RULES = {
    normal: {
      sebumLow: 30,
      sebumHigh: 60,
      hydrationLow: 40,
      hydrationHigh: 80,
      sensitivityMax: 40,
      acneMax: 25,
      description: 'Balanced skin with minimal sensitivity',
    },
    oily: {
      sebumMin: 60,
      hydrationMin: 30,
      shininessMin: 60,
      poreMin: 60,
      description: 'Excess sebum production, enlarged pores',
    },
    dry: {
      sebumMax: 30,
      hydrationMax: 40,
      roughnessMin: 50,
      description: 'Insufficient moisture and sebum production',
    },
    combination: {
      tZoneOily: true, // T-zone more oily
      cheeksNormal: true,
      description: 'Oily T-zone with normal/dry cheeks',
    },
    sensitive: {
      sensitivityMin: 60,
      rednessMin: 40,
      description: 'Reactive to irritants and environmental factors',
    },
  };

  private static readonly CHARACTERISTIC_WEIGHTS = {
    sebumLevel: 0.25,
    hydrationLevel: 0.2,
    sensitivityScore: 0.15,
    poreSize: 0.15,
    textureRoughness: 0.1,
    acneScore: 0.08,
    rednessLevel: 0.05,
    shininess: 0.02,
  };

  /**
   * Classifies skin based on characteristics
   */
  static classify(characteristics: SkinCharacteristics): ClassificationResult {
    const scores = this.calculateTypeScores(characteristics);
    const skinType = this.determineSkinType(scores);
    const confidence = this.calculateConfidence(scores, skinType);
    const indicators = this.generateIndicators(characteristics, skinType);
    const recommendations = this.generateRecommendations(skinType, characteristics);

    return {
      skinType,
      confidence,
      characteristics,
      indicators,
      recommendations,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate scoring for each skin type
   */
  private static calculateTypeScores(characteristics: SkinCharacteristics): Record<SkinType, number> {
    const scores: Record<SkinType, number> = {
      normal: 0,
      oily: 0,
      dry: 0,
      combination: 0,
      sensitive: 0,
    };

    // Normal skin scoring
    scores.normal += this.scoreNormalSkin(characteristics);
    // Oily skin scoring
    scores.oily += this.scoreOilySkin(characteristics);
    // Dry skin scoring
    scores.dry += this.scoreDrySkin(characteristics);
    // Combination skin scoring
    scores.combination += this.scoreCombinationSkin(characteristics);
    // Sensitive skin scoring
    scores.sensitive += this.scoreSensitiveSkin(characteristics);

    return scores;
  }

  private static scoreNormalSkin(c: SkinCharacteristics): number {
    let score = 0;
    if (c.sebumLevel >= 30 && c.sebumLevel <= 60 && c.hydrationLevel >= 40 && c.hydrationLevel <= 80) score += 40;
    if (c.acneScore < 25) score += 15;
    if (c.sensitivityScore < 40) score += 15;
    if (c.rednessLevel < 30) score += 10;
    return score;
  }

  private static scoreOilySkin(c: SkinCharacteristics): number {
    let score = 0;
    if (c.sebumLevel >= 60) score += 50;
    if (c.shininess >= 60) score += 20;
    if (c.poreSize >= 60) score += 15;
    if (c.acneScore >= 40) score += 10;
    return score;
  }

  private static scoreDrySkin(c: SkinCharacteristics): number {
    let score = 0;
    if (c.sebumLevel <= 30) score += 40;
    if (c.hydrationLevel <= 40) score += 35;
    if (c.textureRoughness >= 50) score += 15;
    return score;
  }

  private static scoreCombinationSkin(c: SkinCharacteristics): number {
    let score = 0;
    const tZoneScore = Math.min(100, c.sebumLevel + c.shininess) / 2;
    const cheekScore = c.hydrationLevel;
    if (tZoneScore > 60 && cheekScore < 60) score += 60;
    if (Math.abs(c.sebumLevel - c.hydrationLevel) > 40) score += 25;
    return score;
  }

  private static scoreSensitiveSkin(c: SkinCharacteristics): number {
    let score = 0;
    if (c.sensitivityScore >= 60) score += 60;
    if (c.rednessLevel >= 40) score += 20;
    if (c.acneScore >= 50) score += 15;
    return score;
  }

  /**
   * Determine skin type from scores
   */
  private static determineSkinType(scores: Record<SkinType, number>): SkinType {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    return (sorted[0][0] as SkinType) || 'normal';
  }

  /**
   * Calculate confidence percentage
   */
  private static calculateConfidence(scores: Record<SkinType, number>, skinType: SkinType): number {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    if (totalScore === 0) return 50;
    const confidence = Math.round((scores[skinType] / totalScore) * 100);
    return Math.min(100, Math.max(50, confidence));
  }

  /**
   * Generate characteristic indicators
   */
  private static generateIndicators(characteristics: SkinCharacteristics, skinType: SkinType): string[] {
    const indicators = this.getBaseIndicators(characteristics);
    const combinationIndicators = this.getCombinationIndicators(skinType, characteristics);
    return [
      ...indicators,
      ...combinationIndicators,
    ].length > 0
      ? [...indicators, ...combinationIndicators]
      : ['Normal, balanced skin characteristics'];
  }

  private static getBaseIndicators(c: SkinCharacteristics): string[] {
    const indicators: string[] = [];
    if (c.sebumLevel > 70) indicators.push('Excessive sebum production');
    if (c.sebumLevel < 20) indicators.push('Low sebum production');
    if (c.hydrationLevel > 80) indicators.push('Well-hydrated skin');
    if (c.hydrationLevel < 30) indicators.push('Dehydrated skin');
    if (c.poreSize > 75) indicators.push('Enlarged pores');
    if (c.poreSize < 25) indicators.push('Small, tight pores');
    if (c.textureRoughness > 60) indicators.push('Rough, uneven texture');
    if (c.shininess > 70) indicators.push('Very shiny appearance');
    if (c.shininess < 30) indicators.push('Matte complexion');
    if (c.acneScore > 50) indicators.push('Acne-prone');
    if (c.rednessLevel > 60) indicators.push('Significant redness');
    if (c.sensitivityScore > 70) indicators.push('Highly reactive');
    return indicators;
  }

  private static getCombinationIndicators(skinType: SkinType, c: SkinCharacteristics): string[] {
    const indicators: string[] = [];
    if (skinType === 'combination') {
      if (c.sebumLevel > 60) indicators.push('Oily T-zone');
      if (c.hydrationLevel < 50) indicators.push('Dry cheek areas');
    }
    return indicators;
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(skinType: SkinType, characteristics: SkinCharacteristics): string[] {
    switch (skinType) {
      case 'oily':
        return [
          'Use lightweight, oil-free moisturizers',
          'Apply mattifying primers and powders',
          'Cleanse twice daily with gentle cleanser',
          ...(characteristics.acneScore > 60 ? ['Consider salicylic acid or benzoyl peroxide treatments'] : []),
          'Avoid heavy oils and thick creams',
        ];

      case 'dry':
        return [
          'Use rich, hydrating moisturizers with ceramides',
          'Apply facial oils or serums for extra nourishment',
          'Use gentle, creamy cleansers',
          ...(characteristics.textureRoughness > 70 ? ['Incorporate gentle exfoliation 1-2 times weekly'] : []),
          'Stay hydrated and consider humidifiers',
        ];

      case 'combination':
        return [
          'Use different products for T-zone and cheeks',
          'Apply mattifying products to oily areas',
          'Use hydrating products on dry areas',
          'Consider lightweight, balanced formulas',
        ];

      case 'sensitive':
        return [
          'Use fragrance-free, hypoallergenic products',
          'Introduce new products one at a time',
          ...(characteristics.rednessLevel > 70 ? ['Use calming ingredients like centella asiatica'] : []),
          'Avoid harsh physical exfoliation',
          'Use SPF 30+ daily to prevent irritation',
        ];

      case 'normal':
      default:
        return [
          'Maintain current routine with occasional adjustments',
          'Use balanced cleansers and moisturizers',
          'Adapt to seasonal changes as needed',
          'Focus on sun protection',
        ];
    }
  }

  /**
   * Analyze classification history and detect trends
   */
  static analyzeHistory(history: ClassificationResult[]): ClassificationHistory {
    if (history.length === 0) {
      return {
        results: [],
        averageType: 'normal',
        trend: 'stable',
        trendDescription: 'No classification history available',
      };
    }

    // Sort by timestamp
    const sorted = [...history].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate average skin type
    const typeFrequency: Record<SkinType, number> = {
      normal: 0,
      oily: 0,
      dry: 0,
      combination: 0,
      sensitive: 0,
    };

    for (const result of sorted) {
      typeFrequency[result.skinType]++;
    }

    const averageType = Object.entries(typeFrequency).sort(([, a], [, b]) => b - a)[0][0] as SkinType;

    // Detect trend
    const recent = sorted.slice(Math.max(0, sorted.length - 5));
    const sebumTrend = recent.at(-1)?.characteristics.sebumLevel ?? 0 - (recent.at(0)?.characteristics.sebumLevel ?? 0);
    const hydrationTrend = recent.at(-1)?.characteristics.hydrationLevel ?? 0 - (recent.at(0)?.characteristics.hydrationLevel ?? 0);
    const acneTrend = recent.at(-1)?.characteristics.acneScore ?? 0 - (recent.at(0)?.characteristics.acneScore ?? 0);

    let trend: 'stable' | 'improving' | 'worsening' = 'stable';
    let trendDescription = 'Skin characteristics remain consistent';

    const improvementScore = (hydrationTrend - sebumTrend - acneTrend) / 3;
    if (improvementScore > 15) {
      trend = 'improving';
      trendDescription = 'Skin is showing improvement over time';
    } else if (improvementScore < -15) {
      trend = 'worsening';
      trendDescription = 'Skin is showing signs of degradation';
    }

    return {
      results: sorted,
      averageType,
      trend,
      trendDescription,
    };
  }

  /**
   * Compare two classifications
   */
  static compareClassifications(current: ClassificationResult, previous: ClassificationResult): {
    typeChange: boolean;
    confidenceChange: number;
    characteristicChanges: Record<keyof SkinCharacteristics, number>;
    summary: string;
  } {
    const typeChange = current.skinType !== previous.skinType;
    const confidenceChange = current.confidence - previous.confidence;

    const characteristicChanges: Record<keyof SkinCharacteristics, number> = {
      sebumLevel: current.characteristics.sebumLevel - previous.characteristics.sebumLevel,
      hydrationLevel: current.characteristics.hydrationLevel - previous.characteristics.hydrationLevel,
      sensitivityScore: current.characteristics.sensitivityScore - previous.characteristics.sensitivityScore,
      poreSize: current.characteristics.poreSize - previous.characteristics.poreSize,
      textureRoughness: current.characteristics.textureRoughness - previous.characteristics.textureRoughness,
      acneScore: current.characteristics.acneScore - previous.characteristics.acneScore,
      rednessLevel: current.characteristics.rednessLevel - previous.characteristics.rednessLevel,
      shininess: current.characteristics.shininess - previous.characteristics.shininess,
    };

    let summary = '';
    if (typeChange) {
      summary = `Skin type changed from ${previous.skinType} to ${current.skinType}. `;
    } else {
      summary = `Skin type remains ${current.skinType}. `;
    }

    if (confidenceChange > 10) {
      summary += `Classification confidence increased by ${Math.round(confidenceChange)}%. `;
    } else if (confidenceChange < -10) {
      summary += `Classification confidence decreased by ${Math.round(Math.abs(confidenceChange))}%. `;
    }

    const improvedMetrics = Object.entries(characteristicChanges)
      .filter(([, value]) => value < -5)
      .map(([key]) => key);

    if (improvedMetrics.length > 0) {
      summary += `Improvements in: ${improvedMetrics.join(', ')}. `;
    }

    return {
      typeChange,
      confidenceChange,
      characteristicChanges,
      summary,
    };
  }

  /**
   * Generate personalized skincare tips based on classification
   */
  static generateTips(skinType: SkinType, characteristics: SkinCharacteristics): string[] {
    const tips = [
      'Apply sunscreen with SPF 30+ daily',
      'Drink at least 8 glasses of water daily',
      'Sleep 7-9 hours per night',
      'Avoid touching your face throughout the day',
    ];

    switch (skinType) {
      case 'oily':
        return [
          ...tips,
          'Use blotting papers to manage excess oil',
          'Exfoliate 2-3 times per week',
          ...(characteristics.poreSize > 70 ? ['Consider pore-minimizing treatments'] : []),
          'Avoid heavy makeup and use powder formulations',
        ];

      case 'dry':
        return [
          ...tips,
          'Moisturize immediately after cleansing',
          'Use a humidifier, especially during winter',
          ...(characteristics.hydrationLevel < 35 ? ['Apply hydrating face masks 1-2 times weekly'] : []),
          'Limit hot showers and use lukewarm water',
        ];

      case 'combination':
        return [
          ...tips,
          'Customize your routine for different face zones',
          'Use clay masks on T-zone, hydrating masks on cheeks',
          'Apply SPF to all areas without exception',
        ];

      case 'sensitive':
        return [
          ...tips,
          'Patch test new products before full application',
          'Minimize product count and stick to essentials',
          ...(characteristics.rednessLevel > 60 ? ['Avoid spicy foods and hot beverages'] : []),
          'Use soft washcloths and gentle massage motions',
        ];

      case 'normal':
      default:
        return [
          ...tips,
          'Maintain your current routine',
          'Adapt products seasonally as needed',
          'Continue regular exfoliation (1-2 times weekly)',
        ];
    }
  }
}
