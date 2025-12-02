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
  Zap, 
  Star, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  Award
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
  id?: string;
  treatment: string; // เปลี่ยนจาก name เป็น treatment
  name?: string;
  nameTh?: string;
  category?: string;
  price: number;
  duration?: string;
  confidence: number; // เปลี่ยนจาก matchScore เป็น confidence
  reasoning: string;
  expectedResults: string;
  risks: string;
  alternatives: string[];
  maintenance: string;
}

interface AISmartRecommendationsProps {
  customerProfile?: CustomerProfile;
  skinAnalysisResults?: any;
  onSelectTreatment?: (treatment: Treatment) => void;
  className?: string;
}

// Advanced AI Treatment Recommendations
const recommender = new AdvancedTreatmentRecommender();

// Convert budget string to number
function convertBudgetToNumber(budget: string): number {
  switch (budget) {
    case 'low': return 10000;
    case 'medium': return 25000;
    case 'high': return 50000;
    case 'premium': return 100000;
    default: return 25000;
  }
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

    // Use real AI for recommendations
    const getRecommendations = async () => {
      try {
        const budget = convertBudgetToNumber(customerProfile.budget || 'medium');
        const goals = customerProfile.concerns || [];

        const aiRecommendations = await recommender.recommendTreatments(
          customerProfile,
          skinAnalysisResults || {},
          budget,
          goals
        );

        setRecommendations(aiRecommendations);
      } catch (error) {
        console.error('AI Recommendation failed:', error);
        // Fallback to basic recommendations
        setRecommendations([]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    getRecommendations();
  }, [customerProfile, skinAnalysisResults]);
  
  const categories = ['all'];
  
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
                
                <div className="flex items-center gap-3">
                  {/* Confidence Circle */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{topRecommendation.confidence}</span>
                      <span className="absolute -bottom-1 text-xs text-white bg-black/50 px-1 rounded">%</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{topRecommendation.treatment}</h3>
                    <p className="text-sm text-gray-400 mb-2">{topRecommendation.reasoning}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-green-500/20 text-green-400">
                        ผลลัพธ์: {topRecommendation.expectedResults}
                      </Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        ความเสี่ยง: {topRecommendation.risks}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400 font-bold">฿{topRecommendation.price.toLocaleString()}</span>
                      <span className="text-blue-400">ดูแล: {topRecommendation.maintenance}</span>
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
                      {/* Confidence Circle */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{treatment.confidence}</span>
                        </div>
                        <Progress 
                          value={treatment.confidence} 
                          className="absolute inset-0 w-12 h-12 rounded-full [&>div]:rounded-full" 
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white truncate">{treatment.treatment}</h4>
                          <span className="text-green-400 font-bold text-sm">
                            ฿{treatment.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-white/20 text-gray-400 text-xs">
                            {treatment.reasoning.substring(0, 30)}...
                          </Badge>
                          <span className="text-xs text-gray-500">ผล: {treatment.expectedResults.substring(0, 20)}...</span>
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
