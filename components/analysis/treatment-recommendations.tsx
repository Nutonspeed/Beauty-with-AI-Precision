'use client';

/**
 * Treatment Recommendations Component
 * 
 * Displays personalized treatment, product, and lifestyle recommendations
 * based on AI analysis of VISIA skin analysis results
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  Package,
  Leaf,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Heart,
  Star,
  ShoppingCart,
} from 'lucide-react';
import type {
  RecommendationResult,
  TreatmentRecommendation,
  ProductRecommendation,
} from '@/lib/ai/treatment-recommendations';

// ============================================================================
// Translation Constants
// ============================================================================

const TRANSLATIONS = {
  en: {
    title: 'Personalized Recommendations',
    description: 'AI-powered treatment and product suggestions based on your skin analysis',
    treatments: 'Treatments',
    products: 'Products',
    lifestyle: 'Lifestyle',
    timeline: 'Timeline',
    
    // Priorities
    high_priority: 'High Priority',
    medium_priority: 'Medium Priority',
    low_priority: 'Low Priority',
    
    // Treatment details
    expected_results: 'Expected Results',
    duration: 'Duration',
    frequency: 'Frequency',
    sessions: 'Sessions',
    cost_range: 'Cost Range',
    effectiveness: 'Effectiveness',
    downtime: 'Downtime',
    pain_level: 'Pain Level',
    suitable_for: 'Suitable For',
    
    // Product details
    brand: 'Brand',
    key_ingredients: 'Key Ingredients',
    usage: 'Usage',
    price: 'Price',
    rating: 'Rating',
    reviews: 'reviews',
    buy_now: 'Buy Now',
    
    // Timeline
    immediate: 'Immediate (0-2 weeks)',
    short_term: 'Short Term (2-8 weeks)',
    long_term: 'Long Term (2-6 months)',
    
    // Lifestyle categories
    diet: 'Diet',
    hydration: 'Hydration',
    sleep: 'Sleep',
    stress: 'Stress Management',
    sun_protection: 'Sun Protection',
    
    // Actions
    book_consultation: 'Book Consultation',
    view_details: 'View Details',
    add_to_plan: 'Add to Plan',
    
    // Stats
    estimated_cost: 'Estimated Cost',
    expected_improvement: 'Expected Improvement',
    confidence: 'Confidence',
    total_duration: 'Total Duration',
    
    // Misc
    per_session: 'per session',
    baht: 'THB',
    concerns: 'Target Concerns',
    benefits: 'Benefits',
    risks: 'Risks',
    before_care: 'Before Care',
    after_care: 'After Care',
    contraindications: 'Contraindications',
    alternatives: 'Alternatives',
  },
  th: {
    title: 'คำแนะนำเฉพาะบุคคล',
    description: 'คำแนะนำการรักษาและผลิตภัณฑ์ที่ AI วิเคราะห์จากผลตรวจผิวของคุณ',
    treatments: 'การรักษา',
    products: 'ผลิตภัณฑ์',
    lifestyle: 'ไลฟ์สไตล์',
    timeline: 'ไทม์ไลน์',
    
    high_priority: 'ความสำคัญสูง',
    medium_priority: 'ความสำคัญปานกลาง',
    low_priority: 'ความสำคัญต่ำ',
    
    expected_results: 'ผลลัพธ์ที่คาดหวัง',
    duration: 'ระยะเวลา',
    frequency: 'ความถี่',
    sessions: 'จำนวนครั้ง',
    cost_range: 'ช่วงราคา',
    effectiveness: 'ประสิทธิผล',
    downtime: 'ระยะฟื้นตัว',
    pain_level: 'ระดับความเจ็บ',
    suitable_for: 'เหมาะสำหรับ',
    
    brand: 'แบรนด์',
    key_ingredients: 'ส่วนผสมหลัก',
    usage: 'วิธีใช้',
    price: 'ราคา',
    rating: 'คะแนน',
    reviews: 'รีวิว',
    buy_now: 'ซื้อเลย',
    
    immediate: 'ทันที (0-2 สัปดาห์)',
    short_term: 'ระยะสั้น (2-8 สัปดาห์)',
    long_term: 'ระยะยาว (2-6 เดือน)',
    
    diet: 'อาหาร',
    hydration: 'การดื่มน้ำ',
    sleep: 'การนอนหลับ',
    stress: 'การจัดการความเครียด',
    sun_protection: 'การป้องกันแสงแดด',
    
    book_consultation: 'จองคำปรึกษา',
    view_details: 'ดูรายละเอียด',
    add_to_plan: 'เพิ่มในแผน',
    
    estimated_cost: 'ค่าใช้จ่ายโดยประมาณ',
    expected_improvement: 'การปรับปรุงที่คาดหวัง',
    confidence: 'ความมั่นใจ',
    total_duration: 'ระยะเวลารวม',
    
    per_session: 'ต่อครั้ง',
    baht: 'บาท',
    concerns: 'เป้าหมาย',
    benefits: 'ข้อดี',
    risks: 'ความเสี่ยง',
    before_care: 'การดูแลก่อนทำ',
    after_care: 'การดูแลหลังทำ',
    contraindications: 'ข้อห้าม',
    alternatives: 'ทางเลือกอื่น',
  },
};

// ============================================================================
// Helper Components
// ============================================================================

function PriorityBadge({ priority, locale = 'th' }: { priority: string; locale?: 'th' | 'en' }) {
  const t = TRANSLATIONS[locale];
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };
  
  const labels = {
    high: t.high_priority,
    medium: t.medium_priority,
    low: t.low_priority,
  };
  
  return (
    <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
      {labels[priority as keyof typeof labels]}
    </Badge>
  );
}

function PainLevel({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 w-2 rounded-full ${
            idx < level ? 'bg-orange-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export interface TreatmentRecommendationsProps {
  recommendations: RecommendationResult;
  locale?: 'th' | 'en';
  onBookConsultation?: (treatmentId: string) => void;
  onBuyProduct?: (productId: string) => void;
}

export default function TreatmentRecommendations({
  recommendations,
  locale = 'th',
  onBookConsultation,
  onBuyProduct,
}: Readonly<TreatmentRecommendationsProps>) {
  const t = TRANSLATIONS[locale];
  
  // Summary stats
  const stats = useMemo(() => {
    const avgImprovement =
      Object.values(recommendations.expectedImprovement).reduce((a, b) => a + b, 0) /
        Object.keys(recommendations.expectedImprovement).length || 0;
    
    return {
      estimatedCost: recommendations.estimatedCost,
      avgImprovement: Math.round(avgImprovement),
      confidence: Math.round(recommendations.confidence * 100),
    };
  }, [recommendations]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">{t.title}</h2>
        </div>
        <p className="text-muted-foreground">{t.description}</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.estimated_cost}</p>
                <p className="text-2xl font-bold">
                  {stats.estimatedCost.min.toLocaleString()}-
                  {stats.estimatedCost.max.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{t.baht}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.expected_improvement}</p>
                <p className="text-2xl font-bold">{stats.avgImprovement}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={stats.avgImprovement} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.confidence}</p>
                <p className="text-2xl font-bold">{stats.confidence}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={stats.confidence} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="treatments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="treatments">
            <Zap className="w-4 h-4 mr-2" />
            {t.treatments}
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            {t.products}
          </TabsTrigger>
          <TabsTrigger value="lifestyle">
            <Leaf className="w-4 h-4 mr-2" />
            {t.lifestyle}
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="w-4 h-4 mr-2" />
            {t.timeline}
          </TabsTrigger>
        </TabsList>
        
        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-4">
          {recommendations.treatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              locale={locale}
              onBook={() => onBookConsultation?.(treatment.id)}
            />
          ))}
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                onBuy={() => onBuyProduct?.(product.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Lifestyle Tab */}
        <TabsContent value="lifestyle" className="space-y-4">
          <LifestyleRecommendations
            lifestyle={recommendations.lifestyle}
            locale={locale}
          />
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <TimelineView timeline={recommendations.timeline} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Treatment Card
// ============================================================================

function TreatmentCard({
  treatment,
  locale,
  onBook,
}: {
  treatment: TreatmentRecommendation;
  locale: 'th' | 'en';
  onBook?: () => void;
}) {
  const t = TRANSLATIONS[locale];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {treatment.name}
              <PriorityBadge priority={treatment.priority} locale={locale} />
            </CardTitle>
            <CardDescription>{treatment.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {Math.round(treatment.confidence * 100)}% {t.confidence}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Concerns */}
        <div>
          <p className="text-sm font-medium mb-2">{t.concerns}:</p>
          <div className="flex flex-wrap gap-2">
            {treatment.targetConcerns.map((concern) => (
              <Badge key={concern} variant="outline">
                {concern}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t.effectiveness}</p>
            <div className="flex items-center gap-2">
              <Progress value={treatment.effectiveness} className="flex-1" />
              <span className="text-sm font-medium">{treatment.effectiveness}%</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">{t.sessions}</p>
            <p className="text-sm font-medium">{treatment.numberOfSessions}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">{t.duration}</p>
            <p className="text-sm font-medium">{treatment.duration}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">{t.pain_level}</p>
            <PainLevel level={treatment.painLevel} />
          </div>
        </div>
        
        {/* Cost */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {treatment.cost.min.toLocaleString()}-{treatment.cost.max.toLocaleString()}{' '}
            {t.baht} {t.per_session}
          </span>
        </div>
        
        {/* Expected Results */}
        <Alert>
          <TrendingUp className="w-4 h-4" />
          <AlertDescription>
            <strong>{t.expected_results}:</strong> {treatment.expectedResults}
          </AlertDescription>
        </Alert>
        
        {/* Benefits */}
        <div>
          <p className="text-sm font-medium mb-2">{t.benefits}:</p>
          <ul className="space-y-1">
            {treatment.benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Risks */}
        {treatment.risks.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">{t.risks}:</p>
            <ul className="space-y-1">
              {treatment.risks.map((risk, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Action Button */}
        <Button onClick={onBook} className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          {t.book_consultation}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Product Card
// ============================================================================

function ProductCard({
  product,
  locale,
  onBuy,
}: {
  product: ProductRecommendation;
  locale: 'th' | 'en';
  onBuy?: () => void;
}) {
  const t = TRANSLATIONS[locale];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription>{product.brand}</CardDescription>
          </div>
          <PriorityBadge priority={product.priority} locale={locale} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`w-4 h-4 ${
                  idx < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.reviewCount.toLocaleString()} {t.reviews})
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground">{product.description}</p>
        
        {/* Key Ingredients */}
        <div>
          <p className="text-xs font-medium mb-1">{t.key_ingredients}:</p>
          <div className="flex flex-wrap gap-1">
            {product.keyIngredients.map((ingredient, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Usage */}
        <div className="text-sm">
          <p className="text-xs font-medium text-muted-foreground mb-1">{t.usage}:</p>
          <p>{product.usage}</p>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">{t.price}</p>
            <p className="text-lg font-bold">
              {product.price.amount.toLocaleString()} {t.baht}
            </p>
          </div>
          
          <Button onClick={onBuy} size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t.buy_now}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Lifestyle Recommendations
// ============================================================================

function LifestyleRecommendations({
  lifestyle,
  locale,
}: {
  lifestyle: RecommendationResult['lifestyle'];
  locale: 'th' | 'en';
}) {
  const t = TRANSLATIONS[locale];
  
  const categories = [
    { key: 'diet', label: t.diet, icon: Leaf, color: 'text-green-500' },
    { key: 'hydration', label: t.hydration, icon: Heart, color: 'text-blue-500' },
    { key: 'sleep', label: t.sleep, icon: Clock, color: 'text-purple-500' },
    { key: 'stress', label: t.stress, icon: Zap, color: 'text-orange-500' },
    {
      key: 'sun_protection',
      label: t.sun_protection,
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${color}`} />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lifestyle[key as keyof typeof lifestyle].map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Timeline View
// ============================================================================

function TimelineView({
  timeline,
  locale,
}: {
  timeline: RecommendationResult['timeline'];
  locale: 'th' | 'en';
}) {
  const t = TRANSLATIONS[locale];
  
  const phases = [
    { key: 'immediate', label: t.immediate, color: 'bg-blue-500' },
    { key: 'short_term', label: t.short_term, color: 'bg-purple-500' },
    { key: 'long_term', label: t.long_term, color: 'bg-green-500' },
  ];
  
  return (
    <div className="space-y-6">
      {phases.map(({ key, label, color }) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {timeline[key as keyof typeof timeline].map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
