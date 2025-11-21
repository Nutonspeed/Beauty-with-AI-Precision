'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star,
  ShoppingCart,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Check,
  Package,
  MessageSquare,
} from 'lucide-react';
import type { ProductWithIntegration, ProductRecommendationResult } from '@/lib/ai/product-recommendation';

// ============================================================================
// Types
// ============================================================================

interface ProductRecommendationProps {
  readonly recommendations: ProductRecommendationResult;
  readonly locale: 'th' | 'en';
  readonly onPurchase?: (productId: string, storeUrl: string) => void;
  readonly onAddReview?: (productId: string) => void;
}

// ============================================================================
// Translations
// ============================================================================

const TRANSLATIONS = {
  en: {
    title: 'Recommended Products',
    description: 'Personalized skincare products matched to your analysis',
    completeness: 'Regimen Completeness',
    estimatedBudget: 'Estimated Budget',
    totalResults: 'Total Products',
    overallResults: 'Overall Results',
    timeline: 'Expected Timeline',
    expectations: 'What to Expect',
    requirements: 'For Best Results',
    productReviews: 'Customer Reviews',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    bestPrice: 'Best Price',
    viewOther: 'View Other Stores',
    buyNow: 'Buy Now',
    readReviews: 'Read Reviews',
    addReview: 'Add Review',
    verifiedPurchase: 'Verified Purchase',
    allReviews: 'All Reviews',
    helpful: 'Helpful',
    skinType: 'Skin Type',
    resultAfter: 'Results After',
    weeks: 'weeks',
    rating: 'Rating',
    based: 'based on',
    reviews: 'reviews',
    complementary: 'Complementary Products',
    repurchaseIn: 'Repurchase in',
    days: 'days',
    lastPurchased: 'Last Purchased',
    noPurchaseHistory: 'No purchase history',
    estimatedDelivery: 'Estimated Delivery',
    pros: 'What Users Love',
    cons: 'Common Feedback',
    skinTypeBreakdown: 'Rating by Skin Type',
    ratingDistribution: 'Rating Distribution',
    completenessScore: 'Your regimen covers',
    ofRecommendedCategories: 'of recommended product categories',
    viewDetails: 'View Details',
    close: 'Close',
    price: 'Price',
    store: 'Store',
    delivery: 'Delivery',
    filterByCategory: 'Filter by Category',
    all: 'All',
    sortBy: 'Sort by',
    relevance: 'Relevance',
    price_asc: 'Price (Low to High)',
    price_desc: 'Price (High to Low)',
    rating_high: 'Highest Rated',
  },
  th: {
    title: 'ผลิตภัณฑ์ที่แนะนำ',
    description: 'ผลิตภัณฑ์ดูแลผิวที่ปรับเข้ากับผลการวิเคราะห์ของคุณ',
    completeness: 'ความสมบูรณ์ของระบบ',
    estimatedBudget: 'งบประมาณโดยประมาณ',
    totalResults: 'ผลิตภัณฑ์ทั้งหมด',
    overallResults: 'ผลลัพธ์โดยรวม',
    timeline: 'ระยะเวลาที่คาดหวัง',
    expectations: 'สิ่งที่ต้องคาดหวัง',
    requirements: 'เพื่อได้ผลลัพธ์ที่ดีที่สุด',
    productReviews: 'บทวิจารณ์ของลูกค้า',
    inStock: 'มีสินค้า',
    outOfStock: 'สินค้าหมด',
    bestPrice: 'ราคาดีที่สุด',
    viewOther: 'ดูร้านค้าอื่น',
    buyNow: 'ซื้อเลย',
    readReviews: 'อ่านบทวิจารณ์',
    addReview: 'เพิ่มบทวิจารณ์',
    verifiedPurchase: 'ซื้อแล้วและตรวจสอบแล้ว',
    allReviews: 'บทวิจารณ์ทั้งหมด',
    helpful: 'มีประโยชน์',
    skinType: 'ประเภทผิว',
    resultAfter: 'ผลลัพธ์หลังจาก',
    weeks: 'สัปดาห์',
    rating: 'การให้คะแนน',
    based: 'โดยอิงจาก',
    reviews: 'บทวิจารณ์',
    complementary: 'ผลิตภัณฑ์เสริม',
    repurchaseIn: 'ซื้อซ้ำใน',
    days: 'วัน',
    lastPurchased: 'ซื้อครั้งล่าสุด',
    noPurchaseHistory: 'ไม่มีประวัติการซื้อ',
    estimatedDelivery: 'การจัดส่งโดยประมาณ',
    pros: 'สิ่งที่ผู้ใช้ชอบ',
    cons: 'ข้อเสนอแนะ',
    skinTypeBreakdown: 'การให้คะแนนตามประเภทผิว',
    ratingDistribution: 'การกระจายการให้คะแนน',
    completenessScore: 'ระบบของคุณครอบคลุม',
    ofRecommendedCategories: 'ของหมวดหมู่ผลิตภัณฑ์ที่แนะนำ',
    viewDetails: 'ดูรายละเอียด',
    close: 'ปิด',
    price: 'ราคา',
    store: 'ร้านค้า',
    delivery: 'การจัดส่ง',
    filterByCategory: 'กรองตามหมวดหมู่',
    all: 'ทั้งหมด',
    sortBy: 'เรียงลำดับตาม',
    relevance: 'ความเกี่ยวข้อง',
    price_asc: 'ราคา (ต่ำถึงสูง)',
    price_desc: 'ราคา (สูงถึงต่ำ)',
    rating_high: 'คะแนนสูงสุด',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

const renderStars = (rating: number, count: number = 5): React.ReactNode => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={`star-${i}`}
          className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    cleanser: 'bg-blue-100 text-blue-800',
    toner: 'bg-cyan-100 text-cyan-800',
    serum: 'bg-purple-100 text-purple-800',
    moisturizer: 'bg-green-100 text-green-800',
    sunscreen: 'bg-yellow-100 text-yellow-800',
    treatment: 'bg-red-100 text-red-800',
    mask: 'bg-pink-100 text-pink-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

// ============================================================================
// Product Card Component
// ============================================================================

interface ProductCardProps {
  readonly product: ProductWithIntegration;
  readonly t: any;
  readonly locale: string;
  readonly onPurchase?: (productId: string, storeUrl: string) => void;
  readonly onAddReview?: (productId: string) => void;
  readonly onViewDetails?: (product: ProductWithIntegration) => void;
}

function ProductCard({
  product,
  t,
  locale,
  onPurchase,
  onAddReview,
  onViewDetails,
}: ProductCardProps) {
  const inventory = product.inventory.find((i) => i.inStock);
  const stockStatus = inventory ? t.inStock : t.outOfStock;
  const stockColor = inventory ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription>{product.brand}</CardDescription>
          </div>
          <Badge className={getCategoryColor(product.category)}>{product.category}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating and Reviews */}
        <div className="flex items-center justify-between">
          <div>{renderStars(product.averageRating)}</div>
          <span className="text-xs text-muted-foreground">
            {product.totalReviews} {t.reviews}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        {/* Key Ingredients */}
        <div className="flex flex-wrap gap-1">
          {product.keyIngredients.slice(0, 3).map((ingredient) => (
            <Badge key={ingredient} variant="outline" className="text-xs">
              {ingredient}
            </Badge>
          ))}
          {product.keyIngredients.length > 3 && (
            <Badge key="more" variant="outline" className="text-xs">
              +{product.keyIngredients.length - 3}
            </Badge>
          )}
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between bg-muted p-3 rounded">
          <div>
            <div className="text-sm text-muted-foreground">{t.bestPrice}</div>
            <div className="font-bold">
              {product.bestPrice.amount.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', {
                style: 'currency',
                currency: 'THB',
              })}
            </div>
          </div>
          <div className={`text-sm font-semibold ${stockColor}`}>{stockStatus}</div>
        </div>

        {/* Last Purchased and Repurchase */}
        {product.lastPurchased && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Package className="h-3 w-3" />
            {t.lastPurchased}: {new Date(product.lastPurchased).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
            {product.repurchaseInterval && (
              <span className="text-primary font-medium">
                • {t.repurchaseIn} {product.repurchaseInterval} {t.days}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails?.(product)}
            className="text-xs"
          >
            {t.viewDetails}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddReview?.(product.id)}
            className="text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {t.addReview}
          </Button>
          <Button
            size="sm"
            onClick={() => onPurchase?.(product.id, product.bestPrice.storeUrl)}
            disabled={!inventory}
            className="text-xs"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            {t.buyNow}
          </Button>
        </div>

        {/* Store Badge */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>{t.store}: {product.bestPrice.store}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => window.open(product.bestPrice.storeUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Product Details Panel
// ============================================================================

interface ProductDetailsPanelProps {
  readonly product: ProductWithIntegration | null;
  readonly t: any;
  readonly locale: string;
  readonly onClose: () => void;
}

function ProductDetailsPanel({ product, t, locale: _locale, onClose }: ProductDetailsPanelProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.brand}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Rating Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t.productReviews}</h3>
            <div className="flex items-end gap-4">
              <div>{renderStars(product.averageRating, 5)}</div>
              <div className="text-sm text-muted-foreground">
                {t.based} {product.totalReviews} {t.reviews}
              </div>
            </div>
          </div>

          {/* Skin Type Breakdown */}
          {product.skinTypeReviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">{t.skinTypeBreakdown}</h3>
              <div className="space-y-2">
                {product.skinTypeReviews.map((typeReview) => (
                  <div key={typeReview.skinType} className="flex items-center justify-between">
                    <span className="text-sm">{typeReview.skinType}</span>
                    <div className="flex items-center gap-2">
                      {renderStars(typeReview.averageRating, 5)}
                      <span className="text-xs text-muted-foreground">({typeReview.reviewCount})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Across Stores */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t.viewOther}</h3>
            <div className="space-y-2">
              {product.inventory.slice(0, 5).map((item) => (
                <div key={item.storeId} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">{item.storeId}</div>
                    <div className="text-xs text-muted-foreground">{item.price.toLocaleString()}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => window.open(item.storeUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Key Ingredients */}
          <div className="space-y-3">
            <h3 className="font-semibold">Key Ingredients</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.keyIngredients.map((ingredient) => (
                <div key={ingredient} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold">How to Use</h3>
            <p className="text-sm text-muted-foreground">{product.usage}</p>
          </div>

          {/* Related Products */}
          {product.relatedProducts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">{t.complementary}</h3>
              <div className="space-y-1">
                {product.relatedProducts.map((relatedId) => (
                  <div key={relatedId} className="text-sm text-primary cursor-pointer hover:underline">
                    → Related Product: {relatedId}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductRecommendationComponent({
  recommendations,
  locale,
  onPurchase,
  onAddReview,
}: ProductRecommendationProps) {
  const t = TRANSLATIONS[locale];
  const [selectedProduct, setSelectedProduct] = useState<ProductWithIntegration | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating_high'>('relevance');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredAndSorted = useMemo(() => {
    let products = [...recommendations.products];

    // Filter by category
    if (filterCategory !== 'all') {
      products = products.filter((p) => p.category === filterCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.bestPrice.amount - b.bestPrice.amount);
        break;
      case 'price_desc':
        products.sort((a, b) => b.bestPrice.amount - a.bestPrice.amount);
        break;
      case 'rating_high':
        products.sort((a, b) => b.averageRating - a.averageRating);
        break;
      default: // relevance
        break;
    }

    return products;
  }, [recommendations.products, sortBy, filterCategory]);

  const categories = Array.from(new Set(recommendations.products.map((p) => p.category)));
  const totalBudget = recommendations.totalCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          {t.title}
        </h2>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{recommendations.products.length}</div>
              <div className="text-sm text-muted-foreground">{t.totalResults}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">{recommendations.completenessScore}%</div>
              <div className="text-sm text-muted-foreground">{t.completeness}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                ฿{totalBudget.min.toLocaleString()} - ฿{totalBudget.max.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{t.estimatedBudget}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{recommendations.estimatedResults.timeline}</div>
              <div className="text-sm text-muted-foreground">{t.timeline}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expected Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t.expectations}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Expected Improvements:</h4>
            <ul className="space-y-2">
              {recommendations.estimatedResults.expectedImprovements.map((improvement) => (
                <li key={improvement} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{t.requirements}:</h4>
            <ul className="space-y-2">
              {recommendations.estimatedResults.requirementForBestResults.map((requirement) => (
                <li key={requirement} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold mb-2 block">{t.filterByCategory}</label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('all')}
            >
              {t.all}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={filterCategory === cat ? 'default' : 'outline'}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label htmlFor="sort-select" className="text-sm font-semibold mb-2 block">{t.sortBy}</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="relevance">{t.relevance}</option>
            <option value="price_asc">{t.price_asc}</option>
            <option value="price_desc">{t.price_desc}</option>
            <option value="rating_high">{t.rating_high}</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSorted.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            t={t}
            locale={locale}
            onPurchase={onPurchase}
            onAddReview={onAddReview}
            onViewDetails={setSelectedProduct}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSorted.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No products found matching your filters.</AlertDescription>
        </Alert>
      )}

      {/* Product Details Modal */}
      <ProductDetailsPanel
        product={selectedProduct}
        t={t}
        locale={locale}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
