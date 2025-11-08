'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  ReviewAnalyzer,
  Review,
  SentimentType,
  ReviewCategory,
  ReviewAggregation,
} from '@/lib/review-analyzer';

const translations = {
  en: {
    title: 'Reviews & Satisfaction System',
    addReview: 'Add Review',
    rating: 'Rating',
    review: 'Review',
    category: 'Category',
    sentiment: 'Sentiment',
    verified: 'Verified',
    analyze: 'Analyze Reviews',
    reset: 'Reset',
    averageRating: 'Average Rating',
    trustScore: 'Trust Score',
    verifiedReviews: 'Verified Reviews',
    recommendations: 'Likely to Recommend',
    satisfactionStats: 'Satisfaction Statistics',
    sentimentBreakdown: 'Sentiment Breakdown',
    categoryRatings: 'Ratings by Category',
    ratingDistribution: 'Rating Distribution',
    npsScore: 'NPS Score',
    keywordAnalysis: 'Keyword Analysis',
    insights: 'Insights',
    strengths: 'Strengths',
    improvements: 'Areas for Improvement',
    recentReviews: 'Recent Reviews',
    noReviews: 'No reviews added yet',
    summary: 'Summary',
  },
  th: {
    title: 'ระบบรีวิว & ความพึงพอใจ',
    addReview: 'เพิ่มรีวิว',
    rating: 'ความคิดเห็น',
    review: 'บทวิจารณ์',
    category: 'หมวดหมู่',
    sentiment: 'ความรู้สึก',
    verified: 'ยืนยันแล้ว',
    analyze: 'วิเคราะห์รีวิว',
    reset: 'รีเซ็ต',
    averageRating: 'ความคิดเห็นเฉลี่ย',
    trustScore: 'คะแนนความน่าเชื่อถือ',
    verifiedReviews: 'รีวิวที่ยืนยันแล้ว',
    recommendations: 'มีแนวโน้มที่จะแนะนำ',
    satisfactionStats: 'สถิติความพึงพอใจ',
    sentimentBreakdown: 'การแยกความรู้สึก',
    categoryRatings: 'ความคิดเห็นตามหมวดหมู่',
    ratingDistribution: 'การกระจายความคิดเห็น',
    npsScore: 'คะแนน NPS',
    keywordAnalysis: 'การวิเคราะห์คำหลัก',
    insights: 'สัญญาณ',
    strengths: 'จุดแข็ง',
    improvements: 'พื้นที่ที่ต้องปรับปรุง',
    recentReviews: 'รีวิวล่าสุด',
    noReviews: 'ยังไม่มีรีวิวใด ๆ',
    summary: 'สรุป',
  },
};

type Locale = 'en' | 'th';

interface ComponentProps {
  readonly language?: Locale;
  readonly onReviewsChange?: (reviews: Review[]) => void;
}

export default function ReviewsDisplay({ language = 'en', onReviewsChange }: ComponentProps) {
  const t = translations[language] ?? translations.en;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({
    rating: 5,
    text: '',
    category: 'treatment-quality' as ReviewCategory,
    verified: false,
  });

  const [analysis, setAnalysis] = useState<ReviewAggregation | null>(null);

  const handleAddReview = (): void => {
    if (!formData.text.trim()) return;

    const sentimentAnalysis = ReviewAnalyzer.analyzeSentiment(formData.text);

    const newReview: Review = {
      id: `review-${Date.now()}`,
      customerId: `customer-${Math.random().toString(36).substring(7)}`,
      rating: formData.rating,
      text: formData.text,
      category: formData.category,
      sentiment: sentimentAnalysis.sentiment,
      sentimentScore: sentimentAnalysis.score,
      keywords: sentimentAnalysis.keywords,
      createdAt: new Date(),
      verified: formData.verified,
    };

    const updated = [...reviews, newReview];
    setReviews(updated);

    if (onReviewsChange) {
      onReviewsChange(updated);
    }

    setFormData({
      rating: 5,
      text: '',
      category: 'treatment-quality',
      verified: false,
    });
  };

  const handleAnalyze = (): void => {
    if (reviews.length === 0) return;

    const aggregation = ReviewAnalyzer.aggregateReviews(reviews);
    setAnalysis(aggregation);
  };

  const handleReset = (): void => {
    setReviews([]);
    setAnalysis(null);
    setFormData({
      rating: 5,
      text: '',
      category: 'treatment-quality',
      verified: false,
    });
  };

  const sentimentData = useMemo(() => {
    if (!analysis) return [];

    return Object.entries(analysis.sentimentDistribution)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        name: type.replace('-', ' '),
        value,
      }));
  }, [analysis]);

  const categoryData = useMemo(() => {
    if (!analysis) return [];

    return Object.entries(analysis.categoryRatings).map(([category, rating]) => ({
      category: category.replace('-', ' '),
      rating: Number(rating.toFixed(1)),
    }));
  }, [analysis]);

  const ratingData = useMemo(() => {
    if (!analysis) return [];

    return [
      { stars: '5★', count: analysis.ratingDistribution[5] },
      { stars: '4★', count: analysis.ratingDistribution[4] },
      { stars: '3★', count: analysis.ratingDistribution[3] },
      { stars: '2★', count: analysis.ratingDistribution[2] },
      { stars: '1★', count: analysis.ratingDistribution[1] },
    ];
  }, [analysis]);

  const insights = useMemo(() => {
    if (reviews.length === 0) return null;
    return ReviewAnalyzer.generateInsights(reviews);
  }, [reviews]);

  const recommendation = useMemo(() => {
    if (reviews.length === 0) return null;
    return ReviewAnalyzer.calculateRecommendationConfidence(reviews);
  }, [reviews]);

  const getSentimentColor = (sentiment: SentimentType): string => {
    const colorMap: Record<SentimentType, string> = {
      'very-positive': 'text-green-600',
      positive: 'text-green-500',
      neutral: 'text-yellow-500',
      negative: 'text-orange-500',
      'very-negative': 'text-red-600',
    };
    return colorMap[sentiment];
  };

  const getSentimentBgColor = (sentiment: SentimentType): string => {
    const colorMap: Record<SentimentType, string> = {
      'very-positive': 'bg-green-50',
      positive: 'bg-green-50',
      neutral: 'bg-yellow-50',
      negative: 'bg-orange-50',
      'very-negative': 'bg-red-50',
    };
    return colorMap[sentiment];
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

  const sortedReviews = useMemo(() => {
    return ReviewAnalyzer.sortReviewsByRelevance(reviews);
  }, [reviews]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{t.title}</h1>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.addReview}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-slate-700 mb-2">
              {t.rating}
            </label>
            <select
              id="rating"
              title={t.rating}
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number.parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              {t.category}
            </label>
            <select
              id="category"
              title={t.category}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ReviewCategory })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="treatment-quality">Treatment Quality</option>
              <option value="staff-service">Staff Service</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="value-for-money">Value for Money</option>
              <option value="results">Results</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">{t.verified}</span>
            </label>
          </div>
        </div>
        <textarea
          placeholder={t.review}
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={4}
        />
        <div className="flex gap-3">
          <button
            onClick={handleAddReview}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t.addReview}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition"
          >
            {t.reset}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Reviews ({reviews.length})
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sortedReviews.slice(-5).map((review) => (
              <div
                key={review.id}
                className={`p-4 rounded-lg border-2 ${getSentimentBgColor(review.sentiment)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${getRatingColor(review.rating)}`}>
                      {'★'.repeat(review.rating)}
                    </span>
                    {review.verified && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Verified</span>}
                  </div>
                  <span className={`text-sm font-semibold ${getSentimentColor(review.sentiment)}`}>
                    {review.sentiment.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {reviews.length > 0 && (
        <button
          onClick={handleAnalyze}
          className="w-full mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
        >
          {t.analyze}
        </button>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600">{t.averageRating}</p>
              <p className={`text-2xl font-bold ${getRatingColor(analysis.averageRating)}`}>
                {analysis.averageRating.toFixed(1)}/5
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600">{t.trustScore}</p>
              <p className="text-2xl font-bold text-blue-600">
                {analysis.trustScore.toFixed(0)}%
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600">{t.verifiedReviews}</p>
              <p className="text-2xl font-bold text-slate-900">
                {analysis.verifiedReviewCount}/{analysis.totalReviews}
              </p>
            </div>
            {recommendation && (
              <div className={`rounded-lg border-2 border-slate-200 p-4 ${recommendation.likelyToRecommend ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm text-slate-600">{t.npsScore}</p>
                <p className={`text-2xl font-bold ${recommendation.likelyToRecommend ? 'text-green-600' : 'text-red-600'}`}>
                  {recommendation.npsScore}
                </p>
              </div>
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            {ratingData.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.ratingDistribution}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stars" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sentiment Breakdown */}
            {sentimentData.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.sentimentBreakdown}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Ratings */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.categoryRatings}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rating" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.strengths.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-4">✓ {t.strengths}</h3>
                  <ul className="space-y-2">
                    {insights.strengths.map((strength) => (
                      <li key={strength} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-green-600">→</span>
                        <span>{strength.substring(0, 80)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.improvementAreas.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-orange-700 mb-4">! {t.improvements}</h3>
                  <ul className="space-y-2">
                    {insights.improvementAreas.map((area) => (
                      <li key={area} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-orange-600">→</span>
                        <span>{area.substring(0, 80)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Keywords */}
          {insights && insights.mostMentionedKeywords.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.keywordAnalysis}</h3>
              <div className="flex flex-wrap gap-2">
                {insights.mostMentionedKeywords.slice(0, 10).map((kw) => (
                  <span
                    key={kw.keyword}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentBgColor(kw.sentiment)} ${getSentimentColor(kw.sentiment)}`}
                  >
                    {kw.keyword} ({kw.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {reviews.length === 0 && !analysis && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">{t.noReviews}</p>
        </div>
      )}
    </div>
  );
}
