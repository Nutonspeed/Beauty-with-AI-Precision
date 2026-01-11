'use client';

/**
 * Program Recommendations Component
 * 
 * Displays personalized program, product, and lifestyle recommendations
 * based on AI analysis of skin health results
 */

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
  Heart,
  Star,
  ShoppingCart,
} from 'lucide-react';
import type {
  RecommendationResult,
  ProgramRecommendation,
  ProductRecommendation,
} from '@/lib/ai/program-recommendations';

// ============================================================================
// Helper Components
// ============================================================================

function PriorityBadge({ priority }: { priority: string }) {
  const t = useTranslations('programRecommendation');
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };
  
  const labels: Record<string, string> = {
    high: t('high_priority'),
    medium: t('medium_priority'),
    low: t('low_priority'),
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

export interface ProgramRecommendationsProps {
  recommendations: RecommendationResult;
  locale?: 'th' | 'en';
  onBookConsultation?: (programId: string) => void;
  onBuyProduct?: (productId: string) => void;
}

export default function ProgramRecommendations({
  recommendations,
  locale: _locale,
  onBookConsultation,
  onBuyProduct,
}: Readonly<ProgramRecommendationsProps>) {
  const t = useTranslations('programRecommendation');
  
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
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('estimated_cost')}</p>
                <p className="text-2xl font-bold">
                  {stats.estimatedCost.min.toLocaleString()}-
                  {stats.estimatedCost.max.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{t('baht')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('expected_improvement')}</p>
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
                <p className="text-sm text-muted-foreground">{t('confidence')}</p>
                <p className="text-2xl font-bold">{stats.confidence}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={stats.confidence} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="programs">
            <Zap className="w-4 h-4 mr-2" />
            {t('programs')}
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            {t('products')}
          </TabsTrigger>
          <TabsTrigger value="lifestyle">
            <Leaf className="w-4 h-4 mr-2" />
            {t('lifestyle')}
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="w-4 h-4 mr-2" />
            {t('timeline')}
          </TabsTrigger>
        </TabsList>
        
        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          {recommendations.programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onBook={() => onBookConsultation?.(program.id)}
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
                onBuy={() => onBuyProduct?.(product.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Lifestyle Tab */}
        <TabsContent value="lifestyle" className="space-y-4">
          <LifestyleRecommendations
            lifestyle={recommendations.lifestyle}
          />
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <TimelineView timeline={recommendations.timeline} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Program Card
// ============================================================================

function ProgramCard({
  program,
  onBook,
}: {
  program: ProgramRecommendation;
  onBook?: () => void;
}) {
  const t = useTranslations('programRecommendation');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {program.name}
              <PriorityBadge priority={program.priority} />
            </CardTitle>
            <CardDescription>{program.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {Math.round(program.confidence * 100)}% {t('confidence')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Concerns */}
        <div>
          <p className="text-sm font-medium mb-2">{t('concerns')}:</p>
          <div className="flex flex-wrap gap-2">
            {program.targetConcerns.map((concern) => (
              <Badge key={concern} variant="outline">
                {concern}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('effectiveness')}</p>
            <div className="flex items-center gap-2">
              <Progress value={program.effectiveness} className="flex-1" />
              <span className="text-sm font-medium">{program.effectiveness}%</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">{t('sessions')}</p>
            <p className="text-sm font-medium">{program.numberOfSessions}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">{t('duration')}</p>
            <p className="text-sm font-medium">{program.duration}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">{t('pain_level')}</p>
            <PainLevel level={program.painLevel} />
          </div>
        </div>
        
        {/* Cost */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {program.cost.min.toLocaleString()}-{program.cost.max.toLocaleString()}{' '}
            {t('baht')} {t('per_session')}
          </span>
        </div>
        
        {/* Expected Results */}
        <Alert>
          <TrendingUp className="w-4 h-4" />
          <AlertDescription>
            <strong>{t('expected_results')}:</strong> {program.expectedResults}
          </AlertDescription>
        </Alert>
        
        {/* Benefits */}
        <div>
          <p className="text-sm font-medium mb-2">{t('benefits')}:</p>
          <ul className="space-y-1">
            {program.benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Risks */}
        {program.risks.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">{t('risks')}:</p>
            <ul className="space-y-1">
              {program.risks.map((risk, idx) => (
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
          {t('book_consultation')}
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
  onBuy,
}: {
  product: ProductRecommendation;
  onBuy?: () => void;
}) {
  const t = useTranslations('programRecommendation');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription>{product.brand}</CardDescription>
          </div>
          <PriorityBadge priority={product.priority} />
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
            {product.rating} ({product.reviewCount.toLocaleString()} {t('reviews')})
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground">{product.description}</p>
        
        {/* Key Ingredients */}
        <div>
          <p className="text-xs font-medium mb-1">{t('key_ingredients')}:</p>
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
          <p className="text-xs font-medium text-muted-foreground mb-1">{t('usage')}:</p>
          <p>{product.usage}</p>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">{t('price')}</p>
            <p className="text-lg font-bold">
              {product.price.amount.toLocaleString()} {t('baht')}
            </p>
          </div>
          
          <Button onClick={onBuy} size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('buy_now')}
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
}: {
  lifestyle: RecommendationResult['lifestyle'];
}) {
  const t = useTranslations('programRecommendation');
  
  const categories = [
    { key: 'diet', label: t('diet'), icon: Leaf, color: 'text-green-500' },
    { key: 'hydration', label: t('hydration'), icon: Heart, color: 'text-blue-500' },
    { key: 'sleep', label: t('sleep'), icon: Clock, color: 'text-purple-500' },
    { key: 'stress', label: t('stress'), icon: Zap, color: 'text-orange-500' },
    {
      key: 'sun_protection',
      label: t('sun_protection'),
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
}: {
  timeline: RecommendationResult['timeline'];
}) {
  const t = useTranslations('programRecommendation');
  
  const phases = [
    { key: 'immediate', label: t('immediate'), color: 'bg-blue-500' },
    { key: 'short_term', label: t('short_term'), color: 'bg-purple-500' },
    { key: 'long_term', label: t('long_term'), color: 'bg-green-500' },
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
