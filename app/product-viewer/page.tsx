'use client';

/**
 * AR Product Visualization Demo Page
 * Showcase 3D product viewer with multiple products
 */

import { useState } from 'react';
import { Product3DViewer } from '@/components/ar/product-3d-viewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, Sparkles, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProduct3DManager } from '@/lib/ar/product-3d-viewer';

export default function ProductVisualizationPage() {
  const router = useRouter();
  const manager = getProduct3DManager();
  const allProducts = manager.getAllProducts();
  
  const [selectedProductId, setSelectedProductId] = useState('vitamin-c-serum');
  
  const selectedProduct = manager.getProduct(selectedProductId);
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🎨 AR Product Visualization
            </h1>
            <p className="text-muted-foreground">
              Interactive 3D product viewer with realistic materials and ingredient overlays
            </p>
          </div>
          <Badge variant="default" className="bg-purple-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Task 6/7
          </Badge>
        </div>
      </div>
      
      {/* Feature Highlights */}
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Features Implemented
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <div className="font-semibold text-sm">360° Rotation</div>
                <div className="text-xs text-muted-foreground">
                  Drag to rotate, scroll to zoom, auto-rotate mode
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <div className="font-semibold text-sm">PBR Materials</div>
                <div className="text-xs text-muted-foreground">
                  Realistic metallic, roughness, and clearcoat rendering
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <div className="font-semibold text-sm">Ingredient Overlays</div>
                <div className="text-xs text-muted-foreground">
                  Interactive markers showing active ingredients in Thai
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <div className="font-semibold text-sm">Interactive Hotspots</div>
                <div className="text-xs text-muted-foreground">
                  Clickable points with detailed information
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <div className="font-semibold text-sm">Realistic Lighting</div>
                <div className="text-xs text-muted-foreground">
                  3-point lighting with adjustable intensity and shadows
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <div className="font-semibold text-sm">Product Information</div>
                <div className="text-xs text-muted-foreground">
                  Benefits, ingredients, usage instructions in Thai
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Selector - Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Select Product
              </CardTitle>
              <CardDescription>
                Choose a product to visualize in 3D
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {allProducts.map((product) => (
                <Button
                  key={product.id}
                  variant={selectedProductId === product.id ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      {' • '}
                      {product.ingredients.length} ingredients
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {product.category === 'serum' && '💧'}
                    {product.category === 'cream' && '🧴'}
                    {product.category === 'device' && '🔬'}
                    {product.category === 'injection' && '💉'}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>
          
          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="skincare">Skincare</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="outline" className="justify-center">
                      Serums ({manager.getProductsByCategory('serum').length})
                    </Badge>
                    <Badge variant="outline" className="justify-center">
                      Creams ({manager.getProductsByCategory('cream').length})
                    </Badge>
                    <Badge variant="outline" className="justify-center">
                      Devices ({manager.getProductsByCategory('device').length})
                    </Badge>
                    <Badge variant="outline" className="justify-center">
                      Injections ({manager.getProductsByCategory('injection').length})
                    </Badge>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Quick Info */}
          {selectedProduct && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-sm">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Product:</span>
                  <div className="font-medium">{selectedProduct.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Ingredients:</span>
                  <div className="font-medium">{selectedProduct.ingredients.length} active</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Benefits:</span>
                  <div className="font-medium">{selectedProduct.benefits.length} key benefits</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Hotspots:</span>
                  <div className="font-medium">{selectedProduct.hotspots.length} interactive</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* 3D Viewer - Main */}
        <div className="lg:col-span-2">
          <Product3DViewer
            productId={selectedProductId}
            autoRotate={true}
            showIngredients={true}
            showHotspots={true}
          />
          
          {/* Instructions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">How to Interact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Drag</Badge>
                <span className="text-muted-foreground">Rotate product 360°</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Scroll</Badge>
                <span className="text-muted-foreground">Zoom in/out</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Click Hotspot</Badge>
                <span className="text-muted-foreground">View detailed information</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ingredients Tab</Badge>
                <span className="text-muted-foreground">See ingredient markers on 3D model</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Technical Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Technical Implementation</CardTitle>
          <CardDescription>
            Built with Three.js, PBR materials, and realistic lighting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Rendering Engine</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Three.js 3D engine</li>
                <li>• @react-three/fiber React integration</li>
                <li>• @react-three/drei helpers</li>
                <li>• WebGL GPU acceleration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Material System</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• PBR (Physically Based Rendering)</li>
                <li>• Metallic/Roughness workflow</li>
                <li>• Normal maps for detail</li>
                <li>• Clearcoat for glossy finish</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Lighting System</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 3-point lighting (key, fill, back)</li>
                <li>• Real-time shadows</li>
                <li>• Hemisphere lighting</li>
                <li>• Adjustable intensity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
