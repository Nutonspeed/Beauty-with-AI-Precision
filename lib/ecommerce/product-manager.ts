// E-Commerce Product Manager
// Manages product catalog, inventory, categories, and AI-based recommendations

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  brand?: string;
  tags: string[];
  ingredients?: string[];
  skinType?: ('normal' | 'dry' | 'oily' | 'combination' | 'sensitive')[];
  rating: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
}

export type ProductCategory = 
  | 'skincare'
  | 'makeup'
  | 'haircare'
  | 'bodycare'
  | 'supplements'
  | 'devices'
  | 'accessories';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProductFilter {
  categories?: ProductCategory[];
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  skinTypes?: string[];
  brands?: string[];
  tags?: string[];
  rating?: number;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
}

export interface ProductSort {
  field: 'name' | 'price' | 'rating' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface AIRecommendation {
  productId: string;
  score: number;
  reason: string;
  relatedProducts: string[];
}

export class ProductManager {
  private products: Map<string, Product> = new Map();
  private reviews: Map<string, ProductReview[]> = new Map();
  private userPurchaseHistory: Map<string, string[]> = new Map();
  private userBrowsingHistory: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Initialize sample product data
   */
  private initializeSampleData(): void {
    const sampleProducts: Product[] = [
      {
        id: 'prod-001',
        name: 'Hyaluronic Acid Serum',
        description: 'Intensive hydration serum with pure hyaluronic acid for plump, dewy skin',
        category: 'skincare',
        price: 45.00,
        compareAtPrice: 60.00,
        images: ['/products/serum-1.jpg', '/products/serum-1-2.jpg'],
        inStock: true,
        stockQuantity: 120,
        sku: 'SKC-HA-001',
        brand: 'DermaTech',
        tags: ['hydration', 'anti-aging', 'sensitive-skin'],
        ingredients: ['Hyaluronic Acid', 'Vitamin B5', 'Glycerin'],
        skinType: ['dry', 'normal', 'combination'],
        rating: 4.8,
        reviewCount: 234,
        createdAt: Date.now() - 86400000 * 90,
        updatedAt: Date.now(),
        featured: true,
        bestseller: true,
        newArrival: false,
      },
      {
        id: 'prod-002',
        name: 'Vitamin C Brightening Cream',
        description: 'Advanced vitamin C formula for radiant, even-toned skin',
        category: 'skincare',
        price: 55.00,
        images: ['/products/cream-1.jpg'],
        inStock: true,
        stockQuantity: 85,
        sku: 'SKC-VC-002',
        brand: 'GlowScience',
        tags: ['brightening', 'anti-aging', 'dark-spots'],
        ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid'],
        skinType: ['normal', 'combination', 'oily'],
        rating: 4.6,
        reviewCount: 156,
        createdAt: Date.now() - 86400000 * 60,
        updatedAt: Date.now(),
        featured: true,
        bestseller: false,
        newArrival: false,
      },
      {
        id: 'prod-003',
        name: 'Retinol Night Treatment',
        description: 'Clinical-strength retinol for smoother, firmer skin overnight',
        category: 'skincare',
        price: 68.00,
        compareAtPrice: 85.00,
        images: ['/products/retinol-1.jpg'],
        inStock: true,
        stockQuantity: 45,
        sku: 'SKC-RT-003',
        brand: 'DermaTech',
        tags: ['anti-aging', 'wrinkles', 'texture'],
        ingredients: ['Retinol 0.5%', 'Peptides', 'Ceramides'],
        skinType: ['normal', 'dry', 'combination'],
        rating: 4.9,
        reviewCount: 412,
        createdAt: Date.now() - 86400000 * 120,
        updatedAt: Date.now(),
        featured: true,
        bestseller: true,
        newArrival: false,
      },
      {
        id: 'prod-004',
        name: 'Niacinamide Toner',
        description: 'Pore-refining toner with 10% niacinamide for clearer skin',
        category: 'skincare',
        price: 32.00,
        images: ['/products/toner-1.jpg'],
        inStock: true,
        stockQuantity: 200,
        sku: 'SKC-NI-004',
        brand: 'PureGlow',
        tags: ['pores', 'oil-control', 'brightening'],
        ingredients: ['Niacinamide 10%', 'Zinc', 'Witch Hazel'],
        skinType: ['oily', 'combination', 'sensitive'],
        rating: 4.7,
        reviewCount: 189,
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now(),
        featured: false,
        bestseller: true,
        newArrival: true,
      },
      {
        id: 'prod-005',
        name: 'Gentle Cleansing Foam',
        description: 'pH-balanced foam cleanser for sensitive skin',
        category: 'skincare',
        price: 28.00,
        images: ['/products/cleanser-1.jpg'],
        inStock: true,
        stockQuantity: 150,
        sku: 'SKC-CL-005',
        brand: 'SensitiveCare',
        tags: ['cleansing', 'gentle', 'sensitive-skin'],
        ingredients: ['Amino Acids', 'Chamomile', 'Aloe Vera'],
        skinType: ['sensitive', 'dry', 'normal'],
        rating: 4.5,
        reviewCount: 98,
        createdAt: Date.now() - 86400000 * 45,
        updatedAt: Date.now(),
        featured: false,
        bestseller: false,
        newArrival: true,
      },
      {
        id: 'prod-006',
        name: 'LED Face Mask',
        description: 'Professional-grade LED therapy device for anti-aging',
        category: 'devices',
        price: 299.00,
        compareAtPrice: 399.00,
        images: ['/products/led-mask-1.jpg'],
        inStock: true,
        stockQuantity: 25,
        sku: 'DEV-LED-001',
        brand: 'BeautyTech',
        tags: ['anti-aging', 'led-therapy', 'professional'],
        skinType: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
        rating: 4.8,
        reviewCount: 67,
        createdAt: Date.now() - 86400000 * 15,
        updatedAt: Date.now(),
        featured: true,
        bestseller: false,
        newArrival: true,
      },
    ];

    sampleProducts.forEach(product => this.products.set(product.id, product));

    // Sample reviews
    const sampleReviews: ProductReview[] = [
      {
        id: 'rev-001',
        productId: 'prod-001',
        userId: 'user-001',
        userName: 'Sarah M.',
        rating: 5,
        title: 'Amazing hydration!',
        comment: 'This serum has transformed my dry skin. Highly recommend!',
        verified: true,
        helpful: 45,
        createdAt: Date.now() - 86400000 * 10,
        updatedAt: Date.now() - 86400000 * 10,
      },
      {
        id: 'rev-002',
        productId: 'prod-003',
        userId: 'user-002',
        userName: 'Jennifer L.',
        rating: 5,
        title: 'Best retinol ever',
        comment: 'Visible results in just 2 weeks. No irritation!',
        verified: true,
        helpful: 89,
        createdAt: Date.now() - 86400000 * 20,
        updatedAt: Date.now() - 86400000 * 20,
      },
    ];

    sampleReviews.forEach(review => {
      if (!this.reviews.has(review.productId)) {
        this.reviews.set(review.productId, []);
      }
      this.reviews.get(review.productId)!.push(review);
    });
  }

  /**
   * Get all products
   */
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): Product | null {
    return this.products.get(productId) || null;
  }

  /**
   * Search and filter products
   */
  searchProducts(filter?: ProductFilter, sort?: ProductSort): Product[] {
    let results = Array.from(this.products.values());

    // Apply filters
    if (filter) {
      if (filter.categories && filter.categories.length > 0) {
        results = results.filter(p => filter.categories!.includes(p.category));
      }

      if (filter.priceRange) {
        results = results.filter(
          p => p.price >= filter.priceRange!.min && p.price <= filter.priceRange!.max
        );
      }

      if (filter.inStock !== undefined) {
        results = results.filter(p => p.inStock === filter.inStock);
      }

      if (filter.skinTypes && filter.skinTypes.length > 0) {
        results = results.filter(p =>
          p.skinType?.some(st => filter.skinTypes!.includes(st))
        );
      }

      if (filter.brands && filter.brands.length > 0) {
        results = results.filter(p => filter.brands!.includes(p.brand || ''));
      }

      if (filter.tags && filter.tags.length > 0) {
        results = results.filter(p =>
          filter.tags!.some(tag => p.tags.includes(tag))
        );
      }

      if (filter.rating) {
        results = results.filter(p => p.rating >= filter.rating!);
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filter.featured) {
        results = results.filter(p => p.featured);
      }

      if (filter.bestseller) {
        results = results.filter(p => p.bestseller);
      }

      if (filter.newArrival) {
        results = results.filter(p => p.newArrival);
      }
    }

    // Apply sorting
    if (sort) {
      results.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.order === 'asc' ? comparison : -comparison;
      });
    }

    return results;
  }

  /**
   * Get product reviews
   */
  getProductReviews(productId: string): ProductReview[] {
    return this.reviews.get(productId) || [];
  }

  /**
   * Add product review
   */
  addReview(review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>): ProductReview {
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (!this.reviews.has(review.productId)) {
      this.reviews.set(review.productId, []);
    }
    this.reviews.get(review.productId)!.push(newReview);

    // Update product rating
    this.updateProductRating(review.productId);

    return newReview;
  }

  /**
   * Update product rating based on reviews
   */
  private updateProductRating(productId: string): void {
    const product = this.products.get(productId);
    if (!product) return;

    const reviews = this.reviews.get(productId) || [];
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Math.round((totalRating / reviews.length) * 10) / 10;
    product.reviewCount = reviews.length;
  }

  /**
   * Get AI-based product recommendations
   */
  getRecommendations(userId: string, limit = 6): AIRecommendation[] {
    const purchaseHistory = this.userPurchaseHistory.get(userId) || [];
    const browsingHistory = this.userBrowsingHistory.get(userId) || [];

    // Combine histories with weights
    const productScores = new Map<string, number>();

    // Purchased products (higher weight)
    purchaseHistory.forEach(productId => {
      const product = this.products.get(productId);
      if (!product) return;

      // Recommend similar products
      this.products.forEach((p, id) => {
        if (id === productId) return;

        let score = 0;

        // Same category
        if (p.category === product.category) score += 30;

        // Shared tags
        const sharedTags = p.tags.filter(tag => product.tags.includes(tag));
        score += sharedTags.length * 10;

        // Same brand
        if (p.brand === product.brand) score += 15;

        // Similar price range (±30%)
        const priceDiff = Math.abs(p.price - product.price) / product.price;
        if (priceDiff <= 0.3) score += 10;

        // High rating
        if (p.rating >= 4.5) score += 5;

        productScores.set(id, (productScores.get(id) || 0) + score);
      });
    });

    // Browsed products (lower weight)
    browsingHistory.forEach(productId => {
      const product = this.products.get(productId);
      if (!product) return;

      this.products.forEach((p, id) => {
        if (id === productId) return;

        let score = 0;

        if (p.category === product.category) score += 15;
        const sharedTags = p.tags.filter(tag => product.tags.includes(tag));
        score += sharedTags.length * 5;

        productScores.set(id, (productScores.get(id) || 0) + score);
      });
    });

    // Also recommend bestsellers and new arrivals
    this.products.forEach((product, id) => {
      if (product.bestseller) {
        productScores.set(id, (productScores.get(id) || 0) + 20);
      }
      if (product.newArrival) {
        productScores.set(id, (productScores.get(id) || 0) + 10);
      }
      if (product.featured) {
        productScores.set(id, (productScores.get(id) || 0) + 15);
      }
    });

    // Convert to recommendations
    const recommendations: AIRecommendation[] = Array.from(productScores.entries())
      .map(([productId, score]) => ({
        productId,
        score,
        reason: this.getRecommendationReason(productId, purchaseHistory, browsingHistory),
        relatedProducts: this.getRelatedProducts(productId, 3),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Get recommendation reason
   */
  private getRecommendationReason(
    productId: string,
    purchaseHistory: string[],
    browsingHistory: string[]
  ): string {
    const product = this.products.get(productId);
    if (!product) return 'Recommended for you';

    if (product.bestseller) return 'Bestseller';
    if (product.newArrival) return 'New Arrival';

    // Check if similar to purchased products
    for (const purchasedId of purchaseHistory) {
      const purchased = this.products.get(purchasedId);
      if (purchased && purchased.category === product.category) {
        return `Similar to your previous purchase`;
      }
    }

    // Check if similar to browsed products
    for (const browsedId of browsingHistory) {
      const browsed = this.products.get(browsedId);
      if (browsed && browsed.category === product.category) {
        return `Based on your browsing`;
      }
    }

    return 'Recommended for you';
  }

  /**
   * Get related products
   */
  private getRelatedProducts(productId: string, limit: number): string[] {
    const product = this.products.get(productId);
    if (!product) return [];

    const related = Array.from(this.products.entries())
      .filter(([id]) => id !== productId)
      .map(([id, p]) => {
        let score = 0;
        if (p.category === product.category) score += 30;
        const sharedTags = p.tags.filter(tag => product.tags.includes(tag));
        score += sharedTags.length * 10;
        return { id, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.id);

    return related;
  }

  /**
   * Track user browsing
   */
  trackBrowsing(userId: string, productId: string): void {
    if (!this.userBrowsingHistory.has(userId)) {
      this.userBrowsingHistory.set(userId, []);
    }

    const history = this.userBrowsingHistory.get(userId)!;
    if (!history.includes(productId)) {
      history.unshift(productId);
      
      // Keep last 20 items
      if (history.length > 20) {
        history.pop();
      }
    }
  }

  /**
   * Track user purchase
   */
  trackPurchase(userId: string, productIds: string[]): void {
    if (!this.userPurchaseHistory.has(userId)) {
      this.userPurchaseHistory.set(userId, []);
    }

    const history = this.userPurchaseHistory.get(userId)!;
    productIds.forEach(productId => {
      if (!history.includes(productId)) {
        history.push(productId);
      }
    });
  }

  /**
   * Update stock quantity
   */
  updateStock(productId: string, quantity: number): boolean {
    const product = this.products.get(productId);
    if (!product) return false;

    product.stockQuantity = quantity;
    product.inStock = quantity > 0;
    product.updatedAt = Date.now();

    return true;
  }

  /**
   * Decrease stock (for purchases)
   */
  decreaseStock(productId: string, quantity: number): boolean {
    const product = this.products.get(productId);
    if (!product) return false;

    if (product.stockQuantity < quantity) return false;

    product.stockQuantity -= quantity;
    product.inStock = product.stockQuantity > 0;
    product.updatedAt = Date.now();

    return true;
  }

  /**
   * Get categories
   */
  getCategories(): { category: ProductCategory; count: number }[] {
    const categoryMap = new Map<ProductCategory, number>();

    this.products.forEach(product => {
      categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  }

  /**
   * Get brands
   */
  getBrands(): string[] {
    const brands = new Set<string>();
    this.products.forEach(product => {
      if (product.brand) brands.add(product.brand);
    });
    return Array.from(brands).sort();
  }

  /**
   * Get price range
   */
  getPriceRange(): { min: number; max: number } {
    const prices = Array.from(this.products.values()).map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
}
