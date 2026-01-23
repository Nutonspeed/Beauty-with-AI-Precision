/**
 * Comparison Page Client Component
 * Handles client-side rendering of comparison features
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressTrackingChart } from '@/components/comparison/progress-tracking-chart';
import { MultiAnalysisComparison } from '@/components/comparison/multi-analysis-comparison';
import { PhotoGallery } from '@/components/comparison/photo-gallery';
import { Image as ImageIcon, TrendingUp, Columns } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface Analysis {
  id: string;
  user_id: string;
  image_url: string;
  thumbnail_url: string | null;
  created_at: string;
  session_number: number | null;
  metrics: {
    overall_score: number;
    spots?: number;
    pores?: number;
    wrinkles?: number;
    texture?: number;
    redness?: number;
    pigmentation?: number;
  };
  milestone_type?: 'baseline' | 'progress' | 'final' | 'follow_up';
  notes?: string;
}

interface ComparisonPageClientProps {
  userId: string;
  analysisIds: string[];
  locale: 'en' | 'th';
  initialAnalyses: Analysis[];
}

export function ComparisonPageClient({
  userId,
  analysisIds,
  locale,
  initialAnalyses
}: ComparisonPageClientProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('chart');

  // Transform analyses to chart data format
  const chartData = initialAnalyses.map((analysis, index) => ({
    id: analysis.id,
    date: analysis.created_at,
    sessionNumber: analysis.session_number || index + 1,
    scores: {
      spots: analysis.metrics?.spots || 0,
      pores: analysis.metrics?.pores || 0,
      wrinkles: analysis.metrics?.wrinkles || 0,
      texture: analysis.metrics?.texture || 0,
      redness: analysis.metrics?.redness || 0,
      overall: analysis.metrics?.overall_score || 0
    },
  imageUrl: analysis.image_url,
  thumbnailUrl: analysis.thumbnail_url ?? undefined
  }));

  // Transform analyses to gallery format
  const galleryPhotos = initialAnalyses.map((analysis, index) => ({
    id: analysis.id,
    imageUrl: analysis.image_url,
    thumbnailUrl: analysis.thumbnail_url,
    date: analysis.created_at,
    sessionNumber: analysis.session_number || index + 1,
    milestoneType: analysis.milestone_type,
    notes: analysis.notes,
    metrics: {
      ...(analysis.metrics ?? {}),
      overall_score: analysis.metrics?.overall_score ?? 0
    }
  }));

  return (
    <div className="space-y-12">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-12">
        <div className="flex items-center justify-center">
          <TabsList className="bg-slate-50 border border-slate-100 p-2 rounded-[2rem] h-auto gap-3 shadow-inner flex-wrap justify-center">
            <TabsTrigger value="chart" className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full">
              <TrendingUp className="mr-3 h-4 w-4" />
              {t('comparison.tabs.chart' as any) || 'Progress_Metrics'}
            </TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full">
              <Columns className="mr-3 h-4 w-4" />
              {t('comparison.tabs.comparison' as any) || 'Side_By_Side'}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-2xl px-10 py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-sm italic h-full">
              <ImageIcon className="mr-3 h-4 w-4" />
              {t('comparison.tabs.gallery' as any) || 'Visual_Archive'}
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <TabsContent value="chart" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden p-8 lg:p-12 relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardContent className="p-0">
                  <ProgressTrackingChart
                    data={chartData}
                    locale={locale}
                    onAnalysisClick={(id) => {
                      window.location.href = `/${locale}/analysis/detail/${id}`;
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden p-2 relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                <CardContent className="p-0">
                  <MultiAnalysisComparison
                    userId={userId}
                    analysisIds={analysisIds}
                    locale={locale}
                    onClose={() => {
                      window.history.back();
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="mt-0 outline-none">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden p-8 lg:p-12 relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
                <CardContent className="p-0">
                  <PhotoGallery photos={galleryPhotos} locale={locale} />
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
