'use client';

/**
 * Social Proof Widget - แสดงรีวิวและ testimonials
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Users } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  treatment: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

interface SocialProofProps {
  className?: string;
  autoRotate?: boolean;
}

const REVIEWS: Review[] = [
  { id: '1', name: 'คุณแพร', treatment: 'Botox', rating: 5, text: 'ผลลัพธ์ดีมากค่ะ หน้าเด็กลง 5 ปี!', date: '2 วันก่อน', verified: true },
  { id: '2', name: 'คุณนิด', treatment: 'Filler', rating: 5, text: 'แพทย์เก่งมาก ไม่เจ็บเลยค่ะ', date: '3 วันก่อน', verified: true },
  { id: '3', name: 'คุณเอม', treatment: 'HIFU', rating: 5, text: 'หน้าเรียวขึ้นชัดเจน แนะนำเลยค่ะ', date: '1 สัปดาห์ก่อน', verified: true },
  { id: '4', name: 'คุณปอ', treatment: 'Laser', rating: 4, text: 'ฝ้าจางลงมาก คุ้มค่ามากค่ะ', date: '1 สัปดาห์ก่อน', verified: true },
];

const STATS = {
  totalCustomers: 15420,
  averageRating: 4.9,
  totalReviews: 2847,
  repeatRate: 78
};

export function SocialProofWidget({ className = '', autoRotate = true }: SocialProofProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentAction, setRecentAction] = useState<string | null>(null);

  // Auto rotate reviews
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Show random recent action
  useEffect(() => {
    const actions = [
      'คุณสมศรี จองนัด Botox เมื่อ 2 นาทีที่แล้ว',
      'คุณวิภา ซื้อ Package HIFU เมื่อ 5 นาทีที่แล้ว',
      'คุณนภา ปรึกษาเรื่อง Filler เมื่อ 8 นาทีที่แล้ว',
    ];
    
    const showAction = () => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      setRecentAction(action);
      setTimeout(() => setRecentAction(null), 4000);
    };
    
    const interval = setInterval(showAction, 15000);
    showAction();
    return () => clearInterval(interval);
  }, []);

  const currentReview = REVIEWS[currentIndex];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-lg font-bold text-white">{STATS.totalCustomers.toLocaleString()}</p>
          <p className="text-xs text-gray-400">ลูกค้า</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-lg font-bold text-yellow-400 flex items-center justify-center">
            <Star className="w-4 h-4 mr-1 fill-yellow-400" />{STATS.averageRating}
          </p>
          <p className="text-xs text-gray-400">Rating</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-lg font-bold text-white">{STATS.totalReviews.toLocaleString()}</p>
          <p className="text-xs text-gray-400">รีวิว</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-lg font-bold text-green-400">{STATS.repeatRate}%</p>
          <p className="text-xs text-gray-400">กลับมาซ้ำ</p>
        </div>
      </div>

      {/* Review Card */}
      <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Quote className="w-8 h-8 text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-white mb-2">"{currentReview.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{currentReview.name}</p>
                      <p className="text-xs text-gray-400">{currentReview.treatment} • {currentReview.date}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < currentReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  {currentReview.verified && (
                    <Badge className="mt-2 bg-green-500/20 text-green-400 text-xs">✓ Verified Purchase</Badge>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Dots */}
          <div className="flex justify-center gap-1 mt-3">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-purple-400 w-4' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Popup */}
      <AnimatePresence>
        {recentAction && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: -20 }}
            className="fixed bottom-20 left-4 z-50 max-w-xs"
          >
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">{recentAction}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SocialProofWidget;
