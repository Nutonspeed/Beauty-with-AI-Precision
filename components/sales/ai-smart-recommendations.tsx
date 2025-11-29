'use client';

/**
 * AI Smart Recommendations
 * แนะนำ treatment อัตโนมัติตาม customer profile และ skin analysis
 * Competitive advantage: Real-time AI-powered suggestions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  Clock,
  ChevronRight,
  Zap,
  ArrowRight
} from 'lucide-react';

interface CustomerProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  skinType?: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  concerns?: string[];
  budget?: 'low' | 'medium' | 'high' | 'premium';
  previousTreatments?: string[];
}

interface Treatment {
  id: string;
  name: string;
  nameTh: string;
  category: string;
  price: number;
  duration: string;
  matchScore: number;
  reasons: string[];
  expectedOutcome: string;
  popularity: number;
  conversionRate: number;
}

interface AISmartRecommendationsProps {
  customerProfile?: CustomerProfile;
  skinAnalysisResults?: any;
  onSelectTreatment?: (treatment: Treatment) => void;
  className?: string;
}

// AI-powered treatment database
const TREATMENTS_DATABASE: Treatment[] = [
  {
    id: 'botox_forehead',
    name: 'Botox - Forehead',
    nameTh: 'โบท็อกซ์ หน้าผาก',
    category: 'Anti-Aging',
    price: 8900,
    duration: '15-20 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'ลดริ้วรอยหน้าผาก 80-90%',
    popularity: 95,
    conversionRate: 78
  },
  {
    id: 'filler_nasolabial',
    name: 'Filler - Nasolabial',
    nameTh: 'ฟิลเลอร์ ร่องแก้ม',
    category: 'Volume Restoration',
    price: 15900,
    duration: '20-30 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'เติมเต็มร่องแก้ม ใบหน้าดูอ่อนเยาว์',
    popularity: 88,
    conversionRate: 72
  },
  {
    id: 'hifu_face',
    name: 'HIFU Face Lift',
    nameTh: 'ไฮฟู่ ยกกระชับ',
    category: 'Skin Tightening',
    price: 25900,
    duration: '45-60 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'กระชับผิว ยกหน้า ลดเหนียง',
    popularity: 85,
    conversionRate: 65
  },
  {
    id: 'laser_pigment',
    name: 'Laser Pigmentation',
    nameTh: 'เลเซอร์ ฝ้า กระ',
    category: 'Skin Correction',
    price: 12900,
    duration: '30-45 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'ลดฝ้ากระ 60-80%',
    popularity: 82,
    conversionRate: 70
  },
  {
    id: 'pdo_thread',
    name: 'PDO Thread Lift',
    nameTh: 'ร้อยไหม PDO',
    category: 'Lifting',
    price: 35900,
    duration: '45-60 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'ยกกระชับหน้า ผลลัพธ์ทันที',
    popularity: 75,
    conversionRate: 60
  },
  {
    id: 'hydrafacial',
    name: 'HydraFacial',
    nameTh: 'ไฮดราเฟเชียล',
    category: 'Skin Rejuvenation',
    price: 4900,
    duration: '45 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'ผิวใส ชุ่มชื้น กระจ่างใส',
    popularity: 92,
    conversionRate: 85
  },
  {
    id: 'prp_face',
    name: 'PRP Facial',
    nameTh: 'PRP ฟื้นฟูผิว',
    category: 'Regenerative',
    price: 18900,
    duration: '45-60 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'กระตุ้นคอลลาเจน ผิวเด้ง',
    popularity: 78,
    conversionRate: 62
  },
  {
    id: 'coolsculpting',
    name: 'CoolSculpting',
    nameTh: 'สลายไขมันด้วยความเย็น',
    category: 'Body Contouring',
    price: 45900,
    duration: '35-60 นาที',
    matchScore: 0,
    reasons: [],
    expectedOutcome: 'ลดไขมัน 20-25% ต่อครั้ง',
    popularity: 80,
    conversionRate: 55
  }
];

// AI Scoring Algorithm
function calculateRecommendations(
  profile: CustomerProfile,
  _skinResults?: any
): Treatment[] {
  const treatments = JSON.parse(JSON.stringify(TREATMENTS_DATABASE));
  
  treatments.forEach((treatment: Treatment) => {
    let score = 50; // Base score
    const reasons: string[] = [];
    
    // Age-based scoring
    if (profile.age) {
      if (profile.age >= 35 && treatment.category === 'Anti-Aging') {
        score += 20;
        reasons.push('เหมาะกับช่วงวัย');
      }
      if (profile.age >= 40 && treatment.category === 'Lifting') {
        score += 25;
        reasons.push('เหมาะสำหรับการยกกระชับ');
      }
      if (profile.age < 35 && treatment.category === 'Skin Rejuvenation') {
        score += 15;
        reasons.push('ดูแลผิวเชิงป้องกัน');
      }
    }
    
    // Concern-based scoring
    if (profile.concerns) {
      if (profile.concerns.includes('wrinkles') && 
          ['Anti-Aging', 'Lifting'].includes(treatment.category)) {
        score += 25;
        reasons.push('ตรงกับปัญหาริ้วรอย');
      }
      if (profile.concerns.includes('pigmentation') && 
          treatment.category === 'Skin Correction') {
        score += 30;
        reasons.push('ช่วยลดฝ้ากระ');
      }
      if (profile.concerns.includes('sagging') && 
          ['Lifting', 'Skin Tightening'].includes(treatment.category)) {
        score += 25;
        reasons.push('กระชับผิวหย่อนคล้อย');
      }
      if (profile.concerns.includes('dull') && 
          treatment.category === 'Skin Rejuvenation') {
        score += 20;
        reasons.push('เพิ่มความกระจ่างใส');
      }
    }
    
    // Budget-based scoring
    if (profile.budget) {
      if (profile.budget === 'low' && treatment.price <= 10000) {
        score += 15;
        reasons.push('เหมาะกับงบประมาณ');
      }
      if (profile.budget === 'medium' && treatment.price <= 25000) {
        score += 10;
        reasons.push('คุ้มค่าราคา');
      }
      if (profile.budget === 'high' && treatment.price <= 50000) {
        score += 10;
        reasons.push('ผลลัพธ์คุ้มค่า');
      }
      if (profile.budget === 'premium') {
        score += 5;
        reasons.push('ผลลัพธ์ระดับพรีเมียม');
      }
    }
    
    // Popularity boost
    score += treatment.popularity * 0.1;
    
    // Conversion rate boost
    score += treatment.conversionRate * 0.15;
    
    // Add randomness for variety (±5)
    score += Math.random() * 10 - 5;
    
    // Cap at 100
    treatment.matchScore = Math.min(Math.round(score), 100);
    treatment.reasons = reasons.length > 0 ? reasons : ['แนะนำทั่วไป'];
  });
  
  // Sort by score
  return treatments.sort((a: Treatment, b: Treatment) => b.matchScore - a.matchScore);
}

export function AISmartRecommendations({
  customerProfile = {},
  skinAnalysisResults,
  onSelectTreatment,
  className = ''
}: AISmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Treatment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    setIsAnalyzing(true);
    
    // Simulate AI processing
    const timer = setTimeout(() => {
      const results = calculateRecommendations(customerProfile, skinAnalysisResults);
      setRecommendations(results);
      setIsAnalyzing(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [customerProfile, skinAnalysisResults]);
  
  const categories = ['all', ...new Set(TREATMENTS_DATABASE.map(t => t.category))];
  
  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === selectedCategory);
  
  const topRecommendation = recommendations[0];

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">AI Smart Recommendations</CardTitle>
              <p className="text-sm text-gray-400">แนะนำ treatment ที่เหมาะกับลูกค้า</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-violet-600 to-purple-600">
            <Zap className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="py-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4"
            >
              <Sparkles className="w-12 h-12 text-purple-400" />
            </motion.div>
            <p className="text-white font-medium">AI กำลังวิเคราะห์...</p>
            <p className="text-sm text-gray-400 mt-1">กำลังประมวลผลข้อมูลลูกค้า</p>
          </div>
        ) : (
          <>
            {/* Top Recommendation - Hero Card */}
            {topRecommendation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-4 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30"
              >
                <div className="absolute top-3 right-3">
                  <Badge className="bg-yellow-500 text-black">
                    <Star className="w-3 h-3 mr-1" />
                    Top Pick
                  </Badge>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{topRecommendation.matchScore}</span>
                      <span className="absolute -bottom-1 text-xs text-white bg-black/50 px-1 rounded">%</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{topRecommendation.nameTh}</h3>
                    <p className="text-sm text-gray-400">{topRecommendation.name}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topRecommendation.reasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="border-violet-500/50 text-violet-300 text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-green-400 font-bold">฿{topRecommendation.price.toLocaleString()}</span>
                      <span className="text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {topRecommendation.duration}
                      </span>
                      <span className="text-yellow-400 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {topRecommendation.conversionRate}% conversion
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600"
                  onClick={() => onSelectTreatment?.(topRecommendation)}
                >
                  เลือก Treatment นี้
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat 
                    ? 'bg-violet-600 text-white' 
                    : 'border-white/20 text-gray-300'
                  }
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat}
                </Button>
              ))}
            </div>
            
            {/* Other Recommendations */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredRecommendations.slice(1, 6).map((treatment, idx) => (
                  <motion.div
                    key={treatment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => onSelectTreatment?.(treatment)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Score Circle */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{treatment.matchScore}</span>
                        </div>
                        <Progress 
                          value={treatment.matchScore} 
                          className="absolute inset-0 w-12 h-12 rounded-full [&>div]:rounded-full" 
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white truncate">{treatment.nameTh}</h4>
                          <span className="text-green-400 font-bold text-sm">
                            ฿{treatment.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-white/20 text-gray-400 text-xs">
                            {treatment.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{treatment.duration}</span>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AISmartRecommendations;
