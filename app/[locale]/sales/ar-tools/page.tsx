'use client';

/**
 * AR Tools Hub - เครื่องมือ AR/AI สำหรับ Sales Team
 * ครอบคลุมทุกสาขาคลินิกเสริมความงาม
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Heart, 
  Flame, 
  Scissors, 
  Eye,
  ArrowLeft,
  Camera,
  Upload,
  Scan
} from 'lucide-react';
import Link from 'next/link';

// Import Simulators
import { FillerLipSimulator } from '@/components/sales/filler-lip-simulator';
import { BodyContouringSimulator } from '@/components/sales/body-contouring-simulator';
import { HairRestorationSimulator } from '@/components/sales/hair-restoration-simulator';
import { EyeEnhancementSimulator } from '@/components/sales/eye-enhancement-simulator';

const TOOLS = [
  {
    id: 'skin',
    name: 'Skin Analysis',
    nameTh: 'วิเคราะห์ผิว',
    icon: Scan,
    color: 'from-violet-600 to-purple-600',
    description: 'AI 8-mode skin analysis'
  },
  {
    id: 'filler',
    name: 'Filler & Lips',
    nameTh: 'ฟิลเลอร์และปาก',
    icon: Heart,
    color: 'from-pink-600 to-rose-600',
    description: 'Lip augmentation simulator'
  },
  {
    id: 'body',
    name: 'Body Contouring',
    nameTh: 'กระชับสัดส่วน',
    icon: Flame,
    color: 'from-orange-600 to-red-600',
    description: 'Fat reduction preview'
  },
  {
    id: 'hair',
    name: 'Hair Restoration',
    nameTh: 'ปลูกผม',
    icon: Scissors,
    color: 'from-emerald-600 to-teal-600',
    description: 'Hair transplant preview'
  },
  {
    id: 'eye',
    name: 'Eye Enhancement',
    nameTh: 'ทำตา',
    icon: Eye,
    color: 'from-blue-600 to-indigo-600',
    description: 'Double eyelid simulator'
  },
];

export default function ARToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string>('filler');
  const [customerImage, setCustomerImage] = useState<string>('');
  const [showUpload, setShowUpload] = useState(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomerImage(event.target?.result as string);
        setShowUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-preview-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateProposal = (data: any) => {
    console.log('Generate Proposal:', data);
    // TODO: Integrate with proposal generator
    alert('กำลังสร้างใบเสนอราคา...');
  };

  const selectedToolInfo = TOOLS.find(t => t.id === selectedTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20 lg:pb-6">
      {/* Header - Mobile optimized */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/sales/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9 md:h-10 md:w-10">
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  <span className="hidden sm:inline">AR Sales Tools</span>
                  <span className="sm:hidden">AR Tools</span>
                </h1>
                <p className="text-xs md:text-sm text-gray-400 hidden sm:block">เครื่องมือจำลองผลลัพธ์สำหรับทีมขาย</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-xs md:text-sm">
              AI
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile Tool Selector - Horizontal scroll */}
      <div className="lg:hidden sticky top-[57px] z-40 bg-black/60 backdrop-blur-lg border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto px-3 py-3 snap-x snap-mandatory">
          {TOOLS.map((tool) => (
            <motion.button
              key={tool.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTool(tool.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 snap-start transition-all ${
                selectedTool === tool.id
                  ? `bg-gradient-to-r ${tool.color} text-white`
                  : 'bg-white/10 text-gray-300'
              }`}
            >
              <tool.icon className="w-4 h-4" />
              <span className="text-sm font-medium whitespace-nowrap">{tool.nameTh}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Tool Selector Sidebar - Desktop only */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Select Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TOOLS.map((tool) => (
                  <motion.button
                    key={tool.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      selectedTool === tool.id
                        ? `bg-gradient-to-r ${tool.color} text-white`
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <tool.icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{tool.nameTh}</p>
                      <p className="text-xs opacity-70">{tool.name}</p>
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>

            {/* Image Upload - Desktop only */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Customer Photo</CardTitle>
              </CardHeader>
              <CardContent>
                {customerImage ? (
                  <div className="space-y-3">
                    <img 
                      src={customerImage} 
                      alt="Customer" 
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-white/20 text-white"
                      onClick={() => {
                        setCustomerImage('');
                        setShowUpload(true);
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/50 active:bg-white/5 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Upload photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Simulator Area */}
          <div className="lg:col-span-3 col-span-1">
            {!customerImage ? (
              <Card className="bg-white/5 border-white/10 h-full min-h-[400px] md:min-h-[600px] flex items-center justify-center">
                <CardContent className="text-center px-4">
                  <Camera className="w-12 h-12 md:w-16 md:h-16 text-gray-500 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                    Upload Customer Photo
                  </h3>
                  <p className="text-sm md:text-base text-gray-400 mb-4">
                    อัปโหลดรูปภาพลูกค้าเพื่อจำลองผลลัพธ์
                  </p>
                  <label>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Select Photo
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </CardContent>
              </Card>
            ) : (
              <>
                {selectedTool === 'filler' && (
                  <FillerLipSimulator
                    beforeImage={customerImage}
                    onExport={handleExport}
                    onGenerateProposal={handleGenerateProposal}
                  />
                )}
                
                {selectedTool === 'body' && (
                  <BodyContouringSimulator
                    beforeImage={customerImage}
                    onExport={handleExport}
                    onGenerateProposal={handleGenerateProposal}
                  />
                )}
                
                {selectedTool === 'hair' && (
                  <HairRestorationSimulator
                    beforeImage={customerImage}
                    onExport={handleExport}
                    onGenerateProposal={handleGenerateProposal}
                  />
                )}
                
                {selectedTool === 'eye' && (
                  <EyeEnhancementSimulator
                    beforeImage={customerImage}
                    onExport={handleExport}
                    onGenerateProposal={handleGenerateProposal}
                  />
                )}
                
                {selectedTool === 'skin' && (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-8 text-center">
                      <Scan className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        AI Skin Analysis
                      </h3>
                      <p className="text-gray-400 mb-6">
                        ใช้ระบบวิเคราะห์ผิว AI แบบเต็มรูปแบบ
                      </p>
                      <Link href="/analysis">
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Go to Skin Analysis
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-3 z-50">
        <div className="flex items-center gap-3">
          {customerImage ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 border-white/20 text-white h-11"
                onClick={() => {
                  setCustomerImage('');
                  setShowUpload(true);
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Change
              </Button>
              <Button 
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 h-11"
                onClick={() => handleGenerateProposal({ tool: selectedTool, image: customerImage })}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Proposal
              </Button>
            </>
          ) : (
            <label className="flex-1">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-12"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Photo
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
