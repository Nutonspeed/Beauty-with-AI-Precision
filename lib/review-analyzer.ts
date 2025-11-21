'use strict';

export type SentimentType = 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';
export type ReviewCategory = 'treatment-quality' | 'staff-service' | 'cleanliness' | 'value-for-money' | 'results';
export type TrendDirection = 'improving' | 'declining' | 'stable';

export interface Review {
  id: string;
  customerId: string;
  rating: number;
  text: string;
  category: ReviewCategory;
  sentiment: SentimentType;
  sentimentScore: number;
  keywords: string[];
  createdAt: Date;
  helpful?: boolean;
  verified: boolean;
}

export interface SentimentAnalysis {
  text: string;
  sentiment: SentimentType;
  score: number;
  confidence: number;
  keywords: string[];
  emotionalIntensity: number;
}

export interface ReviewAggregation {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  sentimentDistribution: Record<SentimentType, number>;
  categoryRatings: Record<ReviewCategory, number>;
  verifiedReviewCount: number;
  verifiedPercentage: number;
  trustScore: number;
}

export interface ReviewTrend {
  period: string;
  averageRating: number;
  sentimentScore: number;
  reviewCount: number;
  trend: TrendDirection;
  changePercentage: number;
}

export interface ReviewInsight {
  mostMentionedKeywords: Array<{ keyword: string; count: number; sentiment: SentimentType }>;
  commonComplaints: string[];
  commonPraises: string[];
  improvementAreas: string[];
  strengths: string[];
}

export interface RecommendationConfidence {
  recommendationScore: number;
  likelyToRecommend: boolean;
  npsScore: number;
  reasonsForRecommendation: string[];
  reasonsAgainstRecommendation: string[];
}

export class ReviewAnalyzer {
  private static readonly veryPositiveWords = [
    'amazing',
    'excellent',
    'outstanding',
    'perfect',
    'fantastic',
    'wonderful',
    'love',
    'adore',
    'brilliant',
    'incredible',
  ];
  private static readonly positiveWords = [
    'good',
    'great',
    'nice',
    'happy',
    'satisfied',
    'recommend',
    'impressed',
    'effective',
    'professional',
    'friendly',
  ];
  private static readonly negativeWords = [
    'bad',
    'poor',
    'disappointed',
    'unhappy',
    'regret',
    'waste',
    'rude',
    'unprofessional',
    'ineffective',
    'dirty',
  ];
  private static readonly veryNegativeWords = [
    'terrible',
    'awful',
    'horrible',
    'disgusting',
    'hate',
    'worst',
    'pathetic',
    'disastrous',
    'unacceptable',
    'dangerous',
  ];

  static analyzeSentiment(text: string): SentimentAnalysis {
    const lowerText = text.toLowerCase();

    const { score, matchedPositive, matchedNegative } = this.calculateSentimentScores(lowerText);
    const normalizedScore = Math.max(-10, Math.min(10, score));
    const sentimentScore = ((normalizedScore + 10) / 20) * 100;
    const sentiment = this.determineSentimentType(sentimentScore);
    const confidence = Math.min(100, (Math.abs(matchedPositive) + Math.abs(matchedNegative)) * 15);
    const emotionalIntensity = Math.abs(score);

    const allWords = [
      ...this.veryPositiveWords,
      ...this.positiveWords,
      ...this.negativeWords,
      ...this.veryNegativeWords,
    ];
    const keywords = this.extractKeywords(lowerText, allWords);

    return {
      text,
      sentiment,
      score: Math.round(sentimentScore),
      confidence: Math.min(100, confidence),
      keywords,
      emotionalIntensity,
    };
  }

  private static calculateSentimentScores(lowerText: string): {
    score: number;
    matchedPositive: number;
    matchedNegative: number;
  } {
    let score = 0;
    let matchedPositive = 0;
    let matchedNegative = 0;

    for (const word of this.veryPositiveWords) {
      if (lowerText.includes(word)) {
        score += 2;
        matchedPositive += 2;
      }
    }
    for (const word of this.positiveWords) {
      if (lowerText.includes(word)) {
        score += 1;
        matchedPositive += 1;
      }
    }
    for (const word of this.negativeWords) {
      if (lowerText.includes(word)) {
        score -= 1;
        matchedNegative += 1;
      }
    }
    for (const word of this.veryNegativeWords) {
      if (lowerText.includes(word)) {
        score -= 2;
        matchedNegative += 2;
      }
    }

    return { score, matchedPositive, matchedNegative };
  }

  private static determineSentimentType(sentimentScore: number): SentimentType {
    if (sentimentScore >= 80) return 'very-positive';
    if (sentimentScore >= 60) return 'positive';
    if (sentimentScore >= 40) return 'neutral';
    if (sentimentScore >= 20) return 'negative';
    return 'very-negative';
  }

  private static extractKeywords(text: string, wordList: string[]): string[] {
    const keywords: string[] = [];

    for (const word of wordList) {
      if (text.includes(word)) {
        keywords.push(word);
      }
    }

    return [...new Set(keywords)];
  }

  static aggregateReviews(reviews: Review[]): ReviewAggregation {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sentimentDistribution: {
          'very-negative': 0,
          negative: 0,
          neutral: 0,
          positive: 0,
          'very-positive': 0,
        },
        categoryRatings: {
          'treatment-quality': 0,
          'staff-service': 0,
          cleanliness: 0,
          'value-for-money': 0,
          results: 0,
        },
        verifiedReviewCount: 0,
        verifiedPercentage: 0,
        trustScore: 0,
      };
    }

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentDistribution: Record<SentimentType, number> = {
      'very-negative': 0,
      negative: 0,
      neutral: 0,
      positive: 0,
      'very-positive': 0,
    };
    const categoryRatings: Record<ReviewCategory, Record<string, number>> = {
      'treatment-quality': { sum: 0, count: 0 },
      'staff-service': { sum: 0, count: 0 },
      cleanliness: { sum: 0, count: 0 },
      'value-for-money': { sum: 0, count: 0 },
      results: { sum: 0, count: 0 },
    };

    let totalRating = 0;
    let verifiedCount = 0;

    for (const review of reviews) {
      totalRating += review.rating;
      ratingDistribution[review.rating] += 1;
      sentimentDistribution[review.sentiment] += 1;

      categoryRatings[review.category].sum += review.rating;
      categoryRatings[review.category].count += 1;

      if (review.verified) verifiedCount += 1;
    }

    const averageRating = totalRating / reviews.length;
    const verifiedPercentage = (verifiedCount / reviews.length) * 100;

    const categoryRatingsAverage: Record<ReviewCategory, number> = {
      'treatment-quality': categoryRatings['treatment-quality'].count > 0 ? categoryRatings['treatment-quality'].sum / categoryRatings['treatment-quality'].count : 0,
      'staff-service': categoryRatings['staff-service'].count > 0 ? categoryRatings['staff-service'].sum / categoryRatings['staff-service'].count : 0,
      cleanliness: categoryRatings.cleanliness.count > 0 ? categoryRatings.cleanliness.sum / categoryRatings.cleanliness.count : 0,
      'value-for-money': categoryRatings['value-for-money'].count > 0 ? categoryRatings['value-for-money'].sum / categoryRatings['value-for-money'].count : 0,
      results: categoryRatings.results.count > 0 ? categoryRatings.results.sum / categoryRatings.results.count : 0,
    };

    const trustScore = (verifiedPercentage * 0.4 + averageRating * 20) / 5;

    return {
      totalReviews: reviews.length,
      averageRating,
      ratingDistribution,
      sentimentDistribution,
      categoryRatings: categoryRatingsAverage,
      verifiedReviewCount: verifiedCount,
      verifiedPercentage,
      trustScore: Math.min(100, trustScore),
    };
  }

  static calculateReviewTrend(reviews: Review[], periodDays: number = 30): ReviewTrend {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const reviewsInPeriod = reviews.filter((r) => r.createdAt >= periodStart);

    if (reviewsInPeriod.length === 0) {
      return {
        period: `Last ${periodDays} days`,
        averageRating: 0,
        sentimentScore: 0,
        reviewCount: 0,
        trend: 'stable',
        changePercentage: 0,
      };
    }

    let totalRating = 0;
    let totalSentimentScore = 0;

    for (const review of reviewsInPeriod) {
      totalRating += review.rating;
      totalSentimentScore += review.sentimentScore;
    }

    const averageRating = totalRating / reviewsInPeriod.length;
    const averageSentimentScore = totalSentimentScore / reviewsInPeriod.length;

    // Calculate previous period trend
    const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const reviewsInPreviousPeriod = reviews.filter(
      (r) => r.createdAt >= previousPeriodStart && r.createdAt < periodStart
    );

    let trend: TrendDirection = 'stable';
    let changePercentage = 0;

    if (reviewsInPreviousPeriod.length > 0) {
      let previousRating = 0;
      for (const review of reviewsInPreviousPeriod) {
        previousRating += review.rating;
      }
      const previousAverageRating = previousRating / reviewsInPreviousPeriod.length;
      changePercentage = ((averageRating - previousAverageRating) / previousAverageRating) * 100;

      if (changePercentage > 5) trend = 'improving';
      else if (changePercentage < -5) trend = 'declining';
    }

    return {
      period: `Last ${periodDays} days`,
      averageRating,
      sentimentScore: Math.round(averageSentimentScore),
      reviewCount: reviewsInPeriod.length,
      trend,
      changePercentage: Math.round(changePercentage * 100) / 100,
    };
  }

  static generateInsights(reviews: Review[]): ReviewInsight {
    const keywordCounts: Record<string, { count: number; sentiments: SentimentType[] }> = {};
    const negativeReviews = reviews.filter((r) => r.sentimentScore < 40);
    const positiveReviews = reviews.filter((r) => r.sentimentScore > 60);

    // Count keywords
    for (const review of reviews) {
      for (const keyword of review.keywords) {
        if (!keywordCounts[keyword]) {
          keywordCounts[keyword] = { count: 0, sentiments: [] };
        }
        keywordCounts[keyword].count += 1;
        keywordCounts[keyword].sentiments.push(review.sentiment);
      }
    }

    const topKeywords: Array<{ keyword: string; count: number; sentiment: SentimentType }> = Object.entries(keywordCounts)
      .map(([keyword, data]) => {
        const mostCommon = data.sentiments.reduce<SentimentType>(
          (prev, curr) => {
            const prevCount = data.sentiments.filter((s) => s === prev).length;
            const currCount = data.sentiments.filter((s) => s === curr).length;
            return currCount > prevCount ? curr : prev;
          },
          data.sentiments[0] ?? ('neutral' as SentimentType)
        );
        return { keyword, count: data.count, sentiment: mostCommon };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const commonComplaints: string[] = [];
    const commonPraises: string[] = [];

    for (const review of negativeReviews) {
      if (review.text.length > 0) commonComplaints.push(review.text.substring(0, 100));
    }

    for (const review of positiveReviews) {
      if (review.text.length > 0) commonPraises.push(review.text.substring(0, 100));
    }

    const improvementAreas = commonComplaints.slice(0, 5);
    const strengths = commonPraises.slice(0, 5);

    return {
      mostMentionedKeywords: topKeywords,
      commonComplaints: improvementAreas,
      commonPraises: strengths,
      improvementAreas,
      strengths,
    };
  }

  static calculateRecommendationConfidence(reviews: Review[]): RecommendationConfidence {
    if (reviews.length === 0) {
      return {
        recommendationScore: 0,
        likelyToRecommend: false,
        npsScore: 0,
        reasonsForRecommendation: [],
        reasonsAgainstRecommendation: [],
      };
    }

    let recommendationScore = 0;
    let detractorCount = 0;
    let _passiveCount = 0;
    let promoterCount = 0;

    for (const review of reviews) {
      if (review.rating >= 4) {
        recommendationScore += 2;
        promoterCount += 1;
      } else if (review.rating === 3) {
        recommendationScore += 0;
        _passiveCount += 1;
      } else {
        recommendationScore -= 2;
        detractorCount += 1;
      }
    }

    const averageScore = recommendationScore / reviews.length;
    const npsScore = ((promoterCount - detractorCount) / reviews.length) * 100;

    const likelyToRecommend = averageScore > 0;

    const reasonsForRecommendation: string[] = [];
    const reasonsAgainstRecommendation: string[] = [];

    const positiveReviews = reviews.filter((r) => r.rating >= 4);
    const negativeReviews = reviews.filter((r) => r.rating <= 2);

    if (positiveReviews.length > 0) {
      reasonsForRecommendation.push(`${positiveReviews.length} satisfied customers`);
    }

    if (negativeReviews.length > 0) {
      reasonsAgainstRecommendation.push(`${negativeReviews.length} unsatisfied customers`);
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    if (avgRating >= 4) {
      reasonsForRecommendation.push('High overall rating');
    } else if (avgRating <= 2) {
      reasonsAgainstRecommendation.push('Low overall rating');
    }

    return {
      recommendationScore,
      likelyToRecommend,
      npsScore: Math.round(npsScore),
      reasonsForRecommendation,
      reasonsAgainstRecommendation,
    };
  }

  static sortReviewsByRelevance(reviews: Review[]): Review[] {
    return [...reviews].sort((a, b) => {
      // Verified reviews first
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      // Then by helpful count
      if ((a.helpful ? 1 : 0) !== (b.helpful ? 1 : 0)) {
        return (a.helpful ? 1 : 0) - (b.helpful ? 1 : 0);
      }
      // Then by rating (extreme ratings more relevant)
      const aRatingDiff = Math.abs(a.rating - 3);
      const bRatingDiff = Math.abs(b.rating - 3);
      if (aRatingDiff !== bRatingDiff) return bRatingDiff - aRatingDiff;
      // Finally by date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  static filterReviewsByCategory(reviews: Review[], category: ReviewCategory): Review[] {
    return reviews.filter((r) => r.category === category);
  }

  static filterReviewsBySentiment(reviews: Review[], sentiment: SentimentType): Review[] {
    return reviews.filter((r) => r.sentiment === sentiment);
  }

  static filterReviewsByRatingRange(reviews: Review[], minRating: number, maxRating: number): Review[] {
    return reviews.filter((r) => r.rating >= minRating && r.rating <= maxRating);
  }

  static calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, r) => total + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  static getReviewStats(reviews: Review[]): {
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    twoStarCount: number;
    oneStarCount: number;
    percentageFiveStars: number;
    percentageFourStars: number;
    percentageThreeStars: number;
    percentageTwoStars: number;
    percentageOneStars: number;
  } {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const review of reviews) {
      counts[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
    }

    const total = reviews.length || 1;

    return {
      fiveStarCount: counts[5],
      fourStarCount: counts[4],
      threeStarCount: counts[3],
      twoStarCount: counts[2],
      oneStarCount: counts[1],
      percentageFiveStars: (counts[5] / total) * 100,
      percentageFourStars: (counts[4] / total) * 100,
      percentageThreeStars: (counts[3] / total) * 100,
      percentageTwoStars: (counts[2] / total) * 100,
      percentageOneStars: (counts[1] / total) * 100,
    };
  }
}
