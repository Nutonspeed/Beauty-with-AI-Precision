'use client';

/**
 * Social Proof Widget - Displays reviews and testimonials
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

export function SocialProofWidget({ className = '', autoRotate = true }: SocialProofProps) {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentAction, setRecentAction] = useState<string | null>(null);

  const REVIEWS = [
    { id: '1', name: t('socialProof.reviews.names.prae'), treatment: 'Botox', rating: 5, text: t('socialProof.reviews.review1'), date: t('socialProof.times.2daysAgo'), verified: true },
    { id: '2', name: t('socialProof.reviews.names.nid'), treatment: 'Filler', rating: 5, text: t('socialProof.reviews.review2'), date: t('socialProof.times.3daysAgo'), verified: true },
    { id: '3', name: t('socialProof.reviews.names.aim'), treatment: 'HIFU', rating: 5, text: t('socialProof.reviews.review3'), date: t('socialProof.times.1weekAgo'), verified: true },
    { id: '4', name: t('socialProof.reviews.names.por'), treatment: 'Laser', rating: 4, text: t('socialProof.reviews.review4'), date: t('socialProof.times.1weekAgo'), verified: true },
  ];

  const STATS = {
    customers: { label: t('socialProof.stats.customers'), value: '15,000+' },
    rating: { label: t('socialProof.stats.rating'), value: '4.9' },
    reviews: { label: t('socialProof.stats.reviews'), value: '2,500+' },
    repeat: { label: t('socialProof.stats.repeatRate'), value: '92%' },
  };

  // Auto rotate reviews
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRotate, REVIEWS.length]);

  // Show random recent action
  useEffect(() => {
    const actions = [
      t('socialProof.actions.booking', { name: t('socialProof.reviews.names.somsri'), treatment: 'Botox', time: t('socialProof.times.2mins') }),
      t('socialProof.actions.purchase', { name: t('socialProof.reviews.names.wipa'), package: 'HIFU', time: t('socialProof.times.5mins') }),
      t('socialProof.actions.consultation', { name: t('socialProof.reviews.names.napha'), treatment: 'Filler', time: t('socialProof.times.8mins') }),
    ];

    const showAction = () => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      setRecentAction(action);
      setTimeout(() => setRecentAction(null), 4000);
    };

    const interval = setInterval(showAction, 15000);
    showAction();

    return () => clearInterval(interval);
  }, [t]);

  const currentReview = REVIEWS[currentIndex];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recent Activity Toast-like Notification */}
      <AnimatePresence>
        {recentAction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-8 md:w-80"
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
