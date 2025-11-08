'use client';

import { useState, useMemo } from 'react';
import ReviewsDisplay from '@/components/reviews-display';
import { ReviewAnalyzer, Review, ReviewTrend } from '@/lib/review-analyzer';

const translations = {
  en: {
    title: 'Test Reviews & Satisfaction System',
    scenarios: 'Test Scenarios',
    createReviews: 'Create Test Scenario',
    excellent: 'Excellent Service',
    average: 'Average Experience',
    needsImprovement: 'Needs Improvement',
    mixed: 'Mixed Feedback',
    newBusiness: 'New Business',
    analysis: 'Trend Analysis',
    history: 'Review History',
    noAnalysis: 'No analysis performed yet',
    statistics: 'Statistics',
    totalReviews: 'Total Reviews',
    averageRating: 'Average Rating',
    verificationRate: 'Verification Rate',
    sentiment: 'Sentiment',
    trend: 'Trend',
    period: 'Period',
    noTrends: 'No trend data available',
  },
  th: {
    title: 'ทดสอบระบบรีวิว & ความพึงพอใจ',
    scenarios: 'สถานการณ์ทดสอบ',
    createReviews: 'สร้างสถานการณ์ทดสอบ',
    excellent: 'บริการยอดเยี่ยม',
    average: 'ประสบการณ์ปานกลาง',
    needsImprovement: 'ต้องปรับปรุง',
    mixed: 'ข้อมูลรูปแบบผสม',
    newBusiness: 'ธุรกิจใหม่',
    analysis: 'การวิเคราะห์แนวโน้ม',
    history: 'ประวัติรีวิว',
    noAnalysis: 'ยังไม่มีการวิเคราะห์',
    statistics: 'สถิติ',
    totalReviews: 'รีวิวทั้งหมด',
    averageRating: 'ความคิดเห็นเฉลี่ย',
    verificationRate: 'อัตราการยืนยัน',
    sentiment: 'ความรู้สึก',
    trend: 'แนวโน้ม',
    period: 'ระยะเวลา',
    noTrends: 'ไม่มีข้อมูลแนวโน้ม',
  },
};

type Locale = 'en' | 'th';

interface ReviewScenario {
  name: string;
  description: string;
  reviews: Array<{
    rating: number;
    text: string;
    category: 'treatment-quality' | 'staff-service' | 'cleanliness' | 'value-for-money' | 'results';
    verified: boolean;
  }>;
}

const scenarios: Record<string, ReviewScenario> = {
  excellent: {
    name: 'Excellent Service',
    description: 'High satisfaction customers with positive feedback',
    reviews: [
      {
        rating: 5,
        text: 'Absolutely amazing treatment! The staff was incredibly professional and the results exceeded my expectations. Highly recommend!',
        category: 'treatment-quality',
        verified: true,
      },
      {
        rating: 5,
        text: 'Outstanding service from start to finish. Very friendly staff and clean facilities. Definitely coming back!',
        category: 'staff-service',
        verified: true,
      },
      {
        rating: 5,
        text: 'Perfect experience. Worth every penny. The treatment quality was excellent and the staff made me feel welcome.',
        category: 'value-for-money',
        verified: true,
      },
      {
        rating: 5,
        text: 'The results are fantastic! Already seeing improvements in my skin. Will definitely recommend to friends.',
        category: 'results',
        verified: true,
      },
    ],
  },
  average: {
    name: 'Average Experience',
    description: 'Mixed feedback with some satisfied and some less satisfied customers',
    reviews: [
      {
        rating: 4,
        text: 'Good treatment overall. Staff was nice but the place could be cleaner. Results are okay so far.',
        category: 'treatment-quality',
        verified: true,
      },
      {
        rating: 3,
        text: 'Decent service. Nothing special but did what was promised. Price is reasonable.',
        category: 'value-for-money',
        verified: false,
      },
      {
        rating: 4,
        text: 'Professional staff and good treatment. Cleanliness could be better. Will come again.',
        category: 'cleanliness',
        verified: true,
      },
      {
        rating: 3,
        text: 'Average results. Some improvement but not as dramatic as I hoped.',
        category: 'results',
        verified: false,
      },
    ],
  },
  needsImprovement: {
    name: 'Needs Improvement',
    description: 'Critical feedback highlighting areas for improvement',
    reviews: [
      {
        rating: 2,
        text: 'Disappointing treatment. The staff was unprofessional and the results are barely noticeable.',
        category: 'treatment-quality',
        verified: true,
      },
      {
        rating: 1,
        text: 'Very poor service. Staff was rude and the facility was dirty. Not worth the price.',
        category: 'staff-service',
        verified: true,
      },
      {
        rating: 2,
        text: 'Waste of money. The cleanliness was terrible and the treatment was ineffective.',
        category: 'cleanliness',
        verified: true,
      },
      {
        rating: 1,
        text: 'Horrible experience. No visible results after treatment. Very disappointed.',
        category: 'results',
        verified: false,
      },
    ],
  },
  mixed: {
    name: 'Mixed Feedback',
    description: 'Diverse opinions from different types of customers',
    reviews: [
      {
        rating: 5,
        text: 'Fantastic treatment! Best experience ever. Professional and effective!',
        category: 'treatment-quality',
        verified: true,
      },
      {
        rating: 2,
        text: 'Not happy with the results. Staff could be more attentive.',
        category: 'results',
        verified: false,
      },
      {
        rating: 4,
        text: 'Good value for money. Friendly staff. Slight improvement in skin quality.',
        category: 'value-for-money',
        verified: true,
      },
      {
        rating: 1,
        text: 'Terrible. Very disappointed with everything.',
        category: 'staff-service',
        verified: false,
      },
      {
        rating: 5,
        text: 'Amazing! Love the results. Will come back regularly!',
        category: 'results',
        verified: true,
      },
    ],
  },
  newBusiness: {
    name: 'New Business',
    description: 'Just started with a few initial reviews',
    reviews: [
      {
        rating: 5,
        text: 'Great first impression! Looking forward to results.',
        category: 'treatment-quality',
        verified: true,
      },
      {
        rating: 4,
        text: 'Nice place. Professional staff.',
        category: 'staff-service',
        verified: false,
      },
    ],
  },
};

export default function TestReviews({ params }: { readonly params: { locale: Locale } }) {
  const locale = params.locale;
  const t = translations[locale] ?? translations.en;

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('excellent');
  const [trends, setTrends] = useState<ReviewTrend[]>([]);

  const handleLoadScenario = (scenarioKey: string): void => {
    setSelectedScenario(scenarioKey);

    const scenario = scenarios[scenarioKey];
    if (!scenario) return;

    const newReviews: Review[] = scenario.reviews.map((r, idx) => {
      const sentimentAnalysis = ReviewAnalyzer.analyzeSentiment(r.text);

      return {
        id: `review-${Date.now()}-${idx}`,
        customerId: `customer-${Math.random().toString(36).substring(7)}`,
        rating: r.rating,
        text: r.text,
        category: r.category,
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.score,
        keywords: sentimentAnalysis.keywords,
        createdAt: new Date(),
        verified: r.verified,
      };
    });

    setAllReviews(newReviews);

    // Generate trend
    const trend = ReviewAnalyzer.calculateReviewTrend(newReviews, 30);
    setTrends([trend]);
  };

  const statistics = useMemo(() => {
    if (allReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        verificationRate: 0,
      };
    }

    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    const verified = allReviews.filter((r) => r.verified).length;

    return {
      totalReviews: allReviews.length,
      averageRating: avg,
      verificationRate: (verified / allReviews.length) * 100,
    };
  }, [allReviews]);

  const getTrendColor = (direction: string): string => {
    if (direction === 'improving') return 'text-green-600';
    if (direction === 'declining') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-slate-300">{t.createReviews}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Component */}
          <div className="lg:col-span-2">
            <ReviewsDisplay language={locale} onReviewsChange={setAllReviews} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scenarios */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.scenarios}</h2>
              <div className="space-y-2">
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadScenario(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedScenario === key
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <p className="font-semibold">{scenario.name}</p>
                    <p className="text-sm opacity-75 line-clamp-1">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            {allReviews.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.statistics}</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">{t.totalReviews}</p>
                    <p className="text-2xl font-bold text-slate-900">{statistics.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.averageRating}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {statistics.averageRating.toFixed(1)}/5
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t.verificationRate}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics.verificationRate.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trends */}
            {trends.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.analysis}</h2>
                <div className="space-y-3">
                  {trends.map((trend) => (
                    <div key={trend.period}>
                      <p className="text-sm text-slate-600">{trend.period}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-bold text-slate-900">
                          {trend.averageRating.toFixed(1)} ⭐
                        </span>
                        <span className={`font-semibold ${getTrendColor(trend.trend)}`}>
                          {trend.trend}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {trend.reviewCount} reviews
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        {allReviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.history}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">{t.sentiment}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Review</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {allReviews.map((review, idx) => (
                    <tr key={review.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900">
                        {'⭐'.repeat(review.rating)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {review.category.replace('-', ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-900">
                        {review.sentiment.replace('-', ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700 max-w-xs truncate">
                        {review.text.substring(0, 50)}...
                      </td>
                      <td className="py-3 px-4">
                        {review.verified && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            ✓ Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {allReviews.length === 0 && (
          <div className="mt-8 bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600">{t.noAnalysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}
