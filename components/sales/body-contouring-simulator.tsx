'use client';

/**
 * Body Contouring & Slimming Simulator
 * AR tool for visualizing body sculpting and fat reduction results
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Download, Flame } from 'lucide-react';

const BODY_AREAS = {
  abdomen: { id: 'abdomen', name: 'หน้าท้อง', priceRange: '15,000 - 80,000', sessions: '1-3 ครั้ง' },
  waist: { id: 'waist', name: 'เอว', priceRange: '12,000 - 60,000', sessions: '2-4 ครั้ง' },
  thighs: { id: 'thighs', name: 'ต้นขา', priceRange: '18,000 - 70,000', sessions: '2-4 ครั้ง' },
  arms: { id: 'arms', name: 'แขน', priceRange: '10,000 - 45,000', sessions: '1-3 ครั้ง' },
  chin: { id: 'chin', name: 'คาง', priceRange: '15,000 - 50,000', sessions: '1-2 ครั้ง' },
  back: { id: 'back', name: 'หลัง', priceRange: '15,000 - 65,000', sessions: '1-3 ครั้ง' }
};

const TECHNOLOGIES = [
  { id: 'coolsculpting', name: 'CoolSculpting Elite', effectiveness: 95, multiplier: 1.5 },
  { id: 'hifu_body', name: 'HIFU Body', effectiveness: 85, multiplier: 1.2 },
  { id: 'rf_body', name: 'RF Body', effectiveness: 80, multiplier: 1.0 },
  { id: 'ems', name: 'EMS Sculpting', effectiveness: 75, multiplier: 0.9 },
];

interface BodyContouringProps {
  beforeImage: string;
  onExport?: (imageData: Blob) => void;
  onGenerateProposal?: (treatment: any) => void;
  className?: string;
}

export function BodyContouringSimulator({ beforeImage, onExport, onGenerateProposal, className = '' }: BodyContouringProps) {
  const [selectedArea, setSelectedArea] = useState('abdomen');
  const [selectedTech, setSelectedTech] = useState('coolsculpting');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparison, setComparison] = useState(50);
  const [afterImage, setAfterImage] = useState('');
  
  const [reductions, setReductions] = useState({
    fat_reduction: 25,
    skin_tightening: 20,
    muscle_tone: 15
  });
  
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const tech = TECHNOLOGIES.find(t => t.id === selectedTech);
    if (!tech) return;
    const sessions = Math.ceil(reductions.fat_reduction / 30) + 1;
    setEstimatedCost(Math.round(25000 * tech.multiplier * sessions));
  }, [selectedTech, reductions]);

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
      
      const slimFactor = 1 - (reductions.fat_reduction / 400);
      ctx.save();
      ctx.translate(canvas.width / 2, 0);
      ctx.scale(slimFactor, 1);
      ctx.translate(-canvas.width / 2, 0);
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      // Skin smoothing effect
      ctx.globalAlpha = 0.1;
      ctx.filter = 'blur(3px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = 'none';
      
      setAfterImage(canvas.toDataURL('image/jpeg', 0.92));
      setIsProcessing(false);
    };
    img.src = beforeImage;
  }, [beforeImage, reductions]);

  useEffect(() => { generateEnhancedImage(); }, [generateEnhancedImage]);

  const selectedAreaInfo = BODY_AREAS[selectedArea as keyof typeof BODY_AREAS];
  const selectedTechInfo = TECHNOLOGIES.find(t => t.id === selectedTech);

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-600 to-red-600">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Body Contouring Simulator</CardTitle>
              <p className="text-sm text-gray-400">จำลองผลลัพธ์การสลายไขมัน/กระชับสัดส่วน</p>
            </div>
          </div>
          <Badge variant="outline" className="border-orange-500/50 text-orange-400">AI Powered</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Area Selection */}
        <div className="space-y-3">
          <Label className="text-white">เลือกบริเวณ</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(BODY_AREAS).map(([key, area]) => (
              <Button
                key={key}
                variant={selectedArea === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedArea(key)}
                className={selectedArea === key 
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" 
                  : "border-white/20 text-gray-300"
                }
              >
                {area.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Before/After Preview */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black">
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
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm">After</div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison Slider */}
        <Slider value={[comparison]} onValueChange={([v]) => setComparison(v)} min={0} max={100} />

        {/* Technology Selection */}
        <Tabs defaultValue="reduction" className="w-full">
          <TabsList className="grid grid-cols-2 bg-white/5">
            <TabsTrigger value="reduction">Reduction</TabsTrigger>
            <TabsTrigger value="tech">Technology</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reduction" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">Fat Reduction</Label>
                <span className="text-orange-400 font-mono">{reductions.fat_reduction}%</span>
              </div>
              <Slider
                value={[reductions.fat_reduction]}
                onValueChange={([v]) => setReductions(r => ({ ...r, fat_reduction: v }))}
                min={0} max={50} step={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">Skin Tightening</Label>
                <span className="text-orange-400 font-mono">{reductions.skin_tightening}%</span>
              </div>
              <Slider
                value={[reductions.skin_tightening]}
                onValueChange={([v]) => setReductions(r => ({ ...r, skin_tightening: v }))}
                min={0} max={50} step={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">Muscle Tone</Label>
                <span className="text-orange-400 font-mono">{reductions.muscle_tone}%</span>
              </div>
              <Slider
                value={[reductions.muscle_tone]}
                onValueChange={([v]) => setReductions(r => ({ ...r, muscle_tone: v }))}
                min={0} max={50} step={5}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="tech" className="space-y-3 mt-4">
            {TECHNOLOGIES.map(tech => (
              <motion.div
                key={tech.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedTech(tech.id)}
                className={`p-3 rounded-xl border cursor-pointer ${
                  selectedTech === tech.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{tech.name}</p>
                    <p className="text-sm text-gray-400">Effectiveness: {tech.effectiveness}%</p>
                  </div>
                  <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-600 to-red-600" style={{ width: `${tech.effectiveness}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Estimated Cost */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Sessions: {Math.ceil(reductions.fat_reduction / 30) + 1} ครั้ง</span>
            <span className="text-gray-300">{selectedAreaInfo?.priceRange}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">ราคาประมาณ</span>
            <span className="text-2xl font-bold text-orange-400">฿{estimatedCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="border-white/20 text-white" onClick={() => afterImage && onExport && fetch(afterImage).then(r => r.blob()).then(onExport)}>
            <Download className="w-4 h-4 mr-2" />บันทึกภาพ
          </Button>
          <Button className="bg-gradient-to-r from-orange-600 to-red-600 text-white" onClick={() => onGenerateProposal && onGenerateProposal({ area: selectedAreaInfo, tech: selectedTechInfo, estimatedCost, reductions, afterImage })}>
            <Sparkles className="w-4 h-4 mr-2" />สร้างใบเสนอราคา
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BodyContouringSimulator;
