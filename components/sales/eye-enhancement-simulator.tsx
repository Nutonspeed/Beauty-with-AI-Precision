'use client';

/**
 * Eye Enhancement Simulator
 * AR tool for visualizing eye procedures (double eyelid, eye bag removal, brow lift)
 * สำหรับคลินิกทำตาสองชั้น/ลดถุงใต้ตา
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Download, Eye } from 'lucide-react';

const EYE_PROCEDURES = {
  double_eyelid: { 
    id: 'double_eyelid', 
    name: 'ตาสองชั้น (Double Eyelid)', 
    types: ['Incisional', 'Non-incisional', 'Partial Incision'],
    priceRange: '25,000 - 80,000',
    recovery: '7-14 วัน',
    results: 'ถาวร'
  },
  eye_bag: { 
    id: 'eye_bag', 
    name: 'ถุงใต้ตา (Eye Bag Removal)', 
    types: ['Lower Blepharoplasty', 'Transconjunctival', 'Fat Repositioning'],
    priceRange: '35,000 - 90,000',
    recovery: '7-14 วัน',
    results: '5-10 ปี'
  },
  ptosis: { 
    id: 'ptosis', 
    name: 'หนังตาตก (Ptosis Correction)', 
    types: ['Levator Advancement', 'Frontalis Sling'],
    priceRange: '45,000 - 120,000',
    recovery: '14-21 วัน',
    results: 'ถาวร'
  },
  epicanthoplasty: { 
    id: 'epicanthoplasty', 
    name: 'หัวตา (Epicanthoplasty)', 
    types: ['Medial', 'Lateral'],
    priceRange: '20,000 - 50,000',
    recovery: '7-14 วัน',
    results: 'ถาวร'
  },
  brow_lift: { 
    id: 'brow_lift', 
    name: 'ยกคิ้ว (Brow Lift)', 
    types: ['Endoscopic', 'Thread Lift', 'Temporal'],
    priceRange: '30,000 - 100,000',
    recovery: '7-14 วัน',
    results: '3-10 ปี'
  },
  dark_circles: { 
    id: 'dark_circles', 
    name: 'รอยคล้ำใต้ตา (Dark Circles)', 
    types: ['Filler', 'PRP', 'Laser'],
    priceRange: '8,000 - 35,000',
    recovery: '1-3 วัน',
    results: '6-18 เดือน'
  }
};

const EYELID_STYLES = [
  { id: 'natural', name: 'Natural', description: 'ตาสองชั้นธรรมชาติ', creaseMm: 6 },
  { id: 'in_fold', name: 'In-Fold', description: 'ชั้นตาอยู่ในร่อง', creaseMm: 5 },
  { id: 'out_fold', name: 'Out-Fold', description: 'ชั้นตาชัดเจน', creaseMm: 8 },
  { id: 'parallel', name: 'Parallel', description: 'ขนานกับขอบตา', creaseMm: 7 },
  { id: 'tapered', name: 'Tapered', description: 'แคบหัวกว้างหาง', creaseMm: 7 },
];

interface EyeEnhancementProps {
  beforeImage: string;
  onExport?: (imageData: Blob) => void;
  onGenerateProposal?: (treatment: any) => void;
  className?: string;
}

export function EyeEnhancementSimulator({ beforeImage, onExport, onGenerateProposal, className = '' }: EyeEnhancementProps) {
  const [selectedProcedure, setSelectedProcedure] = useState('double_eyelid');
  const [selectedStyle, setSelectedStyle] = useState('natural');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparison, setComparison] = useState(50);
  const [afterImage, setAfterImage] = useState('');
  
  const [settings, setSettings] = useState({
    crease_height: 30,
    eye_opening: 20,
    eye_bag_reduction: 40,
    brow_lift: 15,
    dark_circle_reduction: 35
  });
  
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const procedure = EYE_PROCEDURES[selectedProcedure as keyof typeof EYE_PROCEDURES];
    if (!procedure) return;
    
    // Parse price range and calculate based on settings
    const priceMatch = procedure.priceRange.match(/(\d+),(\d+)/g);
    if (priceMatch && priceMatch.length >= 2) {
      const minPrice = parseInt(priceMatch[0].replace(',', ''));
      const maxPrice = parseInt(priceMatch[1].replace(',', ''));
      const intensity = Object.values(settings).reduce((a, b) => a + b, 0) / 500;
      setEstimatedCost(Math.round(minPrice + (maxPrice - minPrice) * intensity));
    }
  }, [selectedProcedure, settings]);

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

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const centerX = canvas.width / 2;
      const eyeY = canvas.height * 0.35;
      const eyeWidth = canvas.width * 0.12;
      const eyeHeight = canvas.height * 0.05;
      
      // Left eye position
      const leftEyeX = centerX - canvas.width * 0.12;
      // Right eye position
      const rightEyeX = centerX + canvas.width * 0.12;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          // Check if in eye region (simplified detection)
          const leftDist = Math.sqrt(Math.pow((x - leftEyeX) / eyeWidth, 2) + Math.pow((y - eyeY) / eyeHeight, 2));
          const rightDist = Math.sqrt(Math.pow((x - rightEyeX) / eyeWidth, 2) + Math.pow((y - eyeY) / eyeHeight, 2));
          
          const isInEyeRegion = leftDist < 2 || rightDist < 2;
          
          if (isInEyeRegion) {
            // Double eyelid effect - add shadow above eye crease
            if (selectedProcedure === 'double_eyelid' && y < eyeY) {
              const creaseIntensity = (settings.crease_height / 100) * 0.3;
              if (leftDist < 1.5 || rightDist < 1.5) {
                data[idx] = Math.max(0, data[idx] - 20 * creaseIntensity);
                data[idx + 1] = Math.max(0, data[idx + 1] - 20 * creaseIntensity);
                data[idx + 2] = Math.max(0, data[idx + 2] - 20 * creaseIntensity);
              }
            }
            
            // Eye bag reduction - brighten under eye area
            if (selectedProcedure === 'eye_bag' && y > eyeY) {
              const bagReduction = (settings.eye_bag_reduction / 100) * 0.4;
              if (leftDist < 1.8 || rightDist < 1.8) {
                data[idx] = Math.min(255, data[idx] + 15 * bagReduction);
                data[idx + 1] = Math.min(255, data[idx + 1] + 12 * bagReduction);
                data[idx + 2] = Math.min(255, data[idx + 2] + 10 * bagReduction);
              }
            }
            
            // Dark circle reduction
            if (selectedProcedure === 'dark_circles' && y > eyeY) {
              const reduction = (settings.dark_circle_reduction / 100) * 0.5;
              if (leftDist < 1.5 || rightDist < 1.5) {
                // Reduce blue/purple tones
                data[idx] = Math.min(255, data[idx] + 20 * reduction);
                data[idx + 1] = Math.min(255, data[idx + 1] + 15 * reduction);
                data[idx + 2] = Math.max(0, data[idx + 2] - 10 * reduction);
              }
            }
          }
          
          // Brow lift effect
          if (selectedProcedure === 'brow_lift') {
            const browY = eyeY - canvas.height * 0.08;
            const browDist = Math.abs(y - browY);
            if (browDist < canvas.height * 0.03 && (Math.abs(x - leftEyeX) < eyeWidth * 1.5 || Math.abs(x - rightEyeX) < eyeWidth * 1.5)) {
              // Slight brightening for lifted brow
              const liftIntensity = (settings.brow_lift / 100) * 0.2;
              data[idx] = Math.min(255, data[idx] + 10 * liftIntensity);
              data[idx + 1] = Math.min(255, data[idx + 1] + 10 * liftIntensity);
              data[idx + 2] = Math.min(255, data[idx + 2] + 10 * liftIntensity);
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Add subtle smoothing
      ctx.globalAlpha = 0.08;
      ctx.filter = 'blur(2px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = 'none';
      
      setAfterImage(canvas.toDataURL('image/jpeg', 0.92));
      setIsProcessing(false);
    };
    img.src = beforeImage;
  }, [beforeImage, selectedProcedure, settings]);

  useEffect(() => { generateEnhancedImage(); }, [generateEnhancedImage]);

  const selectedProcedureInfo = EYE_PROCEDURES[selectedProcedure as keyof typeof EYE_PROCEDURES];
  const selectedStyleInfo = EYELID_STYLES.find(s => s.id === selectedStyle);

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Eye Enhancement Simulator</CardTitle>
              <p className="text-sm text-gray-400">จำลองผลลัพธ์การทำตา/ศัลยกรรมรอบดวงตา</p>
            </div>
          </div>
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">AI Powered</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Procedure Selection */}
        <div className="space-y-3">
          <Label className="text-white">เลือกการรักษา</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(EYE_PROCEDURES).map(([key, proc]) => (
              <Button
                key={key}
                variant={selectedProcedure === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProcedure(key)}
                className={selectedProcedure === key 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs" 
                  : "border-white/20 text-gray-300 text-xs"
                }
              >
                {proc.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black">
          {beforeImage && (
            <div className="relative w-full h-full">
              <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
              {afterImage && (
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}>
                  <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="absolute top-0 bottom-0 w-1 bg-white" style={{ left: `${comparison}%` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">↔</span>
                </div>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">Before</div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm">After</div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
            </div>
          )}
        </div>

        <Slider value={[comparison]} onValueChange={([v]) => setComparison(v)} min={0} max={100} />

        {/* Settings */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid grid-cols-2 bg-white/5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            {selectedProcedure === 'double_eyelid' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-gray-300">Crease Height</Label>
                    <span className="text-blue-400 font-mono">{settings.crease_height}%</span>
                  </div>
                  <Slider value={[settings.crease_height]} onValueChange={([v]) => setSettings(s => ({ ...s, crease_height: v }))} min={0} max={100} step={5} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-gray-300">Eye Opening</Label>
                    <span className="text-blue-400 font-mono">{settings.eye_opening}%</span>
                  </div>
                  <Slider value={[settings.eye_opening]} onValueChange={([v]) => setSettings(s => ({ ...s, eye_opening: v }))} min={0} max={50} step={5} />
                </div>
              </>
            )}
            
            {selectedProcedure === 'eye_bag' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Eye Bag Reduction</Label>
                  <span className="text-blue-400 font-mono">{settings.eye_bag_reduction}%</span>
                </div>
                <Slider value={[settings.eye_bag_reduction]} onValueChange={([v]) => setSettings(s => ({ ...s, eye_bag_reduction: v }))} min={0} max={100} step={5} />
              </div>
            )}
            
            {selectedProcedure === 'brow_lift' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Brow Lift Height</Label>
                  <span className="text-blue-400 font-mono">{settings.brow_lift}%</span>
                </div>
                <Slider value={[settings.brow_lift]} onValueChange={([v]) => setSettings(s => ({ ...s, brow_lift: v }))} min={0} max={50} step={5} />
              </div>
            )}
            
            {selectedProcedure === 'dark_circles' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Dark Circle Reduction</Label>
                  <span className="text-blue-400 font-mono">{settings.dark_circle_reduction}%</span>
                </div>
                <Slider value={[settings.dark_circle_reduction]} onValueChange={([v]) => setSettings(s => ({ ...s, dark_circle_reduction: v }))} min={0} max={100} step={5} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="style" className="space-y-3 mt-4">
            {selectedProcedure === 'double_eyelid' && EYELID_STYLES.map(style => (
              <motion.div
                key={style.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-xl border cursor-pointer ${
                  selectedStyle === style.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{style.name}</p>
                    <p className="text-sm text-gray-400">{style.description}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">{style.creaseMm}mm</Badge>
                </div>
              </motion.div>
            ))}
            
            {selectedProcedure !== 'double_eyelid' && selectedProcedureInfo && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-3">{selectedProcedureInfo.name}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">ราคา</p>
                    <p className="text-white">฿{selectedProcedureInfo.priceRange}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">ฟื้นตัว</p>
                    <p className="text-white">{selectedProcedureInfo.recovery}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">ผลลัพธ์</p>
                    <p className="text-white">{selectedProcedureInfo.results}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">วิธีการ</p>
                    <p className="text-white text-xs">{selectedProcedureInfo.types.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Estimate */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">{selectedProcedureInfo?.name}</span>
            <span className="text-white">{selectedProcedureInfo?.recovery}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">ราคาประมาณ</span>
            <span className="text-2xl font-bold text-blue-400">฿{estimatedCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="border-white/20 text-white" onClick={() => afterImage && onExport && fetch(afterImage).then(r => r.blob()).then(onExport)}>
            <Download className="w-4 h-4 mr-2" />บันทึกภาพ
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={() => onGenerateProposal && onGenerateProposal({ procedure: selectedProcedureInfo, style: selectedStyleInfo, estimatedCost, settings, afterImage })}>
            <Sparkles className="w-4 h-4 mr-2" />สร้างใบเสนอราคา
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EyeEnhancementSimulator;
