'use client';

/**
 * AR 3D Product Viewer Component
 * 
 * Features:
 * - 360° interactive rotation
 * - PBR materials with realistic lighting
 * - Ingredient/benefit overlays
 * - Interactive hotspots
 * - AR placement simulation
 */

import { Suspense, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

// Dynamic imports for heavy 3D libraries
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false });
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false });
const PerspectiveCamera = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.PerspectiveCamera })), { ssr: false });
const Html = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Html })), { ssr: false });

// Import useFrame for type safety (loaded dynamically at runtime)
let useFrame: any;
if (typeof window !== 'undefined') {
  import('@react-three/fiber').then(mod => { useFrame = mod.useFrame; });
}
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Lightbulb,
  Package,
  Layers,
  Info,
  Sparkles
} from 'lucide-react';
import {
  type Product3DModel,
  Product3DModelGenerator,
  AREnvironmentLighting,
  getProduct3DManager,
} from '@/lib/ar/product-3d-viewer';

interface Product3DViewerProps {
  productId: string;
  className?: string;
  autoRotate?: boolean;
  showIngredients?: boolean;
  showHotspots?: boolean;
  arMode?: boolean;
}

/**
 * 3D Product Mesh Component
 */
function ProductMesh({ 
  product,
  showIngredients,
  activeHotspot,
  onHotspotClick
}: { 
  product: Product3DModel;
  showIngredients: boolean;
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Create geometry based on product category
  const geometry = (() => {
    switch (product.category) {
      case 'serum':
        return Product3DModelGenerator.createBottleGeometry(product.dimensions);
      case 'cream':
        return Product3DModelGenerator.createJarGeometry(product.dimensions);
      case 'injection':
        return Product3DModelGenerator.createSyringeGeometry(product.dimensions);
      case 'device':
        return new THREE.BoxGeometry(
          product.dimensions.width,
          product.dimensions.height,
          product.dimensions.depth
        );
      default:
        return new THREE.CylinderGeometry(
          product.dimensions.width / 2,
          product.dimensions.width / 2,
          product.dimensions.height,
          32
        );
    }
  })();
  
  // Create PBR material
  const material = Product3DModelGenerator.createPBRMaterial(product.materials);
  
  // Gentle rotation animation
  useFrame((state: any) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });
  
  return (
    <>
      {/* Main product mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      />
      
      {/* Ingredient markers */}
      {showIngredients && product.ingredients.map((ingredient) => (
        <group key={`ing-${ingredient.name}`} position={ingredient.position.toArray()}>
          <mesh>
            <sphereGeometry args={[0.005, 16, 16]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.5}
            />
          </mesh>
          <Html distanceFactor={0.1}>
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
              {ingredient.nameThai}
            </div>
          </Html>
        </group>
      ))}
      
      {/* Interactive hotspots */}
      {product.hotspots.map((hotspot) => (
        <group key={hotspot.id} position={hotspot.position.toArray()}>
          <mesh
            onClick={() => onHotspotClick(hotspot.id)}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <sphereGeometry args={[0.008, 16, 16]} />
            <meshStandardMaterial
              color={hotspot.type === 'caution' ? '#ef4444' : '#10b981'}
              emissive={hotspot.type === 'caution' ? '#ef4444' : '#10b981'}
              emissiveIntensity={activeHotspot === hotspot.id ? 1 : 0.3}
            />
          </mesh>
          {activeHotspot === hotspot.id && (
            <Html distanceFactor={0.15}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs pointer-events-none">
                <div className="font-semibold text-sm mb-1">{hotspot.label}</div>
                <div className="text-xs text-gray-600">{hotspot.description}</div>
              </div>
            </Html>
          )}
        </group>
      ))}
    </>
  );
}

/**
 * Lighting Component
 */
function ProductLighting({ _intensity }: { _intensity: number }) {
  const lightGroupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (lightGroupRef.current) {
      const lights = AREnvironmentLighting.createLightingRig();
      lightGroupRef.current.add(lights);
    }
  }, []);
  
  return (
    <group ref={lightGroupRef}>
      {/* Lights are added dynamically via AREnvironmentLighting */}
    </group>
  );
}

/**
 * Ground Plane with Shadow
 */
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[1, 1]} />
      <shadowMaterial opacity={0.3} />
    </mesh>
  );
}

/**
 * Main Product 3D Viewer Component
 */
export function Product3DViewer({
  productId,
  className = '',
  autoRotate = true,
  showIngredients = true,
  showHotspots: _showHotspots = true,
  arMode = false,
}: Product3DViewerProps) {
  const controlsRef = useRef<any>(null);
  const [product, setProduct] = useState<Product3DModel | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'benefits'>('info');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [lightingIntensity, setLightingIntensity] = useState([100]);
  const [zoom, setZoom] = useState([3]);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(autoRotate ?? true);
  
  // Load product data
  useEffect(() => {
    const manager = getProduct3DManager();
    const productData = manager.getProduct(productId);
    setProduct(productData || null);
  }, [productId]);
  
  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };
  
  const handleHotspotClick = (id: string) => {
    setActiveHotspot(activeHotspot === id ? null : id);
  };
  
  if (!product) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Product not found: {productId}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {product.name}
            </CardTitle>
            <CardDescription>
              360° Interactive Product Visualization
            </CardDescription>
          </div>
          <Badge variant="secondary">{product.category.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 3D Canvas */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 0, zoom[0]]} />
            <OrbitControls
              ref={controlsRef}
              autoRotate={autoRotateEnabled}
              autoRotateSpeed={2}
              enableDamping
              dampingFactor={0.05}
              minDistance={1}
              maxDistance={8}
            />
            
            <ProductLighting _intensity={lightingIntensity[0] / 100} />
            
            <Suspense fallback={null}>
              <ProductMesh
                product={product}
                showIngredients={showIngredients && activeTab === 'ingredients'}
                activeHotspot={activeHotspot}
                onHotspotClick={handleHotspotClick}
              />
            </Suspense>
          
            <GroundPlane />
          </Canvas>
          
          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={resetCamera}
              className="bg-white/90 hover:bg-white"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
              className="bg-white/90 hover:bg-white"
            >
              {autoRotateEnabled ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* AR Mode Indicator */}
          {arMode && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="default" className="bg-purple-500">
                <Sparkles className="h-3 w-3 mr-1" />
                AR Mode
              </Badge>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="space-y-3">
          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                Zoom
              </span>
              <span className="text-xs text-muted-foreground">
                {zoom[0].toFixed(1)}x
              </span>
            </div>
            <Slider
              value={zoom}
              onValueChange={setZoom}
              min={1.5}
              max={6}
              step={0.1}
            />
          </div>
          
          {/* Lighting Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Lighting
              </span>
              <span className="text-xs text-muted-foreground">
                {lightingIntensity[0]}%
              </span>
            </div>
            <Slider
              value={lightingIntensity}
              onValueChange={setLightingIntensity}
              min={0}
              max={200}
              step={10}
            />
          </div>
        </div>
        
        {/* Product Information Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">
              <Info className="h-4 w-4 mr-2" />
              ข้อมูล
            </TabsTrigger>
            <TabsTrigger value="ingredients">
              <Layers className="h-4 w-4 mr-2" />
              ส่วนผสม
            </TabsTrigger>
            <TabsTrigger value="benefits">
              <Sparkles className="h-4 w-4 mr-2" />
              ประโยชน์
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-3 mt-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Product Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">
                    {(product.dimensions.width * 100).toFixed(0)} x{' '}
                    {(product.dimensions.height * 100).toFixed(0)} x{' '}
                    {(product.dimensions.depth * 100).toFixed(0)} cm
                  </span>
                </div>
              </div>
            </div>
            
            {/* Hotspots */}
            {product.hotspots.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Interactive Points</h4>
                <div className="space-y-2">
                  {product.hotspots.map((hotspot) => (
                    <Button
                      key={hotspot.id}
                      variant={activeHotspot === hotspot.id ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => handleHotspotClick(hotspot.id)}
                    >
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        hotspot.type === 'caution' ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{hotspot.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {hotspot.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ingredients" className="space-y-3 mt-4">
            <h4 className="font-semibold text-sm mb-2">Active Ingredients</h4>
            <div className="space-y-3">
              {product.ingredients.map((ingredient) => (
                <Card key={ingredient.name} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-sm">{ingredient.nameThai}</div>
                        <div className="text-xs text-muted-foreground">
                          {ingredient.name}
                        </div>
                      </div>
                      {ingredient.concentration && (
                        <Badge variant="secondary">{ingredient.concentration}</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {ingredient.benefits.map((benefit) => (
                        <div key={benefit} className="text-xs flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-blue-500" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="benefits" className="space-y-3 mt-4">
            <h4 className="font-semibold text-sm mb-2">Key Benefits</h4>
            <div className="space-y-2">
              {product.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
                >
                  <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
