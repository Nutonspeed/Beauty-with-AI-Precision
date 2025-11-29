'use client';

/**
 * Filler & Lip Enhancement Simulator
 * AR tool for visualizing filler and lip augmentation results
 * สำหรับคลินิกฉีดฟิลเลอร์และเสริมปาก
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Download, 
  RotateCcw, 
  Play, 
  Pause,
  Heart
} from 'lucide-react';

// Filler injection areas
const FILLER_AREAS = {
  lips: {
    id: 'lips',
    name: 'ปาก (Lips)',
    nameEn: 'Lips',
    subAreas: ['upper_lip', 'lower_lip', 'lip_border', 'cupids_bow'],
    priceRange: '8,000 - 25,000',
    duration: '30-45 นาที',
    recovery: '3-5 วัน',
    results: '6-12 เดือน'
  },
  cheeks: {
    id: 'cheeks',
    name: 'แก้ม (Cheeks)',
    nameEn: 'Cheeks',
    subAreas: ['apple_cheeks', 'cheekbone', 'midface'],
    priceRange: '15,000 - 35,000',
    duration: '30-45 นาที',
    recovery: '3-7 วัน',
    results: '12-18 เดือน'
  },
  chin: {
    id: 'chin',
    name: 'คาง (Chin)',
    nameEn: 'Chin',
    subAreas: ['chin_projection', 'jawline'],
    priceRange: '12,000 - 28,000',
    duration: '20-30 นาที',
    recovery: '3-5 วัน',
    results: '12-18 เดือน'
  },
  nose: {
    id: 'nose',
    name: 'จมูก (Nose)',
    nameEn: 'Non-Surgical Rhinoplasty',
    subAreas: ['nose_bridge', 'nose_tip'],
    priceRange: '10,000 - 20,000',
    duration: '15-30 นาที',
    recovery: '1-3 วัน',
    results: '12-18 เดือน'
  },
  nasolabial: {
    id: 'nasolabial',
    name: 'ร่องแก้ม (Nasolabial)',
    nameEn: 'Nasolabial Folds',
    subAreas: ['smile_lines'],
    priceRange: '12,000 - 25,000',
    duration: '20-30 นาที',
    recovery: '2-5 วัน',
    results: '9-12 เดือน'
  },
  undereye: {
    id: 'undereye',
    name: 'ใต้ตา (Under Eye)',
    nameEn: 'Tear Trough',
    subAreas: ['tear_trough', 'dark_circles'],
    priceRange: '15,000 - 30,000',
    duration: '20-30 นาที',
    recovery: '5-7 วัน',
    results: '9-12 เดือน'
  }
};

// Filler product options
const FILLER_PRODUCTS = [
  { id: 'juvederm', name: 'Juvederm', brand: 'Allergan', type: 'HA', popularity: 95 },
  { id: 'restylane', name: 'Restylane', brand: 'Galderma', type: 'HA', popularity: 90 },
  { id: 'teosyal', name: 'Teosyal', brand: 'Teoxane', type: 'HA', popularity: 85 },
  { id: 'belotero', name: 'Belotero', brand: 'Merz', type: 'HA', popularity: 80 },
  { id: 'radiesse', name: 'Radiesse', brand: 'Merz', type: 'CaHA', popularity: 75 },
];

interface FillerSimulatorProps {
  beforeImage: string;
  onExport?: (imageData: Blob) => void;
  onGenerateProposal?: (treatment: any) => void;
  className?: string;
}

export function FillerLipSimulator({
  beforeImage,
  onExport,
  onGenerateProposal,
  className = ''
}: FillerSimulatorProps) {
  const _canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedArea, setSelectedArea] = useState<string>('lips');
  const [selectedProduct, setSelectedProduct] = useState<string>('juvederm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparison, setComparison] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Enhancement levels for each area
  const [enhancements, setEnhancements] = useState({
    lips_volume: 30,
    lips_definition: 20,
    cheeks_volume: 25,
    chin_projection: 20,
    nose_bridge: 15,
    nasolabial_fill: 30,
    undereye_fill: 25
  });
  
  const [afterImage, setAfterImage] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [estimatedUnits, setEstimatedUnits] = useState(0);

  // Calculate estimated cost and units
  useEffect(() => {
    const area = FILLER_AREAS[selectedArea as keyof typeof FILLER_AREAS];
    if (!area) return;
    
    const enhancementLevel = Object.values(enhancements).reduce((a, b) => a + b, 0) / Object.values(enhancements).length;
    const baseUnits = enhancementLevel / 10; // 1ml per 10% enhancement
    const estimatedMl = Math.ceil(baseUnits * 10) / 10;
    const pricePerMl = 12000; // Average price
    
    setEstimatedUnits(estimatedMl);
    setEstimatedCost(Math.round(estimatedMl * pricePerMl));
  }, [selectedArea, enhancements]);

  // Generate enhanced image
  const generateEnhancedImage = useCallback(() => {
    if (!beforeImage) return;
    
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply enhancements based on selected area
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Define face regions (simplified - in production use face detection)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Apply lip enhancement effect
      if (selectedArea === 'lips') {
        const lipY = centerY + canvas.height * 0.15;
        const lipRadius = canvas.width * 0.12;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - lipY, 2));
            if (dist < lipRadius) {
              const idx = (y * canvas.width + x) * 4;
              const intensity = (1 - dist / lipRadius) * (enhancements.lips_volume / 100);
              
              // Enhance red/pink tones for lips
              data[idx] = Math.min(255, data[idx] + 30 * intensity);
              data[idx + 1] = Math.max(0, data[idx + 1] - 10 * intensity);
              data[idx + 2] = Math.max(0, data[idx + 2] + 15 * intensity);
            }
          }
        }
      }
      
      // Apply cheek enhancement effect
      if (selectedArea === 'cheeks') {
        const cheekY = centerY - canvas.height * 0.05;
        const cheekRadius = canvas.width * 0.15;
        
        // Left cheek
        applyVolumeEffect(data, canvas.width, canvas.height, 
          centerX - canvas.width * 0.18, cheekY, cheekRadius, 
          enhancements.cheeks_volume / 100);
        
        // Right cheek  
        applyVolumeEffect(data, canvas.width, canvas.height,
          centerX + canvas.width * 0.18, cheekY, cheekRadius,
          enhancements.cheeks_volume / 100);
      }
      
      // Apply chin enhancement
      if (selectedArea === 'chin') {
        const chinY = centerY + canvas.height * 0.25;
        const chinRadius = canvas.width * 0.08;
        
        applyVolumeEffect(data, canvas.width, canvas.height,
          centerX, chinY, chinRadius,
          enhancements.chin_projection / 100);
      }
      
      // Apply nose enhancement
      if (selectedArea === 'nose') {
        const noseY = centerY;
        const noseWidth = canvas.width * 0.04;
        const noseHeight = canvas.height * 0.12;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const distX = Math.abs(x - centerX);
            const distY = Math.abs(y - noseY);
            
            if (distX < noseWidth && distY < noseHeight) {
              const idx = (y * canvas.width + x) * 4;
              const intensity = (1 - distX / noseWidth) * (enhancements.nose_bridge / 100) * 0.5;
              
              // Highlight for nose bridge
              data[idx] = Math.min(255, data[idx] + 20 * intensity);
              data[idx + 1] = Math.min(255, data[idx + 1] + 20 * intensity);
              data[idx + 2] = Math.min(255, data[idx + 2] + 20 * intensity);
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      // Add subtle glow
      ctx.globalAlpha = 0.08;
      ctx.filter = 'blur(15px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = 'none';
      
      setAfterImage(canvas.toDataURL('image/jpeg', 0.92));
      setIsProcessing(false);
    };
    
    img.onerror = () => setIsProcessing(false);
    img.src = beforeImage;
  }, [beforeImage, selectedArea, enhancements]);

  // Helper function to apply volume effect
  const applyVolumeEffect = (
    data: Uint8ClampedArray, 
    width: number, 
    height: number,
    cx: number, 
    cy: number, 
    radius: number, 
    intensity: number
  ) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        if (dist < radius) {
          const idx = (y * width + x) * 4;
          const factor = (1 - dist / radius) * intensity * 0.3;
          
          // Add subtle highlight for volume
          data[idx] = Math.min(255, data[idx] + 15 * factor);
          data[idx + 1] = Math.min(255, data[idx + 1] + 12 * factor);
          data[idx + 2] = Math.min(255, data[idx + 2] + 10 * factor);
        }
      }
    }
  };

  // Generate on changes
  useEffect(() => {
    generateEnhancedImage();
  }, [generateEnhancedImage]);

  // Animation effect
  useEffect(() => {
    if (!isAnimating) return;
    
    let direction = 1;
    const interval = setInterval(() => {
      setComparison(prev => {
        const next = prev + direction * 2;
        if (next >= 100 || next <= 0) direction *= -1;
        return Math.max(0, Math.min(100, next));
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [isAnimating]);

  const selectedAreaInfo = FILLER_AREAS[selectedArea as keyof typeof FILLER_AREAS];
  const selectedProductInfo = FILLER_PRODUCTS.find(p => p.id === selectedProduct);

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Filler & Lip Simulator</CardTitle>
              <p className="text-sm text-gray-400">จำลองผลลัพธ์การฉีดฟิลเลอร์แบบ Real-time</p>
            </div>
          </div>
          <Badge variant="outline" className="border-pink-500/50 text-pink-400">
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Area Selection */}
        <div className="space-y-3">
          <Label className="text-white">เลือกบริเวณที่ต้องการเสริม</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(FILLER_AREAS).map(([key, area]) => (
              <Button
                key={key}
                variant={selectedArea === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedArea(key)}
                className={selectedArea === key 
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white" 
                  : "border-white/20 text-gray-300 hover:bg-white/10"
                }
              >
                {area.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Before/After Preview */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black">
          {beforeImage && (
            <div className="relative w-full h-full">
              {/* Before Image */}
              <img
                src={beforeImage}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* After Image with Clip */}
              {afterImage && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
                >
                  <img
                    src={afterImage}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Comparison Slider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${comparison}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">↔</span>
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                Before
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm">
                After
              </div>
              
              {/* Processing indicator */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>กำลังประมวลผล...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white">เปรียบเทียบ Before/After</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAnimating(!isAnimating)}
                className="border-white/20"
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setComparison(50)}
                className="border-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Slider
            value={[comparison]}
            onValueChange={([v]) => setComparison(v)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Enhancement Controls */}
        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid grid-cols-3 bg-white/5">
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="volume" className="space-y-4 mt-4">
            {selectedArea === 'lips' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-gray-300">Lip Volume</Label>
                    <span className="text-pink-400 font-mono">{enhancements.lips_volume}%</span>
                  </div>
                  <Slider
                    value={[enhancements.lips_volume]}
                    onValueChange={([v]) => setEnhancements(e => ({ ...e, lips_volume: v }))}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-gray-300">Lip Definition</Label>
                    <span className="text-pink-400 font-mono">{enhancements.lips_definition}%</span>
                  </div>
                  <Slider
                    value={[enhancements.lips_definition]}
                    onValueChange={([v]) => setEnhancements(e => ({ ...e, lips_definition: v }))}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </>
            )}
            
            {selectedArea === 'cheeks' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Cheek Volume</Label>
                  <span className="text-pink-400 font-mono">{enhancements.cheeks_volume}%</span>
                </div>
                <Slider
                  value={[enhancements.cheeks_volume]}
                  onValueChange={([v]) => setEnhancements(e => ({ ...e, cheeks_volume: v }))}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            )}
            
            {selectedArea === 'chin' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Chin Projection</Label>
                  <span className="text-pink-400 font-mono">{enhancements.chin_projection}%</span>
                </div>
                <Slider
                  value={[enhancements.chin_projection]}
                  onValueChange={([v]) => setEnhancements(e => ({ ...e, chin_projection: v }))}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            )}
            
            {selectedArea === 'nose' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Nose Bridge Height</Label>
                  <span className="text-pink-400 font-mono">{enhancements.nose_bridge}%</span>
                </div>
                <Slider
                  value={[enhancements.nose_bridge]}
                  onValueChange={([v]) => setEnhancements(e => ({ ...e, nose_bridge: v }))}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="product" className="space-y-4 mt-4">
            <Label className="text-white">เลือกผลิตภัณฑ์ฟิลเลอร์</Label>
            <div className="space-y-2">
              {FILLER_PRODUCTS.map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProduct(product.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedProduct === product.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.brand} • {product.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-600 to-rose-600"
                          style={{ width: `${product.popularity}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{product.popularity}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="info" className="space-y-4 mt-4">
            {selectedAreaInfo && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-medium text-white mb-3">{selectedAreaInfo.name}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">ราคา</p>
                      <p className="text-white font-medium">฿{selectedAreaInfo.priceRange}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">ระยะเวลา</p>
                      <p className="text-white font-medium">{selectedAreaInfo.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">ฟื้นตัว</p>
                      <p className="text-white font-medium">{selectedAreaInfo.recovery}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">ผลลัพธ์</p>
                      <p className="text-white font-medium">{selectedAreaInfo.results}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Estimated Cost */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">ประมาณการใช้ฟิลเลอร์</span>
            <span className="text-white font-bold">{estimatedUnits} ml</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">ราคาประมาณ</span>
            <span className="text-2xl font-bold text-pink-400">฿{estimatedCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => {
              if (afterImage && onExport) {
                fetch(afterImage)
                  .then(res => res.blob())
                  .then(blob => onExport(blob));
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            บันทึกภาพ
          </Button>
          <Button
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white"
            onClick={() => {
              if (onGenerateProposal) {
                onGenerateProposal({
                  area: selectedAreaInfo,
                  product: selectedProductInfo,
                  estimatedCost,
                  estimatedUnits,
                  enhancements,
                  afterImage
                });
              }
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            สร้างใบเสนอราคา
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default FillerLipSimulator;
