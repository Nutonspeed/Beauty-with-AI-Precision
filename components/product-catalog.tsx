// @ts-nocheck
'use client';

import { useState } from 'react';
import { Product, ProductCategory } from '@/lib/ecommerce/product-manager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Star, ShoppingCart, Search, Filter, Grid, List } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  onSearch: (query: string, filters: any) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (productId: string) => void;
  categories?: { category: ProductCategory; count: number }[];
  brands?: string[];
  priceRange?: { min: number; max: number };
}

export function ProductCatalog({
  products,
  onSearch,
  onAddToCart,
  onViewProduct,
  categories = [],
  brands = [],
  priceRange = { min: 0, max: 1000 },
}: ProductCatalogProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(priceRange.min);
  const [priceMax, setPriceMax] = useState(priceRange.max);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    const [field, order] = sortBy.split('-');
    
    onSearch(searchQuery, {
      filter: {
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        priceMin: priceMin > priceRange.min ? priceMin : undefined,
        priceMax: priceMax < priceRange.max ? priceMax : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        query: searchQuery || undefined,
      },
      sort: {
        field: field as any,
        order: order as any,
      },
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <Card className="w-64 h-fit">
            <CardContent className="p-6 space-y-6">
              {/* View Mode */}
              <div>
                <Label className="text-sm font-medium mb-2 block">View</Label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sort */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                    <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                    <SelectItem value="rating-desc">Rating (High-Low)</SelectItem>
                    <SelectItem value="createdAt-desc">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Categories</Label>
                  <div className="space-y-2">
                    {categories.map(({ category, count }) => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label className="text-sm cursor-pointer flex-1">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                          <span className="text-gray-500 ml-1">({count})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Brands</Label>
                  <div className="space-y-2">
                    {brands.map(brand => (
                      <div key={brand} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <label className="text-sm cursor-pointer flex-1">{brand}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Price: ${priceMin} - ${priceMax}
                </Label>
                <div className="space-y-4">
                  <Slider
                    value={[priceMin]}
                    onValueChange={([value]) => setPriceMin(value)}
                    min={priceRange.min}
                    max={priceRange.max}
                    step={5}
                  />
                  <Slider
                    value={[priceMax]}
                    onValueChange={([value]) => setPriceMax(value)}
                    min={priceRange.min}
                    max={priceRange.max}
                    step={5}
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
                <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Ratings</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Product Grid/List */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-gray-600">
            {products.length} products found
          </div>

          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {products.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="cursor-pointer"
                  onClick={() => onViewProduct(product.id)}
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.compareAtPrice && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        Save ${(product.compareAtPrice - product.price).toFixed(2)}
                      </Badge>
                    )}
                    {product.featured && (
                      <Badge className="absolute top-2 left-2">Featured</Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm ml-1">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({product.reviewCount} reviews)
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">${product.price}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.compareAtPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {product.bestseller && <Badge variant="outline">Bestseller</Badge>}
                        {product.newArrival && <Badge variant="outline">New</Badge>}
                      </div>

                      {product.stock > 0 ? (
                        <p className="text-sm text-green-600">In Stock ({product.stock})</p>
                      ) : (
                        <p className="text-sm text-red-600">Out of Stock</p>
                      )}
                    </div>
                  </CardContent>
                </div>

                <CardContent className="p-4 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
