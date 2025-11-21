/**
 * Product Recommendation Integration Engine
 * 
 * Enhances product recommendations with e-commerce links, user reviews,
 * and purchase tracking capabilities for seamless shopping integration.
 */

import type { ProductRecommendation } from './treatment-recommendations';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ProductReview {
  id: string;
  userId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  skinType?: string;
  skinConcern?: string;
  resultAfterWeeks?: number;
  images?: string[];
}

export interface ProductInventory {
  productId: string;
  storeId: string;
  quantity: number;
  price: number;
  currency: string;
  inStock: boolean;
  storeUrl: string;
  estimatedDelivery?: string;
}

export interface PurchaseHistory {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  purchaseDate: Date;
  price: number;
  store: string;
  storeUrl: string;
  status: 'pending' | 'shipped' | 'delivered' | 'returned';
  trackingNumber?: string;
  feedbackProvided: boolean;
  userRating?: number;
}

export interface ProductWithIntegration extends ProductRecommendation {
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  inventory: ProductInventory[];
  bestPrice: {
    amount: number;
    store: string;
    storeUrl: string;
  };
  purchaseHistory?: PurchaseHistory[];
  relatedProducts: string[];
  lastPurchased?: Date;
  repurchaseInterval?: number; // days
  skinTypeReviews: {
    skinType: string;
    averageRating: number;
    reviewCount: number;
  }[];
}

export interface ProductRecommendationResult {
  products: ProductWithIntegration[];
  totalCost: {
    min: number;
    max: number;
  };
  completenessScore: number; // 0-100, how complete the regimen is
  estimatedResults: {
    timeline: string;
    expectedImprovements: string[];
    requirementForBestResults: string[];
  };
}

// ============================================================================
// Product Recommendation Integration Engine
// ============================================================================

export class ProductRecommendationEngine {
  /**
   * Aggregates product reviews from multiple sources
   * Calculates weighted ratings based on verification and recency
   */
  static aggregateReviews(reviews: ProductReview[]): {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    verifiedPurchasePercentage: number;
    skinTypeBreakdown: Record<string, { avg: number; count: number }>;
  } {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verifiedPurchasePercentage: 0,
        skinTypeBreakdown: {},
      };
    }

    const verifiedReviews = reviews.filter((r) => r.verifiedPurchase);
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const skinTypeBreakdown: Record<string, { ratings: number[]; count: number }> = {};

    let weightedSum = 0;
    let weightSum = 0;

    for (const review of reviews) {
      // Weight based on verification and recency
      const daysSince = Math.floor((Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const recencyWeight = Math.max(0.5, 1 - daysSince / 365); // Decay over 1 year
      const verificationWeight = review.verifiedPurchase ? 1.2 : 0.8;
      const totalWeight = recencyWeight * verificationWeight;

      weightedSum += review.rating * totalWeight;
      weightSum += totalWeight;

      ratingDistribution[review.rating]++;

      if (review.skinType) {
        if (!skinTypeBreakdown[review.skinType]) {
          skinTypeBreakdown[review.skinType] = { ratings: [], count: 0 };
        }
        skinTypeBreakdown[review.skinType].ratings.push(review.rating);
        skinTypeBreakdown[review.skinType].count++;
      }
    }

    const skinTypeAvgs = Object.entries(skinTypeBreakdown).reduce(
      (acc, [skinType, data]) => {
        acc[skinType] = {
          avg: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
          count: data.count,
        };
        return acc;
      },
      {} as Record<string, { avg: number; count: number }>
    );

    return {
      averageRating: weightSum > 0 ? weightedSum / weightSum : 0,
      totalReviews: reviews.length,
      ratingDistribution,
      verifiedPurchasePercentage: (verifiedReviews.length / reviews.length) * 100,
      skinTypeBreakdown: skinTypeAvgs,
    };
  }

  /**
   * Finds best prices across multiple e-commerce platforms
   * Prioritizes verified retailers and considers shipping/delivery
   */
  static findBestPrice(inventory: ProductInventory[]): ProductInventory & { overallPrice: number } {
    if (inventory.length === 0) {
      throw new Error('No inventory data available');
    }

    const inStock = inventory.filter((i) => i.inStock);
    if (inStock.length === 0) {
      // Return cheapest even if out of stock
      return {
        ...inventory.reduce((best, curr) => (curr.price < best.price ? curr : best)),
        overallPrice: Math.min(...inventory.map((i) => i.price)),
      };
    }

    // Prefer in-stock items with established retailers
    const scored = inStock.map((item) => {
      const storeScore = this.getStoreReliabilityScore(item.storeId);
      const deliveryDays = item.estimatedDelivery
        ? Number.parseInt(item.estimatedDelivery.split('-')[0], 10) || 7
        : 7;
      const shippingEstimate = deliveryDays * 5; // 5 points per day
      const totalCost = item.price + shippingEstimate;

      return {
        ...item,
        overallPrice: totalCost,
        storeScore,
      };
    });

    return scored.reduce((best, curr) => (curr.overallPrice < best.overallPrice ? curr : best));
  }

  /**
   * Calculates store reliability score based on common e-commerce platforms
   */
  private static getStoreReliabilityScore(storeId: string): number {
    const scores: Record<string, number> = {
      lazada: 95,
      shopee: 94,
      amazon: 98,
      sephora: 99,
      yesstyle: 92,
      beautybay: 96,
      boots: 97,
      feelunique: 93,
      cultbeauty: 95,
    };
    return scores[storeId.toLowerCase()] || 85;
  }

  /**
   * Generates comprehensive product recommendations with e-commerce integration
   */
  static generateProductRecommendations(
    analysis: HybridSkinAnalysis,
    baseProducts: ProductRecommendation[],
    reviews: Map<string, ProductReview[]>,
    inventory: Map<string, ProductInventory[]>,
    purchaseHistory: Map<string, PurchaseHistory[]>
  ): ProductRecommendationResult {
    // Score products based on analysis match
    const scoredProducts = baseProducts
      .map((product) => {
        const analysisMatch = this.calculateAnalysisMatch(product, analysis);
        return { product, score: analysisMatch };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Top 8 products

    // Enrich products with integration data
    const enrichedProducts: ProductWithIntegration[] = scoredProducts.map(({ product }) => {
      const productReviews = reviews.get(product.id) || [];
      const { averageRating, totalReviews, skinTypeBreakdown } = this.aggregateReviews(productReviews);

      const productInventory = inventory.get(product.id) || [];
      const bestPrice = productInventory.length > 0 ? this.findBestPrice(productInventory) : null;

      const history = purchaseHistory.get(product.id) || [];
      const lastPurchase = history.length > 0 ? history[0].purchaseDate : undefined;

      // Calculate repurchase interval from usage patterns
      const repurchaseInterval = this.calculateRepurchaseInterval(product, history);

      // Find related products (complementary items)
      const relatedProducts = this.findRelatedProducts(product, baseProducts);

      return {
        ...product,
        reviews: productReviews,
        averageRating,
        totalReviews,
        inventory: productInventory,
        bestPrice: bestPrice
          ? {
              amount: bestPrice.price,
              store: bestPrice.storeId,
              storeUrl: bestPrice.storeUrl,
            }
          : { amount: product.price.amount, store: 'unknown', storeUrl: '' },
        purchaseHistory: history,
        relatedProducts,
        lastPurchased: lastPurchase,
        repurchaseInterval,
        skinTypeReviews: Object.entries(skinTypeBreakdown)
          .map(([skinType, data]) => ({
            skinType,
            averageRating: data.avg,
            reviewCount: data.count,
          }))
          .sort((a, b) => b.averageRating - a.averageRating),
      };
    });

    // Calculate total cost range
    const prices = enrichedProducts.map((p) => p.bestPrice.amount);
    const totalCost = {
      min: Math.round(Math.min(...prices) * 100) / 100,
      max: Math.round(Math.max(...prices) * 100) / 100,
    };

    // Calculate completeness score (how well products cover skin concerns)
    const completenessScore = this.calculateCompletenessScore(enrichedProducts, analysis);

    // Generate expected results
    const estimatedResults = this.generateEstimatedResults(enrichedProducts, analysis);

    return {
      products: enrichedProducts,
      totalCost,
      completenessScore,
      estimatedResults,
    };
  }

  /**
   * Calculates how well a product matches the user's skin analysis
   */
  private static calculateAnalysisMatch(
    product: ProductRecommendation,
    analysis: HybridSkinAnalysis
  ): number {
    let score = 0;

    // Match skin type (50 points max)
    if (product.suitableFor.includes('all') || product.suitableFor.includes(analysis.ai.skinType as any)) {
      score += 50;
    } else {
      score += 20;
    }

    // Match target concerns (30 points max)
    const userConcerns = analysis.ai.concerns.map((c) => {
      if (c === 'dark_spots') return 'spots';
      if (c === 'large_pores') return 'pores';
      return c as any;
    });

    const concernMatches = product.targetConcerns.filter((concern) =>
      userConcerns.includes(concern as any)
    ).length;
    score += Math.min(30, (concernMatches / product.targetConcerns.length) * 30);

    // Priority consideration (20 points max)
    const priorityScore = product.priority === 'high' ? 20 : product.priority === 'medium' ? 10 : 5;
    score += priorityScore;

    return Math.round(score);
  }

  /**
   * Calculates product regimen completeness
   */
  private static calculateCompletenessScore(
    products: ProductWithIntegration[],
    analysis: HybridSkinAnalysis
  ): number {
    const categories = new Set(products.map((p) => p.category));
    const recommendedCategories = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen'];

    const presentCategories = recommendedCategories.filter((cat) => categories.has(cat as any)).length;
    const baseScore = (presentCategories / recommendedCategories.length) * 60;

    // Add points for products targeting specific concerns
    const userConcerns = analysis.ai.concerns.map((c) => {
      if (c === 'dark_spots') return 'spots';
      if (c === 'large_pores') return 'pores';
      return c as any;
    });

    const concernsCovered = new Set<string>();
    for (const product of products) {
      for (const concern of product.targetConcerns) {
        if (userConcerns.includes(concern as any)) {
          concernsCovered.add(concern);
        }
      }
    }

    const concernBonus = (concernsCovered.size / Math.max(1, userConcerns.length)) * 40;

    return Math.round(Math.min(100, baseScore + concernBonus));
  }

  /**
   * Generates timeline and expected results from product recommendations
   */
  private static generateEstimatedResults(
    products: ProductWithIntegration[],
    analysis: HybridSkinAnalysis
  ): {
    timeline: string;
    expectedImprovements: string[];
    requirementForBestResults: string[];
  } {
    const avgRating = products.reduce((sum, p) => sum + p.averageRating, 0) / products.length;

    const timelineMap: Record<string, string> = {
      cleanser: '1-2 weeks',
      toner: '2-4 weeks',
      serum: '4-8 weeks',
      moisturizer: '1-2 weeks',
      sunscreen: 'immediate',
      treatment: '4-12 weeks',
      mask: '1-4 weeks',
    };

    const userConcerns = analysis.ai.concerns.map((c) => {
      if (c === 'dark_spots') return 'spots';
      if (c === 'large_pores') return 'pores';
      return c as any;
    });

    const timelineSet = new Set<string>();
    for (const product of products) {
      const timeline = timelineMap[product.category] || '4-8 weeks';
      timelineSet.add(timeline);
    }

    let timeline = '4-8 weeks';
    if (timelineSet.has('4-12 weeks')) {
      timeline = '4-12 weeks';
    } else if (timelineSet.has('4-8 weeks')) {
      // Already default
    }

    const expectedImprovements = Array.from(
      new Set(
        products
          .flatMap((p) =>
            p.targetConcerns.filter((concern) => userConcerns.includes(concern as any))
          )
          .slice(0, 5)
      )
    ).map((concern) => {
      const concernLabels: Record<string, string> = {
        spots: 'Reduced pigmentation and spots',
        pores: 'Minimized pore appearance',
        wrinkles: 'Reduced fine lines and wrinkles',
        texture: 'Improved skin texture and smoothness',
        redness: 'Calmed redness and irritation',
        pigmentation: 'Even skin tone',
        acne: 'Clearer, acne-free skin',
        dryness: 'Increased hydration and moisture',
        oiliness: 'Balanced sebum production',
        sensitivity: 'Reduced sensitivity and reactivity',
      };
      return concernLabels[concern] || concern;
    });

    const requirementForBestResults = [
      avgRating >= 4.5 ? 'Consistent daily use as recommended' : 'Regular use for visible results',
      'Combine with sun protection (minimum SPF 30)',
      'Allow 4-8 weeks for noticeable improvements',
      'Use complementary products together for synergistic effects',
      'Patch test new products if you have sensitive skin',
    ];

    return {
      timeline,
      expectedImprovements: expectedImprovements.slice(0, 4),
      requirementForBestResults,
    };
  }

  /**
   * Finds related/complementary products
   */
  private static findRelatedProducts(product: ProductRecommendation, allProducts: ProductRecommendation[]): string[] {
    return allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.targetConcerns.some((c) => product.targetConcerns.includes(c)) ||
            p.suitableFor.some((st) => product.suitableFor.includes(st)))
      )
      .slice(0, 3)
      .map((p) => p.id);
  }

  /**
   * Calculates optimal repurchase interval based on product usage
   */
  private static calculateRepurchaseInterval(
    product: ProductRecommendation,
    purchaseHistory: PurchaseHistory[]
  ): number {
    if (purchaseHistory.length < 2) {
      // Default estimates based on product type
      const defaultIntervals: Record<string, number> = {
        cleanser: 30,
        toner: 45,
        serum: 60,
        moisturizer: 45,
        sunscreen: 45,
        treatment: 60,
        mask: 60,
      };
      return defaultIntervals[product.category] || 45;
    }

    // Calculate average days between purchases
    let totalDays = 0;
    for (let i = 0; i < purchaseHistory.length - 1; i++) {
      const days = Math.floor(
        (purchaseHistory[i].purchaseDate.getTime() - purchaseHistory[i + 1].purchaseDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      totalDays += days;
    }

    return Math.round(totalDays / (purchaseHistory.length - 1));
  }

  /**
   * Generates purchase recommendations for users with historical data
   */
  static generateRepurchaseRecommendations(
    userProducts: ProductWithIntegration[],
    _lastAnalysisDate: Date
  ): {
    shouldRepurchase: ProductWithIntegration[];
    timeline: Map<string, ProductWithIntegration[]>;
  } {
    const now = Date.now();
    const shouldRepurchase: ProductWithIntegration[] = [];
    const timeline = new Map<string, ProductWithIntegration[]>();

    for (const product of userProducts) {
      if (!product.lastPurchased || !product.repurchaseInterval) continue;

      const daysSincePurchase = Math.floor((now - product.lastPurchased.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilRepurchase = product.repurchaseInterval - daysSincePurchase;

      if (daysUntilRepurchase <= 7) {
        shouldRepurchase.push(product);
        const key = daysUntilRepurchase <= 0 ? 'overdue' : 'this-week';
        if (!timeline.has(key)) timeline.set(key, []);
        timeline.get(key)!.push(product);
      } else if (daysUntilRepurchase <= 30) {
        const key = 'this-month';
        if (!timeline.has(key)) timeline.set(key, []);
        timeline.get(key)!.push(product);
      }
    }

    return { shouldRepurchase, timeline };
  }
}
