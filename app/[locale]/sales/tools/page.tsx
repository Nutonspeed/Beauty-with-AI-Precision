'use client';

/**
 * Sales Tools Hub - รวมทุกเครื่องมือ AI สำหรับทีมขาย
 * Competitive features: AI Recommendations, Quote Calculator, Conversion Optimizer
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Calculator, 
  Target, 
  ArrowLeft,
  Brain,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';

// Import new AI components
import { AISmartRecommendations } from '@/components/sales/ai-smart-recommendations';
import { QuickQuoteCalculator } from '@/components/sales/quick-quote-calculator';
import { LeadConversionOptimizer } from '@/components/sales/lead-conversion-optimizer';

// Sample lead data for demo
const SAMPLE_LEAD = {
  id: 'lead_001',
  name: 'คุณสมหญิง',
  source: 'Facebook Ads',
  lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  engagementScore: 65,
  visitCount: 3,
  treatmentInterest: ['Botox', 'Filler'],
  budget: 'medium' as const,
  urgency: 'medium' as const,
  objections: ['price']
};

// Sample customer profile
const SAMPLE_PROFILE = {
  age: 35,
  gender: 'female' as const,
  skinType: 'combination' as const,
  concerns: ['wrinkles', 'pigmentation'],
  budget: 'medium' as const,
  previousTreatments: ['HydraFacial']
};

export default function SalesToolsPage() {
  const [activeTab, setActiveTab] = useState('recommendations');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sales/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  AI Sales Tools
                </h1>
                <p className="text-sm text-gray-400">เครื่องมือ AI เพิ่มประสิทธิภาพการขาย</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-white/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">+35%</p>
              <p className="text-xs text-gray-400">Conversion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">฿2.4M</p>
              <p className="text-xs text-gray-400">Revenue This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">89</p>
              <p className="text-xs text-gray-400">Active Leads</p>
            </div>
            <div className="text-center hidden md:block">
              <p className="text-2xl font-bold text-blue-400">4.8</p>
              <p className="text-xs text-gray-400">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 bg-white/5 p-1 rounded-xl">
            <TabsTrigger 
              value="recommendations" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">AI Recommendations</span>
              <span className="sm:hidden">Recommend</span>
            </TabsTrigger>
            <TabsTrigger 
              value="quote"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Quick Quote</span>
              <span className="sm:hidden">Quote</span>
            </TabsTrigger>
            <TabsTrigger 
              value="optimizer"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 rounded-lg"
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Conversion Optimizer</span>
              <span className="sm:hidden">Optimizer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Profile Input */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Customer Profile
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age</span>
                      <span className="text-white">{SAMPLE_PROFILE.age} ปี</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Skin Type</span>
                      <span className="text-white capitalize">{SAMPLE_PROFILE.skinType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400 capitalize">{SAMPLE_PROFILE.budget}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-2">Concerns</span>
                      <div className="flex flex-wrap gap-1">
                        {SAMPLE_PROFILE.concerns.map((c, i) => (
                          <Badge key={i} variant="outline" className="border-purple-500/50 text-purple-300 text-xs capitalize">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
              
              {/* AI Recommendations */}
              <div className="lg:col-span-2">
                <AISmartRecommendations 
                  customerProfile={SAMPLE_PROFILE}
                  onSelectTreatment={(treatment) => {
                    console.log('Selected:', treatment);
                    setActiveTab('quote');
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quote" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickQuoteCalculator 
                onSendQuote={(quote) => {
                  console.log('Quote sent:', quote);
                  alert(`ส่งใบเสนอราคา ฿${quote.total.toLocaleString()} สำเร็จ!`);
                }}
              />
              
              {/* Quick Tips */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Tips เพิ่มยอดขาย
                  </h3>
                  
                  <div className="space-y-3">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                    >
                      <p className="text-sm text-green-400 font-medium">💡 Bundle Discount</p>
                      <p className="text-xs text-gray-400 mt-1">เสนอ package 3 treatment ลด 20% - เพิ่ม conversion 35%</p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                    >
                      <p className="text-sm text-yellow-400 font-medium">⏰ Urgency Works</p>
                      <p className="text-xs text-gray-400 mt-1">โปรหมดเขตวันนี้ เพิ่ม conversion 28%</p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                    >
                      <p className="text-sm text-blue-400 font-medium">💳 ผ่อน 0%</p>
                      <p className="text-xs text-gray-400 mt-1">เสนอผ่อนชำระ - ลด objection เรื่องราคา 45%</p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                    >
                      <p className="text-sm text-purple-400 font-medium">🎁 Free Consultation</p>
                      <p className="text-xs text-gray-400 mt-1">ปรึกษาฟรี + Before/After preview เพิ่ม trust 52%</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadConversionOptimizer 
                lead={SAMPLE_LEAD}
                onActionTaken={(action) => {
                  console.log('Action taken:', action);
                }}
              />
              
              {/* Lead Queue */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Hot Leads Queue
                  </h3>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'คุณสมหญิง', score: 78, interest: 'Botox, Filler', status: 'hot' },
                      { name: 'คุณนภา', score: 65, interest: 'HIFU', status: 'warm' },
                      { name: 'คุณวิภา', score: 52, interest: 'Laser', status: 'warm' },
                      { name: 'คุณพิมพ์', score: 45, interest: 'HydraFacial', status: 'cold' },
                    ].map((lead, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            lead.status === 'hot' ? 'bg-red-500/20' :
                            lead.status === 'warm' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                          }`}>
                            <span className={`text-lg font-bold ${
                              lead.status === 'hot' ? 'text-red-400' :
                              lead.status === 'warm' ? 'text-yellow-400' : 'text-blue-400'
                            }`}>
                              {lead.score}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{lead.name}</p>
                            <p className="text-xs text-gray-400">{lead.interest}</p>
                          </div>
                        </div>
                        <Badge className={
                          lead.status === 'hot' ? 'bg-red-500' :
                          lead.status === 'warm' ? 'bg-yellow-500 text-black' : 'bg-blue-500'
                        }>
                          {lead.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full border-white/20 text-white">
                    View All Leads
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
