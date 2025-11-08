'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductRecommendationComponent } from '@/components/analysis/product-recommendation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertCircle,
  Check,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import type { ProductRecommendationResult } from '@/lib/ai/product-recommendation';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// Mock analysis data
const mockAnalysis: HybridSkinAnalysis = {
  id: 'analysis-001',
  userId: 'user-001',
  createdAt: new Date(),
  timestamp: new Date(),
  imageUrl: 'https://via.placeholder.com/640x480',
  ai: {
    skinType: 'combination',
    concerns: ['dark_spots', 'large_pores', 'fine_lines'],
    severity: {
      acne: 2,
      wrinkles: 4,
      dark_spots: 5,
      large_pores: 4,
      redness: 2,
      dullness: 3,
      fine_lines: 3,
      blackheads: 2,
      hyperpigmentation: 5,
    },
    recommendations: [
      { category: 'serum', product: 'Vitamin C', reason: 'Brightening' },
      { category: 'moisturizer', product: 'Hydrator', reason: 'Hydration' },
    ],
    confidence: 0.92,
  },
  aiProvider: 'google-vision',
  cv: {
    spots: {
      count: 23,
      locations: [],
      severity: 6,
    },
    pores: {
      averageSize: 0.8,
      enlargedCount: 45,
      severity: 5,
    },
    wrinkles: {
      count: 12,
      locations: [],
      severity: 5,
    },
    texture: {
      smoothness: 65,
      roughness: 35,
      score: 6,
    },
    redness: {
      percentage: 8,
      areas: [],
      severity: 2,
    },
  },
  overallScore: {
    spots: 6,
    pores: 5,
    wrinkles: 5,
    texture: 6,
    redness: 2,
    pigmentation: 5,
  },
  percentiles: {
    spots: 62,
    pores: 58,
    wrinkles: 65,
    texture: 62,
    redness: 82,
    overall: 66,
  },
  confidence: 0.92,
  recommendations: ['Use vitamin C serum', 'Apply sunscreen daily'],
  annotatedImages: {},
};

// Mock product recommendations
const mockRecommendations: ProductRecommendationResult = {
  products: [
    {
      id: 'prod-001',
      name: 'Vitamin C Brightening Serum',
      brand: 'SkinGlow Pro',
      category: 'serum',
      targetConcerns: ['spots', 'texture'],
      priority: 'high',
      confidence: 0.95,
      description: 'Advanced vitamin C serum reduces dark spots and brightens complexion',
      keyIngredients: ['Vitamin C', 'Hyaluronic Acid', 'Ferulic Acid'],
      usage: 'Apply 2-3 drops morning and night to clean skin',
      price: { amount: 1290, currency: 'THB' },
      suitableFor: ['combination', 'oily', 'normal'],
      rating: 4.7,
      reviewCount: 2341,
      reviews: [
        {
          id: 'rev-001',
          userId: 'user-001',
          rating: 5,
          title: 'Amazing results!',
          comment: 'My spots have faded significantly after 6 weeks',
          verifiedPurchase: true,
          helpful: 245,
          unhelpful: 12,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          skinType: 'combination',
          skinConcern: 'spots',
          resultAfterWeeks: 6,
        },
        {
          id: 'rev-002',
          userId: 'user-002',
          rating: 4,
          title: 'Good serum',
          comment: 'Effective but slightly sticky',
          verifiedPurchase: true,
          helpful: 128,
          unhelpful: 5,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          skinType: 'oily',
          resultAfterWeeks: 4,
        },
        {
          id: 'rev-003',
          userId: 'user-003',
          rating: 5,
          title: 'Transformed my skin',
          comment: 'Visible lightening of hyperpigmentation',
          verifiedPurchase: true,
          helpful: 189,
          unhelpful: 8,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          skinType: 'combination',
          resultAfterWeeks: 8,
        },
      ],
      averageRating: 4.7,
      totalReviews: 2341,
      inventory: [
        {
          productId: 'prod-001',
          storeId: 'sephora',
          quantity: 145,
          price: 1290,
          currency: 'THB',
          inStock: true,
          storeUrl: 'https://sephora.example.com/vitamin-c-serum',
          estimatedDelivery: '2-3 days',
        },
        {
          productId: 'prod-001',
          storeId: 'lazada',
          quantity: 89,
          price: 1250,
          currency: 'THB',
          inStock: true,
          storeUrl: 'https://lazada.example.com/vitamin-c-serum',
          estimatedDelivery: '1-2 days',
        },
        {
          productId: 'prod-001',
          storeId: 'shopee',
          quantity: 156,
          price: 1300,
          currency: 'THB',
          inStock: true,
          storeUrl: 'https://shopee.example.com/vitamin-c-serum',
          estimatedDelivery: '1-2 days',
        },
      ],
      bestPrice: {
        amount: 1250,
        store: 'lazada',
        storeUrl: 'https://lazada.example.com/vitamin-c-serum',
      },
      purchaseHistory: [
        {
          id: 'purch-001',
          userId: 'user-current',
          productId: 'prod-001',
          quantity: 1,
          purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          price: 1290,
          store: 'sephora',
          storeUrl: 'https://sephora.example.com',
          status: 'delivered',
          feedbackProvided: true,
          userRating: 5,
        },
      ],
      relatedProducts: ['prod-002', 'prod-003'],
      lastPurchased: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      repurchaseInterval: 45,
      skinTypeReviews: [
        { skinType: 'combination', averageRating: 4.8, reviewCount: 1245 },
        { skinType: 'oily', averageRating: 4.6, reviewCount: 856 },
        { skinType: 'normal', averageRating: 4.7, reviewCount: 240 },
      ],
    },
    {
      id: 'prod-002',
      name: 'Gentle Cleanser',
      brand: 'PureClean',
      category: 'cleanser',
      targetConcerns: ['spots', 'texture', 'redness'],
      priority: 'high',
      confidence: 0.92,
      description: 'Gentle pH-balanced cleanser removes impurities without stripping',
      keyIngredients: ['Green Tea Extract', 'Gentle Surfactants', 'Aloe Vera'],
      usage: 'Massage onto damp face, rinse with lukewarm water. Use morning and night.',
      price: { amount: 390, currency: 'THB' },
      suitableFor: ['all'],
      rating: 4.5,
      reviewCount: 1856,
      reviews: [
        {
          id: 'rev-004',
          userId: 'user-004',
          rating: 5,
          title: 'Best cleanser ever',
          comment: 'Non-stripping, skin feels fresh',
          verifiedPurchase: true,
          helpful: 156,
          unhelpful: 3,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          skinType: 'combination',
        },
      ],
      averageRating: 4.5,
      totalReviews: 1856,
      inventory: [
        {
          productId: 'prod-002',
          storeId: 'boots',
          quantity: 234,
          price: 390,
          currency: 'THB',
          inStock: true,
          storeUrl: 'https://boots.example.com/gentle-cleanser',
          estimatedDelivery: '2-3 days',
        },
      ],
      bestPrice: {
        amount: 390,
        store: 'boots',
        storeUrl: 'https://boots.example.com/gentle-cleanser',
      },
      relatedProducts: ['prod-001', 'prod-004'],
      lastPurchased: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      repurchaseInterval: 30,
      skinTypeReviews: [
        { skinType: 'combination', averageRating: 4.6, reviewCount: 845 },
        { skinType: 'sensitive', averageRating: 4.4, reviewCount: 623 },
      ],
    },
    {
      id: 'prod-003',
      name: 'Hydrating Moisturizer',
      brand: 'AquaSoft',
      category: 'moisturizer',
      targetConcerns: ['texture', 'wrinkles'],
      priority: 'high',
      confidence: 0.88,
      description: 'Lightweight hydrating moisturizer plumps skin and reduces fine lines',
      keyIngredients: ['Hyaluronic Acid', 'Niacinamide', 'Peptides'],
      usage: 'Apply to damp skin. Use twice daily.',
      price: { amount: 590, currency: 'THB' },
      suitableFor: ['all'],
      rating: 4.6,
      reviewCount: 1324,
      reviews: [],
      averageRating: 4.6,
      totalReviews: 1324,
      inventory: [
        {
          productId: 'prod-003',
          storeId: 'yesstyle',
          quantity: 78,
          price: 550,
          currency: 'THB',
          inStock: true,
          storeUrl: 'https://yesstyle.example.com/hydrating-moisturizer',
          estimatedDelivery: '3-5 days',
        },
      ],
      bestPrice: {
        amount: 550,
        store: 'yesstyle',
        storeUrl: 'https://yesstyle.example.com/hydrating-moisturizer',
      },
      relatedProducts: ['prod-001'],
      lastPurchased: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      repurchaseInterval: 45,
      skinTypeReviews: [
        { skinType: 'all', averageRating: 4.6, reviewCount: 1324 },
      ],
    },
    {
      id: 'prod-004',
      name: 'Daily Sunscreen SPF50',
      brand: 'UVGuard',
      category: 'sunscreen',
      targetConcerns: ['spots', 'redness'],
      priority: 'high',
      confidence: 0.96,
      description: 'Lightweight daily sunscreen with SPF 50+ PA++++ protection',
      keyIngredients: ['Zinc Oxide', 'Titanium Dioxide', 'Antioxidants'],
      usage: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.',
      price: { amount: 690, currency: 'THB' },
      suitableFor: ['all'],
      rating: 4.8,
      reviewCount: 3456,
      reviews: [],
      averageRating: 4.8,
      totalReviews: 3456,
      inventory: [
        {
          productId: 'prod-004',
          storeId: 'amazon',
          quantity: 456,
          price: 650,
          currency: 'THB',
          inStock: true,
          storeUrl: 'https://amazon.example.com/daily-sunscreen',
          estimatedDelivery: '2-4 days',
        },
      ],
      bestPrice: {
        amount: 650,
        store: 'amazon',
        storeUrl: 'https://amazon.example.com/daily-sunscreen',
      },
      relatedProducts: ['prod-003'],
      lastPurchased: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      repurchaseInterval: 30,
      skinTypeReviews: [
        { skinType: 'all', averageRating: 4.8, reviewCount: 3456 },
      ],
    },
    {
      id: 'prod-005',
      name: 'Retinol Night Treatment',
      brand: 'AgeDefX',
      category: 'treatment',
      targetConcerns: ['wrinkles', 'texture', 'spots'],
      priority: 'medium',
      confidence: 0.85,
      description: 'Encapsulated retinol smooths wrinkles and improves texture overnight',
      keyIngredients: ['Retinol', 'Squalane', 'Ceramides'],
      usage: 'Apply pea-sized amount to clean, dry skin before bed. Start 3x weekly.',
      price: { amount: 1090, currency: 'THB' },
      suitableFor: ['oily', 'combination', 'normal'],
      rating: 4.4,
      reviewCount: 892,
      reviews: [],
      averageRating: 4.4,
      totalReviews: 892,
      inventory: [
        {
          productId: 'prod-005',
          storeId: 'cultbeauty',
          quantity: 45,
          price: 1090,
          currency: 'THB',
          inStock: true,
          storeUrl: 'https://cultbeauty.example.com/retinol-treatment',
          estimatedDelivery: '3-7 days',
        },
      ],
      bestPrice: {
        amount: 1090,
        store: 'cultbeauty',
        storeUrl: 'https://cultbeauty.example.com/retinol-treatment',
      },
      relatedProducts: ['prod-003'],
      repurchaseInterval: 60,
      skinTypeReviews: [
        { skinType: 'oily', averageRating: 4.5, reviewCount: 456 },
        { skinType: 'combination', averageRating: 4.3, reviewCount: 436 },
      ],
    },
  ],
  totalCost: {
    min: 3910,
    max: 4350,
  },
  completenessScore: 85,
  estimatedResults: {
    timeline: '8-12 weeks',
    expectedImprovements: [
      'Significant reduction in dark spots and hyperpigmentation',
      'Improved skin texture and smoothness',
      'Visible reduction in fine lines and wrinkles',
      'More even and radiant skin tone',
    ],
    requirementForBestResults: [
      'Consistent daily use of all products as recommended',
      'Adequate sun protection (minimum SPF 30, reapply every 2 hours)',
      'Allow 8-12 weeks for maximum results',
      'Use complementary products for enhanced synergistic effects',
      'Stay hydrated and maintain healthy lifestyle',
    ],
  },
};

// Chart data
const purchaseHistoryData = [
  { month: 'Jan', vitamin_c: 1, cleanser: 1, moisturizer: 0 },
  { month: 'Feb', vitamin_c: 0, cleanser: 0, moisturizer: 1 },
  { month: 'Mar', vitamin_c: 1, cleanser: 1, moisturizer: 0 },
  { month: 'Apr', vitamin_c: 0, cleanser: 0, moisturizer: 0 },
  { month: 'May', vitamin_c: 1, cleanser: 1, moisturizer: 1 },
];

const spendingData = [
  { category: 'Serum', amount: 2580 },
  { category: 'Cleanser', amount: 780 },
  { category: 'Moisturizer', amount: 1180 },
  { category: 'Sunscreen', amount: 1300 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

export default function ProductRecommendationTestPage() {
  const [locale, setLocale] = useState<'th' | 'en'>('en');

  const translations = {
    en: {
      title: 'Product Recommendation Integration Test',
      description: 'Test page for e-commerce integration, reviews, and purchase tracking',
      currentAnalysis: 'Current Skin Analysis',
      purchaseHistory: 'Purchase History Timeline',
      spendingBreakdown: 'Spending Breakdown by Category',
      mockDataInfo: 'Mock Data Information',
      analysisDate: 'Analysis Date',
      skinType: 'Skin Type',
      primaryConcerns: 'Primary Concerns',
      recommendations: 'Product Recommendations',
      features: 'Key Features',
      toggleLanguage: 'Toggle Language',
    },
    th: {
      title: 'ทดสอบการรวมรายการสินค้าที่แนะนำ',
      description: 'หน้าทดสอบสำหรับการรวม e-commerce บทวิจารณ์ และการติดตามการซื้อ',
      currentAnalysis: 'การวิเคราะห์ผิวปัจจุบัน',
      purchaseHistory: 'ไทม์ไลน์ประวัติการซื้อ',
      spendingBreakdown: 'การแบ่งการใช้จ่ายตามหมวดหมู่',
      mockDataInfo: 'ข้อมูล Mock',
      analysisDate: 'วันที่วิเคราะห์',
      skinType: 'ประเภทผิว',
      primaryConcerns: 'ข้อกังวลหลัก',
      recommendations: 'ข้อแนะนำสินค้า',
      features: 'คุณสมบัติหลัก',
      toggleLanguage: 'เปลี่ยนภาษา',
    },
  };

  const t = translations[locale];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{t.title}</h1>
              <p className="text-lg text-muted-foreground">{t.description}</p>
            </div>
            <Button
              onClick={() => setLocale(locale === 'en' ? 'th' : 'en')}
              variant="outline"
            >
              {t.toggleLanguage} ({locale.toUpperCase()})
            </Button>
          </div>
        </div>

        {/* Current Analysis Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              {t.currentAnalysis}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.analysisDate}</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.skinType}</p>
                <p className="font-semibold capitalize">{mockAnalysis.ai.skinType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.primaryConcerns}</p>
                <div className="flex flex-wrap gap-1">
                  {mockAnalysis.ai.concerns.slice(0, 2).map((concern: string) => (
                    <Badge key={concern} variant="secondary" className="capitalize">
                      {concern.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Overall</p>
                <p className="font-semibold text-lg">
                  {Math.round((100 - mockAnalysis.percentiles.overall))}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Purchase History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.purchaseHistory}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={purchaseHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vitamin_c" stackId="a" fill="#8b5cf6" name="Vitamin C" />
                  <Bar dataKey="cleanser" stackId="a" fill="#3b82f6" name="Cleanser" />
                  <Bar dataKey="moisturizer" stackId="a" fill="#10b981" name="Moisturizer" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {t.spendingBreakdown}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {spendingData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[spendingData.indexOf(entry) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Features Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              {t.features}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                '✓ Weighted rating aggregation (verified purchases, recency)',
                '✓ Multi-store price comparison',
                '✓ Inventory tracking across platforms',
                '✓ Purchase history integration',
                '✓ Skin type-specific review breakdown',
                '✓ Repurchase interval calculation',
                '✓ Related product recommendations',
                '✓ Budget estimation and tracking',
                '✓ Completeness score for routines',
                '✓ E-commerce link integration',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Product Recommendation Component */}
        <ProductRecommendationComponent
          recommendations={mockRecommendations}
          locale={locale}
          onPurchase={(productId, storeUrl) => {
            console.log(`Purchase initiated: ${productId} from ${storeUrl}`);
            alert(`Opening store: ${storeUrl}`);
          }}
          onAddReview={(productId) => {
            console.log(`Add review for: ${productId}`);
            alert(`Review form for product: ${productId}`);
          }}
        />
      </div>
    </div>
  );
}
