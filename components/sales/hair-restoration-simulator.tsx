'use client';

/**
 * Hair Restoration & Density Simulator
 * AR tool for visualizing hair transplant and treatment results
 * สำหรับคลินิกปลูกผม/รักษาผมร่วง
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Download, Scissors } from 'lucide-react';

const HAIR_ZONES = {
  frontal: { id: 'frontal', name: 'หน้าผาก (Frontal)', grafts: '800-1500', price: '60,000-120,000' },
  crown: { id: 'crown', name: 'กระหม่อม (Crown)', grafts: '600-1200', price: '50,000-100,000' },
  temples: { id: 'temples', name: 'ขมับ (Temples)', grafts: '400-800', price: '35,000-70,000' },
  midscalp: { id: 'midscalp', name: 'กลางศีรษะ (Mid-Scalp)', grafts: '500-1000', price: '45,000-90,000' },
  beard: { id: 'beard', name: 'หนวดเครา (Beard)', grafts: '300-600', price: '30,000-60,000' },
  eyebrows: { id: 'eyebrows', name: 'คิ้ว (Eyebrows)', grafts: '100-300', price: '25,000-50,000' }
};

const TREATMENTS = [
  { id: 'fue', name: 'FUE Transplant', description: 'Follicular Unit Extraction', effectiveness: 95, pricePerGraft: 80 },
  { id: 'dhi', name: 'DHI Transplant', description: 'Direct Hair Implantation', effectiveness: 92, pricePerGraft: 100 },
  { id: 'prp', name: 'PRP Therapy', description: 'Platelet Rich Plasma', effectiveness: 70, pricePerSession: 8000 },
  { id: 'mesotherapy', name: 'Hair Mesotherapy', description: 'Growth Factor Injection', effectiveness: 65, pricePerSession: 5000 },
  { id: 'laser', name: 'LLLT Laser', description: 'Low Level Laser Therapy', effectiveness: 55, pricePerSession: 3000 },
];

interface HairRestorationProps {
  beforeImage: string;
  onExport?: (imageData: Blob) => void;
  onGenerateProposal?: (treatment: any) => void;
  className?: string;
}

export function HairRestorationSimulator({ beforeImage, onExport, onGenerateProposal, className = '' }: HairRestorationProps) {
  const [selectedZone, setSelectedZone] = useState('frontal');
  const [selectedTreatment, setSelectedTreatment] = useState('fue');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparison, setComparison] = useState(50);
  const [afterImage, setAfterImage] = useState('');
  
  const [settings, setSettings] = useState({
    density: 40,
    hairline_advancement: 20,
    coverage: 30
  });
  
  const [estimatedGrafts, setEstimatedGrafts] = useState(1000);
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const treatment = TREATMENTS.find(t => t.id === selectedTreatment);
    if (!treatment) return;
    
    const grafts = Math.round((settings.density + settings.coverage) * 15);
    setEstimatedGrafts(grafts);
    
    if (treatment.pricePerGraft) {
      setEstimatedCost(grafts * treatment.pricePerGraft);
    } else if (treatment.pricePerSession) {
      const sessions = Math.ceil(settings.density / 20);
      setEstimatedCost(sessions * treatment.pricePerSession);
    }
  }, [selectedTreatment, settings]);

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

      // Get image data for hair simulation
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simulate hair density in forehead region
      const hairlineY = canvas.height * 0.15;
      const hairRegionHeight = canvas.height * 0.35;
      const densityFactor = settings.density / 100;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          // Check if in hair region
          if (y > hairlineY && y < hairlineY + hairRegionHeight) {
            const distFromHairline = (y - hairlineY) / hairRegionHeight;
            const idx = (y * canvas.width + x) * 4;
            
            // Darken area to simulate hair (simplified effect)
            if (Math.random() < densityFactor * (1 - distFromHairline * 0.5)) {
              const darkenAmount = 30 * densityFactor;
              data[idx] = Math.max(0, data[idx] - darkenAmount);
              data[idx + 1] = Math.max(0, data[idx + 1] - darkenAmount);
              data[idx + 2] = Math.max(0, data[idx + 2] - darkenAmount);
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Add subtle texture
      ctx.globalAlpha = 0.05;
      ctx.filter = 'blur(1px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = 'none';
      
      setAfterImage(canvas.toDataURL('image/jpeg', 0.92));
      setIsProcessing(false);
    };
    img.src = beforeImage;
  }, [beforeImage, settings]);

  useEffect(() => { generateEnhancedImage(); }, [generateEnhancedImage]);

  const selectedZoneInfo = HAIR_ZONES[selectedZone as keyof typeof HAIR_ZONES];
  const selectedTreatmentInfo = TREATMENTS.find(t => t.id === selectedTreatment);

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Hair Restoration Simulator</CardTitle>
              <p className="text-sm text-gray-400">จำลองผลลัพธ์การปลูกผม/รักษาผมร่วง</p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">AI Powered</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Zone Selection */}
        <div className="space-y-3">
          <Label className="text-white">เลือกบริเวณ</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(HAIR_ZONES).map(([key, zone]) => (
              <Button
                key={key}
                variant={selectedZone === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedZone(key)}
                className={selectedZone === key 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" 
                  : "border-white/20 text-gray-300"
                }
              >
                {zone.name.split(' ')[0]}
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
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm">After</div>
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
        <Tabs defaultValue="density" className="w-full">
          <TabsList className="grid grid-cols-2 bg-white/5">
            <TabsTrigger value="density">Density</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="density" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">Hair Density</Label>
                <span className="text-emerald-400 font-mono">{settings.density}%</span>
              </div>
              <Slider value={[settings.density]} onValueChange={([v]) => setSettings(s => ({ ...s, density: v }))} min={0} max={100} step={5} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">Hairline Advancement</Label>
                <span className="text-emerald-400 font-mono">{settings.hairline_advancement}%</span>
              </div>
              <Slider value={[settings.hairline_advancement]} onValueChange={([v]) => setSettings(s => ({ ...s, hairline_advancement: v }))} min={0} max={50} step={5} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">Coverage Area</Label>
                <span className="text-emerald-400 font-mono">{settings.coverage}%</span>
              </div>
              <Slider value={[settings.coverage]} onValueChange={([v]) => setSettings(s => ({ ...s, coverage: v }))} min={0} max={100} step={5} />
            </div>
          </TabsContent>
          
          <TabsContent value="treatment" className="space-y-3 mt-4">
            {TREATMENTS.map(treatment => (
              <motion.div
                key={treatment.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedTreatment(treatment.id)}
                className={`p-3 rounded-xl border cursor-pointer ${
                  selectedTreatment === treatment.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{treatment.name}</p>
                    <p className="text-sm text-gray-400">{treatment.description}</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">{treatment.effectiveness}%</Badge>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Estimate */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Grafts ที่ต้องการ</span>
            <span className="text-white font-bold">{estimatedGrafts.toLocaleString()} grafts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">ราคาประมาณ</span>
            <span className="text-2xl font-bold text-emerald-400">฿{estimatedCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="border-white/20 text-white" onClick={() => afterImage && onExport && fetch(afterImage).then(r => r.blob()).then(onExport)}>
            <Download className="w-4 h-4 mr-2" />บันทึกภาพ
          </Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white" onClick={() => onGenerateProposal && onGenerateProposal({ zone: selectedZoneInfo, treatment: selectedTreatmentInfo, estimatedGrafts, estimatedCost, settings, afterImage })}>
            <Sparkles className="w-4 h-4 mr-2" />สร้างใบเสนอราคา
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default HairRestorationSimulator;
