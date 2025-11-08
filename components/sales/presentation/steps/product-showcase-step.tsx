'use client'

/**
 * Product Showcase Step Component
 * 
 * Interactive 3D product carousel with:
 * - Horizontal swipe carousel
 * - 3D product viewer integration
 * - Recommended products based on AI analysis
 * - Multi-product selection
 * - Mobile-optimized touch controls
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sparkles, 
  AlertCircle,
  Package,
  CheckCircle2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product3DViewer } from '@/components/ar/product-3d-viewer'
import { getProduct3DManager } from '@/lib/ar/product-3d-viewer'

interface ProductShowcaseStepProps {
  readonly selectedProducts: string[]
  readonly recommendedProducts: string[]
  readonly onUpdate: (products: string[]) => void
  readonly customerName: string
}

export function ProductShowcaseStep({
  selectedProducts,
  recommendedProducts,
  onUpdate,
  customerName,
}: ProductShowcaseStepProps) {
  const manager = getProduct3DManager()
  const allProducts = manager.getAllProducts()
  
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [view3D, setView3D] = useState(false)

  const currentProduct = allProducts[currentProductIndex]

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      onUpdate(selectedProducts.filter(id => id !== productId))
    } else {
      onUpdate([...selectedProducts, productId])
    }
  }

  // Navigate carousel
  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % allProducts.length)
  }

  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + allProducts.length) % allProducts.length)
  }

  // Check if product is recommended
  const isRecommended = (productId: string) => {
    return recommendedProducts.some(rec => 
      productId.toLowerCase().includes(rec.toLowerCase()) ||
      rec.toLowerCase().includes(productId.toLowerCase())
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <Package className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
          Browse and select products for {customerName}. Recommended products are highlighted based on AI analysis.
        </AlertDescription>
      </Alert>

      {/* Product Carousel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {isRecommended(currentProduct.id) && (
                  <Badge className="bg-green-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                {currentProduct.name}
              </CardTitle>
              <CardDescription>
                {currentProduct.category.toUpperCase()} • {currentProductIndex + 1} of {allProducts.length}
              </CardDescription>
            </div>
            <Button
              variant={view3D ? "default" : "outline"}
              size="sm"
              onClick={() => setView3D(!view3D)}
            >
              {view3D ? "Card View" : "3D View"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {view3D ? (
            // 3D Viewer Mode
            <div className="space-y-4">
              <Product3DViewer
                productId={currentProduct.id}
                autoRotate={true}
                showIngredients={true}
                showHotspots={true}
              />
            </div>
          ) : (
            // Card Preview Mode
            <div className="space-y-4">
              {/* Product Image Placeholder */}
              <div className="aspect-square w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center">
                <Package className="h-24 w-24 text-slate-400" />
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                {/* Ingredients */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Key Ingredients
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentProduct.ingredients.slice(0, 4).map((ingredient) => (
                      <div
                        key={ingredient.name}
                        className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md"
                      >
                        <p className="text-xs font-medium">{ingredient.nameThai}</p>
                        {ingredient.concentration && (
                          <p className="text-xs text-muted-foreground">{ingredient.concentration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Benefits
                  </h4>
                  <div className="space-y-1">
                    {currentProduct.benefits.slice(0, 4).map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Carousel Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="lg"
              onClick={prevProduct}
              className="flex-1 max-w-[120px]"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </Button>

            {/* Selection Button */}
            <Button
              size="lg"
              onClick={() => toggleProduct(currentProduct.id)}
              className={cn(
                "flex-1 max-w-[200px] gap-2",
                selectedProducts.includes(currentProduct.id) && "bg-green-600 hover:bg-green-700"
              )}
            >
              {selectedProducts.includes(currentProduct.id) ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Selected
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add to Proposal
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={nextProduct}
              className="flex-1 max-w-[120px]"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>

          {/* Product Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {allProducts.map((product, index) => (
              <button
                key={product.id}
                onClick={() => setCurrentProductIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentProductIndex 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-gray-300 dark:bg-gray-600"
                )}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Product Grid (Recommended) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            Recommended for {customerName}
          </CardTitle>
          <CardDescription>
            Based on AI skin analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {allProducts
              .filter(product => isRecommended(product.id))
              .slice(0, 4)
              .map((product) => {
                const isSelected = selectedProducts.includes(product.id)
                
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      "hover:shadow-md active:scale-95",
                      isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/5"
                    )}
                  >
                    {/* Product Icon */}
                    <div className="aspect-square w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-md flex items-center justify-center mb-2">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>

                    {/* Product Name */}
                    <p className="text-xs font-semibold line-clamp-2 mb-1">
                      {product.name}
                    </p>

                    {/* Category */}
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>

                    {/* Selection Check */}
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Added</span>
                      </div>
                    )}
                  </button>
                )
              })}
          </div>

          {/* No Recommendations Message */}
          {allProducts.filter(p => isRecommended(p.id)).length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No specific product recommendations yet. Browse all products above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Selected Products ({selectedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedProducts.map((productId) => {
                const product = manager.getProduct(productId)
                if (!product) return null
                
                return (
                  <div 
                    key={productId}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    {/* Product Icon */}
                    <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleProduct(productId)}
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedProducts.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            No products selected yet. Browse and add products to include in the proposal.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
